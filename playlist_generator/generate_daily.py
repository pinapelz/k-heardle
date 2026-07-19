import os
import boto3
import json
import requests
import random
import argparse
from dotenv import load_dotenv
from datetime import datetime, timedelta
import yt_dlp
import time
from frame_generator import generate_daily_random_frames

load_dotenv()

ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
BUCKET = os.getenv("R2_BUCKET")
API_URL = os.getenv("API_URL")
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "10"))
HEARDLE_SALT = (
    os.getenv("VITE_HEARDLE_SALT")
    or os.getenv("OBFUSCATION_KEY")
)
NTFY_URL = os.getenv("NTFY_URL")
NTFY_TOKEN = os.getenv("NTFY_TOKEN")

def fetch_instance_info() -> dict:
    if not API_URL:
        raise ValueError("Missing API_URL in environment.")
    response = requests.get(f"{API_URL}/info")
    return response.json()

def send_notification(message: str):
    if not NTFY_URL or not NTFY_TOKEN:
        return
    requests.post(
        NTFY_URL,
        data=message.encode(encoding='utf-8'),
        headers={"Authorization": f"Bearer {NTFY_TOKEN}"},
    )

def xor_buffer(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

def get_obfuscation_key(date: str) -> bytes:
    if not HEARDLE_SALT:
        raise ValueError(
            "Missing HEARDLE salt. Set VITE_HEARDLE_SALT (preferred) or OBFUSCATION_KEY."
        )
    return (HEARDLE_SALT + date).encode("utf-8")

def delete_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False

def decode_data(hex_data: str, date: str):
    encrypted = bytes.fromhex(hex_data)
    key = get_obfuscation_key(date)
    decrypted = xor_buffer(encrypted, key)
    return json.loads(decrypted.decode("utf-8"))


def fetch_daily() -> dict:
    if not API_URL:
        raise ValueError("Missing API_URL in environment.")

    url = f"{API_URL}/today"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    payload = response.json()
    if "date" not in payload or "data" not in payload:
        raise ValueError(f"Unexpected /today response shape: {payload}")

    return payload

def fetch_daily_mv() -> dict:
    if not API_URL:
        raise ValueError("Missing API_URL in environment.")

    url = f"{API_URL}/todayMV"
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    payload = response.json()
    if "date" not in payload or "data" not in payload:
        raise ValueError(f"Unexpected /todayMV response shape: {payload}")

    return payload


def download_random_segment_mp3(youtube_id: str, output_file="today.mp3") -> str:
    url = f"https://www.youtube.com/watch?v={youtube_id}"
    with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
        info = ydl.extract_info(url, download=False)
        duration = info.get("duration", 60)
    start = 0 if duration <= 17 else random.randint(0, duration - 17)
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_file.replace(".mp3", ".%(ext)s"),
        "quiet": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],

        "download_ranges": lambda info, _: [
            {"start_time": start, "end_time": start + 17}
        ],
        "force_keyframes_at_cuts": True,
        "overwrites": True,
        "nopart": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return output_file

def upload_to_r2(file_path: str, object_key: str):
    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name="auto",
    )
    s3.upload_file(file_path, BUCKET, object_key)

def delete_from_r2(object_key: str):
    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name="auto",
    )
    s3.delete_object(Bucket=BUCKET, Key=object_key)


def write_json(file_path, data):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def read_json(file_path, default=None):
    if default is None:
        default = {}
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=4, ensure_ascii=False)
        return default
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=4, ensure_ascii=False)
        return default

def main():
    parser = argparse.ArgumentParser(description="Generate daily Heardle track and/or MV frames.")
    parser.add_argument("--only-mv", action="store_true", help="Only generate the daily MV frames.")
    args = parser.parse_args()

    info = fetch_instance_info()
    dailyMV = info.get("dailyMV", False)

    if not args.only_mv:
        new_data = False
        daily_data = fetch_daily()
        attempt = 0
        while not new_data and attempt < MAX_RETRIES:
            dumped_data = read_json("save.json")
            if dumped_data == daily_data:
                attempt += 1
                print(f"Server still returning old data, waiting... {attempt} ")
                time.sleep(5)
            else:
                new_data = True
            daily_data = fetch_daily()
        data = decode_data(daily_data["data"], daily_data["date"])
        youtube_id = data["youtubeId"]
        try:
            clip_path = download_random_segment_mp3(youtube_id)
        except:
            print(f"Failed to download clip for {youtube_id}")
            send_notification(f"K-HEARDLE: Failed to download clip for {youtube_id}")
            return
        date = daily_data["date"]
        try:
            upload_to_r2(clip_path, f"kheardle/{date}.mp3")
            delete_file(clip_path)
        except:
            print(f"Failed to upload clip for {date}")
            send_notification(f"K-HEARDLE: Failed to upload clip for {date}")
            return
        write_json("save.json", daily_data)
        send_notification(f"K-HEARDLE: Successfully generated daily track for {date} UTC")
        three_days_ago = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
        delete_from_r2(f"kheardle/{three_days_ago}.mp3")
        send_notification(f"K-HEARDLE: Deleted old clip for {three_days_ago}")

    if args.only_mv or dailyMV:
        print("Starting Daily MV Generation")
        mv_new_data = False
        mv_data = fetch_daily_mv()
        mv_attempt = 0
        while not mv_new_data and mv_attempt < MAX_RETRIES:
            mv_dumped_data = read_json("save_mv.json")
            if mv_dumped_data == mv_data:
                mv_attempt += 1
                print(f"Server still returning old MV data, waiting... {mv_attempt} ")
                time.sleep(5)
            else:
                mv_new_data = True
            mv_data = fetch_daily_mv()
        mv_decoded = decode_data(mv_data["data"], mv_data["date"])
        mv_youtube_id = mv_decoded["youtubeId"]
        mv_date = mv_data["date"]

        mv_output_dir = f"frames_mv_{mv_date}"
        try:
            generate_daily_random_frames(
                f"https://www.youtube.com/watch?v={mv_youtube_id}",
                mv_output_dir,
                count=3,
            )
        except Exception:
            print(f"Failed to generate MV frames for {mv_youtube_id}")
            send_notification(f"K-HEARDLE: Failed to generate MV frames for {mv_youtube_id}")
            return

        mv_frame_files = sorted(
            f for f in os.listdir(mv_output_dir)
            if f.startswith("frame-") and f.endswith(".jpg")
        )
        if len(mv_frame_files) < 3:
            print(f"Only generated {len(mv_frame_files)} MV frames for {mv_youtube_id}")
            send_notification(f"K-HEARDLE: Only generated {len(mv_frame_files)} MV frames for {mv_youtube_id}")
            return

        try:
            for i, fname in enumerate(mv_frame_files[:3], start=1):
                local_path = os.path.join(mv_output_dir, fname)
                object_key = f"kheardle/k-heardle-mvs/{mv_date}/{i}.jpg"
                upload_to_r2(local_path, object_key)
                print(f"Uploaded {object_key}")
        except Exception:
            print(f"Failed to upload MV frames for {mv_date}")
            send_notification(f"K-HEARDLE: Failed to upload MV frames for {mv_date}")
            return
        finally:
            for fname in mv_frame_files:
                delete_file(os.path.join(mv_output_dir, fname))
            os.rmdir(mv_output_dir)
        write_json("save_mv.json", mv_data)
        send_notification(f"K-HEARDLE: Successfully generated MV frames for {mv_date} UTC")

if __name__ == "__main__":
    main()

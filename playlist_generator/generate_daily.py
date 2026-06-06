import os
import boto3
import json
import requests
import random
from dotenv import load_dotenv
from datetime import datetime, timezone
import yt_dlp
import time

load_dotenv()

ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
BUCKET = os.getenv("R2_BUCKET")
API_URL = os.getenv("API_URL")
HEARDLE_SALT = (
    os.getenv("VITE_HEARDLE_SALT")
    or os.getenv("OBFUSCATION_KEY")
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
    new_data = False
    daily_data = fetch_daily()
    attempt = 0
    while not new_data:
        dumped_data = read_json("save.json")
        if dumped_data == daily_data:
            attempt += 1
            print(f"Server still returning old data, waiting... {attempt} ")
            time.sleep(5)
        else:
            new_data = True
        daily_data = fetch_daily()
    data = decode_data(daily_data["data"], daily_data["date"])
    print(data)
    youtube_id = data["youtubeId"]
    clip_path = download_random_segment_mp3(youtube_id)
    date = daily_data["date"]
    upload_to_r2(clip_path, f"kheardle/{date}.mp3")
    delete_file(clip_path)
    write_json("save.json", daily_data)

if __name__ == "__main__":
    main()

import os
import boto3
import json
import requests
import random
from dotenv import load_dotenv
from datetime import datetime, timezone
import yt_dlp

load_dotenv()

ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
SECRET_KEY = os.getenv("R2_SECRET_KEY")
BUCKET = os.getenv("R2_BUCKET")
API_URL = os.getenv("API_URL")
OBFUSCATION_KEY = os.getenv("OBFUSCATION_KEY")


def xor_buffer(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))

def get_obfuscation_key() -> bytes:
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return (OBFUSCATION_KEY + date).encode("utf-8")


def decode_data(hex_data: str):
    encrypted = bytes.fromhex(hex_data)
    key = get_obfuscation_key()
    decrypted = xor_buffer(encrypted, key)
    return json.loads(decrypted.decode("utf-8"))


def fetch_daily() -> dict:
    url = f"{API_URL}/today"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


def download_random_segment_mp3(youtube_id: str, output_file="today.mp3") -> str:
    url = f"https://www.youtube.com/watch?v={youtube_id}"
    with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
        info = ydl.extract_info(url, download=False)
        duration = info.get("duration", 60)
    start = 0 if duration <= 17 else random.randint(0, duration - 17)
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "today.%(ext)s",
        "quiet": True,
        "download_ranges": lambda info, _: [
            {"start_time": start, "end_time": start + 17}
        ],
        "force_keyframes_at_cuts": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
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


def main():
    daily_data = fetch_daily()
    data = decode_data(daily_data["data"])
    print(data)
    youtube_id = data["youtubeId"]
    clip_path = download_random_segment_mp3(youtube_id)
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    upload_to_r2(clip_path, f"kheardle/{date}.mp3")

if __name__ == "__main__":
    main()

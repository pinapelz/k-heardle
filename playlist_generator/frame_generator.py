import random
import subprocess
import yt_dlp
import cv2
import os


def get_video_info(url):
    ydl_opts = {"quiet": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)


def pick_best_video_url(info):
    formats = [
        f for f in info["formats"]
        if f.get("url") and f.get("vcodec") != "none"
    ]
    formats.sort(
        key=lambda f: (f.get("height") or 0, f.get("tbr") or 0),
        reverse=True
    )
    return formats[0]["url"]


def is_low_energy(img_path, size=64, threshold=500):
    img = cv2.imread(img_path)
    if img is None:
        raise RuntimeError("Could not read image")
    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return gray.var() < threshold


def download_random_frame(url, name_prefix="frame", selected_timestamps=None, max_tries=10):
    if selected_timestamps is None:
        selected_timestamps = []

    info = get_video_info(url)
    duration = info.get("duration")
    if not duration:
        raise RuntimeError("No duration found")

    video_url = pick_best_video_url(info)

    for _ in range(max_tries):
        t = random.uniform(0, duration)
        while any(abs(t - ts) < 1 for ts in selected_timestamps):
            t = random.uniform(0, duration)
        filename = f"{name_prefix}-{t:.2f}.jpg"

        cmd = [
            "ffmpeg",
            "-ss", str(t),
            "-i", video_url,
            "-frames:v", "1",
            "-q:v", "2",
            "-y",
            filename,
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if not os.path.exists(filename):
            continue
        try:
            if is_low_energy(filename):
                os.remove(filename)
                continue
        except Exception:
            pass
        return t

    raise RuntimeError("Failed to generate a valid frame after retries")


def generate_daily_random_frames(url, output_dir, count=3):
    selected_timestamps = []
    os.makedirs(output_dir, exist_ok=True)
    for i in range(count):
        ts = download_random_frame(
            url,
            f"{output_dir}/frame",
            selected_timestamps
        )
        selected_timestamps.append(ts)
        print(f"Downloaded frame {i} at {ts:.2f}s")

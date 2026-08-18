import random
import subprocess
import yt_dlp
import cv2
import os


def get_video_info(url):
    ydl_opts = {"quiet": True, "remote_components": ["ejs:github"], "source_address": "0.0.0.0", "cookiefile": "cookies.txt"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)


def pick_best_video_url(info):
    formats = [
        f for f in info.get("formats", [])
        if f.get("url") and f.get("vcodec") != "none"
    ]
    if not formats:
        raise RuntimeError("No suitable video formats found")
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

    for attempt in range(1, max_tries + 1):
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
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            print(f"ffmpeg failed at {t:.2f}s (attempt {attempt}/{max_tries}): {result.stderr.strip()}")
            continue
        if not os.path.exists(filename):
            print(f"Frame file {filename} not found after ffmpeg execution (attempt {attempt}/{max_tries})")
            continue
        try:
            if is_low_energy(filename):
                os.remove(filename)
                print(f"Frame at {t:.2f}s discarded due to low energy/variance (attempt {attempt}/{max_tries})")
                continue
        except Exception as e:
            print(f"Error checking energy for frame {filename}: {e}")
            pass
        return t

    err_msg = f"Failed to generate a valid frame for {url} after {max_tries} retries"
    print(err_msg)
    raise RuntimeError(err_msg)


def generate_daily_random_frames(url, output_dir, count=3):
    selected_timestamps = []
    os.makedirs(output_dir, exist_ok=True)
    for i in range(count):
        try:
            ts = download_random_frame(
                url,
                f"{output_dir}/frame",
                selected_timestamps
            )
            selected_timestamps.append(ts)
            print(f"Downloaded frame {i} at {ts:.2f}s")
        except Exception as e:
            print(f"Error generating frame {i} from {url}: {e}")
            raise

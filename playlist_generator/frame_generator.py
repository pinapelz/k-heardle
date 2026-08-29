import random
import yt_dlp
import cv2
import os
import glob


def get_video_info(url, cookies_path):
    ydl_opts = {"quiet": True, "remote_components": ["ejs:github"], "source_address": "0.0.0.0", "cookiefile": cookies_path}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)


def download_full_video(url, output_path_template, cookies_path="cookies.txt"):
    ydl_opts = {
        "format": "bestvideo[vcodec^=avc][height<=1080]/bestvideo[vcodec^=h264][height<=1080]/best[vcodec^=avc][height<=1080]/best[vcodec^=h264][height<=1080]/bestvideo[vcodec^=avc]/bestvideo[vcodec^=h264]/best[vcodec^=avc]/best[vcodec^=h264]",
        "outtmpl": output_path_template,
        "quiet": True,
        "force_ipv4": True,
        "overwrites": True,
        "nopart": True,
        "remote_components": ["ejs:github"],
        "source_address": "0.0.0.0",
        "cookiefile": cookies_path,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=True)


def is_low_energy(img_path, size=64, threshold=500):
    img = cv2.imread(img_path)
    if img is None:
        raise RuntimeError("Could not read image")
    img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return gray.var() < threshold


def generate_daily_random_frames(url, output_dir, count=3, max_tries=20, cookies_path="cookies.txt"):
    selected_timestamps = []
    os.makedirs(output_dir, exist_ok=True)
    temp_pattern = os.path.join(output_dir, "temp_source.*")
    temp_template = os.path.join(output_dir, "temp_source.%(ext)s")

    print(f"Downloading video from {url}...")
    try:
        info = download_full_video(url, temp_template, cookies_path=cookies_path)
    except Exception as e:
        print(f"Failed to download video: {e}")
        for f in glob.glob(temp_pattern):
            try:
                os.remove(f)
            except OSError:
                pass
        raise

    matching_files = glob.glob(temp_pattern)
    if not matching_files:
        raise RuntimeError(f"Downloaded video file not found matching {temp_pattern}")

    video_path = matching_files[0]
    cap = cv2.VideoCapture(video_path)

    try:
        if not cap.isOpened():
            raise RuntimeError(f"Could not open downloaded video {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if fps and fps > 0 and total_frames > 0:
            duration = float(total_frames / fps)
        else:
            duration = float(info.get("duration") or 0)

        if duration <= 0:
            raise RuntimeError("Invalid video duration (0s)")

        min_t = min(1.0, duration * 0.05)
        max_t = max(min_t, duration - min(1.0, duration * 0.05))

        for i in range(count):
            frame_saved = False
            for attempt in range(1, max_tries + 1):
                t = random.uniform(min_t, max_t)
                if any(abs(t - ts) < 2.0 for ts in selected_timestamps):
                    continue

                cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000.0)
                success, frame = cap.read()
                if not success or frame is None:
                    continue

                if is_low_energy(frame):
                    print(f"Frame at {t:.2f}s discarded due to low energy/variance (attempt {attempt}/{max_tries})")
                    continue

                filename = os.path.join(output_dir, f"frame-{t:.2f}.jpg")
                cv2.imwrite(filename, frame)
                selected_timestamps.append(t)
                print(f"Generated frame {i + 1}/{count} at {t:.2f}s")
                frame_saved = True
                break

            if not frame_saved:
                raise RuntimeError(f"Failed to generate valid frame {i + 1}/{count} after {max_tries} retries")

    finally:
        cap.release()
        for f in glob.glob(temp_pattern):
            try:
                os.remove(f)
            except OSError:
                pass

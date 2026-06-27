#!/usr/bin/python3
import argparse
import yt_dlp
import json5
import re

class PlaylistGenerator:

    def __init__(self, song_db: list[dict]):
        self.song_db = song_db
        self.known_ids = set()

    def get_urls_from_file(self, path: str) -> list[str]:
        with open(path) as f:
            lines = f.readlines()
            return [line.strip() for line in lines if len(line.strip()) > 0 and not line.startswith("#")]

    def extract(self, urls: list) -> list[dict[str]]:
        info = {}
        ydl_opts = {
        }
        errors = []
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            for url in urls:
                try:
                    url_info = ydl.sanitize_info(ydl.extract_info(url, download=False))
                    if url_info["_type"] == "video":
                        info[url_info["id"]] = url_info
                    if url_info["_type"] == "playlist":
                        for entry in url_info["entries"]:
                            info[entry["id"]] = entry
                except yt_dlp.utils.DownloadError:
                    errors.append(url)
        print(f"{errors=}")
        return list(info.values())

    def build_playlist_string(self, video_info: list[dict[str]]) -> str:
        output = "export const songs = [\n"
        for info in video_info:
            video_id = info["id"]
            if video_id in self.known_ids:
                continue
            self.known_ids.add(video_id)
            artist = self.escape_quotes(self.get_artist(info))
            title = self.escape_quotes(self.get_title(info))
            output += f'{{ artist: "{artist}", name: "{title}", youtubeId: "{info["id"]}" }},\n'
        for song in self.song_db:
            if song["youtubeId"] in self.known_ids:
                continue
            output += f'{{ artist: "{song["artist"]}", name: "{song["name"]}", youtubeId: "{song["youtubeId"]}" }},\n'
            self.known_ids.add(song["youtubeId"])
        output += "]"
        return output

    def get_artist(self, info):
        if info.get("artist"):
            return info["artist"]
        elif " - " in info["title"]:
            return info["title"].split(" - ")[0]
        else:
            return info["uploader"]

    def get_title(self, info):
        title = info["title"]
        suffixes = ["(Official Music Video)", "(Official Video)", "(Official Lyric Video)", "(Official Audio)", "(Audio)"]
        for suffix in suffixes:
            title = title.removesuffix(suffix).strip()
        if info.get("track"):
            return info["track"]
        elif " - " in title:
            return title.split(" - ")[1]
        else:
            return title

    def escape_quotes(self, field: str) -> str:
        return field.replace('"', r'\"')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("urls_file")
    parser.add_argument("output_file", default="../server/data/songs.ts")
    args = parser.parse_args()
    songs = []
    try:
        with open(args.output_file, "r", encoding="utf-8") as f:
            text = f.read()

        if text.strip():
            array_text = re.search(r"\[.*\]", text, re.S).group(0)
            songs = json5.loads(array_text)
    except (AttributeError, json5.JSON5DecodeError):
        songs = []
    generator = PlaylistGenerator(songs)
    urls = generator.get_urls_from_file(args.urls_file)
    video_info = generator.extract(urls)
    js_playlist = generator.build_playlist_string(video_info)
    with open(args.output_file, 'w') as f:
        f.write(js_playlist)


if __name__ == "__main__":
    main()

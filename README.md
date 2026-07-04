# k-heardle
k-heardle is a Wordle-like game where you guess a song based on a given clip.

# Daily Mode (Heardle)
- Available once a day and resets every day at midnight UTC time. 
- A random segment of audio from a song is generated

The state of the daily game is kept locally and a signature is generated to prevent this from being blatantly modified. All guesses are verified server-side

> This is for fun and therfore inherently insecure, it is trivial to forge the signature and change the state of a running game 

# Unlimited Mode (Heardle)
- Unlimited play
- Uses a minimized YouTube miniplayer for audio
- A random segment of audio from YouTube video
- Guesses are verified locally

> Its recommended to play in fullscreen to prevent any media modules from leaking the solutions. Extra audio sometimes plays due to the nature of YouTube's IFrame API.

# Daily MV
- Guess the music video from 3 randomly selected frames
- Uses a seperate file specifically for tracking MVs (`mvs.ts`)
- Needs to be explictly enabled (set `ENABLE_DAILY_MUSIC_VIDEO` environment variable to `true`)
  - This is relayed in the `/info` endpoint, daily generation script checks this to see if it should generate content for this game mode

# Local Development
```bash
pnpm i
pnpm dev
```

This repo is a fork of [EpicWolverine/PersonalHeardle](https://github.com/EpicWolverine/PersonalHeardle), however much of the code has been modified to a client-server relationship and the CRA has been deprecated in favor of Vite.

The CSS theme of the site is based on dacctal's [caelus](https://git.symlinx.net/daccfiles/)

# Deployment
The `playlist_generator` directory contains scripts relevant to generating `songs.ts` which contains all songs used in K-Heardle.

First enter the directory and install the dependencies
```bash
uv sync
uv init
```

## `playlist_generator.py`
Generates/updates a songs.ts file given a file of YouTube links
```bash
uv run playlist_generator.py <INPUT_FILE> <OUTPUT_FILE> 
```
- INPUT_FILE is a text file of YouTube URLs to songs
- OUTPUT_FILE the `songs.ts` file to output to, defaults to `../server/data/songs.ts`

## `generate_daily.py`
Generates a daily song snippet, and MV frames for daily game mode. Intended to be run once a day

> Requires a environment variables to be configured see `playlist_generator/.env.template`

 ```bash
 uv run generate_daily.py
 ```
By default this script assumes Cloudflare R2, however any S3 bucket credentials will work fine

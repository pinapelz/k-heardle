# k-heardle
k-heardle is a Wordle-like game where you guess a song based on a given clip.

# Daily Mode
- Available once a day and resets every day at midnight UTC time. 
- A random segment of audio from a song is generated

The state of the daily game is kept locally and a signature is generated to prevent this from being blatantly modified. All guesses are verified server-side

> This is for fun and therfore inherently insecure, it is trivial to forge the signature and change the state of a running game 

# Unlimited Mode
- Unlimited play
- Uses a minimized YouTube miniplayer for audio
- A random segment of audio from YouTube video
- Guesses are verified locally

> Its recommended to play in fullscreen to prevent any media modules from leaking the solutions. Extra audio sometimes plays due to the nature of YouTube's IFrame API.


# Local Development
```bash
pnpm i
pnpm dev
```

This repo is a fork of [EpicWolverine/PersonalHeardle](https://github.com/EpicWolverine/PersonalHeardle), however much of the code has been modified to a client-server relationship and the CRA has been deprecated in favor of Vite.

The CSS theme of the site is based on dacctal's [caelus](https://git.symlinx.net/daccfiles/)

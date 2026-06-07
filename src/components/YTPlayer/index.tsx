import React from "react";
import YouTube from "react-youtube";
import { IoPlay, IoPause } from "react-icons/io5";
import { playTimes } from "../../constants";
import * as Styled from "./index.styled";

interface Props {
  id: string;
  currentTry: number;
}

const DEFAULT_VOLUME = 0.7;

const loadVolume = () => {
  try {
    const storedVolume = localStorage.getItem("playerVolume");
    if (storedVolume === null) return DEFAULT_VOLUME;

    const parsedVolume = Number(storedVolume);
    if (!Number.isFinite(parsedVolume)) return DEFAULT_VOLUME;

    return Math.max(0, Math.min(1, parsedVolume));
  } catch {
    return DEFAULT_VOLUME;
  }
};

export function Player({ id, currentTry }: Props) {
  const opts = {
    width: "0",
    height: "0",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = React.useRef<any>(null);

  const MIN_REMAINING_SEC = 17;
  const currentPlayTime = playTimes[currentTry];
  const totalPlayTime = playTimes[playTimes.length - 1];
  const progressDurationSec = totalPlayTime / 1000;

  const [play, setPlay] = React.useState(false);
  const [startTime, setStartTime] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);
  const [volume, setVolume] = React.useState(loadVolume);

  const progressValue = Math.min(
    progressDurationSec,
    Math.max(0, currentTime - startTime),
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      playerRef.current?.internalPlayer
        ?.getCurrentTime()
        .then((time: number) => setCurrentTime(time));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!play) return;

    const elapsedMs = Math.max(0, (currentTime - startTime) * 1000);

    if (elapsedMs >= currentPlayTime) {
      playerRef.current?.internalPlayer.pauseVideo();
      playerRef.current?.internalPlayer.seekTo(startTime, true);
      setPlay(false);
    }
  }, [play, currentTime, startTime, currentPlayTime]);

  const startPlayback = React.useCallback(() => {
    const player = playerRef.current?.internalPlayer;
    if (!player) return;

    player.seekTo(startTime, true);
    player.playVideo();
    setPlay(true);
  }, [startTime]);

  const updateVolume = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(event.target.value));
    },
    [],
  );

  const setReady = React.useCallback(async () => {

    const player = playerRef.current?.internalPlayer;
    if (!player) return;

    const duration = await player.getDuration();

    const maxStart = Math.max(0, duration - MIN_REMAINING_SEC);
    const randomStart = Math.random() * maxStart;

    setStartTime(randomStart);
    player.setVolume(volume * 100);
    player.seekTo(randomStart, true);
    setIsReady(true);
  }, [volume]);

  React.useEffect(() => {
    if (!isReady) return;

    const player = playerRef.current?.internalPlayer;
    if (!player) return;

    player.getDuration().then((duration: number) => {
      const maxStart = Math.max(0, duration - MIN_REMAINING_SEC);
      const randomStart = Math.random() * maxStart;

      setStartTime(randomStart);
      setPlay(false);
      setCurrentTime(0);

      player.seekTo(randomStart, true);
    });
  }, [id, isReady]);

  React.useEffect(() => {
    if (!isReady) return;

    playerRef.current?.internalPlayer?.setVolume(volume * 100);

    try {
      localStorage.setItem("playerVolume", String(volume));
    } catch {
    }
  }, [isReady, volume]);

  return (
    <>
      <YouTube opts={opts} videoId={id} onReady={setReady} ref={playerRef} />

      {isReady ? (
        <>
          <Styled.ProgressBackground>
            <Styled.Progress value={progressValue} />

            {playTimes.map((playTime) => (
              <Styled.Separator
                key={playTime}
                style={{ left: `${(playTime / totalPlayTime) * 100}%` }}
              />
            ))}
          </Styled.ProgressBackground>

          <Styled.TimeStamps>
            <Styled.TimeStamp>1s</Styled.TimeStamp>
            <Styled.TimeStamp>16s</Styled.TimeStamp>
          </Styled.TimeStamps>

          {!play ? (
            <IoPlay
              style={{ cursor: "pointer" }}
              size={36}
              color="var(--cl-green-6)"
              onClick={startPlayback}
            />
          ) : (
            <IoPause
              style={{ cursor: "pointer" }}
              size={36}
              color="var(--cl-green-6)"
              onClick={startPlayback}
            />
          )}

          <Styled.VolumeControl>
            <Styled.VolumeLabel htmlFor="youtube-player-volume">
              Volume {Math.round(volume * 100)}%
            </Styled.VolumeLabel>
            <Styled.VolumeSlider
              id="youtube-player-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={updateVolume}
              aria-label="Volume"
            />
          </Styled.VolumeControl>
        </>
      ) : (
        <p>Loading player...</p>
      )}
    </>
  );
}

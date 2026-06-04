import React from "react";
import { IoPlay, IoPause } from "react-icons/io5";

import { playTimes } from "../../constants";
import * as Styled from "../YTPlayer/index.styled";

interface Props {
  currentTry: number;
}

const MAX_TIME = 16;

export function Player({ currentTry }: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentPlayTime = playTimes[currentTry];

  const [play, setPlay] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isReady, setIsReady] = React.useState(false);

  const CDN_URL =
    import.meta.env.VITE_CDN_URL || "localhost";

  const dateString = new Date().toISOString().split("T")[0];

  const startPlayback = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.play();
    setPlay(true);
  }, []);

  const stopPlayback = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setPlay(false);
  }, []);

  React.useEffect(() => {
    const audio = new Audio(`${CDN_URL}/${dateString}.mp3`);
    audioRef.current = audio;

    audio.addEventListener("loadeddata", () => {
      setIsReady(true);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setPlay(false);
      audio.currentTime = 0;
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [dateString]);

  React.useEffect(() => {
    if (!play || !audioRef.current) return;

    const interval = setInterval(() => {
      const a = audioRef.current!;
      const t = a.currentTime * 1000;

      setCurrentTime(a.currentTime);

      if (t >= currentPlayTime || t >= MAX_TIME * 1000) {
        a.pause();
        a.currentTime = 0;
        setPlay(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [play, currentPlayTime]);

  React.useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => undefined);
    navigator.mediaSession.setActionHandler("pause", () => undefined);
    navigator.mediaSession.setActionHandler("previoustrack", () => undefined);
    navigator.mediaSession.setActionHandler("nexttrack", () => undefined);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, []);

  return (
    <>
      {isReady ? (
        <>
          <Styled.ProgressBackground>
            {currentTime !== 0 && (
              <Styled.Progress value={currentTime} />
            )}

            {playTimes.map((t) => (
              <Styled.Separator
                key={t}
                style={{ left: `${(t / 16000) * 100}%` }}
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
              onClick={startPlayback}
            />
          ) : (
            <IoPause
              style={{ cursor: "pointer" }}
              size={36}
              onClick={stopPlayback}
            />
          )}
        </>
      ) : (
        <p>Loading audio...</p>
      )}
    </>
  );
}

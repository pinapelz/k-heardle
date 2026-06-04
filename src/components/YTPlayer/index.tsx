import React from "react";
import YouTube from "react-youtube";
import { IoPlay, IoPause } from "react-icons/io5";
import { playTimes } from "../../constants";
import * as Styled from "./index.styled";

interface Props {
  id: string;
  currentTry: number;
}

export function Player({ id, currentTry }: Props) {
  const opts = {
    width: "0",
    height: "0",
  };

  // react-youtube doesn't export types for this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = React.useRef<any>(null);

  const currentPlayTime = playTimes[currentTry];

  const [play, setPlay] = React.useState<boolean>(false);

  const [currentTime, setCurrentTime] = React.useState<number>(0);

  const [isReady, setIsReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    setInterval(() => {
      playerRef.current?.internalPlayer
        .getCurrentTime()
        .then((time: number) => {
          setCurrentTime(time);
        });
    }, 250);
  }, []);

  React.useEffect(() => {
    if (play) {
      if (currentTime * 1000 >= currentPlayTime) {
        playerRef.current?.internalPlayer.pauseVideo();
        playerRef.current?.internalPlayer.seekTo(0);
        setPlay(false);
      }
    }
  }, [play, currentTime]);

  // don't call play video each time currentTime changes
  const startPlayback = React.useCallback(() => {
    playerRef.current?.internalPlayer.playVideo();
    setPlay(true);
  }, []);

  const setReady = React.useCallback(() => {
    setIsReady(true);
  }, []);

  return (
    <>
      <YouTube opts={opts} videoId={id} onReady={setReady} ref={playerRef} />
      {isReady ? (
        <>
          <Styled.ProgressBackground>
            {currentTime !== 0 && <Styled.Progress value={currentTime} />}
            {playTimes.map((playTime) => (
              <Styled.Separator
                style={{ left: `${(playTime / 16000) * 100}%` }}
                key={playTime}
              />
            ))}
          </Styled.ProgressBackground>
          <Styled.TimeStamps>
            <Styled.TimeStamp>1s</Styled.TimeStamp>
            <Styled.TimeStamp>16s</Styled.TimeStamp>
          </Styled.TimeStamps>
          {!play && (
            <IoPlay
              style={{ cursor: "pointer" }}
              size={36}
              color="var(--cl-green-6)"
              onClick={startPlayback}
            />
          )}
          {play && (
            <IoPause
              style={{ cursor: "pointer" }}
              size={36}
              color="var(--cl-green-6)"
              onClick={startPlayback}
            />
          )}
        </>
      ) : (
        <p>Loading player...</p>
      )}
    </>
  );
}

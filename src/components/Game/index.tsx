import React from "react";

import { GuessType } from "../../types/guess";
import { Song } from "../../types/song";
import { playTimes } from "../../constants";

import { Button, Guess, YTPlayer, Search, Result, Player } from "../";

import * as Styled from "./index.styled";

interface Props {
  guesses: GuessType[];
  todaysSolution: Song;
  currentTry: number;
  didGuess: boolean;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | undefined>>;
  skip: () => void;
  guess: () => void;
  mode?: "daily" | "unlimited";
  onPlayAgain?: () => void;
}

function getUtcDate() {
  return new Date().toISOString().split("T")[0];
}

function checkDailyIsGenerated(): boolean {
  const CDN_URL = import.meta.env.VITE_CDN_URL;
  if (!CDN_URL) return false;

  const date = getUtcDate();
  return !!localStorage.getItem(`${CDN_URL}/${date}.mp3`);
}

export function Game({
  guesses,
  todaysSolution,
  currentTry,
  didGuess,
  setSelectedSong,
  skip,
  guess,
  mode = "daily",
  onPlayAgain,
}: Props) {
  const [sessionDate] = React.useState(() => getUtcDate());
  const isGameOver = didGuess || currentTry === 6;
  const recentFinishedPlay = localStorage.getItem("recentFinishedPlay");
  const isBlocked =
    mode === "daily" &&
    !!recentFinishedPlay &&
    new Date(sessionDate) > new Date(recentFinishedPlay) &&
    !checkDailyIsGenerated();

  React.useEffect(() => {
    if (!isGameOver) return;

    localStorage.setItem("recentFinishedPlay", sessionDate);
  }, [isGameOver, sessionDate]);

  if (isBlocked) {
    return <h1>Daily MIXX is not available yet. Check back soon!</h1>;
  }

  if (isGameOver) {
    return (
      <Result
        didGuess={didGuess}
        currentTry={currentTry}
        todaysSolution={todaysSolution}
        guesses={guesses}
        mode={mode}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return (
    <>
      {guesses.map((guess: GuessType, index) => (
        <Guess key={index} guess={guess} active={index === currentTry} />
      ))}
      {mode === "unlimited" ? (
        <YTPlayer id={todaysSolution.youtubeId} currentTry={currentTry} />
      ) : (
        <Player currentTry={currentTry} />
      )}

      <Search currentTry={currentTry} setSelectedSong={setSelectedSong} />
      <Styled.Buttons>
        <Button onClick={skip}>
          {currentTry === 5
            ? "Give Up"
            : `Skip +${playTimes[currentTry] / 1000}s`}
        </Button>
        <Button variant="green" onClick={guess}>
          Submit
        </Button>
      </Styled.Buttons>
    </>
  );
}

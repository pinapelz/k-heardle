import React from "react";

import { GuessType } from "../../types/guess";
import { Song } from "../../types/song";
import { playTimes } from "../../constants";

import { Button, Guess, YTPlayer, Search, Result, Player } from "../";

import * as Styled from "./index.styled";

interface Props {
  guesses: GuessType[];
  todaysSolution: Song;
  dailyDate?: string;
  currentTry: number;
  didGuess: boolean;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | undefined>>;
  skip: () => void;
  guess: () => void;
  mode?: "daily" | "unlimited";
  onPlayAgain?: () => void;
  isSubmitting?: boolean;
}

function getUtcDate() {
  return new Date().toISOString().split("T")[0];
}

export function Game({
  guesses,
  todaysSolution,
  dailyDate,
  currentTry,
  didGuess,
  setSelectedSong,
  skip,
  guess,
  mode = "daily",
  onPlayAgain,
  isSubmitting = false,
}: Props) {
  const recentFinishedPlay = localStorage.getItem("recentFinishedPlay");
  const hasFinishedCurrentRound = didGuess || currentTry >= guesses.length;
  const hasFinishedResponseDaily =
    mode === "daily" && !!dailyDate && recentFinishedPlay === dailyDate;
  const isGameOver = hasFinishedCurrentRound || hasFinishedResponseDaily;
  const isBlocked =
    mode === "daily" &&
    !!dailyDate &&
    !hasFinishedResponseDaily &&
    new Date(getUtcDate()) > new Date(dailyDate);
  const sessionDate = dailyDate ?? getUtcDate();

  React.useEffect(() => {
    if (mode !== "daily") return;
    if (!hasFinishedCurrentRound) return;
    localStorage.setItem("recentFinishedPlay", sessionDate);

    const historicalPlayData = localStorage.getItem("historicalPlayData");
    if (historicalPlayData === null) {
      localStorage.setItem(
        "historicalPlayData",
        JSON.stringify({
          sessionDates: [sessionDate],
          guesses: [currentTry],
          didGuess: [didGuess],
        })
      );
    } else {
      const parsedData = JSON.parse(historicalPlayData);
      if (parsedData.sessionDates.includes(sessionDate)) return;
      localStorage.setItem(
        "historicalPlayData",
        JSON.stringify({
          sessionDates: [...parsedData.sessionDates, sessionDate],
          guesses: [...parsedData.guesses, currentTry],
          didGuess: [...parsedData.didGuess, didGuess],
        })
      );
    }
  }, [mode, hasFinishedCurrentRound, sessionDate, currentTry, didGuess]);

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
        sessionDate={sessionDate}
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
          {isSubmitting
            ? "Skipping..."
            : currentTry === 5
            ? "Give Up"
            : `Skip +${playTimes[currentTry] / 1000}s`}
        </Button>
        <Button variant="green" onClick={guess}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Styled.Buttons>
    </>
  );
}

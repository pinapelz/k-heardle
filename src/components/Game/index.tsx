import React from "react";

import { GuessType } from "../../types/guess";
import { Song } from "../../types/song";
import { playTimes } from "../../constants";
import { musicVideos } from "../../../server/data/mvs";

import { Button, Guess, YTPlayer, Search, Result, Player, MVPlayer } from "../";

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
  mode?: "daily" | "unlimited" | "dailyMV";
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
  const recentFinishedPlay =
    mode === "dailyMV"
      ? localStorage.getItem("recentFinishedPlayMV")
      : localStorage.getItem("recentFinishedPlay");
  const hasFinishedCurrentRound = didGuess || currentTry >= guesses.length;
  const hasFinishedResponseDaily =
    (mode === "daily" || mode === "dailyMV") &&
    !!dailyDate &&
    recentFinishedPlay === dailyDate;
  const isBlocked =
    (mode === "daily" || mode === "dailyMV") &&
    !!dailyDate &&
    !hasFinishedResponseDaily &&
    new Date(getUtcDate()) > new Date(dailyDate);
  const sessionDate = dailyDate ?? getUtcDate();

  React.useEffect(() => {
    if (mode !== "daily" && mode !== "dailyMV") return;
    if (!hasFinishedCurrentRound) return;

    const storageKey =
      mode === "dailyMV" ? "recentFinishedPlayMV" : "recentFinishedPlay";
    localStorage.setItem(storageKey, sessionDate);

    const historicalKey =
      mode === "dailyMV" ? "historicalPlayDataMV" : "historicalPlayData";
    const historicalPlayData = localStorage.getItem(historicalKey);
    if (historicalPlayData === null) {
      localStorage.setItem(
        historicalKey,
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
        historicalKey,
        JSON.stringify({
          sessionDates: [...parsedData.sessionDates, sessionDate],
          guesses: [...parsedData.guesses, currentTry],
          didGuess: [...parsedData.didGuess, didGuess],
        })
      );
    }
  }, [mode, hasFinishedCurrentRound, sessionDate, currentTry, didGuess]);

  if (isBlocked) {
    return (
      <h1>
        {mode === "dailyMV"
          ? "Daily MV is not available yet. Check back soon!"
          : "Daily MIXX is not available yet. Check back soon!"}
      </h1>
    );
  }

  if (hasFinishedCurrentRound || hasFinishedResponseDaily) {
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
      ) : mode === "dailyMV" ? (
        <MVPlayer currentTry={currentTry} date={sessionDate} />
      ) : (
        <Player currentTry={currentTry} />
      )}

      <Search
        currentTry={currentTry}
        setSelectedSong={setSelectedSong}
        songs={mode === "dailyMV" ? musicVideos : undefined}
      />
      <Styled.Buttons>
        <Button onClick={skip}>
          {isSubmitting
            ? "Skipping..."
            : currentTry === 5
            ? "Give Up"
            : mode === "dailyMV"
            ? "Skip +1 frame"
            : `Skip +${playTimes[currentTry] / 1000}s`}
        </Button>
        <Button variant="green" onClick={guess}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Styled.Buttons>
    </>
  );
}

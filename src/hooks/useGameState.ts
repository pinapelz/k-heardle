import React from "react";
import _ from "lodash";

import { Song } from "../types/song";
import { GuessState, GuessType } from "../types/guess";

interface UseGameStateOptions {
  solution: Song | null;
  persist: boolean;
}

const initialGuess: GuessType = {
  song: undefined,
  state: undefined,
};

export function useGameState({ solution, persist }: UseGameStateOptions) {
  const [guesses, setGuesses] = React.useState<GuessType[]>(
    Array.from({ length: 6 }).fill(initialGuess) as GuessType[]
  );
  const [currentTry, setCurrentTry] = React.useState<number>(0);
  const [selectedSong, setSelectedSong] = React.useState<Song>();
  const [didGuess, setDidGuess] = React.useState<boolean>(false);

  // --- localStorage persistence (daily mode) ---
  let stats = JSON.parse(localStorage.getItem("stats") || "{}");
  let statsVersion = JSON.parse(localStorage.getItem("version") || "1");

  React.useEffect(() => {
    if (!persist || !solution) return;

    if (Array.isArray(stats)) {
      const visitedToday = _.isEqual(
        solution,
        stats[stats.length - 1].solution
      );

      if (!visitedToday) {
        stats.push({
          solution: solution,
          currentTry: 0,
          didGuess: 0,
        });
      } else {
        const { currentTry, guesses, didGuess } = stats[stats.length - 1];
        setCurrentTry(currentTry);
        setGuesses(guesses);
        setDidGuess(didGuess);
      }
    } else {
      stats = [];
      stats.push({
        solution: solution,
      });
    }

    const currentVersion = 2;
    const firstRun = localStorage.getItem("firstRun") === null;
    if (firstRun) {
      statsVersion = currentVersion;
    } else if (statsVersion < currentVersion) {
      statsVersion = currentVersion;
      if (Array.isArray(stats)) {
        for (let index = 0; index < stats.length; index++) {
          const newGuesses: GuessType[] = [];
          for (
            let guessIndex = 0;
            guessIndex < stats[index].guesses.length;
            guessIndex++
          ) {
            const guess = stats[index].guesses[guessIndex];
            if (guess.skipped !== undefined) {
              let state = undefined;
              if (guess.skipped) {
                state = GuessState.Skipped;
              } else if (guess.isCorrect) {
                state = GuessState.Correct;
              } else if (guess.isCorrect === false) {
                state = GuessState.Incorrect;
              }
              newGuesses.push({
                song: guess.song,
                state: state,
              } as GuessType);
            }
          }
          stats[index].guesses = newGuesses;
        }
      }
    }
  }, [solution]);

  React.useEffect(() => {
    if (!persist) return;
    if (Array.isArray(stats)) {
      stats[stats.length - 1].currentTry = currentTry;
      stats[stats.length - 1].didGuess = didGuess;
      stats[stats.length - 1].guesses = guesses;
    }
  }, [guesses, currentTry, didGuess]);

  React.useEffect(() => {
    if (!persist) return;
    localStorage.setItem("stats", JSON.stringify(stats));
  }, [stats]);

  React.useEffect(() => {
    if (!persist) return;
    localStorage.setItem("version", JSON.stringify(statsVersion));
  }, [statsVersion]);

  const skip = React.useCallback(() => {
    setGuesses((guesses: GuessType[]) => {
      const newGuesses = [...guesses];
      newGuesses[currentTry] = {
        song: undefined,
        state: GuessState.Skipped,
      };
      return newGuesses;
    });
    setCurrentTry((currentTry) => currentTry + 1);
  }, [currentTry]);

  const guess = React.useCallback(() => {
    if (!selectedSong || !solution) return;

    let state = GuessState.Incorrect;
    if (
      selectedSong.artist === solution.artist &&
      selectedSong.name === solution.name
    ) {
      state = GuessState.Correct;
    } else if (selectedSong.artist === solution.artist) {
      state = GuessState.PartiallyCorrect;
    }

    setGuesses((guesses: GuessType[]) => {
      const newGuesses = [...guesses];
      newGuesses[currentTry] = {
        song: selectedSong,
        state: state,
      };
      return newGuesses;
    });

    setCurrentTry((currentTry) => currentTry + 1);
    setSelectedSong(undefined);

    if (state === GuessState.Correct) {
      setDidGuess(true);
    }
  }, [guesses, selectedSong, solution]);

  const reset = React.useCallback(() => {
    setGuesses(
      Array.from({ length: 6 }).fill(initialGuess) as GuessType[]
    );
    setCurrentTry(0);
    setSelectedSong(undefined);
    setDidGuess(false);
  }, []);

  return {
    guesses,
    currentTry,
    selectedSong,
    setSelectedSong,
    didGuess,
    skip,
    guess,
    reset,
  };
}

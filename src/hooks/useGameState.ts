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

const SALT = import.meta.env.VITE_HEARDLE_SALT || "changeme";

const getKey = (salt: string) => {
  let key = 0;
  for (let i = 0; i < salt.length; i++) {
    key = (key + salt.charCodeAt(i)) % 256;
  }
  return key;
};

const KEY = getKey(SALT);
function loadStats() {
  try {
    const raw = localStorage.getItem("stats");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const encodeSolution = (solution: Song) => {
  const json = JSON.stringify(solution);

  const xored = json
    .split("")
    .map((c) => String.fromCharCode(c.charCodeAt(0) ^ KEY))
    .join("");

  return btoa(xored);
};

const decodeSolution = (value: string): Song | null => {
  try {
    const decoded = atob(value);

    const json = decoded
      .split("")
      .map((c) => String.fromCharCode(c.charCodeAt(0) ^ KEY))
      .join("");

    return JSON.parse(json);
  } catch {
    return null;
  }
};

export function useGameState({ solution, persist }: UseGameStateOptions) {
  const [guesses, setGuesses] = React.useState<GuessType[]>(
    Array.from({ length: 6 }).fill(initialGuess) as GuessType[]
  );

  const [currentTry, setCurrentTry] = React.useState(0);
  const [selectedSong, setSelectedSong] = React.useState<Song>();
  const [didGuess, setDidGuess] = React.useState(false);

  const [stats, setStats] = React.useState<any[]>(() => loadStats());

  const hydratedRef = React.useRef(false);
  const skipNextStatsSyncRef = React.useRef(false);

  React.useEffect(() => {
    if (!persist || !solution) return;
    if (hydratedRef.current) return;

    skipNextStatsSyncRef.current = true;

    const last = stats.at(-1);

    if (!last) {
      const newStats = [
        ...stats,
        {
          solution: encodeSolution(solution),
          currentTry: 0,
          didGuess: false,
          guesses: Array.from({ length: 6 }).fill(initialGuess),
        },
      ];

      setStats(newStats);
      hydratedRef.current = true;
      return;
    }

    const decodedSolution = last.solution
      ? decodeSolution(last.solution)
      : null;

    const sameGame = _.isEqual(solution, decodedSolution);

    if (sameGame) {
      setCurrentTry(last.currentTry ?? 0);

      setGuesses(
        Array.isArray(last.guesses)
          ? last.guesses
          : (Array.from({ length: 6 }).fill(initialGuess) as GuessType[])
      );

      setDidGuess(!!last.didGuess);
    } else {
      const newStats = [
        ...stats,
        {
          solution: encodeSolution(solution),
          currentTry: 0,
          didGuess: false,
          guesses: Array.from({ length: 6 }).fill(initialGuess),
        },
      ];

      setStats(newStats);
      setCurrentTry(0);
      setGuesses(
        Array.from({ length: 6 }).fill(initialGuess) as GuessType[]
      );
      setDidGuess(false);
    }

    hydratedRef.current = true;
  }, [solution, persist]);

  React.useEffect(() => {
    if (!persist) return;
    if (!hydratedRef.current) return;

    if (skipNextStatsSyncRef.current) {
      skipNextStatsSyncRef.current = false;
      return;
    }

    setStats((prev) => {
      if (!Array.isArray(prev)) return [];

      const copy = [...prev];
      const last = copy.at(-1);

      if (!last) return copy;

      last.currentTry = currentTry;
      last.didGuess = didGuess;
      last.guesses = guesses;

      return copy;
    });
  }, [guesses, currentTry, didGuess, persist]);

  React.useEffect(() => {
    if (!persist) return;
    if (!hydratedRef.current) return;
    localStorage.setItem("stats", JSON.stringify(stats || []));
  }, [stats, persist]);

  const skip = React.useCallback(() => {
    if (didGuess || currentTry >= guesses.length) return;

    setGuesses((prev) => {
      const copy = [...prev];
      copy[currentTry] = {
        song: undefined,
        state: GuessState.Skipped,
      };
      return copy;
    });

    setCurrentTry((t) => t + 1);
  }, [currentTry, didGuess, guesses.length]);

  const guess = React.useCallback(() => {
    if (!selectedSong || !solution) return;
    if (didGuess || currentTry >= guesses.length) return;

    let state = GuessState.Incorrect;

    if (
      selectedSong.artist === solution.artist &&
      selectedSong.name === solution.name
    ) {
      state = GuessState.Correct;
    } else if (selectedSong.artist === solution.artist) {
      state = GuessState.PartiallyCorrect;
    }

    setGuesses((prev) => {
      const copy = [...prev];
      copy[currentTry] = {
        song: selectedSong,
        state,
      };
      return copy;
    });

    setCurrentTry((t) => t + 1);
    setSelectedSong(undefined);

    if (state === GuessState.Correct) {
      setDidGuess(true);
    }
  }, [selectedSong, solution, currentTry, didGuess, guesses.length]);

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

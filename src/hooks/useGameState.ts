import React from "react";
import _ from "lodash";

import { Song } from "../types/song";
import { GuessState, GuessType } from "../types/guess";

interface UseGameStateOptions {
  solution: Song | null;
  persist: boolean;
}

interface PersistedStats {
  solution: string;
  currentTry: number;
  didGuess: boolean;
  guesses: GuessType[];
}

const initialGuess: GuessType = {
  song: undefined,
  state: undefined,
};

const makeEmptyGuesses = () =>
  Array.from({ length: 6 }, () => ({ ...initialGuess })) as GuessType[];

const isAnsweredGuess = (guess: GuessType | undefined | null) =>
  !!guess && !Array.isArray(guess) && guess.state !== undefined;

const normalizeAnsweredGuesses = (guesses: unknown): GuessType[] => {
  if (!Array.isArray(guesses)) return [];
  if (guesses.some((guess) => Array.isArray(guess))) return [];

  return (guesses as GuessType[]).filter(isAnsweredGuess).slice(0, 6);
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

function loadStats(): PersistedStats | null {
  try {
    const raw = localStorage.getItem("stats");
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      localStorage.removeItem("stats");
      return null;
    }

    const currentTry =
      typeof parsed.currentTry === "number" && Number.isFinite(parsed.currentTry)
        ? Math.max(0, Math.min(6, Math.floor(parsed.currentTry)))
        : 0;

    const normalized: PersistedStats = {
      solution: typeof parsed.solution === "string" ? parsed.solution : "",
      currentTry,
      didGuess: !!parsed.didGuess,
      guesses: normalizeAnsweredGuesses(parsed.guesses),
    };

    return normalized;
  } catch {
    localStorage.removeItem("stats");
    return null;
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
  const [guesses, setGuesses] = React.useState<GuessType[]>(makeEmptyGuesses());

  const [currentTry, setCurrentTry] = React.useState(0);
  const [selectedSong, setSelectedSong] = React.useState<Song>();
  const [didGuess, setDidGuess] = React.useState(false);

  const [stats, setStats] = React.useState<PersistedStats | null>(() =>
    loadStats()
  );

  const hydratedRef = React.useRef(false);
  const skipNextStatsSyncRef = React.useRef(false);

  React.useEffect(() => {
    if (!persist || !solution) return;
    if (hydratedRef.current) return;

    skipNextStatsSyncRef.current = true;

    const initialStats: PersistedStats = {
      solution: encodeSolution(solution),
      currentTry: 0,
      didGuess: false,
      guesses: [],
    };

    if (!stats) {
      setStats(initialStats);
      hydratedRef.current = true;
      return;
    }

    const decodedSolution = stats.solution
      ? decodeSolution(stats.solution)
      : null;

    const sameGame = _.isEqual(solution, decodedSolution);

    if (sameGame) {
      const answeredGuesses = normalizeAnsweredGuesses(stats.guesses);
      const hydratedGuesses = makeEmptyGuesses();

      answeredGuesses.forEach((guess, index) => {
        hydratedGuesses[index] = guess;
      });

      const normalizedCurrentTry = Math.min(
        answeredGuesses.length,
        Math.max(0, stats.currentTry ?? 0)
      );

      setCurrentTry(normalizedCurrentTry);
      setGuesses(hydratedGuesses);
      setDidGuess(!!stats.didGuess);
      setStats({
        ...stats,
        currentTry: normalizedCurrentTry,
        guesses: answeredGuesses,
      });
    } else {
      setStats(initialStats);
      setCurrentTry(0);
      setGuesses(makeEmptyGuesses());
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
      if (!prev) return prev;

      return {
        ...prev,
        currentTry,
        didGuess,
        guesses: guesses.filter(isAnsweredGuess),
      };
    });
  }, [guesses, currentTry, didGuess, persist]);

  React.useEffect(() => {
    if (!persist) return;
    if (!hydratedRef.current) return;
    if (!stats) {
      localStorage.removeItem("stats");
      return;
    }

    localStorage.setItem("stats", JSON.stringify(stats));
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
    setGuesses(makeEmptyGuesses());
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

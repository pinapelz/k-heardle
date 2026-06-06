import React from "react";
import { Song } from "../types/song";
import { GuessState, GuessType } from "../types/guess";
import { DailyGameState, submitDailyGuess } from "../helpers/fetchSolution";

interface UseGameStateOptions {
  solution: Song | null;
  persist: boolean;
  sessionDate?: string;
  sessionToken?: string;
  initialSig?: string;
}

const STATE_VERSION = 2;

interface PersistedStatsV2 extends DailyGameState {
  version: number;
  sig: string;
  sessionToken: string;
}

type PersistedStats = PersistedStatsV2;

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
  if (guesses.some((g) => Array.isArray(g))) return [];
  return (guesses as GuessType[]).filter(isAnsweredGuess).slice(0, 6);
};

function loadStats(): PersistedStats | null {
  try {
    const raw = localStorage.getItem("stats");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      localStorage.removeItem("stats");
      return null;
    }

    const isLegacyV0 =
      !("version" in parsed) &&
      "date" in parsed &&
      "guesses" in parsed &&
      !("sig" in parsed);

    const isLegacyVersion =
      typeof parsed.version === "number" && parsed.version < STATE_VERSION;

    if (isLegacyV0 || isLegacyVersion) {
      localStorage.clear();
      return null;
    }

    const currentTry =
      typeof parsed.currentTry === "number" && Number.isFinite(parsed.currentTry)
        ? Math.max(0, Math.min(6, Math.floor(parsed.currentTry)))
        : 0;

    const normalizedGuesses = normalizeAnsweredGuesses(parsed.guesses);

    return {
      version: STATE_VERSION,
      date: typeof parsed.date === "string" ? parsed.date : "",
      currentTry: Math.min(currentTry, normalizedGuesses.length),
      didGuess: !!parsed.didGuess,
      guesses: normalizedGuesses,
      sig: typeof parsed.sig === "string" ? parsed.sig : "",
      sessionToken:
        typeof parsed.sessionToken === "string" ? parsed.sessionToken : "",
    };
  } catch {
    localStorage.removeItem("stats");
    return null;
  }
}

export function useGameState({
  solution,
  persist,
  sessionDate,
  sessionToken,
  initialSig,
}: UseGameStateOptions) {
  const [guesses, setGuesses] = React.useState<GuessType[]>(makeEmptyGuesses());
  const [currentTry, setCurrentTry] = React.useState(0);
  const [selectedSong, setSelectedSong] = React.useState<Song>();
  const [didGuess, setDidGuess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [stats, setStats] = React.useState<PersistedStats | null>(() =>
    loadStats()
  );

  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    if (!persist) return;
    if (hydratedRef.current) return;
    if (!sessionDate || !sessionToken || !initialSig) return;

    const baseStats: PersistedStats = {
      version: STATE_VERSION,
      date: sessionDate,
      currentTry: 0,
      didGuess: false,
      guesses: [],
      sig: initialSig,
      sessionToken,
    };

    if (!stats) {
      setStats(baseStats);
      setCurrentTry(0);
      setGuesses(makeEmptyGuesses());
      setDidGuess(false);
      hydratedRef.current = true;
      return;
    }

    const sameSession =
      stats.date === sessionDate &&
      stats.sessionToken === sessionToken;

    if (sameSession) {
      const answered = normalizeAnsweredGuesses(stats.guesses);
      const hydrated = makeEmptyGuesses();

      answered.forEach((g, i) => (hydrated[i] = g));

      const normalizedTry = Math.min(
        answered.length,
        Math.max(0, stats.currentTry)
      );

      setCurrentTry(normalizedTry);
      setGuesses(hydrated);
      setDidGuess(!!stats.didGuess);

      setStats({
        ...stats,
        version: STATE_VERSION,
        currentTry: normalizedTry,
        guesses: answered,
      });
    } else {
      setStats(baseStats);
      setCurrentTry(0);
      setGuesses(makeEmptyGuesses());
      setDidGuess(false);
    }

    hydratedRef.current = true;
  }, [persist, sessionDate, sessionToken, initialSig, stats]);

  React.useEffect(() => {
    if (!persist) return;
    if (!hydratedRef.current) return;

    if (!stats) {
      localStorage.removeItem("stats");
      return;
    }

    localStorage.setItem("stats", JSON.stringify(stats));
  }, [stats, persist]);

  const applyServerState = React.useCallback(
    (next: DailyGameState, sig: string) => {
      if (!sessionToken) return;

      const answered = normalizeAnsweredGuesses(next.guesses);
      const hydrated = makeEmptyGuesses();

      answered.forEach((g, i) => (hydrated[i] = g));

      const normalizedTry = Math.min(
        answered.length,
        Math.max(0, next.currentTry)
      );

      setCurrentTry(normalizedTry);
      setGuesses(hydrated);
      setDidGuess(!!next.didGuess);
      setSelectedSong(undefined);

      setStats({
        version: STATE_VERSION,
        date: next.date,
        currentTry: normalizedTry,
        didGuess: !!next.didGuess,
        guesses: answered,
        sig,
        sessionToken,
      });
    },
    [sessionToken]
  );

  const skip = React.useCallback(async () => {
    if (didGuess || currentTry >= guesses.length) return;

    if (persist && sessionDate && sessionToken) {
      if (!stats?.sig || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const res = await submitDailyGuess({
          sessionToken,
          sig: stats.sig,
          state: {
            date: sessionDate,
            currentTry,
            didGuess,
            guesses: guesses.filter(isAnsweredGuess),
          },
          guess: null,
        });

        applyServerState(res.state, res.sig);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setGuesses((prev) => {
      const copy = [...prev];
      copy[currentTry] = {
        song: undefined,
        state: GuessState.Skipped,
      };
      return copy;
    });

    setCurrentTry((t) => t + 1);
  }, [
    didGuess,
    currentTry,
    guesses,
    persist,
    sessionDate,
    sessionToken,
    stats,
    isSubmitting,
    applyServerState,
  ]);

  const guess = React.useCallback(async () => {
    if (!selectedSong || !solution) return;
    if (didGuess || currentTry >= guesses.length) return;

    if (persist && sessionDate && sessionToken) {
      if (!stats?.sig || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const res = await submitDailyGuess({
          sessionToken,
          sig: stats.sig,
          state: {
            date: sessionDate,
            currentTry,
            didGuess,
            guesses: guesses.filter(isAnsweredGuess),
          },
          guess: {
            artist: selectedSong.artist,
            name: selectedSong.name,
          },
        });

        applyServerState(res.state, res.sig);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

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
      copy[currentTry] = { song: selectedSong, state };
      return copy;
    });

    setCurrentTry((t) => t + 1);
    setSelectedSong(undefined);

    if (state === GuessState.Correct) setDidGuess(true);
  }, [
    selectedSong,
    solution,
    currentTry,
    didGuess,
    guesses,
    persist,
    sessionDate,
    sessionToken,
    stats,
    isSubmitting,
    applyServerState,
  ]);

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

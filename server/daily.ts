import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  buildSessionToken,
  getUtcDate,
  GuessEntry,
  normalizeSignedState,
  obfuscateSong,
  SignedState,
  signState,
  verifySessionToken,
  verifyStateSignature,
  getDailySong,
  getDailyMusicVideo,
} from "./shared";

export const dailyRouter = Router();

const guessLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

dailyRouter.get("/today", (_req, res) => {
  const date = getUtcDate();
  const song = getDailySong(date);

  const initialState: SignedState = {
    date,
    currentTry: 0,
    didGuess: false,
    guesses: [],
  };

  res.json({
    date,
    data: obfuscateSong(song, date),
    sessionToken: buildSessionToken(date),
    initialSig: signState(initialState),
  });
});

dailyRouter.get("/todayMV", (_req, res) => {
  const date = getUtcDate();
  const mv = getDailyMusicVideo(date);

  const initialState: SignedState = {
    date,
    currentTry: 0,
    didGuess: false,
    guesses: [],
  };

  res.json({
    date,
    data: obfuscateSong(mv, date),
    sessionToken: buildSessionToken(date),
    initialSig: signState(initialState),
  });
});

dailyRouter.post("/guess", guessLimiter, (req, res) => {
  const today = getUtcDate();
  const body = req.body as {
    sessionToken?: unknown;
    state?: unknown;
    sig?: unknown;
    guess?: unknown;
  };

  if (!verifySessionToken(body.sessionToken, today)) {
    res.status(401).json({ error: "Invalid session token." });
    return;
  }

  const state = normalizeSignedState(body.state);
  if (!state) {
    res.status(400).json({ error: "Invalid state payload." });
    return;
  }

  if (state.date !== today) {
    res.status(409).json({ error: "State date is not valid for today." });
    return;
  }

  if (!verifyStateSignature(state, body.sig)) {
    res.status(403).json({ error: "State signature mismatch." });
    return;
  }

  if (state.didGuess || state.currentTry >= 6) {
    res.status(409).json({ error: "Round already finished." });
    return;
  }

  let nextGuess: GuessEntry;
  const guess = body.guess as { artist?: unknown; name?: unknown } | null | undefined;

  if (guess == null) {
    nextGuess = {
      state: "Skipped",
    };
  } else if (typeof guess.artist === "string" && typeof guess.name === "string") {
    const solution = getDailySong(today);

    if (guess.artist === solution.artist && guess.name === solution.name) {
      nextGuess = {
        song: { artist: guess.artist, name: guess.name },
        state: "Correct",
      };
    } else if (guess.artist === solution.artist) {
      nextGuess = {
        song: { artist: guess.artist, name: guess.name },
        state: "PartiallyCorrect",
      };
    } else {
      nextGuess = {
        song: { artist: guess.artist, name: guess.name },
        state: "Incorrect",
      };
    }
  } else {
    res.status(400).json({ error: "Invalid guess payload." });
    return;
  }

  const nextState: SignedState = {
    date: state.date,
    currentTry: Math.min(6, state.currentTry + 1),
    didGuess: state.didGuess || nextGuess.state === "Correct",
    guesses: [...state.guesses, nextGuess],
  };

  res.json({
    state: nextState,
    sig: signState(nextState),
    guessState: nextGuess.state,
  });
});

dailyRouter.post("/guessMV", guessLimiter, (req, res) => {
  const today = getUtcDate();
  const body = req.body as {
    sessionToken?: unknown;
    state?: unknown;
    sig?: unknown;
    guess?: unknown;
  };

  if (!verifySessionToken(body.sessionToken, today)) {
    res.status(401).json({ error: "Invalid session token." });
    return;
  }

  const state = normalizeSignedState(body.state);
  if (!state) {
    res.status(400).json({ error: "Invalid state payload." });
    return;
  }

  if (state.date !== today) {
    res.status(409).json({ error: "State date is not valid for today." });
    return;
  }

  if (!verifyStateSignature(state, body.sig)) {
    res.status(403).json({ error: "State signature mismatch." });
    return;
  }

  if (state.didGuess || state.currentTry >= 6) {
    res.status(409).json({ error: "Round already finished." });
    return;
  }

  let nextGuess: GuessEntry;
  const guess = body.guess as { artist?: unknown; name?: unknown } | null | undefined;

  if (guess == null) {
    nextGuess = {
      state: "Skipped",
    };
  } else if (typeof guess.artist === "string" && typeof guess.name === "string") {
    const solution = getDailyMusicVideo(today);

    if (guess.artist === solution.artist && guess.name === solution.name) {
      nextGuess = {
        song: { artist: guess.artist, name: guess.name },
        state: "Correct",
      };
    } else if (guess.artist === solution.artist) {
      nextGuess = {
        song: { artist: guess.artist, name: guess.name },
        state: "PartiallyCorrect",
      };
    } else {
      nextGuess = {
        song: { artist: guess.artist, name: guess.name },
        state: "Incorrect",
      };
    }
  } else {
    res.status(400).json({ error: "Invalid guess payload." });
    return;
  }

  const nextState: SignedState = {
    date: state.date,
    currentTry: Math.min(6, state.currentTry + 1),
    didGuess: state.didGuess || nextGuess.state === "Correct",
    guesses: [...state.guesses, nextGuess],
  };

  res.json({
    state: nextState,
    sig: signState(nextState),
    guessState: nextGuess.state,
  });
});

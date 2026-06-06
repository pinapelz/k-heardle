import express from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { songs } from "./data/songs";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const SALT = process.env.VITE_HEARDLE_SALT ?? "changeme";
const SIGNING_SECRET = process.env.HEARDLE_SIGNING_SECRET ?? SALT;

type Song = (typeof songs)[number];

type GuessResult = "Correct" | "PartiallyCorrect" | "Incorrect" | "Skipped";

type GuessEntry = {
  song?: {
    artist: string;
    name: string;
  };
  state: GuessResult;
};

type SignedState = {
  date: string;
  currentTry: number;
  didGuess: boolean;
  guesses: GuessEntry[];
};

function getObfuscationKey(date = getUtcDate()): Buffer {
  return Buffer.from(SALT + date);
}

function xorBuffer(data: Buffer, key: Buffer): Buffer {
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output;
}

function getUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getDailySong(date: string): Song {
  const seed = hashString(date);
  const index = seed % songs.length;
  return songs[index];
}

function signValue(prefix: string, value: string): string {
  return createHmac("sha256", SIGNING_SECRET)
    .update(`${prefix}:${value}`)
    .digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function buildSessionToken(date: string): string {
  const payload = Buffer.from(JSON.stringify({ date }), "utf8").toString("base64url");
  const sig = signValue("session", payload);
  return `${payload}.${sig}`;
}

function verifySessionToken(token: unknown, expectedDate: string): boolean {
  if (typeof token !== "string") return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expectedSig = signValue("session", payload);
  if (!safeEqualHex(sig, expectedSig)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      date?: unknown;
    };

    return typeof decoded.date === "string" && decoded.date === expectedDate;
  } catch {
    return false;
  }
}

function normalizeGuessEntry(entry: unknown): GuessEntry | null {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;

  const maybeState = (entry as { state?: unknown }).state;
  if (
    maybeState !== "Correct" &&
    maybeState !== "PartiallyCorrect" &&
    maybeState !== "Incorrect" &&
    maybeState !== "Skipped"
  ) {
    return null;
  }

  const maybeSong = (entry as { song?: unknown }).song;

  if (maybeState === "Skipped") {
    return { state: "Skipped" };
  }

  if (!maybeSong || typeof maybeSong !== "object" || Array.isArray(maybeSong)) {
    return null;
  }

  const artist = (maybeSong as { artist?: unknown }).artist;
  const name = (maybeSong as { name?: unknown }).name;

  if (typeof artist !== "string" || typeof name !== "string") {
    return null;
  }

  return {
    song: { artist, name },
    state: maybeState,
  };
}

function normalizeSignedState(input: unknown): SignedState | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const date = (input as { date?: unknown }).date;
  const currentTryRaw = (input as { currentTry?: unknown }).currentTry;
  const didGuessRaw = (input as { didGuess?: unknown }).didGuess;
  const guessesRaw = (input as { guesses?: unknown }).guesses;

  if (typeof date !== "string") return null;
  if (!Array.isArray(guessesRaw)) return null;
  if (typeof currentTryRaw !== "number" || !Number.isFinite(currentTryRaw)) return null;

  const currentTry = Math.floor(currentTryRaw);
  if (currentTry < 0 || currentTry > 6) return null;

  const guesses: GuessEntry[] = [];
  for (const entry of guessesRaw) {
    const normalized = normalizeGuessEntry(entry);
    if (!normalized) return null;
    guesses.push(normalized);
  }

  if (guesses.length > 6) return null;
  if (guesses.length !== currentTry) return null;

  const didGuess = !!didGuessRaw;
  if (didGuess && !guesses.some((guess) => guess.state === "Correct")) {
    return null;
  }

  return {
    date,
    currentTry,
    didGuess,
    guesses,
  };
}

function canonicalState(state: SignedState): string {
  return JSON.stringify({
    date: state.date,
    currentTry: state.currentTry,
    didGuess: state.didGuess,
    guesses: state.guesses.map((guess) => ({
      state: guess.state,
      song: guess.song
        ? {
            artist: guess.song.artist,
            name: guess.song.name,
          }
        : null,
    })),
  });
}

function signState(state: SignedState): string {
  return signValue("state", canonicalState(state));
}

function verifyStateSignature(state: SignedState, sig: unknown): boolean {
  if (typeof sig !== "string") return false;
  const expectedSig = signState(state);
  return safeEqualHex(sig, expectedSig);
}

const guessLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

app.get("/today", (_req, res) => {
  const date = getUtcDate();
  const song = getDailySong(date);
  const obfuscationKey = getObfuscationKey(date);
  const songJson = JSON.stringify(song);
  const obfuscatedData = xorBuffer(Buffer.from(songJson, "utf8"), obfuscationKey);

  const initialState: SignedState = {
    date,
    currentTry: 0,
    didGuess: false,
    guesses: [],
  };

  res.json({
    date,
    data: obfuscatedData.toString("hex"),
    sessionToken: buildSessionToken(date),
    initialSig: signState(initialState),
  });
});

app.post("/guess", guessLimiter, (req, res) => {
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

app.get("/select", (_req, res) => {
  const song = songs[Math.floor(Math.random() * songs.length)];
  const obfuscationKey = getObfuscationKey();
  const songJson = JSON.stringify(song);
  const obfuscatedData = xorBuffer(Buffer.from(songJson, "utf8"), obfuscationKey);
  res.json({
    data: obfuscatedData.toString("hex"),
  });
});

app.get("/songs", (_req, res) => {
  res.json(songs.map(({ artist, name }) => ({ artist, name })));
});

app.listen(SERVER_PORT, () => console.log(`Server running on :${SERVER_PORT}`));

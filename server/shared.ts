import { createHmac, timingSafeEqual } from "crypto";
import { songs } from "./data/songs";

function getSalt(): string {
  return process.env.VITE_HEARDLE_SALT ?? "changeme";
}

function getSigningSecret(): string {
  return process.env.HEARDLE_SIGNING_SECRET ?? getSalt();
}

export type Song = (typeof songs)[number];

export type GuessResult = "Correct" | "PartiallyCorrect" | "Incorrect" | "Skipped";

export type GuessEntry = {
  song?: {
    artist: string;
    name: string;
  };
  state: GuessResult;
};

export type SignedState = {
  date: string;
  currentTry: number;
  didGuess: boolean;
  guesses: GuessEntry[];
};

export function getObfuscationKey(date = getUtcDate()): Buffer {
  return Buffer.from(getSalt() + date);
}

export function xorBuffer(data: Buffer, key: Buffer): Buffer {
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output;
}

export function getUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickSong(date: string): Song {
  const seed = hashString(date);
  const index = seed % songs.length;
  return songs[index];
}

function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function getDailySong(today: string): Song {
  const recentSongs = new Set(
    getLastNDates(30).map(d => pickSong(d).youtubeId)
  );
  let candidate = pickSong(today);
  let guard = 0;
  while (recentSongs.has(candidate.youtubeId) && guard < songs.length) {
    const rerollSeed = hashString(today + ":" + guard);
    const index = rerollSeed % songs.length;
    candidate = songs[index];
    guard++;
  }
  return candidate;
}

function signValue(prefix: string, value: string): string {
  return createHmac("sha256", getSigningSecret())
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

export function buildSessionToken(date: string): string {
  const payload = Buffer.from(JSON.stringify({ date }), "utf8").toString("base64url");
  const sig = signValue("session", payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: unknown, expectedDate: string): boolean {
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

export function normalizeSignedState(input: unknown): SignedState | null {
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

export function signState(state: SignedState): string {
  return signValue("state", canonicalState(state));
}

export function verifyStateSignature(state: SignedState, sig: unknown): boolean {
  if (typeof sig !== "string") return false;
  const expectedSig = signState(state);
  return safeEqualHex(sig, expectedSig);
}

export function obfuscateSong(song: Song, date?: string): string {
  const obfuscationKey = getObfuscationKey(date);
  const songJson = JSON.stringify(song);
  const obfuscatedData = xorBuffer(Buffer.from(songJson, "utf8"), obfuscationKey);
  return obfuscatedData.toString("hex");
}

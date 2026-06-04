import express from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { songs } from './data/songs';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const SALT = process.env.VITE_HEARDLE_SALT ?? 'changeme';
const DAILY_SONGS_FILE = path.resolve(
  process.env.DAILY_SONGS_FILE ?? 'server/data/daily-songs.json',
);

type Song = (typeof songs)[number];
type DailySongs = Record<string, Song>;

function getObfuscationKey(): Buffer {
  const date = new Date().toISOString().split('T')[0];
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

function readDailySongs(): DailySongs {
  if (!existsSync(DAILY_SONGS_FILE)) {
    return {};
  }

  return JSON.parse(readFileSync(DAILY_SONGS_FILE, 'utf8')) as DailySongs;
}

function writeDailySongs(dailySongs: DailySongs): void {
  mkdirSync(path.dirname(DAILY_SONGS_FILE), { recursive: true });
  writeFileSync(DAILY_SONGS_FILE, JSON.stringify(dailySongs, null, 2));
}

function getDailySong(date: string): Song {
  const dailySongs = readDailySongs();
  const savedSong = dailySongs[date];

  if (savedSong) {
    return savedSong;
  }

  const seed = hashString(date);
  const index = seed % songs.length;
  const song = songs[index];
  dailySongs[date] = song;
  writeDailySongs(dailySongs);
  return song;
}

app.get('/today', (_req, res) => {
  const date = getUtcDate();
  const song = getDailySong(date);
  const obfuscationKey = getObfuscationKey();
  const songJson = JSON.stringify(song);
  const obfuscatedData = xorBuffer(Buffer.from(songJson, 'utf8'), obfuscationKey);
  res.json({
    data: obfuscatedData.toString('hex'),
  });
});

app.get('/select', (_req, res) => {
  const song = songs[Math.floor(Math.random() * songs.length)];
  const obfuscationKey = getObfuscationKey();
  const songJson = JSON.stringify(song);
  const obfuscatedData = xorBuffer(Buffer.from(songJson, 'utf8'), obfuscationKey);
  res.json({
    data: obfuscatedData.toString('hex'),
  });
});

app.get('/songs', (_req, res) => {
  res.json(songs.map(({ artist, name }) => ({ artist, name })));
});


app.listen(SERVER_PORT, () => console.log(`Server running on :${SERVER_PORT}`));

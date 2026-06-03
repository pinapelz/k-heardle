import express from 'express';
import { songs } from './data/songs';
import { startDate } from './data/startDate';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const SALT = process.env.VITE_HEARDLE_SALT ?? 'changeme';

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

app.get('/today', (_req, res) => {
  const msInDay = 86_400_000;
  const index = Math.floor((Date.now() - startDate.getTime()) / msInDay);
  const song = songs[index % songs.length];
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

app.get('/info', (_req, res) => {
  res.json({ startDate: startDate.toISOString() });
});


app.listen(SERVER_PORT, () => console.log(`Server running on :${SERVER_PORT}`));

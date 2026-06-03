import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { songs } from '../src/data/songs';
import { startDate } from '../src/constants/startDate';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 3001;
const SALT = process.env.REACT_APP_HEARDLE_SALT ?? 'changeme';

function getDailyKey(): Buffer {
  const date = new Date().toISOString().split('T')[0];
  return crypto.pbkdf2Sync(date, SALT, 100_000, 32, 'sha256');
}

app.get('/today', (_req, res) => {
  const msInDay = 86_400_000;
  const index = Math.floor((Date.now() - startDate.getTime()) / msInDay);
  const song = songs[index % songs.length];

  const key = getDailyKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(song), 'utf8'),
    cipher.final(),
  ]);
  res.json({
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
    data: encrypted.toString('hex'),
  });
});

app.get('/songs', (_req, res) => {
  res.json(songs.map(({ artist, name }) => ({ artist, name })));
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(SERVER_PORT, () => console.log(`Server running on :${SERVER_PORT}`));

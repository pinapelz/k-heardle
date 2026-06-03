import { Song } from "../types/song";

const SALT = import.meta.env.VITE_HEARDLE_SALT ?? 'changeme';
const API_URL = import.meta.env.VITE_HEARDLE_API_URL ?? 'https://127.0.0.1:3001';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
return bytes;
}


async function getDailyKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const date = new Date().toISOString().split('T')[0];
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(date),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
}

export async function getDailySolution(): Promise<Song> {
  const solutionData = await fetch(`${API_URL}/today`);
  if (!solutionData.ok) {
    throw new Error(`Failed to fetch solution: ${solutionData.statusText}`);
  }
  const { iv, tag, data } = await solutionData.json();
  const key = await getDailyKey();
  const ciphertext = hexToBytes(data);
  const authTag = hexToBytes(tag);
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext);
  combined.set(authTag, ciphertext.length);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: hexToBytes(iv) },
    key,
    combined,
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as Song;
}

import { Song } from "../types/song";

const SALT = import.meta.env.VITE_HEARDLE_SALT ?? 'changeme';
const API_URL = import.meta.env.VITE_HEARDLE_API_URL ?? 'http://localhost:3001';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
return bytes;
}


function xor(data: Uint8Array, key: Uint8Array): Uint8Array {
  const output = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output;
}

function getObfuscationKey(date = new Date().toISOString().split('T')[0]): Uint8Array {
  return new TextEncoder().encode(SALT + date);
}

function decryptResponse(data: string, date?: string): Song {
  const obfuscationKey = getObfuscationKey(date);
  const obfuscatedBytes = hexToBytes(data);
  const decrypted = xor(obfuscatedBytes, obfuscationKey);
  return JSON.parse(new TextDecoder().decode(decrypted)) as Song;
}

export interface DailySolution {
  date: string;
  song: Song;
}

export async function getDailySolution(): Promise<DailySolution> {
  const solutionData = await fetch(`${API_URL}/today`);
  if (!solutionData.ok) {
    throw new Error(`Failed to fetch solution: ${solutionData.statusText}`);
  }
  const { data, date } = await solutionData.json();
  return {
    date,
    song: decryptResponse(data, date),
  };
}

export async function getSelectSolution(): Promise<Song> {
  const solutionData = await fetch(`${API_URL}/select`);
  if (!solutionData.ok) {
    throw new Error(`Failed to fetch solution: ${solutionData.statusText}`);
  }
  const { data } = await solutionData.json();
  return decryptResponse(data);
}

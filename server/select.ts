import { Router } from "express";
import { songs } from "./data/songs";
import { obfuscateSong } from "./shared";

export const selectRouter = Router();

selectRouter.get("/select", (_req, res) => {
  const song = songs[Math.floor(Math.random() * songs.length)];

  res.json({
    data: obfuscateSong(song),
  });
});

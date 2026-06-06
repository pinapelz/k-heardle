import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { songs } from "./data/songs";
import { dailyRouter } from "./daily";
import { selectRouter } from "./select";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 3001;

app.use(dailyRouter);
app.use(selectRouter);

app.get("/songs", (_req, res) => {
  res.json(songs.map(({ artist, name }) => ({ artist, name })));
});

app.listen(SERVER_PORT, () => console.log(`Server running on :${SERVER_PORT}`));

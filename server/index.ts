import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dailyRouter } from "./daily";
import { selectRouter } from "./select";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SERVER_PORT = process.env.SERVER_PORT || 3001;

app.use(dailyRouter);
app.use(selectRouter);

const enableDailyMusicVideo = process.env.ENABLE_DAILY_MUSIC_VIDEO === "true";

app.route("/info")
    .get((_, res) => {
        res.json({
          dailyMusic: true, // for now assume daily heardle is always playable (bare minimum for instance)
          dailyMV: enableDailyMusicVideo, // signify to worker whether daily MV guessing should be ran
        });
    });

app.listen(SERVER_PORT, () => console.log(`Server running on :${SERVER_PORT}`));

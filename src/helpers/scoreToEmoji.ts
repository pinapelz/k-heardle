import { GuessType, GuessState } from "../types/guess";
import { appName } from "../constants";

export async function scoreToEmoji(guesses: GuessType[]): Promise<string> {
  const msInDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const startDate = new Date(import.meta.env.VITE_START_DATE);
  const index =
    Math.floor(
      (Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) -
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())) /
        msInDay
    ) + 1;
  const emojis = {
    incorrect: "🟥",
    partiallyCorrect: "🟨",
    correct: "🟩",
    skip: "⬜",
    empty: "⬛️",
  };
  const prefix = `${appName} - #${index}`;

  let scoreEmoji = "";

  guesses.forEach((guess: GuessType) => {
    if (guess.state === GuessState.Correct) {
      scoreEmoji += emojis.correct;
    } else if (guess.state === GuessState.Skipped) {
      scoreEmoji += emojis.skip;
    } else if (guess.state === GuessState.PartiallyCorrect) {
      scoreEmoji += emojis.partiallyCorrect;
    } else if (guess.state === GuessState.Incorrect) {
      scoreEmoji += emojis.incorrect;
    } else {
      scoreEmoji += emojis.empty;
    }
  });

  return `${prefix}\n${scoreEmoji}`;
}

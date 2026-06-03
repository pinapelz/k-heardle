import { GuessType, GuessState } from "../types/guess";
import { appName } from "../constants";
import { fetchInfo } from "./fetchInfo";

export async function scoreToEmoji(guesses: GuessType[]): Promise<string> {
  const msInDay = 86400000;
  const todaysDate = new Date();
  const info = await fetchInfo();
  const startDate = new Date(info.startDate);
  const index = Math.floor((todaysDate.getTime() - startDate.getTime() )/msInDay) + 1
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

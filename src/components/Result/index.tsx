import React, { useState } from 'react';

import { Song } from "../../types/song";
import { GuessType } from "../../types/guess";
import { scoreToEmoji } from "../../helpers";

import { Button } from "../Button";
import { MiniYouTubePlayer } from "../MiniYouTubePlayer";

import * as Styled from "./index.styled";
import { theme } from "../../constants";

interface SolutionProps {
  didGuess: boolean;
  currentTry: number;
  todaysSolution: Song;
  isUnlimited?: boolean;
}

function Solution({
  didGuess,
  todaysSolution,
  currentTry,
  isUnlimited,
}: SolutionProps) {
  return (
    <>
      <Styled.SongTitle>
        {isUnlimited ? "The song was" : "Today's song is"} {todaysSolution.artist} - {todaysSolution.name}
      </Styled.SongTitle>

      {didGuess && (
        <Styled.Tries>
          You guessed it in {currentTry} {currentTry === 1 ? 'try' : 'tries'}.
        </Styled.Tries>
      )}

      <MiniYouTubePlayer id={todaysSolution.youtubeId} />
    </>
  );
}

interface ShareButtonProps {
  guesses: GuessType[];
  variant?: keyof typeof theme;
}

function ShareButton({ guesses, variant }: ShareButtonProps) {
  const [buttonText, setButtonText] = useState('Share Results');
  const [result, setResult] = useState<string>('');

  React.useEffect(() => {
    let cancelled = false;

    scoreToEmoji(guesses).then((text) => {
      if (!cancelled) setResult(text);
    });

    return () => {
      cancelled = true;
    };
  }, [guesses]);

  const handleClick = React.useCallback(async () => {
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const onWindows =
      windowsPlatforms.indexOf(window.navigator.platform) !== -1;
    const isSecureContext = window.isSecureContext;
    if (navigator.share !== undefined && !onWindows) {
      await navigator.share({ text: result });
    } else if (isSecureContext && navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(result);
      setButtonText('Copied!');
    } else {
      setButtonText('Clipboard unavailable (requires secure context)');
    }
  }, [result]);

  return (
    <Button onClick={handleClick} variant={variant}>
      {buttonText}
    </Button>
  );
}

interface Props {
  didGuess: boolean;
  currentTry: number;
  todaysSolution: Song;
  guesses: GuessType[];
  mode?: "daily" | "unlimited";
  onPlayAgain?: () => void;
}

export function Result({
  didGuess,
  todaysSolution,
  guesses,
  currentTry,
  mode = "daily",
  onPlayAgain,
}: Props) {
  const now = new Date();
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  );

  const hoursToNextDay = Math.floor(
    (nextUtcMidnight - now.getTime()) / 1000 / 60 / 60
  );
  const isUnlimited = mode === "unlimited";

  if (didGuess) {
    const textForTry = ["Perfect!", "Wow!", "Super!", "Congrats!", "Nice!"];

    return (
      <>
        <Styled.ResultTitle>{textForTry[currentTry - 1]}</Styled.ResultTitle>

        <Solution
          todaysSolution={todaysSolution}
          didGuess={didGuess}
          currentTry={currentTry}
          isUnlimited={isUnlimited}
        />

        {!isUnlimited && <ShareButton guesses={guesses} variant="green" />}

        {isUnlimited && onPlayAgain ? (
          <Button variant="green" onClick={onPlayAgain}>
            Play Again
          </Button>
        ) : (
          <Styled.TimeToNext>
            Remember to come back in {hoursToNextDay} hours!
          </Styled.TimeToNext>
        )}
      </>
    );
  }

  return (
    <>
      <Styled.ResultTitle>Unfortunately, thats wrong.</Styled.ResultTitle>

      <Solution
        todaysSolution={todaysSolution}
        didGuess={didGuess}
        currentTry={currentTry}
        isUnlimited={isUnlimited}
      />

      {!isUnlimited && <ShareButton guesses={guesses} variant="red" />}

      {isUnlimited && onPlayAgain ? (
        <Button variant="red" onClick={onPlayAgain}>
          Play Again
        </Button>
      ) : (
        <Styled.TimeToNext>
          Try again in {hoursToNextDay} hours.
        </Styled.TimeToNext>
      )}
    </>
  );
}

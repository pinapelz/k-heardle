import React, { useState } from 'react';

import { Song } from "../../types/song";
import { GuessType } from "../../types/guess";
import { scoreToEmoji } from "../../helpers";
import { appName } from '../../constants';

import { Button } from "../Button";
import { MiniYouTubePlayer } from "../MiniYouTubePlayer";

import * as Styled from "./index.styled";
import { theme } from "../../constants";
import GuessDistributionChart from '../Chart';

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
  mode?: "daily" | "unlimited" | "dailyMV";
  sessionDate: string;
  onPlayAgain?: () => void;
}

export function Result({
  didGuess,
  todaysSolution,
  guesses,
  currentTry,
  mode = "daily",
  sessionDate,
  onPlayAgain,
}: Props) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  React.useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      const nextUtcMidnight = Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate() + 1
      );
      const remaining = nextUtcMidnight - now;
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const isUnlimited = mode === "unlimited";
  const chartMode = mode === "dailyMV" ? "dailyMV" : "daily";

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
        {!isUnlimited && (
          <GuessDistributionChart
            currentTry={currentTry}
            didGuess={didGuess}
            sessionDate={sessionDate}
            mode={chartMode}
          />
        )}

        {!isUnlimited && <ShareButton guesses={guesses} variant="green" />}

        {isUnlimited && onPlayAgain ? (
          <Button variant="green" onClick={onPlayAgain}>
            Play Again
          </Button>
        ) : (
          <Styled.TimeToNext>
            The next {appName} will be available in {timeLeftStr}!
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
      {!isUnlimited && (
        <GuessDistributionChart
          currentTry={currentTry}
          didGuess={didGuess}
          sessionDate={sessionDate}
          mode={chartMode}
        />
      )}

      {!isUnlimited && <ShareButton guesses={guesses} variant="red" />}

      {isUnlimited && onPlayAgain ? (
        <Button variant="red" onClick={onPlayAgain}>
          Play Again
        </Button>
      ) : (
        <Styled.TimeToNext>
          Try again in {timeLeftStr}.
        </Styled.TimeToNext>
      )}
    </>
  );
}

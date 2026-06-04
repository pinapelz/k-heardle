import React from "react";

import { Song } from "../types/song";
import { getSelectSolution } from "../helpers/fetchSolution";
import { useGameState } from "../hooks/useGameState";

import { Header, InfoPopUp, Game, Footer } from "../components";

import * as Styled from "../app.styled";

export function UnlimitedPage() {
  const [solution, setSolution] = React.useState<Song | null>(null);

  const firstRun = localStorage.getItem("firstRun") === null;

  function fetchNewSong() {
    setSolution(null);
    getSelectSolution().then((s) => setSolution(s));
  }

  React.useEffect(() => {
    fetchNewSong();
  }, []);

  const {
    guesses,
    currentTry,
    setSelectedSong,
    didGuess,
    skip,
    guess,
    reset,
  } = useGameState({ solution, persist: false });

  const playAgain = React.useCallback(() => {
    reset();
    fetchNewSong();
  }, [reset]);

  const [isInfoPopUpOpen, setIsInfoPopUpOpen] =
    React.useState<boolean>(firstRun);

  const openInfoPopUp = React.useCallback(() => {
    setIsInfoPopUpOpen(true);
  }, []);

  const closeInfoPopUp = React.useCallback(() => {
    if (firstRun) {
      localStorage.setItem("firstRun", "false");
    }
    setIsInfoPopUpOpen(false);
  }, [localStorage.getItem("firstRun")]);

  if (solution === null) {
    return null;
  }

  return (
    <main>
      <Header openInfoPopUp={openInfoPopUp} />
      {isInfoPopUpOpen && <InfoPopUp onClose={closeInfoPopUp} />}
      <Styled.Container>
        <Game
          guesses={guesses}
          didGuess={didGuess}
          todaysSolution={solution}
          currentTry={currentTry}
          setSelectedSong={setSelectedSong}
          skip={skip}
          guess={guess}
          mode="unlimited"
          onPlayAgain={playAgain}
        />
      </Styled.Container>
      <Footer />
    </main>
  );
}

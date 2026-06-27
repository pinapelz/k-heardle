import React from "react";

import { DailySolution, getDailyMVSolution } from "../helpers/fetchSolution";
import { useGameState } from "../hooks/useGameState";

import { Header, InfoPopUp, Game, Footer } from "../components";

import * as Styled from "../app.styled";

export function MVPage() {
  const [todaysSolution, setTodaysSolution] =
    React.useState<DailySolution | null>(null);

  const firstRun = localStorage.getItem("firstRun") === null;

  React.useEffect(() => {
    getDailyMVSolution().then((solution) => setTodaysSolution(solution));
  }, []);

  const {
    guesses,
    currentTry,
    setSelectedSong,
    didGuess,
    skip,
    guess,
    isSubmitting,
  } = useGameState({
    solution: todaysSolution?.song ?? null,
    persist: true,
    sessionDate: todaysSolution?.date,
    sessionToken: todaysSolution?.sessionToken,
    initialSig: todaysSolution?.initialSig,
    mode: "dailyMV",
  });

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

  if (todaysSolution === null) {
    return null;
  }

  return (
    <main>
      <Header openInfoPopUp={openInfoPopUp} />
      {isInfoPopUpOpen && <InfoPopUp onClose={closeInfoPopUp} gameMode="dailyMV" />}
      <Styled.Container>
        <Game
          guesses={guesses}
          didGuess={didGuess}
          todaysSolution={todaysSolution.song}
          dailyDate={todaysSolution.date}
          currentTry={currentTry}
          setSelectedSong={setSelectedSong}
          skip={skip}
          guess={guess}
          mode="dailyMV"
          isSubmitting={isSubmitting}
        />
      </Styled.Container>
      <Footer />
    </main>
  );
}

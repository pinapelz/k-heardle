import React from "react";

import { GuessType } from "../types/guess";
import { DailySolution, getDailySolution } from "../helpers/fetchSolution";
import { useGameState } from "../hooks/useGameState";

import { Header, InfoPopUp, Game, Footer } from "../components";

import * as Styled from "../app.styled";

export function DailyPage() {
  const [todaysSolution, setTodaysSolution] = React.useState<DailySolution | null>(null);

  const firstRun = localStorage.getItem("firstRun") === null;

  const initialGuess = {
    song: undefined,
    state: undefined,
  } as GuessType;

  // --- Stats import logic ---
  function reloadWithoutQueryParameters() {
    location.replace(location.pathname);
  }
  const urlHash = window.location.hash;
  const urlQueryParametersStart = urlHash.indexOf("?");
  const statsImportQueryParameter =
    new URLSearchParams(urlHash.substring(urlQueryParametersStart)).get(
      "statsImport"
    ) || "";

  function importStats() {
    if (statsImportQueryParameter) {
      const importedStats = JSON.parse(statsImportQueryParameter);
      if (Array.isArray(importedStats)) {
        importedStats.forEach((day) => {
          if (Array.isArray(day.guesses)) {
            if (day.guesses.length == 5) {
              day.guesses.push(initialGuess);
            }
          }
        });
      }
      localStorage.setItem("stats", JSON.stringify(importedStats));
      reloadWithoutQueryParameters();
    }
  }

  if (statsImportQueryParameter) {
    if (
      confirm(
        "Do you want to import your previous stats? This will overwrite any stats on this site."
      )
    ) {
      importStats();
    } else {
      reloadWithoutQueryParameters();
    }
  }

  React.useEffect(() => {
    getDailySolution().then((solution) => setTodaysSolution(solution));
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
      {isInfoPopUpOpen && <InfoPopUp onClose={closeInfoPopUp} />}
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
          isSubmitting={isSubmitting}
        />
      </Styled.Container>
      <Footer />
    </main>
  );
}

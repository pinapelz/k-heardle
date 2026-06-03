import React from "react";
import _ from "lodash";

import { Song } from "./types/song";
import { GuessState, GuessType } from "./types/guess";
import { getDailySolution } from "./helpers/fetchSolution";


import { Header, InfoPopUp, Game, Footer } from "./components";

import * as Styled from "./app.styled";

function App() {
  const initialGuess = {
    song: undefined,
    state: undefined,
  } as GuessType;

  const [guesses, setGuesses] = React.useState<GuessType[]>(
    Array.from({ length: 6 }).fill(initialGuess) as GuessType[]
  );
  const [currentTry, setCurrentTry] = React.useState<number>(0);
  const [selectedSong, setSelectedSong] = React.useState<Song>();
  const [didGuess, setDidGuess] = React.useState<boolean>(false);
  const [todaysSolution, setTodaysSolution] = React.useState<Song | null>(null);

  const firstRun = localStorage.getItem("firstRun") === null;

  function reloadWithoutQueryParameters() {
    location.replace(location.pathname);
  }
  const urlHash = window.location.hash;
  const urlQueryParametersStart = urlHash.indexOf("?");
  const statsImportQueryParameter = new URLSearchParams(urlHash.substring(urlQueryParametersStart)).get('statsImport') || "";
  function importStats () {
    if (statsImportQueryParameter){
      const importedStats = JSON.parse(statsImportQueryParameter)
      if (Array.isArray(importedStats)) {
        importedStats.forEach(day => {
          if (Array.isArray(day.guesses)) {
            if(day.guesses.length == 5){
              day.guesses.push(initialGuess)
            }
          }
        });
      }
      localStorage.setItem("stats", JSON.stringify(importedStats));
      reloadWithoutQueryParameters();
    }
  }
  if (statsImportQueryParameter){
    if (confirm("Do you want to import your previous stats? This will overwrite any stats on this site.")){
      importStats()
    } else {
      reloadWithoutQueryParameters();
    }
  }

  let stats = JSON.parse(localStorage.getItem("stats") || "{}");
  let statsVersion = JSON.parse(localStorage.getItem("version") || "1");

  React.useEffect(() => {
    getDailySolution().then(solution => setTodaysSolution(solution));
  }, []);

  React.useEffect(() => {
    if (Array.isArray(stats)) {
      const visitedToday = _.isEqual(
        todaysSolution,
        stats[stats.length - 1].solution
      );

      if (!visitedToday) {
        stats.push({
          solution: todaysSolution,
          currentTry: 0,
          didGuess: 0,
        });
      } else {
        const { currentTry, guesses, didGuess } = stats[stats.length - 1];
        setCurrentTry(currentTry);
        setGuesses(guesses);
        setDidGuess(didGuess);
      }
    } else {
      stats = [];
      stats.push({
        solution: todaysSolution,
      });
    }
    const currentVersion = 2;
    if (firstRun) {
      statsVersion = currentVersion
    }
    else if (statsVersion < currentVersion) {
      statsVersion = currentVersion;
      if (Array.isArray(stats)) {
        for (let index = 0; index < stats.length; index++) {
          const newGuesses: GuessType[] = [];
          for (let guessIndex = 0; guessIndex < stats[index].guesses.length; guessIndex++) {
            const guess = stats[index].guesses[guessIndex];
            if (guess.skipped !== undefined) {
                let state = undefined;
                if (guess.skipped) {
                  state = GuessState.Skipped;
                } else if (guess.isCorrect){
                  state = GuessState.Correct;
                } else if (guess.isCorrect === false){
                  state = GuessState.Incorrect;
                }
                newGuesses.push({
                  song: guess.song,
                  state: state,
                } as GuessType);
              }
          }
          stats[index].guesses = newGuesses;
        }
      }
    }
  }, []);

  React.useEffect(() => {
    if (Array.isArray(stats)) {
      stats[stats.length - 1].currentTry = currentTry;
      stats[stats.length - 1].didGuess = didGuess;
      stats[stats.length - 1].guesses = guesses;
    }
  }),
    [guesses, currentTry, didGuess];

  React.useEffect(() => {
    localStorage.setItem("stats", JSON.stringify(stats));
  }, [stats]);

  React.useEffect(() => {
    localStorage.setItem("version", JSON.stringify(statsVersion));
  }, [statsVersion]);

  const [isInfoPopUpOpen, setIsInfoPopUpOpen] =
    React.useState<boolean>(firstRun);

  const openInfoPopUp = React.useCallback(() => {
    setIsInfoPopUpOpen(true);
  }, []);

  const closeInfoPopUp = React.useCallback(() => {
    if (firstRun) {
      localStorage.setItem("firstRun", "false");
      setIsInfoPopUpOpen(false);
    } else {
      setIsInfoPopUpOpen(false);
    }
  }, [localStorage.getItem("firstRun")]);

  const skip = React.useCallback(() => {
    setGuesses((guesses: GuessType[]) => {
      const newGuesses = [...guesses];
      newGuesses[currentTry] = {
        song: undefined,
        state: GuessState.Skipped,
      };

      return newGuesses;
    });

    setCurrentTry((currentTry) => currentTry + 1);
  }, [currentTry]);

  const guess = React.useCallback(() => {
    let state = GuessState.Incorrect;
    if (selectedSong === todaysSolution) {
      state = GuessState.Correct;
    } else if (selectedSong?.artist === todaysSolution?.artist) {
      state = GuessState.PartiallyCorrect
    }

    if (!selectedSong) {
      alert("Choose a song");
      return;
    }

    setGuesses((guesses: GuessType[]) => {
      const newGuesses = [...guesses];
      newGuesses[currentTry] = {
        song: selectedSong,
        state: state,
      };

      return newGuesses;
    });

    setCurrentTry((currentTry) => currentTry + 1);
    setSelectedSong(undefined);

    if (state === GuessState.Correct) {
      setDidGuess(true);
    }
  }, [guesses, selectedSong]);

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
          todaysSolution={todaysSolution}
          currentTry={currentTry}
          setSelectedSong={setSelectedSong}
          skip={skip}
          guess={guess}
        />
      </Styled.Container>
      <Footer />
    </main>
  );
}

export default App;

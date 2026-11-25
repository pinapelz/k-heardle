import React from "react";
import { IoSearch } from "react-icons/io5";
import { searchSong } from "../../helpers";
import { Song } from "../../types/song";

import * as Styled from "./index.styled";

interface Props {
  currentTry: number;
  setSelectedSong: React.Dispatch<React.SetStateAction<Song | undefined>>;
  /** Optional override of the song pool to search within. */
  songs?: Song[];
}

export function Search({ currentTry, setSelectedSong, songs }: Props) {
  const [value, setValue] = React.useState("");
  const [results, setResults] = React.useState<Song[]>([]);
  const [selectedIdx, setSelectedIdx] = React.useState(-1);

  const selectSong = (song: Song) => {
    setSelectedSong(song);
    setValue(`${song.artist} - ${song.name}`);
    setResults([]);
    setSelectedIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const songToSelect = selectedIdx >= 0 ? results[selectedIdx] : results[0];
      if (!songToSelect) return;
      selectSong(songToSelect);
      return;
    }

    if (e.key === "Escape") {
      setResults([]);
      setSelectedIdx(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length === 0) return;

      setSelectedIdx((prev) => (prev >= results.length - 1 ? 0 : prev + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length === 0) return;

      setSelectedIdx((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    }
  };

  React.useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      setSelectedIdx(-1);
      return;
    }

    const nextResults = searchSong(value, songs);
    setResults(nextResults);
    setSelectedIdx(-1);
  }, [value, songs]);

  React.useEffect(() => {
    setValue("");
  }, [currentTry]);

  return (
    <Styled.Container>
      <Styled.ResultsContainer>
        {results.map((song, index) => (
          <Styled.Result
            key={song.youtubeId}
            onClick={() => selectSong(song)}
            style={{ textDecoration: index === selectedIdx ? "underline" : undefined }}
          >
            <Styled.ResultText>
              {song.artist} - {song.name}
            </Styled.ResultText>
          </Styled.Result>
        ))}
      </Styled.ResultsContainer>

      <Styled.SearchContainer>
        <Styled.SearchPadding>
          <IoSearch size={20} />
          <Styled.Input
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search"
          />
        </Styled.SearchPadding>
      </Styled.SearchContainer>
    </Styled.Container>
  );
}

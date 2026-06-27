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

  React.useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setResults(searchSong(value, songs));
  }, [value, songs]);

  React.useEffect(() => {
    setValue("");
  }, [currentTry]);

  return (
    <Styled.Container>
      <Styled.ResultsContainer>
        {results.map((song) => (
          <Styled.Result
            key={song.youtubeId}
            onClick={() => {
              setSelectedSong(song);
              setValue(`${song.artist} - ${song.name}`);
              setResults([]);
            }}
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
            placeholder="Search"
          />
        </Styled.SearchPadding>
      </Styled.SearchContainer>
    </Styled.Container>
  );
}

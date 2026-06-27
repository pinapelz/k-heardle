import { songs } from "../../server/data/songs";
import { Song } from "../types/song";

function fuzzyMatch(input: string): string {
  return input.toLowerCase().replace(/[^0-9a-z ]/gi, "");
}

export function searchSong(searchTerm: string, pool?: Song[]): Song[] {
  const normalizedSearch = fuzzyMatch(searchTerm);
  const source = pool ?? songs; //if no pool is provided, use the default k-heardle songs list

  return source
    .filter((song: Song) => {
      const songName = fuzzyMatch(song.name);
      const songArtist = fuzzyMatch(song.artist);

      return (
        songArtist.includes(normalizedSearch) ||
        songName.includes(normalizedSearch)
      );
    })
    .sort(
      (a, b) =>
        a.artist.toLowerCase().localeCompare(b.artist.toLowerCase()) ||
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
}

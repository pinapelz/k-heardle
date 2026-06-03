import { fetchSongs } from "./fetchSongs";
import { Song } from "../types/song";

export async function searchSong(searchTerm: string):  Promise<Song[]>  {
  function fuzzyMatch(input: string){
    return input.toLowerCase().replace(/[^0-9a-z ]/gi, '');
  }
  searchTerm = fuzzyMatch(searchTerm);

  const songs = await fetchSongs();

  return songs
    .filter((song: Song) => {
      const songName = fuzzyMatch(song.name);
      const songArtist = fuzzyMatch(song.artist);

      if (songArtist.includes(searchTerm) || songName.includes(searchTerm)) {
        return song;
      }
    })
    .sort((a, b) =>
      a.artist.toLowerCase().localeCompare(b.artist.toLocaleLowerCase())
       || a.name.toLowerCase().localeCompare(b.name.toLocaleLowerCase())
    );
}

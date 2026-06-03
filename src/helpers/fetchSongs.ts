import { Song } from "../types/song";
let cachedSongs: Song[] | null = null;
function fuzzyMatch(input: string): string {
  return input.toLowerCase().replace(/[^0-9a-z ]/gi, '');
}


export async function fetchSongs(useCache=true): Promise<Song[]> {
  const API_URL = import.meta.env.VITE_HEARDLE_API_URL || "http://localhost:3001";
  if (useCache && cachedSongs) {
    return cachedSongs;
  }

  try {
    const response = await fetch(`${API_URL}/songs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const songsData: Song[] = await response.json();
    cachedSongs = songsData;
    return songsData;
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    throw error;
  }
}

export async function searchSongs(searchTerm: string): Promise<Song[]> {
  const songsToSearch = await fetchSongs();

  const processedSearchTerm = fuzzyMatch(searchTerm);

  const matchingSongs = songsToSearch
    .filter((song: Song) => {
      const songName = fuzzyMatch(song.name);
      const songArtist = fuzzyMatch(song.artist);

      if (songArtist.includes(processedSearchTerm) || songName.includes(processedSearchTerm)) {
        return true;
      }
      return false;
    })
    .sort((a, b) =>
      a.artist.toLowerCase().localeCompare(b.artist.toLocaleLowerCase())
       || a.name.toLowerCase().localeCompare(b.name.toLocaleLowerCase())
    );

  return matchingSongs;
}
export function getCachedSongs(): Song[] | null {
  return cachedSongs;
}

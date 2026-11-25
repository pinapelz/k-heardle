import { songs } from "../data/songs";
import { songs as mvs } from "../data/mvs";
import { writeFile } from "node:fs/promises";


const OEMBED_BASE_URL = 'https://www.youtube.com/oembed';

async function checkYouTubeLink(videoUrl: string): Promise<boolean> {
  const endpoint = `${OEMBED_BASE_URL}?url=${encodeURIComponent(videoUrl)}&format=json`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return false;
    }

    const page = await fetch(videoUrl, { headers: { 'Accept-Language': 'en-US' } });
    const html = await page.text();
    const status = html.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/)?.[1];
  if (status && status !== 'OK') {
      console.log(`Playability status for ${videoUrl}: ${status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error checking YouTube link for ${videoUrl}:`, error);
    return false;
  }
}


async function main(): Promise<void> {
  const totalSongs = songs.length + mvs.length;
  let checkedCount = 0;
  let invalidLinks: { type: string; artist: string; name: string; youtubeId: string }[] = [];
  console.log(`Checking ${totalSongs} YouTube links...`);
  for (const song of songs) {
    console.log(`Checking song: ${song.artist} - ${song.name} (ID: ${song.youtubeId}) (${checkedCount++}/${totalSongs})`);
    const videoUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;
    const isValid = await checkYouTubeLink(videoUrl);
    if (!isValid) {
      console.log(`Invalid YouTube link for song: ${song.artist} - ${song.name} (ID: ${song.youtubeId}) (${checkedCount}/${totalSongs})`);
      invalidLinks.push({ type: 'song', artist: song.artist, name: song.name, youtubeId: song.youtubeId });
    }
  }

  for (const mv of mvs) {
    console.log(`Checking MV: ${mv.artist} - ${mv.name} (ID: ${mv.youtubeId}) (${checkedCount++}/${totalSongs})`);
    const videoUrl = `https://www.youtube.com/watch?v=${mv.youtubeId}`;
    const isValid = await checkYouTubeLink(videoUrl);
    if (!isValid) {
      console.log(`Invalid YouTube link for MV: ${mv.artist} - ${mv.name} (ID: ${mv.youtubeId}) (${checkedCount}/${totalSongs})`);
      invalidLinks.push({ type: 'mv', artist: mv.artist, name: mv.name, youtubeId: mv.youtubeId });
    }
  }

  try {
    await writeFile('invalid_links.json', JSON.stringify(invalidLinks, null, 2));
    console.log(`Invalid links written to invalid_links.json`);
  } catch (error) {
    console.error('Error writing invalid links to file:', error);
  }

}

main();

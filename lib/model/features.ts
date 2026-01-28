import { Song } from "../types";

export interface ComputedFeatures {
  streamVelocity: number;
  recencyBonus: number;
  catalogRank: number;
}

export function computeFeatures(song: Song, allSongs: Song[]): ComputedFeatures {
  // Stream velocity: daily / total (higher = growing faster relative to size)
  const streamVelocity =
    song.spotifyStreams > 0 ? song.spotifyDaily / song.spotifyStreams : 0;

  // Recency bonus based on album year
  const currentYear = 2026;
  const age = currentYear - song.albumYear;
  const recencyBonus = age <= 1 ? 1.2 : age <= 2 ? 1.1 : 1.0;

  // Catalog rank by streams (1 = most streamed)
  const sorted = [...allSongs]
    .filter((s) => s.spotifyStreams > 0)
    .sort((a, b) => b.spotifyStreams - a.spotifyStreams);
  const idx = sorted.findIndex((s) => s.id === song.id);
  const catalogRank = idx >= 0 ? idx + 1 : allSongs.length;

  return { streamVelocity, recencyBonus, catalogRank };
}

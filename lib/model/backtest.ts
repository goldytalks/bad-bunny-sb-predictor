import { Song } from "../types";
import { scoreSong } from "./scoring";

interface HistoricalShow {
  year: number;
  artist: string;
  opener: string;
  isBiggestHit: boolean;
  isCurrentAlbum: boolean;
  isSolo: boolean;
  isUpbeat: boolean;
  energyScore: number;
  bpm: number;
  inPromo: boolean;
  isTourOpener: boolean;
}

export interface BacktestResult {
  year: number;
  artist: string;
  actualOpener: string;
  openerRank: number;
  totalCandidates: number;
  inTop3: boolean;
  openerProbability: number;
  topPrediction: string;
  topProbability: number;
}

// Generate a synthetic catalog for each historical show:
// the actual opener + plausible alternatives with varying features
function buildSyntheticCatalog(show: HistoricalShow): Song[] {
  const songs: Song[] = [];

  // The actual opener
  songs.push({
    id: "opener",
    name: show.opener,
    album: show.isCurrentAlbum ? "Current" : "Older",
    albumYear: show.isCurrentAlbum ? show.year : show.year - 3,
    spotifyStreams: show.isBiggestHit ? 2_500_000_000 : 500_000_000,
    spotifyDaily: 500_000,
    isSolo: show.isSolo,
    featuredArtist: show.isSolo ? null : "Guest Artist",
    bpmEstimate: show.bpm,
    isUpbeat: show.isUpbeat,
    energyScore: show.energyScore,
    inOfficialTrailer: show.inPromo,
    isFromCurrentAlbum: show.isCurrentAlbum,
    tourOpenerCount: show.isTourOpener ? 5 : 0,
    tourPlayCount: 10,
    notes: "",
  });

  // Plausible alternatives: biggest hit (old, mega-streamed)
  songs.push({
    id: "biggest-hit",
    name: "Biggest Hit",
    album: "Classic",
    albumYear: show.year - 5,
    spotifyStreams: 2_500_000_000,
    spotifyDaily: 800_000,
    isSolo: true,
    featuredArtist: null,
    bpmEstimate: 120,
    isUpbeat: true,
    energyScore: 0.80,
    inOfficialTrailer: false,
    isFromCurrentAlbum: false,
    tourOpenerCount: 0,
    tourPlayCount: 15,
    notes: "",
  });

  // Popular collab (feat. artist, high streams)
  songs.push({
    id: "popular-collab",
    name: "Popular Collab",
    album: "Previous",
    albumYear: show.year - 2,
    spotifyStreams: 1_800_000_000,
    spotifyDaily: 600_000,
    isSolo: false,
    featuredArtist: "Famous Artist",
    bpmEstimate: 110,
    isUpbeat: true,
    energyScore: 0.75,
    inOfficialTrailer: false,
    isFromCurrentAlbum: false,
    tourOpenerCount: 0,
    tourPlayCount: 12,
    notes: "",
  });

  // Slow ballad (high streams but wrong vibe)
  songs.push({
    id: "ballad",
    name: "Big Ballad",
    album: "Previous",
    albumYear: show.year - 3,
    spotifyStreams: 1_200_000_000,
    spotifyDaily: 400_000,
    isSolo: true,
    featuredArtist: null,
    bpmEstimate: 80,
    isUpbeat: false,
    energyScore: 0.40,
    inOfficialTrailer: false,
    isFromCurrentAlbum: false,
    tourOpenerCount: 0,
    tourPlayCount: 8,
    notes: "",
  });

  // Current album track (not the opener)
  songs.push({
    id: "current-deep-cut",
    name: "Current Album B-Side",
    album: "Current",
    albumYear: show.year,
    spotifyStreams: 300_000_000,
    spotifyDaily: 200_000,
    isSolo: true,
    featuredArtist: null,
    bpmEstimate: 100,
    isUpbeat: false,
    energyScore: 0.55,
    inOfficialTrailer: false,
    isFromCurrentAlbum: true,
    tourOpenerCount: 0,
    tourPlayCount: 5,
    notes: "",
  });

  // Mid-tier upbeat solo track (decent contender)
  songs.push({
    id: "mid-upbeat",
    name: "Mid Upbeat Track",
    album: "Previous",
    albumYear: show.year - 2,
    spotifyStreams: 700_000_000,
    spotifyDaily: 300_000,
    isSolo: true,
    featuredArtist: null,
    bpmEstimate: 125,
    isUpbeat: true,
    energyScore: 0.82,
    inOfficialTrailer: false,
    isFromCurrentAlbum: false,
    tourOpenerCount: 0,
    tourPlayCount: 10,
    notes: "",
  });

  return songs;
}

export function runBacktest(shows: HistoricalShow[]): BacktestResult[] {
  return shows.map((show) => {
    const catalog = buildSyntheticCatalog(show);
    const scored = catalog
      .map((song) => ({ song, score: scoreSong(song, catalog) }))
      .sort((a, b) => b.score - a.score);

    const total = scored.reduce((s, x) => s + x.score, 0);
    const openerIdx = scored.findIndex((s) => s.song.id === "opener");
    const openerScore = scored[openerIdx]?.score ?? 0;

    return {
      year: show.year,
      artist: show.artist,
      actualOpener: show.opener,
      openerRank: openerIdx + 1,
      totalCandidates: catalog.length,
      inTop3: openerIdx < 3,
      openerProbability: total > 0 ? openerScore / total : 0,
      topPrediction: scored[0].song.name,
      topProbability: total > 0 ? scored[0].score / total : 0,
    };
  });
}

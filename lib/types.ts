export interface Song {
  id: string;
  name: string;
  album: string;
  albumYear: number;
  spotifyStreams: number;
  spotifyDaily: number;
  isSolo: boolean;
  featuredArtist: string | null;
  bpmEstimate: number;
  isUpbeat: boolean;
  energyScore: number;
  inOfficialTrailer: boolean;
  isFromCurrentAlbum: boolean;
  tourOpenerCount: number;
  tourPlayCount: number;
  notes: string;
}

export interface Prediction {
  song: string;
  songId: string;
  probability: number;
  confidence: "high" | "medium" | "low";
  rawScore: number;
  reasoning: string[];
}

export interface MarketPrice {
  song: string;
  songId: string;
  yesBid: number;
  yesAsk: number;
  midpoint: number;
  lastPrice?: number;
  volume?: number;
  source?: "kalshi" | "manual";
}

export interface EdgeAnalysis {
  song: string;
  songId: string;
  ourProbability: number;
  marketProbability: number;
  edge: number;
  signal: "strong-buy" | "buy" | "neutral" | "avoid" | "strong-avoid";
  confidence: "high" | "medium" | "low";
  reasoning: string[];
}

export interface SongData {
  lastUpdated: string;
  songs: Song[];
  marketContext: {
    superBowlDate: string;
    venue: string;
  };
}

import { Song, Prediction } from "../types";

const WEIGHTS = {
  inOfficialTrailer: 0.25,
  isUpbeat: 0.20,
  energyScore: 0.15,
  isFromCurrentAlbum: 0.15,
  tourPlayFrequency: 0.10,
  isSolo: 0.10,
  popularityScore: 0.05,
};

const MEGA_HIT_THRESHOLD = 2_000_000_000;
const MEGA_HIT_PENALTY = 0.65;

function normalizeStreams(streams: number, maxStreams: number): number {
  return Math.min(streams / maxStreams, 1);
}

function normalizeTourPlay(playCount: number, maxPlays: number): number {
  return maxPlays > 0 ? playCount / maxPlays : 0;
}

export function scoreSong(song: Song, allSongs: Song[]): number {
  const maxStreams = Math.max(...allSongs.map((s) => s.spotifyStreams));
  const maxTourPlays = Math.max(...allSongs.map((s) => s.tourPlayCount));

  let score = 0;

  score += WEIGHTS.inOfficialTrailer * (song.inOfficialTrailer ? 1 : 0);
  score += WEIGHTS.isUpbeat * (song.isUpbeat ? 1 : 0);
  score += WEIGHTS.energyScore * song.energyScore;
  score += WEIGHTS.isFromCurrentAlbum * (song.isFromCurrentAlbum ? 1 : 0);
  score += WEIGHTS.tourPlayFrequency * normalizeTourPlay(song.tourPlayCount, maxTourPlays);
  score += WEIGHTS.isSolo * (song.isSolo ? 1 : 0);
  score += WEIGHTS.popularityScore * normalizeStreams(song.spotifyStreams, maxStreams);

  // Tour opener bonus
  if (song.tourOpenerCount > 0) {
    score *= 1 + 0.15 * (song.tourOpenerCount / 10);
  }

  // Mega-hit penalty: biggest hits are saved for later in set
  const isTopHit = song.spotifyStreams > 1_500_000_000;
  if (song.spotifyStreams > MEGA_HIT_THRESHOLD && isTopHit) {
    score *= MEGA_HIT_PENALTY;
  } else if (isTopHit && !song.isFromCurrentAlbum) {
    score *= 0.80;
  }

  // Non-solo penalty (guest logistics at SB)
  if (!song.isSolo) {
    score *= 0.50;
  }

  return score;
}

function generateReasoning(song: Song): string[] {
  const reasons: string[] = [];
  if (song.inOfficialTrailer) reasons.push("Featured in official Super Bowl trailer");
  if (song.isUpbeat) reasons.push("High-energy opener suitable");
  if (song.isFromCurrentAlbum) reasons.push("From current album (promotional advantage)");
  if (song.tourOpenerCount > 0) reasons.push(`Opened ${song.tourOpenerCount} tour shows`);
  if (!song.isSolo) reasons.push(`Requires guest: ${song.featuredArtist}`);
  if (song.spotifyStreams > MEGA_HIT_THRESHOLD) reasons.push("Mega-hit penalty (historically saved for later)");
  if (song.energyScore >= 0.85) reasons.push("Very high energy score");
  return reasons;
}

export function generatePredictions(songs: Song[]): Prediction[] {
  const scored = songs.map((song) => ({
    song,
    rawScore: scoreSong(song, songs),
  }));

  const totalScore = scored.reduce((sum, s) => sum + s.rawScore, 0);

  return scored
    .map(({ song, rawScore }) => {
      const probability = totalScore > 0 ? rawScore / totalScore : 0;
      return {
        song: song.name,
        songId: song.id,
        probability: Math.round(probability * 1000) / 1000,
        rawScore: Math.round(rawScore * 1000) / 1000,
        confidence: (probability > 0.15 ? "high" : probability > 0.05 ? "medium" : "low") as Prediction["confidence"],
        reasoning: generateReasoning(song),
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

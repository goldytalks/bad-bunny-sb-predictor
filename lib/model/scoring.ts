import { Song, Prediction } from "../types";
import { computeFeatures } from "./features";

// Likelihood ratios derived from 20 Super Bowl halftime openers (2006-2025).
// LR = P(feature | opener) / P(feature | random catalog song)
const LIKELIHOOD_RATIOS = {
  isSolo: 1.5,            // 90% of openers solo vs ~60% of catalog
  isCurrentAlbum: 4.1,    // 45% of openers from current album vs ~11% of catalog
  isUpbeat: 1.36,         // 95% of openers upbeat vs ~70% of catalog
  highEnergy: 1.9,        // 95% of openers high energy (>=0.7) vs ~50% of catalog
  inOfficialTrailer: 10,  // ~15% of openers in promo vs ~1% of catalog
  isTourOpener: 8,        // ~45% of openers were tour openers vs ~5% of catalog
};

// Penalties based on historical rates. Only 2/20 openers were the artist's biggest hit,
// and both were from the current album cycle. Old mega-hits almost never open.
// These do NOT compound — we pick the single dominant penalty.
const PENALTIES = {
  megaHitOldCatalog: 0.30, // >2B streams, not current album: only ~1/20 old mega-hit opened
  topHitOldCatalog: 0.50,  // >1.5B streams, not current album
  nonSolo: 0.67,           // inverse of 1.5x solo LR, applied as penalty instead
};

const MEGA_HIT_THRESHOLD = 2_000_000_000;
const TOP_HIT_THRESHOLD = 1_500_000_000;

function isHighEnergy(energyScore: number): boolean {
  return energyScore >= 0.7;
}

export function scoreSong(song: Song, allSongs: Song[]): number {
  const features = computeFeatures(song, allSongs);

  // Start with prior odds of 1 (uniform prior across catalog)
  let logOdds = 0;

  // Apply likelihood ratios as additive log-odds
  if (song.isSolo) logOdds += Math.log(LIKELIHOOD_RATIOS.isSolo);
  if (song.isFromCurrentAlbum) logOdds += Math.log(LIKELIHOOD_RATIOS.isCurrentAlbum);
  if (song.isUpbeat) logOdds += Math.log(LIKELIHOOD_RATIOS.isUpbeat);
  if (isHighEnergy(song.energyScore)) logOdds += Math.log(LIKELIHOOD_RATIOS.highEnergy);
  if (song.inOfficialTrailer) logOdds += Math.log(LIKELIHOOD_RATIOS.inOfficialTrailer);
  if (song.tourOpenerCount > 0) logOdds += Math.log(LIKELIHOOD_RATIOS.isTourOpener);

  // Convert back to odds, then apply penalty
  let odds = Math.exp(logOdds);

  // Recency bonus from feature engineering
  odds *= features.recencyBonus;

  // Apply the SINGLE dominant penalty (no compounding)
  const isMegaHitOld = song.spotifyStreams > MEGA_HIT_THRESHOLD && !song.isFromCurrentAlbum;
  const isTopHitOld = song.spotifyStreams > TOP_HIT_THRESHOLD && !song.isFromCurrentAlbum;
  const isNonSolo = !song.isSolo;

  if (isMegaHitOld) {
    odds *= PENALTIES.megaHitOldCatalog;
  } else if (isTopHitOld) {
    odds *= PENALTIES.topHitOldCatalog;
  } else if (isNonSolo) {
    odds *= PENALTIES.nonSolo;
  }

  return odds;
}

function generateReasoning(song: Song): string[] {
  const reasons: string[] = [];
  if (song.inOfficialTrailer)
    reasons.push("In official SB trailer (10x likelihood ratio — 3/20 openers were in promos vs ~1% base rate)");
  if (song.isFromCurrentAlbum)
    reasons.push("Current album (4.1x LR — 9/20 openers from current album vs ~11% base rate)");
  if (song.tourOpenerCount > 0)
    reasons.push(`Tour opener ${song.tourOpenerCount}x (8x LR — 9/20 openers were tour openers vs ~5% base rate)`);
  if (isHighEnergy(song.energyScore))
    reasons.push(`High energy ${song.energyScore.toFixed(2)} (1.9x LR — 19/20 openers had energy >= 0.7)`);
  if (song.isUpbeat)
    reasons.push("Upbeat (1.36x LR — 19/20 openers were upbeat)");
  if (song.isSolo)
    reasons.push("Solo track (1.5x LR — 18/20 openers were solo)");

  // Penalty reasons
  if (song.spotifyStreams > MEGA_HIT_THRESHOLD && !song.isFromCurrentAlbum)
    reasons.push("Mega-hit penalty x0.30 (only 1/20 openers was an old mega-hit)");
  else if (song.spotifyStreams > TOP_HIT_THRESHOLD && !song.isFromCurrentAlbum)
    reasons.push("Top-hit penalty x0.50 (old catalog hits rarely open)");
  else if (!song.isSolo)
    reasons.push(`Non-solo penalty x0.67 (requires ${song.featuredArtist}; only 2/20 openers had guests)`);

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

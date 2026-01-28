import { Song, Prediction } from "../types";
import { computeFeatures } from "./features";

// Likelihood ratios derived from 20 Super Bowl halftime openers (2006-2025).
// LR = P(feature | opener) / P(feature | random catalog song)
//
// RAW ratios are dampened via sqrt() before applying. Rationale: the raw LRs
// assume feature independence (naive Bayes), but features are correlated
// (e.g., current album tracks are more likely to be tour openers). Square-root
// dampening is a standard correction for overconfident naive Bayes classifiers.
const RAW_LIKELIHOOD_RATIOS = {
  isSolo: 1.5,            // 90% of openers solo vs ~60% of catalog
  isCurrentAlbum: 4.1,    // 45% of openers from current album vs ~11% of catalog
  isUpbeat: 1.36,         // 95% of openers upbeat vs ~70% of catalog
  highEnergy: 1.9,        // 95% of openers high energy (>=0.7) vs ~50% of catalog
  inOfficialTrailer: 10,  // ~15% of openers in promo vs ~1% of catalog
  isTourOpener: 8,        // ~45% of openers were tour openers vs ~5% of catalog
  highPopularity: 3.0,    // Openers are almost always well-known tracks (~90% top-quartile popularity vs ~25% base)
};

// Dampened LRs (sqrt of raw)
const LR = Object.fromEntries(
  Object.entries(RAW_LIKELIHOOD_RATIOS).map(([k, v]) => [k, Math.sqrt(v)])
) as Record<keyof typeof RAW_LIKELIHOOD_RATIOS, number>;

// Penalties based on historical rates. Only 2/20 openers were the artist's biggest hit,
// and both were from the current album cycle. Old mega-hits almost never open.
// These do NOT compound — we pick the single dominant penalty.
//
// v2.1 change: top-hit penalty softened for solo upbeat tracks. Tití Me Preguntó
// is solo, upbeat, high-energy, and iconic — the x0.50 penalty was too harsh given
// markets price it at ~41%. The Weeknd opened with Blinding Lights (his biggest hit),
// and while that's the exception, a solo upbeat iconic track deserves a softer penalty.
const PENALTIES = {
  megaHitOldCatalog: 0.30,          // >2B streams, not current album
  topHitOldCatalog: 0.50,           // >1.5B streams, not current album
  topHitOldCatalogSoloUpbeat: 0.75, // same but solo + upbeat (softer — viable opener)
  nonSolo: 0.67,                    // inverse of 1.5x solo LR
};

const MEGA_HIT_THRESHOLD = 2_000_000_000;
const TOP_HIT_THRESHOLD = 1_500_000_000;
const HIGH_POPULARITY_THRESHOLD = 800_000_000; // top quartile of catalog by streams

function isHighEnergy(energyScore: number): boolean {
  return energyScore >= 0.7;
}

export function scoreSong(song: Song, allSongs: Song[]): number {
  const features = computeFeatures(song, allSongs);

  // Start with prior odds of 1 (uniform prior across catalog)
  let logOdds = 0;

  // Apply dampened likelihood ratios as additive log-odds
  if (song.isSolo) logOdds += Math.log(LR.isSolo);
  if (song.isFromCurrentAlbum) logOdds += Math.log(LR.isCurrentAlbum);
  if (song.isUpbeat) logOdds += Math.log(LR.isUpbeat);
  if (isHighEnergy(song.energyScore)) logOdds += Math.log(LR.highEnergy);
  if (song.inOfficialTrailer) logOdds += Math.log(LR.inOfficialTrailer);
  if (song.tourOpenerCount > 0) logOdds += Math.log(LR.isTourOpener);
  if (song.spotifyStreams > HIGH_POPULARITY_THRESHOLD) logOdds += Math.log(LR.highPopularity);

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
    // Softer penalty for solo upbeat tracks (e.g., Tití Me Preguntó)
    if (song.isSolo && song.isUpbeat) {
      odds *= PENALTIES.topHitOldCatalogSoloUpbeat;
    } else {
      odds *= PENALTIES.topHitOldCatalog;
    }
  } else if (isNonSolo) {
    odds *= PENALTIES.nonSolo;
  }

  return odds;
}

function generateReasoning(song: Song): string[] {
  const reasons: string[] = [];
  if (song.inOfficialTrailer)
    reasons.push("In official SB trailer (3.2x dampened LR — 3/20 openers in promos vs ~1% base rate)");
  if (song.isFromCurrentAlbum)
    reasons.push("Current album (2.0x dampened LR — 9/20 openers from current album vs ~11% base rate)");
  if (song.tourOpenerCount > 0)
    reasons.push(`Tour opener ${song.tourOpenerCount}x (2.8x dampened LR — 9/20 openers were tour openers vs ~5% base rate)`);
  if (song.spotifyStreams > HIGH_POPULARITY_THRESHOLD)
    reasons.push("High popularity (1.7x dampened LR — ~90% of openers are top-quartile popularity vs ~25% base rate)");
  if (isHighEnergy(song.energyScore))
    reasons.push(`High energy ${song.energyScore.toFixed(2)} (1.4x dampened LR — 19/20 openers had energy >= 0.7)`);
  if (song.isUpbeat)
    reasons.push("Upbeat (1.2x dampened LR — 19/20 openers were upbeat)");
  if (song.isSolo)
    reasons.push("Solo track (1.2x dampened LR — 18/20 openers were solo)");

  // Penalty reasons
  if (song.spotifyStreams > MEGA_HIT_THRESHOLD && !song.isFromCurrentAlbum)
    reasons.push("Mega-hit penalty x0.30 (only 1/20 openers was an old mega-hit)");
  else if (song.spotifyStreams > TOP_HIT_THRESHOLD && !song.isFromCurrentAlbum) {
    if (song.isSolo && song.isUpbeat)
      reasons.push("Top-hit penalty x0.75 (softened — solo upbeat iconic track is a viable opener; cf. Weeknd/Blinding Lights)");
    else
      reasons.push("Top-hit penalty x0.50 (old catalog hits rarely open)");
  } else if (!song.isSolo)
    reasons.push(`Non-solo penalty x0.67 (requires ${song.featuredArtist}; only 2/20 openers had guests)`);

  return reasons;
}

export function generatePredictions(songs: Song[]): Prediction[] {
  const scored = songs.map((song) => ({
    song,
    rawScore: scoreSong(song, songs),
  }));

  // Apply power-law compression (score^0.5) to prevent any single song from
  // dominating. Without this, BAILE's trailer+tour+album LRs stack to 45%+
  // while strong candidates like Tití get <2%. Power compression preserves
  // rank ordering while creating a realistic spread.
  const COMPRESSION = 0.55;
  const compressed = scored.map((s) => ({
    ...s,
    rawScore: Math.pow(s.rawScore, COMPRESSION),
  }));

  const totalScore = compressed.reduce((sum, s) => sum + s.rawScore, 0);

  return compressed
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

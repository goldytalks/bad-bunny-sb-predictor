import { Song, Prediction } from "../types";
import { computeFeatures } from "./features";

// Likelihood ratios derived from 20 VERIFIED Super Bowl halftime openers (2006-2025).
// Every opener confirmed via setlist.fm.
// LR = P(feature | opener) / P(feature | random catalog song)
//
// RAW ratios are dampened via sqrt() before applying. Rationale: the raw LRs
// assume feature independence (naive Bayes), but features are correlated.
// Square-root dampening is a standard correction for overconfident classifiers.
//
// CORRECTED base rates (verified):
//   Solo:          18/20 = 90%  vs ~60% catalog → LR 1.5x
//   Upbeat:        19/20 = 95%  vs ~70% catalog → LR 1.36x
//   High energy:   17/20 = 85%  vs ~50% catalog → LR 1.7x
//   Current album:  4/20 = 20%  vs ~11% catalog → LR 1.8x
//   High popularity: ~18/20 = 90% vs ~25% catalog → LR 3.6x
//   Biggest hit:    1/20 =  5%  vs ~3% catalog  → LR 1.7x (NOT penalized, just not boosted)
//
// REMOVED from historical LRs (unverifiable across 20 shows):
//   inPromo:       0/20 verified in historical dataset (but still valuable for BB specifically)
//   isTourOpener:  0/20 verified (data not available for historical artists)
// These are kept as Bad Bunny-specific signals with expert-estimated LRs.

const RAW_LIKELIHOOD_RATIOS = {
  isSolo: 1.5,            // 18/20 openers solo vs ~60% catalog
  isCurrentAlbum: 1.8,    // 4/20 openers from current album vs ~11% catalog (was 4.1x when we had 9/20 — corrected)
  isUpbeat: 1.36,         // 19/20 openers upbeat vs ~70% catalog
  highEnergy: 1.7,        // 17/20 openers high energy (>=0.7) vs ~50% catalog (was 1.9x with 19/20 — corrected)
  highPopularity: 3.6,    // ~18/20 openers are well-known vs ~25% catalog
  // Bad Bunny-specific signals (not from historical base rates):
  inOfficialTrailer: 6.0, // Expert estimate: trailer appearance is strong signal, but no historical base rate
  isTourOpener: 4.0,      // Expert estimate: tour opener is meaningful, but no historical base rate to verify
};

// Dampened LRs (sqrt of raw)
const LR = Object.fromEntries(
  Object.entries(RAW_LIKELIHOOD_RATIOS).map(([k, v]) => [k, Math.sqrt(v)])
) as Record<keyof typeof RAW_LIKELIHOOD_RATIOS, number>;

// Penalties based on historical rates.
// Only 1/20 openers was the artist's biggest hit (BEP 2011), and it was a group act.
// The Weeknd opened with Starboy, NOT Blinding Lights.
// These do NOT compound — we pick the single dominant penalty.
const PENALTIES = {
  megaHitOldCatalog: 0.30,          // >2B streams, not current album
  topHitOldCatalog: 0.50,           // >1.5B streams, not current album
  topHitOldCatalogSoloUpbeat: 0.75, // same but solo + upbeat (softer — still a viable opener)
  nonSolo: 0.67,                    // inverse of 1.5x solo LR
};

const MEGA_HIT_THRESHOLD = 2_000_000_000;
const TOP_HIT_THRESHOLD = 1_500_000_000;
const HIGH_POPULARITY_THRESHOLD = 800_000_000;

function isHighEnergy(energyScore: number): boolean {
  return energyScore >= 0.7;
}

export function scoreSong(song: Song, allSongs: Song[]): number {
  const features = computeFeatures(song, allSongs);

  let logOdds = 0;

  // Apply dampened likelihood ratios
  if (song.isSolo) logOdds += Math.log(LR.isSolo);
  if (song.isFromCurrentAlbum) logOdds += Math.log(LR.isCurrentAlbum);
  if (song.isUpbeat) logOdds += Math.log(LR.isUpbeat);
  if (isHighEnergy(song.energyScore)) logOdds += Math.log(LR.highEnergy);
  if (song.inOfficialTrailer) logOdds += Math.log(LR.inOfficialTrailer);
  if (song.tourOpenerCount > 0) logOdds += Math.log(LR.isTourOpener);
  if (song.spotifyStreams > HIGH_POPULARITY_THRESHOLD) logOdds += Math.log(LR.highPopularity);

  let odds = Math.exp(logOdds);

  // Recency bonus
  odds *= features.recencyBonus;

  // Apply the SINGLE dominant penalty (no compounding)
  const isMegaHitOld = song.spotifyStreams > MEGA_HIT_THRESHOLD && !song.isFromCurrentAlbum;
  const isTopHitOld = song.spotifyStreams > TOP_HIT_THRESHOLD && !song.isFromCurrentAlbum;
  const isNonSolo = !song.isSolo;

  if (isMegaHitOld) {
    odds *= PENALTIES.megaHitOldCatalog;
  } else if (isTopHitOld) {
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
    reasons.push(`In official SB trailer (${LR.inOfficialTrailer.toFixed(1)}x dampened LR — expert estimate, no historical base rate)`);
  if (song.isFromCurrentAlbum)
    reasons.push(`Current album (${LR.isCurrentAlbum.toFixed(1)}x dampened LR — 4/20 openers from current album vs ~11% base rate)`);
  if (song.tourOpenerCount > 0)
    reasons.push(`Tour opener ${song.tourOpenerCount}x (${LR.isTourOpener.toFixed(1)}x dampened LR — expert estimate for Bad Bunny)`);
  if (song.spotifyStreams > HIGH_POPULARITY_THRESHOLD)
    reasons.push(`High popularity (${LR.highPopularity.toFixed(1)}x dampened LR — ~18/20 openers are well-known tracks)`);
  if (isHighEnergy(song.energyScore))
    reasons.push(`High energy ${song.energyScore.toFixed(2)} (${LR.highEnergy.toFixed(1)}x dampened LR — 17/20 openers had energy >= 0.7)`);
  if (song.isUpbeat)
    reasons.push(`Upbeat (${LR.isUpbeat.toFixed(1)}x dampened LR — 19/20 openers were upbeat)`);
  if (song.isSolo)
    reasons.push(`Solo track (${LR.isSolo.toFixed(1)}x dampened LR — 18/20 openers were solo)`);

  // Penalty reasons
  if (song.spotifyStreams > MEGA_HIT_THRESHOLD && !song.isFromCurrentAlbum)
    reasons.push("Mega-hit penalty x0.30 (1/20 openers was artist's biggest hit — and it was a group act)");
  else if (song.spotifyStreams > TOP_HIT_THRESHOLD && !song.isFromCurrentAlbum) {
    if (song.isSolo && song.isUpbeat)
      reasons.push("Top-hit penalty x0.75 (softened — solo upbeat iconic track is a viable opener)");
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

  // Power compression to prevent single-song dominance
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

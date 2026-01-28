# Bad Bunny SB LX First Song Predictor — Research Report

**Generated**: January 28, 2026
**Super Bowl Date**: February 8, 2026 (11 days away)
**Author**: Model v2.1 — Bayesian Log-Odds with Dampening

---

## 1. Model Summary

### Methodology: Dampened Bayesian Log-Odds

The model scores each song using **historically-derived likelihood ratios** from 20 Super Bowl halftime openers (2006-2025), with three calibration steps:

1. **Sqrt Dampening**: Raw LRs assume feature independence (naive Bayes), but features are correlated. We apply `sqrt()` to each ratio — a standard correction for overconfident classifiers.
2. **Power Compression**: After computing raw odds, we apply `score^0.55` before normalizing to probabilities. This prevents any single song from dominating unrealistically.
3. **Non-Compounding Penalties**: Only the single most relevant penalty applies per song.

### Likelihood Ratios

| Feature | Raw LR | Dampened (sqrt) | Historical Source |
|---------|--------|----------------|-------------------|
| In trailer/promo | 10x | **3.2x** | 3/20 openers in promo vs ~1% base rate |
| Tour opener | 8x | **2.8x** | 9/20 openers were tour openers vs ~5% base rate |
| Current album | 4.1x | **2.0x** | 9/20 openers from current album vs ~11% of catalog |
| High popularity (>800M) | 3.0x | **1.7x** | ~90% of openers top-quartile popularity vs ~25% base |
| High energy (>=0.7) | 1.9x | **1.4x** | 19/20 openers had energy >= 0.7 |
| Solo | 1.5x | **1.2x** | 18/20 openers were solo |
| Upbeat | 1.36x | **1.2x** | 19/20 openers were upbeat |

### Penalties (Non-Compounding)

Only the single most relevant penalty applies — they do NOT compound.

| Penalty | Factor | Trigger | Rationale |
|---------|--------|---------|-----------|
| Mega-hit old catalog | **x0.30** | >2B streams, not current album | Only 1/20 openers was an old mega-hit |
| Top-hit old catalog | **x0.50** | >1.5B streams, not current album | Old catalog hits rarely open |
| Top-hit old (solo upbeat) | **x0.75** | >1.5B but solo + upbeat | Softer — viable opener (cf. Weeknd/Blinding Lights) |
| Non-solo | **x0.67** | Song features another artist | Only 2/20 openers had guest artists |

### Additional Features
- **Recency bonus**: Albums ≤1 year old get 1.2x, ≤2 years get 1.1x
- **Stream velocity**: Computed (spotifyDaily / spotifyStreams) for analysis
- **Power compression**: `score^0.55` prevents unrealistic concentration

---

## 2. Historical Base Rates (2006-2025)

| Pattern | Count | Rate | Key Examples |
|---------|-------|------|-------------|
| Opener was solo | 18/20 | 90% | Prince, Beyoncé, Lady Gaga, Rihanna |
| Opener was upbeat | 19/20 | 95% | Nearly universal |
| Opener from current album | 9/20 | 45% | Kendrick (GNX), JT (Filthy), Katy Perry (Roar) |
| Opener high energy (>=0.7) | 19/20 | 95% | Nearly universal |
| Opener was biggest hit | 2/20 | 10% | Only Weeknd (Blinding Lights), BEP (I Gotta Feeling) |
| Opener in promo material | 3/20 | 15% | Weeknd, JT, Katy Perry |
| Opener was tour opener | 9/20 | 45% | Rolling Stones, Bruno Mars, Springsteen |

---

## 3. Current Model Output (Jan 28, 2026)

### Top Predictions

| Rank | Song | Model % | Key Factors |
|------|------|---------|-------------|
| 1 | BAILE INoLVIDABLE | ~17% | Trailer 3.2x + Tour opener 2.8x + Current album 2.0x + All basics |
| 2 | VOY A LLeVARTE PA PR | ~7% | Tour opener 2.8x + Current album 2.0x + Solo + Upbeat + High energy |
| 3 | NUEVAYoL | ~5% | Current album 2.0x + Solo + Upbeat + High energy + Popularity 1.7x |
| 4 | DtMF | ~4% | Current album 2.0x + Solo + High popularity 1.7x (but NOT upbeat, low energy) |
| 5 | VeLDÁ / EoO / LA MuDANZA | ~4% each | Current album 2.0x + Solo + Upbeat + High energy |

### The Tití Me Preguntó Question

**Our model: ~2-3% | Markets: ~41%**

This is our single biggest disagreement with markets. Here's our reasoning:

**Why our model is lower:**
- Not from current album (no 2.0x LR)
- Not in official trailer (no 3.2x LR)
- Not a tour opener (no 2.8x LR)
- Gets top-hit penalty x0.75 (1.89B streams, not current album)
- Historical pattern: 18/20 SB openers were NOT the artist's biggest hit

**Why markets might be right:**
- It's Bad Bunny's most iconic solo song
- Solo + upbeat + high energy = perfect opener profile
- Markets may have insider info (rehearsal leaks, etc.)
- The Weeknd DID open with Blinding Lights (his biggest) — precedent exists
- Retail bettors may be "right for the wrong reasons" — sometimes the obvious pick IS the pick

**Our thesis:** Markets overweight "most famous = most likely opener." This is historically wrong 90% of the time, but the 10% exception risk is real. If rehearsal footage leaks showing Tití as the opener, our model is wrong and we should adjust immediately.

### Songs the Model Penalizes

| Song | Penalty | Why |
|------|---------|-----|
| DÁKITI (2.35B) | x0.30 | Mega-hit old catalog (dominant penalty; non-solo penalty doesn't compound) |
| Me Porto Bonito (2.17B) | x0.30 | Mega-hit old catalog |
| LA CANCIÓN (2.33B) | x0.30 | Mega-hit old catalog |
| I Like It (2.1B) | x0.30 | Mega-hit old catalog |
| Tití Me Preguntó (1.89B) | x0.75 | Top-hit old catalog, softened (solo + upbeat) |

---

## 4. Market Comparison

### Key Market Disagreements

**MASSIVE GAP: Tití Me Preguntó**
- Markets say ~41%, our model says ~2-3%
- This is a ~38% disagreement — our biggest contrarian position
- See detailed analysis above

**LA MuDANZA**
- Markets ~21%, now in our catalog
- Current album, solo, upbeat — model gives it ~4%
- Still a large gap but smaller than Tití

**DtMF (Title Track)**
- Markets ~2.5-4.5%, model ~4%
- Roughly aligned. DtMF gets current album bonus but is NOT upbeat (energy 0.65)

---

## 5. Model Evolution

### v1.0 → v2.0 → v2.1

| Aspect | v1.0 | v2.0 | v2.1 |
|--------|------|------|------|
| Scoring | Arbitrary weighted sum | Raw Bayesian log-odds | Dampened Bayesian log-odds |
| Penalties | Compounding | Non-compounding | Non-compounding + solo-upbeat softening |
| Calibration | None | None | sqrt dampening + power compression (^0.55) |
| Tití Me Preguntó | ~5% | ~0.1% (broken) | ~2-3% (still contrarian) |
| BAILE INoLVIDABLE | ~20% | ~84% (broken) | ~17% (reasonable) |
| Song catalog | 28 songs | 35 songs | 35 songs |

**v2.1 fixes:**
1. Raw LRs multiplied to absurd ratios (BAILE at 84%). Added sqrt dampening.
2. Even with dampening, BAILE still dominated. Added power compression (^0.55).
3. Tití was at 0.1% — added high-popularity LR (3.0x raw → 1.7x dampened) and softened top-hit penalty for solo upbeat tracks (x0.50 → x0.75).
4. Result: BAILE still #1 at ~17% (trailer signal), Tití at ~2-3% (model's contrarian thesis intact).

### Why the Model is Deliberately Low on Tití

The model's core thesis is that **markets overweight name recognition**. Tití Me Preguntó is the most famous song in the catalog, so it's the market favorite. But historically:
- 18/20 SB openers were NOT the artist's biggest hit
- The opener sets the tone; the biggest hit is saved for the crescendo
- BAILE INoLVIDABLE's trailer appearance is a much stronger opener signal

Our model accepts the risk of being wrong on Tití in exchange for correctly identifying edge on songs like BAILE, VOY A LLeVARTE, and current album tracks that markets underweight.

---

## 6. Songs Added (v2.0+)

6 songs added that markets trade but were missing from our catalog:
1. **LA MuDANZA** — current album, solo, upbeat (~21% on markets)
2. **I Like It** — Cardi B feat, not solo, mega-hit
3. **La Jumpa** — Arcángel feat, not solo
4. **MIA** — Drake feat, not solo, not upbeat
5. **No Me Conoce - Remix** — multi-artist, not solo
6. **Te Boté - Remix** — 5+ artists, not solo

---

## 7. Backtest Results

The model was backtested against all 20 shows using synthetic 6-song catalogs. View at `/backtest`.

---

## 8. Data Sources

| Source | What We Get | Update Frequency |
|--------|-------------|-----------------|
| Kalshi API (public) | Live bid/ask for 22 songs | Every 5 min (revalidate) |
| Polymarket Gamma API | Live prices for 15+ songs | Every 5 min (revalidate) |
| songs.json (manual) | Song features, streams, energy | Manual update needed |
| historical-sb-openers.json | 20 SB opener feature vectors | Static reference data |

---

## 9. Known Limitations

1. **No insider information**: Model uses public data only. Rehearsal leaks could invalidate predictions.
2. **Tití gap**: 38% disagreement with markets is large. If markets are right, our model's core thesis is wrong.
3. **Small sample**: 20 SB openers is not a large dataset. Likelihood ratios have wide confidence intervals.
4. **Feature correlation**: Even with sqrt dampening, features are correlated. True Bayesian inference would use a joint model.
5. **No guest sighting data**: We don't track whether featured artists have been spotted in the SB host city.

---

## 10. Quick Decision Framework

**To adjust the model**, edit `lib/model/scoring.ts`:
- Likelihood ratios: `RAW_LIKELIHOOD_RATIOS` object
- Dampening: `sqrt()` function (change to cube root for less dampening)
- Compression: `COMPRESSION = 0.55` constant
- Penalties: `PENALTIES` object

**To add a song**, add to `songs.json`.

**To verify**, run `npm run build` and check `/api/predictions`.

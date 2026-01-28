# Bad Bunny SB LX First Song Predictor — Research Report

**Generated**: January 28, 2026
**Super Bowl Date**: February 8, 2026 (11 days away)
**Author**: Model v2.0 — Bayesian Log-Odds

---

## 1. Model Summary

### Methodology: Bayesian Log-Odds
The model replaces arbitrary feature weights with **historically-derived likelihood ratios** from 20 Super Bowl halftime openers (2006-2025).

Each feature's importance is measured as: **LR = P(feature | opener) / P(feature | random catalog song)**

These ratios are combined as additive log-odds (multiplicative in odds-space), then normalized to probabilities.

### Likelihood Ratios

| Feature | P(feature\|opener) | P(feature\|catalog) | LR | Source |
|---------|-------------------|--------------------|----|--------|
| In trailer/promo | 15% (3/20) | ~1% | **10x** | Historical SB data |
| Tour opener | 45% (9/20) | ~5% | **8x** | Historical SB data |
| Current album | 45% (9/20) | ~11% | **4.1x** | Historical SB data |
| High energy (>=0.7) | 95% (19/20) | ~50% | **1.9x** | Historical SB data |
| Solo | 90% (18/20) | ~60% | **1.5x** | Historical SB data |
| Upbeat | 95% (19/20) | ~70% | **1.36x** | Historical SB data |

### Penalties (Non-Compounding)

Only the single most relevant penalty applies — they do NOT compound.

| Penalty | Factor | Trigger | Rationale |
|---------|--------|---------|-----------|
| Mega-hit old catalog | **x0.30** | >2B streams, not current album | Only 1/20 openers was an old mega-hit |
| Top-hit old catalog | **x0.50** | >1.5B streams, not current album | Old catalog hits rarely open |
| Non-solo | **x0.67** | Song features another artist | Only 2/20 openers had guest artists |

### Additional Features
- **Recency bonus**: Albums ≤1 year old get 1.2x, ≤2 years get 1.1x
- **Stream velocity**: Computed but used for analysis only (spotifyDaily / spotifyStreams)

---

## 2. Historical Base Rates (2006-2025)

| Pattern | Count | Rate | Key Examples |
|---------|-------|------|-------------|
| Opener was solo | 18/20 | 90% | Prince, Beyoncé, Lady Gaga, Rihanna |
| Opener was upbeat | 19/20 | 95% | Nearly universal — only exception is borderline |
| Opener from current album | 9/20 | 45% | Kendrick (GNX), JT (Filthy), Katy Perry (Roar) |
| Opener high energy (>=0.7) | 19/20 | 95% | Nearly universal |
| Opener was biggest hit | 2/20 | 10% | Only Weeknd (Blinding Lights), BEP (I Gotta Feeling) |
| Opener in promo material | 3/20 | 15% | Weeknd, JT, Katy Perry |
| Opener was tour opener | 9/20 | 45% | Rolling Stones, Bruno Mars, Springsteen |

---

## 3. Backtest Results

The model was backtested against all 20 shows using synthetic 6-song catalogs for each artist (actual opener + 5 archetypes: biggest old hit, popular collab, slow ballad, current deep cut, mid-tier upbeat).

**Target: >50% top-3 accuracy**

View results at `/backtest`.

---

## 4. Current Model Output (Jan 28, 2026)

### Top Predictions

| Rank | Song | Key Likelihood Ratios |
|------|------|-----------------------|
| 1 | BAILE INoLVIDABLE | Trailer 10x + Current album 4.1x + Tour opener 8x + Solo 1.5x + Upbeat 1.36x + High energy 1.9x |
| 2 | VOY A LLeVARTE PA PR | Tour opener 8x + Current album 4.1x + Solo 1.5x + Upbeat 1.36x + High energy 1.9x |
| 3 | LA MuDANZA | Current album 4.1x + Solo 1.5x + Upbeat 1.36x + High energy 1.9x |
| 4 | NUEVAYoL | Current album 4.1x + Solo 1.5x + Upbeat 1.36x + High energy 1.9x |
| 5 | EoO | Current album 4.1x + Solo 1.5x + Upbeat 1.36x + High energy 1.9x |

### Songs the Model Penalizes

| Song | Penalty | Why |
|------|---------|-----|
| DÁKITI (2.35B) | x0.30 | Mega-hit old catalog (dominant penalty; non-solo penalty doesn't compound) |
| Me Porto Bonito (2.17B) | x0.30 | Mega-hit old catalog |
| LA CANCIÓN (2.33B) | x0.30 | Mega-hit old catalog |
| I Like It (2.1B) | x0.30 | Mega-hit old catalog |
| Tití Me Preguntó (1.89B) | x0.50 | Top-hit old catalog (solo, so no non-solo penalty) |

---

## 5. Market Comparison

### Key Market Disagreements

**Tití Me Preguntó**: Markets ~41-43%, our model much lower. Our model applies a x0.50 penalty for being a 1.89B-stream song from 2022. Markets may be overweighting name recognition. This is our biggest contrarian position.

**LA MuDANZA**: Now in our catalog. Markets ~21%. Our model should price it competitively given it's current album, solo, upbeat.

**DtMF**: Markets ~2.5-4.5%. Our model gives it current album bonus (4.1x) but it's NOT upbeat and energy is 0.65 (below 0.7 threshold), so it misses two key LRs.

---

## 6. Songs Added (v2.0)

6 songs added that markets trade but were missing from our catalog:
1. **LA MuDANZA** — current album, solo, upbeat (~21% on markets)
2. **I Like It** — Cardi B feat, not solo, mega-hit
3. **La Jumpa** — Arcángel feat, not solo
4. **MIA** — Drake feat, not solo, not upbeat
5. **No Me Conoce - Remix** — multi-artist, not solo
6. **Te Boté - Remix** — 5+ artists, not solo

---

## 7. Model Changes from v1.0

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Scoring | Arbitrary weighted sum (25/20/15/15/10/10/5) | Bayesian log-odds with LRs from 20 SB openers |
| Penalties | Compounding (mega-hit × non-solo) | Non-compounding (pick dominant factor) |
| Mega-hit penalty | x0.65 | x0.30 (stronger, data-driven) |
| Non-solo penalty | x0.50 | x0.67 (softer, doesn't compound) |
| Historical basis | Anecdotal (9 shows) | Systematic (20 shows, 2006-2025) |
| Backtesting | None | Synthetic catalog backtest |
| Song catalog | 28 songs | 34 songs (+ NEW/UNRELEASED = 35) |
| Feature engineering | None | Stream velocity, recency bonus, catalog rank |

---

## 8. Data Sources

| Source | What We Get | Update Frequency |
|--------|-------------|-----------------|
| Kalshi API (public) | Live bid/ask for 22 songs | Every 5 min (revalidate) |
| Polymarket Gamma API | Live prices for 15+ songs | Every 5 min (revalidate) |
| songs.json (manual) | Song features, streams, energy | Manual update needed |
| historical-sb-openers.json | 20 SB opener feature vectors | Static reference data |

---

## 9. Quick Decision Framework

**To adjust the model**, edit likelihood ratios in `lib/model/scoring.ts`. Each ratio is documented with its historical source (e.g., "9/20 openers were from current album").

**To add a song**, add it to `songs.json` — the model auto-includes it.

**To verify changes**, run `npm run build` and check `/api/predictions`.

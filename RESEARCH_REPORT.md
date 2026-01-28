# Bad Bunny SB LX First Song Predictor — Research Report

**Generated**: January 28, 2026
**Super Bowl Date**: February 8, 2026 (11 days away)
**Author**: Model v1.0

---

## 1. Model Summary

### How It Works
The model assigns each song a **weighted score** based on 7 features, then applies **multiplicative penalties/bonuses**, and finally normalizes all scores to probabilities summing to 100%.

### Feature Weights

| Feature | Weight | Rationale |
|---------|--------|-----------|
| Official Trailer Appearance | **25%** | If the NFL previews a song in their halftime trailer, it's the strongest public signal. They don't feature random deep cuts. |
| Upbeat / High-Energy | **20%** | Every SB opener in the last decade has been high-energy. You don't open for 120M viewers with a ballad. |
| Energy Score (Spotify 0-1) | **15%** | Quantitative proxy for how "explosive" a track feels. |
| Current Album Track | **15%** | Artists use the SB to promote current work. Bad Bunny is touring Debí Tirar Más Fotos (2025). |
| Tour Play Frequency | **10%** | Production-ready, rehearsed, proven crowd response. |
| Solo Track | **10%** | No guest coordination needed for the opening moment. |
| Popularity (Streams) | **5%** | Intentionally low — biggest hits rarely open. This is the model's core contrarian thesis. |

### Penalties & Bonuses

| Modifier | Effect | Trigger |
|----------|--------|---------|
| Mega-Hit Penalty | **×0.65** (35% reduction) | >2B Spotify streams |
| Top-Hit Penalty | **×0.80** (20% reduction) | >1.5B streams AND not current album |
| Non-Solo Penalty | **×0.50** (50% reduction) | Song features another artist |
| Tour Opener Bonus | **×(1 + 0.15 × count/10)** | Song has opened tour shows |

---

## 2. Current Model Output (Jan 28, 2026)

### Top Predictions

| Rank | Song | Model % | Key Factors |
|------|------|---------|-------------|
| 1 | BAILE INoLVIDABLE | ~19-20% | In trailer (+25%), upbeat, current album, toured as opener |
| 2 | VOY A LLeVARTE PA PR | ~14% | Opened 7/10 tour shows, upbeat, current album, solo |
| 3 | NUEVAYoL | ~9% | Upbeat, current album, high energy |
| 4 | MONACO | ~8% | Very high energy (0.90), upbeat, solo, perfect opener energy |
| 5 | EoO | ~7% | Current album, upbeat, solo |

### Songs the Model Penalizes

| Song | Penalty | Why |
|------|---------|-----|
| DÁKITI (2.35B) | ×0.65 × 0.50 | Mega-hit + requires Jhay Cortez |
| Me Porto Bonito (2.17B) | ×0.65 × 0.50 | Mega-hit + requires Chencho Corleone |
| LA CANCIÓN (2.33B) | ×0.65 × 0.50 | Mega-hit + requires J Balvin |
| Tití Me Preguntó (1.89B) | ×0.80 | Top hit, not current album (but solo — no guest penalty) |
| Callaita (1.73B) | ×0.80 | Top hit, not current album |

---

## 3. Market Comparison (Live as of Jan 28)

### Kalshi vs Polymarket vs Our Model

| Song | Our Model | Kalshi | Polymarket | Avg Market | Edge |
|------|-----------|--------|------------|------------|------|
| Tití Me Preguntó | ~5% | 41.5% | 45.5% | 43.5% | **-38.5%** |
| BAILE INoLVIDABLE | ~19% | 23.5% | 20.0% | 21.7% | **-2.7%** |
| LA MuDANZA | N/A* | 21.0% | 22.5% | 21.7% | N/A |
| NUEVAYoL | ~9% | 8.5% | 8.5% | 8.5% | **+0.5%** |
| DtMF | ~6% | 2.5% | 4.5% | 3.5% | **+2.5%** |
| DÁKITI | ~1% | 3.5% | 2.7% | 3.1% | **-2.1%** |

*LA MuDANZA is not in our song catalog — see known gaps below.

### Key Market Disagreements

**MASSIVE GAP: Tití Me Preguntó**
- Markets say 43%, our model says ~5%
- Markets are treating this as the heavy favorite
- Our model penalizes it (1.89B streams, not current album = ×0.80)
- **Question to consider**: Is our penalty too harsh? Tití is solo, upbeat, and iconic. The market may know something we don't (rehearsal leaks? insider info?).

**MISSING: LA MuDANZA**
- Markets have this at ~21% on both platforms
- We don't even have it in our song catalog
- **ACTION NEEDED**: Add LA MuDANZA to songs.json with proper features

**DtMF Underpriced by Markets?**
- We say ~6%, markets say 2.5-4.5%
- Title track of current album, most-streamed new song
- But it's not upbeat (BPM 95, energy 0.65) — model is split on it

---

## 4. Known Model Gaps & Issues

### Missing Songs
1. **LA MuDANZA** — Trading at 21% on both markets. MUST add to catalog.
2. **I Like It** (Cardi B ft. Bad Bunny) — On Kalshi at 4.5%. Not in our catalog as a BB-primary song.

### Potential Model Weaknesses

1. **Tití Me Preguntó mismatch**: The 38% gap between our model and markets is enormous. Either:
   - Markets are wrong (retail bettors overweighting famous songs) — this IS our thesis
   - Our penalty is too aggressive for a solo, upbeat, iconic track
   - There's insider info we don't have (rehearsal leaks, etc.)

2. **Popularity weight too low at 5%?** The Weeknd opened with Blinding Lights (his biggest hit). Maybe popularity should be 10-15% with a softer mega-hit penalty.

3. **Trailer signal may be overweighted at 25%**: BAILE INoLVIDABLE is in the trailer, but trailers often feature multiple songs. Being in the trailer ≠ opening song.

4. **Tour opener data is sparse**: We only have approximate counts. Better setlist.fm data could improve this.

5. **No recency weighting on streams**: A song gaining streams NOW matters more than lifetime totals.

---

## 5. Things to Investigate / Tweak

### High Priority (Do Before Feb 8)
- [ ] **Add LA MuDANZA to songs.json** — it's a major market mover at 21%
- [ ] **Re-evaluate Tití Me Preguntó penalty** — is ×0.80 too harsh for a solo upbeat track? Consider: it's not >2B (so no mega-hit penalty), it IS solo, it IS upbeat. The only penalty is "top hit + old catalog." Maybe this penalty should be ×0.90 for solo upbeat tracks?
- [ ] **Check for rehearsal leaks** — if Tití is truly the opener, rehearsal footage will leak in early Feb
- [ ] **Verify tour opener data** — cross-reference setlist.fm for VOY A LLeVARTE PA PR opener count

### Medium Priority
- [ ] Increase popularity weight from 5% to 10%
- [ ] Add daily stream velocity as a feature (rising vs falling popularity)
- [ ] Soften mega-hit penalty from ×0.65 to ×0.70 for solo tracks
- [ ] Add "cultural moment" bonus for songs that are currently trending
- [ ] Consider reducing trailer weight from 25% to 20%

### Low Priority / Post-Event
- [ ] Backtest model against past 10 Super Bowls
- [ ] Add confidence intervals / uncertainty bands
- [ ] Track how model predictions change over time vs market movement

---

## 6. Weight Adjustment Guide

To change the model, edit `lib/model/scoring.ts`.

### Current weights object:
```typescript
const WEIGHTS = {
  inOfficialTrailer: 0.25,  // ← Change this to adjust trailer importance
  isUpbeat: 0.20,           // ← How much "high energy" matters
  energyScore: 0.15,        // ← Spotify energy feature weight
  isFromCurrentAlbum: 0.15, // ← Current album bonus
  tourPlayFrequency: 0.10,  // ← Tour setlist frequency
  isSolo: 0.10,             // ← Solo track bonus
  popularityScore: 0.05,    // ← Stream count importance
};
```

### Penalty section (same file, ~line 44):
```typescript
const MEGA_HIT_THRESHOLD = 2_000_000_000;  // ← Streams threshold for big penalty
const MEGA_HIT_PENALTY = 0.65;             // ← 35% reduction (change to 0.70 for softer)

// Line 44-49: Top hit penalty
const isTopHit = song.spotifyStreams > 1_500_000_000;  // ← threshold for mild penalty
score *= 0.80;  // ← 20% reduction for top hits not on current album

// Line 52-54: Non-solo penalty
score *= 0.50;  // ← 50% reduction for feat. songs
```

### How to test changes:
1. Edit weights/penalties in `lib/model/scoring.ts`
2. Run `npm run build` to rebuild
3. Check `/api/predictions` for new probabilities
4. Compare against market prices to see new edge calculations

---

## 7. Data Sources

| Source | What We Get | Update Frequency |
|--------|-------------|-----------------|
| Kalshi API (public) | Live bid/ask for 22 songs | Every 5 min (revalidate) |
| Polymarket Gamma API | Live prices for 15+ songs | Every 5 min (revalidate) |
| songs.json (manual) | Song features, streams, energy | Manual update needed |
| Spotify (future) | Real-time stream counts | Not yet integrated |
| setlist.fm (future) | Tour setlist data | Not yet integrated |

---

## 8. Historical Super Bowl Opener Data

| Year | Artist | Opening Song | Was It #1 Hit? | Notes |
|------|--------|-------------|----------------|-------|
| 2025 | Kendrick Lamar | GNX (Teaser) | NEW song | Unreleased — broke all precedent |
| 2024 | Usher | Caught Up | No (#4 hit) | Upbeat, danceable |
| 2023 | Rihanna | B**** Better Have My Money | No (#7 hit) | Statement opener |
| 2022 | Dr. Dre/Snoop | The Next Episode | Classic | High-energy, iconic |
| 2021 | The Weeknd | Blinding Lights | **YES** (#1) | Exception to the rule |
| 2020 | Shakira | She Wolf | No | Danceable, not biggest |
| 2019 | Maroon 5 | Harder to Breathe | No | Deep cut |
| 2017 | Lady Gaga | God Bless America | Non-single | Only non-single in 17 years |
| 2016 | Coldplay | Yellow | No | Classic, not biggest |

**Pattern**: 8 out of 9 times, the opener was NOT the artist's biggest hit. Only The Weeknd broke this pattern.

---

## 9. Quick Decision Framework

If you're deciding whether to adjust the model:

**Increase a song's probability if:**
- New evidence emerges (rehearsal leak, official announcement)
- It's been confirmed as the tour opener recently
- Market is pricing it much higher and you believe the market has information

**Decrease a song's probability if:**
- Guest artist confirmed NOT attending SB
- Song removed from recent tour setlists
- Market crash suggests insiders know something

**When in doubt:**
- Trust the historical pattern (opener ≠ biggest hit)
- Weight official sources (NFL, Apple Music) over rumors
- Remember: low-liquidity markets can be moved by a few bettors

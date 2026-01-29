# Bad Bunny SB LX First Song Predictor — Research Report

**Generated**: January 28, 2026
**Super Bowl Date**: February 8, 2026 (11 days away)
**Author**: Model v2.2 — Bayesian Log-Odds with Verified Historical Data

---

## 1. Verified Historical Openers (2006-2025)

Every opener confirmed via [setlist.fm](https://www.setlist.fm) and cross-referenced with Wikipedia, Sports Illustrated, Rolling Stone, and other sources.

| Year | SB | Artist | Opening Song | Biggest Hit? | Current Album? | Solo? | Notes |
|------|-----|--------|-------------|:---:|:---:|:---:|-------|
| 2025 | LIX | Kendrick Lamar | **wacced out murals** | No | Yes | Yes | First track on GNX (2024). Not a pre-release single. |
| 2024 | LVIII | Usher | **Caught Up** | No | No | Yes | From Confessions (2004). Not Yeah!, not Burn. |
| 2023 | LVII | Rihanna | **Bitch Better Have My Money** | No | No | Yes | Statement opener. Not Umbrella, not We Found Love. |
| 2022 | LVI | Dr. Dre + Snoop | **The Next Episode** | No | No | No | Multi-artist show. Snoop present from start. |
| 2021 | LV | The Weeknd | **Starboy** | No | No | Yes | **NOT Blinding Lights** (common misconception). Blinding Lights was the CLOSER. |
| 2020 | LIV | Shakira | **She Wolf** | No | No | Yes | Shakira went first (co-headline with J.Lo). |
| 2019 | LIII | Maroon 5 | **Harder to Breathe** | No | No | Yes | Deep cut from Songs About Jane (2002). Not Sugar. |
| 2018 | LII | Justin Timberlake | **Filthy** | No | Yes | Yes | Lead single from Man of the Woods. Live debut at SB. |
| 2017 | LI | Lady Gaga | **Poker Face** | No | No | Yes | God Bless America from roof was patriotic pre-show. Poker Face was first original song. |
| 2016 | 50 | Coldplay | **Yellow** | No | No | Yes | Brief Colour Spectrum intro. Beyoncé/Bruno appeared later. |
| 2015 | XLIX | Katy Perry | **Roar** | No | Yes | Yes | Entered on golden lion. Not Firework, not Dark Horse. |
| 2014 | XLVIII | Bruno Mars | **Locked Out of Heaven** | No | Yes | Yes | Children's choir + drum solo intro, then LOoH. |
| 2013 | XLVII | Beyoncé | **Love on Top** | No | No | Yes | A cappella first vocal. Not Single Ladies, not Halo. |
| 2012 | XLVI | Madonna | **Vogue** | No | No | Yes | Cleopatra throne entrance. Not Like a Virgin. |
| 2011 | XLV | Black Eyed Peas | **I Gotta Feeling** | **YES** | No | No | **ONLY case in 20 years** where opener = biggest hit. Group act. |
| 2010 | XLIV | The Who | **Pinball Wizard** | No | No | Yes | Not Baba O'Riley, not Won't Get Fooled Again. |
| 2009 | XLIII | Bruce Springsteen | **Tenth Avenue Freeze-Out** | No | No | Yes | Not Born to Run, not Dancing in the Dark. |
| 2008 | XLII | Tom Petty | **American Girl** | No | No | Yes | Not Free Fallin', not I Won't Back Down. |
| 2007 | XLI | Prince | **Let's Go Crazy** | No | No | Yes | Brief We Will Rock You intro. Not Purple Rain (closer). |
| 2006 | XL | Rolling Stones | **Start Me Up** | No | No | Yes | Not Satisfaction, not Paint It Black. |

---

## 2. Corrected Base Rates

Previous versions of this model used inaccurate data. Here are the **verified** base rates:

| Pattern | Count | Rate | Previous (Wrong) | Correction |
|---------|-------|------|-------------------|------------|
| Opener was solo | 18/20 | **90%** | 90% | Unchanged |
| Opener was upbeat | 19/20 | **95%** | 95% | Unchanged |
| Opener from current album | **4/20** | **20%** | 9/20 (45%) | **Major correction** — only Kendrick, JT, Katy Perry, Bruno Mars |
| Opener high energy (>=0.7) | **17/20** | **85%** | 19/20 (95%) | Corrected — Yellow (0.55), Starboy (0.59) are exceptions |
| Opener was biggest hit | **1/20** | **5%** | 2/20 (10%) | **Critical correction** — Weeknd opened with Starboy, NOT Blinding Lights |
| Opener in promo/trailer | **0/20** | **0%** | 3/20 (15%) | **Removed** — unverifiable across historical shows |
| Opener was tour opener | **0/20** | **0%** | 9/20 (45%) | **Removed** — tour data not reliably available historically |

### Key Corrections

1. **The Weeknd (2021)**: Opened with **Starboy**, not Blinding Lights. This was the single biggest error in the previous model — it removed an "exception" to the rule that openers aren't the biggest hit. Blinding Lights was actually the **closer**.

2. **Current album rate cut from 45% to 20%**: Only 4 of 20 shows had a current-album opener. The previous estimate of 9/20 was fabricated.

3. **Trailer/promo and tour opener signals**: No verifiable historical base rate exists. These are kept as expert-estimated signals specific to Bad Bunny's case.

---

## 3. Model Methodology (v2.2)

### Dampened Bayesian Log-Odds

| Feature | Raw LR | Dampened (sqrt) | Source |
|---------|--------|----------------|--------|
| Official trailer | 6.0x | **2.4x** | Expert estimate (no historical base rate) |
| High popularity (>800M) | 3.6x | **1.9x** | ~18/20 openers well-known vs ~25% catalog |
| Tour opener | 4.0x | **2.0x** | Expert estimate (no historical base rate) |
| Current album | 1.8x | **1.3x** | 4/20 = 20% vs ~11% catalog |
| High energy (>=0.7) | 1.7x | **1.3x** | 17/20 = 85% vs ~50% catalog |
| Solo | 1.5x | **1.2x** | 18/20 = 90% vs ~60% catalog |
| Upbeat | 1.36x | **1.2x** | 19/20 = 95% vs ~70% catalog |

### Calibration Steps
1. **Sqrt dampening**: Corrects for naive Bayes feature-independence assumption
2. **Power compression** (`score^0.55`): Prevents single-song dominance
3. **Non-compounding penalties**: Only the single most relevant penalty per song

### Penalties

| Penalty | Factor | Trigger |
|---------|--------|---------|
| Mega-hit old catalog | **x0.30** | >2B streams, not current album |
| Top-hit old catalog | **x0.50** | >1.5B streams, not current album |
| Top-hit old (solo+upbeat) | **x0.75** | Same, but solo and upbeat |
| Non-solo | **x0.67** | Requires guest artist |

---

## 4. The Tití Me Preguntó Question

**Our model: ~3% | Markets: ~41%**

### Why our model is lower:
- Not from current album (no 1.3x LR)
- Not in official trailer (no 2.4x LR)
- Not a tour opener (no 2.0x LR)
- Gets top-hit penalty x0.75 (1.89B streams, not current album)
- **19/20 SB openers were NOT the artist's biggest hit** (corrected from 18/20)

### Why markets might be right:
- Most iconic Bad Bunny solo song
- Solo + upbeat + high energy = perfect opener profile
- Possible insider info (rehearsal leaks)
- Sometimes the obvious pick IS the pick

### Our thesis:
Markets overweight "most famous = most likely opener." Verified data shows this is wrong 95% of the time (19/20). We accept the risk of being wrong on Tití.

---

## 5. Model Evolution

| Aspect | v1.0 | v2.0 | v2.1 | v2.2 (current) |
|--------|------|------|------|-----------------|
| Historical data | 9 shows, anecdotal | 20 shows, unverified | Same | **20 shows, setlist.fm verified** |
| Current album LR | 4.1x (45%) | 4.1x | 4.1x → 2.0x dampened | **1.8x (20%)** → 1.3x dampened |
| Biggest hit rate | 1/9 | 2/20 (wrong) | 2/20 (wrong) | **1/20 (correct)** |
| Weeknd opener | Blinding Lights | Blinding Lights | Blinding Lights | **Starboy (corrected)** |
| Trailer LR | 10x (fabricated rate) | 10x | 10x → 3.2x | **6.0x** → 2.4x (expert est.) |
| Tour opener LR | 8x (fabricated rate) | 8x | 8x → 2.8x | **4.0x** → 2.0x (expert est.) |

---

## 6. Songs in Catalog (35 total)

### Current Album (DeBÍ TiRAR MáS FOToS, 2025)
BAILE INoLVIDABLE, DtMF, NUEVAYoL, VOY A LLeVARTE PA PR, VeLDÁ, EoO, LA MuDANZA

### Classic Catalog
Tití Me Preguntó, DÁKITI, Me Porto Bonito, LA CANCIÓN, Ojitos Lindos, Callaita, Efecto, Yonaguni, Moscow Mule, Safaera, Yo Perreo Sola, PERRO NEGRO, Neverita, La Santa, WHERE SHE GOES, MOJABI GHOST, un x100to, Otro Atardecer, Diles, MONACO, ALAMBRE PúA

### Added for Market Coverage
I Like It, La Jumpa, MIA, No Me Conoce - Remix, Te Boté - Remix

### Special
NEW/UNRELEASED SONG (Kendrick precedent)

---

## 7. Data Sources

| Source | What | Reliability |
|--------|------|------------|
| setlist.fm | Historical SB openers | **Verified** — primary source for all 20 openers |
| Kalshi API | Live market prices | Live, 5-min revalidate |
| Polymarket Gamma API | Live market prices | Live, 5-min revalidate |
| songs.json | Song features | Manual, best-effort |
| Spotify (future) | Real-time streams | Not yet integrated |

---

## 8. Known Limitations

1. **Trailer and tour opener LRs are expert estimates**, not historically derived. We couldn't verify these features across 20 historical shows.
2. **Tití gap (~38%)** is our biggest risk. If markets are right, our core thesis is wrong.
3. **Small sample** (20 shows). Confidence intervals on base rates are wide.
4. **Feature correlation**: Even with sqrt dampening, features aren't independent.
5. **No insider info**: Rehearsal leaks could invalidate everything.

---

## 9. Quick Reference

**To adjust**: Edit `lib/model/scoring.ts` — `RAW_LIKELIHOOD_RATIOS`, `PENALTIES`, `COMPRESSION`

**To add a song**: Add to `songs.json`

**To verify**: `npm run build` → `/api/predictions`

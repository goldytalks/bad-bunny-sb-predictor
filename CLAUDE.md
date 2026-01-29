# CLAUDE.md - Bad Bunny Super Bowl First Song Predictor

## Project Overview
This is a prediction model + dashboard for betting on which song Bad Bunny will perform first at Super Bowl LX (February 8, 2026). The goal is to generate our own probability estimates, compare them to market prices (Kalshi, Polymarket), and identify edge/mispricing.

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Space Mono font (brutalist terminal aesthetic)
- **Charts**: Recharts + HTML Canvas (Kalshi live chart)
- **Deployment**: Vercel
- **APIs**: Kalshi, Polymarket, Spotify

## Key Commands
```bash
# Development
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check

# Deployment
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

## Project Structure
```
app/
├── page.tsx                 # Main dashboard - MOST IMPORTANT FILE
├── layout.tsx               # Root layout with fonts/metadata
├── api/
│   ├── predictions/route.ts # Our model predictions endpoint
│   ├── markets/
│   │   ├── kalshi/route.ts  # Kalshi market prices
│   │   └── polymarket/route.ts
│   └── spotify/route.ts     # Spotify data
└── components/
    ├── PredictionTable.tsx  # Full prediction table
    ├── EdgeChart.tsx        # Edge bar chart (Recharts)
    ├── EdgeCard.tsx         # Buy/avoid signal cards
    ├── ModelReasoning.tsx   # Detailed model explanation
    ├── KalshiChart.tsx      # Animated canvas with Kalshi live prices
    └── BarFill.tsx          # Animated probability bar

lib/
├── model/
│   ├── scoring.ts           # Weighted scoring algorithm
│   ├── features.ts          # Feature engineering
│   └── ensemble.ts          # Combined prediction
├── data/
│   ├── songs.ts             # Song catalog and features
│   ├── kalshi.ts            # Kalshi API client
│   └── spotify.ts           # Spotify API client
└── utils/
    └── probability.ts       # Probability helpers

data/
├── songs.json               # Pre-computed song data
└── historical-sb.json       # Past SB halftime data
```

## Core Model Logic

### Scoring Model (lib/model/scoring.ts)
The model scores each song based on weighted features:

```typescript
const WEIGHTS = {
  // SB-specific signals (HIGHEST WEIGHT)
  inOfficialTrailer: 0.25,      // Featured in NFL promo = huge signal
  
  // Opener suitability
  isUpbeat: 0.20,               // High energy suitable for opener
  energyScore: 0.15,            // Spotify audio feature
  
  // Recency/relevance  
  isFromCurrentAlbum: 0.15,     // Debí Tirar Más Fotos songs
  tourPlayFrequency: 0.10,      // How often played on tour
  
  // Independence
  isSolo: 0.10,                 // No featured artist needed
  
  // Popularity (intentionally low - biggest hits rarely open)
  popularityScore: 0.05,
};

// KEY INSIGHT: Apply penalty for mega-hits
// Historical pattern: SB openers are rarely the artist's biggest song
if (song.spotifyStreams > 2_000_000_000 && song.isTopHit) {
  score *= 0.65; // 35% penalty - these are saved for later
}
```

### Edge Calculation
```typescript
function calculateEdge(ourProbability: number, marketProbability: number): number {
  return ourProbability - marketProbability;
  // Positive = we think market underprices (BUY opportunity)
  // Negative = we think market overprices (SELL/AVOID)
}
```

## Key Data Points

### Bad Bunny Discography Insights
1. **Current Album (Debí Tirar Más Fotos)** - Released Jan 2025
   - DtMF (title track) - 1.27B streams
   - BAILE INoLVIDABLE - 1.04B streams, IN OFFICIAL SB TRAILER
   - NUEVAYoL - 843M streams
   - VOY A LLeVARTE PA PR - 705M streams

2. **Mega-hits (should be PENALIZED for opener)**
   - DÁKITI - 2.35B (feat. Jhay Cortez - needs guest)
   - LA CANCIÓN - 2.33B (feat. J Balvin - needs guest)
   - Tití Me Preguntó - 1.89B
   - Me Porto Bonito - 2.17B (feat. Chencho Corleone)

3. **Solo high-energy tracks (GOOD for opener)**
   - MONACO - 729M streams, upbeat, statement track
   - Safaera - 1.01B streams
   - 25/8 - 322M streams

### Historical Super Bowl Patterns
```
2025: Kendrick opened with NEW UNRELEASED song (GNX teaser)
2024: Usher opened with "Caught Up" (upbeat, not biggest hit)
2023: Rihanna opened with "Better Have My Money" (statement)
2022: Dre/Snoop opened with "The Next Episode" (classic, high-energy)
2020: Shakira opened with "She Wolf" (danceable, not biggest)

KEY PATTERN: Openers are high-energy but NOT the biggest hit
```

## API Endpoints

### GET /api/predictions
Returns our model's probability for each song:
```typescript
{
  predictions: [
    { song: "BAILE INoLVIDABLE", probability: 0.285, confidence: "high" },
    { song: "MONACO", probability: 0.182, confidence: "medium" },
    // ...
  ],
  lastUpdated: "2026-01-28T12:00:00Z"
}
```

### GET /api/markets/kalshi
Returns current Kalshi prices:
```typescript
{
  prices: [
    { song: "BAILE INoLVIDABLE", yesBid: 0.31, yesAsk: 0.34 },
    // ...
  ],
  lastUpdated: "2026-01-28T12:00:00Z"
}
```

## Environment Variables
```bash
# .env.local
KALSHI_API_KEY=xxx           # Kalshi API key
SPOTIFY_CLIENT_ID=xxx        # Spotify app client ID
SPOTIFY_CLIENT_SECRET=xxx    # Spotify app secret
```

## UI Design Guidelines

### Design System: Brutalist Terminal Aesthetic
Inspired by the "NOMINAL V.1984" terminal design. Uses Space Mono monospace font, all-uppercase text, heavy black borders, and a green (#39FF14) accent color.

### Color Scheme
- **Background**: Light gray (#EAEAEA)
- **Foreground/Borders**: Black (#000000)
- **Accent**: Neon green (#39FF14) - used for ticker tape, buy signals, hover states
- **Dim text**: #555555

### Page Layout (matches NOMINAL template)
1. **Ticker Tape**: Scrolling green bar with song predictions + edges
2. **Header**: `BB_PREDICT V.2.2` logo (black bg) + nav links (Research, Backtest, MKT_DATA)
3. **Hero Grid (65/35)**: Large "FIRST SONG ENGINE_" title + top prediction on left; Kalshi live canvas chart on right
4. **Data Table**: Top 6 songs with animated probability bars, market price, edge (green bg = buy, black bg = avoid)
5. **Manifesto**: Model thesis in large bold text
6. **4-Column Sentiment Indicators**: Top buy/avoid signals with colored backgrounds
7. **Full Prediction Table**: All songs with model/Kalshi/Poly/edge/signal columns
8. **CTA Section**: Links to Research and Backtest with brutalist button style (8px box-shadow)
9. **Footer**: Terminal ID + model version (black bg)

### Edge Indicators (text-based, no emoji)
- **BUY++**: Edge > +5%
- **BUY**: Edge +2% to +5%
- **NEUT**: Edge -2% to +2%
- **AVOID**: Edge -2% to -5%
- **AVOID++**: Edge < -5%

## Common Tasks

### Adding a New Song
1. Add to `data/songs.json` with features
2. Run feature calculations in `lib/model/features.ts`
3. Model will auto-include in predictions

### Updating Market Prices
1. For live: API routes auto-fetch
2. For manual: Update `data/market-prices.json`

### Adjusting Model Weights
1. Edit weights in `lib/model/scoring.ts`
2. Document reasoning in comments
3. Compare before/after predictions

## Debugging Tips

### Model produces unexpected results
1. Check feature values: `console.log(song.features)`
2. Check weight application: `console.log(weightedScores)`
3. Verify penalty logic isn't over-applying

### API not returning data
1. Check env vars are set
2. Check API rate limits
3. Use fallback to static data

### UI not updating
1. Clear Next.js cache: `rm -rf .next`
2. Check data fetching in components
3. Verify API routes return correct format

## Deployment Checklist
- [ ] All env vars set in Vercel
- [ ] API routes tested
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error boundaries in place
- [ ] Meta tags for sharing

## Important Notes

### On Model Philosophy
Our edge comes from understanding that:
1. Markets overweight "biggest hit" = likely opener (FALSE historically)
2. Being in official trailer is HUGE signal (markets may underweight)
3. Solo songs preferred (no guest logistics at SB)
4. High-energy/upbeat matters more than popularity
5. Current album tracks have advantage (artist wants to promote)

### On Market Timing
- Market prices will move as SB approaches
- Watch for "smart money" moves (sudden volume spikes)
- Leaks/rumors can cause rapid repricing
- Best edge likely found early before markets efficient

### On Research Agent (Future)
When implementing research agent:
- Prioritize official NFL/Apple Music sources
- Track setlist.fm for tour opener changes
- Monitor @badbunnypr and @nfl Twitter
- Watch for guest artist location sightings

## Quick Reference

### Most Likely Openers (Our Model)
1. BAILE INoLVIDABLE (~28%) - trailer appearance huge
2. MONACO (~18%) - perfect opener energy
3. DtMF (~15%) - title track, statement
4. NUEVAYoL (~12%) - high energy new album

### Likely Overpriced by Markets
- DÁKITI (needs guest, saved for climax)
- Tití Me Preguntó (too big for opener)
- Me Porto Bonito (needs guest)

### Key Dates
- **Today**: Jan 28, 2026
- **Super Bowl**: Feb 8, 2026 (11 days away)
- **Expected rehearsals**: Feb 3-7

---

Remember: The goal is finding EDGE - where our model disagrees with markets. A 25% probability song trading at 15% is a buy. A 10% probability song trading at 20% is a sell/avoid.

# Bad Bunny Super Bowl Halftime First Song Prediction Model

## Project Overview

Build an AI-powered prediction dashboard that:
1. **Originates independent predictions** for which song Bad Bunny will perform first at Super Bowl LX
2. **Compares our model's prices** to live Kalshi/Polymarket market prices
3. **Identifies edge/value** - where markets are mispriced relative to our model
4. **Live dashboard** deployed on Vercel, showing real-time market data + our predictions

---

## Market Context (Research Summary)

### Super Bowl LX Details
- **Date**: February 8, 2026
- **Venue**: Levi's Stadium, Santa Clara, CA
- **Performer**: Bad Bunny (first Latin artist to headline solo)
- **Halftime Duration**: ~12-14 minutes (typically 9-12 songs)

### Current Market Landscape
- **Kalshi**: Active market at `KXFIRSTSUPERBOWLSONG-26FEB09`
- **Polymarket**: May have related markets
- **FanDuel Canada**: First song odds available
- **Key insight**: Markets show low volume, meaning our research can find real edge

### Historical Halftime First Song Patterns
| Year | Artist | First Song | Notes |
|------|--------|------------|-------|
| 2025 | Kendrick Lamar | GNX (Teaser) - unreleased | NEW SONG opener |
| 2024 | Usher | Caught Up | Upbeat, recognizable |
| 2023 | Rihanna | Better Have My Money | Statement opener |
| 2022 | Dr. Dre/Snoop | The Next Episode | Classic, high-energy |
| 2021 | The Weeknd | Blinding Lights | Biggest hit |
| 2020 | Shakira | She Wolf | Upbeat, danceable |
| 2017 | Lady Gaga | God Bless America medley | ONLY non-single opener in 17 years |

**Key Pattern**: Openers are typically upbeat, high-energy, instantly recognizable - but NOT always the biggest hit. Artists often save their #1 song for later climax.

### Bad Bunny Discography Analysis

**Top Songs by Spotify Streams (all-time)**:
1. DÁKITI - 2.35B (feat. Jhay Cortez)
2. LA CANCIÓN - 2.33B (feat. J Balvin)
3. Me Porto Bonito - 2.17B
4. Tití Me Preguntó - 1.89B
5. I Like It - 1.82B (Cardi B song)
6. Ojitos Lindos - 1.81B
7. Callaita - 1.73B
8. No Me Conoce Remix - 1.71B
9. Yonaguni - 1.59B
10. Efecto - 1.59B

**Current Album (Debí Tirar Más Fotos) Hits**:
- DtMF - 1.27B (title track, #5 global 2025)
- BAILE INoLVIDABLE - 1.04B (current tour focus, IN HALFTIME TRAILER)
- NUEVAYoL - 843M
- VeLDÁ - 672M
- EoO - 755M
- VOY A LLeVARTE PA PR - 705M
- MOJABI GHOST - 712M

**Current Tour (Debí Tirar Más Fotos World Tour) Opening Song**: 
- Tour started Nov 2025 in Dominican Republic
- Features songs from new album heavily
- ~3 hour stadium shows with elaborate production

### Market Current Prices (as of late Jan 2026)
Based on search results:
- BAILE INoLVIDABLE: Moved from +1500 to +210 (featured in SB trailer)
- MONACO: Strong consideration for opener (upbeat, statement)
- DtMF: ~+750 (most streamed from new album)
- ALAMBRE PÚA: +340 (most recent release)
- Other songs: Various long odds

---

## Model Architecture

### 1. Data Collection Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                                │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│ │ Spotify API   │  │ Setlist.fm    │  │ Market APIs       │    │
│ │ - Streams     │  │ - Tour sets   │  │ - Kalshi prices   │    │
│ │ - Popularity  │  │ - Opener hist │  │ - Polymarket      │    │
│ │ - Track meta  │  │ - Song freq   │  │ - Volume/liquidity│    │
│ └───────────────┘  └───────────────┘  └───────────────────────┘│
│                                                                 │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│ │ Social/News   │  │ Historical SB │  │ Official Sources  │    │
│ │ - Twitter/X   │  │ - Past openers│  │ - NFL trailers    │    │
│ │ - Rumors      │  │ - Patterns    │  │ - Apple Music     │    │
│ │ - Sentiment   │  │ - Guest data  │  │ - Press releases  │    │
│ └───────────────┘  └───────────────┘  └───────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2. Feature Engineering

**Song-Level Features**:
```typescript
interface SongFeatures {
  // Popularity metrics
  spotifyStreams: number;           // Total streams
  spotifyDaily: number;             // Current daily streams
  chartPeakPosition: number;        // Billboard peak
  isTopHit: boolean;                // In artist's top 10
  
  // Musical characteristics
  bpm: number;                      // Tempo
  energy: number;                   // Spotify audio feature
  danceability: number;             // Spotify audio feature
  valence: number;                  // Positivity
  isUpbeat: boolean;                // Suitable for opener
  
  // Catalog position
  albumRecency: number;             // Days since album release
  isFromCurrentAlbum: boolean;      // Debí Tirar Más Fotos
  isFromPreviousTourAlbum: boolean; // Album being toured
  
  // Live performance history
  tourOpenerCount: number;          // Times opened shows
  tourPlayCount: number;            // Total tour plays
  residencyPlayCount: number;       // PR residency plays
  
  // Collaboration status
  isSolo: boolean;                  // No features
  featuredArtist: string | null;    // Who's featured
  guestLikelihood: number;          // Chance guest appears at SB
  
  // Super Bowl specific
  inOfficialTrailer: boolean;       // Featured in NFL promo
  mentionedInPressRelease: boolean;
  rumorScore: number;               // Social media buzz
}
```

**Historical Pattern Features**:
```typescript
interface HistoricalPatterns {
  // Past SB opener patterns
  pctOpenersWereHits: number;       // 0.6 (60% were top hits)
  pctOpenersWereUpbeat: number;     // 0.9
  pctOpenersWereNew: number;        // 0.15 (Kendrick 2025)
  avgOpenerAge: number;             // Years since release
  
  // Artist-specific patterns
  badBunnyTourOpenerPattern: string[];
  badBunnySetlistStructure: object;
}
```

### 3. Prediction Model

**Model 1: Weighted Scoring Model**
```typescript
function calculateSongScore(song: SongFeatures): number {
  const weights = {
    // Base popularity (but not too high - biggest hit rarely opens)
    popularity: 0.15,
    
    // Opener suitability
    isUpbeat: 0.20,
    energy: 0.15,
    
    // Recency/relevance
    isFromCurrentAlbum: 0.15,
    tourPlayFrequency: 0.10,
    
    // Solo performance (no reliance on guest)
    isSolo: 0.10,
    
    // SB-specific signals
    inTrailer: 0.25,      // HUGE signal
    rumorScore: 0.05,
  };
  
  // Apply penalty for being THE biggest hit (usually saved for later)
  if (song.isTopHit && song.spotifyStreams > 2_000_000_000) {
    score *= 0.7; // 30% penalty
  }
  
  return weightedScore;
}
```

**Model 2: Bayesian Probability Model**
```typescript
// Prior probabilities based on song categories
const priors = {
  currentAlbumLead: 0.35,      // Lead single from touring album
  currentAlbumOther: 0.25,    // Other new album tracks
  classicHit: 0.20,           // Older mega-hits
  deepCut: 0.05,              // Less popular tracks
  newUnreleased: 0.10,        // Following Kendrick precedent
  collaboration: 0.05,        // Songs with features
};

// Update based on evidence (Bayesian update)
function updateProbability(prior: number, evidence: Evidence): number {
  // P(Song | Evidence) ∝ P(Evidence | Song) * P(Song)
  const likelihood = calculateLikelihood(evidence);
  return normalize(prior * likelihood);
}
```

**Model 3: Ensemble Prediction**
```typescript
function generatePrediction(songs: Song[]): Prediction[] {
  const scoringModel = weightedScoring(songs);
  const bayesianModel = bayesianProbabilities(songs);
  const patternModel = historicalPatternMatching(songs);
  
  // Ensemble with weights
  return songs.map(song => ({
    song: song.name,
    probability: (
      scoringModel[song.id] * 0.4 +
      bayesianModel[song.id] * 0.35 +
      patternModel[song.id] * 0.25
    ),
    confidence: calculateConfidence(song),
    edge: calculateEdge(song, marketPrices),
  }));
}
```

### 4. Edge Detection

```typescript
interface EdgeAnalysis {
  song: string;
  ourProbability: number;      // Our model says 25%
  marketProbability: number;   // Market says 15%
  impliedEdge: number;         // +10% edge
  kellyBet: number;            // Optimal bet size
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
}

function findMispricings(
  ourPredictions: Prediction[],
  marketPrices: MarketPrice[]
): EdgeAnalysis[] {
  return ourPredictions
    .map(pred => {
      const market = marketPrices.find(m => m.song === pred.song);
      const edge = pred.probability - market.impliedProbability;
      
      return {
        song: pred.song,
        ourProbability: pred.probability,
        marketProbability: market.impliedProbability,
        impliedEdge: edge,
        kellyBet: calculateKelly(edge, pred.confidence),
        confidence: pred.confidence,
        reasoning: generateReasoning(pred, market),
      };
    })
    .filter(e => Math.abs(e.impliedEdge) > 0.05) // 5% threshold
    .sort((a, b) => b.impliedEdge - a.impliedEdge);
}
```

---

## Technical Architecture

### Stack
```
Frontend:     Next.js 14+ (App Router) + TypeScript + Tailwind CSS
Charts:       Recharts or Chart.js
Data:         Server Actions + API Routes
Market APIs:  Kalshi API, Polymarket API (or scraping)
Music Data:   Spotify API, setlist.fm scraping
Deployment:   Vercel
Database:     Vercel KV or Supabase (for caching/history)
```

### Project Structure
```
bad-bunny-sb-predictor/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── layout.tsx                  # Root layout
│   ├── api/
│   │   ├── predictions/route.ts    # Our model predictions
│   │   ├── markets/
│   │   │   ├── kalshi/route.ts     # Kalshi prices
│   │   │   └── polymarket/route.ts # Polymarket prices
│   │   ├── spotify/route.ts        # Spotify data
│   │   └── research/route.ts       # Web research agent
│   └── components/
│       ├── PredictionTable.tsx
│       ├── EdgeChart.tsx
│       ├── MarketComparison.tsx
│       ├── SongCard.tsx
│       ├── ModelConfidence.tsx
│       └── ResearchPanel.tsx
├── lib/
│   ├── model/
│   │   ├── scoring.ts              # Weighted scoring model
│   │   ├── bayesian.ts             # Bayesian probability
│   │   ├── ensemble.ts             # Combined prediction
│   │   └── features.ts             # Feature engineering
│   ├── data/
│   │   ├── spotify.ts              # Spotify API client
│   │   ├── kalshi.ts               # Kalshi API client
│   │   ├── polymarket.ts           # Polymarket client
│   │   └── setlist.ts              # Setlist.fm scraper
│   ├── research/
│   │   ├── agent.ts                # Research agent
│   │   ├── sources.ts              # Source definitions
│   │   └── synthesis.ts            # Info synthesis
│   └── utils/
│       ├── probability.ts          # Probability utilities
│       └── formatting.ts           # Display formatting
├── data/
│   ├── songs.json                  # Bad Bunny song catalog
│   ├── historical-sb.json          # Past SB data
│   └── features.json               # Computed features
├── CLAUDE.md                       # AI instructions
├── package.json
└── README.md
```

---

## Dashboard UI Design

### Main Dashboard Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🐰 BAD BUNNY SUPER BOWL LX - FIRST SONG PREDICTOR                     │
│  Live Model vs Market Prices | Last Updated: 2 min ago                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ TOP PREDICTION                                                   │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │  🎵 BAILE INoLVIDABLE                                           │   │
│  │  Our Model: 28.5%  │  Market: 32.3%  │  Edge: -3.8%             │   │
│  │  [Featured in official Super Bowl trailer]                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ BIGGEST EDGE PLAYS     │  │ MARKET VS MODEL CHART              │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━ │  │                                    │   │
│  │ 1. MONACO      +8.2%   │  │    📊 [Scatter plot showing        │   │
│  │ 2. NUEVAYoL    +5.1%   │  │        our odds vs market odds     │   │
│  │ 3. VeLDÁ       +4.3%   │  │        with edge highlighted]      │   │
│  │ 4. DtMF        +3.8%   │  │                                    │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━ │  │                                    │   │
│  │ AVOID (Overpriced)     │  │                                    │   │
│  │ 1. DÁKITI     -12.3%   │  │                                    │   │
│  │ 2. Tití       -8.1%    │  │                                    │   │
│  └────────────────────────┘  └────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ FULL PREDICTION TABLE                                           │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │ Song              │ Our Model │ Kalshi │ Poly │ Edge  │ Signal  │   │
│  │ ─────────────────────────────────────────────────────────────── │   │
│  │ BAILE INoLVIDABLE │ 28.5%     │ 32.3%  │ 31%  │ -3.8% │ ⚠️      │   │
│  │ MONACO            │ 18.2%     │ 10.0%  │ 12%  │ +8.2% │ 🔥      │   │
│  │ DtMF              │ 15.5%     │ 11.7%  │ 13%  │ +3.8% │ 📈      │   │
│  │ NUEVAYoL          │ 12.1%     │ 7.0%   │ 8%   │ +5.1% │ 🔥      │   │
│  │ VOY A LLeVARTE    │ 8.3%      │ 6.0%   │ 5%   │ +2.3% │ 📈      │   │
│  │ ALAMBRE PÚA       │ 5.2%      │ 4.5%   │ 5%   │ +0.7% │ ➖      │   │
│  │ Tití Me Preguntó  │ 3.5%      │ 11.6%  │ 10%  │ -8.1% │ 🚫      │   │
│  │ DÁKITI            │ 2.8%      │ 15.1%  │ 14%  │-12.3% │ 🚫      │   │
│  │ Other             │ 5.9%      │ 11.8%  │ 12%  │       │         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ MODEL REASONING                                                  │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │ Why MONACO is underpriced (+8.2% edge):                         │   │
│  │ • High-energy track perfect for opener (BPM: 128)               │   │
│  │ • Solo song (no guest dependency)                                │   │
│  │ • Statement track - "this is my stage" energy                   │   │
│  │ • Frequently opens current tour sets                             │   │
│  │ • Markets over-weighting biggest hits (DÁKITI, Tití)            │   │
│  │                                                                  │   │
│  │ Why DÁKITI is overpriced (-12.3% edge):                         │   │
│  │ • Requires Jhay Cortez guest appearance                          │   │
│  │ • Too big to open - typically saved for climax                  │   │
│  │ • Historical pattern: biggest hits rarely open SB shows         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ RESEARCH AGENT FINDINGS                                         │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │ 📰 Latest News:                                                  │   │
│  │ • "BAILE INoLVIDABLE featured prominently in SB trailer" (NFL)  │   │
│  │ • "Bad Bunny rehearsing at Levi's Stadium" (TMZ, Jan 25)       │   │
│  │ • "J Balvin spotted in Bay Area" (Twitter rumor, unverified)   │   │
│  │                                                                  │   │
│  │ 🎤 Tour Data (Last 10 shows):                                   │   │
│  │ • Opener: VOY A LLeVARTE PA PR (7/10), BAILE INoLVIDABLE (3/10)│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Research Agent Design

### Agent Architecture
```typescript
interface ResearchAgent {
  // Core methods
  searchNews(query: string): Promise<NewsResult[]>;
  scrapeSetlists(artist: string): Promise<Setlist[]>;
  checkSocialMedia(keywords: string[]): Promise<SocialPost[]>;
  synthesizeFindings(sources: Source[]): Promise<Synthesis>;
  
  // Scheduled tasks
  dailyNewsScan(): Promise<void>;
  hourlyMarketCheck(): Promise<void>;
  tourSetlistUpdate(): Promise<void>;
}

// Research sources
const RESEARCH_SOURCES = {
  news: [
    'billboard.com',
    'rollingstone.com',
    'nfl.com',
    'tmz.com',
    'variety.com',
  ],
  social: [
    'twitter.com/badbunnypr',
    'twitter.com/nfl',
    'twitter.com/superbowl',
  ],
  setlists: [
    'setlist.fm',
  ],
  markets: [
    'kalshi.com',
    'polymarket.com',
  ],
};
```

### Agent Prompts
```typescript
const RESEARCH_AGENT_PROMPT = `
You are a research agent for a Super Bowl halftime prediction model.

Your job is to find information relevant to predicting Bad Bunny's first song.

Key signals to watch for:
1. Official NFL/Apple Music announcements about the halftime show
2. Bad Bunny tour setlist changes (especially opener changes)
3. Guest artist sightings in Bay Area / Santa Clara
4. Social media hints from Bad Bunny or his team
5. Rehearsal footage or leaks
6. Promotional material featuring specific songs
7. Industry insider speculation from credible sources

When you find relevant information:
- Rate confidence (high/medium/low)
- Note the source and recency
- Explain how it affects predictions

Avoid:
- Random speculation without sourcing
- Old news (>7 days unless major)
- Clickbait or unreliable sources
`;
```

---

## API Integration

### Kalshi API
```typescript
// lib/data/kalshi.ts
interface KalshiMarket {
  ticker: string;
  title: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  volume: number;
  open_interest: number;
}

async function getKalshiPrices(): Promise<MarketPrice[]> {
  // Market ID: KXFIRSTSUPERBOWLSONG-26FEB09
  const response = await fetch(
    'https://api.kalshi.co/v1/markets/KXFIRSTSUPERBOWLSONG-26FEB09',
    {
      headers: {
        'Authorization': `Bearer ${process.env.KALSHI_API_KEY}`,
      },
    }
  );
  
  // Parse and return normalized prices
  return normalizeKalshiPrices(await response.json());
}
```

### Spotify API
```typescript
// lib/data/spotify.ts
async function getBadBunnyTopTracks(): Promise<SpotifyTrack[]> {
  const artistId = '4q3ewBCX7sLwd24euuV69X'; // Bad Bunny
  
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
    {
      headers: {
        'Authorization': `Bearer ${await getSpotifyToken()}`,
      },
    }
  );
  
  return response.json();
}

async function getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
  // Get BPM, energy, danceability, etc.
  const response = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`,
    {
      headers: {
        'Authorization': `Bearer ${await getSpotifyToken()}`,
      },
    }
  );
  
  return response.json();
}
```

---

## MVP Feature Scope

### Phase 1 (MVP) - Launch ASAP
- [ ] Static song catalog with pre-computed features
- [ ] Basic weighted scoring model
- [ ] Manual market price entry (update via admin)
- [ ] Dashboard showing our predictions vs market
- [ ] Edge detection and display
- [ ] Deploy to Vercel

### Phase 2 - Live Data
- [ ] Kalshi API integration (real-time prices)
- [ ] Polymarket API integration
- [ ] Spotify API for streaming data
- [ ] Auto-refresh every 5 minutes

### Phase 3 - Research Agent
- [ ] News scraping pipeline
- [ ] Social media monitoring
- [ ] Setlist.fm integration
- [ ] AI synthesis of findings

### Phase 4 - Advanced
- [ ] Historical backtesting (past SB shows)
- [ ] Multiple markets (total songs, guests, etc.)
- [ ] Confidence intervals and uncertainty
- [ ] User accounts and saved predictions

---

## Deployment

### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "KALSHI_API_KEY": "@kalshi-api-key",
    "SPOTIFY_CLIENT_ID": "@spotify-client-id",
    "SPOTIFY_CLIENT_SECRET": "@spotify-client-secret"
  },
  "crons": [
    {
      "path": "/api/refresh",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### GitHub Actions (optional)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Success Metrics

1. **Model Accuracy**: Track predicted vs actual probabilities over time
2. **Edge Identification**: Did we correctly identify mispricings?
3. **P&L Tracking**: If we bet based on model, what's ROI?
4. **Data Freshness**: How current is our market/research data?

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Day 1-2 | Setup + Basic Model | Scoring model + static data |
| Day 3-4 | Dashboard | Full UI with charts |
| Day 5-6 | API Integration | Live market prices |
| Day 7 | Research Agent | News/social monitoring |
| Ongoing | Refinement | Model tuning + edge finding |

**Super Bowl Date**: February 8, 2026
**Time Remaining**: ~11 days

---

## Appendix: Song Candidate List

Top songs to track (with initial feature scores):

| Song | Album | Streams | Energy | Solo | Trailer | Initial Score |
|------|-------|---------|--------|------|---------|---------------|
| BAILE INoLVIDABLE | DtMF | 1.04B | High | Yes | YES | 0.85 |
| MONACO | NSLQVPM | 729M | High | Yes | No | 0.78 |
| DtMF | DtMF | 1.27B | Med | Yes | No | 0.72 |
| NUEVAYoL | DtMF | 843M | High | Yes | No | 0.70 |
| VOY A LLeVARTE PA PR | DtMF | 705M | High | Yes | No | 0.68 |
| Tití Me Preguntó | UVST | 1.89B | High | Yes | No | 0.55* |
| DÁKITI | EUTDM | 2.35B | Med | No | No | 0.45* |
| Me Porto Bonito | UVST | 2.17B | Med | No | No | 0.42* |

*Penalized for being too big/having features

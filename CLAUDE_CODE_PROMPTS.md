# Claude Code Prompting Guide
## How to Build the Bad Bunny Super Bowl Predictor

This document contains the exact prompts and workflow to use with Claude Code to build this project efficiently.

---

## Initial Setup Prompt

Copy this entire prompt to start your Claude Code session:

```
I'm building a prediction model dashboard for Bad Bunny's Super Bowl LX halftime show first song. Here's what I need:

PROJECT GOAL:
- Build an AI-powered dashboard that predicts which song Bad Bunny will open with
- Compare our model's probabilities to live Kalshi/Polymarket prices
- Identify edge/mispricing opportunities
- Deploy to Vercel with live updates

TECH STACK:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Recharts for charts
- Vercel for deployment

Please read the CLAUDE.md file first, then let's start building. Begin with:
1. Project initialization with proper package.json
2. Core data structures and types
3. The prediction model logic
4. Then we'll build the UI

I have the full spec in PROJECT_SPEC.md with all the research data about Bad Bunny's songs, historical SB patterns, and market context.
```

---

## Phase-by-Phase Prompts

### Phase 1: Project Setup

```
Let's initialize the project:

1. Create package.json with these dependencies:
   - next@14
   - react, react-dom
   - typescript, @types/react, @types/node
   - tailwindcss, postcss, autoprefixer
   - recharts
   - lucide-react (for icons)

2. Set up tsconfig.json with strict mode

3. Initialize Tailwind with a custom theme:
   - Dark mode by default
   - Puerto Rican flag inspired colors (red: #ED0000, blue: #0050F0)
   - Gold accent for "edge" highlights

4. Create the basic folder structure as outlined in CLAUDE.md
```

### Phase 2: Data Layer

```
Now let's build the data layer:

1. Create types/index.ts with interfaces for:
   - Song (name, album, streams, features, etc.)
   - Prediction (song, probability, confidence)
   - MarketPrice (song, yesBid, yesAsk, volume)
   - Edge (song, ourProb, marketProb, edge, signal)

2. Create data/songs.json with Bad Bunny's top 30 songs including:
   - Spotify streams (from the research)
   - Album info
   - Whether it's solo or has features
   - BPM/energy estimates
   - Whether it's in the SB trailer

Key songs to include (with approximate data):
- BAILE INoLVIDABLE: 1.04B streams, DTMF album, solo, IN TRAILER
- MONACO: 729M streams, NSLQVPM album, solo, high energy
- DtMF: 1.27B streams, DTMF album, solo
- NUEVAYoL: 843M streams, DTMF album, solo
- DÁKITI: 2.35B streams, EUTDM album, feat. Jhay Cortez
- Tití Me Preguntó: 1.89B streams, UVST album, solo
(continue for top 20-30 songs)
```

### Phase 3: Prediction Model

```
Now let's build the core prediction model in lib/model/:

1. Create features.ts:
   - Function to compute feature scores for each song
   - Normalize streams to 0-1 scale
   - Energy/upbeat classification
   - Solo vs collab flag
   - Current album bonus

2. Create scoring.ts with the weighted scoring model:
   - Use the weights from CLAUDE.md
   - Implement the mega-hit penalty (35% reduction for >2B streams top hits)
   - Return raw scores for all songs

3. Create ensemble.ts:
   - Normalize scores to probabilities (sum to 1.0)
   - Add confidence levels based on feature certainty
   - Return final Prediction[] array

The key insight: Songs with >2B streams AND in top 10 get penalized because historical SB data shows openers are rarely the biggest hits. They're saved for later in the set.
```

### Phase 4: Dashboard UI

```
Now let's build the main dashboard. Create app/page.tsx with:

1. Hero section showing:
   - Title: "🐰 BAD BUNNY SUPER BOWL LX - FIRST SONG PREDICTOR"
   - Top prediction card with our probability vs market
   - Last updated timestamp

2. Two-column layout below:
   - Left: "Biggest Edge Plays" - top 4 buy opportunities
   - Right: Scatter chart comparing our odds vs market odds

3. Full prediction table with columns:
   - Song name
   - Our Model %
   - Kalshi %
   - Polymarket %
   - Edge %
   - Signal indicator (🔥📈➖⚠️🚫)

4. Model reasoning panel explaining:
   - Why our top pick is favored
   - Why certain popular songs are penalized

Use a dark theme with the color palette from setup. Make it look professional like a trading terminal, not generic AI-generated UI.
```

### Phase 5: Charts and Visualization

```
Let's add the charts using Recharts:

1. Create components/EdgeChart.tsx:
   - Scatter plot with X = market probability, Y = our probability
   - 45-degree reference line (where our price = market price)
   - Points above line = BUY opportunity (green)
   - Points below line = AVOID (red)
   - Hover shows song name and exact edge

2. Create components/ProbabilityBar.tsx:
   - Horizontal bar showing our probability
   - Overlay showing market probability
   - Color coded by edge direction

3. Add a small "edge distribution" histogram showing how many songs we think are mispriced in each direction
```

### Phase 6: API Routes

```
Create the API routes for data fetching:

1. app/api/predictions/route.ts:
   - Import the model from lib/model
   - Return predictions with timestamp
   - Cache for 5 minutes

2. app/api/markets/kalshi/route.ts:
   - For now, return mock data matching current Kalshi prices
   - Structure: { prices: [...], lastUpdated: string }
   - Later we'll connect real API

3. app/api/markets/polymarket/route.ts:
   - Same structure as Kalshi
   - Mock data for now

4. Create a combined app/api/compare/route.ts that:
   - Fetches our predictions
   - Fetches market prices
   - Calculates edge for each song
   - Returns sorted by absolute edge
```

### Phase 7: Live Market Integration

```
Now let's add real Kalshi integration:

1. Create lib/data/kalshi.ts:
   - API client for Kalshi
   - Auth using API key from env
   - Fetch market KXFIRSTSUPERBOWLSONG-26FEB09
   - Map their outcome names to our song names

2. Update app/api/markets/kalshi/route.ts:
   - Use the Kalshi client
   - Add error handling with fallback to cached data
   - Rate limit to avoid API abuse

3. Add revalidation to make data refresh:
   - ISR with 5-minute revalidation
   - Or client-side polling with SWR

Note: If Kalshi API is not available, we can scrape their public page or manually update prices daily.
```

### Phase 8: Research Agent (Advanced)

```
Let's add a basic research agent:

1. Create lib/research/agent.ts:
   - Function to search recent news about Bad Bunny + Super Bowl
   - Parse for keywords: "halftime", "setlist", "rehearsal", "first song"
   - Return relevant findings with source and date

2. Create lib/research/sources.ts:
   - List of RSS feeds or URLs to check
   - Billboard, Rolling Stone, NFL.com, TMZ

3. Create app/api/research/route.ts:
   - Endpoint that triggers research agent
   - Returns latest findings
   - Caches results for 1 hour

4. Add ResearchPanel component to dashboard:
   - Shows latest findings
   - Highlights anything that might affect predictions
   - "Last scanned: X minutes ago"
```

### Phase 9: Polish and Deploy

```
Final polish and deployment:

1. Add loading states to all data fetches
2. Add error boundaries for API failures
3. Add meta tags for social sharing:
   - OG image with prediction
   - Title: "Bad Bunny Super Bowl Predictor"
   - Description: "AI model predicting the first song"

4. Mobile responsive adjustments:
   - Stack columns on mobile
   - Smaller charts
   - Collapsible sections

5. Deploy to Vercel:
   - Set up environment variables
   - Configure domain if available
   - Enable edge caching

6. Add a simple admin route (/admin) for:
   - Manually updating market prices
   - Forcing model recalculation
   - Viewing raw data
```

---

## Debugging Prompts

If something isn't working, use these prompts:

### Model Issues
```
The prediction model is giving unexpected results. Let's debug:
1. Show me the raw feature scores for each song
2. Show me the weights being applied
3. Show me which songs are getting the mega-hit penalty
4. Let's trace through one specific song (BAILE INoLVIDABLE) step by step
```

### UI Issues
```
The dashboard isn't displaying correctly. Let's fix:
1. Check if data is being fetched (add console.logs)
2. Verify the component receives props
3. Check Tailwind classes are being applied
4. Test with hardcoded mock data to isolate issue
```

### API Issues
```
The API route isn't working. Let's debug:
1. Test the route directly with curl
2. Check environment variables are loaded
3. Add try/catch with detailed error logging
4. Verify external API responses
```

---

## Enhancement Prompts

After MVP, use these to add features:

### Add Historical Backtesting
```
Let's add backtesting for past Super Bowls:
1. Create data/historical-sb.json with past performers and first songs
2. Build a function that applies our model to past artists
3. Compare model prediction vs actual outcome
4. Display accuracy metrics on dashboard
```

### Add Multiple Markets
```
Let's expand to other halftime markets:
1. "Will there be a guest performer?" (Yes/No)
2. "Total songs performed" (Over/Under)
3. "Last song performed"
4. Create model variations for each market type
```

### Add Social Monitoring
```
Let's add real-time social monitoring:
1. Twitter API integration for @badbunnypr mentions
2. Sentiment analysis on halftime discussion
3. Trending keywords related to setlist
4. Alert when unusual activity detected
```

---

## Quick Fixes Reference

### "Module not found" errors
```
Run: npm install
Then check: package.json has the dependency
If new package needed: npm install [package-name]
```

### "Type error" in TypeScript
```
Check: types/index.ts has the correct interface
Check: Component props match expected types
Add: "as Type" casting if needed temporarily
```

### "Hydration error" in Next.js
```
Issue: Server/client mismatch
Fix: Use 'use client' directive at top of component
Or: Wrap dynamic content in useEffect
```

### Charts not rendering
```
Check: Recharts ResponsiveContainer has width/height
Check: Data array is not empty
Check: Data keys match chart configuration
```

---

## Final Checklist Before Super Bowl

- [ ] Model produces reasonable probabilities (sum to ~1.0)
- [ ] Market prices update (live or manual)
- [ ] Edge calculations are correct
- [ ] Dashboard loads in <2 seconds
- [ ] Mobile version is usable
- [ ] Deployed to production URL
- [ ] Shared with friends/community for feedback
- [ ] Research agent checked for latest news
- [ ] Bookmarked Kalshi/Polymarket for quick trading

Good luck! May the edge be with you 🐰🏈

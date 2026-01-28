# 🐰 Bad Bunny Super Bowl LX First Song Predictor

An AI-powered prediction model that generates independent probabilities for which song Bad Bunny will perform first at Super Bowl LX (February 8, 2026), and compares them to live market prices to identify edge.

![Dashboard Preview](preview.png)

## 🎯 What This Does

1. **Generates Predictions**: Our model analyzes 25+ Bad Bunny songs across multiple features
2. **Tracks Markets**: Pulls live prices from Kalshi and Polymarket
3. **Finds Edge**: Identifies where markets are mispriced relative to our model
4. **Research Agent**: Scans news/social for setlist hints, rehearsal leaks, guest sightings

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/bad-bunny-sb-predictor.git
cd bad-bunny-sb-predictor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🔧 Environment Variables

Create a `.env.local` file:

```bash
# Kalshi API (optional - can use mock data)
KALSHI_API_KEY=your_key_here

# Spotify API (for streaming data)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Optional: Polymarket API
POLYMARKET_API_KEY=your_key_here
```

## 📊 Model Overview

Our model scores each song based on weighted features:

| Feature | Weight | Rationale |
|---------|--------|-----------|
| In Official Trailer | 25% | Huge signal - featured in NFL promo |
| Is Upbeat | 20% | Openers need high energy |
| Energy Score | 15% | Spotify audio feature |
| From Current Album | 15% | Artist promotes new music |
| Tour Play Frequency | 10% | What they're rehearsed for |
| Is Solo | 10% | No guest logistics issues |
| Popularity | 5% | Intentionally low - biggest hits rarely open |

**Key Insight**: Songs with >2B streams get a 35% penalty because historical data shows Super Bowl openers are rarely the artist's biggest hit.

## 🎵 Current Top Predictions

| Song | Our Model | Why |
|------|-----------|-----|
| BAILE INoLVIDABLE | ~28% | In official trailer, high energy, current album |
| MONACO | ~18% | Perfect opener energy, statement track |
| DtMF | ~15% | Title track, most streamed new album song |
| NUEVAYoL | ~12% | High energy, Puerto Rican pride |

## 📈 Finding Edge

The dashboard highlights where markets are mispriced:

- 🔥 **Strong Buy**: Our probability > market by 5%+
- 📈 **Buy**: Our probability > market by 2-5%
- ➖ **Neutral**: Within 2%
- ⚠️ **Avoid**: Market > our probability by 2-5%
- 🚫 **Strong Avoid**: Market > our probability by 5%+

## 🗂️ Project Structure

```
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── api/
│   │   ├── predictions/      # Our model output
│   │   ├── markets/          # Kalshi/Polymarket prices
│   │   └── research/         # News/social scanning
│   └── components/           # UI components
├── lib/
│   ├── model/                # Prediction model
│   ├── data/                 # API clients
│   └── research/             # Research agent
├── data/
│   └── songs.json            # Song catalog + features
├── CLAUDE.md                 # AI assistant instructions
└── PROJECT_SPEC.md           # Full specification
```

## 🤖 Using Claude Code

This project is optimized for Claude Code. Start with:

```
Read CLAUDE.md and PROJECT_SPEC.md, then help me build/modify the dashboard.
```

See `CLAUDE_CODE_PROMPTS.md` for detailed prompting guides.

## 📅 Key Dates

- **Today**: January 28, 2026
- **Super Bowl LX**: February 8, 2026
- **Halftime**: ~8:00 PM ET
- **Expected Rehearsals**: February 3-7

## 🏈 Historical Context

| Year | Artist | Opener | Pattern |
|------|--------|--------|---------|
| 2025 | Kendrick | NEW unreleased | Debut new music |
| 2024 | Usher | Caught Up | Upbeat, not biggest |
| 2023 | Rihanna | Better Have My Money | Statement |
| 2022 | Dre/Snoop | The Next Episode | Classic |
| 2020 | Shakira | She Wolf | Upbeat |

## 🙏 Acknowledgments

- Spotify API for streaming data
- setlist.fm for tour setlists
- Kalshi/Polymarket for market data
- Bad Bunny for being awesome 🐰

## ⚠️ Disclaimer

This is for entertainment and educational purposes. Always do your own research before trading. Past performance doesn't guarantee future results. Gamble responsibly.

## 📜 License

MIT License - see LICENSE file

---

**Super Bowl LX** | February 8, 2026 | Levi's Stadium | 🐰🏈

*May the edge be with you*

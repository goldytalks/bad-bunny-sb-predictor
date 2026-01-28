"use client";

import { EdgeAnalysis } from "@/lib/types";

const LIKELIHOOD_RATIOS = [
  {
    name: "Official Trailer / Promo",
    lr: "10x",
    historical: "3/20 openers were in promo material vs ~1% base rate",
    detail: "If the NFL previews a song in their halftime trailer, it's an overwhelming signal. The likelihood ratio of 10x means a trailer appearance increases a song's odds by an order of magnitude.",
  },
  {
    name: "Tour Opener",
    lr: "8x",
    historical: "9/20 openers were also tour openers vs ~5% base rate",
    detail: "Songs that open stadium tours are rehearsed, production-ready, and proven crowd-starters. Being a tour opener is the second-strongest signal.",
  },
  {
    name: "Current Album Track",
    lr: "4.1x",
    historical: "9/20 openers from current album vs ~11% of catalog",
    detail: "Artists use the Super Bowl to promote current work. Nearly half of all SB openers came from the artist's most recent album.",
  },
  {
    name: "High Energy (>=0.7)",
    lr: "1.9x",
    historical: "19/20 openers had energy >= 0.7",
    detail: "Spotify's audio energy metric. Nearly every SB opener scores above 0.7 — you need an explosive start for 120M+ viewers.",
  },
  {
    name: "Solo Track (No Guest)",
    lr: "1.5x",
    historical: "18/20 openers were solo performances",
    detail: "Opening the show with a guest is logistically complex. 90% of SB halftime openers are performed solo.",
  },
  {
    name: "Upbeat",
    lr: "1.36x",
    historical: "19/20 openers were upbeat",
    detail: "Almost every SB opener is upbeat and danceable. Slow ballads never open — the performer needs to grab the audience immediately.",
  },
];

const PENALTY_INFO = [
  {
    name: "Mega-Hit Penalty (>2B, old catalog)",
    factor: "x0.30",
    historical: "Only 1/20 openers was an old mega-hit",
    detail: "Songs with over 2 billion streams that aren't from the current album get a 70% reduction. Historical pattern: mega-hits from previous eras are saved for the emotional climax, not the opener.",
  },
  {
    name: "Top-Hit Penalty (>1.5B, old catalog)",
    factor: "x0.50",
    historical: "Old catalog hits rarely open",
    detail: "Songs over 1.5B streams from older albums get a 50% reduction. Well-known enough for the setlist, but positioned mid-show rather than as the opener.",
  },
  {
    name: "Non-Solo Penalty",
    factor: "x0.67",
    historical: "Only 2/20 openers had guest artists",
    detail: "Songs featuring another artist get a 33% reduction. This does NOT compound with mega-hit or top-hit penalties — only the single most relevant penalty applies.",
  },
];

const MODEL_PHILOSOPHY = `This model replaces arbitrary weights with historically-derived likelihood ratios from 20 Super Bowl halftime openers (2006-2025).

Each feature's importance is measured by how much more likely it is among actual openers compared to a random song in an artist's catalog. For example, being a tour opener appears in 45% of SB openers but only ~5% of catalog songs — a likelihood ratio of 8x.

These ratios are combined as Bayesian log-odds: we start with uniform odds and multiply by each applicable ratio. This approach is transparent, auditable, and grounded in data rather than subjective judgment.

Key insight: Penalties do NOT compound. A song that is both a mega-hit and a collab receives only the mega-hit penalty (x0.30), not mega-hit × non-solo. This prevents the model from over-penalizing songs that fail on multiple dimensions.`;

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

export default function ModelReasoning({ edges }: { edges: EdgeAnalysis[] }) {
  const top5 = edges.slice(0, 5);
  const biggestBuys = edges.filter(e => e.edge > 0.02 && e.marketProbability > 0).sort((a, b) => b.edge - a.edge).slice(0, 3);
  const biggestAvoids = edges.filter(e => e.edge < -0.02 && e.marketProbability > 0).sort((a, b) => a.edge - b.edge).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Model Architecture */}
      <div>
        <h3 className="text-lg font-bold mb-3">Bayesian Log-Odds Model</h3>
        <p className="text-gray-400 text-sm whitespace-pre-line mb-4">{MODEL_PHILOSOPHY}</p>
      </div>

      {/* Likelihood Ratios */}
      <div>
        <h3 className="text-lg font-bold mb-3">Likelihood Ratios (from 20 SB Openers)</h3>
        <div className="space-y-3">
          {LIKELIHOOD_RATIOS.map((lr) => (
            <div key={lr.name} className="border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{lr.name}</span>
                <span className="font-mono text-sm text-pr-blue">{lr.lr}</span>
              </div>
              <p className="text-xs text-green-400 mb-1">{lr.historical}</p>
              <p className="text-xs text-gray-500">{lr.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Penalties */}
      <div>
        <h3 className="text-lg font-bold mb-3">Penalties (Non-Compounding)</h3>
        <div className="space-y-3">
          {PENALTY_INFO.map((p) => (
            <div key={p.name} className="border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{p.name}</span>
                <span className="font-mono text-sm text-yellow-400">{p.factor}</span>
              </div>
              <p className="text-xs text-yellow-300 mb-1">{p.historical}</p>
              <p className="text-xs text-gray-500">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Song Reasoning */}
      <div>
        <h3 className="text-lg font-bold mb-3">Top 5 Song Breakdown</h3>
        <div className="space-y-4">
          {top5.map((e, i) => (
            <div key={e.songId} className="border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-gray-500 font-mono text-sm">#{i + 1}</span>
                <span className="font-bold text-lg">{e.song}</span>
                <span className="font-mono text-sm ml-auto">{pct(e.ourProbability)}</span>
              </div>
              {e.reasoning.length > 0 && (
                <ul className="text-sm text-gray-400 space-y-1 mb-3">
                  {e.reasoning.map((r, j) => (
                    <li key={j} className={r.includes("penalty") || r.includes("Non-solo") ? "text-red-400" : r.includes("trailer") || r.includes("Tour opener") || r.includes("Current album") ? "text-green-400" : ""}>
                      {r}
                    </li>
                  ))}
                </ul>
              )}
              {e.marketProbability > 0 && (
                <div className="text-xs text-gray-500 flex gap-4">
                  {e.kalshiProbability > 0 && <span>Kalshi: {pct(e.kalshiProbability)}</span>}
                  {e.polymarketProbability > 0 && <span>Polymarket: {pct(e.polymarketProbability)}</span>}
                  <span className={e.edge > 0 ? "text-green-400" : "text-red-400"}>
                    Edge: {e.edge > 0 ? "+" : ""}{pct(e.edge)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Where We Disagree With Markets */}
      <div>
        <h3 className="text-lg font-bold mb-3">Where We Disagree With Markets</h3>
        {biggestBuys.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-400 mb-2">Underpriced (We&apos;re Higher)</h4>
            {biggestBuys.map((e) => (
              <div key={e.songId} className="border border-green-900 rounded-lg p-3 mb-2 bg-green-950/20">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{e.song}</span>
                  <span className="font-mono text-green-400">+{pct(e.edge)} edge</span>
                </div>
                <p className="text-xs text-gray-500">
                  Model: {pct(e.ourProbability)} vs Market avg: {pct(e.marketProbability)}.
                  {e.reasoning.filter(r => !r.includes("penalty") && !r.includes("Non-solo")).slice(0, 2).map(r => ` ${r}.`)}
                </p>
              </div>
            ))}
          </div>
        )}
        {biggestAvoids.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-400 mb-2">Overpriced (We&apos;re Lower)</h4>
            {biggestAvoids.map((e) => (
              <div key={e.songId} className="border border-red-900 rounded-lg p-3 mb-2 bg-red-950/20">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{e.song}</span>
                  <span className="font-mono text-red-400">{pct(e.edge)} edge</span>
                </div>
                <p className="text-xs text-gray-500">
                  Model: {pct(e.ourProbability)} vs Market avg: {pct(e.marketProbability)}.
                  {e.reasoning.filter(r => r.includes("penalty") || r.includes("Non-solo")).slice(0, 2).map(r => ` ${r}.`)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backtest Link */}
      <div>
        <h3 className="text-lg font-bold mb-3">Backtest Results</h3>
        <p className="text-gray-400 text-sm mb-2">
          The model has been backtested against 20 Super Bowl halftime shows (2006-2025) using
          synthetic catalogs for each artist.
        </p>
        <a href="/backtest" className="text-pr-blue text-sm hover:underline">
          View full backtest results &rarr;
        </a>
      </div>
    </div>
  );
}

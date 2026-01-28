"use client";

import { EdgeAnalysis } from "@/lib/types";

const LIKELIHOOD_RATIOS = [
  {
    name: "Official Trailer / Promo",
    rawLr: "10x",
    dampened: "3.2x",
    historical: "3/20 openers were in promo material vs ~1% base rate",
    detail: "If the NFL previews a song in their halftime trailer, it's an overwhelming signal. Dampened from 10x to 3.2x (sqrt) to correct for naive Bayes overconfidence.",
  },
  {
    name: "Tour Opener",
    rawLr: "8x",
    dampened: "2.8x",
    historical: "9/20 openers were also tour openers vs ~5% base rate",
    detail: "Songs that open stadium tours are rehearsed, production-ready, and proven crowd-starters. Dampened from 8x to 2.8x.",
  },
  {
    name: "Current Album Track",
    rawLr: "4.1x",
    dampened: "2.0x",
    historical: "9/20 openers from current album vs ~11% of catalog",
    detail: "Artists use the Super Bowl to promote current work. Nearly half of all SB openers came from the artist's most recent album. Dampened from 4.1x to 2.0x.",
  },
  {
    name: "High Popularity (>800M streams)",
    rawLr: "3.0x",
    dampened: "1.7x",
    historical: "~90% of openers are top-quartile popularity vs ~25% base rate",
    detail: "SB openers are well-known tracks. This gives recognizable songs like Tití Me Preguntó a boost. Dampened from 3.0x to 1.7x.",
  },
  {
    name: "High Energy (>=0.7)",
    rawLr: "1.9x",
    dampened: "1.4x",
    historical: "19/20 openers had energy >= 0.7",
    detail: "Spotify's audio energy metric. Nearly every SB opener scores above 0.7 — you need an explosive start for 120M+ viewers.",
  },
  {
    name: "Solo Track (No Guest)",
    rawLr: "1.5x",
    dampened: "1.2x",
    historical: "18/20 openers were solo performances",
    detail: "Opening the show with a guest is logistically complex. 90% of SB halftime openers are performed solo.",
  },
  {
    name: "Upbeat",
    rawLr: "1.36x",
    dampened: "1.2x",
    historical: "19/20 openers were upbeat",
    detail: "Almost every SB opener is upbeat and danceable. Slow ballads never open.",
  },
];

const PENALTY_INFO = [
  {
    name: "Mega-Hit Penalty (>2B, old catalog)",
    factor: "x0.30",
    historical: "Only 1/20 openers was an old mega-hit",
    detail: "Songs with over 2 billion streams that aren't from the current album get a 70% reduction. Mega-hits from previous eras are saved for the emotional climax.",
  },
  {
    name: "Top-Hit Penalty (>1.5B, old catalog)",
    factor: "x0.50 / x0.75",
    historical: "Old catalog hits rarely open, but solo upbeat ones are viable",
    detail: "Songs over 1.5B streams from older albums get a 50% reduction. EXCEPTION: solo upbeat tracks get only a 25% reduction (x0.75) because they remain viable openers (cf. Weeknd's Blinding Lights).",
  },
  {
    name: "Non-Solo Penalty",
    factor: "x0.67",
    historical: "Only 2/20 openers had guest artists",
    detail: "Songs featuring another artist get a 33% reduction. Does NOT compound with mega-hit or top-hit penalties.",
  },
];

const MODEL_PHILOSOPHY = `This model uses historically-derived likelihood ratios from 20 Super Bowl halftime openers (2006-2025), with two key calibration steps:

1. SQRT DAMPENING: Raw likelihood ratios assume feature independence (naive Bayes), but features are correlated (current album tracks are more likely to be tour openers, etc.). We apply sqrt() to each ratio, a standard correction for overconfident classifiers.

2. POWER COMPRESSION: After computing raw odds, we apply score^0.55 compression before normalizing to probabilities. This prevents any single song from dominating (e.g., BAILE's trailer+tour+album stack would otherwise reach 45%+).

3. NON-COMPOUNDING PENALTIES: Only the single most relevant penalty applies per song. A mega-hit collab gets the mega-hit penalty (x0.30), not mega-hit x non-solo.

KEY MODEL THESIS: Markets overweight name recognition. Our model says Tití Me Preguntó (~2-3% model vs ~41% market) is the biggest disagreement. We believe the market is pricing in "most famous song" rather than "most likely opener" — historically, 18/20 SB openers were NOT the artist's biggest hit.`;

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
        <h3 className="text-lg font-bold mb-3">Bayesian Log-Odds Model (v2.1)</h3>
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
                <div className="text-right">
                  <span className="font-mono text-sm text-gray-500 line-through mr-2">{lr.rawLr}</span>
                  <span className="font-mono text-sm text-pr-blue">{lr.dampened}</span>
                </div>
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

      {/* Links */}
      <div className="flex gap-4">
        <a href="/backtest" className="text-pr-blue text-sm hover:underline">
          Backtest Results &rarr;
        </a>
        <a href="/research" className="text-pr-blue text-sm hover:underline">
          Full Research Report &rarr;
        </a>
      </div>
    </div>
  );
}

"use client";

import { EdgeAnalysis } from "@/lib/types";

const WEIGHT_DESCRIPTIONS = [
  { name: "Official Trailer Appearance", weight: "25%", detail: "Featured in NFL's halftime promo material. Historically the strongest signal — if the NFL is previewing a song, it's likely in the setlist and possibly the opener." },
  { name: "Upbeat / High-Energy", weight: "20%", detail: "SB openers are almost always high-energy, danceable tracks. Slow ballads never open — the performer needs to grab 120M viewers immediately." },
  { name: "Energy Score (Spotify)", weight: "15%", detail: "Spotify's audio analysis energy metric (0-1). Higher energy = more suitable for an explosive opener moment." },
  { name: "Current Album Track", weight: "15%", detail: "Songs from Debí Tirar Más Fotos (2025) get a bonus. Artists use the SB to promote their latest work — it's the biggest advertising stage on earth." },
  { name: "Tour Play Frequency", weight: "10%", detail: "How often the song appears in the current tour setlist. Songs the artist is actively performing are warmed up and production-ready." },
  { name: "Solo Track (No Guest)", weight: "10%", detail: "Solo songs don't require coordinating a guest artist's entrance for the very first moment. Guests typically appear mid-show, not at the top." },
  { name: "Popularity (Streams)", weight: "5%", detail: "Intentionally low weight. Spotify streams measure overall popularity but the biggest hits are almost never the opener — they're saved for the climax." },
];

const PENALTIES = [
  { name: "Mega-Hit Penalty (>2B streams)", factor: "35% reduction", detail: "Songs with over 2 billion streams (DÁKITI, LA CANCIÓN, Me Porto Bonito) get a 35% score reduction. Historical pattern: SB openers are recognizable but NOT the artist's absolute biggest song. The biggest hit is saved for the emotional peak later in the set." },
  { name: "Top Hit Penalty (>1.5B, older catalog)", factor: "20% reduction", detail: "Songs over 1.5B streams that aren't from the current album get a 20% penalty. These are well-known enough to appear in the set but are more likely mid-show than opener." },
  { name: "Non-Solo Penalty (feat. artist)", factor: "50% reduction", detail: "Songs featuring another artist get a 50% score reduction. Logistics of having a guest on stage for the very first note are complicated. Guest appearances are planned for specific mid-show moments." },
  { name: "Tour Opener Bonus", factor: "Up to +15% boost", detail: "Songs that have opened tour shows get a multiplicative bonus (up to +15% based on how many shows they've opened). If Bad Bunny is already opening stadium shows with a song, it's rehearsed and proven." },
];

const HISTORICAL_INSIGHT = `Our model is built on a key insight from analyzing the last 10+ Super Bowl halftime shows: the opening song is almost never the artist's biggest hit.

Usher (2024) opened with "Caught Up" — not "Yeah!" or "Confessions." Rihanna (2023) opened with "B**** Better Have My Money" — not "Umbrella." Shakira (2020) opened with "She Wolf" — not "Hips Don't Lie." The pattern is clear: openers are upbeat, recognizable, and set a tone — but the mega-hits are saved for the emotional crescendo.

The one notable exception is The Weeknd (2021) opening with "Blinding Lights," which was both his biggest hit AND a perfect opener. This is why the mega-hit penalty is 35%, not 100% — it's possible, just less likely.

Kendrick Lamar (2025) broke the mold entirely by opening with a brand-new unreleased song. This is why we include a "NEW/UNRELEASED" option in our model — precedent now exists for a surprise debut.`;

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
        <h3 className="text-lg font-bold mb-3">Model Architecture</h3>
        <p className="text-gray-400 text-sm mb-4">
          Our model uses a weighted scoring system with 7 features, plus multiplicative penalties and bonuses.
          Each song gets a raw score, then all scores are normalized to probabilities summing to 100%.
        </p>
        <div className="space-y-3">
          {WEIGHT_DESCRIPTIONS.map((w) => (
            <div key={w.name} className="border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{w.name}</span>
                <span className="font-mono text-sm text-pr-blue">{w.weight}</span>
              </div>
              <p className="text-xs text-gray-500">{w.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Penalties & Bonuses */}
      <div>
        <h3 className="text-lg font-bold mb-3">Penalties &amp; Bonuses</h3>
        <div className="space-y-3">
          {PENALTIES.map((p) => (
            <div key={p.name} className="border border-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">{p.name}</span>
                <span className="font-mono text-sm text-yellow-400">{p.factor}</span>
              </div>
              <p className="text-xs text-gray-500">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Pattern */}
      <div>
        <h3 className="text-lg font-bold mb-3">Historical Super Bowl Pattern</h3>
        <p className="text-gray-400 text-sm whitespace-pre-line">{HISTORICAL_INSIGHT}</p>
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
                    <li key={j} className={r.includes("penalty") || r.includes("Requires guest") ? "text-red-400" : r.includes("trailer") || r.includes("Opened") ? "text-green-400" : ""}>
                      • {r}
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
                  {e.reasoning.filter(r => !r.includes("penalty") && !r.includes("Requires")).slice(0, 2).map(r => ` ${r}.`)}
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
                  {e.reasoning.filter(r => r.includes("penalty") || r.includes("Requires") || r.includes("saved")).slice(0, 2).map(r => ` ${r}.`)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

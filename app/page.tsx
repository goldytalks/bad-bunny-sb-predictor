import songsData from "@/songs.json";
import { Song } from "@/lib/types";
import { generatePredictions } from "@/lib/model/scoring";
import { calculateEdge } from "@/lib/utils/probability";
import { fetchKalshiPrices } from "@/lib/data/kalshi";
import { fetchPolymarketPrices } from "@/lib/data/polymarket";
import { MARKET_PRICES } from "@/lib/data/market-prices";
import PredictionTable from "./components/PredictionTable";
import EdgeCard from "./components/EdgeCard";
import EdgeChart from "./components/EdgeChart";

export const revalidate = 300;

export default async function Home() {
  const songs = songsData.songs as Song[];
  const predictions = generatePredictions(songs);

  const sources: string[] = [];

  let kalshiPrices = MARKET_PRICES;
  try {
    const live = await fetchKalshiPrices();
    if (live.length > 0) { kalshiPrices = live; sources.push("Kalshi (live)"); }
    else { sources.push("Kalshi (fallback)"); }
  } catch { sources.push("Kalshi (fallback)"); }

  let polyPrices = undefined;
  try {
    const live = await fetchPolymarketPrices();
    if (live.length > 0) { polyPrices = live; sources.push("Polymarket (live)"); }
  } catch { /* no polymarket data */ }

  const edges = calculateEdge(predictions, kalshiPrices, polyPrices);

  const topPrediction = edges[0];
  const buys = edges.filter((e) => e.edge > 0.02 && e.marketProbability > 0).sort((a, b) => b.edge - a.edge);
  const avoids = edges.filter((e) => e.edge < -0.02 && e.marketProbability > 0).sort((a, b) => a.edge - b.edge);

  const daysLeft = Math.ceil(
    (new Date("2026-02-08").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">
          <span className="text-pr-red">Bad</span>{" "}
          <span className="text-white">Bunny</span>{" "}
          <span className="text-pr-blue">SB LX</span>{" "}
          <span className="text-gray-400 text-2xl">First Song Predictor</span>
        </h1>
        <p className="text-gray-500 text-sm">
          Model vs. Market Edge Detection &middot; Super Bowl {daysLeft > 0 ? `in ${daysLeft} days` : "today"} &middot; Feb 8, 2026
          &middot; {sources.join(" + ")}
        </p>
      </header>

      {topPrediction && (
        <section className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 mb-8">
          <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Top Prediction</h2>
          <div className="text-3xl font-bold mb-2">{topPrediction.song}</div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-400">Our Model: </span>
              <span className="font-mono font-bold text-lg">{(topPrediction.ourProbability * 100).toFixed(1)}%</span>
            </div>
            {topPrediction.kalshiProbability > 0 && (
              <div>
                <span className="text-gray-400">Kalshi: </span>
                <span className="font-mono text-lg">{(topPrediction.kalshiProbability * 100).toFixed(1)}%</span>
              </div>
            )}
            {topPrediction.polymarketProbability > 0 && (
              <div>
                <span className="text-gray-400">Polymarket: </span>
                <span className="font-mono text-lg">{(topPrediction.polymarketProbability * 100).toFixed(1)}%</span>
              </div>
            )}
            {topPrediction.marketProbability > 0 && (
              <div>
                <span className="text-gray-400">Edge: </span>
                <span className={`font-mono font-bold text-lg ${topPrediction.edge > 0 ? "text-green-400" : "text-red-400"}`}>
                  {topPrediction.edge > 0 ? "+" : ""}{(topPrediction.edge * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          {topPrediction.reasoning.length > 0 && (
            <ul className="mt-3 text-sm text-gray-500 flex flex-wrap gap-x-4">
              {topPrediction.reasoning.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Best Value (Buy)</h2>
          <div className="space-y-3">
            {buys.slice(0, 4).map((e) => (
              <EdgeCard key={e.songId} edge={e} type="buy" />
            ))}
            {buys.length === 0 && <p className="text-gray-600 text-sm">No buy signals found</p>}
          </div>
        </section>
        <section>
          <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Overpriced (Avoid)</h2>
          <div className="space-y-3">
            {avoids.slice(0, 4).map((e) => (
              <EdgeCard key={e.songId} edge={e} type="avoid" />
            ))}
            {avoids.length === 0 && <p className="text-gray-600 text-sm">No avoid signals found</p>}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 mb-8">
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Edge vs. Market (Model - Market)</h2>
        <EdgeChart edges={edges} />
      </section>

      <section className="rounded-xl border border-gray-700 bg-gray-900/50 p-6 mb-8">
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Full Predictions</h2>
        <PredictionTable edges={edges} />
      </section>

      <footer className="text-xs text-gray-600 mt-8">
        <p>Model: Weighted scoring with mega-hit penalty, solo bonus, trailer signal. Not financial advice.</p>
      </footer>
    </main>
  );
}

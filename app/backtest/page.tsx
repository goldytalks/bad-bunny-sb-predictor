import historicalData from "@/data/historical-sb-openers.json";
import { runBacktest, BacktestResult } from "@/lib/model/backtest";
import Link from "next/link";

export default function BacktestPage() {
  const results = runBacktest(historicalData.shows);
  const top3Count = results.filter((r) => r.inTop3).length;
  const top1Count = results.filter((r) => r.openerRank === 1).length;
  const accuracy = ((top3Count / results.length) * 100).toFixed(0);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/" className="text-pr-blue text-sm hover:underline mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-2">Model Backtest</h1>
      <p className="text-gray-400 text-sm mb-6">
        Testing our Bayesian log-odds model against 20 Super Bowl halftime openers (2006-2025)
        using synthetic catalogs for each show.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-center">
          <div className="text-3xl font-bold font-mono">{accuracy}%</div>
          <div className="text-sm text-gray-400">Top-3 Accuracy</div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-center">
          <div className="text-3xl font-bold font-mono">{top3Count}/{results.length}</div>
          <div className="text-sm text-gray-400">Opener in Top 3</div>
        </div>
        <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 text-center">
          <div className="text-3xl font-bold font-mono">{top1Count}/{results.length}</div>
          <div className="text-sm text-gray-400">Ranked #1</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Results by Year</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-left">
                <th className="py-3 pr-4">Year</th>
                <th className="py-3 pr-4">Artist</th>
                <th className="py-3 pr-4">Actual Opener</th>
                <th className="py-3 pr-4 text-center">Rank</th>
                <th className="py-3 pr-4 text-right">Prob</th>
                <th className="py-3 pr-4">Top Pick</th>
                <th className="py-3 pr-4 text-center">Top 3?</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.year} className="border-b border-gray-800">
                  <td className="py-3 pr-4 font-mono">{r.year}</td>
                  <td className="py-3 pr-4">{r.artist}</td>
                  <td className="py-3 pr-4 font-medium">{r.actualOpener}</td>
                  <td className="py-3 pr-4 text-center font-mono">
                    <span className={r.openerRank <= 3 ? "text-green-400" : "text-red-400"}>
                      #{r.openerRank}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono">
                    {(r.openerProbability * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 pr-4 text-gray-400">{r.topPrediction}</td>
                  <td className="py-3 pr-4 text-center">
                    {r.inTop3 ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-red-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-700 bg-gray-900/50 p-6">
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Methodology</h2>
        <p className="text-sm text-gray-400">
          For each historical show, we create a synthetic 6-song catalog: the actual opener plus
          archetypes (biggest old hit, popular collab, slow ballad, current album deep cut, mid-tier
          upbeat track). We then score all songs with our Bayesian model and check if the actual
          opener ranks in the top 3. This tests whether our likelihood ratios correctly identify
          opener-like songs from non-opener alternatives.
        </p>
      </div>

      <footer className="text-xs text-gray-600 mt-8">
        <p>Bayesian log-odds model with historically-derived likelihood ratios. Not financial advice.</p>
      </footer>
    </main>
  );
}

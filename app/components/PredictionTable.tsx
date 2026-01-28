"use client";

import { EdgeAnalysis } from "@/lib/types";
import { getSignalEmoji, getSignalColor } from "@/lib/utils/probability";

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

function edgePct(n: number) {
  const s = (n * 100).toFixed(1);
  return n > 0 ? `+${s}%` : `${s}%`;
}

export default function PredictionTable({ edges }: { edges: EdgeAnalysis[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 text-left">
            <th className="py-3 pr-4">#</th>
            <th className="py-3 pr-4">Song</th>
            <th className="py-3 pr-4 text-right">Our Model</th>
            <th className="py-3 pr-4 text-right">Kalshi</th>
            <th className="py-3 pr-4 text-right">Polymarket</th>
            <th className="py-3 pr-4 text-right">Edge</th>
            <th className="py-3 pr-4 text-center">Signal</th>
          </tr>
        </thead>
        <tbody>
          {edges.map((e, i) => (
            <tr key={e.songId} className="border-b border-gray-800 hover:bg-gray-900/50">
              <td className="py-3 pr-4 text-gray-500">{i + 1}</td>
              <td className="py-3 pr-4 font-medium">{e.song}</td>
              <td className="py-3 pr-4 text-right font-mono">{pct(e.ourProbability)}</td>
              <td className="py-3 pr-4 text-right font-mono text-gray-400">
                {e.kalshiProbability > 0 ? pct(e.kalshiProbability) : "—"}
              </td>
              <td className="py-3 pr-4 text-right font-mono text-gray-400">
                {e.polymarketProbability > 0 ? pct(e.polymarketProbability) : "—"}
              </td>
              <td className={`py-3 pr-4 text-right font-mono font-bold ${e.edge > 0 ? "text-green-400" : e.edge < -0.02 ? "text-red-400" : "text-gray-400"}`}>
                {e.marketProbability > 0 ? edgePct(e.edge) : "—"}
              </td>
              <td className={`py-3 pr-4 text-center ${getSignalColor(e.signal)}`}>
                {e.marketProbability > 0 ? getSignalEmoji(e.signal) : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

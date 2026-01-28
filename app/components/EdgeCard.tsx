"use client";

import { EdgeAnalysis } from "@/lib/types";
import { getSignalEmoji, getSignalColor } from "@/lib/utils/probability";

export default function EdgeCard({ edge, type }: { edge: EdgeAnalysis; type: "buy" | "avoid" }) {
  const isBuy = type === "buy";
  return (
    <div className={`rounded-lg border p-4 ${isBuy ? "border-green-800 bg-green-950/30" : "border-red-800 bg-red-950/30"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-lg">{edge.song}</span>
        <span className={getSignalColor(edge.signal)}>{getSignalEmoji(edge.signal)}</span>
      </div>
      <div className="flex gap-4 text-sm text-gray-400 mb-2">
        <span>Model: <span className="text-white font-mono">{(edge.ourProbability * 100).toFixed(1)}%</span></span>
        <span>Market: <span className="text-white font-mono">{(edge.marketProbability * 100).toFixed(1)}%</span></span>
      </div>
      <div className={`text-2xl font-bold font-mono ${isBuy ? "text-green-400" : "text-red-400"}`}>
        {edge.edge > 0 ? "+" : ""}{(edge.edge * 100).toFixed(1)}% edge
      </div>
      {edge.reasoning.length > 0 && (
        <ul className="mt-2 text-xs text-gray-500 space-y-0.5">
          {edge.reasoning.slice(0, 3).map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

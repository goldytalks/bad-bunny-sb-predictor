"use client";

import { EdgeAnalysis } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

export default function EdgeChart({ edges }: { edges: EdgeAnalysis[] }) {
  const data = edges
    .filter((e) => e.marketProbability > 0)
    .map((e) => ({
      name: e.song.length > 16 ? e.song.slice(0, 14) + "..." : e.song,
      edge: Math.round(e.edge * 1000) / 10,
    }))
    .sort((a, b) => b.edge - a.edge);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="#6b7280" fontSize={12} />
        <YAxis type="category" dataKey="name" width={130} stroke="#6b7280" fontSize={11} />
        <Tooltip
          formatter={(value: number) => [`${value}%`, "Edge"]}
          contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
        />
        <ReferenceLine x={0} stroke="#6b7280" />
        <Bar dataKey="edge" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.edge > 0 ? "#22c55e" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

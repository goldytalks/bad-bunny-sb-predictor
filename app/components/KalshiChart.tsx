"use client";

import { useEffect, useRef, useState } from "react";
import { MarketPrice } from "@/lib/types";

type ChartMode = "bar" | "line";

const LINE_COLORS = [
  "#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4",
  "#42d4f4", "#f032e6", "#bfef45", "#fabed4", "#469990",
];

export default function KalshiChart({ prices }: { prices: MarketPrice[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [mode, setMode] = useState<ChartMode>("bar");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [livePrices, setLivePrices] = useState(prices);
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const [mini, setMini] = useState(false);

  const sorted = livePrices
    .filter((m) => m.midpoint > 0)
    .sort((a, b) => b.midpoint - a.midpoint);

  // Initialize selection with top 5
  useEffect(() => {
    if (selected.size === 0 && sorted.length > 0) {
      setSelected(new Set(sorted.slice(0, 5).map((m) => m.songId)));
    }
  }, [sorted.length]);

  // Poll for live updates every 60s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/predictions");
        if (res.ok) {
          const data = await res.json();
          if (data.kalshiPrices?.length > 0) {
            setLivePrices(data.kalshiPrices);
            setHistory((prev) => {
              const next = { ...prev };
              for (const p of data.kalshiPrices) {
                if (!next[p.songId]) next[p.songId] = [];
                next[p.songId] = [...next[p.songId].slice(-29), p.midpoint];
              }
              return next;
            });
          }
        }
      } catch { /* silent */ }
    };

    // Seed history
    setHistory((prev) => {
      const next = { ...prev };
      for (const p of prices) {
        if (!next[p.songId]) next[p.songId] = [p.midpoint];
      }
      return next;
    });

    const interval = setInterval(poll, 60_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = sorted.filter(
    (m) => selected.size === 0 || selected.has(m.songId)
  );

  // Assign stable colors to songs
  const songColorMap: Record<string, string> = {};
  sorted.forEach((m, i) => {
    songColorMap[m.songId] = LINE_COLORS[i % LINE_COLORS.length];
  });

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth * 2; // retina
      canvas.height = parent.clientHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const drawBar = () => {
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      if (filtered.length === 0) return;

      const padTop = 40;
      const padBot = 16;
      const padLeft = 16;
      const gap = 8;
      const barH = Math.min(32, (h - padTop - padBot - gap * (filtered.length - 1)) / filtered.length);
      const maxVal = Math.max(...filtered.map((m) => m.midpoint), 0.35);
      const barArea = w - padLeft - 16;

      // Title
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("KALSHI LIVE PRICES", padLeft, 24);
      ctx.font = "12px 'Space Mono', monospace";
      ctx.fillStyle = "#999";
      ctx.fillText(`${filtered.length} SONGS`, padLeft + 220, 24);

      filtered.forEach((m, i) => {
        const y = padTop + i * (barH + gap);
        const barW = Math.max(6, (barArea * 0.45 * m.midpoint) / maxVal);

        // Bar
        ctx.fillStyle = "#000";
        ctx.fillRect(padLeft, y, barW, barH);

        // Percentage inside bar
        const pctText = (m.midpoint * 100).toFixed(1) + "%";
        ctx.font = "bold 13px 'Space Mono', monospace";
        if (barW > 70) {
          ctx.fillStyle = "#FFF";
          ctx.textAlign = "right";
          ctx.fillText(pctText, padLeft + barW - 8, y + barH / 2 + 5);
        }

        // Song name to the right
        ctx.fillStyle = "#000";
        ctx.font = "bold 13px 'Space Mono', monospace";
        ctx.textAlign = "left";
        const nameX = padLeft + barW + 10;
        const nameText = barW <= 70 ? `${m.song}  ${pctText}` : m.song;
        ctx.fillText(nameText, nameX, y + barH / 2 + 5);
      });
    };

    const drawLine = () => {
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      const padTop = 40;
      const padBot = 40;
      const padLeft = 55;
      const padRight = 20;
      const chartW = w - padLeft - padRight;
      const chartH = h - padTop - padBot;

      // Title
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px 'Space Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("KALSHI PRICE HISTORY", 16, 24);

      // Determine max Y from data
      const allVals = filtered.flatMap((m) => history[m.songId] ?? [m.midpoint]);
      const maxY = Math.max(0.1, Math.ceil(Math.max(...allVals, 0.05) * 10) / 10 + 0.05);

      // Y-axis
      ctx.font = "11px 'Space Mono', monospace";
      ctx.textAlign = "right";
      const ySteps = 5;
      for (let i = 0; i <= ySteps; i++) {
        const v = (maxY / ySteps) * i;
        const y = h - padBot - (chartH * v) / maxY;
        ctx.fillStyle = "#999";
        ctx.fillText((v * 100).toFixed(0) + "%", padLeft - 8, y + 4);
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();
      }

      // Draw lines with real colors
      const legend: { song: string; color: string; val: number; y: number }[] = [];

      filtered.forEach((m) => {
        const pts = history[m.songId] ?? [m.midpoint];
        if (pts.length < 1) return;
        const color = songColorMap[m.songId] || "#000";

        // Line
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.beginPath();
        pts.forEach((val, j) => {
          const x = padLeft + (j / Math.max(pts.length - 1, 1)) * chartW;
          const y = h - padBot - (chartH * Math.min(val, maxY)) / maxY;
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dot at end
        const lastVal = pts[pts.length - 1];
        const endX = padLeft + chartW;
        const endY = h - padBot - (chartH * Math.min(lastVal, maxY)) / maxY;
        ctx.beginPath();
        ctx.arc(endX, endY, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        legend.push({ song: m.song, color, val: lastVal, y: endY });
      });

      // Legend at bottom
      ctx.font = "bold 11px 'Space Mono', monospace";
      ctx.textAlign = "left";
      let lx = padLeft;
      const ly = h - 12;
      legend.forEach((item) => {
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, ly - 8, 10, 10);
        ctx.fillStyle = "#000";
        const label = `${item.song.length > 10 ? item.song.slice(0, 9) + ".." : item.song} ${(item.val * 100).toFixed(0)}%`;
        ctx.fillText(label, lx + 14, ly + 1);
        lx += ctx.measureText(label).width + 24;
        if (lx > w - 50) { lx = padLeft; } // wrap
      });
    };

    let running = true;
    const draw = () => {
      if (!running) return;
      if (mode === "bar") drawBar(); else drawLine();
      // Only animate bar chart (scanner line), line is static
      if (mode === "bar") {
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    draw();

    window.addEventListener("resize", resize);
    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mode, filtered, history, songColorMap]);

  const toggleSong = (songId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId); else next.add(songId);
      return next;
    });
  };

  const wrapperClass = mini
    ? "fixed bottom-4 right-4 w-[420px] h-[360px] z-50 border-2 border-black shadow-[8px_8px_0px_#000] bg-white"
    : "flex flex-col w-full h-full";

  return (
    <div className={wrapperClass}>
      {/* Controls */}
      <div className="flex gap-0 border-b-2 border-black bg-[#EAEAEA] shrink-0">
        <button
          onClick={() => setMode("bar")}
          className={`px-4 py-2 text-xs font-bold border-r-2 border-black transition-colors ${
            mode === "bar" ? "bg-black text-[#EAEAEA]" : "hover:bg-[#39FF14]"
          }`}
        >
          BAR
        </button>
        <button
          onClick={() => setMode("line")}
          className={`px-4 py-2 text-xs font-bold border-r-2 border-black transition-colors ${
            mode === "line" ? "bg-black text-[#EAEAEA]" : "hover:bg-[#39FF14]"
          }`}
        >
          LINE
        </button>
        <button
          onClick={() => setMini(!mini)}
          className="px-4 py-2 text-xs font-bold border-r-2 border-black hover:bg-[#39FF14] transition-colors ml-auto"
        >
          {mini ? "EXPAND" : "MINI"}
        </button>
        {mini && (
          <button
            onClick={() => setMini(false)}
            className="px-4 py-2 text-xs font-bold hover:bg-red-400 transition-colors"
          >
            X
          </button>
        )}
      </div>

      {/* Song toggles */}
      {!mini && (
        <div className="flex flex-wrap gap-0 border-b-2 border-black bg-[#EAEAEA] shrink-0">
          {sorted.slice(0, 10).map((m) => (
            <button
              key={m.songId}
              onClick={() => toggleSong(m.songId)}
              className={`px-3 py-1.5 text-[10px] font-bold border-r border-b border-black/20 transition-colors ${
                selected.has(m.songId)
                  ? "bg-black text-[#EAEAEA]"
                  : "hover:bg-[#39FF14]/30 text-[#555]"
              }`}
            >
              {m.song}
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 min-h-0 bg-white">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

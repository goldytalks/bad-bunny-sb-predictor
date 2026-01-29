"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MarketPrice } from "@/lib/types";

type ChartMode = "bar" | "line";

export default function KalshiChart({ prices }: { prices: MarketPrice[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [mode, setMode] = useState<ChartMode>("bar");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [livePrices, setLivePrices] = useState(prices);
  const [history, setHistory] = useState<Record<string, number[]>>({});

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
            // Append to history
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

    // Seed history from initial prices
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

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
    };
    resize();

    const drawBar = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#39FF14";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      if (filtered.length === 0) return;

      const padTop = 36;
      const padBot = 10;
      const padLeft = 14;
      const padRight = 14;
      const gap = 6;
      const barH = Math.min(36, (h - padTop - padBot - gap * (filtered.length - 1)) / filtered.length);
      const maxVal = Math.max(...filtered.map((m) => m.midpoint), 0.35);

      // Title
      ctx.fillStyle = "#000";
      ctx.font = "bold 13px 'Space Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("KALSHI LIVE PRICES", padLeft, 22);
      ctx.font = "11px 'Space Mono', monospace";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText(`${filtered.length} SONGS`, padLeft + 200, 22);

      filtered.forEach((m, i) => {
        const y = padTop + i * (barH + gap);
        const barW = Math.max(4, ((w - padLeft - padRight - 160) * m.midpoint) / maxVal);

        // Bar
        ctx.fillStyle = "#000";
        ctx.fillRect(padLeft, y, barW, barH);

        // Song name (full, to the right of bar)
        ctx.fillStyle = "#000";
        ctx.font = "bold 11px 'Space Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(m.song, padLeft + barW + 8, y + barH / 2 + 4);

        // Percentage inside bar (if wide enough)
        const pctText = (m.midpoint * 100).toFixed(1) + "%";
        ctx.font = "bold 12px 'Space Mono', monospace";
        if (barW > 60) {
          ctx.fillStyle = "#39FF14";
          ctx.textAlign = "right";
          ctx.fillText(pctText, padLeft + barW - 6, y + barH / 2 + 4);
        } else {
          // Show after name
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.textAlign = "left";
          const nameW = ctx.measureText(m.song).width;
          ctx.fillText(pctText, padLeft + barW + 8 + nameW + 8, y + barH / 2 + 4);
        }
      });

      // Scanner line
      const scanX = (Date.now() / 20) % w;
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, h);
      ctx.stroke();
    };

    const drawLine = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#39FF14";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      const padTop = 36;
      const padBot = 30;
      const padLeft = 50;
      const padRight = 14;

      ctx.fillStyle = "#000";
      ctx.font = "bold 13px 'Space Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText("KALSHI PRICE HISTORY", 14, 22);

      // Y-axis labels
      const maxY = 0.4;
      ctx.font = "10px 'Space Mono', monospace";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.textAlign = "right";
      for (let v = 0; v <= maxY; v += 0.1) {
        const y = h - padBot - ((h - padTop - padBot) * v) / maxY;
        ctx.fillText((v * 100).toFixed(0) + "%", padLeft - 6, y + 3);
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();
      }

      const colors = ["#000", "#333", "#555", "#777", "#222", "#444", "#666", "#888"];
      let colorIdx = 0;

      filtered.forEach((m) => {
        const pts = history[m.songId] ?? [m.midpoint];
        if (pts.length < 1) return;
        const color = colors[colorIdx % colors.length];
        colorIdx++;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        pts.forEach((val, j) => {
          const x = padLeft + (j / Math.max(pts.length - 1, 1)) * (w - padLeft - padRight);
          const y = h - padBot - ((h - padTop - padBot) * Math.min(val, maxY)) / maxY;
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Label at end
        const lastVal = pts[pts.length - 1];
        const endX = w - padRight;
        const endY = h - padBot - ((h - padTop - padBot) * Math.min(lastVal, maxY)) / maxY;
        ctx.fillStyle = color;
        ctx.font = "bold 10px 'Space Mono', monospace";
        ctx.textAlign = "right";
        ctx.fillText(`${m.song} ${(lastVal * 100).toFixed(0)}%`, endX - 4, endY - 6);

        // Dot at end
        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    const draw = () => {
      if (mode === "bar") drawBar(); else drawLine();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mode, filtered, history]);

  const toggleSong = (songId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId); else next.add(songId);
      return next;
    });
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Controls */}
      <div className="flex gap-0 border-b-2 border-black bg-[#EAEAEA]">
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
        <div className="px-3 py-2 text-[10px] font-bold text-[#555] flex items-center">
          CLICK SONGS TO FILTER:
        </div>
      </div>

      {/* Song toggles */}
      <div className="flex flex-wrap gap-0 border-b-2 border-black bg-[#EAEAEA]">
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
            {m.song.length > 14 ? m.song.slice(0, 12) + ".." : m.song}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", background: "#39FF14" }} />
      </div>
    </div>
  );
}

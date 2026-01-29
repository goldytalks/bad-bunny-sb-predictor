"use client";

import { useEffect, useRef } from "react";
import { MarketPrice } from "@/lib/types";

export default function KalshiChart({ prices }: { prices: MarketPrice[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const pricesRef = useRef(prices);
  pricesRef.current = prices;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.parentElement!.clientWidth;
      canvas.height = canvas.parentElement!.clientHeight;
    };
    resize();

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const p = pricesRef.current
        .filter((m) => m.midpoint > 0)
        .sort((a, b) => b.midpoint - a.midpoint)
        .slice(0, 10);

      // Background
      ctx.fillStyle = "#39FF14";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      if (p.length === 0) {
        // Animated sine wave fallback
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (let x = 0; x < w; x += 10) {
          const y = h / 2 + Math.sin(x * 0.02 + Date.now() * 0.002) * 80 + Math.sin(x * 0.1) * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = "#000000";
        for (let i = 0; i < 3; i++) {
          const x = (Date.now() / 10 + i * 100) % w;
          const y = h / 2 + Math.sin(x * 0.02 + Date.now() * 0.002) * 80;
          ctx.fillRect(x, y - 5, 10, 10);
        }
      } else {
        // Bar chart of Kalshi prices
        const padding = { top: 30, bottom: 20, left: 10, right: 50 };
        const barH = Math.min(30, (h - padding.top - padding.bottom) / p.length - 4);
        const maxVal = Math.max(...p.map((m) => m.midpoint), 0.4);

        // Title
        ctx.fillStyle = "#000000";
        ctx.font = "bold 12px 'Space Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText("KALSHI LIVE PRICES", padding.left, 18);

        p.forEach((m, i) => {
          const y = padding.top + i * (barH + 4);
          const barW = ((w - padding.left - padding.right) * m.midpoint) / maxVal;

          // Bar
          ctx.fillStyle = "#000000";
          ctx.fillRect(padding.left, y, barW, barH);

          // Label
          ctx.fillStyle = "#000000";
          ctx.font = "bold 10px 'Space Mono', monospace";
          ctx.textAlign = "left";
          const label = m.song.length > 12 ? m.song.slice(0, 10) + ".." : m.song;
          ctx.fillText(label, padding.left + barW + 4, y + barH / 2 + 4);

          // Percentage
          ctx.textAlign = "right";
          ctx.fillText(
            (m.midpoint * 100).toFixed(0) + "%",
            padding.left + barW - 4,
            y + barH / 2 + 4
          );
          // Only show if bar is wide enough
          if (barW < 40) {
            ctx.textAlign = "left";
            ctx.fillText(
              (m.midpoint * 100).toFixed(0) + "%",
              padding.left + barW + 4,
              y + barH / 2 + 4
            );
          }
        });

        // Animated scanner line
        const scanX = (Date.now() / 15) % w;
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, h);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", background: "#39FF14" }} />;
}

import { NextResponse } from "next/server";
import songsData from "@/songs.json";
import { generatePredictions } from "@/lib/model/scoring";
import { calculateEdge } from "@/lib/utils/probability";
import { fetchKalshiPrices } from "@/lib/data/kalshi";
import { fetchPolymarketPrices } from "@/lib/data/polymarket";
import { MARKET_PRICES } from "@/lib/data/market-prices";
import { Song } from "@/lib/types";

export const revalidate = 300;

export async function GET() {
  const songs = songsData.songs as Song[];
  const predictions = generatePredictions(songs);

  let kalshiPrices = MARKET_PRICES;
  let polyPrices = undefined;
  const sources: string[] = [];

  try {
    const live = await fetchKalshiPrices();
    if (live.length > 0) { kalshiPrices = live; sources.push("kalshi-live"); }
    else { sources.push("kalshi-fallback"); }
  } catch { sources.push("kalshi-fallback"); }

  try {
    const live = await fetchPolymarketPrices();
    if (live.length > 0) { polyPrices = live; sources.push("polymarket-live"); }
  } catch { /* skip */ }

  const edges = calculateEdge(predictions, kalshiPrices, polyPrices);

  return NextResponse.json({
    predictions,
    edges,
    kalshiPrices,
    polymarketPrices: polyPrices ?? [],
    sources,
    lastUpdated: new Date().toISOString(),
  });
}

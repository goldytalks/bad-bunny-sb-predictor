import { NextResponse } from "next/server";
import songsData from "@/songs.json";
import { generatePredictions } from "@/lib/model/scoring";
import { calculateEdge } from "@/lib/utils/probability";
import { fetchKalshiPrices } from "@/lib/data/kalshi";
import { MARKET_PRICES } from "@/lib/data/market-prices";
import { Song } from "@/lib/types";

export const revalidate = 300; // 5 minutes

export async function GET() {
  const songs = songsData.songs as Song[];
  const predictions = generatePredictions(songs);

  let marketPrices = MARKET_PRICES;
  let marketSource = "manual";

  try {
    const kalshiPrices = await fetchKalshiPrices();
    if (kalshiPrices.length > 0) {
      marketPrices = kalshiPrices;
      marketSource = "kalshi-live";
    }
  } catch (e) {
    console.error("Kalshi fetch failed, using fallback:", e);
  }

  const edges = calculateEdge(predictions, marketPrices);

  return NextResponse.json({
    predictions,
    edges,
    marketPrices,
    marketSource,
    lastUpdated: new Date().toISOString(),
  });
}

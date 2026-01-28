import { NextResponse } from "next/server";
import songsData from "@/songs.json";
import { generatePredictions } from "@/lib/model/scoring";
import { calculateEdge } from "@/lib/utils/probability";
import { MARKET_PRICES } from "@/lib/data/market-prices";
import { Song } from "@/lib/types";

export async function GET() {
  const songs = songsData.songs as Song[];
  const predictions = generatePredictions(songs);
  const edges = calculateEdge(predictions, MARKET_PRICES);

  return NextResponse.json({
    predictions,
    edges,
    marketPrices: MARKET_PRICES,
    lastUpdated: new Date().toISOString(),
  });
}

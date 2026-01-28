import { Prediction, MarketPrice, EdgeAnalysis } from "../types";

export function getEdgeSignal(edge: number): EdgeAnalysis["signal"] {
  if (edge > 0.05) return "strong-buy";
  if (edge > 0.02) return "buy";
  if (edge > -0.02) return "neutral";
  if (edge > -0.05) return "avoid";
  return "strong-avoid";
}

export function getSignalEmoji(signal: EdgeAnalysis["signal"]): string {
  switch (signal) {
    case "strong-buy": return "\uD83D\uDD25";
    case "buy": return "\uD83D\uDCC8";
    case "neutral": return "\u2796";
    case "avoid": return "\u26A0\uFE0F";
    case "strong-avoid": return "\uD83D\uDEAB";
  }
}

export function getSignalColor(signal: EdgeAnalysis["signal"]): string {
  switch (signal) {
    case "strong-buy": return "text-green-400";
    case "buy": return "text-green-300";
    case "neutral": return "text-gray-400";
    case "avoid": return "text-yellow-400";
    case "strong-avoid": return "text-red-400";
  }
}

export function calculateEdge(
  predictions: Prediction[],
  kalshiPrices: MarketPrice[],
  polymarketPrices?: MarketPrice[]
): EdgeAnalysis[] {
  return predictions.map((pred) => {
    const kalshi = kalshiPrices.find((m) => m.songId === pred.songId);
    const poly = polymarketPrices?.find((m) => m.songId === pred.songId);

    const kalshiProb = kalshi?.midpoint ?? 0;
    const polyProb = poly?.midpoint ?? 0;

    // Use average of available markets, or whichever is available
    let marketProb = 0;
    if (kalshiProb > 0 && polyProb > 0) {
      marketProb = (kalshiProb + polyProb) / 2;
    } else {
      marketProb = kalshiProb || polyProb;
    }

    const edge = pred.probability - marketProb;

    return {
      song: pred.song,
      songId: pred.songId,
      ourProbability: pred.probability,
      marketProbability: marketProb,
      kalshiProbability: kalshiProb,
      polymarketProbability: polyProb,
      edge,
      signal: getEdgeSignal(edge),
      confidence: pred.confidence,
      reasoning: pred.reasoning,
    };
  });
}

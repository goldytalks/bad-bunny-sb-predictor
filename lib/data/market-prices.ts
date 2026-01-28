import { MarketPrice } from "../types";

// Fallback market prices from Kalshi as of Jan 28, 2026
// Used when live API fetch fails
export const MARKET_PRICES: MarketPrice[] = [
  { song: "Tití Me Preguntó", songId: "titi-me-pregunto", yesBid: 0.41, yesAsk: 0.42, midpoint: 0.415, source: "manual" },
  { song: "BAILE INoLVIDABLE", songId: "baile-inolvidable", yesBid: 0.23, yesAsk: 0.24, midpoint: 0.235, source: "manual" },
  { song: "LA MuDANZA", songId: "la-mudanza", yesBid: 0.20, yesAsk: 0.22, midpoint: 0.21, source: "manual" },
  { song: "NUEVAYoL", songId: "nuevayol", yesBid: 0.08, yesAsk: 0.09, midpoint: 0.085, source: "manual" },
  { song: "I Like It", songId: "i-like-it", yesBid: 0.04, yesAsk: 0.05, midpoint: 0.045, source: "manual" },
  { song: "DÁKITI", songId: "dakiti", yesBid: 0.03, yesAsk: 0.04, midpoint: 0.035, source: "manual" },
  { song: "DtMF", songId: "dtmf", yesBid: 0.02, yesAsk: 0.03, midpoint: 0.025, source: "manual" },
  { song: "Me Porto Bonito", songId: "me-porto-bonito", yesBid: 0.01, yesAsk: 0.02, midpoint: 0.015, source: "manual" },
  { song: "Callaita", songId: "callaita", yesBid: 0.00, yesAsk: 0.02, midpoint: 0.01, source: "manual" },
  { song: "Efecto", songId: "efecto", yesBid: 0.00, yesAsk: 0.01, midpoint: 0.005, source: "manual" },
];

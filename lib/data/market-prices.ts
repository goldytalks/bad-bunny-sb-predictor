import { MarketPrice } from "../types";

// Manual market prices based on current Kalshi/sportsbook data (late Jan 2026)
// Update these as markets move
export const MARKET_PRICES: MarketPrice[] = [
  { song: "BAILE INoLVIDABLE", songId: "baile-inolvidable", yesBid: 0.31, yesAsk: 0.34, midpoint: 0.325 },
  { song: "DÁKITI", songId: "dakiti", yesBid: 0.14, yesAsk: 0.16, midpoint: 0.15 },
  { song: "Tití Me Preguntó", songId: "titi-me-pregunto", yesBid: 0.10, yesAsk: 0.13, midpoint: 0.115 },
  { song: "DtMF", songId: "dtmf", yesBid: 0.10, yesAsk: 0.13, midpoint: 0.115 },
  { song: "MONACO", songId: "monaco", yesBid: 0.08, yesAsk: 0.12, midpoint: 0.10 },
  { song: "Me Porto Bonito", songId: "me-porto-bonito", yesBid: 0.05, yesAsk: 0.08, midpoint: 0.065 },
  { song: "NUEVAYoL", songId: "nuevayol", yesBid: 0.05, yesAsk: 0.09, midpoint: 0.07 },
  { song: "VOY A LLeVARTE PA PR", songId: "voy-a-llevarte-pa-pr", yesBid: 0.04, yesAsk: 0.08, midpoint: 0.06 },
  { song: "ALAMBRE PúA", songId: "alambre-pua", yesBid: 0.03, yesAsk: 0.06, midpoint: 0.045 },
  { song: "Efecto", songId: "efecto", yesBid: 0.02, yesAsk: 0.04, midpoint: 0.03 },
  { song: "WHERE SHE GOES", songId: "where-she-goes", yesBid: 0.01, yesAsk: 0.03, midpoint: 0.02 },
  { song: "Callaita", songId: "callaita", yesBid: 0.01, yesAsk: 0.03, midpoint: 0.02 },
  { song: "NEW/UNRELEASED SONG", songId: "new-unreleased", yesBid: 0.02, yesAsk: 0.05, midpoint: 0.035 },
];

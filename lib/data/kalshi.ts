import { MarketPrice } from "../types";

const KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2";
const EVENT_TICKER = "KXFIRSTSUPERBOWLSONG-26FEB09";

// Map Kalshi market suffixes to our song IDs
const KALSHI_TO_SONG_ID: Record<string, string> = {
  BAI: "baile-inolvidable",
  TIT: "titi-me-pregunto",
  LAM: "la-mudanza",
  NUE: "nuevayol",
  LIK: "i-like-it",
  DAK: "dakiti",
  DTM: "dtmf",
  MEP: "me-porto-bonito",
  CAL: "callaita",
  EFE: "efecto",
  PER: "perro-negro",
  SAF: "safaera",
  OJI: "ojitos-lindos",
  LAS: "la-santa",
  LAC: "la-cancion",
  LAJ: "la-jumpa",
  MIA: "mia",
  NEV: "neverita",
  NOM: "no-me-conoce",
  TOB: "te-bote",
  UNX: "un-x100to",
  YON: "yonaguni",
};

const KALSHI_TO_SONG_NAME: Record<string, string> = {
  BAI: "BAILE INoLVIDABLE",
  TIT: "Tití Me Preguntó",
  LAM: "LA MuDANZA",
  NUE: "NUEVAYoL",
  LIK: "I Like It",
  DAK: "DÁKITI",
  DTM: "DtMF",
  MEP: "Me Porto Bonito",
  CAL: "Callaita",
  EFE: "Efecto",
  PER: "PERRO NEGRO",
  SAF: "Safaera",
  OJI: "Ojitos Lindos",
  LAS: "La Santa",
  LAC: "LA CANCIÓN",
  LAJ: "La Jumpa",
  MIA: "MIA",
  NEV: "Neverita",
  NOM: "No Me Conoce - Remix",
  TOB: "Te Boté - Remix",
  UNX: "un x100to",
  YON: "Yonaguni",
};

interface KalshiMarket {
  ticker: string;
  yes_bid: number;
  yes_ask: number;
  last_price: number;
  volume: number;
}

export async function fetchKalshiPrices(): Promise<MarketPrice[]> {
  const url = `${KALSHI_API_BASE}/markets?event_ticker=${EVENT_TICKER}&limit=100`;

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`Kalshi API error: ${res.status}`);
  }

  const data = await res.json();
  const markets: KalshiMarket[] = data.markets ?? [];

  return markets.map((m) => {
    const suffix = m.ticker.split("-").pop() ?? "";
    const yesBid = m.yes_bid / 100;
    const yesAsk = m.yes_ask / 100;
    return {
      song: KALSHI_TO_SONG_NAME[suffix] ?? suffix,
      songId: KALSHI_TO_SONG_ID[suffix] ?? suffix.toLowerCase(),
      yesBid,
      yesAsk,
      midpoint: (yesBid + yesAsk) / 2,
      lastPrice: m.last_price / 100,
      volume: m.volume,
      source: "kalshi" as const,
    };
  });
}

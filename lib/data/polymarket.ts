import { MarketPrice } from "../types";

const GAMMA_API = "https://gamma-api.polymarket.com";
const EVENT_SLUG = "first-song-at-super-bowl-lx-halftime-show";

// Map Polymarket song names to our song IDs
const POLY_TO_SONG_ID: Record<string, string> = {
  "Tití Me Preguntó": "titi-me-pregunto",
  "LA MUDANZA": "la-mudanza",
  "BAILE INOLVIDABLE": "baile-inolvidable",
  "NUEVAYOL": "nuevayol",
  "DtMF": "dtmf",
  "I Like It": "i-like-it",
  "DÁKITI": "dakiti",
  "Efecto": "efecto",
  "PERRO NEGRO": "perro-negro",
  "Callaita": "callaita",
  "La Santa": "la-santa",
  "LA CANCIÓN": "la-cancion",
  "Safaera": "safaera",
  "Yonaguni": "yonaguni",
  "Te Boté - Remix": "te-bote",
  "La Jumpa": "la-jumpa",
  "un x100to": "un-x100to",
  "Me Porto Bonito": "me-porto-bonito",
  "No Me Conoce - Remix": "no-me-conoce",
  "Ojitos Lindos": "ojitos-lindos",
  "Neverita": "neverita",
  "MIA": "mia",
};

// Normalize Polymarket titles to song names
function extractSongName(title: string): string {
  // Titles look like: "Will Tití Me Preguntó be played first at the Super Bowl halftime show?"
  const match = title.match(/^Will (.+?) be played first/i);
  return match?.[1] ?? title;
}

interface GammaMarket {
  id: number;
  question: string;
  conditionId: string;
  outcomePrices: string; // JSON string like "[0.455, 0.545]"
  volume: number;
  liquidity: number;
  active: boolean;
}

interface GammaEvent {
  id: number;
  slug: string;
  title: string;
  markets: GammaMarket[];
}

export async function fetchPolymarketPrices(): Promise<MarketPrice[]> {
  const url = `${GAMMA_API}/events?slug=${EVENT_SLUG}`;
  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error(`Polymarket API error: ${res.status}`);
  }

  const events: GammaEvent[] = await res.json();
  if (!events.length || !events[0].markets) {
    return [];
  }

  const markets = events[0].markets.filter((m) => m.active);

  return markets
    .map((m) => {
      const songName = extractSongName(m.question);
      let yesPrice = 0;
      try {
        const prices = JSON.parse(m.outcomePrices);
        yesPrice = parseFloat(prices[0]) || 0;
      } catch {
        return null;
      }

      const songId = POLY_TO_SONG_ID[songName] ?? songName.toLowerCase().replace(/\s+/g, "-");

      return {
        song: songName,
        songId,
        yesBid: yesPrice,
        yesAsk: yesPrice,
        midpoint: yesPrice,
        volume: m.volume,
        source: "polymarket" as const,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null && p.midpoint > 0) as MarketPrice[];
}

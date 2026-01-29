import songsData from "@/songs.json";
import { Song } from "@/lib/types";
import { generatePredictions } from "@/lib/model/scoring";
import { calculateEdge } from "@/lib/utils/probability";
import { fetchKalshiPrices } from "@/lib/data/kalshi";
import { fetchPolymarketPrices } from "@/lib/data/polymarket";
import { MARKET_PRICES } from "@/lib/data/market-prices";
import KalshiChart from "./components/KalshiChart";
import BarFill from "./components/BarFill";

export const revalidate = 300;

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

function edgeStr(n: number) {
  const s = (n * 100).toFixed(1);
  return n > 0 ? `+${s}%` : `${s}%`;
}

export default async function Home() {
  const songs = songsData.songs as Song[];
  const predictions = generatePredictions(songs);

  const sources: string[] = [];

  let kalshiPrices = MARKET_PRICES;
  try {
    const live = await fetchKalshiPrices();
    if (live.length > 0) { kalshiPrices = live; sources.push("KALSHI_LIVE"); }
    else { sources.push("KALSHI_FALLBACK"); }
  } catch { sources.push("KALSHI_FALLBACK"); }

  let polyPrices = undefined;
  try {
    const live = await fetchPolymarketPrices();
    if (live.length > 0) { polyPrices = live; sources.push("POLY_LIVE"); }
  } catch { /* no polymarket data */ }

  const edges = calculateEdge(predictions, kalshiPrices, polyPrices);

  const topPrediction = edges[0];
  const buys = edges.filter((e) => e.edge > 0.02 && e.marketProbability > 0).sort((a, b) => b.edge - a.edge);
  const avoids = edges.filter((e) => e.edge < -0.02 && e.marketProbability > 0).sort((a, b) => a.edge - b.edge);
  const top6 = edges.slice(0, 6);

  const daysLeft = Math.ceil(
    (new Date("2026-02-08").getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const tickerItems = edges.slice(0, 8).map((e) => {
    const arrow = e.edge > 0 ? "▲" : e.edge < 0 ? "▼" : "—";
    return `${e.song} ${pct(e.ourProbability)} ${arrow}`;
  });
  const tickerText = tickerItems.join(" | ") + " | SB LX: " + (daysLeft > 0 ? `T-${daysLeft} DAYS` : "TODAY") + " | " + sources.join(" + ") + " | ";

  return (
    <div className="max-w-[1440px] mx-auto border-l-2 border-r-2 border-black min-h-screen bg-[#EAEAEA] relative">
      {/* Ticker Tape */}
      <div className="bg-[#39FF14] text-black py-3 border-b-2 border-black overflow-hidden whitespace-nowrap font-bold">
        <div className="inline-block text-lg" style={{ animation: "ticker 25s linear infinite" }}>
          {tickerText}{tickerText}
        </div>
      </div>

      {/* Header */}
      <header className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b-2 border-black">
        <div className="text-[2.5rem] p-4 tracking-tight bg-black text-[#EAEAEA] flex items-center font-bold">
          BB_PREDICT V.2.2
        </div>
        <div className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors cursor-pointer">
          <a href="/research">RESEARCH</a>
        </div>
        <div className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors cursor-pointer">
          <a href="/backtest">BACKTEST</a>
        </div>
        <div className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors cursor-pointer">
          MKT_DATA
        </div>
      </header>

      {/* Hero Grid */}
      <div className="grid grid-cols-[65%_35%] border-b-2 border-black">
        <div className="p-16 border-r-2 border-black relative">
          <div className="text-base flex gap-8 mb-8 font-bold opacity-60">
            <span>[SECTOR: PREDICTION_MKT]</span>
            <span>[SB_LX: FEB_08_2026]</span>
          </div>
          <h1 className="text-[7rem] leading-[0.8] mb-12 font-bold tracking-[-3px] text-black">
            FIRST<br />SONG<br />ENGINE_
          </h1>
          <div className="mt-8">
            <p className="text-xl font-bold text-black mb-12 max-w-[80%]">
              {topPrediction
                ? <>TOP PICK: {topPrediction.song.toUpperCase()} AT {pct(topPrediction.ourProbability)}.{" "}
                    {topPrediction.marketProbability > 0 && <>EDGE: {edgeStr(topPrediction.edge)}.</>}</>
                : "LOADING PREDICTIONS..."}
            </p>
            <a
              href="#predictions"
              className="bg-[#EAEAEA] border-2 border-black text-black px-12 py-6 font-bold text-2xl inline-block"
              style={{ boxShadow: "8px 8px 0px #000000" }}
            >
              VIEW EDGE
            </a>
          </div>
        </div>

        {/* Kalshi Chart */}
        <div className="relative overflow-hidden flex items-center justify-center min-h-[500px]">
          <KalshiChart prices={kalshiPrices} />
        </div>
      </div>

      {/* Data Table - Top Songs */}
      <div id="predictions" className="grid grid-cols-[2fr_2fr_1fr] border-b-2 border-black">
        {/* Headers */}
        <div className="p-6 border-r-2 border-black bg-black text-[#EAEAEA] text-xl font-bold border-b-2">
          SONG_PROBABILITY
        </div>
        <div className="p-6 border-r-2 border-black bg-black text-[#EAEAEA] text-xl font-bold border-b-2">
          MKT_PRICE
        </div>
        <div className="p-6 bg-black text-[#EAEAEA] text-xl font-bold border-b-2">
          EDGE
        </div>

        {/* Rows */}
        {top6.map((e, i) => (
          <>
            <div key={`song-${e.songId}`} className="p-6 border-r-2 border-black flex flex-col justify-center">
              <span className="font-bold">{e.song}</span>
              <BarFill percentage={Math.round(e.ourProbability * 100 * 3)} />
            </div>
            <div key={`mkt-${e.songId}`} className="p-6 border-r-2 border-black flex flex-col justify-center text-2xl font-bold">
              {e.kalshiProbability > 0 ? pct(e.kalshiProbability) : "—"}
              {e.polymarketProbability > 0 && (
                <span className="text-sm font-normal text-[#555] block">POLY: {pct(e.polymarketProbability)}</span>
              )}
            </div>
            <div
              key={`edge-${e.songId}`}
              className={`p-6 flex flex-col justify-center text-2xl font-bold ${
                e.edge > 0.02 ? "text-black bg-[#39FF14]" : e.edge < -0.02 ? "text-[#EAEAEA] bg-black" : ""
              }`}
            >
              {e.marketProbability > 0 ? edgeStr(e.edge) : "—"}
            </div>
          </>
        ))}
      </div>

      {/* Manifesto */}
      <div className="p-16 text-[2.5rem] leading-[1.1] border-b-2 border-black font-bold tracking-[-1px]">
        &gt; MARKETS OVERWEIGHT NAME RECOGNITION.<br />
        &gt; 19/20 SB OPENERS WERE NOT THE BIGGEST HIT.<br />
        &gt; EDGE IS FOUND IN THE MODEL.
      </div>

      {/* Sentiment Indicators - Top Signals */}
      <div className="grid grid-cols-4 border-b-2 border-black">
        {buys.length > 0 ? (
          <div className="border-r-2 border-black p-12 text-center font-bold text-xl flex flex-col justify-center items-center bg-[#39FF14] text-black">
            STRONG BUY<br />
            {buys[0].song.toUpperCase()}<br />
            {edgeStr(buys[0].edge)}
          </div>
        ) : (
          <div className="border-r-2 border-black p-12 text-center font-bold text-xl flex flex-col justify-center items-center">
            NO BUY<br />SIGNAL<br />DETECTED
          </div>
        )}
        {buys.length > 1 ? (
          <div className="border-r-2 border-black p-12 text-center font-bold text-xl flex flex-col justify-center items-center">
            BUY<br />
            {buys[1].song.toUpperCase()}<br />
            {edgeStr(buys[1].edge)}
          </div>
        ) : (
          <div className="border-r-2 border-black p-12 text-center font-bold text-xl flex flex-col justify-center items-center">
            MODEL<br />V.2.2<br />CERTIFIED
          </div>
        )}
        {avoids.length > 0 ? (
          <div className="border-r-2 border-black p-12 text-center font-bold text-xl flex flex-col justify-center items-center bg-black text-[#EAEAEA]">
            AVOID<br />
            {avoids[0].song.toUpperCase()}<br />
            {edgeStr(avoids[0].edge)}
          </div>
        ) : (
          <div className="border-r-2 border-black p-12 text-center font-bold text-xl flex flex-col justify-center items-center bg-black text-[#EAEAEA]">
            NO AVOID<br />SIGNAL<br />DETECTED
          </div>
        )}
        <div className="p-12 text-center font-bold text-xl flex flex-col justify-center items-center">
          {daysLeft > 0 ? `T-${daysLeft}` : "GAME DAY"}<br />
          FEB 08<br />
          2026
        </div>
      </div>

      {/* Full Prediction Table */}
      <div className="border-b-2 border-black">
        <div className="bg-black text-[#EAEAEA] p-6 text-xl font-bold border-b-2 border-black">
          FULL_PREDICTIONS // ALL SONGS
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-left font-bold">
                <th className="p-4">#</th>
                <th className="p-4">SONG</th>
                <th className="p-4 text-right">OUR_MODEL</th>
                <th className="p-4 text-right">KALSHI</th>
                <th className="p-4 text-right">POLY</th>
                <th className="p-4 text-right">EDGE</th>
                <th className="p-4 text-center">SIGNAL</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((e, i) => (
                <tr key={e.songId} className="border-b border-black/20 hover:bg-[#39FF14]/20 transition-colors">
                  <td className="p-4 text-[#555]">{i + 1}</td>
                  <td className="p-4 font-bold">{e.song}</td>
                  <td className="p-4 text-right font-bold">{pct(e.ourProbability)}</td>
                  <td className="p-4 text-right text-[#555]">
                    {e.kalshiProbability > 0 ? pct(e.kalshiProbability) : "—"}
                  </td>
                  <td className="p-4 text-right text-[#555]">
                    {e.polymarketProbability > 0 ? pct(e.polymarketProbability) : "—"}
                  </td>
                  <td className={`p-4 text-right font-bold ${
                    e.edge > 0.02 ? "text-[#2ab810]" : e.edge < -0.02 ? "text-[#cc0000]" : "text-[#555]"
                  }`}>
                    {e.marketProbability > 0 ? edgeStr(e.edge) : "—"}
                  </td>
                  <td className="p-4 text-center">
                    {e.marketProbability > 0
                      ? e.signal === "strong-buy" ? "BUY++"
                      : e.signal === "buy" ? "BUY"
                      : e.signal === "avoid" ? "AVOID"
                      : e.signal === "strong-avoid" ? "AVOID++"
                      : "NEUT"
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-16 flex justify-between items-center">
        <div>
          <h2 className="text-[3rem] mb-2 tracking-[-2px] font-bold">EXPLORE DATA?</h2>
          <p className="text-xl font-bold">BAYESIAN LOG-ODDS MODEL FROM 20 SB OPENERS.</p>
        </div>
        <div className="flex gap-8">
          <a
            href="/research"
            className="bg-transparent border-2 border-black text-black px-12 py-6 font-bold text-2xl inline-block hover:bg-[#39FF14] transition-colors"
            style={{ boxShadow: "8px 8px 0px rgba(0,0,0,0.1)" }}
          >
            RESEARCH
          </a>
          <a
            href="/backtest"
            className="bg-[#EAEAEA] border-2 border-black text-black px-12 py-6 font-bold text-2xl inline-block hover:bg-[#39FF14] transition-colors"
            style={{ boxShadow: "8px 8px 0px #000000" }}
          >
            BACKTEST
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between text-sm border-t-2 border-black bg-black text-[#EAEAEA]">
        <div>TERMINAL_ID: BB_SB_LX_001</div>
        <div>MODEL V.2.2 // NOT FINANCIAL ADVICE</div>
      </div>
    </div>
  );
}

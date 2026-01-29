import historicalData from "@/data/historical-sb-openers.json";
import { runBacktest } from "@/lib/model/backtest";
import Link from "next/link";

export default function BacktestPage() {
  const results = runBacktest(historicalData.shows);
  const top3Count = results.filter((r) => r.inTop3).length;
  const top1Count = results.filter((r) => r.openerRank === 1).length;
  const accuracy = ((top3Count / results.length) * 100).toFixed(0);

  return (
    <div className="max-w-[1440px] mx-auto border-l-2 border-r-2 border-black min-h-screen bg-[#EAEAEA] relative">
      {/* Header */}
      <header className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b-2 border-black">
        <Link href="/" className="text-[2.5rem] p-4 tracking-tight bg-black text-[#EAEAEA] flex items-center font-bold no-underline">
          BB_PREDICT V.2.2
        </Link>
        <Link href="/research" className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors no-underline text-black">
          RESEARCH
        </Link>
        <div className="border-l-2 border-black flex items-center justify-center text-xl font-bold bg-[#39FF14] text-black">
          BACKTEST
        </div>
        <Link href="/" className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors no-underline text-black">
          DASHBOARD
        </Link>
      </header>

      {/* Hero */}
      <div className="p-16 border-b-2 border-black">
        <div className="text-base flex gap-8 mb-8 font-bold opacity-60">
          <span>[MODULE: BACKTEST]</span>
          <span>[SAMPLES: {results.length}]</span>
        </div>
        <h1 className="text-[5rem] leading-[0.85] mb-8 font-bold tracking-[-3px] text-black">
          MODEL<br />VALIDATION_
        </h1>
        <p className="text-xl font-bold max-w-[70%]">
          TESTING BAYESIAN LOG-ODDS MODEL AGAINST {results.length} SUPER BOWL HALFTIME OPENERS (2006-2025).
          SYNTHETIC CATALOGS. NO OVERFITTING.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 border-b-2 border-black">
        <div className="p-12 border-r-2 border-black text-center bg-[#39FF14]">
          <div className="text-[4rem] font-bold leading-none">{accuracy}%</div>
          <div className="text-lg font-bold mt-2">TOP-3 ACCURACY</div>
        </div>
        <div className="p-12 border-r-2 border-black text-center">
          <div className="text-[4rem] font-bold leading-none">{top3Count}/{results.length}</div>
          <div className="text-lg font-bold mt-2">OPENER IN TOP 3</div>
        </div>
        <div className="p-12 text-center bg-black text-[#EAEAEA]">
          <div className="text-[4rem] font-bold leading-none">{top1Count}/{results.length}</div>
          <div className="text-lg font-bold mt-2">RANKED #1</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="border-b-2 border-black">
        <div className="bg-black text-[#EAEAEA] p-6 text-xl font-bold border-b-2 border-black">
          RESULTS_BY_YEAR // {results.length} SHOWS
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-left font-bold">
                <th className="p-4">YEAR</th>
                <th className="p-4">ARTIST</th>
                <th className="p-4">ACTUAL_OPENER</th>
                <th className="p-4 text-center">RANK</th>
                <th className="p-4 text-right">PROB</th>
                <th className="p-4">TOP_PICK</th>
                <th className="p-4 text-center">TOP_3</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r.year}
                  className={`border-b border-black/20 transition-colors ${
                    r.inTop3 ? "hover:bg-[#39FF14]/20" : "hover:bg-red-100"
                  }`}
                >
                  <td className="p-4 font-bold">{r.year}</td>
                  <td className="p-4">{r.artist}</td>
                  <td className="p-4 font-bold">{r.actualOpener}</td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${
                      r.openerRank === 1 ? "bg-[#39FF14] px-2 py-1" :
                      r.openerRank <= 3 ? "text-[#2ab810]" : "text-[#cc0000]"
                    }`}>
                      #{r.openerRank}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold">
                    {(r.openerProbability * 100).toFixed(1)}%
                  </td>
                  <td className="p-4 text-[#555]">{r.topPrediction}</td>
                  <td className="p-4 text-center font-bold">
                    {r.inTop3 ? (
                      <span className="text-[#2ab810]">YES</span>
                    ) : (
                      <span className="text-[#cc0000]">NO</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology */}
      <div className="p-16 text-[2rem] leading-[1.1] border-b-2 border-black font-bold tracking-[-1px]">
        &gt; FOR EACH SHOW: 6-SONG SYNTHETIC CATALOG.<br />
        &gt; ACTUAL OPENER + 5 ARCHETYPES.<br />
        &gt; SCORE ALL. CHECK RANK. NO CHEATING.
      </div>

      <div className="border-b-2 border-black p-8">
        <div className="bg-black text-[#EAEAEA] p-6 text-sm font-bold">
          METHODOLOGY // DETAIL
        </div>
        <div className="p-6 text-sm leading-relaxed border-2 border-black border-t-0">
          FOR EACH HISTORICAL SHOW, WE CREATE A SYNTHETIC 6-SONG CATALOG: THE ACTUAL OPENER PLUS
          ARCHETYPES (BIGGEST OLD HIT, POPULAR COLLAB, SLOW BALLAD, CURRENT ALBUM DEEP CUT, MID-TIER
          UPBEAT TRACK). WE THEN SCORE ALL SONGS WITH OUR BAYESIAN MODEL AND CHECK IF THE ACTUAL
          OPENER RANKS IN THE TOP 3. THIS TESTS WHETHER OUR LIKELIHOOD RATIOS CORRECTLY IDENTIFY
          OPENER-LIKE SONGS FROM NON-OPENER ALTERNATIVES.
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between text-sm border-t-2 border-black bg-black text-[#EAEAEA]">
        <div>TERMINAL_ID: BB_BACKTEST_001</div>
        <div>MODEL V.2.2 // NOT FINANCIAL ADVICE</div>
      </div>
    </div>
  );
}

import fs from "fs";
import path from "path";
import Link from "next/link";
import ResearchContent from "./ResearchContent";

export default function ResearchPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "RESEARCH_REPORT.md"),
    "utf-8"
  );

  return (
    <div className="max-w-[1440px] mx-auto border-l-2 border-r-2 border-black min-h-screen bg-[#EAEAEA] relative">
      {/* Header */}
      <header className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b-2 border-black">
        <Link href="/" className="text-[2.5rem] p-4 tracking-tight bg-black text-[#EAEAEA] flex items-center font-bold no-underline">
          BB_PREDICT V.2.2
        </Link>
        <div className="border-l-2 border-black flex items-center justify-center text-xl font-bold bg-[#39FF14] text-black">
          RESEARCH
        </div>
        <Link href="/backtest" className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors no-underline text-black">
          BACKTEST
        </Link>
        <Link href="/" className="border-l-2 border-black flex items-center justify-center text-xl font-bold hover:bg-[#39FF14] transition-colors no-underline text-black">
          DASHBOARD
        </Link>
      </header>

      {/* Hero */}
      <div className="p-16 border-b-2 border-black">
        <div className="text-base flex gap-8 mb-8 font-bold opacity-60">
          <span>[MODULE: RESEARCH]</span>
          <span>[FORMAT: MARKDOWN]</span>
        </div>
        <h1 className="text-[5rem] leading-[0.85] mb-8 font-bold tracking-[-3px] text-black">
          RESEARCH<br />REPORT_
        </h1>
        <p className="text-xl font-bold max-w-[70%]">
          FULL ANALYSIS OF BAD BUNNY SUPER BOWL LX FIRST SONG PREDICTION MODEL.
          METHODOLOGY. DATA. RESULTS.
        </p>
      </div>

      {/* Content */}
      <div className="border-b-2 border-black">
        <div className="bg-black text-[#EAEAEA] p-6 text-xl font-bold border-b-2 border-black">
          REPORT_CONTENT // FULL
        </div>
        <div className="p-8 md:p-16">
          <ResearchContent content={md} />
        </div>
      </div>

      {/* Source */}
      <div className="border-b-2 border-black p-8">
        <div className="p-6 border-2 border-black text-sm font-bold">
          SOURCE:{" "}
          <a
            href="https://github.com/goldytalks/bad-bunny-sb-predictor/blob/main/RESEARCH_REPORT.md"
            className="underline hover:bg-[#39FF14]"
            target="_blank"
            rel="noopener noreferrer"
          >
            RESEARCH_REPORT.MD ON GITHUB
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex justify-between text-sm border-t-2 border-black bg-black text-[#EAEAEA]">
        <div>TERMINAL_ID: BB_RESEARCH_001</div>
        <div>MODEL V.2.2 // NOT FINANCIAL ADVICE</div>
      </div>
    </div>
  );
}

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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-pr-blue text-sm hover:underline mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>
      <ResearchContent content={md} />
      <footer className="text-xs text-gray-600 mt-8 border-t border-gray-800 pt-4">
        <p>
          Source:{" "}
          <a
            href="https://github.com/goldytalks/bad-bunny-sb-predictor/blob/main/RESEARCH_REPORT.md"
            className="text-pr-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            RESEARCH_REPORT.md on GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}

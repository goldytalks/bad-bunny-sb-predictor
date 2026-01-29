"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResearchContent({ content }: { content: string }) {
  return (
    <article className="prose prose-sm max-w-none
      prose-headings:text-black prose-h1:text-3xl prose-h1:mb-2
      prose-h2:text-xl prose-h2:mt-8 prose-h2:border-b-2 prose-h2:border-black prose-h2:pb-2
      prose-h3:text-lg
      prose-p:text-[#333]
      prose-strong:text-black
      prose-a:text-black prose-a:underline prose-a:decoration-[#39FF14] prose-a:decoration-2 hover:prose-a:bg-[#39FF14]
      prose-code:text-black prose-code:bg-black/10 prose-code:px-1 prose-code:border prose-code:border-black/20
      prose-table:text-sm
      prose-th:text-left prose-th:text-black prose-th:border-black
      prose-td:border-black/30
      prose-li:text-[#333]
      prose-hr:border-black
      prose-blockquote:border-black prose-blockquote:text-[#555]
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

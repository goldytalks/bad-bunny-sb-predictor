"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResearchContent({ content }: { content: string }) {
  return (
    <article className="prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-h1:text-3xl prose-h1:mb-2
      prose-h2:text-xl prose-h2:mt-8 prose-h2:border-b prose-h2:border-gray-800 prose-h2:pb-2
      prose-h3:text-lg
      prose-p:text-gray-400
      prose-strong:text-white
      prose-a:text-pr-blue
      prose-code:text-pr-blue prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
      prose-table:text-sm
      prose-th:text-left prose-th:text-gray-400 prose-th:border-gray-700
      prose-td:border-gray-800
      prose-li:text-gray-400
      prose-hr:border-gray-800
      prose-blockquote:border-gray-700 prose-blockquote:text-gray-400
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

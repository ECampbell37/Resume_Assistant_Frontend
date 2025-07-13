'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }: { content: string }) {
  // Split raw content into paragraphs/blocks by double line breaks
  if (!content) return null;

  const blocks = content.trim().split(/\n{2,}/g);

  return (
    <div className="text-green-200 text-base md:text-lg leading-relaxed">
      {blocks.map((block, i) => (
        <div
          key={i}
          className={`${i !== 0 ? 'mt-6' : ''} space-y-2`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-green-200">{children}</p>
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl md:text-2xl font-bold text-green-300 border-b border-green-700 pb-1 mt-2 mb-2"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg md:text-xl font-semibold text-green-300 mt-4 mb-2"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="text-green-300 font-semibold" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc ml-5 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-normal" {...props} />
              ),
            }}
          >
            {block}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
}

// components/MarkdownRender.tsx

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';


export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="text-green-200 text-base md:text-lg leading-relaxed space-y-2">
      <ReactMarkdown
        components={{
          p: ({ node, children, ...props }) => {
            // Check if the paragraph starts with <strong>
            const firstChild = Array.isArray(children) ? children[0] : null;
            const isBoldSection =
              firstChild &&
              typeof firstChild === 'object' &&
              (firstChild as any).type === 'strong';

            return (
              <p
                className={`${
                  isBoldSection ? 'mt-4 mb-2 font-bold text-green-300' : 'mb-8'
                }`}
                {...props}
              >
                {children}
              </p>
            );
          },
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-green-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-snug" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

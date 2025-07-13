'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownRenderer({ content }: { content: string }) {
  const isSingleLine =
    !content.includes('\n') &&
    !content.includes('**') &&
    !content.includes('* ') &&
    !content.includes('- ');


  return (
    <div className="text-green-200 text-base md:text-lg leading-relaxed space-y-6">
      <ReactMarkdown
        components={{
          p: ({ node, children, ...props }) => {
            const firstChild = Array.isArray(children) ? children[0] : null;
            const isBoldSection =
              firstChild &&
              typeof firstChild === 'object' &&
              (firstChild as any).type === 'strong';

            return (
              <p
                className={`${
                  isBoldSection
                    ? 'mt-4 mb-2 font-bold text-green-300'
                    : isSingleLine
                    ? 'mb-1'
                    : 'mb-8'
                }`}
                {...props}
              >
                {children}
              </p>
            );
          },

          h2: ({ node, ...props }) => (
            <h2
              className="text-xl md:text-2xl font-bold text-green-300 mt-2 mb-4 border-b border-green-700 pb-1"
              {...props}
            />
          ),

          h3: ({ node, ...props }) => (
            <h3
              className="text-lg md:text-xl font-semibold text-green-300 mt-6 mb-3"
              {...props}
            />
          ),

          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-green-300" {...props} />
          ),

          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-5 space-y-2" {...props} />
          ),

          li: ({ node, ...props }) => (
            <li className="leading-normal" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

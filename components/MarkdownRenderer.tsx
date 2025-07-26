/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /components/MarkdownRenderer.tsx
 ************************************************************/


/**
 * MarkdownRenderer.tsx – Renders AI-generated Markdown content with custom styling.
 * 
 * Features:
 * - Parses and formats Markdown blocks using ReactMarkdown and remark-gfm
 * - Applies consistent visual styles for headings, lists, paragraphs, and emphasis
 * - Splits content by double newlines to improve layout spacing
 * - Supports resume sections, chatbot replies, and analysis summaries
 */


'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const blocks = content.trim().split(/\n{2,}/g);

  return (
    <div className="text-green-200 text-base md:text-lg leading-relaxed">
      {blocks.map((block, i) => (
        <div key={i} className={`${i !== 0 ? 'mt-6' : ''} space-y-2`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-green-200">{children}</p>
              ),
              h1: (props) => (
                <h1
                  className="text-2xl md:text-3xl font-bold text-green-300 pb-1 mt-2 mb-2"
                  {...props}
                />
              ),
              h2: (props) => (
                <h2
                  className="text-xl md:text-2xl font-bold text-green-300 border-b border-green-700 pb-1 mt-2 mb-2"
                  {...props}
                />
              ),
              h3: (props) => (
                <h3
                  className="text-lg md:text-xl font-semibold text-green-300 mt-4 mb-2"
                  {...props}
                />
              ),
              h4: (props) => (
                <h4
                  className="text-lg md:text-xl font-medium text-green-300 mt-4 mb-2"
                  {...props}
                />
              ),
              strong: (props) => (
                <strong className="text-green-300 font-semibold" {...props} />
              ),
              ul: (props) => (
                <ul className="list-disc ml-5 space-y-1" {...props} />
              ),
              li: (props) => (
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

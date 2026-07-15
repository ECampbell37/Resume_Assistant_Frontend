// /lib/copyMarkdownAsRichText.ts

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Converts markdown into an HTML string with inline styles, so pasting into
 * Google Docs / Word / Gmail shows real headings, bold text, and bullet lists
 * instead of literal "##" and "**" characters.
 */
function markdownToHtml(markdown: string): string {
  return renderToStaticMarkup(
    React.createElement(
      ReactMarkdown,
      {
        remarkPlugins: [remarkGfm],
        components: {
          h1: (props: any) =>
            React.createElement('h1', { style: { fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }, ...props }),
          h2: (props: any) =>
            React.createElement('h2', {
              style: { fontSize: '18px', fontWeight: 700, borderBottom: '1px solid #999', paddingBottom: '2px', margin: '16px 0 8px' },
              ...props,
            }),
          h3: (props: any) =>
            React.createElement('h3', { style: { fontSize: '16px', fontWeight: 600, margin: '12px 0 6px' }, ...props }),
          p: (props: any) => React.createElement('p', { style: { margin: '0 0 8px' }, ...props }),
          strong: (props: any) => React.createElement('strong', { style: { fontWeight: 700 }, ...props }),
          ul: (props: any) => React.createElement('ul', { style: { margin: '0 0 8px', paddingLeft: '20px' }, ...props }),
          li: (props: any) => React.createElement('li', { style: { margin: '0 0 4px' }, ...props }),
        },
      },
      markdown
    )
  );
}

/** Strips markdown syntax for a clean plain-text fallback. */
function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^-\s+/gm, '• ')
    .trim();
}

/** Copies markdown to the clipboard as both HTML and plain text. */
export async function copyMarkdownAsRichText(markdown: string): Promise<void> {
  const html = markdownToHtml(markdown);
  const plainText = markdownToPlainText(markdown);

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }),
    ]);
  } catch {
    await navigator.clipboard.writeText(plainText);
  }
}
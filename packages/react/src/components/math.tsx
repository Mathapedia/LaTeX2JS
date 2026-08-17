import React from 'react';

interface MathProps {
  lines: string[];
  [key: string]: any;
}

/**
 * A block, not an inline span: the parser emits real paragraphs, and a `<p>`
 * inside a `<span>` is invalid nesting that a browser silently hoists out,
 * taking the text with it.
 */
export default ({ lines }: MathProps) => (
  <div
    className="math"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

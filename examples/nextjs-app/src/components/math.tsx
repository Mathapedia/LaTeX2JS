import React from 'react';

interface MathProps {
  lines: string[];
  [key: string]: any;
}

export default ({ lines }: MathProps) => (
  <span
    className="math"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

import React from 'react';

interface VerbatimProps {
  lines: string[];
  [key: string]: any;
}

export default ({ lines }: VerbatimProps) => (
  <pre className="verbatim" dangerouslySetInnerHTML={{ __html: lines.join('\n') }} />
);

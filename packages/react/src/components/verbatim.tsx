import React from 'react';

interface VerbatimProps {
  lines: string[];
  [key: string]: any;
}

export default ({ lines }: VerbatimProps) => (
  <pre 
    className="verbatim"
    style={{ 
      backgroundColor: '#f5f5f5', 
      padding: '10px', 
      borderRadius: '4px',
      overflow: 'auto'
    }}
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

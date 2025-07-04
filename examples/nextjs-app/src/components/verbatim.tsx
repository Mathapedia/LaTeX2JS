import React from 'react';

interface VerbatimProps {
  content?: string;
  [key: string]: any;
}

export default ({ content }: VerbatimProps) => (
  <pre style={{ 
    backgroundColor: '#f5f5f5', 
    padding: '10px', 
    borderRadius: '4px',
    overflow: 'auto'
  }}>
    {content}
  </pre>
);

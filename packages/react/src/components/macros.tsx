import React from 'react';

interface MacrosProps {
  content?: string;
  [key: string]: any;
}

export default ({ content }: MacrosProps) => (
  <div style={{ display: 'none' }}>{content}</div>
);

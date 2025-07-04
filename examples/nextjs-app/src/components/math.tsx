import React from 'react';

interface MathProps {
  content?: string;
  [key: string]: any;
}

export default ({ content }: MathProps) => (
  <span>{content}</span>
);

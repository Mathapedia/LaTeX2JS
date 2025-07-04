import React from 'react';

interface EnumerateProps {
  items?: any[];
  [key: string]: any;
}

export default ({ items }: EnumerateProps) => (
  <ol>
    {items && items.map((item: any, index: number) => (
      <li key={index}>{item}</li>
    ))}
  </ol>
);

import React from 'react';

interface EnumerateProps {
  type?: string;
  lines?: string[];
  [key: string]: any;
}

function itemizeLine(line: string): string {
  const m = line.match(/\\item (.*)/);
  if (m) return '<li>' + m[1] + '</li>';
  return line;
}

function descriptionLine(line: string): string {
  const m = line.match(/\\item\[([^\]]*)\]\s*(.*)/);
  if (m) return '<dt>' + m[1] + '</dt><dd>' + m[2] + '</dd>';
  return itemizeLine(line);
}

/**
 * Renders enumerate / itemize / description lists from the parser's `\item`
 * lines, mirroring the html5 renderer: the element type decides the list tag,
 * and non-item lines (nested math, continuations) pass through untouched.
 */
export default ({ type = 'enumerate', lines = [] }: EnumerateProps) => {
  const convert = type === 'description' ? descriptionLine : itemizeLine;
  const html = lines.map(convert).join('\n');
  if (type === 'description') {
    return <dl className="math description" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  if (type === 'itemize') {
    return <ul className="math enumerate" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <ol className="math enumerate" dangerouslySetInnerHTML={{ __html: html }} />;
};

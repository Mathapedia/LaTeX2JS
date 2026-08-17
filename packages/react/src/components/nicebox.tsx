import React from 'react';

interface NiceboxProps {
  lines?: string[];
  [key: string]: any;
}

/**
 * The parser hands nicebox elements their content as `lines`, the same shape
 * the html5 renderer consumes. A block element, not a span: the lines can hold
 * real paragraphs. Visual styling comes from the .nicebox rules in
 * latex2js.css.
 */
export default ({ lines = [] }: NiceboxProps) => (
  <div
    className="math nicebox"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

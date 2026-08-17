interface ComponentProps {
  lines: string[];
  [key: string]: any;
}

/**
 * A block, not an inline span: the parser now emits real paragraphs, and a
 * `<p>` inside a `<span>` is invalid nesting that a browser silently hoists
 * out, taking the text with it.
 */
export default function render(that: ComponentProps): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'math';
  div.innerHTML = that.lines.join('\n');
  return div;
}

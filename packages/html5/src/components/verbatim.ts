interface ComponentProps {
  lines: string[];
  [key: string]: any;
}

export default function render(that: ComponentProps): HTMLPreElement {
  var pre = document.createElement('pre');
  pre.className = 'verbatim';
  pre.innerHTML = that.lines.join('\n');
  return pre;
}

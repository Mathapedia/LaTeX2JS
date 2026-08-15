interface ComponentProps {
  type: string;
  lines: string[];
  [key: string]: any;
}

function itemizeLine(line: string): string {
  var m = line.match(/\\item (.*)/);
  if (m) return '<li>' + m[1] + '</li>';
  return line;
}

function descriptionLine(line: string): string {
  var m = line.match(/\\item\[([^\]]*)\]\s*(.*)/);
  if (m) return '<dt>' + m[1] + '</dt><dd>' + m[2] + '</dd>';
  return itemizeLine(line);
}

/**
 * Renders enumerate / itemize / description lists from \item lines.
 */
export default function render(that: ComponentProps): HTMLElement {
  const type = that.type || 'enumerate';
  const convert = type === 'description' ? descriptionLine : itemizeLine;
  const lines = that.lines.map(convert).join('\n');

  let el: HTMLElement;
  if (type === 'enumerate') {
    const ol = document.createElement('ol');
    ol.className = 'math enumerate';
    ol.innerHTML = lines;
    el = ol;
  } else if (type === 'description') {
    const dl = document.createElement('dl');
    dl.className = 'math description';
    dl.innerHTML = lines;
    el = dl;
  } else {
    const ul = document.createElement('ul');
    ul.className = 'math itemize';
    ul.innerHTML = lines;
    el = ul;
  }
  return el;
}

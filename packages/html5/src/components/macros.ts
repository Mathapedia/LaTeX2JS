import macroStr from '@latex2js/macros';

interface ComponentProps {
  [key: string]: any;
}

export default function render(_that: ComponentProps): HTMLDivElement {
  var div = document.createElement('div');
  div.id = 'latex-macros';
  div.style.display = 'none';
  div.className = 'verbatim';
  div.innerHTML = macroStr;
  return div;
}

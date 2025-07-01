export default function render(that) {
  const span = document.createElement('span');
  span.className = 'math';
  span.innerHTML = that.lines.join('\n');
  return span;
}

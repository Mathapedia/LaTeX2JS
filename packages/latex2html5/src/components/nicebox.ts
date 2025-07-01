export default function render(that) {
  const span = document.createElement('span');
  span.className = 'math nicebox';
  span.innerHTML = that.lines.join('\n');
  return span;
}

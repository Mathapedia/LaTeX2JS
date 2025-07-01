export default function render(that) {
  var pre = document.createElement('pre');
  pre.className = 'verbatim';
  pre.innerHTML = that.lines.join('\n');
  return pre;
}

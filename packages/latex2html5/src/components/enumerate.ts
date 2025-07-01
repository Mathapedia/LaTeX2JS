export default function render(that) {
  const lines = that.lines
    .map(line => {
      var m = line.match(/\\item (.*)/);
      if (m) {
        return '<li>' + m[1] + '</li>';
      } else {
        return line;
      }
    })
    .join('\n');

  const ul = document.createElement('ul');
  ul.className = 'math';
  ul.innerHTML = lines;
  return ul;
}

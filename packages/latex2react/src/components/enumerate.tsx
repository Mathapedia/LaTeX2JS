import React from 'react';
export default ({ lines }) => (
  <ul className="math">
    {lines.map((line) => {
      var m = line.match(/\\item (.*)/);
      if (m) {
        return <li>{m[1]}</li>;
      } else {
        return line;
      }
    })}
  </ul>
);

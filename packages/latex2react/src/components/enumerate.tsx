interface EnumerateProps {
  lines: string[];
}

export default ({ lines }: EnumerateProps) => (
  <ul className="math">
    {lines.map((line: string) => {
      var m = line.match(/\\item (.*)/);
      if (m) {
        return <li>{m[1]}</li>;
      } else {
        return line;
      }
    })}
  </ul>
);

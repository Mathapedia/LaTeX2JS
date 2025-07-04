interface MathProps {
  lines: string[];
}

export default ({ lines }: MathProps) => (
  <span
    className="math"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

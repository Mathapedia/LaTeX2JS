interface NiceboxProps {
  lines: string[];
}

export default ({ lines }: NiceboxProps) => (
  <span
    className="math nicebox"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

interface VerbatimProps {
  lines: string[];
}

export default ({ lines }: VerbatimProps) => (
  <pre
    className="verbatim"
    dangerouslySetInnerHTML={{ __html: lines.join('\n') }}
  />
);

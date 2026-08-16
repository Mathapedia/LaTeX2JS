import LaTeX2JS from '../src';

/**
 * Text transforms run in sequence over a line, so a macro whose argument
 * contains something an earlier transform rewrites is the case that breaks.
 * Both defects these cover rendered visibly wrong while the suite stayed green.
 */
const render = (tex: string): string => {
  const parsed: any = new LaTeX2JS().parse(tex);
  return parsed.map((seg: any) => (seg.lines || []).join('\n')).join('\n');
};

describe('text macros whose arguments are themselves transformed', () => {
  it('converts \\section even when the title contains an en dash', () => {
    const out = render('\\section{The Cauchy--Schwarz Inequality}\n');
    expect(out).toContain('<h2><span class="section-number">1</span> The Cauchy&ndash;Schwarz Inequality</h2>');
    expect(out).not.toContain('\\section');
  });

  it.each([
    ['\\subsection{A--B}', '<h3>'],
    ['\\textbf{a--b}', '<b>'],
    ['\\textit{a---b}', '<i>'],
    ['\\footnote{a--b}', '<sup'],
  ])('converts %s after an earlier transform rewrites its argument', (tex, tag) => {
    const out = render(`${tex}\n`);
    expect(out).toContain(tag);
    expect(out).not.toContain(tex.slice(0, tex.indexOf('{')));
  });

  it('leaves a title alone when nothing else rewrites it', () => {
    expect(render('\\section{Plain Title}\n')).toContain('<h2><span class="section-number">1</span> Plain Title</h2>');
  });
});

describe('proof environment', () => {
  it('closes with a tombstone character rather than an undefined macro', () => {
    const out = render('\\begin{proof}\nBody.\n\\end{proof}\n');
    expect(out).toContain('<h4>Proof</h4>');
    expect(out).toContain('<span class="qed">□</span>');
    // MathJax defines no \qed, so emitting it as math produced a visible
    // "Undefined control sequence" box at the end of every proof.
    expect(out).not.toContain('\\qed');
  });
});

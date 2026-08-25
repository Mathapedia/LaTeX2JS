import LaTeX2JS from '../src';

/**
 * A display-math environment must come out of paragraphization as one
 * contiguous string: MathJax matches \begin/\end within a single text node,
 * so an environment split across <p> elements renders as raw source.
 */
describe('math environments survive paragraphization intact', () => {
  const latex = new LaTeX2JS();

  it('keeps a multi-line align* in one line, not split across paragraphs', () => {
    const parsed = latex.parse(`
Some introductory text.

\\begin{align*}
X &= \\frac{1}{p} \\Psi^H x \\\\
x &= \\Psi X
\\end{align*}

Some closing text.
    `);
    const math = parsed.find((el: any) => el.type === 'math');
    expect(math).toBeDefined();
    const withBegin = math.lines.filter((l: string) => l.includes('\\begin{align*}'));
    expect(withBegin).toHaveLength(1);
    // begin and end live in the same emitted line…
    expect(withBegin[0]).toContain('\\end{align*}');
    // …with the body between them…
    expect(withBegin[0]).toContain('\\Psi^H');
    // …and not wrapped in a paragraph element.
    expect(withBegin[0]).not.toMatch(/^<p/);
  });

  it('keeps consecutive environments separate and intact', () => {
    const parsed = latex.parse(`
\\begin{align*}
a &= b
\\end{align*}

\\begin{align*}
c &= d
\\end{align*}
    `);
    const math = parsed.find((el: any) => el.type === 'math');
    const envLines = math.lines.filter((l: string) => l.includes('\\begin{align*}'));
    expect(envLines).toHaveLength(2);
    envLines.forEach((l: string) => expect(l).toContain('\\end{align*}'));
  });

  it('still paragraphizes surrounding prose', () => {
    const parsed = latex.parse(`
Before.

\\begin{equation}
e = mc^2
\\end{equation}

After.
    `);
    const math = parsed.find((el: any) => el.type === 'math');
    const paras = math.lines.filter((l: string) => /^<p class="para">/.test(l));
    expect(paras.some((l: string) => l.includes('Before.'))).toBe(true);
    expect(paras.some((l: string) => l.includes('After.'))).toBe(true);
  });

  it('nests quotation paragraphs inside the quotation wrapper', () => {
    const parsed = latex.parse(`
\\begin{quotation}
Quoted text.
\\end{quotation}
    `);
    const math = parsed.find((el: any) => el.type === 'math');
    const output = math.lines.join('\n');

    expect(output).toContain('<blockquote class="quotation">');
    expect(output).toContain('<p class="para">Quoted text.');
    expect(output).toMatch(/<p class="para">Quoted text\.<\/p>\s*<\/blockquote>/);
    expect(output).not.toContain('<blockquote class="quotation">\n</blockquote>');
  });
});

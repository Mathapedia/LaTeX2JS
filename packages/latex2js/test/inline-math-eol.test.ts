import LaTeX2JS from '../src';

/**
 * Command and environment nodes do not consume the newline ending their
 * source line; that EOL arrives as an empty Line node. Treating it as a blank
 * line inserted a paragraph break mid-sentence — which split multi-line
 * inline $...$ math (e.g. a column vector written with \left[ \begin{array}
 * ... \end{array} \right] inside $...$) across <p> elements, leaving MathJax
 * unable to pair the delimiters: raw "$, and" / "\right]" fragments on the
 * page.
 */
describe('EOL after a command or environment is not a paragraph break', () => {
  const latex = new LaTeX2JS();

  it('keeps multi-line inline math inside a proof in one paragraph', () => {
    const parsed = latex.parse(`
\\begin{proof}

For all k, we can write
$\\Psi_k =
\\left[
\\begin{array}{c}
\\Psi_k(0) \\\\
\\Psi_k(p-1) \\\\
\\end{array}
\\right]
$, and
$x = 1
$. done

\\end{proof}
    `);
    const math = parsed.find((el: any) => el.type === 'math');
    const joined = math.lines.join('\n');
    // Both $ pairs must live in the same paragraph element…
    const para = math.lines.find((l: string) => l.includes('\\Psi_k ='));
    expect(para).toBeDefined();
    expect(para).toContain('$, and');
    expect(para).toContain('$. done');
    // …with no <br> wedged between the group and the text that follows it.
    expect(joined).not.toMatch(/\\right\]\n<br>/);
  });

  it('still honors a genuine blank line after a command', () => {
    const parsed = latex.parse(`
\\begin{proof}

First paragraph ending with a group $\\left[ x \\right]$.

Second paragraph.

\\end{proof}
    `);
    const math = parsed.find((el: any) => el.type === 'math');
    const paras = math.lines.filter((l: string) => /^<p class="para">/.test(l));
    expect(paras.some((l: string) => l.includes('First paragraph'))).toBe(true);
    expect(paras.some((l: string) => l.includes('Second paragraph'))).toBe(true);
    expect(paras.find((l: string) => l.includes('First paragraph'))).not.toContain('Second paragraph');
  });
});

import LaTeX2JS from '../src';

/**
 * The dialect changes a small, documented set of semantics — not the renderer.
 * These are the differences cheap enough to make bidirectional; RPN plot bodies
 * are the one gap the flag does not close, since reading them would mean
 * writing a PostScript interpreter.
 */
const parse = (tex: string, dialect?: 'pstricks' | 'latex2js') => {
  const l = new LaTeX2JS();
  if (dialect) l.dialect = dialect;
  return l.parse(tex) as any[];
};

const picture = (body: string, prelude = '') =>
  `${prelude}\\begin{pspicture}(-4,-4)(4,4)\n${body}\n\\end{pspicture}\n`;

/** The y value a plot reached at its first sample, in picture units. */
const firstY = (objs: any[]) => {
  const plot = objs[0].plot.psplot[0];
  const env = objs[0].env;
  return env.y1 - plot.data.data[1] / env.yunit;
};

describe('log base follows the dialect', () => {
  // Verified against real PSTricks: log(100) plots at 2, so its log is base 10.
  // LaTeX2JS has always read it as natural log, and the corpus depends on that
  // (log(2) appears in derivatives of 2^x, where ln is what the author meant).
  it('is base 10 under pstricks', () => {
    expect(firstY(parse(picture('\\psplot[algebraic=true]{-2}{2}{log(100)}')))).toBeCloseTo(2, 3);
  });

  it('is natural log under latex2js', () => {
    const y = firstY(parse(picture('\\psplot[algebraic=true]{-2}{2}{log(100)}'), 'latex2js'));
    expect(y).toBeCloseTo(Math.log(100), 3);
  });

  it('follows a dialect the document declares', () => {
    const y = firstY(parse(picture('\\psplot[algebraic=true]{-2}{2}{log(100)}', '\\psset{dialect=latex2js}\n')));
    expect(y).toBeCloseTo(Math.log(100), 3);
  });

  it('leaves ln alone in both', () => {
    for (const d of ['pstricks', 'latex2js'] as const) {
      expect(firstY(parse(picture('\\psplot[algebraic=true]{-2}{2}{ln(100)}'), d))).toBeCloseTo(Math.log(100), 3);
    }
  });
});

describe('starred shapes follow the dialect', () => {
  const fillOf = (dialect: 'pstricks' | 'latex2js') => {
    const objs = parse(picture('\\pscircle*[linecolor=red,fillcolor=cyan](0,0){1}'), dialect);
    const data = objs[0].plot.pscircle[0].data;
    return { data, env: objs[0].env };
  };

  it('carries both colours through either way', () => {
    // The choice happens at render time; the data keeps what the author wrote.
    for (const d of ['pstricks', 'latex2js'] as const) {
      const { data } = fillOf(d);
      expect(data.filled).toBe(true);
      expect(data.linecolor).toBe('red');
      expect(data.fillcolor).toBe('cyan');
    }
  });

  it('records the dialect on the picture so the renderer can choose', () => {
    expect(fillOf('pstricks').env.dialect).toBe('pstricks');
    expect(fillOf('latex2js').env.dialect).toBe('latex2js');
  });
});

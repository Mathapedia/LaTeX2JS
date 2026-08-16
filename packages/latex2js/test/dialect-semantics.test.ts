import LaTeX2JS from '../src';

/**
 * The dialect reports; it never switches the renderer.
 *
 * An earlier draft made `log` and starred fills follow the declaration. Two
 * things killed that. A `dialect=pstricks` reading still cannot read RPN plot
 * bodies, so it produced output that was neither LaTeX2JS nor PSTricks; and
 * because rendering depended on a flag, an undeclared document silently
 * rendered differently — the exact failure this branch spent its time removing.
 *
 * So the semantics are fixed, one renderer, and the flag only decides whether
 * you are told that a construct will not travel.
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

describe('rendering does not depend on the declared dialect', () => {
  it('reads log the same either way', () => {
    // Natural log, in both. PSTricks reads it as base 10; that difference is
    // reported rather than applied, so no document changes shape when a flag
    // is added or removed.
    for (const d of ['pstricks', 'latex2js'] as const) {
      expect(firstY(parse(picture('\\psplot[algebraic=true]{-2}{2}{log(100)}'), d)))
        .toBeCloseTo(Math.log(100), 3);
    }
  });

  it('reads ln the same either way', () => {
    for (const d of ['pstricks', 'latex2js'] as const) {
      expect(firstY(parse(picture('\\psplot[algebraic=true]{-2}{2}{ln(100)}'), d)))
        .toBeCloseTo(Math.log(100), 3);
    }
  });

  it('keeps a starred shape filled with the author colour either way', () => {
    for (const d of ['pstricks', 'latex2js'] as const) {
      const data = parse(picture('\\pscircle*[linecolor=red,fillcolor=cyan](0,0){1}'), d)[0]
        .plot.pscircle[0].data;
      expect(data.filled).toBe(true);
      expect(data.fillcolor).toBe('cyan');
    }
  });

  it('still records the declaration on the picture', () => {
    expect(parse(picture('\\pscircle(0,0){1}'), 'latex2js')[0].env.dialect).toBe('latex2js');
    expect(parse(picture('\\pscircle(0,0){1}'), 'pstricks')[0].env.dialect).toBe('pstricks');
  });
});

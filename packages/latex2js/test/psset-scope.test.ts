import { resolveColor } from '@latex2js/utils';
import LaTeX2JS from '../src';

/**
 * `\psset` declares defaults every later command inherits.
 *
 * Only nine keys were recognised, and even those were kept solely for the
 * units and the dialect — every style key parsed, matched nothing, and was
 * discarded. A picture opening with
 * `\psset{linecolor=blue,linewidth=2pt,linestyle=dashed,fillstyle=solid}`
 * drew a thin solid black outline, which is four settings ignored at once.
 *
 * The ordering these pin down is: a command's own brackets win, its psset
 * defaults come next, and the hardcoded default in the parse function is the
 * last resort.
 */
function shapes(tex: string, name: string): any[] {
  const l = new LaTeX2JS();
  const parsed: any = l.parse(`\\begin{pspicture}(-3,-2.5)(3,2.5)\n${tex}\n\\end{pspicture}`);
  const env = parsed.find((e: any) => e.type === 'pspicture');
  expect(env).toBeDefined();
  return (env.plot[name] || []).map((p: any) => p.data);
}

const BLUE = resolveColor('blue');
const RED = resolveColor('red');
const GREEN = resolveColor('green');

describe('psset declares defaults for later commands', () => {
  it('reaches every later shape, not only the first', () => {
    const [a, b] = shapes('\\psset{linecolor=red}\n\\pscircle(-1,0){1}\n\\pscircle(1,0){1}', 'pscircle');
    expect(a.linecolor).toBe(RED);
    expect(b.linecolor).toBe(RED);
  });

  it('carries keys Settings never knew about', () => {
    // linewidth, linestyle and the dash parameters were not in the recognised
    // set at all, so they were dropped without a word.
    const [c] = shapes('\\psset{linewidth=3pt,linestyle=dashed,dash=8pt 2pt}\n\\pscircle(0,0){1}', 'pscircle');
    expect(c.linewidth).toBe('3pt');
    expect(c.linestyle).toBe('dashed');
    expect(c.dash).toBe('8pt 2pt');
  });

  it('carries a fill', () => {
    const [c] = shapes('\\psset{fillstyle=solid,fillcolor=red}\n\\pscircle(0,0){1}', 'pscircle');
    expect(c.fillstyle).toBe('solid');
    expect(c.fillcolor).toBe(RED);
  });

  it('resolves a colour the same way an inline option would', () => {
    const [c] = shapes('\\psset{linecolor=green}\n\\pscircle(0,0){1}', 'pscircle');
    expect(c.linecolor).toBe(GREEN);
  });
});

describe('an inline option beats psset, for that command only', () => {
  it('lets the command that overrides win', () => {
    const [a, b] = shapes(
      '\\psset{linecolor=red}\n\\pscircle(-1,0){1}\n\\pscircle[linecolor=blue](1,0){1}',
      'pscircle'
    );
    expect(a.linecolor).toBe(RED);
    expect(b.linecolor).toBe(BLUE);
  });

  it('restores the psset value for the command after the override', () => {
    const [a, b, c] = shapes(
      '\\psset{linecolor=red}\n\\pscircle(-2,0){0.8}\n\\pscircle[linecolor=blue](0,0){0.8}\n\\pscircle(2,0){0.8}',
      'pscircle'
    );
    expect([a.linecolor, b.linecolor, c.linecolor]).toEqual([RED, BLUE, RED]);
  });

  it('leaves the other keys of an overriding command inherited', () => {
    // Writing one option inline must not opt the command out of the rest.
    const [c] = shapes(
      '\\psset{linecolor=red,linewidth=3pt}\n\\pscircle[linecolor=blue](0,0){1}',
      'pscircle'
    );
    expect(c.linecolor).toBe(BLUE);
    expect(c.linewidth).toBe('3pt');
  });
});

describe('psset is positional state, not a document-wide value', () => {
  it('applies the declaration above each shape, not the last one in the picture', () => {
    // Commands are collected during the walk and parsed afterwards. Reading
    // the settings at parse time gave every shape the final \psset.
    const [a, b] = shapes(
      '\\psset{linecolor=red}\n\\pscircle(-1,0){1}\n\\psset{linecolor=blue}\n\\pscircle(1,0){1}',
      'pscircle'
    );
    expect(a.linecolor).toBe(RED);
    expect(b.linecolor).toBe(BLUE);
  });

  it('keeps a key a later psset does not mention', () => {
    const [c] = shapes(
      '\\psset{linecolor=red}\n\\psset{linewidth=3pt}\n\\pscircle(0,0){1}',
      'pscircle'
    );
    expect(c.linecolor).toBe(RED);
    expect(c.linewidth).toBe('3pt');
  });

  it('does not reach a shape written above it', () => {
    const [a, b] = shapes(
      '\\pscircle(-1,0){1}\n\\psset{linecolor=red}\n\\pscircle(1,0){1}',
      'pscircle'
    );
    expect(a.linecolor).not.toBe(RED);
    expect(b.linecolor).toBe(RED);
  });
});

describe('psset does not corrupt what it is not', () => {
  it('leaves a shape geometry alone', () => {
    // The pspicture parse function is invoked with the settings object as its
    // receiver and assigns the picture bounds onto it, so the settings carry
    // x0, y0, x1, y1, w and h. Spraying those onto a shape replaced its
    // computed geometry with the corner of the picture.
    // The picture is (-3,-2.5)(3,2.5), so w=6, x1=3, y1=2.5, both units 50:
    // X(v) = (w - (x1 - v)) * xunit and Y(v) = (y1 - v) * yunit.
    const [line] = shapes('\\psset{linecolor=red}\n\\psline(-2,-1)(2,1)', 'psline');
    expect(line.x1).toBeCloseTo((6 - (3 - -2)) * 50, 3);
    expect(line.y1).toBeCloseTo((2.5 - -1) * 50, 3);
    expect(line.x2).toBeCloseTo((6 - (3 - 2)) * 50, 3);
  });

  it('does not copy units onto the shape', () => {
    const [c] = shapes('\\psset{xunit=2,yunit=1}\n\\pscircle(0,0){1}', 'pscircle');
    expect(c.xunit).toBeUndefined();
    expect(c.yunit).toBeUndefined();
  });

  it('does not copy the dialect onto the shape', () => {
    const [c] = shapes('\\psset{dialect=latex2js}\n\\pscircle(0,0){1}', 'pscircle');
    expect(c.dialect).toBeUndefined();
  });
});

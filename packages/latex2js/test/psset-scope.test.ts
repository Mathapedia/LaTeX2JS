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

/**
 * \rput places its contents at a coordinate. The contents are usually a label,
 * and were assumed to be one: a graphics command inside an rput drew nothing,
 * and the tail left over by the command's greedy brace-blind regex was set as
 * text — which is how `0.8}` appeared as a caption next to nothing at all.
 */
function elementsOf(tex: string): any[] {
  const l = new LaTeX2JS();
  const parsed: any = l.parse(`\\begin{pspicture}(-3,-2.5)(3,2.5)\n${tex}\n\\end{pspicture}`);
  const env = parsed.find((e: any) => e.type === 'pspicture');
  expect(env).toBeDefined();
  return env.env.elements || [];
}

describe('rput places graphics, not only labels', () => {
  it('turns an rput holding a shape into a translated group', () => {
    const els = elementsOf('\\rput(1,1){\\pscircle(0,0){0.5}}');
    const group = els.find((e: any) => e.name === 'rputgroup');
    expect(group).toBeDefined();
    expect(group.data.children).toHaveLength(1);
    expect(group.data.children[0].key).toBe('pscircle');
  });

  it('offsets the group by where the contents origin lands', () => {
    // xunit and yunit are 50, and SVG y runs opposite to the picture's.
    const [g] = elementsOf('\\rput(1,-2){\\pscircle(0,0){0.5}}').filter((e: any) => e.name === 'rputgroup');
    expect(g.data.dx).toBeCloseTo(1 * 50, 3);
    expect(g.data.dy).toBeCloseTo(2 * 50, 3);
  });

  it('keeps the group in document order among the other shapes', () => {
    // The label pass appends after the SVG is finished, so it cannot express
    // an rput that belongs underneath a later shape.
    const names = elementsOf(
      '\\psframe(-2,-1)(2,1)\n\\rput(0,0){\\pscircle(0,0){0.5}}\n\\psline(-2,-1)(2,1)'
    ).map((e: any) => e.name);
    expect(names).toEqual(['psframe', 'rputgroup', 'psline']);
  });

  it('reads the whole body, not up to the first inner brace', () => {
    // \pscircle's radius argument is itself a brace group; a greedy or
    // brace-blind match cuts the body in the middle of it.
    const [g] = elementsOf('\\rput(0,0){\\pscircle[linewidth=2pt](0,0){0.8}}').filter(
      (e: any) => e.name === 'rputgroup'
    );
    expect(g.data.children[0].data.r).toBeCloseTo(0.8 * 50, 3);
  });

  it('carries several shapes from one rput', () => {
    const [g] = elementsOf('\\rput(0,0){\\pscircle(0,0){0.5}\\psline(-1,0)(1,0)}').filter(
      (e: any) => e.name === 'rputgroup'
    );
    expect(g.data.children.map((c: any) => c.key)).toEqual(['pscircle', 'psline']);
  });

  it('leaves a label rput alone', () => {
    // The text form still goes through the DOM pass; only graphics move.
    const els = elementsOf('\\rput(0,0){$x^2$}');
    expect(els.find((e: any) => e.name === 'rputgroup')).toBeUndefined();
    expect(els.find((e: any) => e.name === 'rput')).toBeDefined();
  });
});

describe('units declared inside a picture rescale what follows', () => {
  // A picture fixes its units when \begin{pspicture} is read, so a later
  // \psset{xunit=2} had no effect at all: \psellipse(0,0)(1,1.5) came out
  // taller than wide where PSTricks draws it wider than tall.
  const ellipse = (tex: string) => shapes(tex, 'psellipse')[0];

  it('stretches a later shape along the changed axis', () => {
    const e = ellipse('\\psset{xunit=2,yunit=1}\n\\psellipse(0,0)(1,1.5)');
    expect(e.rx).toBeGreaterThan(e.ry);
  });

  it('leaves a shape written above the declaration alone', () => {
    const [before, after] = shapes(
      '\\psellipse(0,0)(1,1.5)\n\\psset{xunit=2}\n\\psellipse(0,0)(1,1.5)',
      'psellipse'
    );
    expect(before.rx).toBeLessThan(before.ry);
    expect(after.rx).toBeGreaterThan(after.ry);
  });

  it('holds the picture origin still while the coordinates rescale', () => {
    // The box was laid out with the units in force at \begin; only the
    // coordinates written after the declaration take the new unit. A shape at
    // the origin must therefore not move when the units change.
    const at = (tex: string) => shapes(tex, 'pscircle')[0];
    const plain = at('\\pscircle(0,0){0.5}');
    const scaled = at('\\psset{xunit=2}\n\\pscircle(0,0){0.5}');
    expect(scaled.cx).toBeCloseTo(plain.cx, 3);
    expect(scaled.cy).toBeCloseTo(plain.cy, 3);
  });

  it('moves a coordinate away from the origin by the new unit', () => {
    const at = (tex: string) => shapes(tex, 'pscircle')[0];
    const plain = at('\\pscircle(1,0){0.5}');
    const origin = at('\\pscircle(0,0){0.5}');
    const scaled = at('\\psset{xunit=2}\n\\pscircle(1,0){0.5}');
    expect(scaled.cx - origin.cx).toBeCloseTo(2 * (plain.cx - origin.cx), 3);
  });

  it('leaves a radius alone when only the coordinate units change', () => {
    // A radius is a dimension scaled by runit; xunit and yunit scale
    // coordinates. Reading it through xunit made \pscircle(0,0){1} twice the
    // size the reference draws it under \psset{xunit=2}.
    const r = (tex: string) => shapes(tex, 'pscircle')[0].r;
    expect(r('\\psset{xunit=2,yunit=1}\n\\pscircle(0,0){1}')).toBeCloseTo(r('\\pscircle(0,0){1}'), 3);
  });

  it('scales a radius with runit', () => {
    const r = (tex: string) => shapes(tex, 'pscircle')[0].r;
    expect(r('\\psset{runit=2}\n\\pscircle(0,0){1}')).toBeCloseTo(2 * r('\\pscircle(0,0){1}'), 3);
  });

  it('scales a radius with unit, which sets all three', () => {
    const r = (tex: string) => shapes(tex, 'pscircle')[0].r;
    expect(r('\\psset{unit=2}\n\\pscircle(0,0){1}')).toBeCloseTo(2 * r('\\pscircle(0,0){1}'), 3);
  });

  it('scales an arc and a wedge radius the same way', () => {
    const arcR = (tex: string) => shapes(tex, 'psarc')[0].r;
    const wedgeR = (tex: string) => shapes(tex, 'pswedge')[0].r;
    expect(arcR('\\psset{xunit=2}\n\\psarc(0,0){1}{0}{90}')).toBeCloseTo(arcR('\\psarc(0,0){1}{0}{90}'), 3);
    expect(wedgeR('\\psset{xunit=2}\n\\pswedge(0,0){1}{0}{90}')).toBeCloseTo(
      wedgeR('\\pswedge(0,0){1}{0}{90}'),
      3
    );
  });
});

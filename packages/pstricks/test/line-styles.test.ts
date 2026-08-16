import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * `linestyle=dashed` and `linestyle=dotted` were honoured by psline and
 * pspolygon and ignored by every other shape, so a dotted circle drew solid.
 * Where they were honoured, both emitted the same hardcoded `9,5`, so a dotted
 * line was indistinguishable from a dashed one and neither followed the `dash`
 * or `dotsep` the author set.
 */
function makeContext() {
  return {
    xunit: 50, yunit: 50,
    x0: -5, y0: -5, x1: 5, y1: 5,
    w: 10, h: 10,
    variables: {},
  } as any;
}

interface Recorded {
  tag: string;
  attrs: { [k: string]: string };
  styles: { [k: string]: string };
  children: Recorded[];
}

function recorder() {
  const root: Recorded = { tag: 'root', attrs: {}, styles: {}, children: [] };
  const wrap = (node: Recorded): any => ({
    append(tag: string) {
      const child: Recorded = { tag: tag.replace(/^svg:/, ''), attrs: {}, styles: {}, children: [] };
      node.children.push(child);
      return wrap(child);
    },
    attr(k: string, v: any) { node.attrs[k] = String(v); return wrap(node); },
    style(k: string, v: any) { node.styles[k] = String(v); return wrap(node); },
    on() { return wrap(node); },
  });
  return { root, svg: wrap(root) };
}

function render(name: string, raw: string): Recorded {
  const ctx = makeContext();
  const m = raw.match((Expressions as any)[name]) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = (Functions as any)[name].call(ctx, m);
  data.global = ctx;
  const { root, svg } = recorder();
  (psgraph as any)[name].call(data, svg);
  return root;
}

/**
 * Every stroked outline in the tree. Not just paths: pscircle, psellipse and
 * psframe render as circle, ellipse and rect, which is how a path-only sweep
 * would have missed exactly the shapes that were ignoring linestyle.
 */
const OUTLINE_TAGS = ['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon'];

function strokedPaths(node: Recorded, out: Recorded[] = []): Recorded[] {
  if (OUTLINE_TAGS.includes(node.tag) && node.styles.stroke && node.styles.stroke !== 'none') {
    out.push(node);
  }
  node.children.forEach((c) => strokedPaths(c, out));
  return out;
}

const SHAPES: Array<[string, string]> = [
  ['psline', '\\psline[STYLE](-2,-1)(2,1)'],
  ['pscircle', '\\pscircle[STYLE](0,0){2}'],
  ['psellipse', '\\psellipse[STYLE](0,0)(2,1)'],
  ['psframe', '\\psframe[STYLE](-2,-1)(2,1)'],
  ['pspolygon', '\\pspolygon[STYLE](-2,-1)(0,1.5)(2,-1)'],
  ['psarc', '\\psarc[STYLE](0,0){2}{30}{150}'],
  ['pswedge', '\\pswedge[STYLE](0,0){2}{30}{150}'],
  ['pscurve', '\\pscurve[STYLE](-2,-1)(0,1.5)(2,-1)'],
  ['psccurve', '\\psccurve[STYLE](-2,-1)(0,1.5)(2,-1)'],
  ['psbezier', '\\psbezier[STYLE](-2,-1)(-1,1)(1,-1)(2,1)'],
];

const dashes = (tree: Recorded) => strokedPaths(tree).map((p) => p.styles['stroke-dasharray']);

describe('every shape honours linestyle', () => {
  it.each(SHAPES)('%s draws solid by default', (name, template) => {
    const got = dashes(render(name, template.replace('[STYLE]', '')));
    expect(got.length).toBeGreaterThan(0);
    got.forEach((d) => expect(d).toBe('none'));
  });

  it.each(SHAPES)('%s breaks the line for linestyle=dashed', (name, template) => {
    const got = dashes(render(name, template.replace('STYLE', 'linestyle=dashed')));
    expect(got.length).toBeGreaterThan(0);
    got.forEach((d) => expect(d).toMatch(/^[\d.]+,[\d.]+$/));
    got.forEach((d) => expect(d).not.toBe('none'));
  });

  it.each(SHAPES)('%s dots the line for linestyle=dotted', (name, template) => {
    const tree = render(name, template.replace('STYLE', 'linestyle=dotted'));
    const paths = strokedPaths(tree);
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach((p) => {
      // A zero-length dash under a round cap is how SVG draws a round dot.
      expect(p.styles['stroke-dasharray']).toMatch(/^0,[\d.]+$/);
      expect(p.styles['stroke-linecap']).toBe('round');
    });
  });

  it.each(SHAPES)('%s draws dashed and dotted differently', (name, template) => {
    const dashed = dashes(render(name, template.replace('STYLE', 'linestyle=dashed')));
    const dotted = dashes(render(name, template.replace('STYLE', 'linestyle=dotted')));
    expect(dashed).not.toEqual(dotted);
  });
});

describe('the dash pattern follows the author', () => {
  it('reads both lengths of a dash setting', () => {
    const [d] = dashes(render('psline', '\\psline[linestyle=dashed,dash=10pt 2pt](-2,-1)(2,1)'));
    const [on, off] = d.split(',').map(Number);
    expect(on / off).toBeCloseTo(5, 5);
  });

  it('repeats a single dash length for the gap', () => {
    const [d] = dashes(render('psline', '\\psline[linestyle=dashed,dash=4pt](-2,-1)(2,1)'));
    const [on, off] = d.split(',').map(Number);
    expect(on).toBeCloseTo(off, 5);
  });

  it('widens the gap between dots for a larger dotsep', () => {
    const gap = (sep: string) =>
      Number(dashes(render('psline', `\\psline[linestyle=dotted,dotsep=${sep}](-2,-1)(2,1)`))[0].split(',')[1]);
    expect(gap('6pt')).toBeGreaterThan(gap('2pt'));
  });

  it('uses the PSTricks defaults when none is given', () => {
    // dash=5pt 3pt is the PSTricks default; the ratio is what pins it.
    const [d] = dashes(render('psline', '\\psline[linestyle=dashed](-2,-1)(2,1)'));
    const [on, off] = d.split(',').map(Number);
    expect(on / off).toBeCloseTo(5 / 3, 5);
  });
});

describe('markers are not broken by the line style', () => {
  // An arrowhead is a filled triangle and a dot is a disc; dashing either one
  // eats the marker itself rather than the line it terminates.
  it('leaves an arrowhead solid on a dashed line', () => {
    const tree = render('psline', '\\psline[linestyle=dashed]{->}(-2,-1)(2,1)');
    const heads = strokedPaths(tree).filter((p) => (p.attrs.d || '').trim().endsWith('Z'));
    expect(heads.length).toBeGreaterThan(0);
    heads.forEach((h) => expect(h.styles['stroke-dasharray']).toBeUndefined());
  });

  it('leaves a dot marker solid on a dotted line', () => {
    const tree = render('psline', '\\psline[linestyle=dotted]{*-*}(-2,-1)(2,1)');
    const circles: Recorded[] = [];
    const walk = (n: Recorded) => { if (n.tag === 'circle') circles.push(n); n.children.forEach(walk); };
    walk(tree);
    expect(circles.length).toBeGreaterThan(0);
    circles.forEach((c) => expect(c.styles['stroke-dasharray']).toBeUndefined());
  });
});

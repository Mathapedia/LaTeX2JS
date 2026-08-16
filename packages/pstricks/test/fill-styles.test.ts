import { resolveColor } from '@latex2js/utils';
import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * Fill resolution used to be spelled separately in every renderer, so the same
 * `fillstyle` produced different results depending on the shape it was applied
 * to. These pin the resolved paint per shape, which is the only place that
 * divergence is observable.
 */
/** Colour names resolve to their xcolor RGB, so assertions compare that. */
const CYAN = resolveColor('cyan');

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

/** Minimal stand-in for the SVG selection, recording the tree that is built. */
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

/** Renders one command and returns the recorded tree. */
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

/** Every fill paint anywhere in the recorded tree, outside pattern definitions. */
function fills(node: Recorded, insideDefs = false): string[] {
  const here = !insideDefs && node.styles.fill ? [node.styles.fill] : [];
  const nested = node.children.flatMap((c) => fills(c, insideDefs || node.tag === 'defs'));
  return [...here, ...nested];
}

function find(node: Recorded, tag: string): Recorded | undefined {
  if (node.tag === tag) return node;
  for (const c of node.children) {
    const hit = find(c, tag);
    if (hit) return hit;
  }
  return undefined;
}

const SHAPES: Array<[string, string]> = [
  ['pscircle', '\\pscircle[FILL](0,0){2}'],
  ['psellipse', '\\psellipse[FILL](0,0)(2,1)'],
  ['pspolygon', '\\pspolygon[FILL](-2,-1)(0,1.5)(2,-1)'],
  ['pswedge', '\\pswedge[FILL](0,0){2}{30}{150}'],
  ['psframe', '\\psframe[FILL](-2,-1)(2,1)'],
  // The curves belong here too. They were left out, and psbezier alone kept a
  // hardcoded `fill: none` — so it ignored every fillstyle and this table never
  // noticed.
  ['pscurve', '\\pscurve[FILL](-2,-1)(0,1.5)(2,-1)'],
  ['psbezier', '\\psbezier[FILL](-2,-1)(-1,1)(1,-1)(2,1)'],
];

describe('fill styles resolve the same way for every shape', () => {
  it.each(SHAPES)('%s fills flat for fillstyle=solid', (name, template) => {
    const tree = render(name, template.replace('FILL', 'fillstyle=solid,fillcolor=cyan'));
    expect(fills(tree)).toContain(CYAN);
  });

  it.each(SHAPES)('%s draws no fill for fillstyle=none', (name, template) => {
    const tree = render(name, template.replace('FILL', 'fillstyle=none,fillcolor=cyan'));
    expect(fills(tree).filter((f) => f !== 'none')).toHaveLength(0);
  });

  // The regression: hlines became a solid fill on pspolygon and psarc, and no
  // fill at all on psellipse and pswedge.
  it.each(SHAPES)('%s hatches for fillstyle=hlines rather than filling flat', (name, template) => {
    const tree = render(name, template.replace('FILL', 'fillstyle=hlines,fillcolor=cyan'));
    const painted = fills(tree).filter((f) => f !== 'none');
    expect(painted.length).toBeGreaterThan(0);
    painted.forEach((f) => expect(f).toMatch(/^url\(#l2j-hatch-\d+\)$/));
    expect(painted).not.toContain(CYAN);
  });

  it.each(SHAPES)('%s draws no fill for an unimplemented style', (name, template) => {
    const tree = render(name, template.replace('FILL', 'fillstyle=gradient,fillcolor=cyan'));
    expect(fills(tree).filter((f) => f !== 'none')).toHaveLength(0);
  });
});

describe('every fillable shape recognises its starred form', () => {
  // Checked one shape at a time, psellipse was the one that never looked for
  // the star: `\psellipse*` drew a bare outline where PSTricks fills solid.
  // Sweeping the whole family is what keeps the next omission from hiding.
  it.each([
    ['psframe', '\\psframe*(-2,-1)(2,1)'],
    ['pscircle', '\\pscircle*(0,0){2}'],
    ['psellipse', '\\psellipse*(0,0)(2,1)'],
    ['pspolygon', '\\pspolygon*(-2,-1)(0,1.5)(2,-1)'],
    ['psarc', '\\psarc*(0,0){2}{30}{150}'],
    ['pswedge', '\\pswedge*(0,0){2}{30}{150}'],
    ['pscurve', '\\pscurve*(-2,-1)(0,1.5)(2,-1)'],
    ['psccurve', '\\psccurve*(-2,-1)(0,1.5)(2,-1)'],
    ['psbezier', '\\psbezier*(-2,-1)(-1,1)(1,-1)(2,1)'],
  ])('%s fills when starred', (name, raw) => {
    const painted = fills(render(name, raw)).filter((f) => f !== 'none');
    expect(painted.length).toBeGreaterThan(0);
  });

  it.each([
    ['psframe', '\\psframe(-2,-1)(2,1)'],
    ['pscircle', '\\pscircle(0,0){2}'],
    ['psellipse', '\\psellipse(0,0)(2,1)'],
    ['pspolygon', '\\pspolygon(-2,-1)(0,1.5)(2,-1)'],
    ['pswedge', '\\pswedge(0,0){2}{30}{150}'],
    ['pscurve', '\\pscurve(-2,-1)(0,1.5)(2,-1)'],
    ['psbezier', '\\psbezier(-2,-1)(-1,1)(1,-1)(2,1)'],
  ])('%s draws no fill when unstarred', (name, raw) => {
    expect(fills(render(name, raw)).filter((f) => f !== 'none')).toHaveLength(0);
  });
});

describe('an open curve is filled without drawing the closing chord', () => {
  // PSTricks bounds a filled open curve with the chord back to its start but
  // never paints that chord. SVG fills an open subpath as if closed while
  // stroking only what was written, so the path must stay open — closing it
  // with Z fills the same region but adds a line the reference does not have.
  it.each([
    ['pscurve', '\\pscurve[fillstyle=solid,fillcolor=cyan](-2,-1)(0,1.5)(2,-1)'],
    ['psbezier', '\\psbezier[fillstyle=solid,fillcolor=cyan](-2,-1)(-1,1)(1,-1)(2,1)'],
  ])('%s fills but leaves its path open', (name, raw) => {
    const path = find(render(name, raw), 'path')!;
    expect(path.styles.fill).toBe(CYAN);
    expect(path.attrs.d).not.toMatch(/[Zz]\s*$/);
  });
});

describe('hatch pattern geometry', () => {
  it('defines one line for hlines and two for crosshatch', () => {
    const one = find(render('pscircle', '\\pscircle[fillstyle=hlines](0,0){2}'), 'pattern')!;
    expect(one.children.filter((c) => c.tag === 'line')).toHaveLength(1);
    const two = find(render('pscircle', '\\pscircle[fillstyle=crosshatch](0,0){2}'), 'pattern')!;
    expect(two.children.filter((c) => c.tag === 'line')).toHaveLength(2);
  });

  it('rotates against the SVG axis so the default hatch runs diagonally', () => {
    const p = find(render('pscircle', '\\pscircle[fillstyle=hlines](0,0){2}'), 'pattern')!;
    expect(p.attrs.patternTransform).toBe('rotate(-45)');
    expect(p.attrs.patternUnits).toBe('userSpaceOnUse');
  });

  it('honours hatchangle, hatchsep and hatchcolor', () => {
    const p = find(
      render('pscircle', '\\pscircle[fillstyle=hlines,hatchangle=0,hatchsep=8pt,hatchcolor=red](0,0){2}'),
      'pattern',
    )!;
    expect(p.attrs.patternTransform).toBe('rotate(0)');
    expect(Number(p.attrs.width)).toBeCloseTo(8 * 1.333, 3);
    expect(p.children.find((c) => c.tag === 'line')!.styles.stroke).toBe(resolveColor('red'));
  });

  it('lays a starred hatch over the fill colour', () => {
    const p = find(render('pscircle', '\\pscircle[fillstyle=hlines*,fillcolor=yellow](0,0){2}'), 'pattern')!;
    expect(p.children.find((c) => c.tag === 'rect')!.styles.fill).toBe(resolveColor('yellow'));
    expect(p.children.filter((c) => c.tag === 'line')).toHaveLength(1);
  });
});

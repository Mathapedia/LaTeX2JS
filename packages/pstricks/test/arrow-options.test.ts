import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * An arrow specification arrives two ways: as the `{->}` group in a command's
 * own syntax, and as an `arrows=->` option. Only the first was read.
 *
 * The option form was left on the shape as a plain string, which then
 * overwrote the parsed pair of flags — and since `'->'[0]` is `'-'`, which is
 * truthy, every renderer testing `arrows[0]` drew a head at BOTH ends whatever
 * direction was asked for. `arrows=*-*` drew two arrowheads where PSTricks
 * draws two discs, and psaxes, which reads its options key by key, dropped the
 * setting entirely and drew no head at all.
 *
 * This matters more than one option usually would: the generated corpus writes
 * every arrow case in the option form, so all of them were wrong at once.
 */
function makeContext() {
  return { xunit: 50, yunit: 50, x0: -5, y0: -5, x1: 5, y1: 5, w: 10, h: 10, variables: {} } as any;
}

function parse(name: string, raw: string): any {
  const m = raw.match((Expressions as any)[name]) as RegExpMatchArray;
  expect(m).not.toBeNull();
  return (Functions as any)[name].call(makeContext(), m);
}

/**
 * The commands whose renderer draws arrowheads, with a body to hang the option
 * on. psplot, pscurve and psbezier accept the option and their parse functions
 * now resolve it, but none of their renderers draws a head yet — a separate
 * gap, not something these should imply is closed.
 */
const SHAPES: Array<[string, (opt: string) => string]> = [
  ['psline', (o) => `\\psline${o}(-2,-1)(2,1)`],
  ['psarc', (o) => `\\psarc${o}(0,0){2}{30}{150}`],
];

describe('the arrows option is read, not left as a string', () => {
  it.each(SHAPES)('%s resolves arrows to a pair of flags', (name, body) => {
    const d = parse(name, body('[arrows=->]'));
    expect(Array.isArray(d.arrows)).toBe(true);
  });

  it.each(SHAPES)('%s puts a head only on the end for arrows=->', (name, body) => {
    expect(parse(name, body('[arrows=->]')).arrows).toEqual([0, 1]);
  });

  it.each(SHAPES)('%s puts a head only on the start for arrows=<-', (name, body) => {
    expect(parse(name, body('[arrows=<-]')).arrows).toEqual([1, 0]);
  });

  it.each(SHAPES)('%s puts a head on both ends for arrows=<->', (name, body) => {
    expect(parse(name, body('[arrows=<->]')).arrows).toEqual([1, 1]);
  });

  it.each(SHAPES)('%s draws no head at all with no arrows option', (name, body) => {
    expect(parse(name, body('')).arrows).toEqual([0, 0]);
  });
});

describe('the option form agrees with the brace form', () => {
  it.each([
    ['->', [0, 1]],
    ['<-', [1, 0]],
    ['<->', [1, 1]],
    ['-', [0, 0]],
  ])('psline reads %s the same way either way', (spec, expected) => {
    expect(parse('psline', `\\psline[arrows=${spec}](-2,-1)(2,1)`).arrows).toEqual(expected);
    expect(parse('psline', `\\psline{${spec}}(-2,-1)(2,1)`).arrows).toEqual(expected);
  });
});

describe('dot ends are discs, not arrowheads', () => {
  it('reads arrows=*-* as two dots and no heads', () => {
    const d = parse('psline', '\\psline[arrows=*-*](-2,-1)(2,1)');
    expect(d.dots).toEqual([1, 1]);
    expect(d.arrows).toEqual([0, 0]);
  });

  it('reads a one-sided dot', () => {
    const d = parse('psline', '\\psline[arrows=*-](-2,-1)(2,1)');
    expect(d.dots).toEqual([1, 0]);
    expect(d.arrows).toEqual([0, 0]);
  });

  it('mixes a dot and a head', () => {
    const d = parse('psline', '\\psline[arrows=*->](-2,-1)(2,1)');
    expect(d.dots).toEqual([1, 0]);
    expect(d.arrows).toEqual([0, 1]);
  });

  it('does not let an arrows option clear dots the brace form set', () => {
    // `{*-*}` names the dots; a later `arrows=->` names heads and says nothing
    // about dots, so the discs stay.
    const d = parse('psline', '\\psline[arrows=->]{*-*}(-2,-1)(2,1)');
    expect(d.dots).toEqual([1, 1]);
  });
});

describe('psaxes honours the option too', () => {
  // psaxes reads its options key by key rather than assigning them wholesale,
  // so the arrows key was dropped on the floor: an arrowed axis drew no head,
  // and kept the tick and number that an arrowed end is supposed to suppress.
  it('reads an arrows option', () => {
    expect(parse('psaxes', '\\psaxes[arrows=->](0,0)(-2,-2)(2,2)').arrows).toEqual([0, 1]);
  });

  it('agrees with the brace form', () => {
    expect(parse('psaxes', '\\psaxes[arrows=<->](0,0)(-2,-2)(2,2)').arrows).toEqual(
      parse('psaxes', '\\psaxes{<->}(0,0)(-2,-2)(2,2)').arrows
    );
  });

  it('still draws no head when none is asked for', () => {
    expect(parse('psaxes', '\\psaxes(0,0)(-2,-2)(2,2)').arrows).toEqual([0, 0]);
  });

  it('keeps the other options it reads key by key', () => {
    const d = parse('psaxes', '\\psaxes[arrows=->,labels=none,showorigin=false](0,0)(-2,-2)(2,2)');
    expect(d.arrows).toEqual([0, 1]);
    expect(d.labels).toBe('none');
    expect(d.showorigin).toBe(false);
  });
});

/** Records the tree a renderer builds. */
function recorder() {
  const root: any = { tag: 'root', attrs: {}, styles: {}, children: [] };
  const wrap = (node: any): any => ({
    append(tag: string) {
      const child = { tag: tag.replace(/^svg:/, ''), attrs: {}, styles: {}, children: [] };
      node.children.push(child);
      return wrap(child);
    },
    attr(k: string, v: any) { node.attrs[k] = String(v); return wrap(node); },
    style(k: string, v: any) { node.styles[k] = String(v); return wrap(node); },
    on() { return wrap(node); },
  });
  return { root, svg: wrap(root) };
}

function drawn(raw: string): any {
  const data = parse('psline', raw);
  data.global = makeContext();
  const { root, svg } = recorder();
  (psgraph as any).psline.call(data, svg);
  return root;
}

/** Where a marker or arrowhead ended up, as an [x, y] pair. */
const circles = (root: any) =>
  root.children.filter((c: any) => c.tag === 'circle').map((c: any) => [Number(c.attrs.cx), Number(c.attrs.cy)]);
const heads = (root: any) =>
  root.children
    .filter((c: any) => c.tag === 'path' && (c.attrs.d || '').trim().endsWith('Z'))
    .map((c: any) => (c.attrs.d.match(/^M ([-\d.]+) ([-\d.]+)/) || []).slice(1).map(Number));

describe('ends of a polyline are its ends, not its first segment', () => {
  // The renderer read x1..y2, which name the first two coordinates. On a
  // three-point line that is the middle vertex, so a `->` grew its head at the
  // corner and a `*-*` put a disc there instead of at the far end.
  const TRI = '(-2,-1)(0,1.5)(2,-1)';
  // X(v) = (10 - (5 - v)) * 50 and Y(v) = (5 - v) * 50 in this context.
  const X = (v: number) => (10 - (5 - v)) * 50;
  const Y = (v: number) => (5 - v) * 50;

  it('puts the end arrowhead on the last point', () => {
    const [head] = heads(drawn(`\\psline[arrows=->]${TRI}`));
    expect(head[0]).toBeCloseTo(X(2), 3);
    expect(head[1]).toBeCloseTo(Y(-1), 3);
  });

  it('puts the start arrowhead on the first point', () => {
    const [head] = heads(drawn(`\\psline[arrows=<-]${TRI}`));
    expect(head[0]).toBeCloseTo(X(-2), 3);
    expect(head[1]).toBeCloseTo(Y(-1), 3);
  });

  it('puts dot markers on both ends, not on a vertex', () => {
    const at = circles(drawn(`\\psline[arrows=*-*]${TRI}`));
    expect(at).toHaveLength(2);
    expect(at[0][0]).toBeCloseTo(X(-2), 3);
    expect(at[1][0]).toBeCloseTo(X(2), 3);
    // The middle vertex must not carry one.
    at.forEach(([x]: number[]) => expect(x).not.toBeCloseTo(X(0), 3));
  });

  it('is unchanged for a two-point line', () => {
    const [head] = heads(drawn('\\psline[arrows=->](-2,-1)(2,1)'));
    expect(head[0]).toBeCloseTo(X(2), 3);
    expect(head[1]).toBeCloseTo(Y(1), 3);
  });
});

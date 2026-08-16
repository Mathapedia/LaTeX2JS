import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * `arrowscale` was parsed by parseOptions but dropped when the head was drawn:
 * arrow() used a hardcoded 8px head, so every arrowhead was the same size no
 * matter what the source asked for. The multiplier now flows from the shape's
 * data into the head geometry (8px × arrowscale).
 */
function makeContext() {
  return {
    xunit: 50, yunit: 50,
    x0: -5, y0: -5, x1: 5, y1: 5,
    w: 10, h: 10,
    variables: {},
  } as any;
}

interface Node { tag: string; attrs: { [k: string]: string }; text?: string; children: Node[] }

function recorder() {
  const root: Node = { tag: 'root', attrs: {}, children: [] };
  const wrap = (node: Node): any => ({
    append(tag: string) {
      const child: Node = { tag: tag.replace(/^svg:/, ''), attrs: {}, children: [] };
      node.children.push(child);
      return wrap(child);
    },
    attr(k: string, v: any) { node.attrs[k] = String(v); return wrap(node); },
    style() { return wrap(node); },
    text(v: string) { node.text = String(v); return wrap(node); },
    on() { return wrap(node); },
  });
  return { root, svg: wrap(root) };
}

function renderLine(raw: string) {
  const ctx = makeContext();
  const m = raw.match(Expressions.psline) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = Functions.psline.call(ctx, m);
  const { root, svg } = recorder();
  psgraph.psline.call(data, svg);
  return {
    // Arrowheads are closed paths; the line itself is an open one.
    heads: root.children.filter((c) => c.tag === 'path' && c.attrs.d.includes('Z')).map((c) => c.attrs.d),
  };
}

function renderAxes(raw: string) {
  const ctx = makeContext();
  const m = raw.match(Expressions.psaxes) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = Functions.psaxes.call(ctx, m);
  const { root, svg } = recorder();
  psgraph.psaxes.call(data, svg);
  return {
    heads: root.children.filter((c) => c.tag === 'path' && c.attrs.d.includes('Z')).map((c) => c.attrs.d),
  };
}

/** The head is a triangle whose tip is the first coordinate and whose wings
 *  are each `d` pixels from the tip along the arrow's line. */
function headSize(d: string): number {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
  return Math.hypot(nums[2] - nums[0], nums[3] - nums[1]);
}

describe('arrowscale on psline', () => {
  it('draws the default 8px head when the option is absent', () => {
    const { heads } = renderLine('\\psline{->}(0,0)(2,0)');
    expect(heads).toHaveLength(1);
    expect(headSize(heads[0])).toBeCloseTo(8, 5);
  });

  it('scales the head by the arrowscale multiplier', () => {
    const { heads } = renderLine('\\psline[arrowscale=2]{->}(0,0)(2,0)');
    expect(headSize(heads[0])).toBeCloseTo(16, 5);
  });

  it('honours fractional scales', () => {
    const { heads } = renderLine('\\psline[arrowscale=1.5]{->}(0,0)(2,0)');
    expect(headSize(heads[0])).toBeCloseTo(12, 5);
  });

  it('falls back to the default for a non-positive scale', () => {
    const { heads } = renderLine('\\psline[arrowscale=-2]{->}(0,0)(2,0)');
    expect(headSize(heads[0])).toBeCloseTo(8, 5);
  });

  it('scales both heads of a two-way arrow', () => {
    const { heads } = renderLine('\\psline[arrowscale=1.5]{<->}(0,0)(2,0)');
    expect(heads).toHaveLength(2);
    heads.forEach((h) => expect(headSize(h)).toBeCloseTo(12, 5));
  });
});

describe('arrowscale on psaxes', () => {
  it('scales the axis arrowheads', () => {
    const { heads } = renderAxes('\\psaxes[arrowscale=2,labels=none,ticks=none]{->}(0,0)(-4,-4)(4,4)');
    expect(heads).toHaveLength(2); // one per arrowed axis
    heads.forEach((h) => expect(headSize(h)).toBeCloseTo(16, 5));
  });

  it('defaults to 8px heads without the option', () => {
    const { heads } = renderAxes('\\psaxes[labels=none,ticks=none]{->}(0,0)(-4,-4)(4,4)');
    heads.forEach((h) => expect(headSize(h)).toBeCloseTo(8, 5));
  });
});

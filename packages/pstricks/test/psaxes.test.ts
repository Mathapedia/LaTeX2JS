import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * `ticks` and `labels` were parsed and discarded, so ticks=none still drew
 * ticks and no axis ever carried a number. Ticks also stepped from the end of
 * the axis rather than the origin, which put every mark at whatever offset the
 * axis happened to start on.
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

function render(raw: string) {
  const ctx = makeContext();
  const m = raw.match(Expressions.psaxes) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = Functions.psaxes.call(ctx, m);
  data.global = ctx;
  const { root, svg } = recorder();
  psgraph.psaxes.call(data, svg);
  return {
    labels: root.children.filter((c) => c.tag === 'text').map((c) => c.text!),
    // Arrowheads are closed paths; the two axis lines and every tick are open
    // ones, so ticks are the open paths beyond those two.
    tickCount:
      root.children.filter((c) => c.tag === 'path' && c.attrs.d && !c.attrs.d.includes('Z')).length - 2,
  };
}

describe('psaxes labels', () => {
  it('numbers ticks on whole units, stepping from the origin', () => {
    const { labels } = render('\\psaxes{->}(0,0)(-3,-3)(3,3)');
    expect(labels).toContain('0');
    expect(labels).toContain('3');
    expect(labels).toContain('-3');
    // Stepping from the axis end would land these on fractions instead.
    labels.forEach((l) => expect(Number.isInteger(Number(l))).toBe(true));
  });

  it('draws the origin number once', () => {
    const { labels } = render('\\psaxes{->}(0,0)(-2,-2)(2,2)');
    expect(labels.filter((l) => l === '0')).toHaveLength(1);
  });

  it.each([
    ['labels=none', 0],
    ['labels=x', 5],
    ['labels=y', 4],
  ])('honours %s', (opt, count) => {
    expect(render(`\\psaxes[${opt}]{->}(0,0)(-2,-2)(2,2)`).labels).toHaveLength(count);
  });

  it('honours ticks=none', () => {
    expect(render('\\psaxes[ticks=none]{->}(0,0)(-2,-2)(2,2)').tickCount).toBe(0);
    expect(render('\\psaxes{->}(0,0)(-2,-2)(2,2)').tickCount).toBeGreaterThan(0);
  });

  it('respects a Dx step', () => {
    const { labels } = render('\\psaxes[Dx=2,labels=x]{->}(0,0)(-4,-4)(4,4)');
    expect(labels).toEqual(['-4', '-2', '0', '2', '4']);
  });
});

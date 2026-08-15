import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * Arc sweep direction is invisible to data-extraction tests: the parsed angles
 * are correct either way, and only the emitted SVG path says which way round
 * the arc actually goes. A wedge drawn with the wrong sweep flag still fills,
 * still has the right colour, and still passes a render smoke test — it just
 * bows inward, which is how a pie chart rendered as a five-pointed star.
 */
function makeContext() {
  return {
    xunit: 50, yunit: 50,
    x0: -5, y0: -5, x1: 5, y1: 5,
    w: 10, h: 10,
    variables: {},
  } as any;
}

/** Collects the `d` attribute of every path a renderer appends. */
function pathsFrom(name: string, raw: string): string[] {
  const ctx = makeContext();
  const m = raw.match((Expressions as any)[name]) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = (Functions as any)[name].call(ctx, m);
  data.global = ctx;

  const out: string[] = [];
  const node = {
    attr(key: string, value: string) { if (key === 'd') out.push(value); return node; },
    style() { return node; },
    on() { return node; },
  };
  const svg = { append: () => node };
  (psgraph as any)[name].call(data, svg);
  return out;
}

/** Pulls the flags out of an `A rx ry rot large sweep x y` command. */
function arcCommand(d: string) {
  const m = /A\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([01])\s+([01])\s+([\d.-]+)\s+([\d.-]+)/.exec(d);
  expect(m).not.toBeNull();
  return { r: Number(m![1]), large: m![4], sweep: m![5], x: Number(m![6]), y: Number(m![7]) };
}

describe('arc sweep direction', () => {
  // The Y transform inverts the axis, so PSTricks' counter-clockwise sweep is
  // SVG sweep-flag 0. Flag 1 traces the complementary arc.
  it.each([
    ['\\pswedge(0,0){3}{0}{72}', 'pswedge'],
    ['\\psarc(0,0){3}{20}{160}', 'psarc'],
  ])('draws %s counter-clockwise', (raw, name) => {
    expect(arcCommand(pathsFrom(name, raw)[0]).sweep).toBe('0');
  });

  it('marks a span wider than half a turn as a large arc', () => {
    expect(arcCommand(pathsFrom('pswedge', '\\pswedge(0,0){3}{0}{200}')[0]).large).toBe('1');
    expect(arcCommand(pathsFrom('pswedge', '\\pswedge(0,0){3}{0}{100}')[0]).large).toBe('0');
  });

  it('takes the long way round when the end angle precedes the start', () => {
    // 200 -> 20 sweeps counter-clockwise through 380, a 180 degree span.
    expect(arcCommand(pathsFrom('psarc', '\\psarc(0,0){3}{200}{20}')[0]).large).toBe('0');
    // 200 -> 100 sweeps 260 degrees the same way, which is the large arc.
    expect(arcCommand(pathsFrom('psarc', '\\psarc(0,0){3}{200}{100}')[0]).large).toBe('1');
  });

  it('emits a closed two-arc path for a full turn', () => {
    // Start and end coincide, so one SVG arc would collapse to nothing.
    const d = pathsFrom('pswedge', '\\pswedge(0,0){3}{0}{360}')[0];
    expect(d.match(/A\s/g)).toHaveLength(2);
    expect(d.trim().endsWith('Z')).toBe(true);
  });
});

describe('pie chart geometry', () => {
  it('gives every wedge of a five-slice pie the same radius and direction', () => {
    const wedges = [[0, 72], [72, 144], [144, 216], [216, 288], [288, 360]].map(
      ([a, b]) => arcCommand(pathsFrom('pswedge', `\\pswedge(0,0){3}{${a}}{${b}}`)[0]),
    );
    for (const w of wedges) {
      expect(w.sweep).toBe('0');
      expect(w.large).toBe('0');
      expect(w.r).toBeCloseTo(150, 5);
    }
  });
});

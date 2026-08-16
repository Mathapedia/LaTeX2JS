import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * The three curve commands are three shapes, not one. Verified against real
 * PSTricks: \pscurve runs through every point, \psccurve wraps back to the
 * start, and \psecurve uses the first and last points only to set the tangents,
 * drawing just the span between the interior ones. psecurve was marked closed
 * alongside psccurve, so it drew a loop where the reference draws a short arc.
 */
function makeContext() {
  return { xunit: 50, yunit: 50, x0: -5, y0: -5, x1: 5, y1: 5, w: 10, h: 10, variables: {} } as any;
}

function pathOf(name: string, raw: string): string {
  const ctx = makeContext();
  const m = raw.match((Expressions as any)[name]) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = (Functions as any)[name].call(ctx, m);
  data.global = ctx;
  let d = '';
  const node = { attr(k: string, v: string) { if (k === 'd') d = v; return node; }, style() { return node; }, on() { return node; } };
  (psgraph as any)[name].call(data, { append: () => node });
  return d;
}

const PTS = '(-2,-1)(-1,1)(1,-1)(2,1)';
const segments = (d: string) => (d.match(/C /g) || []).length;

describe('the three curve commands draw three different shapes', () => {
  it('pscurve is open and spans every point', () => {
    const d = pathOf('pscurve', `\\pscurve${PTS}`);
    expect(d.trim().endsWith('Z')).toBe(false);
    expect(segments(d)).toBe(3); // four points, three spans
  });

  it('psccurve closes back to the start', () => {
    const d = pathOf('psccurve', `\\psccurve${PTS}`);
    expect(d.trim().endsWith('Z')).toBe(true);
  });

  it('psecurve is open and spans only the interior points', () => {
    const d = pathOf('psecurve', `\\psecurve${PTS}`);
    expect(d.trim().endsWith('Z')).toBe(false);
    // The outer points are tangent controls, leaving one drawn span.
    expect(segments(d)).toBe(1);
  });

  it('psecurve starts at the second point, not the first', () => {
    const d = pathOf('psecurve', `\\psecurve${PTS}`);
    const start = /^M ([\d.-]+) ([\d.-]+)/.exec(d)!;
    // X(-1) = (10 - (5 - -1)) * 50 = 200
    expect(Number(start[1])).toBeCloseTo(200, 3);
  });

  it('psecurve draws nothing with too few points to have an interior', () => {
    expect(pathOf('psecurve', '\\psecurve(-1,0)(0,1)(1,0)')).toBe('');
  });
});

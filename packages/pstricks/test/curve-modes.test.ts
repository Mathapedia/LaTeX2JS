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

/** Every "C c1x c1y, c2x c2y, xy" segment of a path, as numbers. */
function beziers(d: string): number[][] {
  return Array.from(d.matchAll(/C ([-\d.e]+) ([-\d.e]+), ([-\d.e]+) ([-\d.e]+), ([-\d.e]+) ([-\d.e]+)/g))
    .map((m) => m.slice(1).map(Number));
}

const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);

describe('control points follow the PSTricks curvature algorithm', () => {
  // Transcribed from the CC and IC procedures in pstricks.pro. The distinction
  // that matters: PSTricks scales a control offset by the length of the
  // segment being drawn, while a Catmull-Rom spline — which is what this used
  // to be — scales it by the chord between the point's two neighbours. At a
  // sharp turn that chord collapses, so Catmull-Rom pinched every psccurve and
  // psecurve in the corpus into cusps the reference does not have.

  it('keeps a control offset even where the path doubles back', () => {
    // The middle point is a spike: its neighbours nearly coincide, so the
    // neighbour chord is tiny while the segments into and out of it are long.
    const d = pathOf('psccurve', '\\psccurve(-2,0)(0,3)(0.2,0)(2,0)');
    const [first] = beziers(d);
    const start = d.match(/M ([-\d.e]+) ([-\d.e]+)/)!.slice(1).map(Number);
    expect(dist(first[0], first[1], start[0], start[1])).toBeGreaterThan(1);
  });

  it('scales the offset with the segment, so a longer span bows further', () => {
    const offset = (scale: number) => {
      // Four points, so the measured control is an interior one: the outermost
      // control of an open curve sits on its endpoint and carries no offset.
      const d = pathOf('pscurve', `\\pscurve(0,0)(${scale},1)(${2 * scale},0)(${3 * scale},1)`);
      const segs = beziers(d);
      const p1 = [segs[0][4], segs[0][5]];
      // The control leaving the second point, measured from that point.
      return dist(segs[1][0], segs[1][1], p1[0], p1[1]);
    };
    expect(offset(2)).toBeGreaterThan(offset(1) * 1.5);
  });

  it('widens the curve for a larger curvature setting', () => {
    const bow = (curvature: string) => {
      const d = pathOf('pscurve', `\\pscurve[curvature=${curvature}](-2,-1)(0,1.5)(2,-1)`);
      const [first] = beziers(d);
      return dist(first[2], first[3], first[4], first[5]);
    };
    expect(bow('2 .1 0')).toBeGreaterThan(bow('1 .1 0'));
  });

  it('starts and ends an open curve with a control on the endpoint itself', () => {
    // OpenCurve's IC begins with a zero tangent and EOC ends with one.
    const d = pathOf('pscurve', '\\pscurve(-2,-1)(0,1.5)(2,-1)');
    const segs = beziers(d);
    const start = d.match(/M ([-\d.e]+) ([-\d.e]+)/)!.slice(1).map(Number);
    expect(dist(segs[0][0], segs[0][1], start[0], start[1])).toBeCloseTo(0, 6);
    const last = segs[segs.length - 1];
    expect(dist(last[2], last[3], last[4], last[5])).toBeCloseTo(0, 6);
  });

  it('gives a closed curve a smooth join, with matching tangents at the seam', () => {
    // The control after the seam point and the control before it are colinear
    // through it; a Catmull-Rom wrap written by hand had no such guarantee.
    const d = pathOf('psccurve', '\\psccurve(-2,-1)(-1,1)(0,-0.5)(1,1.5)(2,0)');
    const segs = beziers(d);
    const start = d.match(/M ([-\d.e]+) ([-\d.e]+)/)!.slice(1).map(Number);
    const after = [segs[0][0], segs[0][1]];
    const before = [segs[segs.length - 1][2], segs[segs.length - 1][3]];
    // Vectors from the seam point in opposite directions: cross product zero.
    const ax = after[0] - start[0], ay = after[1] - start[1];
    const bx = before[0] - start[0], by = before[1] - start[1];
    expect(ax * by - ay * bx).toBeCloseTo(0, 3);
    expect(ax * bx + ay * by).toBeLessThan(0);
  });
});

import { Y } from '@latex2js/utils';

function arrow(x1: number, y1: number, x2: number, y2: number, arrowscale?: number | string) {
  var t = Math.PI / 6;
  // arrowscale is a multiplier on the 8px default head size; anything that
  // is not a positive number falls back to 1 (the PSTricks default).
  var scale = Number(arrowscale);
  var d = 8 * (scale > 0 ? scale : 1);
  var dx = x2 - x1,
    dy = y2 - y1;
  var l = Math.sqrt(dx * dx + dy * dy);

  var cost = Math.cos(t);
  var sint = Math.sin(t);
  var dl = d / l;

  var x = x2 - (dx * cost - dy * sint) * dl;
  var y = y2 - (dy * cost + dx * sint) * dl;

  var context = [];
  context.push('M');
  context.push(x2);
  context.push(y2);
  context.push('L');
  context.push(x);
  context.push(y);

  cost = Math.cos(-t);
  sint = Math.sin(-t);

  x = x2 - (dx * cost - dy * sint) * dl;
  y = y2 - (dy * cost + dx * sint) * dl;

  context.push(x);
  context.push(y);

  context.push('Z');
  return context.join(' ');
}

/** PSTricks' `curvature=a b c` default. */
const CURVATURE_DEFAULT = { a: 1, b: 0.1, c: 0 };

/**
 * The control-point scaling PSTricks itself uses, transcribed from the `CC`
 * and `IC` procedures in its PostScript prologue (pstricks.pro).
 *
 * This is not a Catmull-Rom spline, which is what stood here. The difference
 * is where the control offset gets its length: Catmull-Rom takes it from the
 * chord between a point's two neighbours, so at a sharp turn — where that
 * chord collapses — the curve pinches into a cusp. PSTricks takes it from the
 * length of the segment being drawn, which stays large through the turn, so
 * the curve rounds outward instead. Every psccurve and psecurve in the corpus
 * drew with corners the reference does not have.
 *
 * @param prev - the point before this one
 * @param cur - the point the tangent is taken at
 * @param next - the point after this one
 * @param p - effective curvature parameters, already through `IC`
 * @returns the control points just before and just after `cur`
 */
function curveControls(
  prev: [number, number],
  cur: [number, number],
  next: [number, number],
  p: { a: number; b: number; c: number }
): { before: [number, number]; after: [number, number] } {
  const d0x = cur[0] - prev[0];
  const d0y = cur[1] - prev[1];
  const d1x = next[0] - cur[0];
  const d1y = next[1] - cur[1];
  const l0 = Math.hypot(d0x, d0y);
  const l1 = Math.hypot(d1x, d1y);

  // The tangent leans toward whichever neighbouring segment is longer, by
  // `c` — which IC has already shifted by one, so the default 0 means 1.
  const w0 = Math.pow(l1, p.c);
  const w1 = Math.pow(l0, p.c);
  const tx = d0x * w0 + d1x * w1;
  const ty = d0y * w0 + d1y * w1;
  const tlen = Math.hypot(tx, ty);
  if (!tlen || !isFinite(tlen)) return { before: [...cur], after: [...cur] };

  // Sharper turns pull the control points in. With the default b of 0.1 this
  // is a very weak effect until the path nearly doubles back on itself.
  const turn = Math.atan2(d0y, d0x) - Math.atan2(d1y, d1x);
  const m = (p.a * Math.pow(Math.abs(Math.cos(turn / 2)), p.b)) / tlen / 2;

  return {
    before: [cur[0] - l0 * tx * m, cur[1] - l0 * ty * m],
    after: [cur[0] + l1 * tx * m, cur[1] + l1 * ty * m],
  };
}

/**
 * Reads `curvature` and applies the rescaling PSTricks' `IC` does once before
 * a curve is drawn: c is shifted up by one and clamped, and a is folded
 * together with the b exponent.
 */
function curvatureParams(ctx: any): { a: number; b: number; c: number } {
  const raw = String((ctx && ctx.curvature) ?? '').trim();
  const parts = raw ? raw.split(/[\s,]+/).map(Number) : [];
  const a = isFinite(parts[0]) ? parts[0] : CURVATURE_DEFAULT.a;
  const b = isFinite(parts[1]) ? parts[1] : CURVATURE_DEFAULT.b;
  const c = isFinite(parts[2]) ? parts[2] : CURVATURE_DEFAULT.c;
  return {
    a: ((a * 2) / 3) / Math.pow(Math.cos(Math.PI / 4), b),
    b,
    c: Math.min(3, Math.max(0, c + 1)),
  };
}

/**
 * Cubic Bézier path through a flat [x0,y0,x1,y1,...] point list.
 *
 * The three PSTricks curve commands are three different shapes, not one:
 * `\pscurve` runs through every point, `\psccurve` wraps back to the start, and
 * `\psecurve` uses the first and last points **only** to set the tangents and
 * draws just the span between the interior ones. Treating `psecurve` as closed
 * — as this did — produced a loop where the reference draws a short open arc.
 *
 * @param data - flat coordinate pairs
 * @param mode - which of the three curves to build
 * @param ctx - the shape's parsed data, read for `curvature`
 * @returns an SVG path, empty when there are too few points for the mode
 */
function buildCurvePath(
  data: number[],
  mode: 'open' | 'closed' | 'endpoints',
  ctx?: any
): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < data.length; i += 2) pts.push([data[i], data[i + 1]]);
  const n = pts.length;
  const p = curvatureParams(ctx);
  const seg = (from: [number, number], c1: [number, number], c2: [number, number], to: [number, number]) =>
    ' C ' + c1[0] + ' ' + c1[1] + ', ' + c2[0] + ' ' + c2[1] + ', ' + to[0] + ' ' + to[1];

  if (mode === 'closed') {
    // ClosedCurve wraps the neighbour lookup; PSTricks copies the first three
    // points onto the end of the stack to the same effect.
    if (n < 3) return '';
    const at = (i: number) => pts[((i % n) + n) % n];
    const ctrl = pts.map((_, i) => curveControls(at(i - 1), at(i), at(i + 1), p));
    let d = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for (let i = 0; i < n; i++) {
      d += seg(at(i), ctrl[i].after, ctrl[(i + 1) % n].before, at(i + 1));
    }
    return d + ' Z';
  }

  if (mode === 'endpoints') {
    // AltCurve draws P1..Pn-2; the outer points only feed the tangents.
    if (n < 4) return '';
    let d = 'M ' + pts[1][0] + ' ' + pts[1][1];
    for (let i = 1; i < n - 2; i++) {
      const after = curveControls(pts[i - 1], pts[i], pts[i + 1], p).after;
      const before = curveControls(pts[i], pts[i + 1], pts[i + 2], p).before;
      d += seg(pts[i], after, before, pts[i + 1]);
    }
    return d;
  }

  // OpenCurve. IC starts with a zero tangent and EOC ends with one, so the
  // outermost control point of each end sits on the endpoint itself.
  if (n < 3) return '';
  let d = 'M ' + pts[0][0] + ' ' + pts[0][1];
  for (let i = 0; i < n - 1; i++) {
    const after = i === 0 ? pts[0] : curveControls(pts[i - 1], pts[i], pts[i + 1], p).after;
    const before =
      i + 1 === n - 1 ? pts[n - 1] : curveControls(pts[i], pts[i + 1], pts[i + 2], p).before;
    d += seg(pts[i], after, before, pts[i + 1]);
  }
  return d;
}

const TAU = Math.PI * 2;

/** Points to device units, matching the linewidth conversion in pstricks.ts. */
const PT_TO_PX = 1.333;

/**
 * Line directions each hatched fill style draws, as offsets from `hatchangle`.
 * PSTricks hatches at `hatchangle` for hlines, ninety degrees off for vlines,
 * and both for crosshatch — so the default 45 degrees makes hlines diagonal,
 * not horizontal.
 */
const HATCH_DIRECTIONS: { [style: string]: number[] } = {
  hlines: [0],
  vlines: [90],
  crosshatch: [0, 90],
};

/** PSTricks hatch parameter defaults, in points except the angle and colour. */
const HATCH_DEFAULTS = { hatchwidth: 0.8, hatchsep: 4, hatchangle: 45, hatchcolor: 'black' };

let patternSeq = 0;

/** Reads a dimension that may carry a `pt` suffix, in device units. */
function dimension(value: any, fallbackPt: number): number {
  if (typeof value === 'number' && isFinite(value)) return value * PT_TO_PX;
  const m = typeof value === 'string' ? value.trim().match(/^([\d.]+)\s*(pt)?$/) : null;
  return (m ? Number(m[1]) : fallbackPt) * PT_TO_PX;
}

/**
 * Whether a shape has any fill at all. Renderers that must close a path before
 * it can be filled ask this; the paint itself comes from {@link resolveFill}.
 *
 * @param ctx - the shape's parsed data
 * @returns true when the shape should be built as a closed, fillable region
 */
function hasFill(ctx: any): boolean {
  return !!ctx.filled || (!!ctx.fillstyle && ctx.fillstyle !== 'none');
}

/**
 * Resolves a shape's SVG fill value, defining a hatch pattern when the style
 * calls for one.
 *
 * Every renderer previously spelled this decision itself, in three mutually
 * inconsistent ways: `fillstyle=hlines` became a solid fill on pspolygon and
 * psarc, and no fill at all on psellipse, pswedge and pscurve. Routing all of
 * them through one resolver makes an unimplemented style behave the same
 * everywhere, and gives the hatched styles a real rendering.
 *
 * @param ctx - the shape's parsed data, carrying fillstyle and hatch options
 * @param svg - the container the pattern definition is attached to
 * @returns an SVG paint value: a colour, a `url(#…)` pattern, or `none`
 */
function resolveFill(ctx: any, svg: any): string {
  const style: string = ctx.fillstyle ?? 'none';

  // The starred forms set `filled`; they fill flat regardless of style, in the
  // fillcolor the author wrote. PSTricks fills them with linecolor instead —
  // a difference the dialect reports rather than switches, because rendering
  // must not depend on a flag that cannot deliver PSTricks output anyway.
  if (ctx.filled || style === 'solid') return ctx.fillcolor;
  if (style === 'none' || !style) return 'none';

  const starred = style.endsWith('*');
  const directions = HATCH_DIRECTIONS[starred ? style.slice(0, -1) : style];
  // An unrecognised style is not a fill; guessing solid is what made the same
  // input render differently depending on the shape.
  if (!directions) return 'none';

  const sep = Math.max(1, dimension(ctx.hatchsep, HATCH_DEFAULTS.hatchsep));
  const width = Math.max(0.2, dimension(ctx.hatchwidth, HATCH_DEFAULTS.hatchwidth));
  const angle = Number(ctx.hatchangle ?? HATCH_DEFAULTS.hatchangle) || 0;
  const color = ctx.hatchcolor ?? HATCH_DEFAULTS.hatchcolor;

  const id = 'l2j-hatch-' + ++patternSeq;
  const pattern = svg
    .append('svg:defs')
    .append('svg:pattern')
    .attr('id', id)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', sep)
    .attr('height', sep)
    // SVG's y axis runs opposite to the PSTricks angle convention.
    .attr('patternTransform', 'rotate(' + -angle + ')');

  // A starred hatch lays its lines over the fill colour instead of nothing.
  if (starred) {
    pattern.append('svg:rect').attr('width', sep).attr('height', sep).style('fill', ctx.fillcolor);
  }

  for (const d of directions) {
    const line = pattern.append('svg:line').style('stroke', color).style('stroke-width', width);
    if (d === 0) line.attr('x1', 0).attr('y1', sep / 2).attr('x2', sep).attr('y2', sep / 2);
    else line.attr('x1', sep / 2).attr('y1', 0).attr('x2', sep / 2).attr('y2', sep);
  }

  return 'url(#' + id + ')';
}

/**
 * Resolves a shape's SVG stroke.
 *
 * `linestyle=none` means the outline is not drawn at all. Exactly one renderer
 * honoured that and the rest painted the outline anyway, so a shape asked to
 * show only its fill still came out with a border — the same one-place-right
 * pattern that fillstyle had.
 *
 * @param ctx - the shape's parsed data
 * @param fallback - the colour to use when the shape has no linecolor of its own
 * @returns an SVG paint value, or `none` when the outline is suppressed
 */
function resolveStroke(ctx: any, fallback?: string): string {
  if (ctx && ctx.linestyle === 'none') return 'none';
  return (ctx && ctx.linecolor) || fallback || 'black';
}

/** PSTricks' own defaults for the two broken-line styles, in points. */
const DASH_DEFAULT = '5pt 3pt';
const DOTSEP_DEFAULT = 3;

/** PSTricks' `dotsize=2pt 2` and `linewidth=0.8pt` defaults. */
const DOTSIZE_DEFAULT = '2pt 2';
const DEFAULT_LINEWIDTH_PX = 0.8 * PT_TO_PX;

/**
 * The SVG dash pattern for a shape's linestyle, or `none` when it draws solid.
 *
 * `linestyle=dashed` and `linestyle=dotted` were honoured by psline and
 * pspolygon and ignored by every other shape, and where they were honoured
 * both emitted the same `9,5` — so a dotted line rendered as a dashed one and
 * neither followed the `dash` or `dotsep` the author set.
 *
 * @param ctx - the shape's parsed data, carrying linestyle, dash and dotsep
 * @returns an SVG stroke-dasharray value
 */
function dashArray(ctx: any): string {
  const style: string = (ctx && ctx.linestyle) || 'solid';
  const round = (n: number) => Math.round(n * 1000) / 1000;
  if (style === 'dotted') {
    // A zero-length dash under a round cap is how SVG draws a round dot; the
    // gap is dotsep plus the width the cap itself occupies.
    const sep = dimension(ctx.dotsep, DOTSEP_DEFAULT);
    return '0,' + round(sep + (Number(ctx.linewidth) || 0));
  }
  if (style !== 'dashed') return 'none';
  // `dash=5pt 3pt` names the black length then the white one.
  const parts = String(ctx.dash ?? DASH_DEFAULT).trim().split(/\s+/);
  const on = dimension(parts[0], 5);
  const off = dimension(parts[1] ?? parts[0], 3);
  return round(on) + ',' + round(off);
}

/** Round caps are what turn a zero-length dash into a dot. */
function dashCap(ctx: any): string {
  return ctx && ctx.linestyle === 'dotted' ? 'round' : 'butt';
}

/**
 * The radius of a plotted dot.
 *
 * PSTricks reads `dotsize=<dim> <factor>` and sets the dot's *diameter* to
 * `dim + factor × linewidth`, so a thicker pen draws a proportionally bigger
 * dot — its `dotsize=2pt 2` default and the halving are both from
 * pstricks-dots.tex. This was a fixed radius that read neither part, so
 * `\psdots[linewidth=4pt]` drew the same specks as a hairline where the
 * reference draws discs five times the size.
 *
 * @param ctx - the shape's parsed data, carrying dotsize and linewidth
 * @returns the radius in device units
 */
function dotRadius(ctx: any): number {
  const parts = String(ctx.dotsize ?? DOTSIZE_DEFAULT).trim().split(/\s+/);
  const base = dimension(parts[0], 2);
  const factor = Number(parts[1]);
  const diameter = base + (isFinite(factor) ? factor : 0) * linewidthPx(ctx);
  return Math.max(0.1, diameter / 2);
}

/**
 * A shape's linewidth in device units.
 *
 * Only two of the parse functions convert a `pt` suffix, so the value reaching
 * a renderer is sometimes a number of pixels and sometimes the string the
 * author wrote. A bare number keeps its device-unit meaning, matching
 * parseLinewidth in pstricks.ts.
 */
function linewidthPx(ctx: any): number {
  const v = ctx && ctx.linewidth;
  if (typeof v === 'number' && isFinite(v)) return v;
  const m = typeof v === 'string' ? v.trim().match(/^([\d.]+)\s*(pt)?$/) : null;
  if (!m) return DEFAULT_LINEWIDTH_PX;
  return Number(m[1]) * (m[2] ? PT_TO_PX : 1);
}

/**
 * Whether a command's geometry can be drawn.
 *
 * `X` and `Y` return NaN for a coordinate they cannot compute. Handing that to
 * SVG does not fail visibly: an invalid geometry attribute is treated as absent
 * and the element falls back to its default, so a broken shape reappears at the
 * origin looking intentional. Skipping it is the honest result, and the parser
 * has already reported the reason against the source line.
 *
 * @param ctx - a command's parsed data
 * @returns false when any of its own numeric fields is non-finite
 */
function drawable(ctx: any, depth = 0): boolean {
  if (depth > 4 || ctx === null || ctx === undefined) return true;
  if (typeof ctx === 'number') return isFinite(ctx);
  if (Array.isArray(ctx)) return ctx.every((v) => drawable(v, depth + 1));
  if (typeof ctx !== 'object') return true;
  return Object.entries(ctx).every(
    // `global` is the shared environment, not this command's geometry.
    ([k, v]) => k === 'global' || k === 'env' || drawable(v, depth + 1)
  );
}

/**
 * SVG arc flags for a PSTricks arc running from `angleA` to `angleB`.
 *
 * PSTricks always sweeps counter-clockwise in its own coordinates, taking the
 * long way round when the end angle precedes the start. `Y` inverts the axis,
 * so that counter-clockwise sweep is drawn with SVG's sweep-flag 0 — using 1
 * traces the complementary arc, which is what bowed every `\pswedge` inward
 * and turned a pie chart into a star.
 *
 * @param angleA - start angle in radians
 * @param angleB - end angle in radians
 * @returns the sweep span plus SVG's large-arc and sweep flags
 */
function arcFlags(
  angleA: number,
  angleB: number
): { delta: number; large: number; sweep: number; full: boolean } {
  let raw = angleB - angleA;
  if (!isFinite(raw)) raw = 0;
  // A span of a full turn or more paints the whole circle: PSTricks keeps
  // sweeping past 360 and simply overlaps itself, so \psarc{0}{450} is a
  // circle, not the 90 degrees the modulo below leaves behind. Reducing first
  // and asking afterwards is what lost the extra turn.
  const full = Math.abs(raw) >= TAU - 1e-9;
  const delta = ((raw % TAU) + TAU) % TAU;
  return { delta, large: delta > Math.PI ? 1 : 0, sweep: 0, full };
}

/**
 * A full turn cannot be expressed as one SVG arc, because the start and end
 * points coincide. Such a sweep is emitted as two half-turns instead.
 *
 * @param cx - centre x in device units
 * @param cy - centre y in device units
 * @param r - radius in device units
 * @returns a closed circular path
 */
function fullCirclePath(cx: number, cy: number, r: number): string {
  return (
    'M ' + (cx - r) + ' ' + cy +
    ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + cy +
    ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx - r) + ' ' + cy + ' Z'
  );
}

function curveRenderer(this: any, svg: any): void {
  const mode = this.endpoints ? 'endpoints' : this.closed ? 'closed' : 'open';
  const d = buildCurvePath(this.data, mode, this);
  if (!d) return;
  svg
    .append('svg:path')
    .attr('d', d)
    .style('stroke-width', this.linewidth)
    .style('stroke', resolveStroke(this))
    .style('stroke-dasharray', dashArray(this))
    .style('stroke-linecap', dashCap(this))
    .style('stroke-opacity', 1)
    .style('fill', resolveFill(this, svg));
}

const psgraph: any = {
  env: null as any,
  getSize(): { width: number; height: number } {
    const padding = 20;
    this.env.scale = 1;
    const goalWidth =
      Math.max(document.documentElement.clientWidth, window.innerWidth || 0) -
      padding;
    if (goalWidth <= this.env.w * this.env.xunit) {
      this.env.scale = goalWidth / this.env.w / this.env.xunit;
    }
    const width: number = this.env.w * this.env.xunit;
    const height: number = this.env.h * this.env.yunit;

    return {
      width,
      height
    };
  },

  psframe(svg: any): void {
    const filled = hasFill(this);
    if (filled) {
      svg
        .append('svg:rect')
        .attr('x', Math.min(this.x1, this.x2))
        .attr('y', Math.min(this.y1, this.y2))
        .attr('width', Math.abs(this.x2 - this.x1))
        .attr('height', Math.abs(this.y2 - this.y1))
        .style('fill', resolveFill(this, svg))
        .style('stroke', 'none');
    }

    svg
      .append('svg:line')
      .attr('x1', this.x1)
      .attr('y1', this.y1)
      .attr('x2', this.x2)
      .attr('y2', this.y1)
      .style('stroke-width', 2)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x2)
      .attr('y1', this.y1)
      .attr('x2', this.x2)
      .attr('y2', this.y2)
      .style('stroke-width', 2)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x2)
      .attr('y1', this.y2)
      .attr('x2', this.x1)
      .attr('y2', this.y2)
      .style('stroke-width', 2)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x1)
      .attr('y1', this.y2)
      .attr('x2', this.x1)
      .attr('y2', this.y1)
      .style('stroke-width', 2)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1);
  },

  pscircle: function (svg: any) {
    const filled = hasFill(this);
    svg
      .append('svg:circle')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('r', this.r)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('fill', resolveFill(this, svg))
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1);
  },

  psplot(svg: any): void {
    // `plotstyle=dots` marks the samples instead of joining them. It was parsed
    // and dropped, so a plot asking for dots drew a line through them — or, at
    // plotpoints=1, a path of one point, which is nothing at all. That is why
    // the tangent markers were missing from every picture in graph.tex.
    if (this.plotstyle === 'dots') {
      for (let i = 0; i < this.data.length; i += 2) {
        svg
          .append('svg:circle')
          .attr('cx', this.data[i])
          .attr('cy', this.data[i + 1])
          .attr('r', dotRadius(this))
          .attr('class', 'psplot')
          .style('fill', this.linecolor)
          .style('stroke', 'none');
      }
      return;
    }

    var context = [];
    context.push('M');
    if (hasFill(this)) {
      context.push(this.data[0]);
      context.push(Y.call(this.global, 0));
    } else {
      context.push(this.data[0]);
      context.push(this.data[1]);
    }
    context.push('L');

    this.data.forEach((data: any) => {
      context.push(data);
    });

    if (hasFill(this)) {
      context.push(this.data[this.data.length - 2]);
      context.push(Y.call(this.global, 0));
      context.push('Z');
    }

    svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .attr('class', 'psplot')
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg))
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this));
  },

  pspolygon(svg: any): void {
    var context = [];
    context.push('M');
    context.push(this.data[0]);
    context.push(this.data[1]);
    context.push('L');

    this.data.forEach((data: any) => {
      context.push(data);
    });
    context.push('Z');

    svg
      .append('svg:path')
      .attr('d', context.join(' '))
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg))
      // Was hardcoded black, so linecolor and linestyle=none were both ignored.
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this));
  },

  psarc(svg: any): void {
    const { delta, large, sweep, full } = arcFlags(this.angleA, this.angleB);
    const filled = hasFill(this);
    const arc =
      ' A ' + this.r + ' ' + this.r + ' 0 ' + large + ' ' + sweep +
      ' ' + this.B.x + ' ' + this.B.y;
    const d = full || delta === 0
      ? fullCirclePath(this.cx, this.cy, this.r)
      : filled
        ? 'M ' + this.cx + ' ' + this.cy + ' L ' + this.A.x + ' ' + this.A.y + arc + ' Z'
        : 'M ' + this.A.x + ' ' + this.A.y + arc;
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg))
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this));
  },

  psaxes(svg: any): void {
    var xaxis = [this.bottomLeft[0], this.topRight[0]];
    var yaxis = [this.bottomLeft[1], this.topRight[1]];

    var origin = this.origin;
    // Resolved once here: the helper below is an inner function, so it cannot
    // reach the axes' own data through `this`.
    const axisStroke = resolveStroke(this);

    function line(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', 2)
        .style('stroke', axisStroke)
        .style('stroke-opacity', 1);
    }

    /**
     * Tick positions, stepped outward from the origin rather than from the end
     * of the axis. Starting at the end puts every mark at whatever offset the
     * axis happens to begin on, so an axis spanning -3.5 to 3.5 was ticked and
     * labelled at half-integers instead of on the whole numbers.
     */
    /**
     * An axis end that carries an arrowhead, or null. `arrows[0]` points at the
     * low end of each axis and `arrows[1]` at the high end, matching the order
     * the arrowheads are drawn below.
     */
    const arrowedEnds = (axis: number[]): Array<number | null> => [
      this.arrows[0] ? axis[0] : null,
      this.arrows[1] ? axis[1] : null,
    ];

    const positions = (from: number, to: number, at: number, step: number): number[] => {
      if (!(step > 0) || !isFinite(step)) return [];
      // Y inverts the axis, so a vertical span arrives with its ends the other
      // way round. Walking it as given produced no y ticks at all.
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      const out: number[] = [];
      for (let v = at; v <= hi + 1e-6; v += step) out.push(v);
      for (let v = at - step; v >= lo - 1e-6; v -= step) out.unshift(v);

      // PSTricks gives an arrowhead the end of the axis to itself: where one is
      // drawn, the tick and its number are both suppressed. A tick that merely
      // falls short of the tip keeps them, so only a coincident one is dropped.
      const suppressed = arrowedEnds([from, to]).filter((v): v is number => v !== null);
      return out.filter((v) => !suppressed.some((end) => Math.abs(v - end) < 1e-6));
    };

    var xticks = () => {
      positions(xaxis[0], xaxis[1], origin[0], this.dx).forEach((x) => {
        // showorigin=false suppresses the tick at the origin itself.
        if (this.showorigin === false && Math.abs(x - origin[0]) < 1e-6) return;
        line(x, origin[1] - 5, x, origin[1] + 5);
      });
    };

    var yticks = () => {
      positions(yaxis[0], yaxis[1], origin[1], this.dy).forEach((y) => {
        if (this.showorigin === false && Math.abs(y - origin[1]) < 1e-6) return;
        line(origin[0] - 5, y, origin[0] + 5, y);
      });
    };

    const env = this.global || {};

    /** Draws one tick number, positioned clear of its axis. */
    const label = (text: string, x: number, y: number, anchor: string) => {
      svg
        .append('svg:text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', anchor)
        .attr('font-size', 13)
        .attr('font-family', 'serif')
        .style('fill', 'black')
        .text(text);
    };

    /** Tick values are device coordinates; labels need the value they stand for. */
    const value = (device: number, axis: 'x' | 'y'): number => {
      const n = axis === 'x'
        ? device / env.xunit - env.w + env.x1
        : env.y1 - device / env.yunit;
      return Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(4));
    };

    const xlabels = () => {
      positions(xaxis[0], xaxis[1], origin[0], this.dx).forEach((x) => {
        // The origin's number sits directly under the y axis, which would draw
        // the axis line straight through the glyph, so it shifts clear of it
        // and serves both axes — as it does on a hand-drawn pair of axes.
        const atOrigin = Math.abs(x - origin[0]) < 1e-6;
        // showorigin=false drops the number at the origin with its tick.
        if (atOrigin && this.showorigin === false) return;
        if (atOrigin) label(String(value(x, 'x')), x - 7, origin[1] + 20, 'end');
        else label(String(value(x, 'x')), x, origin[1] + 20, 'middle');
      });
    };

    const ylabels = () => {
      positions(yaxis[0], yaxis[1], origin[1], this.dy).forEach((y) => {
        // The origin's own number belongs to the x axis; drawing it again here
        // would stack two glyphs in the same place.
        if (Math.abs(y - origin[1]) < 1e-6) return;
        label(String(value(y, 'y')), origin[0] - 10, y + 4, 'end');
      });
    };

    line(xaxis[0], origin[1], xaxis[1], origin[1]);
    line(origin[0], yaxis[0], origin[0], yaxis[1]);

    const selects = (option: string, axis: 'x' | 'y'): boolean => {
      const v = String(option ?? 'all');
      if (v.match(/none/)) return false;
      return !!(v.match(/all/) || v.match(axis));
    };

    if (selects(this.ticks, 'x')) xticks();
    if (selects(this.ticks, 'y')) yticks();
    if (env.xunit && selects(this.labels, 'x')) xlabels();
    if (env.yunit && selects(this.labels, 'y')) ylabels();

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(xaxis[1], origin[1], xaxis[0], origin[1], this.arrowscale))
        .style('fill', 'black')
        .style('stroke', 'black');

      svg
        .append('path')
        .attr('d', arrow(origin[0], yaxis[1], origin[0], yaxis[0], this.arrowscale))
        .style('fill', 'black')
        .style('stroke', 'black');
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(xaxis[0], origin[1], xaxis[1], origin[1], this.arrowscale))
        .style('fill', 'black')
        .style('stroke', 'black');

      svg
        .append('path')
        .attr('d', arrow(origin[0], yaxis[0], origin[0], yaxis[1], this.arrowscale))
        .style('fill', 'black')
        .style('stroke', 'black');
    }
  },

  psline(svg: any): void {
    var linewidth = this.linewidth,
      // Resolved here so `linestyle=none` suppresses the stroke: the helpers
      // below are inner functions and cannot reach the shape through `this`.
      linecolor = resolveStroke(this);

    // One drawing function for all three styles. There used to be three, and
    // `dashed` and `dotted` were byte-identical — both hardcoded `9,5` — so a
    // dotted line rendered as a dashed one.
    const dash = dashArray(this);
    const cap = dashCap(this);
    function draw(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', dash)
        .style('stroke-linecap', cap)
        .style('stroke-opacity', 1);
    }

    // Every segment of the polyline. A two-point line is the same drawing it
    // always was; anything past the second point used to be dropped.
    const pts = this.points && this.points.length >= 2
      ? this.points
      : [[this.x1, this.y1], [this.x2, this.y2]];
    for (let i = 0; i < pts.length - 1; i++) {
      draw(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    }

    if (this.dots[0]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x1)
        .attr('cy', this.y1)
        .attr('r', 3)
        .style('stroke', resolveStroke(this))
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    if (this.dots[1]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x2)
        .attr('cy', this.y2)
        .attr('r', 3)
        .style('stroke', resolveStroke(this))
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    var x1 = this.x1,
      y1 = this.y1,
      x2 = this.x2,
      y2 = this.y2;

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(x2, y2, x1, y1, this.arrowscale))
        .style('fill', this.linecolor)
        .style('stroke', resolveStroke(this));
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(x1, y1, x2, y2, this.arrowscale))
        .style('fill', this.linecolor)
        .style('stroke', resolveStroke(this));
    }
  },

  userline(svg: any): void {
    var linewidth = this.linewidth,
      // Resolved here so `linestyle=none` suppresses the stroke: the helpers
      // below are inner functions and cannot reach the shape through `this`.
      linecolor = resolveStroke(this);

    // One drawing function for all three styles; see the note in psline.
    const dash = dashArray(this);
    const cap = dashCap(this);
    function draw(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('class', 'userline')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', dash)
        .style('stroke-linecap', cap)
        .style('stroke-opacity', 1);
    }

    // Every segment of the polyline. A two-point line is the same drawing it
    // always was; anything past the second point used to be dropped.
    const pts = this.points && this.points.length >= 2
      ? this.points
      : [[this.x1, this.y1], [this.x2, this.y2]];
    for (let i = 0; i < pts.length - 1; i++) {
      draw(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
    }

    if (this.dots[0]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x1)
        .attr('cy', this.y1)
        .attr('r', 3)
        .attr('class', 'userline')
        .style('stroke', resolveStroke(this))
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    if (this.dots[1]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x2)
        .attr('cy', this.y2)
        .attr('r', 3)
        .attr('class', 'userline')
        .style('stroke', resolveStroke(this))
        .style('fill', this.linecolor)
        .style('stroke-width', 1)
        .style('stroke-opacity', 1);
    }

    var x1 = this.x1,
      y1 = this.y1,
      x2 = this.x2,
      y2 = this.y2;

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(x2, y2, x1, y1, this.arrowscale))
        .attr('class', 'userline')
        .style('fill', this.linecolor)
        .style('stroke', resolveStroke(this));
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(x1, y1, x2, y2, this.arrowscale))
        .attr('class', 'userline')
        .style('fill', this.linecolor)
        .style('stroke', resolveStroke(this));
    }
  },

  /**
   * Graphics placed by an `\rput`, drawn into a translated group.
   *
   * The label form of rput is handled separately, in the DOM pass below. This
   * is the case where the contents are shapes: they are drawn here so they
   * keep their place in document order, which the DOM pass cannot express
   * because it appends after the SVG is finished.
   */
  rputgroup(svg: any): void {
    const g = svg
      .append('svg:g')
      .attr('class', 'rput-group')
      .attr('transform', 'translate(' + this.dx + ',' + this.dy + ')');
    (this.children || []).forEach((child: any) => {
      if (!child || !psgraph.hasOwnProperty(child.key)) return;
      if (!drawable(child.data)) return;
      child.data.global = this.global;
      (psgraph as any)[child.key].call(child.data, g);
    });
  },

  rput(el: any): void {
    // Import debug utilities
    const startTime = Date.now();
    
    // Validate coordinates
    const x = this.x;
    const y = this.y;
    
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      console.warn('RPUT: Invalid coordinates detected', { x, y, text: this.text });
      return;
    }

    // Validate parent container
    if (!el || !el.appendChild) {
      console.warn('RPUT: Invalid parent container provided');
      return;
    }

    // Validate content
    if (!this.text || typeof this.text !== 'string') {
      console.warn('RPUT: Invalid text content', { text: this.text });
      return;
    }

    const div = document.createElement('div');
    
    // Set up element with improved styling for better measurement
    div.className = 'math';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'nowrap'; // Prevent text wrapping during measurement
    div.style.top = `${y}px`;
    div.style.left = `${x}px`;
    div.style.pointerEvents = 'none'; // Prevent interference during positioning
    
    // Add data attributes for debugging
    div.setAttribute('data-rput-x', x.toString());
    div.setAttribute('data-rput-y', y.toString());
    div.setAttribute('data-rput-text', this.text);

    // Enhanced positioning function with better measurement
    const positionElement = () => {
      return new Promise<void>((resolve) => {
        // Use requestAnimationFrame to ensure DOM has been updated
        requestAnimationFrame(() => {
          try {
            // Get accurate bounding box
            const rect = div.getBoundingClientRect();
            
            // Validate measurements
            if (rect.width === 0 || rect.height === 0) {
              console.warn('RPUT: Element has zero dimensions, retrying...', { 
                text: this.text, 
                rect: { width: rect.width, height: rect.height } 
              });
              
              // Retry measurement after a short delay
              setTimeout(() => {
                const retryRect = div.getBoundingClientRect();
                const w = retryRect.width / 2;
                const h = retryRect.height / 2;
                
                // Apply centering with fallback for zero dimensions
                div.style.top = `${y - (h || 10)}px`;
                div.style.left = `${x - (w || 20)}px`;
                div.style.visibility = 'visible';
                div.style.pointerEvents = 'auto';
                resolve();
              }, 10);
              return;
            }

            // Calculate center offsets
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Apply precise centering
            div.style.top = `${y - centerY}px`;
            div.style.left = `${x - centerX}px`;
            div.style.visibility = 'visible';
            div.style.pointerEvents = 'auto';
            
            resolve();
          } catch (error) {
            console.error('RPUT: Error during positioning', error);
            // Fallback positioning
            div.style.top = `${y}px`;
            div.style.left = `${x}px`;
            div.style.visibility = 'visible';
            div.style.pointerEvents = 'auto';
            resolve();
          }
        });
      });
    };

    // Enhanced MathJax processing with better async handling
    const processContent = async () => {
      const mathJax = (window as any).MathJax;
      
      if (mathJax && mathJax.typesetPromise) {
        try {
          // Set content before MathJax processing
          div.innerHTML = this.text;
          
          // Process with MathJax
          await mathJax.typesetPromise([div]);
          
          // Wait for MathJax to complete rendering
          await new Promise(resolve => setTimeout(resolve, 0));
          
          // Position element after MathJax is complete
          await positionElement();
          
        } catch (error) {
          console.error('MathJax typesetting failed:', error);
          // Fallback to plain HTML
          div.innerHTML = this.text;
          await positionElement();
        }
      } else {
        // No MathJax available, use plain HTML
        div.innerHTML = this.text;
        await positionElement();
      }
    };

    // Ensure parent is ready before appending
    if (el.isConnected === false) {
      console.warn('RPUT: Parent container not connected to DOM');
    }
    
    // Append to DOM
    el.appendChild(div);
    
    // Process content asynchronously
    processContent().catch((error) => {
      console.error('RPUT: Failed to process content', error);
      // Emergency fallback
      div.style.visibility = 'visible';
      div.style.pointerEvents = 'auto';
    });
  },

  pspicture(svg: any): void {
    var env = this.env;
    var el = this.$el;
    const plots = this.plot;

    // The parser records `env.elements` in document order, so fills sit under
    // lines exactly as authored.
    const elements = env && env.elements;

    /**
     * Recomputes an interactive element against the pointer position. Static
     * elements keep the data the parser produced.
     */
    function resolveData(item: any, coords: number[] | null, variables: any): any {
      if (!coords || !item.fn) return item.data;

      if (item.name === 'psplot') {
        Object.entries(variables || {}).forEach(([name, value]: [string, any]) => {
          env.variables[name] = value;
        });
        const d = item.fn.call(env, item.match);
        d.global = Object.assign({}, env);
        return d;
      }

      if (item.name === 'userline') {
        const d = item.fn.call(env, item.match);
        env.x2 = coords[0];
        env.y2 = coords[1];
        item.data.x2 = env.x2;
        item.data.y2 = env.y2;

        if (item.data.xExp2) {
          item.data.x2 = d.userx2(coords);
          item.data.x1 = d.userx(coords);
        } else if (item.data.xExp) {
          item.data.x2 = d.userx(coords);
        }

        if (item.data.yExp2) {
          item.data.y2 = d.usery2(coords);
          item.data.y1 = d.usery(coords);
        } else if (item.data.yExp) {
          item.data.y2 = d.usery(coords);
        }

        d.global = Object.assign({}, env);
        Object.assign(d, item.data);
        return d;
      }

      return item.data;
    }

    /** Evaluates every \uservariable at the pointer position, in source order. */
    function readVariables(coords: number[]): { [name: string]: any } {
      const variables: { [name: string]: any } = {};
      const source = elements && elements.length
        ? elements.filter((i: any) => i && i.name === 'uservariable')
        : ((plots && plots.uservariable) || []).map((p: any) => ({ ...p, name: 'uservariable' }));
      source.forEach((item: any) => {
        env.userx = coords[0];
        env.usery = coords[1];
        const dd = item.fn.call(env, item.match);
        variables[item.data.name] = dd.value;
      });
      return variables;
    }

    /**
     * Draws the whole picture into a fresh layer.
     *
     * Redrawing everything is what keeps interaction faithful to the source.
     * Removing just the interactive elements and appending them again put them
     * at the end of the SVG — on top of every later shape — and re-emitted
     * them grouped by command type rather than in document order, so a correct
     * diagram silently reordered itself the first time the pointer crossed it.
     */
    let layer: any = null;
    function drawLayer(coords: number[] | null): void {
      if (layer) layer.remove();
      layer = svg.append('svg:g').attr('class', 'pspicture-layer');
      const variables = coords ? readVariables(coords) : {};

      if (elements && elements.length) {
        elements.forEach((item: any) => {
          // Exact, not a pattern: `rputgroup` is the graphics form of rput and
          // must be drawn here. Only the label form goes through the DOM pass.
          if (!item || !item.name || item.name === 'rput') return;
          if (!psgraph.hasOwnProperty(item.name)) return;
          const data = resolveData(item, coords, variables);
          // A coordinate that could not be computed arrives as NaN. Drawing it
          // anyway is the trap: SVG treats an invalid geometry attribute as
          // absent and falls back to its default, so the shape reappears at the
          // origin looking deliberate. Nothing is the honest output.
          if (!drawable(data)) return;
          data.global = env;
          psgraph[item.name].call(data, layer);
        });
        return;
      }

      // Legacy data without an ordered element list: fall back to the
      // type-grouped iteration, which cannot express author order.
      Object.keys(plots).forEach((key) => {
        if (key === 'rput') return;
        if (!psgraph.hasOwnProperty(key)) return;
        plots[key].forEach((entry: any) => {
          const item = { name: key, data: entry.data, match: entry.match, fn: entry.fn };
          const data = resolveData(item, coords, variables);
          data.global = env;
          psgraph[key].call(data, layer);
        });
      });
    }

    drawLayer(null);

    svg.on(
      'touchmove',
      function (this: any, event: any) {
        event.preventDefault();
        var touch = event.touches ? event.touches[0] : null;
        var rect = event.target.getBoundingClientRect();
        var touchcoords = touch ? [touch.clientX - rect.left, touch.clientY - rect.top] : [0, 0];
        drawLayer(touchcoords);
      }
    );

    svg.on(
      'mousemove',
      function (this: any, event: any) {
        var coords = [event.offsetX || 0, event.offsetY || 0];
        drawLayer(coords);
      }
    );

    // Enhanced cleanup and RPUT processing
    psgraph.processRputElements.call(this, el);
  },

  psdots(svg: any): void {
    for (let i = 0; i < this.data.length; i += 2) {
      svg
        .append('svg:circle')
        .attr('cx', this.data[i])
        .attr('cy', this.data[i + 1])
        .attr('r', dotRadius(this))
        .style('fill', this.linecolor)
        .style('stroke', 'none');
    }
  },

  /**
   * A PSTricks grid is three things, not one: fine subdivision lines, a heavier
   * line on each unit, and the coordinate numbered along the left and bottom
   * edges. Only the unit lines were drawn, in `linecolor` — which `gridcolor`
   * could not override — so a grid was a flat mesh with no reading on it.
   */
  psgrid(svg: any): void {
    const x0 = this.x0, y0 = this.y0, x1 = this.x1, y1 = this.y1;
    const gridcolor = this.gridcolor ?? this.linecolor;
    const gridwidth = dimension(this.gridwidth, 0.8);
    const subdiv = Math.max(0, Math.floor(Number(this.subgriddiv ?? 5)));
    const subcolor = this.subgridcolor ?? 'gray';
    const subwidth = dimension(this.subgridwidth, 0.4);

    const rule = (a: number, b: number, c: number, d: number, color: string, width: number) => {
      svg
        .append('svg:line')
        .attr('x1', a).attr('y1', b).attr('x2', c).attr('y2', d)
        .style('stroke', color)
        .style('stroke-width', width)
        .style('stroke-opacity', 1);
    };

    /** Line offsets across a span, stepping by `step` from `origin`. */
    const rungs = (lo: number, hi: number, origin: number, step: number): number[] => {
      if (!(step > 0) || !isFinite(step)) return [];
      const out: number[] = [];
      for (let v = origin; v <= hi + 1e-6; v += step) out.push(v);
      for (let v = origin - step; v >= lo - 1e-6; v -= step) out.unshift(v);
      return out;
    };

    const ox = this.originX ?? x0;
    const oy = this.originY ?? y0;

    // Subdivisions first, so the unit lines and labels sit over them.
    if (subdiv > 1) {
      for (const x of rungs(x0, x1, ox, this.xunit / subdiv)) rule(x, y0, x, y1, subcolor, subwidth);
      for (const y of rungs(y0, y1, oy, this.yunit / subdiv)) rule(x0, y, x1, y, subcolor, subwidth);
    }

    const xs = rungs(x0, x1, ox, this.xunit);
    const ys = rungs(y0, y1, oy, this.yunit);
    for (const x of xs) rule(x, y0, x, y1, gridcolor, gridwidth);
    for (const y of ys) rule(x0, y, x1, y, gridcolor, gridwidth);

    // Grid numbers are drawn by default, as PSTricks draws them: `gridlabels`
    // defaults to 10pt and only a zero or `none` turns them off. They were
    // opt-in here on the grounds that PSTricks numbers an unbounded page while
    // an SVG is clipped to the picture, so a grid flush with the edge would
    // push them out of the viewport. That is true — the reference renders show
    // PSTricks itself running off the page — but it is an argument for the
    // clamping below, not for silently dropping a default the author expects.
    const labels = this.gridlabels ?? 10;
    if (labels === 'none' || Number(labels) === 0) return;
    const size = dimension(labels, 10);
    const labelcolor = this.gridlabelcolor ?? 'black';
    const text = (s: string, x: number, y: number, anchor: string) => {
      svg
        .append('svg:text')
        .attr('x', x).attr('y', y)
        .attr('text-anchor', anchor)
        .attr('font-size', size)
        .attr('font-family', 'serif')
        .style('fill', labelcolor)
        .text(s);
    };

    const round = (n: number) => (Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(4)));
    const env = this.global || {};
    // Clamped inside the picture so a grid flush with the edge still shows its
    // numbers rather than pushing them out of the viewport.
    const belowY = Math.min(y1 + size + 4, (env.h ?? 0) * (env.yunit ?? 1) - 2);
    const leftX = Math.max(x0 - 4, size);
    for (const x of xs) text(String(round(x / env.xunit - env.w + env.x1)), x, belowY, 'middle');
    for (const y of ys) text(String(round(env.y1 - y / env.yunit)), leftX, y + size / 3, 'end');
  },

  psellipse(svg: any): void {
    svg
      .append('svg:ellipse')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('rx', this.rx)
      .attr('ry', this.ry)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },

  psbezier(svg: any): void {
    // The path stays open even when filled: PSTricks bounds the region with the
    // chord back to the start but does not draw that chord, and SVG fills an
    // open subpath as if closed while stroking only what was written. Closing
    // it with Z would fill identically but paint a line along the chord.
    const d =
      'M ' + this.x1 + ' ' + this.y1 +
      ' C ' + this.x2 + ' ' + this.y2 + ', ' + this.x3 + ' ' + this.y3 + ', ' + this.x4 + ' ' + this.y4;
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },

  pscurve(svg: any): void {
    const d = buildCurvePath(this.data, this.endpoints ? 'endpoints' : this.closed ? 'closed' : 'open', this);
    if (!d) return;
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },

  psecurve: curveRenderer,
  psccurve: curveRenderer,

  pswedge(svg: any): void {
    const { delta, large, sweep, full } = arcFlags(this.angleA, this.angleB);
    const d = full || delta === 0
      ? fullCirclePath(this.cx, this.cy, this.r)
      : 'M ' + this.cx + ' ' + this.cy +
        ' L ' + this.A.x + ' ' + this.A.y +
        ' A ' + this.r + ' ' + this.r + ' 0 ' + large + ' ' + sweep +
        ' ' + this.B.x + ' ' + this.B.y + ' Z';
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },

  pscustom(svg: any): void {
    const filled = hasFill(this);
    let d = '';
    let started = false;
    (this.commands || []).forEach((cmd: any) => {
      const data = cmd.data;
      if (!data) return;
      // The canonical path vocabulary. These describe the path directly rather
      // than contributing a shape, so they come first.
      if (cmd.key === 'moveto') {
        d += ' M ' + data.x + ' ' + data.y;
        started = true;
        return;
      }
      if (cmd.key === 'lineto') {
        if (!started) { d += 'M ' + data.x + ' ' + data.y; started = true; return; }
        d += ' L ' + data.x + ' ' + data.y;
        return;
      }
      if (cmd.key === 'curveto') {
        if (!started) { d += 'M ' + data.x1 + ' ' + data.y1; started = true; }
        d += ' C ' + data.x1 + ' ' + data.y1 + ', ' + data.x2 + ' ' + data.y2 +
          ', ' + data.x + ' ' + data.y;
        return;
      }
      if (cmd.key === 'closepath') {
        if (started) d += ' Z';
        return;
      }
      if (cmd.key === 'psline' || cmd.key === 'userline' || cmd.key === 'psbezier') {
        if (cmd.key === 'psbezier') {
          if (!started) { d += 'M ' + data.x1 + ' ' + data.y1; started = true; }
          d += ' C ' + data.x2 + ' ' + data.y2 + ', ' + data.x3 + ' ' + data.y3 + ', ' + data.x4 + ' ' + data.y4;
          return;
        }
        if (!started) { d += 'M ' + data.x1 + ' ' + data.y1; started = true; }
        d += ' L ' + data.x2 + ' ' + data.y2;
      } else if (cmd.key === 'psframe') {
        if (!started) { d += 'M ' + data.x1 + ' ' + data.y1; started = true; }
        d += ' L ' + data.x2 + ' ' + data.y1 +
          ' L ' + data.x2 + ' ' + data.y2 +
          ' L ' + data.x1 + ' ' + data.y2 + ' Z';
      } else if (cmd.key === 'pspolygon' || cmd.key === 'pscurve') {
        const pts = data.data || [];
        if (pts.length < 2) return;
        if (!started) { d += 'M ' + pts[0] + ' ' + pts[1]; started = true; }
        for (let i = 2; i < pts.length; i += 2) d += ' L ' + pts[i] + ' ' + pts[i + 1];
        d += ' Z';
      }
    });
    if (!started) return;
    if (filled) d += ' Z';
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      // Spelled inline here rather than through the resolver, which is how this
      // one site kept missing the sweeps that fixed the others.
      .style('stroke', resolveStroke(this))
      .style('stroke-dasharray', dashArray(this))
      .style('stroke-linecap', dashCap(this))
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },


  processRputElements(el: any): void {
    // Validate container
    if (!el || typeof el.querySelectorAll !== 'function') {
      console.warn('RPUT: Invalid container for RPUT processing');
      return;
    }

    // Validate RPUT data
    if (!this.plot || !Array.isArray(this.plot.rput)) {
      console.warn('RPUT: No RPUT data to process');
      return;
    }

    // Enhanced cleanup with better error handling
    try {
      // Remove existing RPUT elements
      const existingElements = el.querySelectorAll('.math[data-rput-x]');
      let cleanupCount = 0;
      
      existingElements.forEach((element: HTMLElement) => {
        try {
          // Clean up any pending async operations
          element.style.visibility = 'hidden';
          element.remove();
          cleanupCount++;
        } catch (error) {
          console.warn('RPUT: Error removing existing element', error);
        }
      });

      if (cleanupCount > 0) {
        console.log(`RPUT: Cleaned up ${cleanupCount} existing elements`);
      }

      // Wait for DOM to settle after cleanup
      requestAnimationFrame(() => {
        psgraph.renderRputElements.call(this, el);
      });

    } catch (error) {
      console.error('RPUT: Error during cleanup', error);
      // Fallback to immediate rendering
      psgraph.renderRputElements.call(this, el);
    }
  },

  renderRputElements(el: any): void {
    if (!this.plot?.rput || this.plot.rput.length === 0) {
      return;
    }

    // Track rendering for debugging
    console.log(`RPUT: Rendering ${this.plot.rput.length} elements`);
    
    // Process RPUT elements with better error isolation
    const renderPromises: Promise<void>[] = [];
    
    this.plot.rput.forEach((rput: any, index: number) => {
      try {
        // Validate RPUT data
        if (!rput || !rput.data) {
          console.warn(`RPUT: Invalid RPUT data at index ${index}`, rput);
          return;
        }

        // Add global context
        rput.data.global = this.env;
        
        // Create a promise for this RPUT element
        const renderPromise = new Promise<void>((resolve) => {
          try {
            // Use setTimeout to prevent blocking the main thread
            setTimeout(() => {
              psgraph.rput.call(rput.data, el);
              resolve();
            }, index * 10); // Stagger rendering slightly
          } catch (error) {
            console.error(`RPUT: Error rendering element ${index}`, error);
            resolve();
          }
        });
        
        renderPromises.push(renderPromise);
        
      } catch (error) {
        console.error(`RPUT: Error processing element ${index}`, error);
      }
    });

    // Wait for all RPUT elements to be processed
    Promise.all(renderPromises)
      .then(() => {
        console.log('RPUT: All elements rendered successfully');
      })
      .catch((error) => {
        console.error('RPUT: Error in batch rendering', error);
      });
  }
};

export { arrow };
export default psgraph;

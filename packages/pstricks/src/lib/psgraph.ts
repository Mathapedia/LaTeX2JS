import { Y } from '@latex2js/utils';

function arrow(x1: number, y1: number, x2: number, y2: number) {
  var t = Math.PI / 6;
  var d = 8;
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

/**
 * Catmull-Rom → cubic Bézier path for a flat [x0,y0,x1,y1,...] point list.
 * `closed` wraps the curve back to the start point.
 */
function buildCurvePath(data: number[], closed: boolean): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < data.length; i += 2) pts.push([data[i], data[i + 1]]);
  const n = pts.length;
  if (n < 2) return '';
  const at = (i: number) => pts[((i % n) + n) % n];
  let d = 'M ' + pts[0][0] + ' ' + pts[0][1];
  for (let i = 0; i < n - 1; i++) {
    const p0 = closed ? at(i - 1) : i === 0 ? pts[0] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = closed ? at(i + 2) : i + 2 < n ? pts[i + 2] : pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + p2[0] + ' ' + p2[1];
  }
  if (closed) {
    const pn1 = pts[n - 1];
    const p0 = pts[0];
    const pn2 = pts[n - 2];
    const p1 = pts[1];
    const c1x = pn1[0] + (p0[0] - pn2[0]) / 6;
    const c1y = pn1[1] + (p0[1] - pn2[1]) / 6;
    const c2x = p0[0] - (p1[0] - pn1[0]) / 6;
    const c2y = p0[1] - (p1[1] - pn1[1]) / 6;
    d += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + p0[0] + ' ' + p0[1] + ' Z';
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

  // The starred forms set `filled`; they fill flat regardless of style.
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
function arcFlags(angleA: number, angleB: number): { delta: number; large: number; sweep: number } {
  let delta = angleB - angleA;
  if (!isFinite(delta)) delta = 0;
  delta = ((delta % TAU) + TAU) % TAU;
  return { delta, large: delta > Math.PI ? 1 : 0, sweep: 0 };
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
  const d = buildCurvePath(this.data, !!this.closed);
  if (!d) return;
  svg
    .append('svg:path')
    .attr('d', d)
    .style('stroke-width', this.linewidth)
    .style('stroke', this.linecolor)
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
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x2)
      .attr('y1', this.y1)
      .attr('x2', this.x2)
      .attr('y2', this.y2)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x2)
      .attr('y1', this.y2)
      .attr('x2', this.x1)
      .attr('y2', this.y2)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);

    svg
      .append('svg:line')
      .attr('x1', this.x1)
      .attr('y1', this.y2)
      .attr('x2', this.x1)
      .attr('y2', this.y1)
      .style('stroke-width', 2)
      .style('stroke', 'rgb(0,0,0)')
      .style('stroke-opacity', 1);
  },

  pscircle: function (svg: any) {
    const filled = hasFill(this);
    svg
      .append('svg:circle')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('r', this.r)
      .style('stroke', this.linecolor)
      .style('fill', resolveFill(this, svg))
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1);
  },

  psplot(svg: any): void {
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
      .style('stroke', this.linecolor);
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
      .style('stroke', 'black');
  },

  psarc(svg: any): void {
    const { delta, large, sweep } = arcFlags(this.angleA, this.angleB);
    const filled = hasFill(this);
    const arc =
      ' A ' + this.r + ' ' + this.r + ' 0 ' + large + ' ' + sweep +
      ' ' + this.B.x + ' ' + this.B.y;
    const d = delta === 0
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
      .style('stroke', this.linecolor);
  },

  psaxes(svg: any): void {
    var xaxis = [this.bottomLeft[0], this.topRight[0]];
    var yaxis = [this.bottomLeft[1], this.topRight[1]];

    var origin = this.origin;

    function line(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', 2)
        .style('stroke', 'rgb(0,0,0)')
        .style('stroke-opacity', 1);
    }

    var xticks = () => {
      for (var x = xaxis[0]; x <= xaxis[1]; x += this.dx) {
        line(x, origin[1] - 5, x, origin[1] + 5);
      }
    };

    var yticks = () => {
      for (var y = yaxis[0]; y <= yaxis[1]; y += this.dy) {
        line(origin[0] - 5, y, origin[0] + 5, y);
      }
    };

    line(xaxis[0], origin[1], xaxis[1], origin[1]);
    line(origin[0], yaxis[0], origin[0], yaxis[1]);

    if (this.ticks.match(/all/)) {
      xticks();
      yticks();
    } else if (this.ticks.match(/x/)) {
      xticks();
    } else if (this.ticks.match(/y/)) {
      yticks();
    }

    if (this.arrows[0]) {
      svg
        .append('path')
        .attr('d', arrow(xaxis[1], origin[1], xaxis[0], origin[1]))
        .style('fill', 'black')
        .style('stroke', 'black');

      svg
        .append('path')
        .attr('d', arrow(origin[0], yaxis[1], origin[0], yaxis[0]))
        .style('fill', 'black')
        .style('stroke', 'black');
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(xaxis[0], origin[1], xaxis[1], origin[1]))
        .style('fill', 'black')
        .style('stroke', 'black');

      svg
        .append('path')
        .attr('d', arrow(origin[0], yaxis[0], origin[0], yaxis[1]))
        .style('fill', 'black')
        .style('stroke', 'black');
    }
  },

  psline(svg: any): void {
    var linewidth = this.linewidth,
      linecolor = this.linecolor;

    function solid(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-opacity', 1);
    }

    function dashed(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    function dotted(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    if (this.linestyle.match(/dotted/)) {
      dotted(this.x1, this.y1, this.x2, this.y2);
    } else if (this.linestyle.match(/dashed/)) {
      dashed(this.x1, this.y1, this.x2, this.y2);
    } else {
      solid(this.x1, this.y1, this.x2, this.y2);
    }

    if (this.dots[0]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x1)
        .attr('cy', this.y1)
        .attr('r', 3)
        .style('stroke', this.linecolor)
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
        .style('stroke', this.linecolor)
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
        .attr('d', arrow(x2, y2, x1, y1))
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(x1, y1, x2, y2))
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }
  },

  userline(svg: any): void {
    var linewidth = this.linewidth,
      linecolor = this.linecolor;

    function solid(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('class', 'userline')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-opacity', 1);
    }

    function dashed(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .attr('class', 'userline')
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    function dotted(x1: number, y1: number, x2: number, y2: number) {
      svg
        .append('svg:path')
        .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
        .attr('class', 'userline')
        .style('stroke-width', linewidth)
        .style('stroke', linecolor)
        .style('stroke-dasharray', '9,5')
        .style('stroke-opacity', 1);
    }

    if (this.linestyle.match(/dotted/)) {
      dotted(this.x1, this.y1, this.x2, this.y2);
    } else if (this.linestyle.match(/dashed/)) {
      dashed(this.x1, this.y1, this.x2, this.y2);
    } else {
      solid(this.x1, this.y1, this.x2, this.y2);
    }

    if (this.dots[0]) {
      svg
        .append('svg:circle')
        .attr('cx', this.x1)
        .attr('cy', this.y1)
        .attr('r', 3)
        .attr('class', 'userline')
        .style('stroke', this.linecolor)
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
        .style('stroke', this.linecolor)
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
        .attr('d', arrow(x2, y2, x1, y1))
        .attr('class', 'userline')
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }

    if (this.arrows[1]) {
      svg
        .append('path')
        .attr('d', arrow(x1, y1, x2, y2))
        .attr('class', 'userline')
        .style('fill', this.linecolor)
        .style('stroke', this.linecolor);
    }
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

    // Source-order initial draw: the parser records `env.elements` in
    // document order, so layers (fills under lines, etc.) respect the author's
    // order. Falls back to the old type-grouped iteration for legacy data.
    const elements = env && env.elements;
    if (elements && elements.length) {
      elements.forEach((item: any) => {
        if (!item || !item.name || item.name.match(/rput/)) return;
        if (!psgraph.hasOwnProperty(item.name)) return;
        item.data.global = env;
        psgraph[item.name].call(item.data, svg);
      });
    } else {
      Object.keys(this.plot).forEach((key) => {
        const plot = this.plot[key];
        if (key.match(/rput/)) return;
        if (psgraph.hasOwnProperty(key)) {
          plot.forEach((data: any) => {
            data.data.global = env;
            psgraph[key].call(data.data, svg);
          });
        }
      });
    }

    svg.on(
      'touchmove',
      function (this: any, event: any) {
        event.preventDefault();
        var touch = event.touches ? event.touches[0] : null;
        var rect = event.target.getBoundingClientRect();
        var touchcoords = touch ? [touch.clientX - rect.left, touch.clientY - rect.top] : [0, 0];
        userEvent(touchcoords);
      }
    );

    svg.on(
      'mousemove',
      function (this: any, event: any) {
        var coords = [event.offsetX || 0, event.offsetY || 0];
        userEvent(coords);
      }
    );

    const plots = this.plot;
    function userEvent(coords: any): void {
      svg.selectAll('.userline').remove();
      svg.selectAll('.psplot').remove();
      var currentEnvironment: { [key: string]: any } = {};

      Object.entries(plots || {})
        .forEach(([k, plot]: [string, any]) => {
          if (k.match(/uservariable/)) {
            plot.forEach((data: any) => {
              data.env.userx = coords[0];
              data.env.usery = coords[1];
              var dd = data.fn.call(data.env, data.match);
              currentEnvironment[data.data.name] = dd.value;
            });
          }
        });

      Object.entries(plots || {})
        .forEach(([k, plot]: [string, any]) => {
          if (k.match(/psplot/)) {
            plot.forEach((data: any) => {
              Object.entries(currentEnvironment || {})
                .forEach(([name, variable]: [string, any]) => {
                  data.env.variables[name] = variable;
                });
              var d = data.fn.call(data.env, data.match);
              d.global = {};
              Object.assign(d.global, env);
              psgraph[k].call(d, svg);
            });
          }
          if (k.match(/userline/)) {
            plot.forEach((data: any) => {
              var d = data.fn.call(data.env, data.match);
              data.env.x2 = coords[0];
              data.env.y2 = coords[1];
              data.data.x2 = data.env.x2;
              data.data.y2 = data.env.y2;

              if (data.data.xExp2) {
                data.data.x2 = d.userx2(coords);
                data.data.x1 = d.userx(coords);
              } else if (data.data.xExp) {
                data.data.x2 = d.userx(coords);
              }

              if (data.data.yExp2) {
                data.data.y2 = d.usery2(coords);
                data.data.y1 = d.usery(coords);
              } else if (data.data.yExp) {
                data.data.y2 = d.usery(coords);
              }

              d.global = {};
              Object.assign(d.global, env);
              Object.assign(d, data.data);
              psgraph[k].call(d, svg);
            });
          }
        });
    }

  // Enhanced cleanup and RPUT processing
  psgraph.processRputElements.call(this, el);
  },

  psdots(svg: any): void {
    for (let i = 0; i < this.data.length; i += 2) {
      svg
        .append('svg:circle')
        .attr('cx', this.data[i])
        .attr('cy', this.data[i + 1])
        .attr('r', this.dotsize)
        .style('fill', this.linecolor)
        .style('stroke', 'none');
    }
  },

  psgrid(svg: any): void {
    const x0 = this.x0, y0 = this.y0, x1 = this.x1, y1 = this.y1;
    for (let x = x0; x <= x1 + 0.001; x += this.xunit) {
      svg
        .append('svg:line')
        .attr('x1', x).attr('y1', y0)
        .attr('x2', x).attr('y2', y1)
        .style('stroke', this.linecolor)
        .style('stroke-width', this.gridwidth)
        .style('stroke-opacity', 1);
    }
    for (let y = y0; y <= y1 + 0.001; y += this.yunit) {
      svg
        .append('svg:line')
        .attr('x1', x0).attr('y1', y)
        .attr('x2', x1).attr('y2', y)
        .style('stroke', this.linecolor)
        .style('stroke-width', this.gridwidth)
        .style('stroke-opacity', 1);
    }
  },

  psellipse(svg: any): void {
    svg
      .append('svg:ellipse')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('rx', this.rx)
      .attr('ry', this.ry)
      .style('stroke', this.linecolor)
      .style('stroke-width', this.linewidth)
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },

  psbezier(svg: any): void {
    svg
      .append('svg:path')
      .attr(
        'd',
        'M ' + this.x1 + ' ' + this.y1 +
        ' C ' + this.x2 + ' ' + this.y2 + ', ' + this.x3 + ' ' + this.y3 + ', ' + this.x4 + ' ' + this.y4
      )
      .style('stroke-width', this.linewidth)
      .style('stroke', this.linecolor)
      .style('stroke-opacity', 1)
      .style('fill', 'none');
  },

  pscurve(svg: any): void {
    const d = buildCurvePath(this.data, !!this.closed);
    if (!d) return;
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      .style('stroke', this.linecolor)
      .style('stroke-opacity', 1)
      .style('fill', resolveFill(this, svg));
  },

  psecurve: curveRenderer,
  psccurve: curveRenderer,

  pswedge(svg: any): void {
    const { delta, large, sweep } = arcFlags(this.angleA, this.angleB);
    const d = delta === 0
      ? fullCirclePath(this.cx, this.cy, this.r)
      : 'M ' + this.cx + ' ' + this.cy +
        ' L ' + this.A.x + ' ' + this.A.y +
        ' A ' + this.r + ' ' + this.r + ' 0 ' + large + ' ' + sweep +
        ' ' + this.B.x + ' ' + this.B.y + ' Z';
    svg
      .append('svg:path')
      .attr('d', d)
      .style('stroke-width', this.linewidth)
      .style('stroke', this.linecolor)
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
      .style('stroke', this.linestyle === 'none' ? 'none' : this.linecolor)
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

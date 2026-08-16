import {
  RE,
  parseOptions,
  parseArrows,
  evaluate,
  parseExpression,
  X,
  Xinv,
  Y,
  Yinv
} from '@latex2js/utils';

import Settings from '@latex2js/settings';

/**
 * Parse a PSTricks linewidth value: a bare number is used as-is (SVG px),
 * a `pt` value is converted to px (1pt ≈ 1.333px).
 */
function parseLinewidth(value: string): number {
  const m = value.trim().match(/^([\d.]+)\s*(pt)?$/);
  if (!m) return 2;
  return Number(m[1]) * (m[2] ? 1.333 : 1);
}

/**
 * Device-space endpoints of an arc, measured from the arc's own centre.
 *
 * The radius is an offset from `(cx, cy)`, not from the picture origin, so the
 * centre has to be added before the coordinate transform. Transforming
 * `r*cos(theta)` alone places both endpoints as though every arc were centred
 * on the origin — correct only for one that happens to be, which is why a pie
 * at (0,0) looked right while the same wedge anywhere else collapsed to a
 * spike reaching back to the origin.
 *
 * @param cx - centre x in picture units (empty or absent means 0)
 * @param cy - centre y in picture units
 * @param r - radius in picture units
 * @param angleA - start angle in radians
 * @param angleB - end angle in radians
 * @returns the `A` and `B` endpoints in device coordinates
 */
function arcEndpoints(
  this: any,
  cx: any,
  cy: any,
  r: any,
  angleA: number,
  angleB: number
): { A: { x: number; y: number }; B: { x: number; y: number } } {
  const ox = cx === undefined || cx === '' ? 0 : Number(cx);
  const oy = cy === undefined || cy === '' ? 0 : Number(cy);
  const radius = Number(r);
  const at = (angle: number) => ({
    x: X.call(this, ox + radius * Math.cos(angle)),
    y: Y.call(this, oy + radius * Math.sin(angle))
  });
  return { A: at(angleA), B: at(angleB) };
}

export const Expressions = {
  pspicture: /\\begin\{pspicture\}\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
  psframe: /\\psframe\*?(\[[^\]]*\])?\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
  psplot: /\\psplot\*?(\[[^\]]*\])?\{([^\}]*)\}\{([^\}]*)\}\{([^\}]*)\}/,
  psarc: new RegExp(
    '\\\\psarc\\*?' +
    RE.options +
    RE.type +
    RE.coords +
    RE.squiggle +
    RE.squiggle +
    RE.squiggle
  ),
  pscircle: /\\pscircle.*\(\s*(.*),(.*)\s*\)\{(.*)\}/,
  pspolygon: new RegExp('\\\\pspolygon\\*?' + RE.options + '(.*)'),
  psaxes: new RegExp(
    '\\\\psaxes\\*?' +
    RE.options +
    RE.type +
    RE.coords +
    RE.coordsOpt +
    RE.coordsOpt
  ),
  slider: new RegExp(
    '\\\\slider' +
    RE.options +
    RE.squiggle +
    RE.squiggle +
    RE.squiggle +
    RE.squiggle +
    RE.squiggle
  ),
  psline: new RegExp(
    '\\\\psline\\*?' + RE.options + RE.type + RE.coords + RE.coordsOpt
  ),
  userline: new RegExp(
    '\\\\userline' +
    RE.options +
    RE.type +
    RE.coords +
    RE.coords +
    RE.squiggleOpt +
    RE.squiggleOpt +
    RE.squiggleOpt +
    RE.squiggleOpt
  ),
  uservariable: new RegExp(
    '\\\\uservariable' + RE.options + RE.squiggle + RE.coords + RE.squiggle
  ),
  rput: /\\rput\((.*),(.*)\)\{(.*)\}/,
  psset: /\\psset\{(.*)\}/,
  psdots: new RegExp('\\\\psdots' + RE.options + '(.*)'),
  psgrid: new RegExp(
    '\\\\psgrid' + RE.options + RE.coordsOpt + RE.coordsOpt + RE.coordsOpt
  ),
  psellipse: /\\psellipse.*\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
  psbezier: /\\psbezier(\[[^\]]*\])?\((.*),(.*)\)\((.*),(.*)\)\((.*),(.*)\)\((.*),(.*)\)/,
  pscurve: new RegExp('\\\\pscurve' + RE.options + RE.coords + '(.*)'),
  psecurve: new RegExp('\\\\psecurve' + RE.options + RE.coords + '(.*)'),
  psccurve: new RegExp('\\\\psccurve' + RE.options + RE.coords + '(.*)'),
  pswedge: /\\pswedge(\[[^\]]*\])?\(\s*(.*),(.*)\s*\)\{(.*)\}\{(.*)\}\{(.*)\}/,
  pscustom: /\\pscustom(\[[^\]]*\])?\{([\s\S]*)\}/,
  multido: /\\multido\{([^}]*)\}\{([^}]*)\}\{([\s\S]*)\}/
};

export interface PSTricksContext {
  variables: { [key: string]: any };
  sliders: any[];
  xunit: number;
  yunit: number;
  w: number;
  h: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  userx?: any;
  usery?: any;
}

export const Functions = {
  slider(this: PSTricksContext, m: any) {
    var obj = {
      scalar: 1,
      min: Number(m[2]),
      max: Number(m[3]),
      variable: m[4],
      latex: m[5],
      value: Number(m[6])
    };
    this.variables = this.variables || {};
    this.variables[obj.variable] = obj.value;
    this.sliders = this.sliders || [];
    this.sliders.push(obj);

    if (m[1]) {
      Object.assign(obj, parseOptions(m[1]));
    }
    return obj;
  },
  pspicture(this: PSTricksContext, m: any) {
    var p = {
      x0: Number(m[1]),
      y0: Number(m[2]),
      x1: Number(m[3]),
      y1: Number(m[4])
    };
    var s = {
      w: p.x1 - p.x0,
      h: p.y1 - p.y0
    };
    Object.assign(this, p, s);
    return Object.assign(p, s);
  },
  psframe(this: PSTricksContext, m: any) {
    var obj: any = {
      x1: X.call(this, m[2]),
      y1: Y.call(this, m[3]),
      x2: X.call(this, m[4]),
      y2: Y.call(this, m[5]),
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2,
      filled: /\\psframe\*/.test(m[0])
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    return obj;
  },
  pscircle(this: PSTricksContext, m: any) {
    var obj: any = {
      cx: X.call(this, m[1]),
      cy: Y.call(this, m[2]),
      r: this.xunit * m[3],
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2,
      filled: /\\pscircle\*/.test(m[0])
    };
    var opts = m[0].match(/\[([^\]]*)\]/);
    if (opts) Object.assign(obj, parseOptions(opts[1]));
    return obj;
  },
  psaxes(this: PSTricksContext, m: any) {
    var obj: any = {
      dx: 1 * this.xunit,
      dy: 1 * this.yunit,
      arrows: [0, 0],
      dots: [0, 0],
      ticks: 'all',
      labels: 'all'
    };
    if (m[1]) {
      var options = parseOptions(m[1]);
      if (options.Dx) {
        obj.dx = Number(options.Dx) * this.xunit;
      }
      if (options.Dy) {
        obj.dy = Number(options.Dy) * this.yunit;
      }
      // `ticks` and `labels` select which axes get marks and numbers; both
      // accept all / x / y / none. Dropping them meant ticks=none still drew
      // ticks and labels could never be turned on.
      if (options.ticks) obj.ticks = options.ticks;
      if (options.labels) obj.labels = options.labels;
    }
    // arrows?
    var l = parseArrows(m[2]);
    obj.arrows = l.arrows;
    obj.dots = l.dots;
    // \psaxes*[par]{arrows}(x0,y0)(x1,y1)(x2,y2)
    // m[1] [options]
    // m[2] {<->}
    // origin
    // m[3] x0
    // m[4] y0
    // bottom left corner
    // m[6] x1
    // m[7] y1
    // top right corner
    // m[9] x2
    // m[10] y2
    if (m[5] && !m[8]) {
      // If (x0,y0) is omitted, then the origin is (x1,y1).
      obj.origin = [X.call(this, m[3]), Y.call(this, m[4])];
      obj.bottomLeft = [X.call(this, m[3]), Y.call(this, m[4])];
      obj.topRight = [X.call(this, m[6]), Y.call(this, m[7])];
    } else if (!m[5] && !m[8]) {
      // If both (x0,y0) and (x1,y1) are omitted, (0,0) is used as the default.
      obj.origin = [X.call(this, 0), Y.call(this, 0)];
      obj.bottomLeft = [X.call(this, 0), Y.call(this, 0)];
      obj.topRight = [X.call(this, m[3]), Y.call(this, m[6])];
    } else {
      // all three are specified
      obj.origin = [X.call(this, m[3]), Y.call(this, m[4])];
      obj.bottomLeft = [X.call(this, m[6]), Y.call(this, m[7])];
      obj.topRight = [X.call(this, m[9]), Y.call(this, m[10])];
    }
    return obj;
  },
  psplot(this: PSTricksContext, m: any) {
    var startX = evaluate.call(this, m[2]);
    var endX = evaluate.call(this, m[3]);
    var data: number[] = [];
    var x;

    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'none',
      linewidth: 2
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));

    // Sampling: honor `plotpoints=N` (number of samples); default to a
    // fixed 0.005 step like the original implementation.
    var step = 0.005;
    var plotpoints = obj.plotpoints ? Number(obj.plotpoints) : 0;
    if (plotpoints > 1) {
      step = (endX - startX) / (plotpoints - 1);
    }

    // Compile the plot expression once; evaluate per sample against a
    // reused scope (compile-once / evaluate-many).
    let compiled;
    try {
      compiled = parseExpression(m[4]);
    } catch (err) {
      console.warn('psplot: could not parse expression:', (err as Error).message);
      obj.data = data;
      return obj;
    }
    const scope: any = Object.assign({}, this.variables || {});

    for (x = startX; x <= endX + step / 2; x += step) {
      data.push(X.call(this, x));
      scope.x = x;
      const yValue = compiled.evaluate(scope);
      if (yValue !== undefined && !isNaN(yValue)) {
        data.push(Y.call(this, yValue));
      } else {
        data.push(Y.call(this, 0));
      }
    }
    obj.data = data;
    return obj;
  },
  pspolygon(this: PSTricksContext, m: any) {
    var coords = m[2];
    if (!coords) return;
    var manyCoords = new RegExp(RE.coords, 'g');
    var matches = coords.match(manyCoords);
    var singleCoord = new RegExp(RE.coords);
    var data: number[] = [];
    matches.forEach((coord: string) => {
      var d = singleCoord.exec(coord);
      if (d) {
        data.push(X.call(this, d[1]));
        data.push(Y.call(this, d[2]));
      }
    });
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2,
      filled: /\\pspolygon\*/.test(m[0]),
      data: data
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    return obj;
  },
  psarc(this: PSTricksContext, m: any) {
    var l = parseArrows(m[2]);
    var arrows = l.arrows;
    var dots = l.dots;
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      // PSTricks leaves every shape unfilled unless a fillstyle is
      // given or the starred form is used; an unstarred \psarc is an open
      // curve, not a solid black wedge.
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2,
      arrows: arrows,
      dots: dots,
      filled: /\\psarc\*/.test(m[0]),
      cx: X.call(this, 0),
      cy: Y.call(this, 0)
    };
    if (m[1]) {
      Object.assign(obj, parseOptions(m[1]));
    }
    // m[1] options
    // m[2] arrows
    // m[3] x1
    // m[4] y1
    // m[5] radius
    // m[6] angleA
    // m[7] angleB
    if (m[3]) {
      obj.cx = X.call(this, m[3]);
    }
    if (m[4]) {
      obj.cy = Y.call(this, m[4]);
    }
    // choose x units over y, no reason...
    obj.r = Number(m[5]) * this.xunit;
    obj.angleA = (Number(m[6]) * Math.PI) / 180;
    obj.angleB = (Number(m[7]) * Math.PI) / 180;
    Object.assign(obj, arcEndpoints.call(this, m[3], m[4], m[5], obj.angleA, obj.angleB));
    return obj;
  },
  psline(this: PSTricksContext, m: any) {
    var options = m[1];
    var lineType = m[2];
    var l = parseArrows(lineType);
    var arrows = l.arrows;
    var dots = l.dots;
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'solid',
      fillcolor: 'black',
      linewidth: 2,
      arrows: arrows,
      dots: dots,
      filled: /\\psline\*/.test(m[0])
    };
    if (m[5]) {
      obj.x1 = X.call(this, m[3]);
      obj.y1 = Y.call(this, m[4]);
      obj.x2 = X.call(this, m[6]);
      obj.y2 = Y.call(this, m[7]);
    } else {
      obj.x1 = X.call(this, 0);
      obj.y1 = Y.call(this, 0);
      obj.x2 = X.call(this, m[3]);
      obj.y2 = Y.call(this, m[4]);
    }
    if (options) {
      Object.assign(obj, parseOptions(options));
    }
    // TODO: add regex
    if (typeof obj.linewidth === 'string') {
      obj.linewidth = parseLinewidth(obj.linewidth);
    }
    return obj;
  },
  uservariable(this: PSTricksContext, m: any) {
    var coords = [];
    if (this.userx && this.usery) {
      // coords.push( Xinv.call(this, this.userx) );
      // coords.push( Yinv.call(this, this.usery) );
      coords.push(Number(this.userx));
      coords.push(Number(this.usery));
    } else {
      coords.push(X.call(this, m[3]));
      coords.push(Y.call(this, m[4]));
    }
    var nx1 = Xinv.call(this, coords[0]);
    var ny1 = Yinv.call(this, coords[1]);
    var obj: any = {
      name: m[2],
      x: X.call(this, m[3]),
      y: Y.call(this, m[4]),
      func: m[5],
      value: 0
    };
    try {
      obj.value = parseExpression(m[5]).evaluate(
        Object.assign({ x: nx1, y: ny1 }, this.variables || {})
      );
    } catch (err) {
      console.warn('Error evaluating uservariable expression:', (err as Error).message);
    }
    return obj;
  },
  userline(this: PSTricksContext, m: any) {
    var options = m[1];
    // WE ARENT USING THIS YET!!!! e.g., [linecolor=green]
    var lineType = m[2];
    var l = parseArrows(lineType);
    var arrows = l.arrows;
    var dots = l.dots;

    // Compile the interactive head/tail expressions once; each mousemove just
    // re-evaluates them against a fresh {x, y} scope (compile-once).
    const stripBraces = (s?: string) => (s ? s.replace(/^\{/, '').replace(/\}$/, '').trim() : null);
    const compileOpt = (src: string | null) => {
      if (!src) return null;
      try {
        return parseExpression(src);
      } catch (err) {
        console.warn('userline: could not parse expression:', (err as Error).message);
        return null;
      }
    };
    const xExp = compileOpt(stripBraces(m[7]));
    const yExp = compileOpt(stripBraces(m[8]));
    const xExp2 = compileOpt(stripBraces(m[9]));
    const yExp2 = compileOpt(stripBraces(m[10]));
    const variables = this.variables || {};

    const evalAt = (compiled: any, x: number, y: number) =>
      compiled.evaluate(Object.assign({ x: x, y: y }, variables));

    var obj: any = {
      x1: X.call(this, m[3]),
      y1: Y.call(this, m[4]),
      x2: X.call(this, m[5]),
      y2: Y.call(this, m[6]),
      xExp: m[7],
      yExp: m[8],
      xExp2: m[9],
      yExp2: m[10],
      userx: (coords: number[]) => {
        var nx1 = Xinv.call(this, coords[0]);
        var ny1 = Yinv.call(this, coords[1]);
        try {
          return X.call(this, xExp ? evalAt(xExp, nx1, ny1) : 0);
        } catch (err) {
          console.warn('Error evaluating userx expression:', err);
          return X.call(this, 0);
        }
      },
      usery: (coords: number[]) => {
        var nx2 = Xinv.call(this, coords[0]);
        var ny2 = Yinv.call(this, coords[1]);
        try {
          return Y.call(this, yExp ? evalAt(yExp, nx2, ny2) : 0);
        } catch (err) {
          console.warn('Error evaluating usery expression:', err);
          return Y.call(this, 0);
        }
      },
      userx2: (coords: number[]) => {
        var nx3 = Xinv.call(this, coords[0]);
        var ny3 = Yinv.call(this, coords[1]);
        try {
          return X.call(this, xExp2 ? evalAt(xExp2, nx3, ny3) : 0);
        } catch (err) {
          console.warn('Error evaluating userx2 expression:', err);
          return X.call(this, 0);
        }
      },
      usery2: (coords: number[]) => {
        var nx4 = Xinv.call(this, coords[0]);
        var ny4 = Yinv.call(this, coords[1]);
        try {
          return Y.call(this, yExp2 ? evalAt(yExp2, nx4, ny4) : 0);
        } catch (err) {
          console.warn('Error evaluating usery2 expression:', err);
          return Y.call(this, 0);
        }
      },
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'solid',
      fillcolor: 'black',
      linewidth: 2,
      arrows: arrows,
      dots: dots
    };
    if (options) {
      Object.assign(obj, parseOptions(options));
    }
    // TODO: add regex
    if (typeof obj.linewidth === 'string') {
      obj.linewidth = parseLinewidth(obj.linewidth);
    }
    return obj;
  },
  rput(this: PSTricksContext, m: any) {
    return {
      x: X.call(this, m[1]),
      y: Y.call(this, m[2]),
      text: m[3]
    };
  },
  psset(this: PSTricksContext, m: any) {
    const pairs = m[1].split(',').map((pair: string) => pair.split('='));
    const obj = {};
    pairs.forEach((pair: string[]) => {
      const key = pair[0];
      const value = pair[1];
      Object.keys(Settings.Expressions).forEach((setting) => {
        const exp = (Settings.Expressions as any)[setting];
        if (key.match(exp)) {
          (Settings.Functions as any)[setting](obj, value);
        }
      });
    });
    return obj;
  },
  psdots(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      dotstyle: 'dot',
      dotsize: 2,
      data: parseCoordList.call(this, m[2])
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    return obj;
  },
  psgrid(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      linewidth: 0.5,
      // PSTricks grid defaults: a heavier line on the unit, five finer
      // subdivisions between, and the coordinate numbered along two edges.
      gridcolor: 'black',
      gridwidth: '0.8pt',
      subgriddiv: 5,
      subgridcolor: 'gray',
      subgridwidth: '0.4pt',
      gridlabelcolor: 'black'
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    // \psgrid[opts](x0,y0)(x1,y1) — defaults to the whole pspicture bounds.
    // coordsOpt outer groups: m[2]/m[5]/m[8] = '(x,y)' strings, m[3],m[4] etc.
    var has0 = m[3] !== undefined;
    var has1 = m[6] !== undefined;
    var x0 = has0 ? X.call(this, m[3]) : X.call(this, this.x0);
    var y0 = has0 ? Y.call(this, m[4]) : Y.call(this, this.y0);
    var x1 = has1 ? X.call(this, m[6]) : X.call(this, this.x1);
    var y1 = has1 ? Y.call(this, m[7]) : Y.call(this, this.y1);
    obj.x0 = Math.min(x0, x1);
    obj.y0 = Math.min(y0, y1);
    obj.x1 = Math.max(x0, x1);
    obj.y1 = Math.max(y0, y1);
    obj.xunit = this.xunit;
    obj.yunit = this.yunit;
    // The renderer numbers each line, which needs the picture coordinate the
    // device position stands for.
    obj.originX = X.call(this, 0);
    obj.originY = Y.call(this, 0);
    return obj;
  },
  psellipse(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2
    };
    var opts = m[0].match(/\[([^\]]*)\]/);
    if (opts) Object.assign(obj, parseOptions(opts[1]));
    obj.cx = X.call(this, m[1]);
    obj.cy = Y.call(this, m[2]);
    obj.rx = Math.abs(Number(m[3])) * this.xunit;
    obj.ry = Math.abs(Number(m[4])) * this.yunit;
    return obj;
  },
  psbezier(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      linewidth: 2
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    obj.x1 = X.call(this, m[2]);
    obj.y1 = Y.call(this, m[3]);
    obj.x2 = X.call(this, m[4]);
    obj.y2 = Y.call(this, m[5]);
    obj.x3 = X.call(this, m[6]);
    obj.y3 = Y.call(this, m[7]);
    obj.x4 = X.call(this, m[8]);
    obj.y4 = Y.call(this, m[9]);
    return obj;
  },
  pscurve(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2,
      closed: /\\psecurve|\\psccurve/.test(m[0])
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    // first point is captured separately (m[2], m[3]); the rest follow
    obj.data = [X.call(this, m[2]), Y.call(this, m[3])].concat(
      parseCoordList.call(this, m[4] || '')
    );
    return obj;
  },
  psecurve(this: PSTricksContext, m: any) {
    return Functions.pscurve.call(this, m);
  },
  psccurve(this: PSTricksContext, m: any) {
    return Functions.pscurve.call(this, m);
  },
  pswedge(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      // PSTricks leaves every shape unfilled unless a fillstyle is
      // given or the starred form is used; an unstarred \psarc is an open
      // curve, not a solid black wedge.
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    obj.cx = X.call(this, m[2]);
    obj.cy = Y.call(this, m[3]);
    obj.r = Number(m[4]) * this.xunit;
    obj.angleA = (Number(m[5]) * Math.PI) / 180;
    obj.angleB = (Number(m[6]) * Math.PI) / 180;
    Object.assign(obj, arcEndpoints.call(this, m[2], m[3], m[4], obj.angleA, obj.angleB));
    return obj;
  },
  pscustom(this: PSTricksContext, m: any) {
    var obj: any = {
      linecolor: 'black',
      linestyle: 'solid',
      fillstyle: 'none',
      fillcolor: 'black',
      linewidth: 2,
      body: m[2]
    };
    if (m[1]) Object.assign(obj, parseOptions(m[1]));
    return obj;
  },
  multido(this: PSTricksContext, m: any) {
    var spec = m[1] || '';
    var varMatch = spec.match(/\\([a-zA-Z@]+)\s*=\s*([\d.+-]+)\s*\+\s*([\d.+-]+)/);
    return {
      variable: varMatch ? varMatch[1] : null,
      start: varMatch ? Number(varMatch[2]) : 0,
      step: varMatch ? Number(varMatch[3]) : 1,
      count: Number(m[2]),
      body: m[3]
    };
  }
};

/**
 * Parse a coordinate list like `(0,0)(1,1)(2,2)` into a flat
 * [x0,y0,x1,y1,...] pixel array.
 */
function parseCoordList(this: PSTricksContext, coords: string): number[] {
  var data: number[] = [];
  var re = new RegExp(RE.coords, 'g');
  var m: RegExpExecArray | null;
  while ((m = re.exec(coords)) !== null) {
    data.push(X.call(this, m[1]));
    data.push(Y.call(this, m[2]));
  }
  return data;
}

export default {
  Expressions,
  Functions
};

import { parseExpression } from './expression';
import type { CompiledExpression } from './expression';

export const simplerepl = function (regex: RegExp, replace: string) {
  return function (_m: any, contents: string) {
    return contents.replace(regex, replace);
  };
};

/**
 * Builds a text transform that rewrites each match through `callback`.
 *
 * The callback is invoked with the same receiver the transform was called with,
 * so a transform that needs document state — section numbering, say — can reach
 * it. Callbacks that do not care simply ignore `this`.
 */
export const matchrepl = function (
  regex: RegExp,
  callback: (this: any, match: RegExpMatchArray) => string
) {
  return function (this: any, m: any, contents: string) {
    if (Array.isArray(m)) {
      m.forEach((match: any) => {
        var m2 = match.match(regex);
        contents = contents.replace(m2.input, callback.call(this, m2));
      });
    }
    return contents;
  };
};

export const convertUnits = function (value: string) {
  var m = null;
  if ((m = value.match(/([^c]+)\s*cm/))) {
    var num1 = Number(m[1]);
    return num1 * 50; //118;
  } else if ((m = value.match(/([^i]+)\s*in/))) {
    var num2 = Number(m[1]);
    return num2 * 20; //46;
  } else if ((m = value.match(/(.*)/))) {
    var num3 = Number(m[1]);
    return num3 * 50;
  } else {
    var num4 = Number(value);
    return num4;
  }
};

export const RE = {
  options: '(\\[[^\\]]*\\])?',
  type: '(\\{[^\\}]*\\})?',
  squiggle: '\\{([^\\}]*)\\}',
  squiggleOpt: '(\\{[^\\}]*\\})?',
  coordsOpt: '(\\(\\s*([^\\)]*),([^\\)]*)\\s*\\))?',
  coords: '\\(\\s*([^\\)]*),([^\\)]*)\\s*\\)'
};

/** Option keys whose value names a colour. */
const COLOR_KEYS = ['linecolor', 'fillcolor', 'hatchcolor', 'gridcolor', 'bordercolor', 'shadowcolor', 'labelcolor'];

/**
 * Base colours xcolor mixes against, as RGB triples. Only the names that can
 * appear on the left of a `!` need resolving; every other colour is handed to
 * the browser unchanged, so plain names keep whatever CSS already gives them.
 */
const BASE_COLORS: { [name: string]: [number, number, number] } = {
  red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255],
  cyan: [0, 255, 255], magenta: [255, 0, 255], yellow: [255, 255, 0],
  black: [0, 0, 0], white: [255, 255, 255], gray: [128, 128, 128],
  grey: [128, 128, 128], orange: [255, 165, 0], purple: [128, 0, 128],
  brown: [165, 42, 42], pink: [255, 192, 203], olive: [128, 128, 0],
  violet: [148, 0, 211], teal: [0, 128, 128], lime: [0, 255, 0],
};

/**
 * Resolves an xcolor tint expression to a CSS colour.
 *
 * `gray!40` means forty percent gray against white, and `gray!40!red` mixes
 * against red instead. A browser cannot read either, and an unparsable fill
 * silently falls back to black — which is how a light grey plane rendered as
 * a solid black one.
 *
 * @param value - a colour name, optionally with `!` mix terms
 * @returns a CSS colour; names without a mix term are returned untouched
 */
export const resolveColor = function (value: string): string {
  const parts = String(value).split('!').map((p) => p.trim());
  if (parts.length < 2) return value;

  const rgb = (name: string): [number, number, number] | null =>
    BASE_COLORS[name.toLowerCase()] ?? null;

  let current = rgb(parts[0]);
  if (!current) return value;

  for (let i = 1; i < parts.length; i += 2) {
    const pct = Number(parts[i]);
    if (!isFinite(pct)) return value;
    // An omitted second operand mixes against white, as xcolor does.
    const against = parts[i + 1] ? rgb(parts[i + 1]) : ([255, 255, 255] as [number, number, number]);
    if (!against) return value;
    const w = Math.max(0, Math.min(100, pct)) / 100;
    current = [
      Math.round(current[0] * w + against[0] * (1 - w)),
      Math.round(current[1] * w + against[1] * (1 - w)),
      Math.round(current[2] * w + against[2] * (1 - w)),
    ];
  }

  return 'rgb(' + current[0] + ',' + current[1] + ',' + current[2] + ')';
};

// OPTIONS
// converts [showorigin=false,labels=none, Dx=3.14] to {showorigin: 'false', labels: 'none', Dx: '3.14'}
export const parseOptions = function (opts: string) {
  var options = opts.replace(/[\]\[]/g, '');
  var all = options.split(',');
  var obj: { [key: string]: string } = {};
  all.forEach((option: string) => {
    var kv = option.split('=');
    if (kv.length == 2) {
      const key = kv[0].trim();
      const value = kv[1].trim();
      obj[key] = COLOR_KEYS.indexOf(key) === -1 ? value : resolveColor(value);
    }
  });
  return obj;
};

export const parseArrows = function (m: string) {
  var lineType = m;
  var arrows = [0, 0];
  var dots = [0, 0];
  if (lineType) {
    var type = lineType.match(/\{([^\-]*)?\-([^\-]*)?\}/);
    if (type) {
      if (type[1]) {
        // check starting point
        if (type[1].match(/\*/)) {
          dots[0] = 1;
        } else if (type[1].match(/</)) {
          arrows[0] = 1;
        }
      }
      if (type[2]) {
        // check ending point
        if (type[2].match(/\*/)) {
          dots[1] = 1;
        } else if (type[2].match(/>/)) {
          arrows[1] = 1;
        }
      }
    }
  }
  return {
    arrows: arrows,
    dots: dots
  };
};

// export const evaluate = function (this: any, exp: string) {
//   var num = Number(exp);
//   if (isNaN(num)) {
//     var expression = '';
//     this.variables = this.variables || {};
//     Object.keys(this.variables).map((name: string) => {
//       const val = this.variables[name];
//       expression += 'var ' + name + ' = ' + val + ';';
//     })
//     expression += 'with (Math){' + exp + '}';
//     return eval(expression);
//   } else {
//     return num;
//   }
// };

export const evaluate = function (this: any, exp: string): number {
  const num = Number(exp);
  if (!isNaN(num)) return num;

  this.variables = this.variables || {};

  try {
    return getCompiled(exp).evaluate(this.variables);
  } catch (e) {
    console.warn('Evaluation error:', (e as Error).message);
    return NaN;
  }
};

// Small bounded cache so repeated identical expressions (e.g. plot bounds,
// slider-driven re-evaluation) skip re-parsing entirely.
const expressionCache = new Map<string, CompiledExpression>();
const EXPRESSION_CACHE_MAX = 500;

function getCompiled(exp: string): CompiledExpression {
  let compiled = expressionCache.get(exp);
  if (!compiled) {
    compiled = parseExpression(exp);
    if (expressionCache.size >= EXPRESSION_CACHE_MAX) {
      expressionCache.clear();
    }
    expressionCache.set(exp, compiled);
  }
  return compiled;
}


/**
 * Picture x to device x.
 *
 * Returns NaN for input it cannot transform. Returning 0 instead — as this did
 * — invents a real coordinate at the origin, so a command with one bad value
 * drew a plausible shape in the wrong place rather than failing. Callers detect
 * the non-finite result and skip the element; see `pspicture` in dsh-psgraph.
 *
 * @param v - the coordinate in picture units
 * @returns the device coordinate, or NaN when it cannot be computed
 */
export const X = function (this: any, v: number | string) {
  const numV = typeof v === 'string' ? parseFloat(v) : v;

  if (isNaN(numV)) return NaN;
  if (isNaN(this.w) || isNaN(this.x1) || isNaN(this.xunit)) return NaN;
  if (this.xunit <= 0) return NaN;

  const result = (this.w - (this.x1 - numV)) * this.xunit;
  if (!isFinite(result)) return NaN;

  return Math.round(result * 100) / 100; // Round to 2 decimal places for pixel precision
};

export const Xinv = function (this: any, v: number | string) {
  return Number(v) / this.xunit - this.w + this.x1;
};

/**
 * Picture y to device y, inverting the axis: SVG's y grows downward.
 *
 * Returns NaN for input it cannot transform, for the same reason as {@link X}.
 *
 * @param v - the coordinate in picture units
 * @returns the device coordinate, or NaN when it cannot be computed
 */
export const Y = function (this: any, v: number | string) {
  const numV = typeof v === 'string' ? parseFloat(v) : v;

  if (isNaN(numV)) return NaN;
  if (isNaN(this.y1) || isNaN(this.yunit)) return NaN;
  if (this.yunit <= 0) return NaN;

  const result = (this.y1 - numV) * this.yunit;
  if (!isFinite(result)) return NaN;

  return Math.round(result * 100) / 100; // Round to 2 decimal places for pixel precision
};

export const Yinv = function (this: any, v: number | string) {
  return this.y1 - Number(v) / this.yunit;
};

export const arrowType = parseArrows;
export const dotType = parseArrows;

export { SVGSelection, select } from './svg-utils';
export {
  parseExpression,
  ExpressionError,
  MATH_FUNCTIONS,
  MATH_CONSTANTS,
} from './expression';
export type { CompiledExpression } from './expression';

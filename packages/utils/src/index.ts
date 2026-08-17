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
 * xcolor's base colour set, as RGB triples, transcribed from the
 * `\definecolorset` blocks in xcolor.sty.
 *
 * Nine of these are not what CSS means by the same word, and the divergence is
 * not subtle: xcolor's `green` is pure (0,1,0) while CSS `green` is the much
 * darker #008000, and `purple`, `violet`, `lime`, `orange` and `brown` all
 * name different colours in the two vocabularies. Half of this table used to
 * hold the CSS values under the xcolor names, so a tint mixed toward the wrong
 * colour, and a plain name was handed to the browser and read as CSS.
 */
const BASE_COLORS: { [name: string]: [number, number, number] } = {
  red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255],
  cyan: [0, 255, 255], magenta: [255, 0, 255], yellow: [255, 255, 0],
  black: [0, 0, 0], white: [255, 255, 255],
  gray: [128, 128, 128], grey: [128, 128, 128],
  darkgray: [64, 64, 64], lightgray: [191, 191, 191],
  brown: [191, 128, 64], lime: [191, 255, 0], orange: [255, 128, 0],
  pink: [255, 191, 191], purple: [191, 0, 64], teal: [0, 128, 128],
  violet: [128, 0, 128], olive: [128, 128, 0],
};


/**
 * Colours the document defined for itself with `\definecolor`.
 *
 * Kept apart from the xcolor base set so a document can shadow a built-in name
 * — which is how a page written against browser colours can keep the exact
 * shade it wants while staying valid LaTeX, instead of relying on a name
 * xcolor never defined.
 */
const DEFINED_COLORS: { [name: string]: [number, number, number] } = {};

/** Clears the document-defined colours. Called once per parse. */
export const resetDefinedColors = function (): void {
  for (const name of Object.keys(DEFINED_COLORS)) delete DEFINED_COLORS[name];
};

const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/**
 * Records a `\definecolor{name}{model}{spec}`.
 *
 * The models are xcolor's: `rgb` and `cmyk` take fractions, `RGB` takes
 * 0-255, `gray` a single fraction, and `HTML` six hex digits.
 *
 * @param name - the colour's name
 * @param model - the colour model the spec is written in
 * @param spec - the model's components, comma separated
 * @returns true when the definition was understood
 */
export const defineColor = function (name: string, model: string, spec: string): boolean {
  const key = String(name ?? '').trim().toLowerCase();
  if (!key) return false;
  const parts = String(spec ?? '').split(',').map((p) => Number(p.trim()));
  const m = String(model ?? '').trim();

  if (m === 'rgb' && parts.length >= 3 && parts.every(isFinite)) {
    DEFINED_COLORS[key] = [clamp255(parts[0] * 255), clamp255(parts[1] * 255), clamp255(parts[2] * 255)];
    return true;
  }
  if (m === 'RGB' && parts.length >= 3 && parts.every(isFinite)) {
    DEFINED_COLORS[key] = [clamp255(parts[0]), clamp255(parts[1]), clamp255(parts[2])];
    return true;
  }
  if (m === 'gray' && parts.length >= 1 && isFinite(parts[0])) {
    const g = clamp255(parts[0] * 255);
    DEFINED_COLORS[key] = [g, g, g];
    return true;
  }
  if (m === 'cmyk' && parts.length >= 4 && parts.every(isFinite)) {
    const [c, y2, y3, k] = parts;
    DEFINED_COLORS[key] = [
      clamp255(255 * (1 - Math.min(1, c + k))),
      clamp255(255 * (1 - Math.min(1, y2 + k))),
      clamp255(255 * (1 - Math.min(1, y3 + k))),
    ];
    return true;
  }
  if (m === 'HTML') {
    const hex = String(spec ?? '').trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      DEFINED_COLORS[key] = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
      return true;
    }
  }
  return false;
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

  // A document's own \definecolor wins over the built-in of the same name,
  // as it does in xcolor.
  const rgb = (name: string): [number, number, number] | null =>
    DEFINED_COLORS[name.toLowerCase()] ?? BASE_COLORS[name.toLowerCase()] ?? null;

  // A plain name resolves too. Nine of xcolor's base colours name a different
  // colour in CSS, so handing `green` straight to the browser drew the dark
  // #008000 where the document asks for pure green.
  if (parts.length < 2) {
    const plain = rgb(parts[0]);
    return plain ? 'rgb(' + plain[0] + ',' + plain[1] + ',' + plain[2] + ')' : value;
  }

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
    // The braces are optional. PSTricks accepts the same specification as an
    // option — `[arrows=->]` — and requiring `{->}` meant the option form
    // matched nothing here, so it was left on the shape as a bare string.
    var type = lineType.match(/\{?([^\-{}]*)\-([^\-{}]*)\}?/);
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

/**
 * Turns an `arrows` option back into the pair of flags a renderer reads.
 *
 * A shape's arrow specification arrives two ways: as the `{->}` group in its
 * own syntax, which its parse function reads, and as an `arrows=->` option,
 * which `parseOptions` hands over as a plain string. The string then
 * overwrote the parsed pair — and since `'->'[0]` is `'-'`, which is truthy,
 * every renderer testing `arrows[0]` drew a head at BOTH ends regardless of
 * the direction asked for, while `*-*` drew two arrowheads where PSTricks
 * draws two discs.
 *
 * @param obj - a parsed command, normalized in place
 */
export const normalizeArrows = function (obj: any): void {
  if (!obj || typeof obj.arrows !== 'string') return;
  const parsed = parseArrows(obj.arrows);
  obj.arrows = parsed.arrows;
  // Only take the dots when this specification actually names any, so an
  // `arrows=` option cannot clear dots the `{*-*}` form already set.
  if (parsed.dots[0] || parsed.dots[1]) obj.dots = parsed.dots;
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

export const simplerepl = function (regex: RegExp, replace: string) {
  return function (_m: any, contents: string) {
    return contents.replace(regex, replace);
  };
};

export const matchrepl = function (regex: RegExp, callback: (match: RegExpMatchArray) => string) {
  return function (m: any, contents: string) {
    if (Array.isArray(m)) {
      m.forEach((match: any) => {
        var m2 = match.match(regex);
        contents = contents.replace(m2.input, callback(m2));
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

// OPTIONS
// converts [showorigin=false,labels=none, Dx=3.14] to {showorigin: 'false', labels: 'none', Dx: '3.14'}
export const parseOptions = function (opts: string) {
  var options = opts.replace(/[\]\[]/g, '');
  var all = options.split(',');
  var obj: { [key: string]: string } = {};
  all.forEach((option: string) => {
    var kv = option.split('=');
    if (kv.length == 2) {
      obj[kv[0].trim()] = kv[1].trim();
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

  const mathKeys = Object.keys(Math) as (keyof Math)[];
  const varKeys = Object.keys(this.variables);
  const allKeys = [...mathKeys, ...varKeys];
  const allValues = [
    ...mathKeys.map(k => (Math[k] as any)),
    ...varKeys.map(k => this.variables[k])
  ];

  try {
    // @ts-ignore
    const fn = new Function(...allKeys, `return (${exp});`);
    return fn(...allValues);
  } catch (e) {
    console.warn('Evaluation error:', e);
    return NaN;
  }
};


export const X = function (this: any, v: number | string) {
  // Enhanced validation for coordinate transformation
  const numV = typeof v === 'string' ? parseFloat(v) : v;
  
  if (isNaN(numV)) {
    console.warn('X function: Invalid input value', { input: v, parsed: numV });
    return 0;
  }
  
  if (isNaN(this.w) || isNaN(this.x1) || isNaN(this.xunit)) {
    console.warn('X function: NaN detected in context properties', { w: this.w, x1: this.x1, xunit: this.xunit });
    return 0;
  }
  
  // Validate context properties are reasonable
  if (this.xunit <= 0) {
    console.warn('X function: Invalid xunit value', { xunit: this.xunit });
    return 0;
  }
  
  // Use more precise calculation with proper parentheses
  const result = (this.w - (this.x1 - numV)) * this.xunit;
  
  // Validate result is finite
  if (!isFinite(result)) {
    console.warn('X function: Non-finite result', { 
      input: numV, 
      w: this.w, 
      x1: this.x1, 
      xunit: this.xunit, 
      result 
    });
    return 0;
  }
  
  return Math.round(result * 100) / 100; // Round to 2 decimal places for pixel precision
};

export const Xinv = function (this: any, v: number | string) {
  return Number(v) / this.xunit - this.w + this.x1;
};

export const Y = function (this: any, v: number | string) {
  // Enhanced validation for coordinate transformation
  const numV = typeof v === 'string' ? parseFloat(v) : v;
  
  if (isNaN(numV)) {
    console.warn('Y function: Invalid input value', { input: v, parsed: numV });
    return 0;
  }
  
  if (isNaN(this.y1) || isNaN(this.yunit)) {
    console.warn('Y function: NaN detected in context properties', { y1: this.y1, yunit: this.yunit });
    return 0;
  }
  
  // Validate context properties are reasonable
  if (this.yunit <= 0) {
    console.warn('Y function: Invalid yunit value', { yunit: this.yunit });
    return 0;
  }
  
  // Use more precise calculation for Y coordinate inversion
  const result = (this.y1 - numV) * this.yunit;
  
  // Validate result is finite
  if (!isFinite(result)) {
    console.warn('Y function: Non-finite result', { 
      input: numV, 
      y1: this.y1, 
      yunit: this.yunit, 
      result 
    });
    return 0;
  }
  
  return Math.round(result * 100) / 100; // Round to 2 decimal places for pixel precision
};

export const Yinv = function (this: any, v: number | string) {
  return this.y1 - Number(v) / this.yunit;
};

export const arrowType = parseArrows;
export const dotType = parseArrows;

export { SVGSelection, select } from './svg-utils';

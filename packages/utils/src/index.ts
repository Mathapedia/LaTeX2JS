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

export const evaluate = function (this: any, exp: string) {
  var num = Number(exp);
  if (isNaN(num)) {
    var expression = '';
    this.variables = this.variables || {};
    Object.keys(this.variables).map((name: string) => {
      const val = this.variables[name];
      expression += 'var ' + name + ' = ' + val + ';';
    })
    expression += 'with (Math){' + exp + '}';
    return eval(expression);
  } else {
    return num;
  }
};

export const X = function (this: any, v: number | string) {
  console.log('X function called with:', { v, w: this.w, x1: this.x1, xunit: this.xunit });
  if (isNaN(this.w) || isNaN(this.x1) || isNaN(this.xunit)) {
    console.warn('X function: NaN detected in context properties', { w: this.w, x1: this.x1, xunit: this.xunit });
    return 0;
  }
  return (this.w - (this.x1 - Number(v))) * this.xunit;
};

export const Xinv = function (this: any, v: number | string) {
  return Number(v) / this.xunit - this.w + this.x1;
};

export const Y = function (this: any, v: number | string) {
  console.log('Y function called with:', { v, y1: this.y1, yunit: this.yunit });
  if (isNaN(this.y1) || isNaN(this.yunit)) {
    console.warn('Y function: NaN detected in context properties', { y1: this.y1, yunit: this.yunit });
    return 0;
  }
  return (this.y1 - Number(v)) * this.yunit;
};

export const Yinv = function (this: any, v: number | string) {
  return this.y1 - Number(v) / this.yunit;
};

export const arrowType = parseArrows;
export const dotType = parseArrows;

export { SVGSelection, select } from './svg-utils';

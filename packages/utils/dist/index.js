"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.SVGSelection = exports.dotType = exports.arrowType = exports.Yinv = exports.Y = exports.Xinv = exports.X = exports.evaluate = exports.parseArrows = exports.parseOptions = exports.RE = exports.convertUnits = exports.matchrepl = exports.simplerepl = void 0;
const simplerepl = function (regex, replace) {
    return function (_m, contents) {
        return contents.replace(regex, replace);
    };
};
exports.simplerepl = simplerepl;
const matchrepl = function (regex, callback) {
    return function (m, contents) {
        if (Array.isArray(m)) {
            m.forEach((match) => {
                var m2 = match.match(regex);
                contents = contents.replace(m2.input, callback(m2));
            });
        }
        return contents;
    };
};
exports.matchrepl = matchrepl;
const convertUnits = function (value) {
    var m = null;
    if ((m = value.match(/([^c]+)\s*cm/))) {
        var num1 = Number(m[1]);
        return num1 * 50; //118;
    }
    else if ((m = value.match(/([^i]+)\s*in/))) {
        var num2 = Number(m[1]);
        return num2 * 20; //46;
    }
    else if ((m = value.match(/(.*)/))) {
        var num3 = Number(m[1]);
        return num3 * 50;
    }
    else {
        var num4 = Number(value);
        return num4;
    }
};
exports.convertUnits = convertUnits;
exports.RE = {
    options: '(\\[[^\\]]*\\])?',
    type: '(\\{[^\\}]*\\})?',
    squiggle: '\\{([^\\}]*)\\}',
    squiggleOpt: '(\\{[^\\}]*\\})?',
    coordsOpt: '(\\(\\s*([^\\)]*),([^\\)]*)\\s*\\))?',
    coords: '\\(\\s*([^\\)]*),([^\\)]*)\\s*\\)'
};
// OPTIONS
// converts [showorigin=false,labels=none, Dx=3.14] to {showorigin: 'false', labels: 'none', Dx: '3.14'}
const parseOptions = function (opts) {
    var options = opts.replace(/[\]\[]/g, '');
    var all = options.split(',');
    var obj = {};
    all.forEach((option) => {
        var kv = option.split('=');
        if (kv.length == 2) {
            obj[kv[0].trim()] = kv[1].trim();
        }
    });
    return obj;
};
exports.parseOptions = parseOptions;
const parseArrows = function (m) {
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
                }
                else if (type[1].match(/</)) {
                    arrows[0] = 1;
                }
            }
            if (type[2]) {
                // check ending point
                if (type[2].match(/\*/)) {
                    dots[1] = 1;
                }
                else if (type[2].match(/>/)) {
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
exports.parseArrows = parseArrows;
const evaluate = function (exp) {
    var num = Number(exp);
    if (isNaN(num)) {
        var expression = '';
        this.variables = this.variables || {};
        Object.keys(this.variables).map((name) => {
            const val = this.variables[name];
            expression += 'var ' + name + ' = ' + val + ';';
        });
        expression += 'with (Math){' + exp + '}';
        return eval(expression);
    }
    else {
        return num;
    }
};
exports.evaluate = evaluate;
const X = function (v) {
    console.log('X function called with:', { v, w: this.w, x1: this.x1, xunit: this.xunit });
    if (isNaN(this.w) || isNaN(this.x1) || isNaN(this.xunit)) {
        console.warn('X function: NaN detected in context properties', { w: this.w, x1: this.x1, xunit: this.xunit });
        return 0;
    }
    return (this.w - (this.x1 - Number(v))) * this.xunit;
};
exports.X = X;
const Xinv = function (v) {
    return Number(v) / this.xunit - this.w + this.x1;
};
exports.Xinv = Xinv;
const Y = function (v) {
    console.log('Y function called with:', { v, y1: this.y1, yunit: this.yunit });
    if (isNaN(this.y1) || isNaN(this.yunit)) {
        console.warn('Y function: NaN detected in context properties', { y1: this.y1, yunit: this.yunit });
        return 0;
    }
    return (this.y1 - Number(v)) * this.yunit;
};
exports.Y = Y;
const Yinv = function (v) {
    return this.y1 - Number(v) / this.yunit;
};
exports.Yinv = Yinv;
exports.arrowType = exports.parseArrows;
exports.dotType = exports.parseArrows;
var svg_utils_1 = require("./svg-utils");
Object.defineProperty(exports, "SVGSelection", { enumerable: true, get: function () { return svg_utils_1.SVGSelection; } });
Object.defineProperty(exports, "select", { enumerable: true, get: function () { return svg_utils_1.select; } });

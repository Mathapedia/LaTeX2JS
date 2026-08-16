(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.LaTeX2HTML5 = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    const lines = that.lines
        .map((line) => {
        var m = line.match(/\\item (.*)/);
        if (m) {
            return '<li>' + m[1] + '</li>';
        }
        else {
            return line;
        }
    })
        .join('\n');
    const ul = document.createElement('ul');
    ul.className = 'math';
    ul.innerHTML = lines;
    return ul;
}

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function itemizeLine(line) {
    var m = line.match(/\\item (.*)/);
    if (m)
        return '<li>' + m[1] + '</li>';
    return line;
}
function descriptionLine(line) {
    var m = line.match(/\\item\[([^\]]*)\]\s*(.*)/);
    if (m)
        return '<dt>' + m[1] + '</dt><dd>' + m[2] + '</dd>';
    return itemizeLine(line);
}
/**
 * Renders enumerate / itemize / description lists from \item lines.
 */
function render(that) {
    const type = that.type || 'enumerate';
    const convert = type === 'description' ? descriptionLine : itemizeLine;
    const lines = that.lines.map(convert).join('\n');
    let el;
    if (type === 'enumerate') {
        const ol = document.createElement('ol');
        ol.className = 'math enumerate';
        ol.innerHTML = lines;
        el = ol;
    }
    else if (type === 'description') {
        const dl = document.createElement('dl');
        dl.className = 'math description';
        dl.innerHTML = lines;
        el = dl;
    }
    else {
        const ul = document.createElement('ul');
        ul.className = 'math itemize';
        ul.innerHTML = lines;
        el = ul;
    }
    return el;
}

},{}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
const macros_1 = __importDefault(require("@latex2js/macros"));
function render(_that) {
    var div = document.createElement('div');
    div.id = 'latex-macros';
    div.style.display = 'none';
    div.className = 'verbatim';
    div.innerHTML = macros_1.default;
    return div;
}

},{"@latex2js/macros":18}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    const span = document.createElement('span');
    span.className = 'math';
    span.innerHTML = that.lines.join('\n');
    return span;
}

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    const span = document.createElement('span');
    span.className = 'math nicebox';
    span.innerHTML = that.lines.join('\n');
    return span;
}

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
const pstricks_1 = require("@latex2js/pstricks");
const utils_1 = require("@latex2js/utils");
function render(that) {
    const size = pstricks_1.psgraph.getSize.call(that);
    const width = `${size.width}px`;
    const height = `${size.height}px`;
    const div = document.createElement('div');
    div.className = 'pspicture';
    div.style.width = width;
    div.style.height = height;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    var svgEl = (0, utils_1.select)(svg);
    that.$el = div;
    pstricks_1.psgraph.pspicture.call(that, svgEl);
    div.appendChild(svg);
    const { env, plot } = that;
    const { sliders } = env;
    if (sliders && sliders.length) {
        sliders.forEach((slider) => {
            const { latex, scalar, variable, value, min, max } = slider;
            const onChange = (event) => {
                const target = event.target;
                var val = Number(target.value) / scalar;
                if (!env.variables)
                    env.variables = {};
                env.variables[variable] = val;
                svgEl.selectAll('.psplot').remove();
                Object.entries(plot).forEach(([k, plotData]) => {
                    if (k.match(/psplot/)) {
                        plotData.forEach((data) => {
                            const d = data.fn.call(data.env, data.match);
                            if (pstricks_1.psgraph[k] && d && svgEl) {
                                pstricks_1.psgraph[k].call(d, svgEl);
                            }
                        });
                    }
                });
            };
            const label = document.createElement('label');
            const text = document.createTextNode(latex);
            const input = document.createElement('input');
            input.setAttribute('min', String(min * scalar));
            input.setAttribute('max', String(max * scalar));
            input.setAttribute('type', 'range');
            input.setAttribute('value', value);
            label.appendChild(text);
            label.appendChild(input);
            div.appendChild(label);
            input.addEventListener('input', (event) => {
                onChange(event);
            });
        });
    }
    return div;
}

},{"@latex2js/pstricks":20,"@latex2js/utils":25}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    var pre = document.createElement('pre');
    pre.className = 'verbatim';
    pre.innerHTML = that.lines.join('\n');
    return pre;
}

},{}],8:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.macros = exports.math = exports.verbatim = exports.list = exports.enumerate = exports.nicebox = exports.pspicture = void 0;
exports.default = render;
const latex2js_1 = __importDefault(require("latex2js"));
const mathjaxjs_1 = require("mathjaxjs");
const pspicture_js_1 = __importDefault(require("./components/pspicture.js"));
exports.pspicture = pspicture_js_1.default;
const nicebox_js_1 = __importDefault(require("./components/nicebox.js"));
exports.nicebox = nicebox_js_1.default;
const enumerate_js_1 = __importDefault(require("./components/enumerate.js"));
exports.enumerate = enumerate_js_1.default;
const list_js_1 = __importDefault(require("./components/list.js"));
exports.list = list_js_1.default;
const verbatim_js_1 = __importDefault(require("./components/verbatim.js"));
exports.verbatim = verbatim_js_1.default;
const math_js_1 = __importDefault(require("./components/math.js"));
exports.math = math_js_1.default;
const macros_1 = __importDefault(require("./components/macros"));
exports.macros = macros_1.default;
const ELEMENTS = { pspicture: pspicture_js_1.default, nicebox: nicebox_js_1.default, enumerate: enumerate_js_1.default, itemize: list_js_1.default, description: list_js_1.default, verbatim: verbatim_js_1.default, math: math_js_1.default, macros: macros_1.default };
function render(tex, resolve) {
    const done = () => {
        const latex = new latex2js_1.default();
        const parsed = latex.parse(tex);
        const div = document.createElement('div');
        div.className = 'latex-container';
        parsed &&
            parsed.forEach &&
            parsed.forEach((el) => {
                if (ELEMENTS.hasOwnProperty(el.type)) {
                    const elementType = el.type;
                    div.appendChild(ELEMENTS[elementType](el));
                }
            });
        resolve(div);
    };
    if ((0, mathjaxjs_1.getMathJax)()) {
        return done();
    }
    (0, mathjaxjs_1.loadMathJax)(done);
}
const init = () => {
    (0, mathjaxjs_1.loadMathJax)();
    document.querySelectorAll('script[type="text/latex"]').forEach((el) => {
        render(el.innerHTML, (div) => {
            if (el.parentNode) {
                el.parentNode.insertBefore(div, el.nextSibling);
            }
        });
    });
};
exports.init = init;

},{"./components/enumerate.js":1,"./components/list.js":2,"./components/macros":3,"./components/math.js":4,"./components/nicebox.js":5,"./components/pspicture.js":6,"./components/verbatim.js":7,"latex2js":10,"mathjaxjs":19}],9:[function(require,module,exports){
// @generated by Peggy 5.1.0.
//
// https://peggyjs.org/

"use strict";

class peg$SyntaxError extends SyntaxError {
  constructor(message, expected, found, location) {
    super(message);
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
  }

  format(sources) {
    let str = "Error: " + this.message;
    if (this.location) {
      let src = null;
      const st = sources.find(s => s.source === this.location.source);
      if (st) {
        src = st.text.split(/\r\n|\n|\r/g);
      }
      const s = this.location.start;
      const offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
        ? this.location.source.offset(s)
        : s;
      const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
      if (src) {
        const e = this.location.end;
        const filler = "".padEnd(offset_s.line.toString().length, " ");
        const line = src[s.line - 1];
        const last = s.line === e.line ? e.column : line.length + 1;
        const hatLen = (last - s.column) || 1;
        str += "\n --> " + loc + "\n"
            + filler + " |\n"
            + offset_s.line + " | " + line + "\n"
            + filler + " | " + "".padEnd(s.column - 1, " ")
            + "".padEnd(hatLen, "^");
      } else {
        str += "\n at " + loc;
      }
    }
    return str;
  }

  static buildMessage(expected, found) {
    function hex(ch) {
      return ch.codePointAt(0).toString(16).toUpperCase();
    }

    const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode")
      ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu")
      : null;
    function unicodeEscape(s) {
      if (nonPrintable) {
        return s.replace(nonPrintable,  ch => "\\u{" + hex(ch) + "}");
      }
      return s;
    }

    function literalEscape(s) {
      return unicodeEscape(s
        .replace(/\\/g, "\\\\")
        .replace(/"/g,  "\\\"")
        .replace(/\0/g, "\\0")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/[\x00-\x0F]/g,          ch => "\\x0" + hex(ch))
        .replace(/[\x10-\x1F\x7F-\x9F]/g, ch => "\\x"  + hex(ch)));
    }

    function classEscape(s) {
      return unicodeEscape(s
        .replace(/\\/g, "\\\\")
        .replace(/\]/g, "\\]")
        .replace(/\^/g, "\\^")
        .replace(/-/g,  "\\-")
        .replace(/\0/g, "\\0")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/[\x00-\x0F]/g,          ch => "\\x0" + hex(ch))
        .replace(/[\x10-\x1F\x7F-\x9F]/g, ch => "\\x"  + hex(ch)));
    }

    const DESCRIBE_EXPECTATION_FNS = {
      literal(expectation) {
        return "\"" + literalEscape(expectation.text) + "\"";
      },

      class(expectation) {
        const escapedParts = expectation.parts.map(
          part => (Array.isArray(part)
            ? classEscape(part[0]) + "-" + classEscape(part[1])
            : classEscape(part))
        );

        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
      },

      any() {
        return "any character";
      },

      end() {
        return "end of input";
      },

      other(expectation) {
        return expectation.description;
      },
    };

    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }

    function describeExpected(expected) {
      const descriptions = expected.map(describeExpectation);
      descriptions.sort();

      if (descriptions.length > 0) {
        let j = 1;
        for (let i = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }

      switch (descriptions.length) {
        case 1:
          return descriptions[0];

        case 2:
          return descriptions[0] + " or " + descriptions[1];

        default:
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }

    function describeFound(found) {
      return found ? "\"" + literalEscape(found) + "\"" : "end of input";
    }

    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  }
}

function peg$parse(input, options) {
  options = options !== undefined ? options : {};

  const peg$FAILED = {};
  const peg$source = options.grammarSource;

  const peg$startRuleFunctions = {
    Document: peg$parseDocument,
  };
  let peg$startRuleFunction = peg$parseDocument;

  const peg$c0 = "\\begin{";
  const peg$c1 = "verbatim";
  const peg$c2 = "print";
  const peg$c3 = "}";
  const peg$c4 = "\\end{";
  const peg$c5 = "\\";
  const peg$c6 = "begin{";
  const peg$c7 = "end{";
  const peg$c8 = "%";
  const peg$c9 = "\r\n";

  const peg$r0 = /^[a-zA-Z*]/;
  const peg$r1 = /^[a-zA-Z@]/;
  const peg$r2 = /^[([{]/;
  const peg$r3 = /^[)\]}]/;
  const peg$r4 = /^[\n\r]/;
  const peg$r5 = /^[ \t]/;

  const peg$e0 = peg$anyExpectation();
  const peg$e1 = peg$literalExpectation("\\begin{", false);
  const peg$e2 = peg$literalExpectation("verbatim", false);
  const peg$e3 = peg$literalExpectation("print", false);
  const peg$e4 = peg$literalExpectation("}", false);
  const peg$e5 = peg$literalExpectation("\\end{", false);
  const peg$e6 = peg$classExpectation([["a", "z"], ["A", "Z"], "*"], false, false, false);
  const peg$e7 = peg$literalExpectation("\\", false);
  const peg$e8 = peg$literalExpectation("begin{", false);
  const peg$e9 = peg$literalExpectation("end{", false);
  const peg$e10 = peg$classExpectation([["a", "z"], ["A", "Z"], "@"], false, false, false);
  const peg$e11 = peg$literalExpectation("%", false);
  const peg$e12 = peg$classExpectation(["(", "[", "{"], false, false, false);
  const peg$e13 = peg$classExpectation([")", "]", "}"], false, false, false);
  const peg$e14 = peg$literalExpectation("\r\n", false);
  const peg$e15 = peg$classExpectation(["\n", "\r"], false, false, false);
  const peg$e16 = peg$classExpectation([" ", "\t"], false, false, false);

  function peg$f0(segs) {    return segs;  }
  function peg$f1(e) {    return { kind: 'strayEnd', name: e.name, raw: e.raw, loc: loc() };  }
  function peg$f2(start, content, end) {
    return {
      kind: 'env',
      name: start.name,
      verbatim: true,
      begin: start,
      end: { name: start.name, raw: '\\end{' + end + '}', loc: loc() },
      content: [{
        kind: 'verbatim',
        text: content.map((pair) => pair[1]).join('').replace(/\n$/, '')
      }],
      loc: loc()
    };
  }
  function peg$f3(n) {    return { name: n, raw: '\\begin{' + n + '}', loc: loc() };  }
  function peg$f4(n) {    return n;  }
  function peg$f5(b, content, e) {
    return { kind: 'env', name: b.name, verbatim: false, begin: b, end: e || null, content: content, loc: loc() };
  }
  function peg$f6(name, tail) {
    return { name: name, raw: '\\begin{' + name + '}' + tail, loc: loc() };
  }
  function peg$f7(name) {
    return { name: name, raw: '\\end{' + name + '}', loc: loc() };
  }
  function peg$f8(chars) {    return chars.join('');  }
  function peg$f9(start, tail) {
    depth = 0;
    return { kind: 'command', name: start.name, raw: start.raw + tail, loc: loc() };
  }
  function peg$f10(chars) {
    return { name: chars.join(''), raw: '\\' + chars.join('') };
  }
  function peg$f11(parts) {    return parts.join('');  }
  function peg$f12() {    depth++; return text();  }
  function peg$f13() {    depth = Math.max(0, depth - 1); return text();  }
  function peg$f14() {    return depth === 0;  }
  function peg$f15(c) {    return c;  }
  function peg$f16() {    return depth > 0;  }
  function peg$f17(c) {    return c;  }
  function peg$f18() {    return '';  }
  function peg$f19(parts, eol) {    return { kind: 'line', parts: parts, hasEol: !!eol, loc: loc() };  }
  function peg$f20(eol) {    return { kind: 'line', parts: [], hasEol: true, loc: loc() };  }
  function peg$f21(c) {    return { kind: 'char', c: c, loc: loc() };  }
  let peg$currPos = options.peg$currPos | 0;
  let peg$savedPos = peg$currPos;
  const peg$posDetailsCache = [{ line: 1, column: 1 }];
  let peg$maxFailPos = peg$currPos;
  let peg$maxFailExpected = options.peg$maxFailExpected || [];
  let peg$silentFails = options.peg$silentFails | 0;

  let peg$result;

  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function offset() {
    return peg$savedPos;
  }

  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos,
    };
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location);
  }

  function peg$getUnicode(pos = peg$currPos) {
    const cp = input.codePointAt(pos);
    if (cp === undefined) {
      return "";
    }
    return String.fromCodePoint(cp);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text, ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
    return { type: "class", parts, inverted, ignoreCase, unicode };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description };
  }

  function peg$computePosDetails(pos) {
    let details = peg$posDetailsCache[pos];
    let p;

    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {}
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column,
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos, endPos, offset) {
    const startPosDetails = peg$computePosDetails(startPos);
    const endPosDetails = peg$computePosDetails(endPos);

    const res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column,
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column,
      },
    };
    if (offset && peg$source && (typeof peg$source.offset === "function")) {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseDocument() {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseSegment();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseSegment();
    }
    peg$savedPos = s0;
    s1 = peg$f0(s1);
    s0 = s1;

    return s0;
  }

  function peg$parseSegment() {
    let s0;

    s0 = peg$parseEnv();
    if (s0 === peg$FAILED) {
      s0 = peg$parseStrayEnd();
      if (s0 === peg$FAILED) {
        s0 = peg$parseLine();
      }
    }

    return s0;
  }

  function peg$parseStrayEnd() {
    let s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseEndTag();
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f1(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseEnv() {
    let s0;

    s0 = peg$parseVerbatimEnv();
    if (s0 === peg$FAILED) {
      s0 = peg$parseRegularEnv();
    }

    return s0;
  }

  function peg$parseVerbatimEnv() {
    let s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseBeginVerb();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseEndVerb();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = undefined;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e0); }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseEndVerb();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = undefined;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e0); }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      s3 = peg$parseEndVerb();
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f2(s1, s2, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseBeginVerb() {
    let s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c0) {
      s1 = peg$c0;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e1); }
    }
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 8) === peg$c1) {
        s2 = peg$c1;
        peg$currPos += 8;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e2); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c2) {
          s2 = peg$c2;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e3); }
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c3;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f3(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEndVerb() {
    let s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c4) {
      s1 = peg$c4;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e5); }
    }
    if (s1 !== peg$FAILED) {
      if (input.substr(peg$currPos, 8) === peg$c1) {
        s2 = peg$c1;
        peg$currPos += 8;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e2); }
      }
      if (s2 === peg$FAILED) {
        if (input.substr(peg$currPos, 5) === peg$c2) {
          s2 = peg$c2;
          peg$currPos += 5;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e3); }
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c3;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f4(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseRegularEnv() {
    let s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseBeginTag();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      s3 = [];
      s4 = peg$parseEnvContent();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parseEnvContent();
      }
      s4 = peg$parse_();
      s5 = peg$parseEndTag();
      if (s5 === peg$FAILED) {
        s5 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f5(s1, s3, s5);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseBeginTag() {
    let s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c0) {
      s1 = peg$c0;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e1); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseEnvName();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c3;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseTail();
          peg$savedPos = s0;
          s0 = peg$f6(s2, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEndTag() {
    let s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c4) {
      s1 = peg$c4;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e5); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseEnvName();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c3;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f7(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEnvName() {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r0.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e6); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r0.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e6); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f8(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseEnvContent() {
    let s0;

    s0 = peg$parseEnv();
    if (s0 === peg$FAILED) {
      s0 = peg$parseCommand();
      if (s0 === peg$FAILED) {
        s0 = peg$parseLine();
      }
    }

    return s0;
  }

  function peg$parseCommand() {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseCommandStart();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseTail();
      peg$savedPos = s0;
      s0 = peg$f9(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCommandStart() {
    let s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 92) {
      s1 = peg$c5;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e7); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 6) === peg$c6) {
        s3 = peg$c6;
        peg$currPos += 6;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e8); }
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = undefined;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 4) === peg$c7) {
          s4 = peg$c7;
          peg$currPos += 4;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e9); }
        }
        peg$silentFails--;
        if (s4 === peg$FAILED) {
          s3 = undefined;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = input.charAt(peg$currPos);
          if (peg$r1.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e10); }
          }
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = input.charAt(peg$currPos);
              if (peg$r1.test(s5)) {
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e10); }
              }
            }
          } else {
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f10(s4);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTail() {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseTailPart();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseTailPart();
    }
    peg$savedPos = s0;
    s1 = peg$f11(s1);
    s0 = s1;

    return s0;
  }

  function peg$parseTailPart() {
    let s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$parseComment();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseOpen();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f12();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseClose();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f13();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          peg$savedPos = peg$currPos;
          s1 = peg$f14();
          if (s1) {
            s1 = undefined;
          } else {
            s1 = peg$FAILED;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseEOL();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
              s2 = undefined;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              peg$silentFails++;
              s4 = peg$parseCommandStart();
              peg$silentFails--;
              if (s4 === peg$FAILED) {
                s3 = undefined;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$currPos;
                peg$silentFails++;
                s5 = peg$parseBeginStart();
                peg$silentFails--;
                if (s5 === peg$FAILED) {
                  s4 = undefined;
                } else {
                  peg$currPos = s4;
                  s4 = peg$FAILED;
                }
                if (s4 !== peg$FAILED) {
                  s5 = peg$currPos;
                  peg$silentFails++;
                  s6 = peg$parseEndStart();
                  peg$silentFails--;
                  if (s6 === peg$FAILED) {
                    s5 = undefined;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$FAILED;
                  }
                  if (s5 !== peg$FAILED) {
                    if (input.length > peg$currPos) {
                      s6 = input.charAt(peg$currPos);
                      peg$currPos++;
                    } else {
                      s6 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e0); }
                    }
                    if (s6 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f15(s6);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            peg$savedPos = peg$currPos;
            s1 = peg$f16();
            if (s1) {
              s1 = undefined;
            } else {
              s1 = peg$FAILED;
            }
            if (s1 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e0); }
              }
              if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f17(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseComment() {
    let s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 37) {
      s1 = peg$c8;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e11); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseEOL();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = undefined;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e0); }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseEOL();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = undefined;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e0); }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$savedPos = s0;
      s0 = peg$f18();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseOpen() {
    let s0;

    s0 = input.charAt(peg$currPos);
    if (peg$r2.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e12); }
    }

    return s0;
  }

  function peg$parseClose() {
    let s0;

    s0 = input.charAt(peg$currPos);
    if (peg$r3.test(s0)) {
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e13); }
    }

    return s0;
  }

  function peg$parseBeginStart() {
    let s0;

    if (input.substr(peg$currPos, 7) === peg$c0) {
      s0 = peg$c0;
      peg$currPos += 7;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e1); }
    }

    return s0;
  }

  function peg$parseEndStart() {
    let s0;

    if (input.substr(peg$currPos, 5) === peg$c4) {
      s0 = peg$c4;
      peg$currPos += 5;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e5); }
    }

    return s0;
  }

  function peg$parseLine() {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseLinePart();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseLinePart();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseEOL();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f19(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseEOL();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f20(s1);
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseLinePart() {
    let s0, s1, s2, s3, s4;

    s0 = peg$parseComment();
    if (s0 === peg$FAILED) {
      s0 = peg$parseCommand();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;
        s2 = peg$parseBeginStart();
        peg$silentFails--;
        if (s2 === peg$FAILED) {
          s1 = undefined;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          peg$silentFails++;
          s3 = peg$parseEndStart();
          peg$silentFails--;
          if (s3 === peg$FAILED) {
            s2 = undefined;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;
            s4 = peg$parseEOL();
            peg$silentFails--;
            if (s4 === peg$FAILED) {
              s3 = undefined;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            if (s3 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s4 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e0); }
              }
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f21(s4);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parseEOL() {
    let s0;

    if (input.substr(peg$currPos, 2) === peg$c9) {
      s0 = peg$c9;
      peg$currPos += 2;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e14); }
    }
    if (s0 === peg$FAILED) {
      s0 = input.charAt(peg$currPos);
      if (peg$r4.test(s0)) {
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e15); }
      }
    }

    return s0;
  }

  function peg$parse_() {
    let s0, s1;

    s0 = [];
    s1 = input.charAt(peg$currPos);
    if (peg$r5.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e16); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = input.charAt(peg$currPos);
      if (peg$r5.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e16); }
      }
    }

    return s0;
  }


  let depth = 0;

  function loc() {
    const l = location();
    return { line: l.start.line, column: l.start.column };
  }

  peg$result = peg$startRuleFunction();

  const peg$success = (peg$result !== peg$FAILED && peg$currPos === input.length);
  function peg$throw() {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
  if (options.peg$library) {
    return /** @type {any} */ ({
      peg$result,
      peg$currPos,
      peg$FAILED,
      peg$maxFailExpected,
      peg$maxFailPos,
      peg$success,
      peg$throw: peg$success ? undefined : peg$throw,
    });
  }
  if (peg$success) {
    return peg$result;
  } else {
    peg$throw();
  }
}

module.exports = {
  StartRules: ["Document"],
  SyntaxError: peg$SyntaxError,
  parse: peg$parse,
};

},{}],10:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = __importDefault(require("./lib/text"));
const headers_1 = __importDefault(require("./lib/headers"));
const pstricks_1 = require("@latex2js/pstricks");
const environments_1 = __importDefault(require("./lib/environments"));
const ignore_1 = __importDefault(require("./lib/ignore"));
const parser_1 = __importDefault(require("./lib/parser"));
class LaTeX2HTML5 {
    constructor(Text = text_1.default, Headers = headers_1.default, Environments = environments_1.default, Ignore = ignore_1.default, PSTricks = pstricks_1.pstricks, Views = {}) {
        this.lastDiagnostics = [];
        /**
         * Which language documents are read as, when they do not declare one.
         *
         * An application that only ever renders LaTeX2JS content sets this once
         * rather than editing every document; a document's own
         * `\psset{dialect=...}` still overrides it. Defaults to `pstricks`, so an
         * undeclared extension is reported rather than passing unnoticed.
         */
        this.dialect = 'pstricks';
        this.Text = Text;
        this.Headers = Headers;
        this.Environments = Environments;
        this.Ignore = Ignore;
        this.PSTricks = PSTricks;
        this.Views = Views;
        this.Delimiters = {};
        Environments.forEach((name) => {
            this.addEnvironment(name);
        });
    }
    addEnvironment(name) {
        var delim = {
            begin: new RegExp('\\\\begin\\{' + name + '\\}'),
            end: new RegExp('\\\\end\\{' + name + '\\}')
        };
        this.Delimiters[name] = delim;
    }
    addView(name, _options) {
        this.addEnvironment(name);
        // var view = {};
        // this.Views[name] = this.BaseEnvView.extend(options);
    }
    addText(name, exp, func) {
        this.Text.Expressions[name] = exp;
        this.Text.Functions[name] = func;
    }
    addHeaders(name, begin, end) {
        var exp = {};
        var beginHash = name + 'begin';
        var endHash = name + 'end';
        exp[beginHash] = new RegExp('\\\\begin\\{' + name + '\\}');
        exp[endHash] = new RegExp('\\\\end\\{' + name + '\\}');
        Object.assign(this.Headers.Expressions, exp);
        var fns = {};
        fns[beginHash] = function () {
            return begin || '';
        };
        fns[endHash] = function () {
            return end || '';
        };
        Object.assign(this.Headers.Functions, fns);
    }
    getParser() {
        return new parser_1.default(this);
    }
    parse(text) {
        const parser = new parser_1.default(this);
        const parsed = parser.parse(text);
        this.lastDiagnostics = parser.diagnostics;
        parsed.forEach((element) => {
            if (!element.hasOwnProperty('type')) {
                throw new Error('no type!');
            }
            // TODO implement rendering
        });
        return parsed;
    }
}
exports.default = LaTeX2HTML5;

},{"./lib/environments":13,"./lib/headers":14,"./lib/ignore":15,"./lib/parser":16,"./lib/text":17,"@latex2js/pstricks":20}],11:[function(require,module,exports){
"use strict";
/**
 * Document counters for sectioning and theorem-like environments.
 *
 * Numbering is what makes a document cross-referenceable — "see Theorem 3" only
 * works if theorems are numbered — and LaTeX2JS emitted none, so a rendered
 * document could not be cited from or navigated the way its printed form can.
 *
 * Equations are deliberately absent: those stay with MathJax, which already
 * numbers AMS environments and resolves `\label`/`\ref` against them. Splitting
 * that between two systems would give a document two disagreeing sets of
 * numbers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUMBERED_ENVIRONMENTS = exports.Counters = exports.SECTION_LEVELS = void 0;
/** The sectioning levels, outermost first. */
exports.SECTION_LEVELS = ['section', 'subsection', 'subsubsection'];
/**
 * Counters for one document.
 *
 * A parser instance is reused across documents, so these are reset at the start
 * of every parse; otherwise a second document would continue the first one's
 * numbering.
 */
class Counters {
    constructor() {
        this.sections = exports.SECTION_LEVELS.map(() => 0);
        this.environments = {};
    }
    /** Starts a fresh document. */
    reset() {
        this.sections = exports.SECTION_LEVELS.map(() => 0);
        this.environments = {};
    }
    /**
     * Advances a sectioning level and returns its number.
     *
     * Deeper levels reset, so a new section restarts subsection numbering. A
     * subsection appearing before any section reports `0.1`, which is what LaTeX
     * does rather than an error — the document is odd, not broken.
     *
     * @param level - which sectioning level is starting
     * @returns the dotted number, such as `2.3`
     */
    section(level) {
        const depth = exports.SECTION_LEVELS.indexOf(level);
        this.sections[depth] += 1;
        for (let i = depth + 1; i < this.sections.length; i++)
            this.sections[i] = 0;
        return this.sections.slice(0, depth + 1).join('.');
    }
    /**
     * Advances the counter for a theorem-like environment and returns its number.
     *
     * Each kind counts independently — Theorem 1 and Lemma 1 can both exist —
     * which is what a plain `\newtheorem{name}{Name}` declaration gives.
     *
     * @param name - the environment name, such as `theorem`
     * @returns the next number for that kind
     */
    environment(name) {
        this.environments[name] = (this.environments[name] ?? 0) + 1;
        return this.environments[name];
    }
}
exports.Counters = Counters;
/** Environments that carry a number. `proof` and quotations deliberately do not. */
exports.NUMBERED_ENVIRONMENTS = [
    'theorem',
    'lemma',
    'corollary',
    'proposition',
    'definition',
    'axiom',
    'claim',
    'example',
    'remark',
    'note',
    'exercise',
    'question',
    'problem',
    'solution',
];

},{}],12:[function(require,module,exports){
"use strict";
/**
 * Which constructs belong to the LaTeX2JS dialect rather than to PSTricks.
 *
 * LaTeX2JS accepts a superset of PSTricks: some of it is the deliberate reason
 * this project exists (the interactive macros), some of it is convenience
 * (infix plot bodies, CSS colour names), and some is a genuine semantic fork
 * (`log` is natural log here, base 10 there). Until a document could declare
 * which language it was written in, none of that was distinguishable from a
 * defect — by a reader, a test, or the author.
 *
 * A document declares `\psset{dialect=latex2js}`, or the embedding application
 * sets it once. Anything left undeclared is read as PSTricks and reported.
 *
 * Reporting is all this does. The dialect changes a small number of documented
 * semantics (see `Dialect` in @latex2js/settings); it does not switch the
 * renderer, and nothing here refuses to draw.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialectUses = dialectUses;
/** Colour names the browser knows and xcolor does not. */
const CSS_ONLY_COLORS = ['lightblue', 'lightgray', 'lightgrey', 'lightgreen', 'darkblue', 'darkgreen', 'pink', 'gold', 'silver', 'navy', 'teal', 'lime', 'aqua', 'fuchsia'];
/** Commands with no PSTricks counterpart at all. */
const LATEX2JS_ONLY_COMMANDS = {
    userline: 'draws a line the reader can drag; PSTricks has no interactive graphics',
    uservariable: 'binds a value to the pointer position; PSTricks has no such binding',
    slider: 'renders a control the reader can move; PSTricks has no such control',
};
/**
 * Reports the dialect constructs one parsed command uses.
 *
 * @param name - the command name, without its backslash
 * @param raw - the command's source text
 * @param options - its parsed options, or null when it has none
 * @returns every construct the command relies on, empty when it is plain PSTricks
 */
function dialectUses(name, raw, options) {
    const uses = [];
    const only = LATEX2JS_ONLY_COMMANDS[name];
    if (only)
        uses.push({ construct: `\\${name}`, detail: only });
    // A bare key is a syntax error to PSTricks, which expects `key=value`.
    const bare = /\[([^\]]*)\]/.exec(raw);
    if (bare) {
        for (const part of bare[1].split(',')) {
            const token = part.trim();
            if (token && !token.includes('=')) {
                uses.push({
                    construct: 'bare option flag',
                    detail: `\`${token}\` has no value; PSTricks requires \`${token}=true\``,
                });
            }
        }
    }
    if (options) {
        for (const key of ['linecolor', 'fillcolor', 'hatchcolor', 'gridcolor']) {
            const value = String(options[key] ?? '').trim().toLowerCase();
            if (CSS_ONLY_COLORS.indexOf(value) !== -1) {
                uses.push({
                    construct: 'CSS colour name',
                    detail: `\`${value}\` is a browser colour; xcolor does not define it`,
                });
            }
        }
        if (options.plotpoints !== undefined && Number(options.plotpoints) === 1) {
            uses.push({
                construct: 'plotpoints=1',
                detail: 'PSTricks requires at least 2 samples',
            });
        }
    }
    if (name === 'psplot')
        uses.push(...plotBodyUses(raw, options));
    return uses;
}
/**
 * Reports what a `\psplot` body relies on.
 *
 * The dialects have opposite defaults here: LaTeX2JS always reads the body as
 * an infix expression, while PSTricks reads RPN PostScript unless told
 * `algebraic=true`. A body is therefore worth reporting whenever the document
 * has not asked for algebraic mode, whatever it contains.
 */
function plotBodyUses(raw, options) {
    const uses = [];
    const groups = raw.match(/\{([^{}]*)\}/g) || [];
    const bodies = groups.map((g) => g.slice(1, -1));
    const declaredAlgebraic = String(options?.algebraic ?? '').toLowerCase() === 'true';
    if (!declaredAlgebraic) {
        uses.push({
            construct: 'infix plot body',
            detail: 'read as an infix expression; PSTricks reads RPN PostScript unless algebraic=true',
        });
    }
    const body = bodies[bodies.length - 1] ?? '';
    if (/\bpow\s*\(/.test(body)) {
        uses.push({ construct: 'pow()', detail: 'PSTricks has no pow function, only the ^ operator' });
    }
    if (/\blog\s*\(/.test(body)) {
        uses.push({ construct: 'log()', detail: 'natural log here, base 10 in PSTricks' });
    }
    // The two bounds precede the body; a non-numeric one is an expression over
    // variables, which PSTricks cannot evaluate.
    for (const bound of bodies.slice(0, -1)) {
        if (bound.trim() && !/^-?[\d.]+$/.test(bound.trim())) {
            uses.push({
                construct: 'variable plot bound',
                detail: `\`${bound.trim()}\` is an expression; PSTricks needs a literal number`,
            });
        }
    }
    return uses;
}

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environments = ['pspicture', 'verbatim', 'enumerate', 'print', 'nicebox', 'itemize', 'description'];
exports.default = environments;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
exports.Expressions = {
    bq: /\\begin\{quotation\}/,
    claim: /\\begin\{claim\*?\}/,
    corollary: /\\begin\{corollary\*?\}/,
    definition: /\\begin\{definition\*?\}/,
    lemma: /\\begin\{lemma\*?\}/,
    proposition: /\\begin\{proposition\*?\}/,
    axiom: /\\begin\{axiom\*?\}/,
    remark: /\\begin\{remark\*?\}/,
    note: /\\begin\{note\*?\}/,
    exercise: /\\begin\{exercise\*?\}/,
    question: /\\begin\{question\*?\}/,
    endclaim: /\\end\{claim\*?\}/,
    endcorollary: /\\end\{corollary\*?\}/,
    enddefinition: /\\end\{definition\*?\}/,
    endexample: /\\end\{example\*?\}/,
    endlemma: /\\end\{lemma\*?\}/,
    endproposition: /\\end\{proposition\*?\}/,
    endaxiom: /\\end\{axiom\*?\}/,
    endremark: /\\end\{remark\*?\}/,
    endnote: /\\end\{note\*?\}/,
    endexercise: /\\end\{exercise\*?\}/,
    endquestion: /\\end\{question\*?\}/,
    endproblem: /\\end\{problem\*?\}/,
    endsolution: /\\end\{solution\*?\}/,
    endtheorem: /\\end\{theorem\*?\}/,
    eq: /\\end\{quotation\}/,
    example: /\\begin\{example\*?\}/,
    problem: /\\begin\{problem\*?\}/,
    proof: /\\begin\{proof\}/,
    qed: /\\end\{proof\}/,
    solution: /\\begin\{solution\*?\}/,
    theorem: /\\begin\{theorem\*?\}/
};
/**
 * Opens a theorem-like environment with a run-in heading.
 *
 * LaTeX sets these as `**Theorem 1.** statement` on one line, not as a heading
 * with the statement beneath it — the label is part of the sentence. The
 * wrapper lets CSS carry that, and lets the body take the italic that amsthm
 * gives a theorem and withholds from a remark.
 *
 * The number comes from the parser through the receiver, so this registry
 * carries no parser internals; a host that supplies none still renders the
 * heading, just unnumbered. Each kind counts independently — Theorem 1 and
 * Lemma 1 can both exist — which is what a plain \newtheorem gives.
 *
 * @param title - the label a reader sees, such as `Theorem`
 * @param name - the environment name, for the counter and the body style
 * @param parser - the receiver, when the caller supplied one
 * @param match - the matched \begin, so a starred form can opt out
 * @returns the opening markup, closed by the matching `end` entry
 */
function headed(title, name, parser, match) {
    const raw = Array.isArray(match) ? String(match[0] ?? '') : String(match ?? '');
    const number = parser && typeof parser.environmentNumber === 'function'
        ? parser.environmentNumber(name, raw)
        : null;
    const label = number === null || number === undefined ? '' : ' ' + number;
    return ('<div class="theorem-env theorem-env--' + name + '">' +
        '<h4 class="theorem-head">' + title + label + '</h4> ');
}
/** Closes an environment opened by {@link headed}. */
function closed() {
    return '</div>';
}
exports.Functions = {
    bq: () => '<p class="quotation">',
    claim(m) { return headed('Claim', 'claim', this, m); },
    corollary(m) { return headed('Corollary', 'corollary', this, m); },
    definition(m) { return headed('Definition', 'definition', this, m); },
    lemma(m) { return headed('Lemma', 'lemma', this, m); },
    proposition(m) { return headed('Proposition', 'proposition', this, m); },
    axiom(m) { return headed('Axiom', 'axiom', this, m); },
    remark(m) { return headed('Remark', 'remark', this, m); },
    note(m) { return headed('Note', 'note', this, m); },
    exercise(m) { return headed('Exercise', 'exercise', this, m); },
    question(m) { return headed('Question', 'question', this, m); },
    endclaim: () => closed(),
    endcorollary: () => closed(),
    enddefinition: () => closed(),
    endexample: () => closed(),
    endlemma: () => closed(),
    endproposition: () => closed(),
    endaxiom: () => closed(),
    endremark: () => closed(),
    endnote: () => closed(),
    endexercise: () => closed(),
    endquestion: () => closed(),
    endproblem: () => closed(),
    endsolution: () => closed(),
    endtheorem: () => closed(),
    eq: () => '</p>',
    example(m) { return headed('Example', 'example', this, m); },
    problem(m) { return headed('Problem', 'problem', this, m); },
    proof: () => '<div class="theorem-env theorem-env--proof"><h4 class="theorem-head">Proof</h4> ',
    // amsthm closes a proof with an open square. Emitted as a character rather
    // than as math: MathJax defines no \qed, so the previous `$\qed$` surfaced
    // an "Undefined control sequence" box at the end of every proof.
    qed: () => '<span class="qed">□</span></div>',
    solution(m) { return headed('Solution', 'solution', this, m); },
    theorem(m) { return headed('Theorem', 'theorem', this, m); }
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions
};

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignore = [
    /^\%/,
    /\\begin\{document\}/,
    /\\end\{document\}/,
    /\\begin\{interactive\}/,
    /\\end\{interactive\}/,
    /\\usepackage/,
    /\\documentclass/,
    /\\tableofcontents/,
    /\\author/,
    /\\date/,
    /\\maketitle/,
    /\\title/,
    /\\pagestyle/,
    /\\smallskip/,
    /\\medskip/,
    /\\bigskip/,
    /\\nobreak/,
    /\\begin\{center\}/,
    /\\end\{center\}/
];
exports.default = ignore;

},{}],16:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pegParser = __importStar(require("../grammar/parser.js"));
const dialect_1 = require("./dialect");
const settings_1 = require("@latex2js/settings");
const counters_1 = require("./counters");
/**
 * Names the numeric fields of a parsed command that came out non-finite.
 *
 * `X` and `Y` return NaN for a coordinate they cannot compute rather than
 * inventing one at the origin, so this is where that shows up: a command whose
 * geometry is unusable is reported against its own source location instead of
 * drawing a plausible shape in the wrong place.
 *
 * @param value - a parsed command's data
 * @returns the paths of the offending fields, empty when everything is usable
 */
function nonFiniteFields(value, path = '', depth = 0) {
    if (depth > 4 || value === null || value === undefined)
        return [];
    if (typeof value === 'number')
        return isFinite(value) ? [] : [path || 'value'];
    if (Array.isArray(value)) {
        return value.flatMap((v, i) => typeof v === 'number' && !isFinite(v) ? [`${path}[${i}]`] : nonFiniteFields(v, `${path}[${i}]`, depth + 1));
    }
    if (typeof value !== 'object')
        return [];
    // `global` is the shared environment, not this command's own geometry.
    return Object.entries(value)
        .filter(([k]) => k !== 'global' && k !== 'env')
        .flatMap(([k, v]) => nonFiniteFields(v, path ? `${path}.${k}` : k, depth + 1));
}
/**
 * Parser: turns a LaTeX-ish document into the flat environment objects the
 * components consume ({type, lines, env, plot}) — but driven by the Peggy
 * grammar in src/grammar instead of per-line regular expressions.
 *
 * The grammar tokenizes structure (balanced environments, commands with args,
 * comments, verbatim). This class interprets that tree using the registries
 * (Text / Headers / Ignore / PSTricks / Delimiters), so the runtime extension
 * API (addEnvironment / addText / addHeaders) keeps working. It also collects
 * diagnostics (unclosed environments, unknown commands, syntax errors) that
 * were previously silent.
 */
class Parser {
    constructor(LaTeX2JS) {
        this.Ignore = LaTeX2JS.Ignore;
        this.Delimiters = LaTeX2JS.Delimiters;
        this.Text = LaTeX2JS.Text;
        this.PSTricks = LaTeX2JS.PSTricks;
        this.Headers = LaTeX2JS.Headers;
        this.objects = [];
        this.environment = null;
        this.settings = this.PSTricks.Functions.psset.call(this, [
            '',
            'units=1cm,linecolor=black,linestyle=solid,fillstyle=none'
        ]);
        this.diagnostics = [];
        // The embedding application can declare the dialect once for every document
        // it renders; a document's own \psset overrides it.
        this.dialect = (0, settings_1.normalizeDialect)(LaTeX2JS.dialect) ?? 'pstricks';
        this.counters = new counters_1.Counters();
    }
    /**
     * The number a sectioning command should carry, or null when it is starred.
     *
     * Text transforms call this through their receiver, so the registry stays
     * free of parser internals and a third-party transform that does not care
     * about numbering keeps working.
     *
     * @param level - which sectioning level is starting
     * @param raw - the command's source, so a starred form can opt out
     * @returns the dotted number, or null for an unnumbered heading
     */
    sectionNumber(level, raw) {
        if (/\\[a-z]+\*/.test(raw))
            return null;
        return this.counters.section(level);
    }
    /**
     * The number a theorem-like environment should carry, or null when starred.
     *
     * @param name - the environment name, such as `theorem`
     * @param raw - the `\begin` source, so a starred form can opt out
     * @returns the next number for that kind, or null when unnumbered
     */
    environmentNumber(name, raw) {
        if (/\{[a-z]+\*\}/.test(raw))
            return null;
        return this.counters.environment(name);
    }
    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    parse(text) {
        this.diagnostics = [];
        // A parser instance is reused across documents; without this the second
        // would continue the first one's numbering.
        this.counters.reset();
        if (!text)
            return [];
        const tree = this.parseTree(text);
        this.walk(tree);
        this.objects.forEach((obj) => {
            if (obj.type.match(/pspicture/)) {
                obj.plot = this.parsePSTricks(obj.commands || [], obj.env);
                delete obj.commands;
            }
        });
        return this.objects;
    }
    // -------------------------------------------------------------------------
    // Grammar integration
    // -------------------------------------------------------------------------
    parseTree(text) {
        try {
            return pegParser.parse(text);
        }
        catch (err) {
            const loc = err.location || { start: { line: 1, column: 1 } };
            this.diagnostics.push({
                severity: 'error',
                message: `parse error: ${err.message || String(err)}`,
                line: loc.start.line,
                column: loc.start.column
            });
            // Degraded fallback: treat the whole input as a math text block.
            return [{ kind: 'raw', text: text }];
        }
    }
    // -------------------------------------------------------------------------
    // Tree walk
    // -------------------------------------------------------------------------
    walk(segments) {
        this.objects = [];
        this.environment = { type: 'math', lines: [] };
        segments.forEach((seg) => this.walkSegment(seg));
        this.newEnvironment('math');
    }
    walkSegment(seg) {
        if (seg.kind === 'raw') {
            seg.text.split('\n').forEach((line) => this.pushMathLine(line));
            return;
        }
        switch (seg.kind) {
            case 'line':
                this.walkContent(seg);
                break;
            case 'env':
                this.walkEnv(seg);
                break;
            case 'strayEnd':
                if (this.isIgnored(seg.raw))
                    return;
                this.diagnose('warning', `unexpected \\end{${seg.name}}`, seg.loc);
                break;
        }
    }
    walkEnv(env) {
        const name = env.name;
        // Ignored wrapper environments (center, document, interactive…) are
        // dropped, but their content is still walked in the current context.
        if (this.isIgnoredEnv(name)) {
            env.content.forEach((c) => this.walkContent(c));
            return;
        }
        const structural = env.verbatim || !!this.Delimiters[name];
        if (!structural) {
            // Non-structural environments (theorem, proof, quotation…) flatten into
            // the current environment as header text (handled by the Headers pass).
            const inPspicture = this.inPspicture();
            if (inPspicture)
                this.pushLine(env.begin.raw);
            else
                this.pushMathLine(env.begin.raw);
            env.content.forEach((c) => this.walkContent(c));
            if (env.end) {
                if (inPspicture)
                    this.pushLine(env.end.raw);
                else
                    this.pushMathLine(env.end.raw);
            }
            else {
                this.diagnose('warning', `unclosed \\begin{${name}}`, env.begin.loc);
            }
            return;
        }
        // Structural environment: close the current one and open a new one.
        this.newEnvironment(name);
        if (!env.verbatim)
            this.metaData(name, env);
        if (env.verbatim) {
            const v = env.content[0];
            this.environment.lines = v && v.kind === 'verbatim' ? v.text.split('\n') : [];
        }
        else if (name.match(/pspicture/)) {
            this.environment.commands = [];
            env.content.forEach((c) => this.walkContent(c));
        }
        else {
            // enumerate / itemize / nicebox: content is text lines (with transforms).
            this.walkTextContent(env.content);
        }
        if (env.end && env.end.name !== name) {
            this.diagnose('warning', `\\end{${env.end.name}} does not match \\begin{${name}}`, env.end.loc);
        }
        else if (!env.end) {
            this.diagnose('warning', `unclosed environment '${name}'`, env.begin.loc);
        }
        this.newEnvironment('math');
    }
    /**
     * Walk a text environment's content, rejoining the nodes that came from one
     * source line.
     *
     * `EnvContent` matches `Command` before `Line`, and a command's tail stops at
     * the next command, so `\item First with \textbf{bold} text` arrives as two
     * command nodes. Walking them individually renders each as its own line,
     * which broke every list item at its first macro. pspicture keeps the
     * per-node walk, because it depends on receiving commands separately.
     */
    walkTextContent(content) {
        let pending = [];
        const flush = () => {
            if (!pending.length)
                return;
            const text = pending
                .map((n) => (n.kind === 'line' ? this.lineToString(n) : n.raw))
                .join('');
            pending = [];
            this.pushMathLine(text);
        };
        content.forEach((node) => {
            if (node.kind === 'env') {
                flush();
                this.walkEnv(node);
                return;
            }
            // An empty Line is the newline itself: it closes the line being built,
            // or is a genuine paragraph break when there is nothing to close.
            if (node.kind === 'line' && node.parts.length === 0) {
                if (pending.length)
                    flush();
                else
                    this.pushBlankLine(false);
                return;
            }
            const at = node.loc && node.loc.line;
            const open = pending.length ? pending[0].loc && pending[0].loc.line : at;
            if (pending.length && at !== open)
                flush();
            pending.push(node);
            // A Line node consumed its own EOL, so nothing more belongs to it.
            if (node.kind === 'line')
                flush();
        });
        flush();
    }
    /**
     * Walk one node of environment content. Behavior depends on the current
     * environment: inside pspicture we collect commands (and raw lines) for plot
     * extraction; elsewhere lines go through the text/header passes.
     */
    walkContent(node) {
        const inPspicture = this.inPspicture();
        switch (node.kind) {
            case 'line': {
                // Comment-only lines are dropped (mirrors the old /^%/ ignore rule).
                const allComments = node.parts.length > 0 && node.parts.every((p) => p.kind === 'comment');
                if (allComments)
                    return;
                if (node.parts.length === 0) {
                    this.pushBlankLine(inPspicture);
                    return;
                }
                const text = this.lineToString(node);
                if (inPspicture)
                    this.pushLine(text);
                else
                    this.pushMathLine(text);
                break;
            }
            case 'command': {
                if (node.name === 'psset') {
                    this.parseUnits(node.raw);
                    return;
                }
                if (inPspicture)
                    this.environment.commands.push(node);
                else
                    this.pushMathLine(node.raw);
                break;
            }
            case 'env':
                this.walkEnv(node);
                break;
            default:
                break;
        }
    }
    /**
     * Convert a Line node's parts back to a string, dropping comment fragments.
     */
    lineToString(line) {
        return line.parts
            .filter((p) => p.kind !== 'comment')
            .map((p) => (p.kind === 'char' ? p.c : p.raw))
            .join('');
    }
    // -------------------------------------------------------------------------
    // Line handling
    // -------------------------------------------------------------------------
    inPspicture() {
        return !!(this.environment && this.environment.type.match(/pspicture/));
    }
    pushBlankLine(inPspicture) {
        if (inPspicture)
            return;
        if (this.inPspicture())
            return;
        this.environment.lines.push('<br>');
    }
    pushMathLine(text) {
        if (this.isIgnored(text))
            return;
        if (!text.trim().length) {
            this.environment.lines.push('<br>');
            return;
        }
        if (this.PSTricks.Expressions.psset.test(text)) {
            this.parseUnits(text);
            return;
        }
        const processed = this.parseText(text);
        if (processed.trim().length)
            this.environment.lines.push(processed);
    }
    /** Raw line inside a pspicture: no text/header transforms (they corrupt
     *  PSTricks content). */
    pushLine(line) {
        var add = true;
        this.Ignore.forEach((exp) => {
            if (exp.test(line)) {
                add = false;
            }
        });
        if (add && typeof line === 'string' && line.trim().length) {
            if (this.PSTricks.Expressions.psset.test(line)) {
                this.parseUnits(line);
            }
            else {
                this.environment.lines.push(line);
            }
        }
    }
    isIgnored(line) {
        return this.Ignore.some((exp) => exp.test(line));
    }
    isIgnoredEnv(name) {
        return this.isIgnored('\\begin{' + name + '}');
    }
    /**
     * A blank source line becomes a `<br>`, but a heading already carries its own
     * margins, so a `<br>` next to one stacks two gaps where the author asked for
     * one. Dropping the adjacent break leaves the heading's own spacing to do the
     * work — and a run of breaks collapses to a single paragraph gap.
     */
    collapseBreaks(lines) {
        const isBlock = (l) => /^\s*<(h[1-6]|ul|ol|li|p|div|table|blockquote)\b/i.test(l);
        const out = [];
        for (const line of lines) {
            if (line !== '<br>') {
                while (isBlock(line) && out[out.length - 1] === '<br>')
                    out.pop();
                out.push(line);
                continue;
            }
            if (!out.length)
                continue;
            if (isBlock(out[out.length - 1]))
                continue;
            if (out[out.length - 1] === '<br>')
                continue;
            out.push(line);
        }
        while (out[out.length - 1] === '<br>')
            out.pop();
        return out;
    }
    newEnvironment(type) {
        if (this.environment &&
            (this.environment.lines.length || this.environment.type !== 'math')) {
            this.environment.settings = { ...this.settings };
            if (!this.environment.type.match(/pspicture|verbatim/)) {
                this.environment.lines = this.collapseBreaks(this.environment.lines);
            }
            this.objects.push(this.environment);
        }
        this.environment = {
            type: type,
            lines: []
        };
    }
    parseUnits(line) {
        var m = line.replace(/\n/g, ' ').match(this.PSTricks.Expressions.psset);
        const declared = this.PSTricks.Functions.psset.call(this, m);
        if (declared.dialect)
            this.dialect = declared.dialect;
        Object.assign(this.settings, declared);
    }
    metaData(environment, envNode) {
        if (this.PSTricks.Expressions.hasOwnProperty(environment)) {
            this.environment.match = envNode.begin.raw
                .replace(/\n/g, ' ')
                .match(this.PSTricks.Expressions[environment]);
            if (!this.environment.match) {
                this.diagnose('error', `could not parse \\begin{${environment}} arguments`, envNode.begin.loc);
                this.environment.env = {};
                this.environment.env.xunit = this.settings.xunit;
                this.environment.env.yunit = this.settings.yunit;
                return;
            }
            this.environment.env = this.PSTricks.Functions[environment].call(this.settings, this.environment.match);
            if (environment.match(/pspicture/)) {
                if (typeof this.environment.env.xunit === 'undefined') {
                    this.environment.env.xunit = this.settings.xunit;
                }
                if (typeof this.environment.env.yunit === 'undefined') {
                    this.environment.env.yunit = this.settings.yunit;
                }
                // Renderers read the dialect for the handful of semantics it changes.
                this.environment.env.dialect = this.dialect;
            }
        }
    }
    // -------------------------------------------------------------------------
    // PSTricks command extraction (ordered)
    // -------------------------------------------------------------------------
    /**
     * Extract plot data from the ordered command nodes of a pspicture.
     * Returns the grouped `plot` map (keyed by command type, used by the
     * interactive re-render paths) and records the ordered `elements` list on
     * the env for source-order initial rendering.
     */
    parsePSTricks(commands, env) {
        var plot = {};
        const entries = Object.entries(this.PSTricks.Expressions);
        entries.forEach(([k, _exp]) => {
            plot[k] = [];
        });
        const elements = [];
        this.extractCommands(commands, env, plot, elements);
        env.elements = elements;
        return plot;
    }
    /**
     * Extract one command node into `plot` (grouped) and `elements` (ordered).
     * Recurses into `\multido` bodies (expanded, counter substituted) and
     * `\pscustom` bodies (the renderer re-parses those itself — the command is
     * kept as a single element with its raw body).
     */
    extractCommands(commands, env, plot, elements) {
        commands.forEach((node) => {
            const k = node.name;
            const exp = this.PSTricks.Expressions[k];
            if (!exp) {
                this.diagnose('warning', `unknown command \\${k} in pspicture`, node.loc);
                return;
            }
            // The grammar captures commands across lines; the semantic regexes are
            // single-line, so collapse internal newlines before matching.
            const raw = node.raw.replace(/\n/g, ' ');
            const m = raw.match(exp);
            if (!m) {
                this.diagnose('warning', `could not parse \\${k}: ${JSON.stringify(node.raw)}`, node.loc);
                return;
            }
            const data = this.PSTricks.Functions[k].call(env, m);
            // \multido{var=start+step}{count}{body} — expand and recurse.
            if (k === 'multido') {
                this.expandMultido(data, env, plot, elements, node);
                return;
            }
            // \pscustom{...} — pre-extract the inner commands into pixel data so
            // the renderer can build a single filled/stroked path.
            if (k === 'pscustom' && data.body) {
                data.commands = this.extractCustomBody(data.body, env);
            }
            plot[k].push({ data: data, env: env, match: m, fn: this.PSTricks.Functions[k] });
            // Under the PSTricks reading, anything this project added is worth
            // naming. A document that declares the LaTeX2JS dialect has said it means
            // to use them, so it is not told again.
            if (this.dialect === 'pstricks') {
                // `data` carries the command's parsed options, which is what the
                // detector inspects alongside the raw source.
                for (const use of (0, dialect_1.dialectUses)(k, node.raw ?? '', data)) {
                    this.diagnose('warning', `${use.construct} is a LaTeX2JS extension: ${use.detail}. ` +
                        'Declare \\psset{dialect=latex2js} if that is intended.', node.loc);
                }
            }
            if (data && data.plotpointsIgnored !== undefined) {
                this.diagnose('warning', `plotpoints=${data.plotpointsIgnored} needs at least 2 samples to mean anything; ` +
                    'the default sampling was used instead', node.loc);
            }
            const bad = nonFiniteFields(data);
            if (bad.length) {
                this.diagnose('warning', `\\${k} produced no usable value for ${bad.join(', ')}; it will not be drawn`, node.loc);
            }
            elements.push({ name: k, data: data, match: m, fn: this.PSTricks.Functions[k], loc: node.loc });
            // side effects preserved from the old parser:
            if (k === 'psaxes' && plot[k].length > 0) {
                const axesData = plot[k][plot[k].length - 1].data;
                if (axesData && axesData.dx !== undefined) {
                    env.dx = axesData.dx;
                    env.dy = axesData.dy;
                    env.origin = axesData.origin;
                }
            }
            if (k === 'uservariable') {
                env.variables = env.variables || {};
                env.variables[data.name] = data.value;
            }
        });
    }
    /** Expand a \multido loop into its constituent commands. */
    expandMultido(data, env, plot, elements, node) {
        if (!data.variable || !(data.count > 0) || !data.body)
            return;
        const re = new RegExp('\\\\' + data.variable + '\\b', 'g');
        for (let i = 0; i < data.count; i++) {
            const value = data.start + i * data.step;
            const body = data.body.replace(re, String(value));
            this.commandNodesFrom(this.parseTree(body)).forEach((cmd) => {
                this.extractCommands([cmd], env, plot, elements);
            });
        }
    }
    /**
     * Extract the inner commands of a \pscustom body into pixel data for the
     * renderer. Commands that need DOM/runtime handling (rput, slider, psset,
     * nested pscustom, multido) are skipped.
     */
    extractCustomBody(body, env) {
        const out = [];
        const skip = ['rput', 'slider', 'psset', 'pspicture', 'pscustom', 'multido', 'uservariable'];
        this.commandNodesFrom(this.parseTree(body)).forEach((node) => {
            const k = node.name;
            if (skip.indexOf(k) !== -1)
                return;
            const exp = this.PSTricks.Expressions[k];
            if (!exp)
                return;
            const m = node.raw.replace(/\n/g, ' ').match(exp);
            if (!m)
                return;
            try {
                const data = this.PSTricks.Functions[k].call(env, m);
                if (data)
                    out.push({ key: k, data: data });
            }
            catch (err) {
                /* ignore malformed inner commands */
            }
        });
        return out;
    }
    /**
     * Flatten parsed segments into an ordered list of command nodes, walking
     * into line parts and nested environments.
     */
    commandNodesFrom(segs) {
        const out = [];
        const walk = (seg) => {
            if (seg.kind === 'command')
                out.push(seg);
            else if (seg.kind === 'line') {
                (seg.parts || []).forEach((p) => {
                    if (p.kind === 'command')
                        out.push(p);
                });
            }
            else if (seg.kind === 'env') {
                (seg.content || []).forEach(walk);
            }
        };
        segs.forEach(walk);
        return out;
    }
    // -------------------------------------------------------------------------
    // Text / header transforms (reused from the old parser, string-based)
    // -------------------------------------------------------------------------
    /**
     * Text transforms run in sequence over one line, so each must match the
     * value the previous ones produced. Matching the pristine line instead makes
     * `matchrepl` search `contents` for a literal that an earlier transform has
     * already rewritten, and the replacement silently does nothing — which is
     * why `\section{Cauchy--Schwarz}` survived as source text once `--` had
     * become an en dash.
     */
    parseTextExpression(_line, exp, k, contents) {
        var match = contents.match(exp);
        if (match) {
            return this.Text.Functions[k].call(this, match, contents);
        }
        return contents;
    }
    parseHeadersExpression(line, exp, k, contents) {
        var match = line.match(exp);
        if (match) {
            // The match is passed so a numbered environment can see whether its
            // \begin was starred, which is how LaTeX spells "do not number this one".
            return this.Headers.Functions[k].call(this, match);
        }
        return contents;
    }
    parseText(line) {
        var contents = line;
        // TEXT
        Object.entries(this.Text.Expressions).forEach(([k, exp]) => {
            contents = this.parseTextExpression(line, exp, k, contents);
        });
        // HEADERS
        Object.entries(this.Headers.Expressions).forEach(([k, exp]) => {
            contents = this.parseHeadersExpression(line, exp, k, contents);
        });
        return contents;
    }
    // -------------------------------------------------------------------------
    // Diagnostics
    // -------------------------------------------------------------------------
    diagnose(severity, message, loc) {
        this.diagnostics.push({
            severity: severity,
            message: message,
            line: loc ? loc.line : undefined,
            column: loc ? loc.column : undefined
        });
    }
}
exports.default = Parser;

},{"../grammar/parser.js":9,"./counters":11,"./dialect":12,"@latex2js/settings":23}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
const utils_1 = require("@latex2js/utils");
exports.Expressions = {
    emph: /\\emph\{[^}]*\}/g,
    bf: /\{*\\bf [^}]*\}/g,
    rm: /\{*\\rm [^}]*\}/g,
    sl: /\{*\\sl [^}]*\}/g,
    it: /\{*\\it [^}]*\}/g,
    tt: /\{*\\tt [^}]*\}/g,
    mdash: /---/g,
    ndash: /--/g,
    openq: /``/g,
    closeq: /''/g,
    TeX: /\\TeX\\|\\TeX/g,
    LaTeX: /\\LaTeX\\|\\LaTeX/g,
    vspace: /\\vspace/g,
    cite: /\\cite\[\d+\]\{[^}]*\}/g,
    href: /\\href\{[^}]*\}\{[^}]*\}/g,
    img: /\\img\{[^}]*\}/g,
    set: /\\set\{[^}]*\}/g,
    youtube: /\\youtube\{[^}]*\}/g,
    euler: /Euler\^/g,
    textbf: /\\textbf\{[^}]*\}/g,
    textit: /\\textit\{[^}]*\}/g,
    texttt: /\\texttt\{[^}]*\}/g,
    textrm: /\\textrm\{[^}]*\}/g,
    textsc: /\\textsc\{[^}]*\}/g,
    underline: /\\underline\{[^}]*\}/g,
    overline: /\\overline\{[^}]*\}/g,
    section: /\\section\*?\{[^}]*\}/,
    subsection: /\\subsection\*?\{[^}]*\}/,
    subsubsection: /\\subsubsection\*?\{[^}]*\}/,
    paragraph: /\\paragraph\{[^}]*\}/,
    hspace: /\\hspace\{[^}]*\}/,
    noindent: /\\noindent/g,
    newpage: /\\newpage/g,
    hrule: /\\hrule/g,
    rule: /\\rule\{[^}]*\}\{[^}]*\}/g,
    textcolor: /\\textcolor\{[^}]*\}\{[^}]*\}/g,
    footnote: /\\footnote\{[^}]*\}/g,
};
/**
 * Renders one sectioning command, numbered unless it is starred.
 *
 * The number comes from the parser through the receiver, so this registry
 * carries no parser internals and a host that supplies neither still renders
 * the heading — just without a number.
 *
 * @param tag - the heading element for this level
 * @param level - the sectioning level, for the counter
 * @param m - the match: [full, star, title]
 * @param parser - the receiver, when the caller supplied one
 * @returns the heading markup
 */
function heading(tag, level, m, parser) {
    const starred = m[1] === '*';
    const title = m[2];
    const number = !starred && parser && typeof parser.sectionNumber === 'function'
        ? parser.sectionNumber(level, m[0])
        : null;
    const label = number === null || number === undefined
        ? ''
        : '<span class="section-number">' + number + '</span> ';
    return '<' + tag + '>' + label + title + '</' + tag + '>';
}
exports.Functions = {
    cite: function (m, contents) {
        m.forEach((match) => {
            var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);
            var m = location.pathname.match(/\/books\/(\d+)\//);
            var book_id = 0;
            if (m) {
                book_id = parseInt(m[1], 10);
            }
            contents = contents.replace(m2.input, '<a data-bypass="true" href="/references/' +
                book_id +
                '/' +
                m2[2] +
                '">[p' +
                m2[1] +
                ']</a>');
        });
        return contents;
    },
    img: (0, utils_1.matchrepl)(/\\img\{([^}]*)\}/, function (m) {
        return ('<div style="width: 100%;text-align: center;"><img src="' +
            m[1] +
            '"></div>');
    }),
    youtube: (0, utils_1.matchrepl)(/\\youtube\{([^}]*)\}/, function (m) {
        return ('<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' +
            m[1] +
            '" frameborder="0" allowfullscreen></iframe></div>');
    }),
    href: (0, utils_1.matchrepl)(/\\href\{([^}]*)\}\{([^}]*)\}/, function (m) {
        return '<a href="' + m[1] + '">' + m[2] + '</a>';
    }),
    set: (0, utils_1.matchrepl)(/\\set\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    euler: (0, utils_1.simplerepl)(/Euler\^/, 'exp'),
    emph: (0, utils_1.matchrepl)(/\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    bf: (0, utils_1.matchrepl)(/\{*\\bf ([^}]*)\}/, function (m) {
        return '<b>' + m[1] + '</b>';
    }),
    rm: (0, utils_1.matchrepl)(/\{*\\rm ([^}]*)\}/, function (m) {
        return '<span class="rm">' + m[1] + '</span>';
    }),
    sl: (0, utils_1.matchrepl)(/\{*\\sl ([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    it: (0, utils_1.matchrepl)(/\{*\\it ([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    tt: (0, utils_1.matchrepl)(/\{*\\tt ([^}]*)\}/, function (m) {
        return '<span class="tt">' + m[1] + '</span>';
    }),
    ndash: (0, utils_1.simplerepl)(/--/g, '&ndash;'),
    mdash: (0, utils_1.simplerepl)(/---/g, '&mdash;'),
    openq: (0, utils_1.simplerepl)(/``/g, '&ldquo;'),
    closeq: (0, utils_1.simplerepl)(/''/g, '&rdquo;'),
    vspace: (0, utils_1.simplerepl)(/\\vspace/g, '<br>'),
    TeX: (0, utils_1.simplerepl)(/\\TeX\\|\\TeX/g, '$\\TeX$'),
    LaTeX: (0, utils_1.simplerepl)(/\\LaTeX\\|\\LaTeX/g, '$\\LaTeX$'),
    textbf: (0, utils_1.matchrepl)(/\\textbf\{([^}]*)\}/, function (m) {
        return '<b>' + m[1] + '</b>';
    }),
    textit: (0, utils_1.matchrepl)(/\\textit\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    texttt: (0, utils_1.matchrepl)(/\\texttt\{([^}]*)\}/, function (m) {
        return '<span class="tt">' + m[1] + '</span>';
    }),
    textrm: (0, utils_1.matchrepl)(/\\textrm\{([^}]*)\}/, function (m) {
        return '<span class="rm">' + m[1] + '</span>';
    }),
    textsc: (0, utils_1.matchrepl)(/\\textsc\{([^}]*)\}/, function (m) {
        return '<span style="font-variant: small-caps;">' + m[1] + '</span>';
    }),
    underline: (0, utils_1.matchrepl)(/\\underline\{([^}]*)\}/, function (m) {
        return '<u>' + m[1] + '</u>';
    }),
    overline: (0, utils_1.matchrepl)(/\\overline\{([^}]*)\}/, function (m) {
        return '<span style="text-decoration: overline;">' + m[1] + '</span>';
    }),
    section: (0, utils_1.matchrepl)(/\\section(\*?)\{([^}]*)\}/, function (m) {
        return heading('h2', 'section', m, this);
    }),
    subsection: (0, utils_1.matchrepl)(/\\subsection(\*?)\{([^}]*)\}/, function (m) {
        return heading('h3', 'subsection', m, this);
    }),
    subsubsection: (0, utils_1.matchrepl)(/\\subsubsection(\*?)\{([^}]*)\}/, function (m) {
        return heading('h4', 'subsubsection', m, this);
    }),
    paragraph: (0, utils_1.matchrepl)(/\\paragraph\{([^}]*)\}/, function (m) {
        return '<h5>' + m[1] + '</h5>';
    }),
    hspace: (0, utils_1.matchrepl)(/\\hspace\{([^}]*)\}/, function (_m) {
        return '&nbsp; ';
    }),
    noindent: (0, utils_1.simplerepl)(/\\noindent/g, ''),
    newpage: (0, utils_1.simplerepl)(/\\newpage/g, '<br><br>'),
    hrule: (0, utils_1.simplerepl)(/\\hrule/g, '<hr>'),
    rule: (0, utils_1.matchrepl)(/\\rule\{([^}]*)\}\{([^}]*)\}/, function (m) {
        return ('<span style="display:inline-block;width:' +
            m[1] +
            ';height:' +
            m[2] +
            ';background:currentColor;"></span>');
    }),
    textcolor: (0, utils_1.matchrepl)(/\\textcolor\{([^}]*)\}\{([^}]*)\}/, function (m) {
        return '<span style="color:' + m[1] + ';">' + m[2] + '</span>';
    }),
    footnote: (0, utils_1.matchrepl)(/\\footnote\{([^}]*)\}/, function (m) {
        return '<sup class="footnote">' + m[1] + '</sup>';
    }),
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions,
};

},{"@latex2js/utils":25}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = String.raw `
  $$
  % create the definition symbol
  \def\bydef{\stackrel{\Delta}{=}}
  %\def\circconv{\otimes}
  \def\circconv{\circledast}

  \newcommand{\qed}{\mbox{ } \Box}


  \newcommand{\infint}{\int_{-\infty}^{\infty}}

  % z transform
  \newcommand{\ztp}{ ~~ \mathop{\mathcal{Z}}\limits_{\longleftrightarrow} ~~ }
  \newcommand{\iztp}{ ~~ \mathop{\mathcal{Z}^{-1}}\limits_{\longleftrightarrow} ~~ }
  % fourier transform pair
  \newcommand{\ftp}{ ~~ \mathop{\mathcal{F}}\limits_{\longleftrightarrow} ~~ }
  \newcommand{\iftp}{ ~~ \mathop{\mathcal{F}^{-1}}\limits_{\longleftrightarrow} ~~ }
  % laplace transform
  \newcommand{\ltp}{ ~~ \mathop{\mathcal{L}}\limits_{\longleftrightarrow} ~~ }
  \newcommand{\iltp}{ ~~ \mathop{\mathcal{L}^{-1}}\limits_{\longleftrightarrow} ~~ }

  \newcommand{\ftrans}[1]{ \mathcal{F} \left\{#1\right\} }
  \newcommand{\iftrans}[1]{ \mathcal{F}^{-1} \left\{#1\right\} }
  \newcommand{\ztrans}[1]{ \mathcal{Z} \left\{#1\right\} }
  \newcommand{\iztrans}[1]{ \mathcal{Z}^{-1} \left\{#1\right\} }
  \newcommand{\ltrans}[1]{ \mathcal{L} \left\{#1\right\} }
  \newcommand{\iltrans}[1]{ \mathcal{L}^{-1} \left\{#1\right\} }


  % coordinate vector relative to a basis (linear algebra)
  \newcommand{\cvrb}[2]{\left[ \vec{#1} \right]_{#2} }
  % change of coordinate matrix (linear algebra)
  \newcommand{\cocm}[2]{ \mathop{P}\limits_{#2 \leftarrow #1} }
  % Transformed vector set
  \newcommand{\tset}[3]{\{#1\lr{\vec{#2}_1}, #1\lr{\vec{#2}_2}, \dots, #1\lr{\vec{#2}_{#3}}\}}
  % sum transformed vector set
  \newcommand{\tsetcsum}[4]{{#1}_1#2(\vec{#3}_1) + {#1}_2#2(\vec{#3}_2) + \cdots + {#1}_{#4}#2(\vec{#3}_{#4})}
  \newcommand{\tsetcsumall}[4]{#2\lr{{#1}_1\vec{#3}_1 + {#1}_2\vec{#3}_2 + \cdots + {#1}_{#4}\vec{#3}_{#4}}}
  \newcommand{\cvecsum}[3]{{#1}_1\vec{#2}_1 + {#1}_2\vec{#2}_2 + \cdots + {#1}_{#3}\vec{#2}_{#3}}


  % function def
  \newcommand{\fndef}[3]{#1:#2 \to #3}
  % vector set
  \newcommand{\vset}[2]{\{\vec{#1}_1, \vec{#1}_2, \dots, \vec{#1}_{#2}\}}
  % absolute value
  \newcommand{\abs}[1]{\left| #1 \right|}
  % vector norm
  \newcommand{\norm}[1]{\left|\left| #1 \right|\right|}
  % trans
  \newcommand{\trans}{\mapsto}
  % evaluate integral
  \newcommand{\evalint}[3]{\left. #1 \right|_{#2}^{#3}}
  % slist
  \newcommand{\slist}[2]{{#1}_{1},{#1}_{2},\dots,{#1}_{#2}}

  % vectors
  \newcommand{\vc}[1]{\textbf{#1}}

  % real
  \newcommand{\Real}[1]{{\Re \mit{e}\left\{{#1}\right\}}}
  % imaginary
  \newcommand{\Imag}[1]{{\Im \mit{m}\left\{{#1}\right\}}}

  \newcommand{\mcal}[1]{\mathcal{#1}}
  \newcommand{\bb}[1]{\mathbb{#1}}
  \newcommand{\N}{\mathbb{N}}
  \newcommand{\Z}{\mathbb{Z}}
  \newcommand{\Q}{\mathbb{Q}}
  \newcommand{\R}{\mathbb{R}}
  \newcommand{\C}{\mathbb{C}}
  \newcommand{\I}{\mathbb{I}}
  \newcommand{\Th}[1]{\mathop\mathrm{Th(#1)}}
  \newcommand{\intersect}{\cap}
  \newcommand{\\union}{\cup}
  \newcommand{\intersectop}{\bigcap}
  \newcommand{\\unionop}{\bigcup}
  \newcommand{\setdiff}{\backslash}
  \newcommand{\iso}{\cong}
  \newcommand{\aut}[1]{\mathop{\mathrm{Aut(#1)}}}
  \newcommand{\inn}[1]{\mathop{\mathrm{Inn(#1)}}}
  \newcommand{\Ann}[1]{\mathop{\mathrm{Ann(#1)}}}
  \newcommand{\dom}[1]{\mathop{\mathrm{dom} #1}}
  \newcommand{\cod}[1]{\mathop{\mathrm{cod} #1}}
  \newcommand{\id}{\mathrm{id}}
  \newcommand{\st}{\ |\ }
  \newcommand{\mbf}[1]{\mathbf{#1}}
  \newcommand{\enclose}[1]{\left\langle #1\right\rangle}
  \newcommand{\lr}[1]{\left( #1\right)}
  \newcommand{\lrsq}[1]{\left[ #1\right]}
  \newcommand{\op}{\mathrm{op}}
  \newcommand{\dotarr}{\dot{\rightarrow}}
  %Category Names:
  \newcommand{\Grp}{\mathbf{Grp}}
  \newcommand{\Ab}{\mathbf{Ab}}
  \newcommand{\Set}{\mathbf{Set}}
  \newcommand{\Matr}{\mathbf{Matr}}
  \newcommand{\IntDom}{\mathbf{IntDom}}
  \newcommand{\Field}{\mathbf{Field}}
  \newcommand{\Vect}{\mathbf{Vect}}

  \newcommand{\thm}[1]{\begin{theorem} #1 \end{theorem}}
  \newcommand{\clm}[1]{\begin{claim} #1 \end{claim}}
  \newcommand{\cor}[1]{\begin{corollary} #1 \end{corollary}}
  \newcommand{\ex}[1]{\begin{example} #1 \end{example}}
  \newcommand{\prf}[1]{\begin{proof} #1 \end{proof}}
  \newcommand{\prbm}[1]{\begin{problem} #1 \end{problem}}
  \newcommand{\soln}[1]{\begin{solution} #1 \end{solution}}
  \newcommand{\rmk}[1]{\begin{remark} #1 \end{remark}}
  \newcommand{\defn}[1]{\begin{definition} #1 \end{definition}}

  \newcommand{\ifff}{\LeftRightArrow}

  <!-- For the set of reals and integers -->
  \newcommand{\rr}{\R}
  \newcommand{\reals}{\R}
  \newcommand{\ii}{\Z}
  \newcommand{\cc}{\C}
  \newcommand{\nn}{\N}
  \newcommand{\nats}{\N}

  <!-- For terms being indexed.
  Puts them in standard font face and creates an index entry.
  arg: The term being defined.
  \newcommand{\pointer}[1]{#1\index{#1}} -->

  <!-- For bold terms to be index, but defined elsewhere
  Puts them in bold face and creates an index entry.
  arg: The term being defined. -->
  \newcommand{\strong}[1]{\textbf{#1}}

  <!-- For set names.
  Puts them in italics. In math mode, yields decent spacing.
  arg: The name of the set. -->
  \newcommand{\set}[1]{\textit{#1}}

  $$
  `;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMathJax = exports.getMathJax = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        // Number AMS environments — equation, align, gather — and resolve \label
        // and \ref against those numbers. Equation numbering stays with MathJax
        // rather than the parser: it already owns the math, and two systems
        // numbering the same document would disagree.
        tags: 'ams',
        packages: ['base', 'ams', 'newcommand', 'configmacros']
    },
    chtml: {
        linebreaks: { automatic: true, width: 'container' }
    },
    startup: {
        ready: () => {
            console.log('MathJax v3 startup ready');
        }
    }
};
let mathJaxInstance = null;
const getMathJax = () => mathJaxInstance || globalThis.MathJax;
exports.getMathJax = getMathJax;
const loadMathJax = async (callback = () => { }, config = exports.DEFAULT_CONFIG) => {
    if (typeof window === 'undefined') {
        callback();
        return;
    }
    if (globalThis.MathJax) {
        mathJaxInstance = globalThis.MathJax;
        callback();
        return;
    }
    try {
        globalThis.MathJax = {
            ...config,
            startup: {
                ...config.startup,
                ready: () => {
                    globalThis.MathJax.startup.defaultReady();
                    mathJaxInstance = globalThis.MathJax;
                    if (config.startup?.ready) {
                        config.startup.ready();
                    }
                    callback();
                }
            }
        };
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
        script.async = true;
        script.id = 'MathJax-script';
        script.onload = () => {
            console.log('MathJax v3 script loaded from CDN');
        };
        script.onerror = () => {
            console.error('Failed to load MathJax v3 from CDN');
            callback();
        };
        document.head.appendChild(script);
    }
    catch (error) {
        console.error('Failed to load MathJax v3:', error);
        callback();
    }
};
exports.loadMathJax = loadMathJax;

},{}],20:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrow = exports.psgraph = exports.pstricks = void 0;
const pstricks_1 = __importDefault(require("./lib/pstricks"));
exports.pstricks = pstricks_1.default;
const psgraph_1 = __importStar(require("./lib/psgraph"));
exports.psgraph = psgraph_1.default;
Object.defineProperty(exports, "arrow", { enumerable: true, get: function () { return psgraph_1.arrow; } });
exports.default = {
    pstricks: pstricks_1.default,
    psgraph: psgraph_1.default,
    arrow: psgraph_1.arrow,
};

},{"./lib/psgraph":21,"./lib/pstricks":22}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrow = arrow;
const utils_1 = require("@latex2js/utils");
function arrow(x1, y1, x2, y2, arrowscale) {
    var t = Math.PI / 6;
    // arrowscale is a multiplier on the 8px default head size; anything that
    // is not a positive number falls back to 1 (the PSTricks default).
    var scale = Number(arrowscale);
    var d = 8 * (scale > 0 ? scale : 1);
    var dx = x2 - x1, dy = y2 - y1;
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
 *
 * The three PSTricks curve commands are three different shapes, not one:
 * `\pscurve` runs through every point, `\psccurve` wraps back to the start, and
 * `\psecurve` uses the first and last points **only** to set the tangents and
 * draws just the span between the interior ones. Treating `psecurve` as closed
 * — as this did — produced a loop where the reference draws a short open arc.
 *
 * @param data - flat coordinate pairs
 * @param mode - which of the three curves to build
 * @returns an SVG path, empty when there are too few points for the mode
 */
function buildCurvePath(data, mode) {
    const pts = [];
    for (let i = 0; i < data.length; i += 2)
        pts.push([data[i], data[i + 1]]);
    const n = pts.length;
    const closed = mode === 'closed';
    if (n < 2)
        return '';
    // The outer points of an endpoints curve are tangent controls, so four are
    // needed before there is any span left to draw.
    if (mode === 'endpoints') {
        if (n < 4)
            return '';
        let d = 'M ' + pts[1][0] + ' ' + pts[1][1];
        for (let i = 1; i < n - 2; i++) {
            const p0 = pts[i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2];
            const c1x = p1[0] + (p2[0] - p0[0]) / 6;
            const c1y = p1[1] + (p2[1] - p0[1]) / 6;
            const c2x = p2[0] - (p3[0] - p1[0]) / 6;
            const c2y = p2[1] - (p3[1] - p1[1]) / 6;
            d += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + p2[0] + ' ' + p2[1];
        }
        return d;
    }
    const at = (i) => pts[((i % n) + n) % n];
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
const HATCH_DIRECTIONS = {
    hlines: [0],
    vlines: [90],
    crosshatch: [0, 90],
};
/** PSTricks hatch parameter defaults, in points except the angle and colour. */
const HATCH_DEFAULTS = { hatchwidth: 0.8, hatchsep: 4, hatchangle: 45, hatchcolor: 'black' };
let patternSeq = 0;
/** Reads a dimension that may carry a `pt` suffix, in device units. */
function dimension(value, fallbackPt) {
    if (typeof value === 'number' && isFinite(value))
        return value * PT_TO_PX;
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
function hasFill(ctx) {
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
function resolveFill(ctx, svg) {
    const style = ctx.fillstyle ?? 'none';
    // The starred forms set `filled`; they fill flat regardless of style, in the
    // fillcolor the author wrote. PSTricks fills them with linecolor instead —
    // a difference the dialect reports rather than switches, because rendering
    // must not depend on a flag that cannot deliver PSTricks output anyway.
    if (ctx.filled || style === 'solid')
        return ctx.fillcolor;
    if (style === 'none' || !style)
        return 'none';
    const starred = style.endsWith('*');
    const directions = HATCH_DIRECTIONS[starred ? style.slice(0, -1) : style];
    // An unrecognised style is not a fill; guessing solid is what made the same
    // input render differently depending on the shape.
    if (!directions)
        return 'none';
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
        if (d === 0)
            line.attr('x1', 0).attr('y1', sep / 2).attr('x2', sep).attr('y2', sep / 2);
        else
            line.attr('x1', sep / 2).attr('y1', 0).attr('x2', sep / 2).attr('y2', sep);
    }
    return 'url(#' + id + ')';
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
function drawable(ctx, depth = 0) {
    if (depth > 4 || ctx === null || ctx === undefined)
        return true;
    if (typeof ctx === 'number')
        return isFinite(ctx);
    if (Array.isArray(ctx))
        return ctx.every((v) => drawable(v, depth + 1));
    if (typeof ctx !== 'object')
        return true;
    return Object.entries(ctx).every(
    // `global` is the shared environment, not this command's geometry.
    ([k, v]) => k === 'global' || k === 'env' || drawable(v, depth + 1));
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
function arcFlags(angleA, angleB) {
    let delta = angleB - angleA;
    if (!isFinite(delta))
        delta = 0;
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
function fullCirclePath(cx, cy, r) {
    return ('M ' + (cx - r) + ' ' + cy +
        ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + cy +
        ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx - r) + ' ' + cy + ' Z');
}
function curveRenderer(svg) {
    const mode = this.endpoints ? 'endpoints' : this.closed ? 'closed' : 'open';
    const d = buildCurvePath(this.data, mode);
    if (!d)
        return;
    svg
        .append('svg:path')
        .attr('d', d)
        .style('stroke-width', this.linewidth)
        .style('stroke', this.linecolor)
        .style('stroke-opacity', 1)
        .style('fill', resolveFill(this, svg));
}
const psgraph = {
    env: null,
    getSize() {
        const padding = 20;
        this.env.scale = 1;
        const goalWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) -
            padding;
        if (goalWidth <= this.env.w * this.env.xunit) {
            this.env.scale = goalWidth / this.env.w / this.env.xunit;
        }
        const width = this.env.w * this.env.xunit;
        const height = this.env.h * this.env.yunit;
        return {
            width,
            height
        };
    },
    psframe(svg) {
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
    pscircle: function (svg) {
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
    psplot(svg) {
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
                    .attr('r', this.dotsize)
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
            context.push(utils_1.Y.call(this.global, 0));
        }
        else {
            context.push(this.data[0]);
            context.push(this.data[1]);
        }
        context.push('L');
        this.data.forEach((data) => {
            context.push(data);
        });
        if (hasFill(this)) {
            context.push(this.data[this.data.length - 2]);
            context.push(utils_1.Y.call(this.global, 0));
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
    pspolygon(svg) {
        var context = [];
        context.push('M');
        context.push(this.data[0]);
        context.push(this.data[1]);
        context.push('L');
        this.data.forEach((data) => {
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
    psarc(svg) {
        const { delta, large, sweep } = arcFlags(this.angleA, this.angleB);
        const filled = hasFill(this);
        const arc = ' A ' + this.r + ' ' + this.r + ' 0 ' + large + ' ' + sweep +
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
    psaxes(svg) {
        var xaxis = [this.bottomLeft[0], this.topRight[0]];
        var yaxis = [this.bottomLeft[1], this.topRight[1]];
        var origin = this.origin;
        function line(x1, y1, x2, y2) {
            svg
                .append('svg:path')
                .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
                .style('stroke-width', 2)
                .style('stroke', 'rgb(0,0,0)')
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
        const arrowedEnds = (axis) => [
            this.arrows[0] ? axis[0] : null,
            this.arrows[1] ? axis[1] : null,
        ];
        const positions = (from, to, at, step) => {
            if (!(step > 0) || !isFinite(step))
                return [];
            // Y inverts the axis, so a vertical span arrives with its ends the other
            // way round. Walking it as given produced no y ticks at all.
            const lo = Math.min(from, to);
            const hi = Math.max(from, to);
            const out = [];
            for (let v = at; v <= hi + 1e-6; v += step)
                out.push(v);
            for (let v = at - step; v >= lo - 1e-6; v -= step)
                out.unshift(v);
            // PSTricks gives an arrowhead the end of the axis to itself: where one is
            // drawn, the tick and its number are both suppressed. A tick that merely
            // falls short of the tip keeps them, so only a coincident one is dropped.
            const suppressed = arrowedEnds([from, to]).filter((v) => v !== null);
            return out.filter((v) => !suppressed.some((end) => Math.abs(v - end) < 1e-6));
        };
        var xticks = () => {
            positions(xaxis[0], xaxis[1], origin[0], this.dx).forEach((x) => {
                // showorigin=false suppresses the tick at the origin itself.
                if (this.showorigin === false && Math.abs(x - origin[0]) < 1e-6)
                    return;
                line(x, origin[1] - 5, x, origin[1] + 5);
            });
        };
        var yticks = () => {
            positions(yaxis[0], yaxis[1], origin[1], this.dy).forEach((y) => {
                if (this.showorigin === false && Math.abs(y - origin[1]) < 1e-6)
                    return;
                line(origin[0] - 5, y, origin[0] + 5, y);
            });
        };
        const env = this.global || {};
        /** Draws one tick number, positioned clear of its axis. */
        const label = (text, x, y, anchor) => {
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
        const value = (device, axis) => {
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
                if (atOrigin && this.showorigin === false)
                    return;
                if (atOrigin)
                    label(String(value(x, 'x')), x - 7, origin[1] + 20, 'end');
                else
                    label(String(value(x, 'x')), x, origin[1] + 20, 'middle');
            });
        };
        const ylabels = () => {
            positions(yaxis[0], yaxis[1], origin[1], this.dy).forEach((y) => {
                // The origin's own number belongs to the x axis; drawing it again here
                // would stack two glyphs in the same place.
                if (Math.abs(y - origin[1]) < 1e-6)
                    return;
                label(String(value(y, 'y')), origin[0] - 10, y + 4, 'end');
            });
        };
        line(xaxis[0], origin[1], xaxis[1], origin[1]);
        line(origin[0], yaxis[0], origin[0], yaxis[1]);
        const selects = (option, axis) => {
            const v = String(option ?? 'all');
            if (v.match(/none/))
                return false;
            return !!(v.match(/all/) || v.match(axis));
        };
        if (selects(this.ticks, 'x'))
            xticks();
        if (selects(this.ticks, 'y'))
            yticks();
        if (env.xunit && selects(this.labels, 'x'))
            xlabels();
        if (env.yunit && selects(this.labels, 'y'))
            ylabels();
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
    psline(svg) {
        var linewidth = this.linewidth, linecolor = this.linecolor;
        function solid(x1, y1, x2, y2) {
            svg
                .append('svg:path')
                .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
                .style('stroke-width', linewidth)
                .style('stroke', linecolor)
                .style('stroke-opacity', 1);
        }
        function dashed(x1, y1, x2, y2) {
            svg
                .append('svg:path')
                .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
                .style('stroke-width', linewidth)
                .style('stroke', linecolor)
                .style('stroke-dasharray', '9,5')
                .style('stroke-opacity', 1);
        }
        function dotted(x1, y1, x2, y2) {
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
        }
        else if (this.linestyle.match(/dashed/)) {
            dashed(this.x1, this.y1, this.x2, this.y2);
        }
        else {
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
        var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
        if (this.arrows[0]) {
            svg
                .append('path')
                .attr('d', arrow(x2, y2, x1, y1, this.arrowscale))
                .style('fill', this.linecolor)
                .style('stroke', this.linecolor);
        }
        if (this.arrows[1]) {
            svg
                .append('path')
                .attr('d', arrow(x1, y1, x2, y2, this.arrowscale))
                .style('fill', this.linecolor)
                .style('stroke', this.linecolor);
        }
    },
    userline(svg) {
        var linewidth = this.linewidth, linecolor = this.linecolor;
        function solid(x1, y1, x2, y2) {
            svg
                .append('svg:path')
                .attr('class', 'userline')
                .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
                .style('stroke-width', linewidth)
                .style('stroke', linecolor)
                .style('stroke-opacity', 1);
        }
        function dashed(x1, y1, x2, y2) {
            svg
                .append('svg:path')
                .attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2)
                .attr('class', 'userline')
                .style('stroke-width', linewidth)
                .style('stroke', linecolor)
                .style('stroke-dasharray', '9,5')
                .style('stroke-opacity', 1);
        }
        function dotted(x1, y1, x2, y2) {
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
        }
        else if (this.linestyle.match(/dashed/)) {
            dashed(this.x1, this.y1, this.x2, this.y2);
        }
        else {
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
        var x1 = this.x1, y1 = this.y1, x2 = this.x2, y2 = this.y2;
        if (this.arrows[0]) {
            svg
                .append('path')
                .attr('d', arrow(x2, y2, x1, y1, this.arrowscale))
                .attr('class', 'userline')
                .style('fill', this.linecolor)
                .style('stroke', this.linecolor);
        }
        if (this.arrows[1]) {
            svg
                .append('path')
                .attr('d', arrow(x1, y1, x2, y2, this.arrowscale))
                .attr('class', 'userline')
                .style('fill', this.linecolor)
                .style('stroke', this.linecolor);
        }
    },
    rput(el) {
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
            return new Promise((resolve) => {
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
                    }
                    catch (error) {
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
            const mathJax = window.MathJax;
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
                }
                catch (error) {
                    console.error('MathJax typesetting failed:', error);
                    // Fallback to plain HTML
                    div.innerHTML = this.text;
                    await positionElement();
                }
            }
            else {
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
    pspicture(svg) {
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
        function resolveData(item, coords, variables) {
            if (!coords || !item.fn)
                return item.data;
            if (item.name === 'psplot') {
                Object.entries(variables || {}).forEach(([name, value]) => {
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
                }
                else if (item.data.xExp) {
                    item.data.x2 = d.userx(coords);
                }
                if (item.data.yExp2) {
                    item.data.y2 = d.usery2(coords);
                    item.data.y1 = d.usery(coords);
                }
                else if (item.data.yExp) {
                    item.data.y2 = d.usery(coords);
                }
                d.global = Object.assign({}, env);
                Object.assign(d, item.data);
                return d;
            }
            return item.data;
        }
        /** Evaluates every \uservariable at the pointer position, in source order. */
        function readVariables(coords) {
            const variables = {};
            const source = elements && elements.length
                ? elements.filter((i) => i && i.name === 'uservariable')
                : ((plots && plots.uservariable) || []).map((p) => ({ ...p, name: 'uservariable' }));
            source.forEach((item) => {
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
        let layer = null;
        function drawLayer(coords) {
            if (layer)
                layer.remove();
            layer = svg.append('svg:g').attr('class', 'pspicture-layer');
            const variables = coords ? readVariables(coords) : {};
            if (elements && elements.length) {
                elements.forEach((item) => {
                    if (!item || !item.name || item.name.match(/rput/))
                        return;
                    if (!psgraph.hasOwnProperty(item.name))
                        return;
                    const data = resolveData(item, coords, variables);
                    // A coordinate that could not be computed arrives as NaN. Drawing it
                    // anyway is the trap: SVG treats an invalid geometry attribute as
                    // absent and falls back to its default, so the shape reappears at the
                    // origin looking deliberate. Nothing is the honest output.
                    if (!drawable(data))
                        return;
                    data.global = env;
                    psgraph[item.name].call(data, layer);
                });
                return;
            }
            // Legacy data without an ordered element list: fall back to the
            // type-grouped iteration, which cannot express author order.
            Object.keys(plots).forEach((key) => {
                if (key.match(/rput/))
                    return;
                if (!psgraph.hasOwnProperty(key))
                    return;
                plots[key].forEach((entry) => {
                    const item = { name: key, data: entry.data, match: entry.match, fn: entry.fn };
                    const data = resolveData(item, coords, variables);
                    data.global = env;
                    psgraph[key].call(data, layer);
                });
            });
        }
        drawLayer(null);
        svg.on('touchmove', function (event) {
            event.preventDefault();
            var touch = event.touches ? event.touches[0] : null;
            var rect = event.target.getBoundingClientRect();
            var touchcoords = touch ? [touch.clientX - rect.left, touch.clientY - rect.top] : [0, 0];
            drawLayer(touchcoords);
        });
        svg.on('mousemove', function (event) {
            var coords = [event.offsetX || 0, event.offsetY || 0];
            drawLayer(coords);
        });
        // Enhanced cleanup and RPUT processing
        psgraph.processRputElements.call(this, el);
    },
    psdots(svg) {
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
    /**
     * A PSTricks grid is three things, not one: fine subdivision lines, a heavier
     * line on each unit, and the coordinate numbered along the left and bottom
     * edges. Only the unit lines were drawn, in `linecolor` — which `gridcolor`
     * could not override — so a grid was a flat mesh with no reading on it.
     */
    psgrid(svg) {
        const x0 = this.x0, y0 = this.y0, x1 = this.x1, y1 = this.y1;
        const gridcolor = this.gridcolor ?? this.linecolor;
        const gridwidth = dimension(this.gridwidth, 0.8);
        const subdiv = Math.max(0, Math.floor(Number(this.subgriddiv ?? 5)));
        const subcolor = this.subgridcolor ?? 'gray';
        const subwidth = dimension(this.subgridwidth, 0.4);
        const rule = (a, b, c, d, color, width) => {
            svg
                .append('svg:line')
                .attr('x1', a).attr('y1', b).attr('x2', c).attr('y2', d)
                .style('stroke', color)
                .style('stroke-width', width)
                .style('stroke-opacity', 1);
        };
        /** Line offsets across a span, stepping by `step` from `origin`. */
        const rungs = (lo, hi, origin, step) => {
            if (!(step > 0) || !isFinite(step))
                return [];
            const out = [];
            for (let v = origin; v <= hi + 1e-6; v += step)
                out.push(v);
            for (let v = origin - step; v >= lo - 1e-6; v -= step)
                out.unshift(v);
            return out;
        };
        const ox = this.originX ?? x0;
        const oy = this.originY ?? y0;
        // Subdivisions first, so the unit lines and labels sit over them.
        if (subdiv > 1) {
            for (const x of rungs(x0, x1, ox, this.xunit / subdiv))
                rule(x, y0, x, y1, subcolor, subwidth);
            for (const y of rungs(y0, y1, oy, this.yunit / subdiv))
                rule(x0, y, x1, y, subcolor, subwidth);
        }
        const xs = rungs(x0, x1, ox, this.xunit);
        const ys = rungs(y0, y1, oy, this.yunit);
        for (const x of xs)
            rule(x, y0, x, y1, gridcolor, gridwidth);
        for (const y of ys)
            rule(x0, y, x1, y, gridcolor, gridwidth);
        // Grid numbers are off unless asked for. PSTricks draws them outside the
        // grid on an unbounded page; an SVG is sized to the picture's declared
        // bounds, so on a grid that reaches the edge — the common case — they would
        // land outside the viewport and be clipped away. A default nobody can see
        // is worse than no default, so they are opt-in and clamped inside.
        if (!this.gridlabels || this.gridlabels === 'none' || this.gridlabels === '0')
            return;
        const size = dimension(this.gridlabels, 10);
        const labelcolor = this.gridlabelcolor ?? 'black';
        const text = (s, x, y, anchor) => {
            svg
                .append('svg:text')
                .attr('x', x).attr('y', y)
                .attr('text-anchor', anchor)
                .attr('font-size', size)
                .attr('font-family', 'serif')
                .style('fill', labelcolor)
                .text(s);
        };
        const round = (n) => (Math.abs(n) < 1e-9 ? 0 : Number(n.toFixed(4)));
        const env = this.global || {};
        // Clamped inside the picture so a grid flush with the edge still shows its
        // numbers rather than pushing them out of the viewport.
        const belowY = Math.min(y1 + size + 4, (env.h ?? 0) * (env.yunit ?? 1) - 2);
        const leftX = Math.max(x0 - 4, size);
        for (const x of xs)
            text(String(round(x / env.xunit - env.w + env.x1)), x, belowY, 'middle');
        for (const y of ys)
            text(String(round(env.y1 - y / env.yunit)), leftX, y + size / 3, 'end');
    },
    psellipse(svg) {
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
    psbezier(svg) {
        svg
            .append('svg:path')
            .attr('d', 'M ' + this.x1 + ' ' + this.y1 +
            ' C ' + this.x2 + ' ' + this.y2 + ', ' + this.x3 + ' ' + this.y3 + ', ' + this.x4 + ' ' + this.y4)
            .style('stroke-width', this.linewidth)
            .style('stroke', this.linecolor)
            .style('stroke-opacity', 1)
            .style('fill', 'none');
    },
    pscurve(svg) {
        const d = buildCurvePath(this.data, this.endpoints ? 'endpoints' : this.closed ? 'closed' : 'open');
        if (!d)
            return;
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
    pswedge(svg) {
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
    pscustom(svg) {
        const filled = hasFill(this);
        let d = '';
        let started = false;
        (this.commands || []).forEach((cmd) => {
            const data = cmd.data;
            if (!data)
                return;
            if (cmd.key === 'psline' || cmd.key === 'userline' || cmd.key === 'psbezier') {
                if (cmd.key === 'psbezier') {
                    if (!started) {
                        d += 'M ' + data.x1 + ' ' + data.y1;
                        started = true;
                    }
                    d += ' C ' + data.x2 + ' ' + data.y2 + ', ' + data.x3 + ' ' + data.y3 + ', ' + data.x4 + ' ' + data.y4;
                    return;
                }
                if (!started) {
                    d += 'M ' + data.x1 + ' ' + data.y1;
                    started = true;
                }
                d += ' L ' + data.x2 + ' ' + data.y2;
            }
            else if (cmd.key === 'psframe') {
                if (!started) {
                    d += 'M ' + data.x1 + ' ' + data.y1;
                    started = true;
                }
                d += ' L ' + data.x2 + ' ' + data.y1 +
                    ' L ' + data.x2 + ' ' + data.y2 +
                    ' L ' + data.x1 + ' ' + data.y2 + ' Z';
            }
            else if (cmd.key === 'pspolygon' || cmd.key === 'pscurve') {
                const pts = data.data || [];
                if (pts.length < 2)
                    return;
                if (!started) {
                    d += 'M ' + pts[0] + ' ' + pts[1];
                    started = true;
                }
                for (let i = 2; i < pts.length; i += 2)
                    d += ' L ' + pts[i] + ' ' + pts[i + 1];
                d += ' Z';
            }
        });
        if (!started)
            return;
        if (filled)
            d += ' Z';
        svg
            .append('svg:path')
            .attr('d', d)
            .style('stroke-width', this.linewidth)
            .style('stroke', this.linestyle === 'none' ? 'none' : this.linecolor)
            .style('stroke-opacity', 1)
            .style('fill', resolveFill(this, svg));
    },
    processRputElements(el) {
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
            existingElements.forEach((element) => {
                try {
                    // Clean up any pending async operations
                    element.style.visibility = 'hidden';
                    element.remove();
                    cleanupCount++;
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('RPUT: Error during cleanup', error);
            // Fallback to immediate rendering
            psgraph.renderRputElements.call(this, el);
        }
    },
    renderRputElements(el) {
        if (!this.plot?.rput || this.plot.rput.length === 0) {
            return;
        }
        // Track rendering for debugging
        console.log(`RPUT: Rendering ${this.plot.rput.length} elements`);
        // Process RPUT elements with better error isolation
        const renderPromises = [];
        this.plot.rput.forEach((rput, index) => {
            try {
                // Validate RPUT data
                if (!rput || !rput.data) {
                    console.warn(`RPUT: Invalid RPUT data at index ${index}`, rput);
                    return;
                }
                // Add global context
                rput.data.global = this.env;
                // Create a promise for this RPUT element
                const renderPromise = new Promise((resolve) => {
                    try {
                        // Use setTimeout to prevent blocking the main thread
                        setTimeout(() => {
                            psgraph.rput.call(rput.data, el);
                            resolve();
                        }, index * 10); // Stagger rendering slightly
                    }
                    catch (error) {
                        console.error(`RPUT: Error rendering element ${index}`, error);
                        resolve();
                    }
                });
                renderPromises.push(renderPromise);
            }
            catch (error) {
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
exports.default = psgraph;

},{"@latex2js/utils":25}],22:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
const utils_1 = require("@latex2js/utils");
const settings_1 = __importDefault(require("@latex2js/settings"));
/**
 * Parse a PSTricks linewidth value: a bare number is used as-is (SVG px),
 * a `pt` value is converted to px (1pt ≈ 1.333px).
 */
function parseLinewidth(value) {
    const m = value.trim().match(/^([\d.]+)\s*(pt)?$/);
    if (!m)
        return 2;
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
function arcEndpoints(cx, cy, r, angleA, angleB) {
    const ox = cx === undefined || cx === '' ? 0 : Number(cx);
    const oy = cy === undefined || cy === '' ? 0 : Number(cy);
    const radius = Number(r);
    const at = (angle) => ({
        x: utils_1.X.call(this, ox + radius * Math.cos(angle)),
        y: utils_1.Y.call(this, oy + radius * Math.sin(angle))
    });
    return { A: at(angleA), B: at(angleB) };
}
exports.Expressions = {
    pspicture: /\\begin\{pspicture\}\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psframe: /\\psframe\*?(\[[^\]]*\])?\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psplot: /\\psplot\*?(\[[^\]]*\])?\{([^\}]*)\}\{([^\}]*)\}\{([^\}]*)\}/,
    psarc: new RegExp('\\\\psarc\\*?' +
        utils_1.RE.options +
        utils_1.RE.type +
        utils_1.RE.coords +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle),
    pscircle: /\\pscircle.*\(\s*(.*),(.*)\s*\)\{(.*)\}/,
    pspolygon: new RegExp('\\\\pspolygon\\*?' + utils_1.RE.options + '(.*)'),
    psaxes: new RegExp('\\\\psaxes\\*?' +
        utils_1.RE.options +
        utils_1.RE.type +
        utils_1.RE.coords +
        utils_1.RE.coordsOpt +
        utils_1.RE.coordsOpt),
    slider: new RegExp('\\\\slider' +
        utils_1.RE.options +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle),
    psline: new RegExp('\\\\psline\\*?' + utils_1.RE.options + utils_1.RE.type + utils_1.RE.coords + utils_1.RE.coordsOpt),
    userline: new RegExp('\\\\userline' +
        utils_1.RE.options +
        utils_1.RE.type +
        utils_1.RE.coords +
        utils_1.RE.coords +
        utils_1.RE.squiggleOpt +
        utils_1.RE.squiggleOpt +
        utils_1.RE.squiggleOpt +
        utils_1.RE.squiggleOpt),
    uservariable: new RegExp('\\\\uservariable' + utils_1.RE.options + utils_1.RE.squiggle + utils_1.RE.coords + utils_1.RE.squiggle),
    rput: /\\rput\((.*),(.*)\)\{(.*)\}/,
    psset: /\\psset\{(.*)\}/,
    psdots: new RegExp('\\\\psdots' + utils_1.RE.options + '(.*)'),
    psgrid: new RegExp('\\\\psgrid' + utils_1.RE.options + utils_1.RE.coordsOpt + utils_1.RE.coordsOpt + utils_1.RE.coordsOpt),
    psellipse: /\\psellipse.*\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psbezier: /\\psbezier(\[[^\]]*\])?\((.*),(.*)\)\((.*),(.*)\)\((.*),(.*)\)\((.*),(.*)\)/,
    pscurve: new RegExp('\\\\pscurve' + utils_1.RE.options + utils_1.RE.coords + '(.*)'),
    psecurve: new RegExp('\\\\psecurve' + utils_1.RE.options + utils_1.RE.coords + '(.*)'),
    psccurve: new RegExp('\\\\psccurve' + utils_1.RE.options + utils_1.RE.coords + '(.*)'),
    pswedge: /\\pswedge(\[[^\]]*\])?\(\s*(.*),(.*)\s*\)\{(.*)\}\{(.*)\}\{(.*)\}/,
    pscustom: /\\pscustom(\[[^\]]*\])?\{([\s\S]*)\}/,
    multido: /\\multido\{([^}]*)\}\{([^}]*)\}\{([\s\S]*)\}/
};
exports.Functions = {
    slider(m) {
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
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        }
        return obj;
    },
    pspicture(m) {
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
    psframe(m) {
        var obj = {
            x1: utils_1.X.call(this, m[2]),
            y1: utils_1.Y.call(this, m[3]),
            x2: utils_1.X.call(this, m[4]),
            y2: utils_1.Y.call(this, m[5]),
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2,
            filled: /\\psframe\*/.test(m[0])
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        return obj;
    },
    pscircle(m) {
        var obj = {
            cx: utils_1.X.call(this, m[1]),
            cy: utils_1.Y.call(this, m[2]),
            r: this.xunit * m[3],
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2,
            filled: /\\pscircle\*/.test(m[0])
        };
        var opts = m[0].match(/\[([^\]]*)\]/);
        if (opts)
            Object.assign(obj, (0, utils_1.parseOptions)(opts[1]));
        return obj;
    },
    psaxes(m) {
        var obj = {
            dx: 1 * this.xunit,
            dy: 1 * this.yunit,
            arrows: [0, 0],
            dots: [0, 0],
            ticks: 'all',
            labels: 'all',
            showorigin: true
        };
        if (m[1]) {
            var options = (0, utils_1.parseOptions)(m[1]);
            if (options.Dx) {
                obj.dx = Number(options.Dx) * this.xunit;
            }
            if (options.Dy) {
                obj.dy = Number(options.Dy) * this.yunit;
            }
            // `ticks` and `labels` select which axes get marks and numbers; both
            // accept all / x / y / none. Dropping them meant ticks=none still drew
            // ticks and labels could never be turned on.
            if (options.ticks)
                obj.ticks = options.ticks;
            if (options.labels)
                obj.labels = options.labels;
            // arrowscale scales the axis arrowheads; it reaches the renderer as a
            // string via parseOptions and is converted where the head is drawn.
            if (options.arrowscale)
                obj.arrowscale = options.arrowscale;
            // showorigin=false suppresses the tick and number at the origin; the
            // default is to draw them.
            if (options.showorigin)
                obj.showorigin = options.showorigin !== 'false';
        }
        // arrows?
        var l = (0, utils_1.parseArrows)(m[2]);
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
            obj.origin = [utils_1.X.call(this, m[3]), utils_1.Y.call(this, m[4])];
            obj.bottomLeft = [utils_1.X.call(this, m[3]), utils_1.Y.call(this, m[4])];
            obj.topRight = [utils_1.X.call(this, m[6]), utils_1.Y.call(this, m[7])];
        }
        else if (!m[5] && !m[8]) {
            // If both (x0,y0) and (x1,y1) are omitted, (0,0) is used as the default.
            obj.origin = [utils_1.X.call(this, 0), utils_1.Y.call(this, 0)];
            obj.bottomLeft = [utils_1.X.call(this, 0), utils_1.Y.call(this, 0)];
            obj.topRight = [utils_1.X.call(this, m[3]), utils_1.Y.call(this, m[6])];
        }
        else {
            // all three are specified
            obj.origin = [utils_1.X.call(this, m[3]), utils_1.Y.call(this, m[4])];
            obj.bottomLeft = [utils_1.X.call(this, m[6]), utils_1.Y.call(this, m[7])];
            obj.topRight = [utils_1.X.call(this, m[9]), utils_1.Y.call(this, m[10])];
        }
        return obj;
    },
    psplot(m) {
        var startX = utils_1.evaluate.call(this, m[2]);
        var endX = utils_1.evaluate.call(this, m[3]);
        var data = [];
        var x;
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'none',
            linewidth: 2,
            // `plotstyle=dots` marks the samples rather than joining them; dotsize is
            // the marker radius, matching psdots so a document using both agrees.
            plotstyle: 'line',
            dotsize: 2
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        // Sampling: honor `plotpoints=N` (number of samples); default to a
        // fixed 0.005 step like the original implementation.
        var step = 0.005;
        var plotpoints = obj.plotpoints ? Number(obj.plotpoints) : 0;
        if (plotpoints > 1) {
            step = (endX - startX) / (plotpoints - 1);
        }
        else if (obj.plotpoints !== undefined && plotpoints < 2) {
            // Fewer than two samples has no defined meaning — there is no interval
            // left to step across — so the default sampling is used instead. Saying
            // so beats accepting the option and quietly doing something else.
            obj.plotpointsIgnored = plotpoints;
        }
        // Compile the plot expression once; evaluate per sample against a
        // reused scope (compile-once / evaluate-many).
        let compiled;
        try {
            compiled = (0, utils_1.parseExpression)(m[4]);
        }
        catch (err) {
            console.warn('psplot: could not parse expression:', err.message);
            obj.data = data;
            return obj;
        }
        const scope = Object.assign({}, this.variables || {});
        for (x = startX; x <= endX + step / 2; x += step) {
            data.push(utils_1.X.call(this, x));
            scope.x = x;
            const yValue = compiled.evaluate(scope);
            if (yValue !== undefined && !isNaN(yValue)) {
                data.push(utils_1.Y.call(this, yValue));
            }
            else {
                data.push(utils_1.Y.call(this, 0));
            }
        }
        obj.data = data;
        return obj;
    },
    pspolygon(m) {
        var coords = m[2];
        if (!coords)
            return;
        var manyCoords = new RegExp(utils_1.RE.coords, 'g');
        var matches = coords.match(manyCoords);
        var singleCoord = new RegExp(utils_1.RE.coords);
        var data = [];
        matches.forEach((coord) => {
            var d = singleCoord.exec(coord);
            if (d) {
                data.push(utils_1.X.call(this, d[1]));
                data.push(utils_1.Y.call(this, d[2]));
            }
        });
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2,
            filled: /\\pspolygon\*/.test(m[0]),
            data: data
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        return obj;
    },
    psarc(m) {
        var l = (0, utils_1.parseArrows)(m[2]);
        var arrows = l.arrows;
        var dots = l.dots;
        var obj = {
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
            cx: utils_1.X.call(this, 0),
            cy: utils_1.Y.call(this, 0)
        };
        if (m[1]) {
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        }
        // m[1] options
        // m[2] arrows
        // m[3] x1
        // m[4] y1
        // m[5] radius
        // m[6] angleA
        // m[7] angleB
        if (m[3]) {
            obj.cx = utils_1.X.call(this, m[3]);
        }
        if (m[4]) {
            obj.cy = utils_1.Y.call(this, m[4]);
        }
        // choose x units over y, no reason...
        obj.r = Number(m[5]) * this.xunit;
        obj.angleA = (Number(m[6]) * Math.PI) / 180;
        obj.angleB = (Number(m[7]) * Math.PI) / 180;
        Object.assign(obj, arcEndpoints.call(this, m[3], m[4], m[5], obj.angleA, obj.angleB));
        return obj;
    },
    psline(m) {
        var options = m[1];
        var lineType = m[2];
        var l = (0, utils_1.parseArrows)(lineType);
        var arrows = l.arrows;
        var dots = l.dots;
        var obj = {
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
            obj.x1 = utils_1.X.call(this, m[3]);
            obj.y1 = utils_1.Y.call(this, m[4]);
            obj.x2 = utils_1.X.call(this, m[6]);
            obj.y2 = utils_1.Y.call(this, m[7]);
        }
        else {
            obj.x1 = utils_1.X.call(this, 0);
            obj.y1 = utils_1.Y.call(this, 0);
            obj.x2 = utils_1.X.call(this, m[3]);
            obj.y2 = utils_1.Y.call(this, m[4]);
        }
        if (options) {
            Object.assign(obj, (0, utils_1.parseOptions)(options));
        }
        // TODO: add regex
        if (typeof obj.linewidth === 'string') {
            obj.linewidth = parseLinewidth(obj.linewidth);
        }
        return obj;
    },
    uservariable(m) {
        var coords = [];
        if (this.userx && this.usery) {
            // coords.push( Xinv.call(this, this.userx) );
            // coords.push( Yinv.call(this, this.usery) );
            coords.push(Number(this.userx));
            coords.push(Number(this.usery));
        }
        else {
            coords.push(utils_1.X.call(this, m[3]));
            coords.push(utils_1.Y.call(this, m[4]));
        }
        var nx1 = utils_1.Xinv.call(this, coords[0]);
        var ny1 = utils_1.Yinv.call(this, coords[1]);
        var obj = {
            name: m[2],
            x: utils_1.X.call(this, m[3]),
            y: utils_1.Y.call(this, m[4]),
            func: m[5],
            value: 0
        };
        try {
            obj.value = (0, utils_1.parseExpression)(m[5]).evaluate(Object.assign({ x: nx1, y: ny1 }, this.variables || {}));
        }
        catch (err) {
            console.warn('Error evaluating uservariable expression:', err.message);
        }
        return obj;
    },
    userline(m) {
        var options = m[1];
        // WE ARENT USING THIS YET!!!! e.g., [linecolor=green]
        var lineType = m[2];
        var l = (0, utils_1.parseArrows)(lineType);
        var arrows = l.arrows;
        var dots = l.dots;
        // Compile the interactive head/tail expressions once; each mousemove just
        // re-evaluates them against a fresh {x, y} scope (compile-once).
        const stripBraces = (s) => (s ? s.replace(/^\{/, '').replace(/\}$/, '').trim() : null);
        const compileOpt = (src) => {
            if (!src)
                return null;
            try {
                return (0, utils_1.parseExpression)(src);
            }
            catch (err) {
                console.warn('userline: could not parse expression:', err.message);
                return null;
            }
        };
        const xExp = compileOpt(stripBraces(m[7]));
        const yExp = compileOpt(stripBraces(m[8]));
        const xExp2 = compileOpt(stripBraces(m[9]));
        const yExp2 = compileOpt(stripBraces(m[10]));
        const variables = this.variables || {};
        const evalAt = (compiled, x, y) => compiled.evaluate(Object.assign({ x: x, y: y }, variables));
        var obj = {
            x1: utils_1.X.call(this, m[3]),
            y1: utils_1.Y.call(this, m[4]),
            x2: utils_1.X.call(this, m[5]),
            y2: utils_1.Y.call(this, m[6]),
            xExp: m[7],
            yExp: m[8],
            xExp2: m[9],
            yExp2: m[10],
            userx: (coords) => {
                var nx1 = utils_1.Xinv.call(this, coords[0]);
                var ny1 = utils_1.Yinv.call(this, coords[1]);
                try {
                    return utils_1.X.call(this, xExp ? evalAt(xExp, nx1, ny1) : 0);
                }
                catch (err) {
                    console.warn('Error evaluating userx expression:', err);
                    return utils_1.X.call(this, 0);
                }
            },
            usery: (coords) => {
                var nx2 = utils_1.Xinv.call(this, coords[0]);
                var ny2 = utils_1.Yinv.call(this, coords[1]);
                try {
                    return utils_1.Y.call(this, yExp ? evalAt(yExp, nx2, ny2) : 0);
                }
                catch (err) {
                    console.warn('Error evaluating usery expression:', err);
                    return utils_1.Y.call(this, 0);
                }
            },
            userx2: (coords) => {
                var nx3 = utils_1.Xinv.call(this, coords[0]);
                var ny3 = utils_1.Yinv.call(this, coords[1]);
                try {
                    return utils_1.X.call(this, xExp2 ? evalAt(xExp2, nx3, ny3) : 0);
                }
                catch (err) {
                    console.warn('Error evaluating userx2 expression:', err);
                    return utils_1.X.call(this, 0);
                }
            },
            usery2: (coords) => {
                var nx4 = utils_1.Xinv.call(this, coords[0]);
                var ny4 = utils_1.Yinv.call(this, coords[1]);
                try {
                    return utils_1.Y.call(this, yExp2 ? evalAt(yExp2, nx4, ny4) : 0);
                }
                catch (err) {
                    console.warn('Error evaluating usery2 expression:', err);
                    return utils_1.Y.call(this, 0);
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
            Object.assign(obj, (0, utils_1.parseOptions)(options));
        }
        // TODO: add regex
        if (typeof obj.linewidth === 'string') {
            obj.linewidth = parseLinewidth(obj.linewidth);
        }
        return obj;
    },
    rput(m) {
        return {
            x: utils_1.X.call(this, m[1]),
            y: utils_1.Y.call(this, m[2]),
            text: m[3]
        };
    },
    psset(m) {
        const pairs = m[1].split(',').map((pair) => pair.split('='));
        const obj = {};
        pairs.forEach((pair) => {
            const key = pair[0];
            const value = pair[1];
            Object.keys(settings_1.default.Expressions).forEach((setting) => {
                const exp = settings_1.default.Expressions[setting];
                if (key.match(exp)) {
                    settings_1.default.Functions[setting](obj, value);
                }
            });
        });
        return obj;
    },
    psdots(m) {
        var obj = {
            linecolor: 'black',
            dotstyle: 'dot',
            dotsize: 2,
            data: parseCoordList.call(this, m[2])
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        return obj;
    },
    psgrid(m) {
        var obj = {
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
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        // \psgrid[opts](x0,y0)(x1,y1) — defaults to the whole pspicture bounds.
        // coordsOpt outer groups: m[2]/m[5]/m[8] = '(x,y)' strings, m[3],m[4] etc.
        var has0 = m[3] !== undefined;
        var has1 = m[6] !== undefined;
        var x0 = has0 ? utils_1.X.call(this, m[3]) : utils_1.X.call(this, this.x0);
        var y0 = has0 ? utils_1.Y.call(this, m[4]) : utils_1.Y.call(this, this.y0);
        var x1 = has1 ? utils_1.X.call(this, m[6]) : utils_1.X.call(this, this.x1);
        var y1 = has1 ? utils_1.Y.call(this, m[7]) : utils_1.Y.call(this, this.y1);
        obj.x0 = Math.min(x0, x1);
        obj.y0 = Math.min(y0, y1);
        obj.x1 = Math.max(x0, x1);
        obj.y1 = Math.max(y0, y1);
        obj.xunit = this.xunit;
        obj.yunit = this.yunit;
        // The renderer numbers each line, which needs the picture coordinate the
        // device position stands for.
        obj.originX = utils_1.X.call(this, 0);
        obj.originY = utils_1.Y.call(this, 0);
        return obj;
    },
    psellipse(m) {
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2
        };
        var opts = m[0].match(/\[([^\]]*)\]/);
        if (opts)
            Object.assign(obj, (0, utils_1.parseOptions)(opts[1]));
        obj.cx = utils_1.X.call(this, m[1]);
        obj.cy = utils_1.Y.call(this, m[2]);
        obj.rx = Math.abs(Number(m[3])) * this.xunit;
        obj.ry = Math.abs(Number(m[4])) * this.yunit;
        return obj;
    },
    psbezier(m) {
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            linewidth: 2
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        obj.x1 = utils_1.X.call(this, m[2]);
        obj.y1 = utils_1.Y.call(this, m[3]);
        obj.x2 = utils_1.X.call(this, m[4]);
        obj.y2 = utils_1.Y.call(this, m[5]);
        obj.x3 = utils_1.X.call(this, m[6]);
        obj.y3 = utils_1.Y.call(this, m[7]);
        obj.x4 = utils_1.X.call(this, m[8]);
        obj.y4 = utils_1.Y.call(this, m[9]);
        return obj;
    },
    pscurve(m) {
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2,
            // Only psccurve wraps. psecurve is an open curve whose first and last
            // points are tangent controls rather than points it passes through.
            closed: /\\psccurve/.test(m[0]),
            endpoints: /\\psecurve/.test(m[0])
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        // first point is captured separately (m[2], m[3]); the rest follow
        obj.data = [utils_1.X.call(this, m[2]), utils_1.Y.call(this, m[3])].concat(parseCoordList.call(this, m[4] || ''));
        return obj;
    },
    psecurve(m) {
        return exports.Functions.pscurve.call(this, m);
    },
    psccurve(m) {
        return exports.Functions.pscurve.call(this, m);
    },
    pswedge(m) {
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            // PSTricks leaves every shape unfilled unless a fillstyle is
            // given or the starred form is used; an unstarred \psarc is an open
            // curve, not a solid black wedge.
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        obj.cx = utils_1.X.call(this, m[2]);
        obj.cy = utils_1.Y.call(this, m[3]);
        obj.r = Number(m[4]) * this.xunit;
        obj.angleA = (Number(m[5]) * Math.PI) / 180;
        obj.angleB = (Number(m[6]) * Math.PI) / 180;
        Object.assign(obj, arcEndpoints.call(this, m[2], m[3], m[4], obj.angleA, obj.angleB));
        return obj;
    },
    pscustom(m) {
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'black',
            linewidth: 2,
            body: m[2]
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
        return obj;
    },
    multido(m) {
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
function parseCoordList(coords) {
    var data = [];
    var re = new RegExp(utils_1.RE.coords, 'g');
    var m;
    while ((m = re.exec(coords)) !== null) {
        data.push(utils_1.X.call(this, m[1]));
        data.push(utils_1.Y.call(this, m[2]));
    }
    return data;
}
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions
};

},{"@latex2js/settings":23,"@latex2js/utils":25}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
exports.normalizeDialect = normalizeDialect;
const utils_1 = require("@latex2js/utils");
/**
 * Canonicalizes a declared dialect name.
 *
 * `mathapedia` is accepted as an alias for `latex2js`: the dialect belongs to
 * the renderer, while Mathapedia is a product built on it, so one canonical
 * name keeps comparisons simple without making authors learn which to write.
 *
 * @param value - the declared name, in any case
 * @returns the canonical dialect, or null when the name is not one we know
 */
function normalizeDialect(value) {
    const v = String(value ?? '').trim().toLowerCase();
    if (v === 'pstricks')
        return 'pstricks';
    if (v === 'latex2js' || v === 'mathapedia')
        return 'latex2js';
    return null;
}
exports.Expressions = {
    dialect: /^dialect$/,
    fillcolor: /^fillcolor$/,
    fillstyle: /^fillstyle$/,
    linecolor: /^linecolor$/,
    linestyle: /^linestyle$/,
    unit: /^unit/,
    runit: /^runit/,
    xunit: /^xunit/,
    yunit: /^yunit/
};
exports.Functions = {
    /**
     * Which language the document is written in.
     *
     * `pstricks` is the specification; `latex2js` (alias `mathapedia`) is this
     * project's superset — the interactive macros, infix plot bodies, natural-log
     * `log`, starred shapes honouring `fillcolor`. Declaring it is what makes the
     * extensions visible instead of indistinguishable from a bug.
     */
    dialect(o, v) {
        o.dialect = normalizeDialect(v);
    },
    fillcolor(o, v) {
        o.fillcolor = v;
    },
    fillstyle(o, v) {
        o.fillstyle = v;
    },
    linecolor(o, v) {
        o.linecolor = v;
    },
    linestyle(o, v) {
        o.linestyle = v;
    },
    unit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.unit = converted;
        o.runit = converted;
        o.xunit = converted;
        o.yunit = converted;
    },
    runit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.runit = converted;
    },
    xunit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.xunit = converted;
    },
    yunit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.yunit = converted;
    }
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions
};

},{"@latex2js/utils":25}],24:[function(require,module,exports){
"use strict";
/**
 * Algebraic expression parser + evaluator for PSTricks-style math.
 *
 * PSTricks `algebraic` expressions are NOT JavaScript: they use `^` for
 * power, allow implicit multiplication (`2x`, `2(x+1)`, `2sin(x)`), and rely
 * on bare math function names (`cos(x)`). This module parses an expression
 * once into an AST and compiles it to a JavaScript closure that can be
 * evaluated cheaply many times with a variable scope — exactly the
 * compile-once / evaluate-many pattern the interactive plot and userline
 * paths need.
 *
 * Supported syntax:
 *   numbers, identifiers (variables), arithmetic + - * / ^,
 *   unary minus/plus, implicit multiplication, parentheses,
 *   function calls (cos, sin, tan, atan, atan2, pow, sqrt, abs, exp, ln,
 *   log, floor, ceil, round, min, max, ...), comparisons (< > <= >= == !=),
 *   and ternary conditionals (cond ? a : b).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATH_CONSTANTS = exports.MATH_FUNCTIONS = exports.ExpressionError = void 0;
exports.parseExpression = parseExpression;
class ExpressionError extends Error {
    constructor(message, position) {
        // position is a 0-based offset; compute 1-based line/column lazily
        super(message);
        this.name = 'ExpressionError';
        this.position = position;
        this.line = 0;
        this.column = 0;
    }
}
exports.ExpressionError = ExpressionError;
const OPS = ['<=', '>=', '==', '!=', '<', '>', '?', ':', '+', '-', '*', '/', '^', ','];
const PARENS = new Set(['(', ')']);
function tokenize(source) {
    const tokens = [];
    let i = 0;
    const n = source.length;
    const numberRe = /^\d*\.?\d+(?:[eE][+-]?\d+)?/;
    const identRe = /^[a-zA-Z_][a-zA-Z0-9_]*/;
    while (i < n) {
        const ch = source[i];
        if (/\s/.test(ch)) {
            i++;
            continue;
        }
        // Unicode pi
        if (ch === 'π') {
            tokens.push({ type: 'ident', value: 'π', pos: i });
            i++;
            continue;
        }
        if (ch === '(' || ch === ')') {
            tokens.push({ type: 'paren', value: ch, pos: i });
            i++;
            continue;
        }
        const num = source.slice(i).match(numberRe);
        if (num) {
            tokens.push({ type: 'number', value: num[0], pos: i });
            i += num[0].length;
            continue;
        }
        const ident = source.slice(i).match(identRe);
        if (ident) {
            tokens.push({ type: 'ident', value: ident[0], pos: i });
            i += ident[0].length;
            continue;
        }
        const op = OPS.find((o) => source.startsWith(o, i));
        if (op) {
            tokens.push({ type: op === '(' || op === ')' ? 'paren' : 'op', value: op, pos: i });
            i += op.length;
            continue;
        }
        throw new ExpressionError(`unexpected character '${ch}'`, i);
    }
    tokens.push({ type: 'eof', value: '', pos: n });
    return tokens;
}
class Parser {
    constructor(source) {
        this.source = source;
        this.index = 0;
        this.tokens = tokenize(source);
        if (this.tokens.length <= 1) {
            throw new ExpressionError('empty expression', 0);
        }
    }
    peek() {
        return this.tokens[this.index];
    }
    next() {
        return this.tokens[this.index++];
    }
    expect(value) {
        const t = this.peek();
        if (t.value !== value) {
            throw new ExpressionError(`expected '${value}' but found '${t.value || 'end of input'}'`, t.pos);
        }
        return this.next();
    }
    parse() {
        const node = this.parseTernary();
        const t = this.peek();
        if (t.type !== 'eof') {
            throw new ExpressionError(`unexpected '${t.value}'`, t.pos);
        }
        return node;
    }
    parseTernary() {
        const cond = this.parseComparison();
        if (this.peek().value === '?') {
            this.next();
            const then = this.parseTernary();
            this.expect(':');
            const els = this.parseTernary();
            return { type: 'ternary', cond, then, els };
        }
        return cond;
    }
    parseComparison() {
        let left = this.parseAdditive();
        for (;;) {
            const op = this.peek().value;
            if (op === '<' || op === '>' || op === '<=' || op === '>=' || op === '==' || op === '!=') {
                this.next();
                const right = this.parseAdditive();
                left = { type: 'binary', op, left, right };
            }
            else {
                return left;
            }
        }
    }
    parseAdditive() {
        let left = this.parseMultiplicative();
        for (;;) {
            const op = this.peek().value;
            if (op === '+' || op === '-') {
                this.next();
                const right = this.parseMultiplicative();
                left = { type: 'binary', op, left, right };
            }
            else {
                return left;
            }
        }
    }
    parseMultiplicative() {
        let left = this.parseUnary();
        for (;;) {
            const op = this.peek().value;
            if (op === '*' || op === '/') {
                this.next();
                const right = this.parseUnary();
                left = { type: 'binary', op, left, right };
            }
            else if (this.isImplicitStart(this.peek())) {
                // implicit multiplication: 2x, 2(x+1), (x+1)(x+2), 2sin(x)
                const right = this.parseUnary();
                left = { type: 'binary', op: '*', left, right };
            }
            else {
                return left;
            }
        }
    }
    parseUnary() {
        const op = this.peek().value;
        if (op === '-' || op === '+') {
            this.next();
            return { type: 'unary', op, operand: this.parseUnary() };
        }
        return this.parsePower();
    }
    parsePower() {
        const left = this.parsePrimary();
        if (this.peek().value === '^') {
            this.next();
            const right = this.parseUnary(); // right-associative, binds tighter on the right
            return { type: 'binary', op: '^', left, right };
        }
        return left;
    }
    parsePrimary() {
        const t = this.peek();
        if (t.type === 'number') {
            this.next();
            return { type: 'number', value: t.value };
        }
        if (t.type === 'ident') {
            this.next();
            // a known math function followed by '(' is a function call
            if (this.peek().value === '(' && exports.MATH_FUNCTIONS.hasOwnProperty(t.value)) {
                this.next(); // consume '('
                const args = [];
                if (this.peek().value !== ')') {
                    args.push(this.parseTernary());
                    while (this.peek().value === ',') {
                        this.next();
                        args.push(this.parseTernary());
                    }
                }
                this.expect(')');
                return { type: 'call', name: t.value, args };
            }
            return { type: 'var', name: t.value };
        }
        if (t.value === '(') {
            this.next();
            const node = this.parseTernary();
            this.expect(')');
            return node;
        }
        throw new ExpressionError(`unexpected '${t.value || 'end of input'}' in expression`, t.pos);
    }
    /** A token that can start an implicit multiplication operand. */
    isImplicitStart(t) {
        return t.type === 'number' || t.type === 'ident' || t.value === '(';
    }
}
// ---------------------------------------------------------------------------
// Compile AST → JS closure
// ---------------------------------------------------------------------------
exports.MATH_FUNCTIONS = {
    cos: 'Math.cos',
    sin: 'Math.sin',
    tan: 'Math.tan',
    atan: 'Math.atan',
    atan2: 'Math.atan2',
    asin: 'Math.asin',
    acos: 'Math.acos',
    exp: 'Math.exp',
    ln: 'Math.log',
    log: 'Math.log',
    log10: 'Math.log10',
    sqrt: 'Math.sqrt',
    cbrt: 'Math.cbrt',
    abs: 'Math.abs',
    sign: 'Math.sign',
    floor: 'Math.floor',
    ceil: 'Math.ceil',
    round: 'Math.round',
    pow: 'Math.pow',
    min: 'Math.min',
    max: 'Math.max',
    sinh: 'Math.sinh',
    cosh: 'Math.cosh',
    tanh: 'Math.tanh',
};
exports.MATH_CONSTANTS = {
    pi: 'Math.PI',
    π: 'Math.PI',
    PI: 'Math.PI',
    // pst-plot's own spelling, used by \psplot expressions.
    Pi: 'Math.PI',
    E: 'Math.E',
};
function compileNode(node, variableNames) {
    switch (node.type) {
        case 'number':
            return node.value;
        case 'var': {
            if (exports.MATH_CONSTANTS.hasOwnProperty(node.name)) {
                return exports.MATH_CONSTANTS[node.name];
            }
            variableNames.add(node.name);
            return 'v.' + node.name;
        }
        case 'call': {
            const target = exports.MATH_FUNCTIONS.hasOwnProperty(node.name)
                ? exports.MATH_FUNCTIONS[node.name]
                : '(v.' + node.name + ')';
            return target + '(' + node.args.map((a) => compileNode(a, variableNames)).join(',') + ')';
        }
        case 'unary':
            return '(' + node.op + compileNode(node.operand, variableNames) + ')';
        case 'binary': {
            const op = node.op === '^' ? '**' : node.op;
            return '(' + compileNode(node.left, variableNames) + op + compileNode(node.right, variableNames) + ')';
        }
        case 'ternary':
            return ('(' +
                compileNode(node.cond, variableNames) +
                '?' +
                compileNode(node.then, variableNames) +
                ':' +
                compileNode(node.els, variableNames) +
                ')');
        default:
            throw new Error('unknown node type ' + node.type);
    }
}
/**
 * Parse an algebraic expression and compile it to an evaluable closure.
 * Throws ExpressionError with a character position on invalid syntax.
 */
function parseExpression(source) {
    const trimmed = source.trim();
    if (!trimmed) {
        throw new ExpressionError('empty expression', 0);
    }
    const parser = new Parser(trimmed);
    const ast = parser.parse();
    const variableNames = new Set();
    const js = compileNode(ast, variableNames);
    let fn;
    try {
        // eslint-disable-next-line no-new-func
        fn = new Function('v', 'return (' + js + ');');
    }
    catch (err) {
        throw new ExpressionError('could not compile expression: ' + err.message, 0);
    }
    return {
        source: trimmed,
        toJS: () => js,
        variables: () => Array.from(variableNames),
        evaluate: (scope) => fn(scope || {}),
    };
}

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATH_CONSTANTS = exports.MATH_FUNCTIONS = exports.ExpressionError = exports.parseExpression = exports.select = exports.SVGSelection = exports.dotType = exports.arrowType = exports.Yinv = exports.Y = exports.Xinv = exports.X = exports.evaluate = exports.parseArrows = exports.parseOptions = exports.resolveColor = exports.RE = exports.convertUnits = exports.matchrepl = exports.simplerepl = void 0;
const expression_1 = require("./expression");
const simplerepl = function (regex, replace) {
    return function (_m, contents) {
        return contents.replace(regex, replace);
    };
};
exports.simplerepl = simplerepl;
/**
 * Builds a text transform that rewrites each match through `callback`.
 *
 * The callback is invoked with the same receiver the transform was called with,
 * so a transform that needs document state — section numbering, say — can reach
 * it. Callbacks that do not care simply ignore `this`.
 */
const matchrepl = function (regex, callback) {
    return function (m, contents) {
        if (Array.isArray(m)) {
            m.forEach((match) => {
                var m2 = match.match(regex);
                contents = contents.replace(m2.input, callback.call(this, m2));
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
/** Option keys whose value names a colour. */
const COLOR_KEYS = ['linecolor', 'fillcolor', 'hatchcolor', 'gridcolor', 'bordercolor', 'shadowcolor', 'labelcolor'];
/**
 * Base colours xcolor mixes against, as RGB triples. Only the names that can
 * appear on the left of a `!` need resolving; every other colour is handed to
 * the browser unchanged, so plain names keep whatever CSS already gives them.
 */
const BASE_COLORS = {
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
const resolveColor = function (value) {
    const parts = String(value).split('!').map((p) => p.trim());
    if (parts.length < 2)
        return value;
    const rgb = (name) => BASE_COLORS[name.toLowerCase()] ?? null;
    let current = rgb(parts[0]);
    if (!current)
        return value;
    for (let i = 1; i < parts.length; i += 2) {
        const pct = Number(parts[i]);
        if (!isFinite(pct))
            return value;
        // An omitted second operand mixes against white, as xcolor does.
        const against = parts[i + 1] ? rgb(parts[i + 1]) : [255, 255, 255];
        if (!against)
            return value;
        const w = Math.max(0, Math.min(100, pct)) / 100;
        current = [
            Math.round(current[0] * w + against[0] * (1 - w)),
            Math.round(current[1] * w + against[1] * (1 - w)),
            Math.round(current[2] * w + against[2] * (1 - w)),
        ];
    }
    return 'rgb(' + current[0] + ',' + current[1] + ',' + current[2] + ')';
};
exports.resolveColor = resolveColor;
// OPTIONS
// converts [showorigin=false,labels=none, Dx=3.14] to {showorigin: 'false', labels: 'none', Dx: '3.14'}
const parseOptions = function (opts) {
    var options = opts.replace(/[\]\[]/g, '');
    var all = options.split(',');
    var obj = {};
    all.forEach((option) => {
        var kv = option.split('=');
        if (kv.length == 2) {
            const key = kv[0].trim();
            const value = kv[1].trim();
            obj[key] = COLOR_KEYS.indexOf(key) === -1 ? value : (0, exports.resolveColor)(value);
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
const evaluate = function (exp) {
    const num = Number(exp);
    if (!isNaN(num))
        return num;
    this.variables = this.variables || {};
    try {
        return getCompiled(exp).evaluate(this.variables);
    }
    catch (e) {
        console.warn('Evaluation error:', e.message);
        return NaN;
    }
};
exports.evaluate = evaluate;
// Small bounded cache so repeated identical expressions (e.g. plot bounds,
// slider-driven re-evaluation) skip re-parsing entirely.
const expressionCache = new Map();
const EXPRESSION_CACHE_MAX = 500;
function getCompiled(exp) {
    let compiled = expressionCache.get(exp);
    if (!compiled) {
        compiled = (0, expression_1.parseExpression)(exp);
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
const X = function (v) {
    const numV = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(numV))
        return NaN;
    if (isNaN(this.w) || isNaN(this.x1) || isNaN(this.xunit))
        return NaN;
    if (this.xunit <= 0)
        return NaN;
    const result = (this.w - (this.x1 - numV)) * this.xunit;
    if (!isFinite(result))
        return NaN;
    return Math.round(result * 100) / 100; // Round to 2 decimal places for pixel precision
};
exports.X = X;
const Xinv = function (v) {
    return Number(v) / this.xunit - this.w + this.x1;
};
exports.Xinv = Xinv;
/**
 * Picture y to device y, inverting the axis: SVG's y grows downward.
 *
 * Returns NaN for input it cannot transform, for the same reason as {@link X}.
 *
 * @param v - the coordinate in picture units
 * @returns the device coordinate, or NaN when it cannot be computed
 */
const Y = function (v) {
    const numV = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(numV))
        return NaN;
    if (isNaN(this.y1) || isNaN(this.yunit))
        return NaN;
    if (this.yunit <= 0)
        return NaN;
    const result = (this.y1 - numV) * this.yunit;
    if (!isFinite(result))
        return NaN;
    return Math.round(result * 100) / 100; // Round to 2 decimal places for pixel precision
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
var expression_2 = require("./expression");
Object.defineProperty(exports, "parseExpression", { enumerable: true, get: function () { return expression_2.parseExpression; } });
Object.defineProperty(exports, "ExpressionError", { enumerable: true, get: function () { return expression_2.ExpressionError; } });
Object.defineProperty(exports, "MATH_FUNCTIONS", { enumerable: true, get: function () { return expression_2.MATH_FUNCTIONS; } });
Object.defineProperty(exports, "MATH_CONSTANTS", { enumerable: true, get: function () { return expression_2.MATH_CONSTANTS; } });

},{"./expression":24,"./svg-utils":26}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGSelection = void 0;
exports.select = select;
class SVGSelection {
    constructor(elements) {
        if (elements instanceof Element) {
            this.elements = [elements];
        }
        else if (elements instanceof NodeList) {
            this.elements = Array.from(elements).filter((node) => node.nodeType === Node.ELEMENT_NODE);
        }
        else {
            this.elements = Array.isArray(elements) ? elements : [];
        }
    }
    append(tagName) {
        const newElements = [];
        this.elements.forEach(parent => {
            const elementName = tagName.startsWith('svg:') ? tagName.substring(4) : tagName;
            const element = document.createElementNS('http://www.w3.org/2000/svg', elementName);
            parent.appendChild(element);
            newElements.push(element);
        });
        return new SVGSelection(newElements);
    }
    attr(name, value) {
        this.elements.forEach(el => {
            el.setAttribute(name, String(value));
        });
        return this;
    }
    style(name, value) {
        this.elements.forEach(el => {
            if (el instanceof SVGElement || el instanceof HTMLElement) {
                el.style[name] = String(value);
            }
        });
        return this;
    }
    selectAll(selector) {
        const selected = [];
        this.elements.forEach(parent => {
            const found = parent.querySelectorAll(selector);
            selected.push(...Array.from(found));
        });
        return new SVGSelection(selected);
    }
    remove() {
        this.elements.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        return this;
    }
    on(event, handler) {
        this.elements.forEach(el => {
            el.addEventListener(event, handler);
        });
        return this;
    }
    node() {
        return this.elements[0] || null;
    }
    /**
     * Sets an element's text content.
     *
     * `textContent` is defined on every Element, so no narrowing is needed — and
     * testing `instanceof SVGTextElement` threw a ReferenceError outright in any
     * DOM that does not expose that constructor as a global, jsdom included.
     */
    text(content) {
        this.elements.forEach(el => {
            el.textContent = content;
        });
        return this;
    }
}
exports.SVGSelection = SVGSelection;
function select(selector) {
    if (typeof selector === 'string') {
        const element = document.querySelector(selector);
        return new SVGSelection(element ? [element] : []);
    }
    return new SVGSelection(selector);
}

},{}]},{},[8])(8)
});

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

},{"@latex2js/macros":14}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    const span = document.createElement('span');
    span.className = 'math';
    span.innerHTML = that.lines.join('\n');
    return span;
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    const span = document.createElement('span');
    span.className = 'math nicebox';
    span.innerHTML = that.lines.join('\n');
    return span;
}

},{}],5:[function(require,module,exports){
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

},{"@latex2js/pstricks":16,"@latex2js/utils":20}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    var pre = document.createElement('pre');
    pre.className = 'verbatim';
    pre.innerHTML = that.lines.join('\n');
    return pre;
}

},{}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.macros = exports.math = exports.verbatim = exports.enumerate = exports.nicebox = exports.pspicture = void 0;
exports.default = render;
const latex2js_1 = __importDefault(require("latex2js"));
const mathjaxjs_1 = require("mathjaxjs");
const pspicture_js_1 = __importDefault(require("./components/pspicture.js"));
exports.pspicture = pspicture_js_1.default;
const nicebox_js_1 = __importDefault(require("./components/nicebox.js"));
exports.nicebox = nicebox_js_1.default;
const enumerate_js_1 = __importDefault(require("./components/enumerate.js"));
exports.enumerate = enumerate_js_1.default;
const verbatim_js_1 = __importDefault(require("./components/verbatim.js"));
exports.verbatim = verbatim_js_1.default;
const math_js_1 = __importDefault(require("./components/math.js"));
exports.math = math_js_1.default;
const macros_1 = __importDefault(require("./components/macros"));
exports.macros = macros_1.default;
const ELEMENTS = { pspicture: pspicture_js_1.default, nicebox: nicebox_js_1.default, enumerate: enumerate_js_1.default, verbatim: verbatim_js_1.default, math: math_js_1.default, macros: macros_1.default };
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

},{"./components/enumerate.js":1,"./components/macros":2,"./components/math.js":3,"./components/nicebox.js":4,"./components/pspicture.js":5,"./components/verbatim.js":6,"latex2js":8,"mathjaxjs":15}],8:[function(require,module,exports){
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

},{"./lib/environments":9,"./lib/headers":10,"./lib/ignore":11,"./lib/parser":12,"./lib/text":13,"@latex2js/pstricks":16}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environments = ['pspicture', 'verbatim', 'enumerate', 'print', 'nicebox'];
exports.default = environments;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
exports.Expressions = {
    bq: /\\begin\{quotation\}/,
    claim: /\\begin\{claim\}/,
    corollary: /\\begin\{corollary\}/,
    definition: /\\begin\{definition\}/,
    endclaim: /\\end\{claim\}/,
    endcorallary: /\\end\{corallary\}/,
    enddefinition: /\\end\{definition\}/,
    endexample: /\\end\{example\}/,
    endproblem: /\\end\{problem\}/,
    endsolution: /\\end\{solution\}/,
    endtheorem: /\\end\{theorem\}/,
    eq: /\\end\{quotation\}/,
    example: /\\begin\{example\}/,
    problem: /\\begin\{problem\}/,
    proof: /\\begin\{proof\}/,
    qed: /\\end\{proof\}/,
    solution: /\\begin\{solution\}/,
    theorem: /\\begin\{theorem\}/
};
exports.Functions = {
    bq: () => '<p class="quotation">',
    claim: () => '<h4>Claim</h4>',
    corollary: () => '<h4>Corollary</h4>',
    definition: () => '<h4>Definition</h4>',
    endclaim: () => '',
    endcorollary: () => '',
    enddefinition: () => '',
    endexample: () => '',
    endproblem: () => '',
    endsolution: () => '',
    endtheorem: () => '',
    eq: () => '</p>',
    example: () => '<h4>Example</h4>',
    problem: () => '<h4>Problem</h4>',
    proof: () => '<h4>Proof</h4>',
    qed: () => '$\\qed$',
    solution: () => '<h4>Solution</h4>',
    theorem: () => '<h4>Theorem</h4>'
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions
};

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
    parse(text) {
        if (!text)
            return [];
        var lines = text.split('\n');
        this.parseEnvText(lines);
        this.parseEnv(lines);
        this.objects.forEach((obj) => {
            if (obj.type.match(/pspicture/)) {
                obj.plot = this.parsePSTricks(obj.lines, obj.env);
            }
        });
        return this.objects;
    }
    newEnvironment(type) {
        if (this.environment && this.environment.lines.length) {
            this.environment.settings = { ...this.settings };
            this.objects.push(this.environment);
        }
        this.environment = {
            type: type,
            lines: []
        };
    }
    pushLine(line) {
        var add = true;
        this.Ignore.forEach((exp) => {
            if (exp.test(line)) {
                add = false;
            }
        });
        if (add) {
            if (typeof line === 'string' && line.trim().length) {
                if (this.PSTricks.Expressions.psset.test(line)) {
                    this.parseUnits(line);
                }
                else {
                    this.environment.lines.push(line);
                }
            }
        }
    }
    parseUnits(line) {
        var m = line.match(this.PSTricks.Expressions.psset);
        Object.assign(this.settings, this.PSTricks.Functions.psset.call(this, m));
    }
    metaData(environment, line) {
        if (this.PSTricks.Expressions.hasOwnProperty(environment)) {
            this.environment.match = line.match(this.PSTricks.Expressions[environment]);
            this.environment.env = this.PSTricks.Functions[environment].call(this.settings, this.environment.match);
            if (environment.match(/pspicture/)) {
                if (typeof this.environment.env.xunit === 'undefined') {
                    this.environment.env.xunit = this.settings.xunit;
                }
                if (typeof this.environment.env.yunit === 'undefined') {
                    this.environment.env.yunit = this.settings.yunit;
                }
            }
        }
    }
    parseEnv(lines) {
        this.objects = [];
        this.environment = {
            type: 'math',
            lines: []
        };
        const Delimiters = this.Delimiters;
        lines.forEach((line) => {
            var isDelim = false;
            Object.entries(Delimiters).forEach(([env, type]) => {
                Object.entries(type).forEach(([k, delim]) => {
                    if (line.match(delim)) {
                        isDelim = true;
                        if (k.match(/begin/)) {
                            if (this.environment.type.match(/verbatim/)) {
                                isDelim = false;
                            }
                            else if (this.environment.type.match(/print/)) {
                                isDelim = false;
                            }
                            else {
                                this.newEnvironment(env);
                                this.metaData(env, line);
                            }
                        }
                        else if (k.match(/end/)) {
                            if (this.environment.type.match(/verbatim/)) {
                                if (env.match(/verbatim/)) {
                                    this.newEnvironment('math');
                                }
                                else {
                                    isDelim = false;
                                }
                            }
                            else if (this.environment.type.match(/print/)) {
                                if (env.match(/print/)) {
                                    this.newEnvironment('math');
                                }
                                else {
                                    isDelim = false;
                                }
                            }
                            else {
                                this.newEnvironment('math');
                            }
                        }
                    }
                });
            });
            if (!isDelim)
                this.pushLine(line); // }
        });
        // push last!
        this.newEnvironment('math');
    }
    parseEnvText(lines) {
        var _env = 'math';
        const Delimiters = this.Delimiters;
        lines.forEach((line, i) => {
            var isDelim = false;
            Object.entries(Delimiters).forEach(([env, type]) => {
                Object.entries(type).forEach(([k, delim]) => {
                    if (line.match(delim)) {
                        isDelim = true;
                        if (k.match(/begin/)) {
                            if (!_env.match(/verbatim/)) {
                                _env = env;
                            }
                            else {
                                isDelim = false;
                            }
                        }
                        else if (k.match(/end/)) {
                            if (!_env.match(/verbatim/)) {
                                _env = 'math';
                            }
                            else {
                                if (!env.match(/verbatim/)) {
                                    isDelim = false;
                                }
                                else {
                                    _env = 'math';
                                }
                            }
                        }
                    }
                });
            });
            if (!isDelim) {
                if (!_env.match(/verbatim/)) {
                    lines[i] = this.parseText(line);
                }
                if (!line.trim().length) {
                    lines[i] = '<br>';
                }
            }
        });
    }
    parsePSExpression(line, exp, plot, k, env) {
        var match = line.match(exp);
        if (match) {
            plot[k].push({
                data: this.PSTricks.Functions[k].call(env, match),
                env: env,
                match: match,
                fn: this.PSTricks.Functions[k]
            });
            return true;
        }
        return false;
    }
    parsePSVariables(line, exp, _plot, k, env) {
        var match = line.match(exp);
        if (match) {
            if (k.match(/uservariable/)) {
                var dd = this.PSTricks.Functions[k].call(env, match);
                env.variables = env.variables || {};
                env.variables[dd.name] = dd.value;
            }
        }
    }
    parsePSTricks(lines, env) {
        var plot = {};
        const entries = Object.entries(this.PSTricks.Expressions);
        entries.forEach(([k, _exp]) => {
            plot[k] = [];
        });
        lines.forEach((line) => {
            entries.forEach(([k, exp]) => {
                this.parsePSVariables(line, exp, plot, k, env);
                const result = this.parsePSExpression(line, exp, plot, k, env);
                if (result && k === 'psaxes' && plot[k].length > 0) {
                    const axesData = plot[k][plot[k].length - 1].data;
                    if (axesData && axesData.dx !== undefined) {
                        env.dx = axesData.dx;
                        env.dy = axesData.dy;
                        env.origin = axesData.origin;
                    }
                }
            });
        });
        return plot;
    }
    parseTextExpression(line, exp, k, contents) {
        var match = line.match(exp);
        if (match) {
            return this.Text.Functions[k].call(this, match, contents);
        }
        return contents;
    }
    parseHeadersExpression(line, exp, k, contents) {
        var match = line.match(exp);
        if (match) {
            return this.Headers.Functions[k].call(this);
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
}
exports.default = Parser;

},{}],13:[function(require,module,exports){
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
};
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
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions,
};

},{"@latex2js/utils":20}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMathJax = exports.getMathJax = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
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

},{"./lib/psgraph":17,"./lib/pstricks":18}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrow = arrow;
const utils_1 = require("@latex2js/utils");
function arrow(x1, y1, x2, y2) {
    var t = Math.PI / 6;
    var d = 8;
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
        svg
            .append('svg:circle')
            .attr('cx', this.cx)
            .attr('cy', this.cy)
            .attr('r', this.r)
            .style('stroke', 'black')
            .style('fill', 'none')
            .style('stroke-width', 2)
            .style('stroke-opacity', 1);
    },
    psplot(svg) {
        var context = [];
        context.push('M');
        if (this.fillstyle === 'solid') {
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
        if (this.fillstyle === 'solid') {
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
            .style('fill', this.fillstyle === 'none' ? 'none' : this.fillcolor)
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
            .style('fill', this.fillstyle === 'none' ? 'none' : this.fillcolor)
            .style('stroke', 'black');
    },
    psarc(svg) {
        var context = [];
        context.push('M');
        context.push(this.cx);
        context.push(this.cy);
        context.push('L');
        context.push(this.A.x);
        context.push(this.A.y);
        context.push('A');
        context.push(this.A.x);
        context.push(this.A.y);
        context.push(0);
        context.push(0);
        context.push(0);
        context.push(this.B.x);
        context.push(this.B.y);
        svg
            .append('svg:path')
            .attr('d', context.join(' '))
            .style('stroke-width', 2)
            .style('stroke-opacity', 1)
            .style('fill', 'blue')
            .style('stroke', 'black');
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
        }
        else if (this.ticks.match(/x/)) {
            xticks();
        }
        else if (this.ticks.match(/y/)) {
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
        Object.keys(this.plot).forEach((key) => {
            const plot = this.plot[key];
            if (key.match(/rput/))
                return;
            if (psgraph.hasOwnProperty(key)) {
                plot.forEach((data) => {
                    data.data.global = env;
                    psgraph[key].call(data.data, svg);
                });
            }
        });
        svg.on('touchmove', function (event) {
            event.preventDefault();
            var touch = event.touches ? event.touches[0] : null;
            var rect = event.target.getBoundingClientRect();
            var touchcoords = touch ? [touch.clientX - rect.left, touch.clientY - rect.top] : [0, 0];
            userEvent(touchcoords);
        });
        svg.on('mousemove', function (event) {
            var coords = [event.offsetX || 0, event.offsetY || 0];
            userEvent(coords);
        });
        const plots = this.plot;
        function userEvent(coords) {
            svg.selectAll('.userline').remove();
            svg.selectAll('.psplot').remove();
            var currentEnvironment = {};
            Object.entries(plots || {})
                .forEach(([k, plot]) => {
                if (k.match(/uservariable/)) {
                    plot.forEach((data) => {
                        data.env.userx = coords[0];
                        data.env.usery = coords[1];
                        var dd = data.fn.call(data.env, data.match);
                        currentEnvironment[data.data.name] = dd.value;
                    });
                }
            });
            Object.entries(plots || {})
                .forEach(([k, plot]) => {
                if (k.match(/psplot/)) {
                    plot.forEach((data) => {
                        Object.entries(currentEnvironment || {})
                            .forEach(([name, variable]) => {
                            data.env.variables[name] = variable;
                        });
                        var d = data.fn.call(data.env, data.match);
                        d.global = {};
                        Object.assign(d.global, env);
                        psgraph[k].call(d, svg);
                    });
                }
                if (k.match(/userline/)) {
                    plot.forEach((data) => {
                        var d = data.fn.call(data.env, data.match);
                        data.env.x2 = coords[0];
                        data.env.y2 = coords[1];
                        data.data.x2 = data.env.x2;
                        data.data.y2 = data.env.y2;
                        if (data.data.xExp2) {
                            data.data.x2 = d.userx2(coords);
                            data.data.x1 = d.userx(coords);
                        }
                        else if (data.data.xExp) {
                            data.data.x2 = d.userx(coords);
                        }
                        if (data.data.yExp2) {
                            data.data.y2 = d.usery2(coords);
                            data.data.y1 = d.usery(coords);
                        }
                        else if (data.data.yExp) {
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

},{"@latex2js/utils":20}],18:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
const utils_1 = require("@latex2js/utils");
const settings_1 = __importDefault(require("@latex2js/settings"));
exports.Expressions = {
    pspicture: /\\begin\{pspicture\}\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psframe: /\\psframe\(\s*(.*),(.*)\s*\)\(\s*(.*),(.*)\s*\)/,
    psplot: /\\psplot(\[[^\]]*\])?\{([^\}]*)\}\{([^\}]*)\}\{([^\}]*)\}/,
    psarc: new RegExp('\\\\psarc' +
        utils_1.RE.options +
        utils_1.RE.type +
        utils_1.RE.coords +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle +
        utils_1.RE.squiggle),
    pscircle: /\\pscircle.*\(\s*(.*),(.*)\s*\)\{(.*)\}/,
    pspolygon: new RegExp('\\\\pspolygon' + utils_1.RE.options + '(.*)'),
    psaxes: new RegExp('\\\\psaxes' +
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
    psline: new RegExp('\\\\psline' + utils_1.RE.options + utils_1.RE.type + utils_1.RE.coords + utils_1.RE.coordsOpt),
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
    psset: /\\psset\{(.*)\}/
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
            x1: utils_1.X.call(this, m[1]),
            y1: utils_1.Y.call(this, m[2]),
            x2: utils_1.X.call(this, m[3]),
            y2: utils_1.Y.call(this, m[4])
        };
        return obj;
    },
    pscircle(m) {
        var obj = {
            cx: utils_1.X.call(this, m[1]),
            cy: utils_1.Y.call(this, m[2]),
            r: this.xunit * m[3]
        };
        return obj;
    },
    psaxes(m) {
        var obj = {
            dx: 1 * this.xunit,
            dy: 1 * this.yunit,
            arrows: [0, 0],
            dots: [0, 0],
            ticks: 'all'
        };
        if (m[1]) {
            var options = (0, utils_1.parseOptions)(m[1]);
            if (options.Dx) {
                obj.dx = Number(options.Dx) * this.xunit;
            }
            if (options.Dy) {
                obj.dy = Number(options.Dy) * this.yunit;
            }
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
        // get env
        var expression = '';
        Object.entries(this.variables || {}).forEach(([name, val]) => {
            expression += 'var ' + name + ' = ' + val + ';';
        });
        const mathFunctions = 'var cos=Math.cos,sin=Math.sin,tan=Math.tan,atan=Math.atan,atan2=Math.atan2,exp=Math.exp,log=Math.log,sqrt=Math.sqrt,abs=Math.abs,floor=Math.floor,ceil=Math.ceil,round=Math.round,pow=Math.pow,PI=Math.PI,E=Math.E;';
        expression += mathFunctions + 'return ' + m[4] + ';';
        for (x = startX; x <= endX; x += 0.005) {
            data.push(utils_1.X.call(this, x));
            try {
                const evalFunc = new Function('x', expression);
                const yValue = evalFunc(x);
                if (yValue !== undefined && !isNaN(yValue)) {
                    data.push(utils_1.Y.call(this, yValue));
                }
                else {
                    data.push(utils_1.Y.call(this, 0));
                }
            }
            catch (err) {
                data.push(utils_1.Y.call(this, 0)); // fallback value
            }
        }
        var obj = {
            linecolor: 'black',
            linestyle: 'solid',
            fillstyle: 'none',
            fillcolor: 'none',
            linewidth: 2
        };
        if (m[1])
            Object.assign(obj, (0, utils_1.parseOptions)(m[1]));
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
            fillstyle: 'solid',
            fillcolor: 'black',
            linewidth: 2,
            arrows: arrows,
            dots: dots,
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
        obj.A = {
            x: utils_1.X.call(this, Number(m[5]) * Math.cos(obj.angleA)),
            y: utils_1.Y.call(this, Number(m[5]) * Math.sin(obj.angleA))
        };
        obj.B = {
            x: utils_1.X.call(this, Number(m[5]) * Math.cos(obj.angleB)),
            y: utils_1.Y.call(this, Number(m[5]) * Math.sin(obj.angleB))
        };
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
            dots: dots
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
            obj.linewidth = 2;
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
        var expx1 = 'var x = ' + nx1 + ';';
        var expy1 = 'var y = ' + ny1 + ';';
        // return X.call(this, eval(expy1 + expx1 + xExp));
        var obj = {
            name: m[2],
            x: utils_1.X.call(this, m[3]),
            y: utils_1.Y.call(this, m[4]),
            func: m[5],
            value: (() => {
                try {
                    const mathFunctions = 'var cos=Math.cos,sin=Math.sin,tan=Math.tan,atan=Math.atan,atan2=Math.atan2,exp=Math.exp,log=Math.log,sqrt=Math.sqrt,abs=Math.abs,floor=Math.floor,ceil=Math.ceil,round=Math.round,pow=Math.pow,PI=Math.PI,E=Math.E;';
                    const evalFunc = new Function('', mathFunctions + expx1 + expy1 + 'return ' + m[5]);
                    return evalFunc();
                }
                catch (err) {
                    console.warn('Error evaluating uservariable expression:', err);
                    return 0;
                }
            })()
        };
        return obj;
    },
    userline(m) {
        var options = m[1];
        // WE ARENT USING THIS YET!!!! e.g., [linecolor=green]
        var lineType = m[2];
        var l = (0, utils_1.parseArrows)(lineType);
        var arrows = l.arrows;
        var dots = l.dots;
        var xExp = m[7];
        var yExp = m[8];
        const mathFunctions = 'var cos=Math.cos,sin=Math.sin,tan=Math.tan,atan=Math.atan,atan2=Math.atan2,exp=Math.exp,log=Math.log,sqrt=Math.sqrt,abs=Math.abs,floor=Math.floor,ceil=Math.ceil,round=Math.round,pow=Math.pow,PI=Math.PI,E=Math.E;';
        if (xExp)
            xExp = mathFunctions + xExp.replace(/^\{/, '').replace(/\}$/, '');
        if (yExp)
            yExp = mathFunctions + yExp.replace(/^\{/, '').replace(/\}$/, '');
        var xExp2 = m[9];
        var yExp2 = m[10];
        if (xExp2)
            xExp2 = mathFunctions + xExp2.replace(/^\{/, '').replace(/\}$/, '');
        if (yExp2)
            yExp2 = mathFunctions + yExp2.replace(/^\{/, '').replace(/\}$/, '');
        var expression = '';
        Object.entries(this.variables || {}).forEach(([name, val]) => {
            expression += 'var ' + name + ' = ' + val + ';';
        });
        var obj = {
            x1: utils_1.X.call(this, m[3]),
            y1: utils_1.Y.call(this, m[4]),
            x2: utils_1.X.call(this, m[5]),
            y2: utils_1.Y.call(this, m[6]),
            xExp: xExp,
            yExp: yExp,
            xExp2: xExp2,
            yExp2: yExp2,
            userx: (coords) => {
                var nx1 = utils_1.Xinv.call(this, coords[0]);
                var ny1 = utils_1.Yinv.call(this, coords[1]);
                var expx1 = 'var x = ' + nx1 + ';';
                var expy1 = 'var y = ' + ny1 + ';';
                try {
                    const cleanExp = xExp ? xExp.replace(/^var cos=Math\.cos[^;]*;/, '') : '0';
                    const evalFunc = new Function('', mathFunctions + expression + expy1 + expx1 + 'return (' + cleanExp + ')');
                    return utils_1.X.call(this, evalFunc());
                }
                catch (err) {
                    console.warn('Error evaluating userx expression:', err);
                    return utils_1.X.call(this, 0);
                }
            },
            usery: (coords) => {
                var nx2 = utils_1.Xinv.call(this, coords[0]);
                var ny2 = utils_1.Yinv.call(this, coords[1]);
                var expx2 = 'var x = ' + nx2 + ';';
                var expy2 = 'var y = ' + ny2 + ';';
                try {
                    const cleanExp = yExp ? yExp.replace(/^var cos=Math\.cos[^;]*;/, '') : '0';
                    const evalFunc = new Function('', mathFunctions + expression + expy2 + expx2 + 'return (' + cleanExp + ')');
                    return utils_1.Y.call(this, evalFunc());
                }
                catch (err) {
                    console.warn('Error evaluating usery expression:', err);
                    return utils_1.Y.call(this, 0);
                }
            },
            userx2: (coords) => {
                var nx3 = utils_1.Xinv.call(this, coords[0]);
                var ny3 = utils_1.Yinv.call(this, coords[1]);
                var expx3 = 'var x = ' + nx3 + ';';
                var expy3 = 'var y = ' + ny3 + ';';
                try {
                    const cleanExp = xExp2 ? xExp2.replace(/^var cos=Math\.cos[^;]*;/, '') : '0';
                    const evalFunc = new Function('', mathFunctions + expression + expy3 + expx3 + 'return (' + cleanExp + ')');
                    return utils_1.X.call(this, evalFunc());
                }
                catch (err) {
                    console.warn('Error evaluating userx2 expression:', err);
                    return utils_1.X.call(this, 0);
                }
            },
            usery2: (coords) => {
                var nx4 = utils_1.Xinv.call(this, coords[0]);
                var ny4 = utils_1.Yinv.call(this, coords[1]);
                var expx4 = 'var x = ' + nx4 + ';';
                var expy4 = 'var y = ' + ny4 + ';';
                try {
                    const cleanExp = yExp2 ? yExp2.replace(/^var cos=Math\.cos[^;]*;/, '') : '0';
                    const evalFunc = new Function('', mathFunctions + expression + expy4 + expx4 + 'return (' + cleanExp + ')');
                    return utils_1.Y.call(this, evalFunc());
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
            obj.linewidth = 2;
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
    }
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions
};

},{"@latex2js/settings":19,"@latex2js/utils":20}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
const utils_1 = require("@latex2js/utils");
exports.Expressions = {
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

},{"@latex2js/utils":20}],20:[function(require,module,exports){
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
    const mathKeys = Object.keys(Math);
    const varKeys = Object.keys(this.variables);
    const allKeys = [...mathKeys, ...varKeys];
    const allValues = [
        ...mathKeys.map(k => Math[k]),
        ...varKeys.map(k => this.variables[k])
    ];
    try {
        // @ts-ignore
        const fn = new Function(...allKeys, `return (${exp});`);
        return fn(...allValues);
    }
    catch (e) {
        console.warn('Evaluation error:', e);
        return NaN;
    }
};
exports.evaluate = evaluate;
const X = function (v) {
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
exports.X = X;
const Xinv = function (v) {
    return Number(v) / this.xunit - this.w + this.x1;
};
exports.Xinv = Xinv;
const Y = function (v) {
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

},{"./svg-utils":21}],21:[function(require,module,exports){
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
    text(content) {
        this.elements.forEach(el => {
            if (el instanceof SVGTextElement || el instanceof HTMLElement) {
                el.textContent = content;
            }
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

},{}]},{},[7])(7)
});

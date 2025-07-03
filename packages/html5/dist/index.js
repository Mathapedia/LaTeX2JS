"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.macros = exports.math = exports.verbatim = exports.enumerate = exports.nicebox = exports.pspicture = void 0;
exports.default = render;
const latex2js_1 = __importDefault(require("latex2js"));
const mathjax_1 = require("@latex2js/mathjax");
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
    if ((0, mathjax_1.getMathJax)()) {
        return done();
    }
    (0, mathjax_1.loadMathJax)(done);
}
const init = () => {
    (0, mathjax_1.loadMathJax)();
    document.querySelectorAll('script[type="text/latex"]').forEach((el) => {
        render(el.innerHTML, (div) => {
            if (el.parentNode) {
                el.parentNode.insertBefore(div, el.nextSibling);
            }
        });
    });
};
exports.init = init;

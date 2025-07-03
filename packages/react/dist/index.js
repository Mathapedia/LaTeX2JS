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
exports.LaTeX = exports.macros = exports.math = exports.verbatim = exports.enumerate = exports.nicebox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const { Component, createElement } = React;
const latex2js_1 = __importDefault(require("latex2js"));
const mathjax_1 = require("@latex2js/mathjax");
const nicebox_1 = __importDefault(require("./components/nicebox"));
exports.nicebox = nicebox_1.default;
const enumerate_1 = __importDefault(require("./components/enumerate"));
exports.enumerate = enumerate_1.default;
const verbatim_1 = __importDefault(require("./components/verbatim"));
exports.verbatim = verbatim_1.default;
const math_1 = __importDefault(require("./components/math"));
exports.math = math_1.default;
const macros_1 = __importDefault(require("./components/macros"));
exports.macros = macros_1.default;
const ELEMENTS = { nicebox: nicebox_1.default, enumerate: enumerate_1.default, verbatim: verbatim_1.default, math: math_1.default, macros: macros_1.default };
class LaTeX extends Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.typesetMath = () => {
            const mathJax = (0, mathjax_1.getMathJax)();
            if (mathJax && mathJax.typesetPromise && this.containerRef.current) {
                mathJax.typesetPromise([this.containerRef.current]).catch((err) => {
                    console.error('MathJax typesetting failed:', err);
                });
            }
        };
        this.state = {
            mathJaxLoaded: false
        };
        this.onLoad = this.onLoad.bind(this);
    }
    componentDidMount() {
        if ((0, mathjax_1.getMathJax)()) {
            this.onLoad();
        }
        else {
            (0, mathjax_1.loadMathJax)(this.onLoad);
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.content !== this.props.content && this.state.mathJaxLoaded) {
            this.typesetMath();
        }
    }
    onLoad() {
        this.setState({
            mathJaxLoaded: true
        }, () => {
            this.typesetMath();
        });
    }
    render() {
        if (!this.state.mathJaxLoaded) {
            return (0, jsx_runtime_1.jsx)("div", { className: "latex-container", children: "Loading..." });
        }
        const latex = new latex2js_1.default();
        const parsed = latex.parse(this.props.content);
        const children = [];
        parsed &&
            parsed.forEach &&
            parsed.forEach((el) => {
                if (ELEMENTS.hasOwnProperty(el.type)) {
                    const elementType = el.type;
                    const Component = ELEMENTS[elementType];
                    children.push(createElement(Component, { ...el, key: children.length }));
                }
            });
        return (0, jsx_runtime_1.jsx)("div", { className: "latex-container", ref: this.containerRef, children: children });
    }
}
exports.LaTeX = LaTeX;
exports.default = LaTeX;

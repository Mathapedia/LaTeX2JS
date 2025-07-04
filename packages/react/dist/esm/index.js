import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
const { Component, createElement } = React;
import LaTeX2HTML5 from 'latex2js';
import { getMathJax, loadMathJax } from '@latex2js/mathjax';
import nicebox from './components/nicebox';
import enumerate from './components/enumerate';
import verbatim from './components/verbatim';
import math from './components/math';
import macros from './components/macros';
const ELEMENTS = { nicebox, enumerate, verbatim, math, macros };
export { nicebox, enumerate, verbatim, math, macros };
export class LaTeX extends Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.typesetMath = () => {
            const mathJax = getMathJax();
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
        if (getMathJax()) {
            this.onLoad();
        }
        else {
            loadMathJax(this.onLoad);
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
            return _jsx("div", { className: "latex-container", children: "Loading..." });
        }
        const latex = new LaTeX2HTML5();
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
        return _jsx("div", { className: "latex-container", ref: this.containerRef, children: children });
    }
}
export default LaTeX;

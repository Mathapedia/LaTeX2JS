import * as React from 'react';
const { Component, createElement } = React;
import LaTeX2HTML5 from 'latex2js';
import macroStr from '@latex2js/macros';

import nicebox from './components/nicebox';
import enumerate from './components/enumerate';
import verbatim from './components/verbatim';
import math from './components/math';
import macros from './components/macros';
import pspicture from './components/pspicture';
import slider from './components/slider';

import { getMathJax, loadMathJax } from 'mathjaxjs';
import { MathJaxProvider } from 'mathjaxjs-react';

const ELEMENTS = { nicebox, enumerate, itemize: enumerate, description: enumerate, verbatim, math, macros, pspicture, slider };

export { nicebox, enumerate, verbatim, math, macros, pspicture, slider, MathJaxProvider };

interface LaTeXProps {
  content: string;
}

interface LaTeXState {
  mathJaxLoaded: boolean;
}

export class LaTeX extends Component<LaTeXProps, LaTeXState> {
  private containerRef = React.createRef<HTMLDivElement>();
  private parsedContent: string | null = null;
  private parsed: any = null;
  private children: React.ReactElement[] = [];

  constructor(props: LaTeXProps) {
    super(props);
    this.state = {
      mathJaxLoaded: false
    };
  }

  componentDidMount() {
    loadMathJax(() => {
      this.setState({ mathJaxLoaded: true });
    });
  }

  componentDidUpdate() {
    if (this.state.mathJaxLoaded) {
      this.typesetMath();
    }
  }

  typesetMath = () => {
    const mathJax = getMathJax();
    if (mathJax && mathJax.typesetPromise && this.containerRef.current) {
      mathJax.typesetPromise([this.containerRef.current]).catch((err: any) => {
        console.error('MathJax typesetting failed:', err);
      });
    }
  };

  render() {
    if (!this.state.mathJaxLoaded) {
      return <div className="latex-container">Loading...</div>;
    }

    if (this.parsedContent !== this.props.content) {
      const latex = new LaTeX2HTML5();
      this.parsed = latex.parse(this.props.content);
      this.parsedContent = this.props.content;

      this.children = [];
      this.parsed &&
        this.parsed.forEach &&
        this.parsed.forEach((el: any) => {
          if (ELEMENTS.hasOwnProperty(el.type)) {
            const elementType = el.type as keyof typeof ELEMENTS;
            const Component = ELEMENTS[elementType];
            this.children.push(createElement(Component as any, { ...el, key: this.children.length }));
          }
        });
    }

    return (
      <div className="latex-container" ref={this.containerRef}>
        {/* The default macro set (\R, \bydef, transform pairs, …) has to be in
            the typeset container ahead of the content so MathJax's newcommand
            package defines them before any math that uses them — the same
            hidden-div approach the html5 and vue renderers use. */}
        <div className="latex-macros" style={{ display: 'none' }}>{macroStr}</div>
        {this.children}
      </div>
    );
  }
}
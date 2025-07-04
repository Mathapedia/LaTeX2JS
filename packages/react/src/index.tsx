import * as React from 'react';
const { Component, createElement } = React;
import LaTeX2HTML5 from 'latex2js';

import nicebox from './components/nicebox';
import enumerate from './components/enumerate';
import verbatim from './components/verbatim';
import math from './components/math';
import macros from './components/macros';
import pspicture from './components/pspicture';
import slider from './components/slider';
import MathJaxProvider from './components/MathJaxProvider';

const ELEMENTS = { nicebox, enumerate, verbatim, math, macros, pspicture, slider };

export { nicebox, enumerate, verbatim, math, macros, pspicture, slider, MathJaxProvider };

interface LaTeXProps {
  content: string;
}

interface LaTeXState {
  mathJaxLoaded: boolean;
}

export class LaTeX extends Component<LaTeXProps, LaTeXState> {
  private containerRef = React.createRef<HTMLDivElement>();

  constructor(props: LaTeXProps) {
    super(props);
    this.state = {
      mathJaxLoaded: false
    };
    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    this.onLoad();
  }

  componentDidUpdate(prevProps: LaTeXProps) {
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

  typesetMath = () => {
    if (window.MathJax && window.MathJax.typesetPromise && this.containerRef.current) {
      window.MathJax.typesetPromise([this.containerRef.current]).catch((err: any) => {
        console.error('MathJax typesetting failed:', err);
      });
    }
  };

  render() {
    if (!this.state.mathJaxLoaded) {
      return <div className="latex-container">Loading...</div>;
    }

    const latex = new LaTeX2HTML5();
    const parsed = latex.parse(this.props.content);

    const children: React.ReactElement[] = [];

    parsed &&
      parsed.forEach &&
      parsed.forEach((el: any) => {
        if (ELEMENTS.hasOwnProperty(el.type)) {
          const elementType = el.type as keyof typeof ELEMENTS;
          const Component = ELEMENTS[elementType];
          children.push(createElement(Component as any, { ...el, key: children.length }));
        }
      });

    return <div className="latex-container" ref={this.containerRef}>{children}</div>;
  }
}

export default LaTeX;

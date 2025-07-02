import { Component, createElement } from 'react';
import LaTeX2JS from 'latex2js';
import { getMathJax, loadMathJax } from '@latex2js/mathjax';

import pspicture from './components/pspicture';
import nicebox from './components/nicebox';
import enumerate from './components/enumerate';
import verbatim from './components/verbatim';
import math from './components/math';
import macros from './components/macros';

const ELEMENTS = { pspicture, nicebox, enumerate, verbatim, math, macros };

export { pspicture, nicebox, enumerate, verbatim, math, macros };

interface LaTeXProps {
  content: string;
}

interface LaTeXState {
  loaded?: boolean;
}

export class LaTeX extends Component<LaTeXProps, LaTeXState> {
  constructor(props: LaTeXProps) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    if (getMathJax()) {
      this.onLoad();
    }
    loadMathJax(this.onLoad);
  }

  onLoad() {
    this.setState({
      loaded: true
    });
  }

  render() {
    if (!getMathJax()) return <div className="latex-container">loading...</div>;

    const latex = new LaTeX2JS();
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

    return <div className="latex-container">{children}</div>;
  }
}

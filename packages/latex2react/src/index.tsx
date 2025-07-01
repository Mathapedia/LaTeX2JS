import React, { Component, createElement } from 'react';
import LaTeX2JS from 'latex2js';
import { getMathJax, loadMathJax } from 'latex2js-mathjax';

import pspicture from './components/pspicture';
import nicebox from './components/nicebox';
import enumerate from './components/enumerate';
import verbatim from './components/verbatim';
import slider from './components/slider';
import math from './components/math';
import macros from './components/macros';

const ELEMENTS = { pspicture, nicebox, enumerate, verbatim, math, macros };

export { pspicture, nicebox, enumerate, verbatim, math, macros };

export class LaTeX extends Component {
  constructor(props) {
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

    const children = [];

    parsed &&
      parsed.forEach &&
      parsed.forEach((el) => {
        if (ELEMENTS.hasOwnProperty(el.type)) {
          children.push(createElement(ELEMENTS[el.type], el));
        }
      });

    return <div className="latex-container">{children}</div>;
  }
}

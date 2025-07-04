'use client';

import { MathJaxProvider } from '@latex2js/mathjax';
import { tex } from './tex';
import * as React from 'react';
const { Component, createElement } = React;

import { getMathJax, loadMathJax } from '@latex2js/mathjax';
import LaTeX2HTML5 from 'latex2js';

import nicebox from '../components/nicebox';
import enumerate from '../components/enumerate';
import verbatim from '../components/verbatim';
import math from '../components/math';
import macros from '../components/macros';
import pspicture from '../components/pspicture';

const ELEMENTS = { nicebox, enumerate, verbatim, math, macros, pspicture };

interface LaTeXProps {
  content: string;
}

interface LaTeXState {
  mathJaxLoaded: boolean;
}

class LaTeX extends Component<LaTeXProps, LaTeXState> {
  private containerRef = React.createRef<HTMLDivElement>();

  constructor(props: LaTeXProps) {
    super(props);
    this.state = {
      mathJaxLoaded: false
    };
    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    if (getMathJax()) {
      this.onLoad();
    } else {
      loadMathJax(this.onLoad);
    }
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

    const latex = new LaTeX2HTML5();
    const parsed = latex.parse(this.props.content);

    console.log('Parsed LaTeX elements:', parsed);
    if (parsed && parsed.length > 0) {
      console.log('All element types:', parsed.map((el: any) => el.type));
      parsed.forEach((el: any, index: number) => {
        console.log(`Element ${index}:`, el.type, Object.keys(el));
        if (el.type === 'pspicture') {
          console.log('Pspicture element details:', el);
          console.log('Pspicture env:', el.env);
          console.log('Pspicture settings:', el.settings);
          console.log('Pspicture plot:', el.plot);
        }
      });
    }

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

export default function Home() {

  return (
    <MathJaxProvider className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">LaTeX2JS Demo</h1>
        <p className="text-lg text-gray-600">
          MathJax equations and LaTeX graphics integration
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Basic Mathematics</h2>
          <p>When $a \ne 0$, there are two solutions to $ax^2 + bx + c = 0$:</p>
          <div className="text-center my-4">
            $$x = \frac{"{-b \pm \sqrt{b^2-4ac}}"}{"{2a}"}$$
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Famous Integrals</h2>
          <p>Some inline math: $E = mc^2$ and $\nabla \cdot \mathbf{"{E}"} = \frac{"{\\rho}"}{"{\\epsilon_0}"}$</p>
          <div className="text-center my-4">
            $$\int_{"{-\\infty}"}^{"{\\infty}"} e^{"{-x^2}"} dx = \sqrt{"{\\pi}"}$$
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Series and Summations</h2>
          <div className="text-center my-4">
            $$\sum_{"{n=1}"}^{"{\\infty}"} \frac{"{1}"}{"{n^2}"} = \frac{"{\\pi^2}"}{"{6}"}$$
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Interactive LaTeX Graphics</h2>
          <div className="my-4">
            <LaTeX content={tex} />
          </div>
        </div>
      </main>
    </MathJaxProvider>
  );
}

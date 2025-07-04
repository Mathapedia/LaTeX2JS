'use client';

import { MathJaxProvider } from '@latex2js/mathjax-react';
import { tex } from './tex';
import * as React from 'react';
const { Component, createElement } = React;

import { getMathJax, loadMathJax } from 'mathjaxjs';
// import LaTeX2HTML5 from 'latex2js'; // Temporarily disabled due to text.js import issue

const TestSVGComponent = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  React.useEffect(() => {
    if (svgRef.current) {
      const { select } = require('@latex2js/utils');
      const svg = select(svgRef.current);
      
      svg.selectAll('*').remove();
      
      svg.append('svg:line')
        .attr('x1', 10)
        .attr('y1', 10)
        .attr('x2', 100)
        .attr('y2', 100)
        .style('stroke', 'blue')
        .style('stroke-width', 2);
        
      svg.append('svg:circle')
        .attr('cx', 50)
        .attr('cy', 50)
        .attr('r', 20)
        .style('fill', 'red')
        .style('stroke', 'black');
        
      console.log('SVG utility test completed');
    }
  }, []);
  
  return (
    <svg ref={svgRef} width="200" height="200" style={{ border: '1px solid #ccc' }}>
    </svg>
  );
};

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

const LaTeXComponent: React.FC<LaTeXProps> = ({ content }) => {
  const [parsedElements, setParsedElements] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const parseContent = async () => {
      try {
        const { default: LaTeX2JS } = await import('latex2js');
        const parser = new LaTeX2JS();
        
        const parsed = parser.parse(content);
        console.log('Parsed LaTeX content:', parsed);
        
        setParsedElements(parsed || []);
      } catch (error) {
        console.error('Error parsing LaTeX content:', error);
        setParsedElements([]);
      } finally {
        setIsLoading(false);
      }
    };

    parseContent();
  }, [content]);

  if (isLoading) {
    return <div>Loading LaTeX graphics...</div>;
  }

  if (!parsedElements.length) {
    return <div>No LaTeX elements to render</div>;
  }

  return (
    <div>
      {parsedElements.map((element, index) => {
        const Component = ELEMENTS[element.type as keyof typeof ELEMENTS];
        if (!Component) {
          console.warn(`Unknown element type: ${element.type}`);
          return <div key={index}>Unknown element: {element.type}</div>;
        }
        return React.createElement(Component as any, { key: index, ...element });
      })}
    </div>
  );
};

const SVGUtilityTest = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">SVG Utility Test</h2>
      <p className="mb-4">Testing custom D3-like SVG utility with chaining syntax:</p>
      <TestSVGComponent />
      <div className="mt-4 text-sm text-gray-600">
        <p>• Blue line from (10,10) to (100,100)</p>
        <p>• Red circle at (50,50) with radius 20</p>
        <p>• Check browser console for "SVG utility test completed" message</p>
      </div>
    </div>
  );
};

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

        <SVGUtilityTest />
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">LaTeX Graphics Test</h2>
          <p className="mb-4">Testing LaTeX graphics rendering with custom SVG utility:</p>
          <div className="my-4">
            <LaTeXComponent content={tex} />
          </div>
        </div>
      </main>
    </MathJaxProvider>
  );
}

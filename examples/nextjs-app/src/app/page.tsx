'use client';

import { MathJaxProvider } from 'mathjaxjs-react';
import { LaTeX } from '@latex2js/react';
import { select } from '@latex2js/utils';
import { tex } from './tex';
import * as React from 'react';

const TestSVGComponent = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (svgRef.current) {
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
            <LaTeX content={tex} />
          </div>
        </div>
      </main>
    </MathJaxProvider>
  );
}

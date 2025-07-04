'use client';

import { MathJaxProvider } from '@latex2js/mathjax';
import { tex } from './tex';
import { useEffect, useState } from 'react';

let LaTeX: any = null;
try {
  const reactModule = require('@latex2js/react');
  LaTeX = reactModule.LaTeX;
} catch (e) {
  console.log('LaTeX component not available:', e);
}

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [latexLoaded, setLatexLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      import('@latex2js/react')
        .then((module) => {
          LaTeX = module.LaTeX;
          setLatexLoaded(true);
          console.log('LaTeX component loaded successfully:', LaTeX);
        })
        .catch((error) => {
          console.error('Failed to load LaTeX component:', error);
        });
    }
  }, []);

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
            <div>
              <p className="text-gray-600">LaTeX graphics rendering will be implemented here.</p>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {tex.substring(0, 500)}...
              </pre>
            </div>
          </div>
        </div>
      </main>
    </MathJaxProvider>
  );
}

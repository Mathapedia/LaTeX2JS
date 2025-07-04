'use client';

import { MathJaxProvider } from '@latex2js/mathjax';
import { tex } from './tex';

export default function Home() {
  return (
    <MathJaxProvider className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">MathJax Next.js Demo</h1>
        <p className="text-lg text-gray-600">
          MathJax integration with reusable React component
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
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
          <h2 className="text-2xl font-bold mb-4">Series and Summations</h2>
          <div className="text-center my-4">
            $${tex}$$
          </div>
        </div>
      </main>
    </MathJaxProvider>
  );
}

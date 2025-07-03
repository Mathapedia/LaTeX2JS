'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';

declare global {
  interface Window {
    MathJax: any;
  }
}

function MathJaxComponent() {
  const [isClient, setIsClient] = useState(false);
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Configure MathJax before it loads
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
      },
      chtml: {
        fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'
      },
      startup: {
        ready: () => {
          console.log('MathJax is ready');
          window.MathJax.startup.defaultReady();
          setMathJaxLoaded(true);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (mathJaxLoaded && window.MathJax) {
      // Process all math on the page
      window.MathJax.typesetPromise().then(() => {
        console.log('MathJax typesetting complete');
      });
    }
  }, [mathJaxLoaded]);

  if (!isClient) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <Script
        id="MathJax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('MathJax script loaded');
        }}
      />
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">MathJax Next.js Demo</h1>
        <p className="text-lg text-gray-600">
          Manual MathJax integration with Next.js
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
      </main>
    </div>
  );
}

const Home = dynamic(() => Promise.resolve(MathJaxComponent), {
  ssr: false,
  loading: () => <div className="min-h-screen p-8 flex items-center justify-center">Loading MathJax...</div>
});

export default Home;
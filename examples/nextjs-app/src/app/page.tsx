'use client';

import 'latex2js/latex2js.css';
import { LaTeX } from '@latex2js/react';

const tex = String.raw`
\begin{nicebox}{LaTeX2JS Next.js Demo}
Welcome to the modernized LaTeX2JS demonstration using Next.js with TypeScript support!
\end{nicebox}

\begin{enumerate}
\item Mathematical expressions: $\int_0^1 x^2 dx = \frac{1}{3}$
\item Inline code: \verb|console.log('LaTeX2JS works!')|
\item Complex equations:
$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$
\end{enumerate}

Some inline math: $E = mc^2$ and $\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}$

Display math:
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

Maxwell's Equations:
\begin{align}
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t}\\
\nabla \times \mathbf{B} &= \mu_0\mathbf{J} + \mu_0\epsilon_0\frac{\partial \mathbf{E}}{\partial t}\\
\nabla \cdot \mathbf{E} &= \frac{\rho}{\epsilon_0}\\
\nabla \cdot \mathbf{B} &= 0
\end{align}

\begin{verbatim}
interface LaTeXProps {
  content: string;
}

const LaTeXComponent: React.FC<LaTeXProps> = ({ content }) => {
  return <LaTeX content={content} />;
};
\end{verbatim}

\begin{nicebox}{Parametric Equations}
\begin{align}
x &= r\cos\theta\\
y &= r\sin\theta
\end{align}
\end{nicebox}

This demo showcases:
\begin{enumerate}
\item Modern Next.js 15.3.4 with App Router
\item TypeScript integration with LaTeX2JS
\item Mathematical typesetting with MathJax
\item LaTeX environments like nicebox, enumerate, verbatim
\item Inline and display mathematics
\item Clean, contemporary React patterns
\end{enumerate}
`;

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">LaTeX2JS Next.js Demo</h1>
        <p className="text-lg text-gray-600">
          Modern Next.js example showcasing LaTeX2JS with TypeScript support
        </p>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <LaTeX key="latex-demo" content={tex} />
      </main>
    </div>
  );
}

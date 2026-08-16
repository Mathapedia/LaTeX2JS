import LaTeX2JS from 'latex2js';
import { getMathJax, loadMathJax, DEFAULT_CONFIG, type MathJaxConfig } from 'mathjaxjs';
import pspicture from './components/pspicture.js';
import nicebox from './components/nicebox.js';
import enumerate from './components/enumerate.js';
import list from './components/list.js';
import verbatim from './components/verbatim.js';
import math from './components/math.js';
import macros from './components/macros';

const ELEMENTS = { pspicture, nicebox, enumerate, itemize: list, description: list, verbatim, math, macros };

export { pspicture, nicebox, enumerate, list, verbatim, math, macros, DEFAULT_CONFIG };

export default function render(
  tex: string,
  resolve: (div: HTMLDivElement) => void,
  config?: MathJaxConfig
): void {
  const done = () => {
    const latex = new LaTeX2JS();
    const parsed = latex.parse(tex);
    const div = document.createElement('div');
    div.className = 'latex-container';
    parsed &&
      parsed.forEach &&
      parsed.forEach((el: any) => {
        if (ELEMENTS.hasOwnProperty(el.type)) {
          const elementType = el.type as keyof typeof ELEMENTS;
          div.appendChild(ELEMENTS[elementType](el));
        }
      });
    resolve(div);
  };

  if (getMathJax()) {
    return done();
  }
  loadMathJax(done, config);
}

export const init = (config?: MathJaxConfig): void => {
  loadMathJax(undefined, config);
  document.querySelectorAll('script[type="text/latex"]').forEach((el) => {
    render(
      el.innerHTML,
      (div: HTMLDivElement) => {
        if (el.parentNode) {
          el.parentNode.insertBefore(div, el.nextSibling);
        }
      },
      config
    );
  });
};

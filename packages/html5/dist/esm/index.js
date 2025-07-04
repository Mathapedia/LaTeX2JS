import LaTeX2JS from 'latex2js';
import { getMathJax, loadMathJax } from '@latex2js/mathjax';
import pspicture from './components/pspicture.js';
import nicebox from './components/nicebox.js';
import enumerate from './components/enumerate.js';
import verbatim from './components/verbatim.js';
import math from './components/math.js';
import macros from './components/macros';
const ELEMENTS = { pspicture, nicebox, enumerate, verbatim, math, macros };
export { pspicture, nicebox, enumerate, verbatim, math, macros };
export default function render(tex, resolve) {
    const done = () => {
        const latex = new LaTeX2JS();
        const parsed = latex.parse(tex);
        const div = document.createElement('div');
        div.className = 'latex-container';
        parsed &&
            parsed.forEach &&
            parsed.forEach((el) => {
                if (ELEMENTS.hasOwnProperty(el.type)) {
                    const elementType = el.type;
                    div.appendChild(ELEMENTS[elementType](el));
                }
            });
        resolve(div);
    };
    if (getMathJax()) {
        return done();
    }
    loadMathJax(done);
}
export const init = () => {
    loadMathJax();
    document.querySelectorAll('script[type="text/latex"]').forEach((el) => {
        render(el.innerHTML, (div) => {
            if (el.parentNode) {
                el.parentNode.insertBefore(div, el.nextSibling);
            }
        });
    });
};

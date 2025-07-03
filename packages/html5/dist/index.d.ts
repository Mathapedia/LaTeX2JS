import pspicture from './components/pspicture.js';
import nicebox from './components/nicebox.js';
import enumerate from './components/enumerate.js';
import verbatim from './components/verbatim.js';
import math from './components/math.js';
import macros from './components/macros';
export { pspicture, nicebox, enumerate, verbatim, math, macros };
export default function render(tex: string, resolve: (div: HTMLDivElement) => void): void;
export declare const init: () => void;

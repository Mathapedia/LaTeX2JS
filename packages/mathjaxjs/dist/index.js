"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMathJax = exports.getMathJax = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: ['base', 'ams', 'newcommand', 'configmacros']
    },
    chtml: {
        linebreaks: { automatic: true, width: 'container' }
    },
    startup: {
        ready: () => {
            console.log('MathJax v3 startup ready');
        }
    }
};
let mathJaxInstance = null;
const getMathJax = () => mathJaxInstance || globalThis.MathJax;
exports.getMathJax = getMathJax;
const loadMathJax = async (callback = () => { }, config = exports.DEFAULT_CONFIG) => {
    if (typeof window === 'undefined') {
        callback();
        return;
    }
    if (globalThis.MathJax) {
        mathJaxInstance = globalThis.MathJax;
        callback();
        return;
    }
    try {
        globalThis.MathJax = {
            ...config,
            startup: {
                ...config.startup,
                ready: () => {
                    globalThis.MathJax.startup.defaultReady();
                    mathJaxInstance = globalThis.MathJax;
                    console.log('MathJax v3 loaded and initialized successfully');
                    if (config.startup?.ready) {
                        config.startup.ready();
                    }
                    callback();
                }
            }
        };
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
        script.async = true;
        script.id = 'MathJax-script';
        script.onload = () => {
            console.log('MathJax v3 script loaded from CDN');
        };
        script.onerror = () => {
            console.error('Failed to load MathJax v3 from CDN');
            callback();
        };
        document.head.appendChild(script);
    }
    catch (error) {
        console.error('Failed to load MathJax v3:', error);
        callback();
    }
};
exports.loadMathJax = loadMathJax;

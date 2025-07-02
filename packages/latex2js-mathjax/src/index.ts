import loadScript from 'load-script';

declare const process: any;

export const DEFAULT_SCRIPT =
  process.env.MATHJAX_CDN ||
  'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.3/MathJax.js';

export const DEFAULT_OPTIONS = {
  TeX: { extensions: ['AMSmath.js', 'AMSsymbols.js'] },
  extensions: ['tex2jax.js'],
  showProcessingMessages: false,
  jax: ['input/TeX', 'output/HTML-CSS'],
  messageStyle: 'none',
  showMathMenu: false,
  showMathMenuMSIE: false,
  tex2jax: {
    processEnvironments: true,
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    preview: 'none',
    processEscapes: true
  },
  'HTML-CSS': { linebreaks: { automatic: true, width: 'container' } }
};

export const getMathJax = () =>
  typeof (globalThis as any).MathJax === 'undefined' ? undefined : (globalThis as any).MathJax;

export const loadMathJax = (
  callback = () => {},
  script = DEFAULT_SCRIPT,
  options = DEFAULT_OPTIONS
) => {
  const onLoad = () => {
    if ((globalThis as any).MathJax) {
      (globalThis as any).MathJax.Hub.Config(options);
    }
    callback();
  };
  if (!script) {
    return onLoad();
  }
  loadScript(script, onLoad);
};

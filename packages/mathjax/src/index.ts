export const DEFAULT_CONFIG = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true,
    processEnvironments: true,
    packages: ['base', 'ams', 'newcommand', 'configmacros']
  },
  chtml: {
    linebreaks: { automatic: true, width: 'container' }
  },
  startup: {
    ready: () => {
    }
  }
};

let mathJaxInstance: any = null;

export const getMathJax = () => mathJaxInstance || (globalThis as any).MathJax;

export const loadMathJax = async (callback = () => {}, config = DEFAULT_CONFIG) => {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  if ((globalThis as any).MathJax) {
    mathJaxInstance = (globalThis as any).MathJax;
    callback();
    return;
  }

  try {
    (globalThis as any).MathJax = {
      ...config,
      startup: {
        ...config.startup,
        ready: () => {
          mathJaxInstance = (globalThis as any).MathJax;
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
    script.onload = () => {
    };
    script.onerror = () => {
      console.error('Failed to load MathJax from CDN');
      callback();
    };
    
    document.head.appendChild(script);
    
  } catch (error) {
    console.error('Failed to load MathJax:', error);
    callback();
  }
};

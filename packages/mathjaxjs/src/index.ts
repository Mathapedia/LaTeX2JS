export const DEFAULT_CONFIG = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    // Number AMS environments — equation, align, gather — and resolve \label
    // and \ref against those numbers. Equation numbering stays with MathJax
    // rather than the parser: it already owns the math, and two systems
    // numbering the same document would disagree.
    tags: 'ams',
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

let mathJaxInstance: any = null;

export const getMathJax = () => mathJaxInstance || (globalThis as any).MathJax;

export const loadMathJax = async (callback = () => { }, config = DEFAULT_CONFIG) => {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  // Presence is not readiness. `window.MathJax` holds the configuration object
  // long before the library that reads it has loaded, and pre-configuring the
  // global is the documented way to set MathJax up — so treating any value
  // here as a loaded library meant a page that configured MathJax itself never
  // got the script injected at all, and MathJax never loaded.
  const existing = (globalThis as any).MathJax;
  if (existing && typeof existing.typesetPromise === 'function') {
    mathJaxInstance = existing;
    callback();
    return;
  }

  // Someone has already asked for the script; wait for that one rather than
  // adding a second copy.
  if (typeof document !== 'undefined' && document.getElementById('MathJax-script')) {
    callback();
    return;
  }

  try {
    (globalThis as any).MathJax = {
      ...config,
      // A page that configured MathJax itself keeps its settings; only the
      // startup hook below is ours.
      ...(existing && typeof existing === 'object' ? existing : {}),
      startup: {
        ...config.startup,
        ...(existing && typeof existing === 'object' ? existing.startup : {}),
        ready: () => {
          (globalThis as any).MathJax.startup.defaultReady();
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
    script.id = 'MathJax-script';
    script.onload = () => {
      console.log('MathJax v3 script loaded from CDN');
    };
    script.onerror = () => {
      console.error('Failed to load MathJax v3 from CDN');
      callback();
    };

    document.head.appendChild(script);

  } catch (error) {
    console.error('Failed to load MathJax v3:', error);
    callback();
  }
};

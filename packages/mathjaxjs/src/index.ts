/** 默认 MathJax 脚本地址，可由用户通过 config.scriptURL 覆盖 */
export const DEFAULT_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';

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

/** 扩展配置：可传入 scriptURL 自定义加载地址 */
export interface LoadMathJaxConfig extends Record<string, unknown> {
  scriptURL?: string;
}

let mathJaxInstance: any = null;

export const getMathJax = () => mathJaxInstance || (globalThis as any).MathJax;

export const loadMathJax = async (
  callback = () => { },
  config: typeof DEFAULT_CONFIG & LoadMathJaxConfig = DEFAULT_CONFIG
) => {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  if ((globalThis as any).MathJax) {
    mathJaxInstance = (globalThis as any).MathJax;
    callback();
    return;
  }

  const scriptURL = config.scriptURL ?? DEFAULT_SCRIPT_URL;

  try {
    (globalThis as any).MathJax = {
      ...config,
      startup: {
        ...config.startup,
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
    script.src = scriptURL;
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

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

/**
 * Extended configuration: `scriptURL` overrides where MathJax is loaded from.
 */
export interface LoadMathJaxConfig {
  scriptURL?: string;
}

/** Recursively optional, so callers can override just the keys they want. */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? Array<DeepPartial<U>>
    : T[K] extends (...args: any[]) => any
      ? T[K]
      : T[K] extends object
        ? DeepPartial<T[K]>
        : T[K];
};

/**
 * A MathJax configuration that may override any subset of DEFAULT_CONFIG and
 * optionally point at a custom script URL.
 */
export type MathJaxConfig = DeepPartial<typeof DEFAULT_CONFIG> & LoadMathJaxConfig;

let mathJaxInstance: any = null;

export const getMathJax = () => mathJaxInstance || (globalThis as any).MathJax;

export const loadMathJax = async (
  callback = () => { },
  config: MathJaxConfig = DEFAULT_CONFIG
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

  // scriptURL is a loader concern, not a MathJax one: keep it out of the
  // config object that is handed to MathJax itself.
  const { scriptURL = DEFAULT_SCRIPT_URL, ...mathjaxConfig } = config;

  // A partial config overrides DEFAULT_CONFIG key by key; without this a
  // caller passing only { scriptURL } would drop the tex setup (ams, tags,
  // equation numbering) entirely.
  const merged = {
    ...DEFAULT_CONFIG,
    ...mathjaxConfig,
    tex: { ...DEFAULT_CONFIG.tex, ...mathjaxConfig.tex },
    chtml: { ...DEFAULT_CONFIG.chtml, ...mathjaxConfig.chtml },
    startup: { ...DEFAULT_CONFIG.startup, ...mathjaxConfig.startup }
  };

  try {
    (globalThis as any).MathJax = {
      ...merged,
      startup: {
        ...merged.startup,
        ready: () => {
          (globalThis as any).MathJax.startup.defaultReady();
          mathJaxInstance = (globalThis as any).MathJax;
          if (merged.startup.ready) {
            merged.startup.ready();
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

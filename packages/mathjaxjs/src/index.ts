/**
 * Where MathJax is loaded from unless a caller overrides it with
 * `config.scriptURL`.
 *
 * Pinned rather than floating on `mathjax@3`, so a build is reproducible and
 * the URL can carry an integrity hash. It is also the single place to change
 * for a major upgrade: MathJax 4 moved the bundles out of `es5/`, so the path
 * shape changes there and not only the version.
 */
export const DEFAULT_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js';

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


/**
 * Merges an override into a base, recursively, without mutating either.
 *
 * The config is nested more than one level — `chtml.linebreaks` holds both
 * `automatic` and `width` — so merging only the top level silently drops the
 * siblings of whatever a caller overrides: passing
 * `{ chtml: { linebreaks: { width: "80%" } } }` lost `automatic: true`. The
 * `MathJaxConfig` type says any subset may be overridden, and this is what
 * makes that true.
 *
 * Arrays replace rather than merge: `tex.packages` and `tex.inlineMath` are
 * whole values, and concatenating them would silently keep a default a caller
 * meant to remove.
 */
function deepMerge(base: any, override: any): any {
  if (override === undefined) return base;
  const mergeable = (v: any) =>
    v !== null && typeof v === 'object' && !Array.isArray(v) && typeof v !== 'function';
  if (!mergeable(base) || !mergeable(override)) return override;

  const out: any = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = mergeable(base[key]) && mergeable(override[key])
      ? deepMerge(base[key], override[key])
      : override[key];
  }
  return out;
}

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
  const merged = deepMerge(DEFAULT_CONFIG, mathjaxConfig) as typeof DEFAULT_CONFIG;

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

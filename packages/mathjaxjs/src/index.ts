/**
 * Where MathJax is loaded from unless a caller overrides it with
 * `config.scriptURL`.
 *
 * Pinned rather than floating on a major tag, so a build is reproducible and
 * the URL can carry an integrity hash. Being a single constant is what made
 * the move to MathJax 4 a one-line change: v4 dropped the `es5/` directory, so
 * the path shape moved as well as the version.
 */
export const DEFAULT_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/mathjax@4.1.3/tex-chtml.js';

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

/**
 * Callers that arrive while the script is still loading. Invoking their
 * callbacks immediately was a real bug: a component would call
 * `typesetPromise` before it existed, silently typeset nothing, and its math
 * stayed raw. They wait here until the ready hook (or a load failure) drains
 * them.
 */
let pendingCallbacks: Array<() => void> = [];

const drainPendingCallbacks = () => {
  const callbacks = pendingCallbacks;
  pendingCallbacks = [];
  callbacks.forEach((cb) => cb());
};

export const getMathJax = () => mathJaxInstance || (globalThis as any).MathJax;

export const loadMathJax = async (
  callback = () => { },
  config: MathJaxConfig = DEFAULT_CONFIG
) => {
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
  // adding a second copy. Waiting means queuing until the ready hook fires —
  // not calling back now, which would hand the caller a MathJax that cannot
  // typeset yet.
  if (typeof document !== 'undefined' && document.getElementById('MathJax-script')) {
    pendingCallbacks.push(callback);
    return;
  }

  // scriptURL is a loader concern, not a MathJax one: keep it out of the
  // config object that is handed to MathJax itself.
  const { scriptURL = DEFAULT_SCRIPT_URL, ...mathjaxConfig } = config;

  // Three sources, weakest first: our defaults, then any configuration the page
  // had already put on the global, then what this caller passed. Without the
  // merge a caller passing only { scriptURL } would drop the tex setup — ams,
  // tags, equation numbering — entirely; without folding in `existing`, a page
  // that pre-configured MathJax would have its settings thrown away by the
  // very call that finally loads the library for it.
  const preconfigured = existing && typeof existing === 'object' ? existing : {};
  const merged = deepMerge(
    deepMerge(DEFAULT_CONFIG, preconfigured),
    mathjaxConfig
  ) as typeof DEFAULT_CONFIG;

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
          drainPendingCallbacks();
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
      // Waiters must not hang forever on a script that will never arrive.
      callback();
      drainPendingCallbacks();
    };

    document.head.appendChild(script);

  } catch (error) {
    console.error('Failed to load MathJax v3:', error);
    callback();
  }
};

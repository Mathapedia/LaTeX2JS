import { DEFAULT_CONFIG, DEFAULT_SCRIPT_URL, getMathJax, loadMathJax } from '../src';

/**
 * MathJax used to be loaded from a URL hardcoded inside loadMathJax, so a
 * self-hosted install could not be used. The script URL is now configurable
 * via `scriptURL` (or `config.scriptURL`) and falls back to the shared
 * DEFAULT_SCRIPT_URL constant.
 */
beforeEach(() => {
  delete (globalThis as any).MathJax;
  document.head.innerHTML = '';
});

describe('loadMathJax script URL', () => {
  it('loads from DEFAULT_SCRIPT_URL when no override is given', async () => {
    await loadMathJax();
    const script = document.querySelector('#MathJax-script') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toBe(DEFAULT_SCRIPT_URL);
  });

  it('loads from a custom scriptURL passed in the config', async () => {
    await loadMathJax(() => {}, { scriptURL: 'https://math.example/tex-chtml.js' });
    const script = document.querySelector('#MathJax-script') as HTMLScriptElement;
    expect(script.src).toBe('https://math.example/tex-chtml.js');
  });

  it('accepts a partial config — scriptURL alone is enough', async () => {
    // the config type must allow overrides without the full DEFAULT_CONFIG
    await loadMathJax(() => {}, { scriptURL: 'https://math.example/custom.js' });
    const script = document.querySelector('#MathJax-script') as HTMLScriptElement;
    expect(script.src).toBe('https://math.example/custom.js');
  });

  it('does not leak scriptURL into the MathJax config object', async () => {
    await loadMathJax(() => {}, { scriptURL: 'https://math.example/x.js', tex: { processEscapes: true } });
    expect((globalThis as any).MathJax.scriptURL).toBeUndefined();
    expect((globalThis as any).MathJax.tex.processEscapes).toBe(true);
  });

  it('merges the full default config when only scriptURL is given', async () => {
    await loadMathJax(() => {}, { scriptURL: 'https://math.example/x.js' });
    expect((globalThis as any).MathJax.tex.packages).toEqual(
      DEFAULT_CONFIG.tex.packages
    );
    expect(getMathJax()).toBe((globalThis as any).MathJax);
  });
});

/**
 * A partial config overrides DEFAULT_CONFIG key by key rather than replacing
 * it. The case that matters is the one a caller is most likely to hit without
 * noticing: overriding one `tex` setting and losing the AMS numbering that
 * makes \label and \ref resolve.
 */
describe('a partial config keeps the defaults it does not mention', () => {
  it('keeps tex.tags when another tex key is overridden', async () => {
    await loadMathJax(() => {}, { tex: { processEscapes: false } });
    const tex = (globalThis as any).MathJax.tex;
    expect(tex.processEscapes).toBe(false);
    expect(tex.tags).toBe('ams');
    expect(tex.packages).toEqual(DEFAULT_CONFIG.tex.packages);
  });

  it('keeps a sibling of a nested override', async () => {
    // chtml.linebreaks holds both `automatic` and `width`; merging only the
    // top level dropped whichever one the caller did not name.
    await loadMathJax(() => {}, { chtml: { linebreaks: { width: '80%' } } });
    const linebreaks = (globalThis as any).MathJax.chtml.linebreaks;
    expect(linebreaks.width).toBe('80%');
    expect(linebreaks.automatic).toBe(DEFAULT_CONFIG.chtml.linebreaks.automatic);
  });

  it('replaces an array rather than concatenating it', async () => {
    // tex.packages is a whole value: appending would keep a default the caller
    // meant to drop.
    await loadMathJax(() => {}, { tex: { packages: ['base'] } });
    expect((globalThis as any).MathJax.tex.packages).toEqual(['base']);
  });

  it('does not mutate DEFAULT_CONFIG', async () => {
    await loadMathJax(() => {}, { tex: { tags: 'none' } });
    expect(DEFAULT_CONFIG.tex.tags).toBe('ams');
  });
});

describe('the script URL may be relative', () => {
  it('accepts a path to a self-hosted copy', async () => {
    // The common self-hosted form. jsdom resolves it against the document, so
    // the assertion is on the suffix rather than the whole URL.
    await loadMathJax(() => {}, { scriptURL: '/vendor/mathjax/tex-chtml.js' });
    const script = document.querySelector('#MathJax-script') as HTMLScriptElement;
    expect(script.getAttribute('src')).toBe('/vendor/mathjax/tex-chtml.js');
  });
});

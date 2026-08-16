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

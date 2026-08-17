/**
 * Regression test for the loader race: a second loadMathJax call arriving
 * while the script tag exists but MathJax has not finished loading must NOT
 * invoke its callback synchronously — doing so made callers typeset against a
 * MathJax with no typesetPromise, silently rendering nothing.
 */
import { loadMathJax } from '../src/index';

describe('loadMathJax queuing', () => {
  beforeEach(() => {
    delete (globalThis as any).MathJax;
    document.getElementById('MathJax-script')?.remove();
  });

  it('queues callers while the script is still loading', () => {
    const first = jest.fn();
    const second = jest.fn();

    // First call injects the script tag; jsdom never actually loads it, which
    // models the in-flight window.
    loadMathJax(first);
    expect(document.getElementById('MathJax-script')).not.toBeNull();

    loadMathJax(second);
    expect(second).not.toHaveBeenCalled();
  });

  it('calls back immediately once MathJax is actually ready', () => {
    (globalThis as any).MathJax = { typesetPromise: () => Promise.resolve() };
    const cb = jest.fn();
    loadMathJax(cb);
    expect(cb).toHaveBeenCalled();
  });
});

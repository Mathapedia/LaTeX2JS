/** @jest-environment jsdom */
import LaTeX2JS from 'latex2js';
import pspicture from '../src/components/pspicture';

/**
 * An `\rput` label is centred on its coordinate by measuring the element and
 * subtracting half its size. That measurement is only meaningful once MathJax
 * has replaced the LaTeX source with the typeset formula, because the two have
 * very different widths.
 *
 * The check for MathJax was read once, synchronously, at the moment the label
 * was created:
 *
 *     const mathJax = window.MathJax;
 *     if (mathJax && mathJax.typesetPromise) { ... } else { raw HTML }
 *
 * `window.MathJax` is present long before it can typeset anything. The loader
 * assigns the configuration object to the global and only then injects the CDN
 * script, so in between the global exists and `typesetPromise` does not. On a
 * cold load the label took the else branch, centred itself on the width of the
 * raw LaTeX, and was never measured again once MathJax arrived and swapped in
 * the formula. On a reload the script came from cache and won the race, which
 * is why it looked like a first-render-only bug.
 */
function stubViewport(w: number): void {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: w, configurable: true });
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
}

function render(tex: string): HTMLElement {
  const latex = new LaTeX2JS();
  const env = latex.parse(tex).find((e: any) => e.type === 'pspicture');
  expect(env).toBeDefined();
  const div = pspicture(env);
  document.body.appendChild(div);
  return div;
}

const PICTURE = `\\begin{pspicture}(0,0)(4,4)
\\rput(2,2){$x^2$}
\\end{pspicture}`;

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => {
  stubViewport(1200);
  document.body.innerHTML = '';
  delete (window as any).MathJax;
});

afterEach(() => {
  delete (window as any).MathJax;
});

describe('an rput label waits for MathJax to become able to typeset', () => {
  it('typesets a label created while MathJax is still loading', async () => {
    // Exactly the state the loader leaves behind: the configuration object is
    // on the global, the CDN script has not executed yet.
    (window as any).MathJax = { tex: { inlineMath: [['$', '$']] } };

    render(PICTURE);

    // The label is created on a requestAnimationFrame, so the script has to
    // land well after that to reproduce a cold load — a CDN fetch takes
    // hundreds of milliseconds, not one frame.
    await tick(150);
    const typeset: Element[] = [];
    (window as any).MathJax = {
      typesetPromise: (els: Element[]) => {
        typeset.push(...els);
        return Promise.resolve();
      },
    };

    await tick(400);
    expect(typeset.length).toBeGreaterThan(0);
  });

  it('typesets immediately when MathJax is already usable', async () => {
    const typeset: Element[] = [];
    (window as any).MathJax = {
      typesetPromise: (els: Element[]) => {
        typeset.push(...els);
        return Promise.resolve();
      },
    };

    render(PICTURE);
    await tick(120);
    expect(typeset.length).toBeGreaterThan(0);
  });

  it('does not wait when there is no MathJax at all', async () => {
    // A page that never loads MathJax must still show its labels promptly,
    // so the absence of the global is a different case from a global that is
    // not ready yet.
    render(PICTURE);
    await tick(120);
    const label = document.querySelector('.math') as HTMLElement;
    expect(label).not.toBeNull();
    expect(label.style.visibility).toBe('visible');
  });

  it('shows the label even if MathJax never finishes loading', async () => {
    // Bounded, not indefinite: a page that configures MathJax and never loads
    // the library must not leave its labels hidden forever. Driven on fake
    // timers so the bound can be reached without the test waiting it out.
    jest.useFakeTimers();
    try {
      (window as any).MathJax = { tex: {} };
      render(PICTURE);
      await jest.advanceTimersByTimeAsync(30000);
      const label = document.querySelector('.math') as HTMLElement;
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('x^2');
      expect(label.style.visibility).toBe('visible');
    } finally {
      jest.useRealTimers();
    }
  });
});

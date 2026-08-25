import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LaTeX2HTML5 from 'latex2js';

import nicebox from '../src/components/nicebox';
import enumerate from '../src/components/enumerate';
import math from '../src/components/math';
import { LaTeX } from '../src';

describe('nicebox', () => {
  it('renders the parser-provided lines, not children', () => {
    const html = renderToStaticMarkup(
      React.createElement(nicebox, {
        lines: ['\\begin{align*}', 'x &= y', '\\end{align*}'],
      })
    );
    expect(html).toContain('align*');
    expect(html).toContain('x &= y');
    expect(html).toContain('nicebox');
  });

  it('renders an empty box rather than crashing without lines', () => {
    expect(renderToStaticMarkup(React.createElement(nicebox, {}))).toContain('nicebox');
  });
});

describe('enumerate', () => {
  it('converts \\item lines to <li>', () => {
    const html = renderToStaticMarkup(
      React.createElement(enumerate, {
        type: 'enumerate',
        lines: ['\\item first', '\\item second'],
      })
    );
    expect(html).toContain('<ol');
    expect(html).toContain('<li>first</li>');
    expect(html).toContain('<li>second</li>');
  });

  it('renders itemize as <ul> and description as <dl>', () => {
    expect(
      renderToStaticMarkup(
        React.createElement(enumerate, { type: 'itemize', lines: ['\\item a'] })
      )
    ).toContain('<ul');
    const dl = renderToStaticMarkup(
      React.createElement(enumerate, {
        type: 'description',
        lines: ['\\item[term] definition'],
      })
    );
    expect(dl).toContain('<dl');
    expect(dl).toContain('<dt>term</dt>');
    expect(dl).toContain('<dd>definition</dd>');
  });
});

describe('math', () => {
  it('renders a block element so paragraphs are not hoisted out', () => {
    const html = renderToStaticMarkup(
      React.createElement(math, { lines: ['<p>$x$</p>'] })
    );
    expect(html).toMatch(/^<div/);
    expect(html).toContain('<p>$x$</p>');
  });
});

describe('parser integration', () => {
  it('nicebox content from a parsed document survives to the rendered HTML', () => {
    const source = String.raw`
\begin{nicebox}
\begin{align*}
 x(n) &= \sum \limits_{k=\langle p\rangle}X_ke^{ik\omega_0n}
\end{align*}
In DFS, $\omega_0 = 2\pi/p$.
\end{nicebox}`;
    const latex = new LaTeX2HTML5();
    const parsed = latex.parse(source);
    const el = parsed.find((e: any) => e.type === 'nicebox');
    expect(el).toBeDefined();
    const html = renderToStaticMarkup(React.createElement(nicebox, el));
    expect(html).toContain('align*');
    expect(html).toContain('In DFS');
  });
});

describe('LaTeX', () => {
  it('reuses the parsed document when content is unchanged', () => {
    const source = String.raw`\begin{nicebox}content\end{nicebox}`;
    const instance = new LaTeX({ content: source });
    (instance as any).state = { mathJaxLoaded: true };
    const parse = jest.spyOn(LaTeX2HTML5.prototype, 'parse');

    instance.render();
    instance.render();

    expect(parse).toHaveBeenCalledTimes(1);
    parse.mockRestore();
  });

  it('typesets after an update when MathJax is loaded', () => {
    const instance = new LaTeX({ content: 'content' });
    (instance as any).state = { mathJaxLoaded: true };
    const typesetMath = jest.spyOn(instance, 'typesetMath').mockImplementation(() => {});

    instance.componentDidUpdate();

    expect(typesetMath).toHaveBeenCalledTimes(1);
    typesetMath.mockRestore();
  });
});

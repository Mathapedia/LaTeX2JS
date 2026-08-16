import { Expressions, Functions } from '../src/lib/pstricks';
import psgraph from '../src/lib/psgraph';

/**
 * `plotstyle` was parsed and dropped, so a plot asking for dot markers drew a
 * line through them instead — which is why the tangent markers were missing
 * from every picture in graph.tex while the PSTricks reference shows them.
 */
function makeContext() {
  return {
    xunit: 50, yunit: 50,
    x0: -5, y0: -5, x1: 5, y1: 5,
    w: 10, h: 10,
    variables: {},
  } as any;
}

interface Node { tag: string; attrs: { [k: string]: string }; styles: { [k: string]: string }; children: Node[] }

function recorder() {
  const root: Node = { tag: 'root', attrs: {}, styles: {}, children: [] };
  const wrap = (node: Node): any => ({
    append(tag: string) {
      const child: Node = { tag: tag.replace(/^svg:/, ''), attrs: {}, styles: {}, children: [] };
      node.children.push(child);
      return wrap(child);
    },
    attr(k: string, v: any) { node.attrs[k] = String(v); return wrap(node); },
    style(k: string, v: any) { node.styles[k] = String(v); return wrap(node); },
    text() { return wrap(node); },
    on() { return wrap(node); },
  });
  return { root, svg: wrap(root) };
}

function render(raw: string): Node {
  const ctx = makeContext();
  const m = raw.match(Expressions.psplot) as RegExpMatchArray;
  expect(m).not.toBeNull();
  const data = Functions.psplot.call(ctx, m);
  data.global = ctx;
  const { root, svg } = recorder();
  psgraph.psplot.call(data, svg);
  return root;
}

const tags = (n: Node) => n.children.map((c) => c.tag);

describe('plotstyle', () => {
  it('joins the samples into one path by default', () => {
    const t = tags(render('\\psplot[algebraic]{-2}{2}{x^2}'));
    expect(t).toEqual(['path']);
  });

  it('marks the samples when plotstyle=dots', () => {
    const t = tags(render('\\psplot[plotstyle=dots,plotpoints=5]{-2}{2}{x^2}'));
    expect(t.every((x) => x === 'circle')).toBe(true);
    expect(t.length).toBe(5);
    // A line through the dots would defeat the point of asking for dots.
    expect(t).not.toContain('path');
  });

  it('sizes and colours the markers from dotsize and linecolor', () => {
    const first = render('\\psplot[plotstyle=dots,plotpoints=3,dotsize=7,linecolor=red]{-1}{1}{x}').children[0];
    expect(first.attrs.r).toBe('7');
    expect(first.styles.fill).toBe('red');
  });

  it('gives the markers a default size when none is asked for', () => {
    const first = render('\\psplot[plotstyle=dots,plotpoints=3]{-1}{1}{x}').children[0];
    expect(Number(first.attrs.r)).toBeGreaterThan(0);
  });

  it('keeps the psplot class so the interactive redraw still finds them', () => {
    const first = render('\\psplot[plotstyle=dots,plotpoints=3]{-1}{1}{x}').children[0];
    expect(first.attrs.class).toBe('psplot');
  });

  it('leaves an unrecognised plotstyle drawing a line', () => {
    // Better a line than nothing: an unimplemented style should degrade, not vanish.
    expect(tags(render('\\psplot[plotstyle=polygon]{-2}{2}{x}'))).toEqual(['path']);
  });
});

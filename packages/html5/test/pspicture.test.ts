/** @jest-environment jsdom */
import LaTeX2JS from 'latex2js';
import pspicture from '../src/components/pspicture';
import math from '../src/components/math';
import verbatim from '../src/components/verbatim';
import list from '../src/components/list';

function stubViewport(width: number): void {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
}

/**
 * Drawn shapes in document order. All drawing lives in a layer group the
 * interactive redraw replaces wholesale, so this looks at descendants rather
 * than direct children, and skips anything inside a pattern definition.
 */
function shapeOrder(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('circle, path, rect, ellipse, line'))
    .filter((el) => !el.closest('defs'))
    .map((el) => el.tagName)
    .filter((t) => t === 'circle' || t === 'path');
}

function parsePspicture(tex: string): any {
  const latex = new LaTeX2JS();
  const parsed = latex.parse(tex);
  const env = parsed.find((e: any) => e.type === 'pspicture');
  expect(env).toBeDefined();
  return env;
}

beforeEach(() => {
  stubViewport(1200);
  document.body.innerHTML = '';
});

describe('pspicture component (SVG rendering)', () => {
  it('renders psline, pscircle and psframe into an SVG', () => {
    const env = parsePspicture(`
\\begin{pspicture}(-5,-5)(5,5)
\\psline{->}(0,-3.75)(0,3.75)
\\pscircle(0,0){ 3 }
\\psframe(-2,-2)(2,2)
\\end{pspicture}
    `);

    const div = pspicture(env);
    document.body.appendChild(div);

    const svg = div.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(div.className).toBe('pspicture');

    // psframe → 4 <line> elements
    const lines = div.querySelectorAll('svg line');
    expect(lines).toHaveLength(4);

    // pscircle with xunit=50, r=3 → X(0)=250, Y(0)=250, r=150
    const circles = div.querySelectorAll('svg circle');
    expect(circles).toHaveLength(1);
    expect(circles[0].getAttribute('cx')).toBe('250');
    expect(circles[0].getAttribute('cy')).toBe('250');
    expect(circles[0].getAttribute('r')).toBe('150');

    // psline{->} → 1 line path + 1 arrowhead path
    const paths = div.querySelectorAll('svg path');
    expect(paths.length).toBeGreaterThanOrEqual(2);
    const arrowPaths = Array.from(paths).filter((p) => p.getAttribute('d')?.endsWith('Z'));
    expect(arrowPaths.length).toBeGreaterThanOrEqual(1);
  });

  it('respects dashed linestyle and linecolor options', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\psline[linestyle=dashed,linecolor=red](0,0)(1,1)
\\end{pspicture}
    `);

    const div = pspicture(env);
    document.body.appendChild(div);

    const path = div.querySelector('svg path')!;
    // PSTricks' default dash is `5pt 3pt`; this used to be a hardcoded `9,5`
    // that ignored the setting and made dotted lines look dashed too.
    const [on, off] = path.style.strokeDasharray.split(',').map(Number);
    expect(on / off).toBeCloseTo(5 / 3, 3);
    expect(path.style.stroke).toBe('red');
  });

  it('draws a dotted line differently from a dashed one', () => {
    const dash = (style: string) => {
      const div = pspicture(parsePspicture(
        `\\begin{pspicture}(0,0)(4,4)\n\\psline[linestyle=${style}](0,0)(1,1)\n\\end{pspicture}`
      ));
      document.body.appendChild(div);
      return div.querySelector('svg path')!.style.strokeDasharray;
    };
    expect(dash('dotted')).not.toBe(dash('dashed'));
    expect(dash('dotted')).toMatch(/^0,/);
  });

  it('re-renders psplot when a slider changes', () => {
    const env = parsePspicture(`
\\psset{unit=1cm}
\\begin{pspicture}(-3.5,-1)(3.75,3.5)
\\slider{1}{8}{n}{$N$}{4}
\\psplot[algebraic]{-3.14}{3.14}{cos(n*x)+1}
\\end{pspicture}
    `);

    const div = pspicture(env);
    document.body.appendChild(div);

    const input = div.querySelector('input[type="range"]')!;
    expect(input).not.toBeNull();
    expect(div.querySelectorAll('svg path.psplot')).toHaveLength(1);

    input.setAttribute('value', '8');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // still exactly one plot path after the re-render…
    expect(div.querySelectorAll('svg path.psplot')).toHaveLength(1);
    // …and the variable used to compute it was updated
    expect(env.env.variables.n).toBe(8);
  });

  it('handles an empty pspicture without throwing', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(2,2)
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    expect(div.querySelector('svg')).not.toBeNull();
  });

  it('draws elements in source order (layering)', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\pscircle(0,0){1}
\\psline(0,0)(1,1)
\\pscircle(1,1){2}
\\end{pspicture}
    `);

    const div = pspicture(env);
    document.body.appendChild(div);

    // the old parser grouped by command type (circles before lines); the new
    // parser renders in document order: circle, line, circle
    const svg = div.querySelector('svg')!;
    expect(shapeOrder(svg)).toEqual(['circle', 'path', 'circle']);
  });

  it('keeps source order after the pointer moves over the picture', () => {
    // The interactive redraw used to remove and re-append the interactive
    // elements, which put them at the end of the SVG and regrouped them by
    // command type. A correct diagram silently reordered itself on first
    // hover, so order has to be asserted after an event, not only before one.
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\userline[linewidth=2pt]{->}(0,0)(2,2)
\\pscircle(2,2){1}
\\end{pspicture}
    `);

    const div = pspicture(env);
    document.body.appendChild(div);
    const svg = div.querySelector('svg')!;

    // The userline draws its line plus an arrowhead, so the circle authored
    // after it must stay last however many paths precede it.
    const before = shapeOrder(svg);
    expect(before[before.length - 1]).toBe('circle');

    svg.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

    expect(shapeOrder(svg)).toEqual(before);
  });

  it('renders psdots as small circles', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\psdots(1,1)(2,2)
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    expect(div.querySelectorAll('svg circle')).toHaveLength(2);
  });

  it('renders psgrid as grid lines', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\psgrid
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    // 4 x-lines + 4 y-lines for a 4x4 grid at 1-unit spacing (xunit=50)
    expect(div.querySelectorAll('svg line').length).toBeGreaterThanOrEqual(8);
  });

  it('renders psellipse as an SVG ellipse', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\psellipse[fillstyle=solid,fillcolor=lightblue](2,2)(1,0.5)
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const ellipse = div.querySelector('svg ellipse')!;
    expect(ellipse).not.toBeNull();
    expect(ellipse.getAttribute('rx')).toBe('50');
    expect(ellipse.getAttribute('ry')).toBe('25');
  });

  it('renders psbezier and pscurve as paths', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\psbezier(0,0)(1,2)(2,2)(3,0)
\\pscurve(0,0)(1,1)(2,0)
\\psccurve(0,1)(1,2)(2,1)
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const paths = div.querySelectorAll('svg path');
    expect(paths.length).toBe(3);
    // the closed curve path should end with Z
    expect(paths[2].getAttribute('d')?.endsWith('Z')).toBe(true);
  });

  it('renders pswedge as a filled pie slice', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\pswedge[fillstyle=solid,fillcolor=gray!40](2,2){1}{0}{90}
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const path = div.querySelector('svg path')!;
    expect(path.getAttribute('d')).toContain('A');
    expect(path.getAttribute('d')?.endsWith('Z')).toBe(true);
  });

  it('renders pscustom as a filled path', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(8,4)
\\pscustom[fillstyle=solid,fillcolor=gray!40,linestyle=none]{
  \\psline(0,0)(4,1.2)
  \\psline(4,1.2)(8,0)
  \\psline(8,0)(4,-1.2)
  \\psline(4,-1.2)(0,0)
}
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const path = div.querySelector('svg path')!;
    expect(path).not.toBeNull();
    const d = path.getAttribute('d') || '';
    expect(d.startsWith('M')).toBe(true);
    // the diamond path is filled and closed
    expect(d.endsWith('Z')).toBe(true);
  });

  // A starred shape fills with the colour the author wrote, in either dialect.
  // PSTricks fills them with linecolor instead; that is reported rather than
  // applied, so adding or removing the flag never changes a drawing.
  const starredFill = (dialect?: 'pstricks' | 'latex2js') => {
    const latex = new LaTeX2JS();
    if (dialect) (latex as any).dialect = dialect;
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psframe*[linecolor=blue,fillcolor=red](1,1)(2,2)
\\end{pspicture}
    `);
    const div = pspicture(parsed.find((e: any) => e.type === 'pspicture'));
    document.body.appendChild(div);
    return (div.querySelector('svg rect')! as HTMLElement).style.fill;
  };

  it.each(['pstricks', 'latex2js'] as const)('fills a starred shape with fillcolor under %s', (d) => {
    expect(starredFill(d)).toBe('red');
  });

  it('fills star-variant primitives', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\pscircle*(0,0){1}
\\psframe*[fillcolor=red](1,1)(2,2)
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const circle = div.querySelector('svg circle')!;
    expect(circle.style.fill).toBe('black'); // default fillcolor
    const rect = div.querySelector('svg rect')!;
    expect(rect.style.fill).toBe('red');
  });

  it('renders multido-expanded commands', () => {
    const env = parsePspicture(`
\\begin{pspicture}(0,0)(4,4)
\\multido{\\i=0+1}{3}{\\psline(\\i,0)(\\i,1)}
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    // 3 expanded lines (paths)
    expect(div.querySelectorAll('svg path')).toHaveLength(3);
  });
});

describe('math + verbatim components', () => {
  it('renders math lines as a span with raw TeX', () => {
    const span = math({ type: 'math', lines: ['$$x^2 + y^2 = z^2$$'] });
    expect(span.className).toBe('math');
    expect(span.innerHTML).toContain('$$x^2 + y^2 = z^2$$');
  });

  it('renders verbatim content inside a <pre>', () => {
    const pre = verbatim({ type: 'verbatim', lines: ['\\psline{->}(0,0)(1,1)'] });
    expect(pre.tagName).toBe('PRE');
    expect(pre.className).toBe('verbatim');
    expect(pre.textContent).toContain('\\psline{->}(0,0)(1,1)');
  });

  it('renders itemize and description lists', () => {
    const ul = list({ type: 'itemize', lines: ['\\item first', '\\item second'] });
    expect(ul.tagName).toBe('UL');
    expect(ul.querySelectorAll('li')).toHaveLength(2);

    const dl = list({ type: 'description', lines: ['\\item[Term] definition'] });
    expect(dl.tagName).toBe('DL');
    expect(dl.querySelector('dt')?.textContent).toBe('Term');
    expect(dl.querySelector('dd')?.textContent).toBe('definition');

    const ol = list({ type: 'enumerate', lines: ['\\item one'] });
    expect(ol.tagName).toBe('OL');
  });
});

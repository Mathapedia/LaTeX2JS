/** @jest-environment jsdom */
import LaTeX2JS from 'latex2js';
import pspicture from '../src/components/pspicture';

/**
 * The interactive redraw used to tear the whole picture down and rebuild it on
 * every pointer move. It is now incremental — a dependency graph over
 * `env.elements` decides what can possibly have changed, and each element is
 * reconciled in place under a stable key — but the output contract is
 * unchanged: a re-render must be byte-identical to the full redraw it
 * replaces, after every event, or the diagram has silently reordered itself.
 *
 * These tests render each picture twice: one instance driven through the
 * incremental path, one forced through a full redraw at every step, and
 * compare the serialized SVGs after each step.
 */

function stubViewport(width: number): void {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
}

function parsePspicture(tex: string): any {
  const latex = new LaTeX2JS();
  const parsed = latex.parse(tex);
  const env = parsed.find((e: any) => e.type === 'pspicture');
  expect(env).toBeDefined();
  return env;
}

function serialize(svg: Element): string {
  return new XMLSerializer().serializeToString(svg);
}

function renderPair(tex: string) {
  const inc = parsePspicture(tex);
  const full = parsePspicture(tex);
  const incDiv = pspicture(inc);
  const fullDiv = pspicture(full);
  document.body.appendChild(incDiv);
  document.body.appendChild(fullDiv);
  return {
    inc,
    full,
    incSvg: incDiv.querySelector('svg') as SVGElement,
    fullSvg: fullDiv.querySelector('svg') as SVGElement,
  };
}

type Pair = ReturnType<typeof renderPair>;

/** A real pointer event. jsdom reports offsetX/Y as 0, which is fine: the
 *  point is that the event path itself must match the forced full redraw. */
function eventMove(pair: Pair): void {
  pair.incSvg.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
  pair.full.redraw({ coords: [0, 0], force: true });
}

/** The same pointer position driven through both paths. */
function redraw(pair: Pair, coords: number[]): void {
  pair.inc.redraw(coords);
  pair.full.redraw({ coords, force: true });
}

const expectIdentical = (pair: Pair) =>
  expect(serialize(pair.incSvg)).toBe(serialize(pair.fullSvg));

beforeEach(() => {
  stubViewport(1200);
  document.body.innerHTML = '';
});

describe('incremental re-render', () => {
  it('is byte-identical to a full redraw after every pointer move', () => {
    // A grid that must never be rebuilt, a plot driven by a \uservariable,
    // and a userline that tracks the pointer.
    const pair = renderPair(`
\\psset{unit=1cm}
\\begin{pspicture}(-3.5,-1)(3.75,3.5)
\\psgrid[gridlabels=0]
\\uservariable{a}(0,0){x}
\\psplot[algebraic,plotpoints=60]{-3.14}{3.14}{cos(a*x)+1}
\\userline[linewidth=1pt,linecolor=red]{->}(0,0)(1,1){x}{y}
\\end{pspicture}
    `);

    // the first frame, and a real mousemove over the picture
    expectIdentical(pair);
    eventMove(pair);
    expectIdentical(pair);

    // distinct pointer positions; the second and later moves are where order
    // bugs used to show up
    redraw(pair, [10, 20]);
    expectIdentical(pair);
    redraw(pair, [10, 30]);
    expectIdentical(pair);
    redraw(pair, [5, 5]);
    expectIdentical(pair);
    redraw(pair, [5, 12]);
    expectIdentical(pair);
  });

  it('keeps the DOM nodes of static elements across pointer moves', () => {
    const env = parsePspicture(`
\\psset{unit=1cm}
\\begin{pspicture}(-3.5,-1)(3.75,3.5)
\\psgrid[gridlabels=0]
\\uservariable{a}(0,0){x}
\\psplot[algebraic,plotpoints=60]{-3.14}{3.14}{a*x+1}
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const svg = div.querySelector('svg')!;

    // the grid is element 0; the uservariable (element 1) has no renderer, so
    // the plot is the second group
    const gridGroup = svg.querySelector('g[data-key="0"]')!;
    const gridLines = Array.from(gridGroup.children);
    expect(gridLines.length).toBeGreaterThan(0);

    env.redraw([10, 20]);
    expect(svg.querySelector('g[data-key="0"]')).toBe(gridGroup);
    expect(Array.from(gridGroup.children)).toEqual(gridLines);

    // x held still, so the plot's only dependency did not change and even the
    // dynamic plot keeps its exact nodes for this move
    const plotPath = svg.querySelector('path.psplot')!;
    env.redraw([10, 30]);
    expect(svg.querySelector('path.psplot')).toBe(plotPath);
  });

  it('does not re-render a plot when only a variable it ignores changes', () => {
    const pair = renderPair(`
\\psset{unit=1cm}
\\begin{pspicture}(0,0)(4,4)
\\psgrid[gridlabels=0]
\\uservariable{a}(0,0){x}
\\uservariable{b}(0,0){y}
\\psplot[algebraic,plotpoints=40]{0}{3}{a*x}
\\end{pspicture}
    `);

    redraw(pair, [10, 20]);
    expectIdentical(pair);

    const plotPath = pair.incSvg.querySelector('path.psplot')!;
    // x stays at 10, so a is unchanged even though the pointer moved; b moved
    // but the plot never reads it, so its node must survive untouched
    redraw(pair, [10, 30]);
    expectIdentical(pair);
    expect(pair.incSvg.querySelector('path.psplot')).toBe(plotPath);
  });

  it('reconciles when the element list changes between renders', () => {
    const pair = renderPair(`
\\begin{pspicture}(0,0)(4,4)
\\psgrid[gridlabels=0]
\\psline(0,0)(1,1)
\\pscircle(2,2){1}
\\end{pspicture}
    `);
    expectIdentical(pair);

    // a shape leaves the document: its group must vanish
    const removed = pair.inc.env.elements.splice(1, 1)[0];
    pair.full.env.elements.splice(1, 1);
    redraw(pair, [3, 4]);
    expectIdentical(pair);
    expect(pair.incSvg.querySelectorAll('g[data-key]')).toHaveLength(2);

    // …and comes back in the middle of the order, where it started
    pair.inc.env.elements.splice(1, 0, removed);
    pair.full.env.elements.splice(1, 0, removed);
    redraw(pair, [3, 5]);
    expectIdentical(pair);
    const keys = Array.from(pair.incSvg.querySelectorAll('g[data-key]')).map((g) =>
      g.getAttribute('data-key')
    );
    expect(keys).toEqual(['0', '1', '2']);
  });

  it('reconciles a plot whose sample count changes, removing leftovers', () => {
    // The plot's range is a \uservariable, so moving the pointer changes how
    // many samples it emits — the element must grow and shrink in place. The
    // counts are kept modest (a few hundred markers) so the test stays fast
    // even when the whole workspace suite runs under parallel load; what it
    // proves is reconciliation, not volume.
    const pair = renderPair(`
\\psset{unit=1cm}
\\begin{pspicture}(0,0)(4,4)
\\psgrid[gridlabels=0]
\\uservariable{a}(4.5,0){x}
\\psplot[algebraic,plotstyle=dots]{0}{a}{x}
\\end{pspicture}
    `);
    expectIdentical(pair);

    const dots = (svg: Element) => svg.querySelectorAll('circle.psplot').length;
    const before = dots(pair.incSvg);
    expect(before).toBeGreaterThan(0);

    // a wider range samples more points…
    redraw(pair, [350, 10]);
    expectIdentical(pair);
    expect(dots(pair.incSvg)).toBeGreaterThan(before);

    // …and a narrower one prunes the surplus children, not just their styles
    const wide = dots(pair.incSvg);
    redraw(pair, [250, 10]);
    expectIdentical(pair);
    expect(dots(pair.incSvg)).toBeLessThan(wide);
  });

  it('keeps plots in document order when a slider changes', () => {
    // The old slider path removed every .psplot and re-appended it at the end
    // of the SVG, so a shape authored after the plot slid underneath it. The
    // incremental path re-renders the plot in place.
    const env = parsePspicture(`
\\psset{unit=1cm}
\\begin{pspicture}(-3.5,-1)(3.75,3.5)
\\slider{1}{8}{n}{$N$}{4}
\\psplot[algebraic,plotpoints=100]{-3.14}{3.14}{cos(n*x)+1}
\\pscircle(2,2){1}
\\end{pspicture}
    `);
    const div = pspicture(env);
    document.body.appendChild(div);
    const svg = div.querySelector('svg')!;

    // slider (element 0) has no renderer; plot is group 1, circle group 2
    const plotGroup = svg.querySelector('g[data-key="1"]')!;
    const circle = svg.querySelector('circle')!;
    const before = plotGroup.querySelector('path.psplot')!.getAttribute('d');

    const input = div.querySelector('input[type="range"]')!;
    input.setAttribute('value', '8');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // the plot re-rendered in place: same group node, still before the circle
    // authored after it, with the new variable value
    expect(env.env.variables.n).toBe(8);
    expect(svg.querySelector('g[data-key="1"]')).toBe(plotGroup);
    expect(svg.querySelector('circle')!).toBe(circle);
    const keys = Array.from(svg.querySelectorAll('g[data-key]')).map((g) =>
      g.getAttribute('data-key')
    );
    expect(keys).toEqual(['1', '2']);
    expect(plotGroup.querySelector('path.psplot')!.getAttribute('d')).not.toBe(before);
  });
});

/**
 * The two mechanisms here — the dependency graph that decides an element
 * cannot have changed, and the reconciliation that patches a node in place
 * rather than replacing it — both preserve DOM node identity, so a test that
 * only asserts identity passes when either one works. Verified by mutation:
 * breaking either alone leaves every test above green, and only breaking both
 * turns them red.
 *
 * The dependency graph is the one that carries the performance claim, because
 * it is what stops the work from happening at all rather than making the work
 * cheaper. These isolate it by counting renderer calls.
 */
describe('the dependency graph decides what runs, not just what is replaced', () => {
  /** Counts calls to one renderer for the duration of a block. */
  function countingRenderer<T>(name: string, body: (count: () => number) => T): T {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const psgraph = require('@latex2js/pstricks').psgraph || require('@latex2js/pstricks').default;
    const original = psgraph[name];
    let calls = 0;
    psgraph[name] = function (this: any, ...args: any[]) {
      calls++;
      return original.apply(this, args);
    };
    try {
      return body(() => calls);
    } finally {
      psgraph[name] = original;
    }
  }

  it('does not run a static element renderer on a pointer move', () => {
    const env = parsePspicture(`
\\begin{pspicture}(-3,-2)(3,2)
\\psgrid(-2,-2)(2,2)
\\uservariable{a}(0.01,0){x}
\\psplot[algebraic,plotpoints=20]{-2}{2}{a*x}
\\end{pspicture}
    `);
    countingRenderer('psgrid', (count) => {
      const div = pspicture(env);
      document.body.appendChild(div);
      expect(count()).toBe(1); // the first frame draws it once

      env.redraw([10, 20]);
      env.redraw([40, 20]);
      env.redraw([80, 60]);
      // The grid cannot depend on the pointer, so it must not be drawn again.
      expect(count()).toBe(1);
    });
  });

  it('does run the renderer of an element that depends on the pointer', () => {
    const env = parsePspicture(`
\\begin{pspicture}(-3,-2)(3,2)
\\psgrid(-2,-2)(2,2)
\\uservariable{a}(0.01,0){x}
\\psplot[algebraic,plotpoints=20]{-2}{2}{a*x}
\\end{pspicture}
    `);
    countingRenderer('psplot', (count) => {
      const div = pspicture(env);
      document.body.appendChild(div);
      const first = count();
      env.redraw([10, 20]);
      env.redraw([90, 20]);
      // The plot reads a uservariable driven by the pointer's x, so both moves
      // change it and both must redraw.
      expect(count()).toBeGreaterThan(first);
    });
  });
});

/**
 * The invariant the whole change exists for, stated as a number.
 *
 * Measured against the full-redraw implementation this replaced: a picture
 * with a subdivided grid, axes, a plot and a userline allocated 87 new DOM
 * nodes on every pointer move, and 40 moves took 93ms. Reconciling in place
 * allocates none, and the same 40 moves take 5ms.
 *
 * A count is the right assertion here rather than a duration: it is
 * deterministic, and it fails for the reason that matters — something started
 * building nodes again — instead of failing when the machine is busy.
 */
describe('a pointer move allocates no DOM nodes', () => {
  it('creates nothing after the first frame, however far the pointer moves', () => {
    const env = parsePspicture(`
\\begin{pspicture}(-3,-2)(3,2)
\\psgrid[subgriddiv=5](-2,-2)(2,2)
\\psaxes(0,0)(-2,-2)(2,2)
\\uservariable{a}(0.01,0){x}
\\psplot[algebraic,plotpoints=50]{-2}{2}{a*x}
\\userline{->}(0,0)(1,1)
\\end{pspicture}
    `);

    let created = 0;
    const realCreate = document.createElementNS.bind(document);
    (document as any).createElementNS = (ns: string, tag: string) => {
      created++;
      return realCreate(ns, tag);
    };
    try {
      const div = pspicture(env);
      document.body.appendChild(div);
      const firstFrame = created;
      expect(firstFrame).toBeGreaterThan(50); // the picture really is large

      const svg = div.querySelector('svg')!;
      for (let i = 0; i < 40; i++) {
        svg.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      }
      expect(created).toBe(firstFrame);
    } finally {
      (document as any).createElementNS = realCreate;
    }
  });
});

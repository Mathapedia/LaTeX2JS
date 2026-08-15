import { Expressions, Functions } from '../src/lib/pstricks';

/**
 * PSTricks data-extraction unit tests. Functions are called with a minimal
 * pspicture-like context (the same shape the parser provides).
 */
function makeContext() {
  // pspicture(-5,-5)(5,5): w=10, h=10, x1=5, y1=5, xunit=50, yunit=50
  // X(v) = (10 - (5 - v)) * 50 = (5 + v) * 50
  // Y(v) = (5 - v) * 50
  return {
    xunit: 50,
    yunit: 50,
    x0: -5,
    y0: -5,
    x1: 5,
    y1: 5,
    w: 10,
    h: 10,
    variables: {},
  } as any;
}

function match(exp: RegExp, raw: string): RegExpMatchArray {
  const m = raw.match(exp);
  expect(m).not.toBeNull();
  return m!;
}

describe('pstricks Functions', () => {
  it('psline maps coordinates and arrow types', () => {
    const ctx = makeContext();
    const m = match(Expressions.psline, '\\psline{->}(0,-3.75)(0,3.75)');
    const data = Functions.psline.call(ctx, m);
    expect(data.x1).toBe(250); // X(0)
    expect(data.y1).toBe(437.5); // Y(-3.75)
    expect(data.x2).toBe(250);
    expect(data.y2).toBe(62.5); // Y(3.75)
    expect(data.arrows).toEqual([0, 1]);
  });

  it('psline parses linewidth units', () => {
    const ctx = makeContext();
    const m = match(Expressions.psline, '\\psline[linewidth=1.5 pt](0,0)(1,1)');
    const data = Functions.psline.call(ctx, m);
    expect(data.linewidth).toBeCloseTo(2, 1);
  });

  it('pscircle computes center, radius and filled star', () => {
    const ctx = makeContext();
    const plain = Functions.pscircle.call(ctx, match(Expressions.pscircle, '\\pscircle(0,0){3}'));
    expect(plain.cx).toBe(250);
    expect(plain.cy).toBe(250);
    expect(plain.r).toBe(150);
    expect(plain.filled).toBe(false);

    const starred = Functions.pscircle.call(ctx, match(Expressions.pscircle, '\\pscircle*(0,0){3}'));
    expect(starred.filled).toBe(true);
  });

  it('psarc converts angles to radians and computes endpoints', () => {
    const ctx = makeContext();
    const m = match(Expressions.psarc, '\\psarc(0,0){2}{0}{90}');
    const data = Functions.psarc.call(ctx, m);
    expect(data.r).toBe(100);
    expect(data.angleA).toBe(0);
    expect(data.angleB).toBeCloseTo(Math.PI / 2);
    expect(data.A.x).toBeCloseTo(250 + 100); // cos(0)=1
    expect(data.B.y).toBeCloseTo(250 - 100); // sin(90)=1 (Y flips)
  });

  it('pspolygon parses coordinate lists and filled star', () => {
    const ctx = makeContext();
    const m = match(Expressions.pspolygon, '\\pspolygon*(0,0)(1,1)(2,0)');
    const data = Functions.pspolygon.call(ctx, m);
    expect(data.data).toHaveLength(6);
    expect(data.filled).toBe(true);
  });

  it('psdots collects all points', () => {
    const ctx = makeContext();
    const m = match(Expressions.psdots, '\\psdots(1,1)(2,2)');
    const data = Functions.psdots.call(ctx, m);
    expect(data.data).toHaveLength(4);
  });

  it('psgrid defaults to the pspicture bounds', () => {
    const ctx = makeContext();
    const m = match(Expressions.psgrid, '\\psgrid');
    const data = Functions.psgrid.call(ctx, m);
    // X(-5)=0, X(5)=500; Y(-5)=500, Y(5)=0 — normalized min/max
    expect(data.x0).toBe(0);
    expect(data.x1).toBe(500);
    expect(data.y0).toBe(0);
    expect(data.y1).toBe(500);
    expect(data.xunit).toBe(50);
  });

  it('psellipse computes radii in pixels', () => {
    const ctx = makeContext();
    const m = match(Expressions.psellipse, '\\psellipse[fillstyle=solid,fillcolor=lightblue](2,2)(1,0.5)');
    const data = Functions.psellipse.call(ctx, m);
    expect(data.cx).toBe(350); // X(2)
    expect(data.cy).toBe(150); // Y(2)
    expect(data.rx).toBe(50);
    expect(data.ry).toBe(25);
    expect(data.fillcolor).toBe('lightblue');
  });

  it('psbezier captures four control points', () => {
    const ctx = makeContext();
    const m = match(Expressions.psbezier, '\\psbezier(0,0)(1,2)(2,2)(3,0)');
    const data = Functions.psbezier.call(ctx, m);
    expect(data.x1).toBe(250);
    expect(data.y1).toBe(250);
    expect(data.x4).toBe(400); // X(3)
    expect(data.y4).toBe(250);
  });

  it('pscurve and psccurve collect points with closure flag', () => {
    const ctx = makeContext();
    const open = Functions.pscurve.call(ctx, match(Expressions.pscurve, '\\pscurve(0,0)(1,1)(2,0)'));
    expect(open.closed).toBe(false);
    expect(open.data).toHaveLength(6);

    const closed = Functions.pscurve.call(ctx, match(Expressions.psccurve, '\\psccurve(0,1)(1,2)(2,1)'));
    expect(closed.closed).toBe(true);
  });

  it('pswedge computes pie-slice geometry', () => {
    const ctx = makeContext();
    const m = match(Expressions.pswedge, '\\pswedge(2,2){1}{0}{90}');
    const data = Functions.pswedge.call(ctx, m);
    expect(data.r).toBe(50);
    expect(data.angleA).toBe(0);
    expect(data.angleB).toBeCloseTo(Math.PI / 2);
    expect(data.A).toBeDefined();
    expect(data.B).toBeDefined();
  });

  it('pscustom captures options and body', () => {
    const ctx = makeContext();
    const m = match(Expressions.pscustom, '\\pscustom[fillstyle=solid,fillcolor=gray!40]{\\psline(0,0)(4,1.2)}');
    const data = Functions.pscustom.call(ctx, m);
    expect(data.fillstyle).toBe('solid');
    // xcolor tints are resolved at parse time; passing `gray!40` through to the
    // browser produced an unusable fill value, which renders as black.
    expect(data.fillcolor).toBe('rgb(204,204,204)');
    expect(data.body).toContain('\\psline(0,0)(4,1.2)');
  });

  it('multido parses the counter spec', () => {
    const ctx = makeContext();
    const m = match(Expressions.multido, '\\multido{\\i=10+-1}{5}{\\psline(\\i,0)(\\i,1)}');
    const data = Functions.multido.call(ctx, m);
    expect(data.variable).toBe('i');
    expect(data.start).toBe(10);
    expect(data.step).toBe(-1);
    expect(data.count).toBe(5);
    expect(data.body).toContain('\\psline(\\i,0)(\\i,1)');
  });

  it('psplot honors plotpoints', () => {
    const ctx = makeContext();
    const m = match(Expressions.psplot, '\\psplot[algebraic,plotpoints=11]{0}{1}{x*x}');
    const data = Functions.psplot.call(ctx, m);
    // 11 samples → 22 numbers
    expect(data.data).toHaveLength(22);
  });

  it('psplot evaluates ^ power (PSTricks, not JS XOR)', () => {
    const ctx = makeContext();
    const m = match(Expressions.psplot, '\\psplot[algebraic,plotpoints=3]{0}{2}{x^2}');
    const data = Functions.psplot.call(ctx, m);
    // samples at x=0,1,2 → y = 0,1,4 → pixel Y values
    const ys = [data.data[1], data.data[3], data.data[5]];
    // Y(v) = (5 - v) * 50 → Y(0)=250, Y(1)=200, Y(4)=50
    expect(ys[0]).toBe(250);
    expect(ys[1]).toBe(200);
    expect(ys[2]).toBe(50);
  });

  it('psplot evaluates implicit multiplication', () => {
    const ctx = makeContext();
    const m = match(Expressions.psplot, '\\psplot[algebraic,plotpoints=2]{1}{2}{2x}');
    const data = Functions.psplot.call(ctx, m);
    const ys = [data.data[1], data.data[3]];
    // Y(2)=150, Y(4)=50
    expect(ys[0]).toBe(150);
    expect(ys[1]).toBe(50);
  });

  it('psplot evaluates user variables in the expression', () => {
    const ctx = makeContext();
    ctx.variables = { n: 4 };
    const m = match(Expressions.psplot, '\\psplot[algebraic,plotpoints=2]{0}{1}{n*x}');
    const data = Functions.psplot.call(ctx, m);
    const ys = [data.data[1], data.data[3]];
    expect(ys[0]).toBe(250); // Y(0)
    expect(ys[1]).toBe(50); // Y(4)
  });

  it('uservariable evaluates its initial expression', () => {
    const ctx = makeContext();
    const m = match(Expressions.uservariable, '\\uservariable{alpha}(1,1){x^2}');
    const data = Functions.uservariable.call(ctx, m);
    // x=1 in user coords → value = 1
    expect(data.value).toBeCloseTo(1);
  });

  it('userline evaluates head/tail expressions against x,y', () => {
    const ctx = makeContext();
    const m = match(
      Expressions.userline,
      '\\userline{->}(0,0)(2,2){-x}{-y}'
    );
    const data = Functions.userline.call(ctx, m);
    // Xinv(0)= -5, so -x = 5 → X(5)=500; Yinv(0)=5 → -y=-5 → Y(-5)=500
    expect(data.userx([0, 0])).toBe(500);
    expect(data.usery([0, 0])).toBe(500);
  });

  it('userline evaluates ternary conditional expressions', () => {
    const ctx = makeContext();
    const m = match(
      Expressions.userline,
      '\\userline{->}(0,0)(2,2){(x>0) ? 3 * cos( atan(-y/x) ) : -3 * cos( atan(-y/x) ) }{0}'
    );
    const data = Functions.userline.call(ctx, m);
    // at coords (0,0): userx → x=0,y=0 → (x>0)=false → -3*cos(atan(0/0))...
    // atan(0/0) is NaN in JS → cos(NaN)=NaN → X(NaN) → 0 guard
    const result = data.userx([0, 0]);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('slider seeds variables and registers itself', () => {
    const ctx = makeContext();
    const m = match(Expressions.slider, '\\slider{1}{8}{n}{$N$}{4}');
    const data = Functions.slider.call(ctx, m);
    expect(data.variable).toBe('n');
    expect(data.value).toBe(4);
    expect(ctx.variables.n).toBe(4);
    expect(ctx.sliders).toHaveLength(1);
  });
});

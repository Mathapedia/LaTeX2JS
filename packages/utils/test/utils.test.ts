import {
  convertUnits,
  parseOptions,
  parseArrows,
  evaluate,
  X,
  Y,
  Xinv,
  Yinv,
  simplerepl,
  matchrepl,
} from '../src/index';

describe('utils', () => {
  it('convertUnits maps cm/in to pixels', () => {
    expect(convertUnits('1cm')).toBe(50);
    expect(convertUnits('2cm')).toBe(100);
    expect(convertUnits('1in')).toBe(20);
  });

  it('parseOptions converts [a=1, b=2] to an object', () => {
    expect(parseOptions('[showorigin=false, labels=none, Dx=3.14]')).toEqual({
      showorigin: 'false',
      labels: 'none',
      Dx: '3.14',
    });
  });

  it('parseArrows detects arrowheads and dots', () => {
    expect(parseArrows('{->}')).toEqual({ arrows: [0, 1], dots: [0, 0] });
    expect(parseArrows('{<-}')).toEqual({ arrows: [1, 0], dots: [0, 0] });
    expect(parseArrows('{<->}')).toEqual({ arrows: [1, 1], dots: [0, 0] });
    expect(parseArrows('{*-*}')).toEqual({ arrows: [0, 0], dots: [1, 1] });
    expect(parseArrows('{}')).toEqual({ arrows: [0, 0], dots: [0, 0] });
  });

  it('X/Y transforms map user coordinates to pixels', () => {
    const ctx: any = { x0: -5, y0: -5, x1: 5, y1: 5, w: 10, h: 10, xunit: 50, yunit: 50 };
    // X(v) = (w - (x1 - v)) * xunit ; Y(v) = (y1 - v) * yunit
    expect(X.call(ctx, 0)).toBe(250);
    expect(X.call(ctx, -5)).toBe(0);
    expect(X.call(ctx, 5)).toBe(500);
    expect(Y.call(ctx, 0)).toBe(250);
    expect(Y.call(ctx, -5)).toBe(500);
    expect(Y.call(ctx, 5)).toBe(0);
    // inverse transforms round-trip
    expect(Xinv.call(ctx, X.call(ctx, 2))).toBeCloseTo(2);
    expect(Yinv.call(ctx, Y.call(ctx, 2))).toBeCloseTo(2);
  });

  it('X/Y report input they cannot transform instead of inventing a coordinate', () => {
    // Returning 0 here is not a guard: 0 is a real position, so a command with
    // one unusable value drew a plausible shape at the origin and reported
    // nothing. NaN is not drawable, which is what lets callers skip it.
    const ctx: any = { x0: -5, y0: -5, x1: 5, y1: 5, w: 10, h: 10, xunit: 50, yunit: 50 };
    expect(X.call(ctx, 'not-a-number')).toBeNaN();
    expect(Y.call(ctx, NaN)).toBeNaN();
    expect(X.call(ctx, undefined as any)).toBeNaN();
  });

  it('X/Y report an unusable context', () => {
    expect(X.call({ w: NaN, x1: 5, xunit: 50 } as any, 1)).toBeNaN();
    expect(X.call({ w: 10, x1: 5, xunit: 0 } as any, 1)).toBeNaN();
    expect(Y.call({ y1: 5, yunit: -1 } as any, 1)).toBeNaN();
  });

  it('X/Y still transform usable input', () => {
    const ctx: any = { x0: -5, y0: -5, x1: 5, y1: 5, w: 10, h: 10, xunit: 50, yunit: 50 };
    expect(X.call(ctx, 0)).toBe(250);
    expect(X.call(ctx, '2')).toBe(350);
    expect(Y.call(ctx, 0)).toBe(250);
  });

  it('evaluate evaluates math expressions with Math and variables', () => {
    const ctx: any = { variables: { n: 4 } };
    expect(evaluate.call(ctx, '2+2')).toBe(4);
    expect(evaluate.call(ctx, 'n*2')).toBe(8);
    expect(evaluate.call(ctx, 'cos(0)')).toBe(1);
    expect(evaluate.call(ctx, '7')).toBe(7);
  });

  it('simplerepl replaces a regex with a fixed string', () => {
    const fn = simplerepl(/---/g, '&mdash;');
    expect(fn([], 'a---b---c')).toBe('a&mdash;b&mdash;c');
  });

  it('matchrepl replaces matches via a callback', () => {
    const fn = matchrepl(/\\emph\{([^}]*)\}/, (m: RegExpMatchArray) => '<i>' + m[1] + '</i>');
    const matches = '\\emph{hi} and \\emph{bye}'.match(/\\emph\{[^}]*\}/g) || [];
    expect(fn(matches, '\\emph{hi} and \\emph{bye}')).toBe('<i>hi</i> and <i>bye</i>');
  });
});

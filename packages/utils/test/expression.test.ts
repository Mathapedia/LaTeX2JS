import { parseExpression, ExpressionError } from '../src/index';

function ev(source: string, scope?: Record<string, number>): number {
  return parseExpression(source).evaluate(scope);
}

describe('parseExpression', () => {
  it('evaluates arithmetic with precedence', () => {
    expect(ev('2+3*4')).toBe(14);
    expect(ev('(2+3)*4')).toBe(20);
    expect(ev('10/4')).toBe(2.5);
    expect(ev('7-2-1')).toBe(4);
  });

  it('supports power with ^ (right associative)', () => {
    expect(ev('2^3')).toBe(8);
    expect(ev('2^3^2')).toBe(512); // 2^(3^2)
    expect(ev('x^2', { x: 3 })).toBe(9);
    expect(ev('2^-2')).toBeCloseTo(0.25);
    expect(ev('-2^2')).toBe(-4); // -(2^2), math convention
  });

  it('supports implicit multiplication', () => {
    expect(ev('2x', { x: 3 })).toBe(6);
    expect(ev('2(x+1)', { x: 3 })).toBe(8);
    expect(ev('(x+1)(x+2)', { x: 3 })).toBe(20);
    expect(ev('2sin(x)', { x: 0 })).toBe(0);
    expect(ev('2x^2', { x: 3 })).toBe(18);
    expect(ev('3cos(0)')).toBe(3);
  });

  it('supports unary minus and plus', () => {
    expect(ev('-x', { x: 5 })).toBe(-5);
    expect(ev('+3')).toBe(3);
    expect(ev('-3*-2')).toBe(6);
    expect(ev('-(x+1)', { x: 2 })).toBe(-3);
  });

  it('supports comparisons and ternary conditionals', () => {
    expect(ev('x > 0 ? 3 : -3', { x: 2 })).toBe(3);
    expect(ev('x > 0 ? 3 : -3', { x: -2 })).toBe(-3);
    expect(ev('(x>0) ? 3 * cos( atan(-y/x) ) : -3 * cos( atan(-y/x) )', { x: 2, y: 2 })).toBeCloseTo(
      2.1213,
      3
    );
    expect(ev('x <= 1 ? 1 : 0', { x: 0.5 })).toBe(1);
  });

  it('supports math functions', () => {
    expect(ev('cos(0)')).toBe(1);
    expect(ev('sin(pi/2)')).toBeCloseTo(1);
    expect(ev('pow(2,3)')).toBe(8);
    expect(ev('sqrt(16)')).toBe(4);
    expect(ev('abs(-5)')).toBe(5);
    expect(ev('atan2(1,1)')).toBeCloseTo(Math.PI / 4);
    expect(ev('min(3,1,2)')).toBe(1);
    expect(ev('max(3,1,2)')).toBe(3);
    expect(ev('ln(E)')).toBe(1);
    expect(ev('floor(2.7)')).toBe(2);
    expect(ev('round(2.5)')).toBe(3);
  });

  it('supports math constants', () => {
    expect(ev('pi')).toBeCloseTo(Math.PI);
    expect(ev('π')).toBeCloseTo(Math.PI);
    expect(ev('2*E')).toBeCloseTo(2 * Math.E);
  });

  it('reads user variables from the scope', () => {
    expect(ev('n*x + a', { n: 4, x: 2, a: 1 })).toBe(9);
    expect(ev('alpha * sin(theta*x)/(x*phi)', { alpha: 2, theta: 3, x: 1, phi: 4 })).toBeCloseTo(
      (2 * Math.sin(3)) / 4
    );
  });

  it('lists referenced variables', () => {
    const compiled = parseExpression('2x + n*y');
    expect(compiled.variables().sort()).toEqual(['n', 'x', 'y']);
  });

  it('re-evaluates cheaply with a changing scope', () => {
    const compiled = parseExpression('a*sin(n*x)/(n*x)');
    const scope: any = { a: 2, n: 4, x: 0.5 };
    const first = compiled.evaluate(scope);
    scope.x = 1;
    const second = compiled.evaluate(scope);
    expect(first).not.toBe(second);
    expect(Number.isFinite(first) && Number.isFinite(second)).toBe(true);
  });

  it('throws ExpressionError with position on bad input', () => {
    expect(() => parseExpression('2 +')).toThrow(ExpressionError);
    expect(() => parseExpression('2 +* 3')).toThrow(ExpressionError);
    expect(() => parseExpression('')).toThrow(ExpressionError);
    expect(() => parseExpression('(x+1')).toThrow(ExpressionError);
    try {
      parseExpression('2 +');
      fail('should have thrown');
    } catch (e) {
      expect((e as ExpressionError).position).toBeGreaterThanOrEqual(0);
    }
  });

  it('compiles to a debuggable JS string', () => {
    const js = parseExpression('x^2 + 2x').toJS();
    expect(js).toContain('**');
    expect(js).toContain('v.x');
  });
});

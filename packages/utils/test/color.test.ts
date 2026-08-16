import { resolveColor, parseOptions } from '../src';

/**
 * xcolor tint expressions reach the browser as a fill value. An unparsable one
 * is not ignored — it falls back to black, so `gray!40` painted a light grey
 * plane solid black with nothing to indicate anything had gone wrong.
 */
describe('resolveColor', () => {
  it('mixes a tint against white', () => {
    // 40% of gray(128) plus 60% of white(255) = 204
    expect(resolveColor('gray!40')).toBe('rgb(204,204,204)');
  });

  it('mixes against a named second operand', () => {
    expect(resolveColor('red!50!blue')).toBe('rgb(128,0,128)');
  });

  it.each([
    ['black!0', 'rgb(255,255,255)'],
    ['black!100', 'rgb(0,0,0)'],
    ['white!50', 'rgb(255,255,255)'],
  ])('resolves the endpoints: %s', (input, expected) => {
    expect(resolveColor(input)).toBe(expected);
  });

  it.each(['red', 'lightblue', '#ff0000', 'rgb(1,2,3)'])(
    'leaves %s untouched when there is no mix term',
    (input) => {
      expect(resolveColor(input)).toBe(input);
    },
  );

  it.each(['notacolor!40', 'gray!notanumber', 'gray!40!notacolor'])(
    'returns %s unchanged rather than guessing',
    (input) => {
      expect(resolveColor(input)).toBe(input);
    },
  );

  it('clamps a percentage outside the range', () => {
    expect(resolveColor('gray!500')).toBe(resolveColor('gray!100'));
    expect(resolveColor('gray!-20')).toBe(resolveColor('gray!0'));
  });
});

describe('parseOptions resolves colour-valued keys', () => {
  it('resolves every colour key', () => {
    const o = parseOptions('[fillcolor=gray!40,linecolor=red!50!blue,hatchcolor=gray!40]');
    expect(o.fillcolor).toBe('rgb(204,204,204)');
    expect(o.linecolor).toBe('rgb(128,0,128)');
    expect(o.hatchcolor).toBe('rgb(204,204,204)');
  });

  it('leaves non-colour options alone even when they contain a bang', () => {
    const o = parseOptions('[linewidth=2pt,fillstyle=solid,labels=none]');
    expect(o.linewidth).toBe('2pt');
    expect(o.fillstyle).toBe('solid');
    expect(o.labels).toBe('none');
  });
});

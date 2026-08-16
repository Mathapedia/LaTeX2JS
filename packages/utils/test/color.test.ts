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

  it.each(['lightblue', '#ff0000', 'rgb(1,2,3)', 'notacolor'])(
    'leaves %s untouched when it is not an xcolor name',
    (input) => {
      expect(resolveColor(input)).toBe(input);
    },
  );

  // Nine of xcolor's base colours name a different colour in CSS. Handing the
  // name straight to the browser drew the CSS one, so a document asking for
  // pure green got the much darker #008000.
  it.each([
    ['green', 'rgb(0,255,0)'],
    ['purple', 'rgb(191,0,64)'],
    ['violet', 'rgb(128,0,128)'],
    ['lime', 'rgb(191,255,0)'],
    ['orange', 'rgb(255,128,0)'],
    ['brown', 'rgb(191,128,64)'],
    ['pink', 'rgb(255,191,191)'],
    ['darkgray', 'rgb(64,64,64)'],
    ['lightgray', 'rgb(191,191,191)'],
  ])('resolves the plain name %s to its xcolor value', (input, expected) => {
    expect(resolveColor(input)).toBe(expected);
  });

  it.each([
    ['red', 'rgb(255,0,0)'],
    ['blue', 'rgb(0,0,255)'],
    ['cyan', 'rgb(0,255,255)'],
    ['teal', 'rgb(0,128,128)'],
    ['olive', 'rgb(128,128,0)'],
  ])('agrees with CSS on %s, and still resolves it', (input, expected) => {
    expect(resolveColor(input)).toBe(expected);
  });

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

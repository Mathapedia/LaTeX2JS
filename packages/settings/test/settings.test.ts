import Settings from '../src/index';

describe('@latex2js/settings', () => {
  it('linecolor/linestyle/fillstyle setters', () => {
    const o: any = {};
    Settings.Functions.linecolor(o, 'red');
    Settings.Functions.linestyle(o, 'dashed');
    Settings.Functions.fillstyle(o, 'solid');
    Settings.Functions.fillcolor(o, 'gray!40');
    expect(o).toEqual({
      linecolor: 'red',
      linestyle: 'dashed',
      fillstyle: 'solid',
      fillcolor: 'gray!40',
    });
  });

  it('unit sets xunit/yunit/runit together', () => {
    const o: any = {};
    Settings.Functions.unit(o, '1cm');
    expect(o.unit).toBe(50);
    expect(o.runit).toBe(50);
    expect(o.xunit).toBe(50);
    expect(o.yunit).toBe(50);
  });

  it('xunit/yunit set independently', () => {
    const o: any = {};
    Settings.Functions.xunit(o, '1in');
    Settings.Functions.yunit(o, '0.5cm');
    expect(o.xunit).toBe(20);
    expect(o.yunit).toBe(25);
  });

  it('expressions match the setting keys', () => {
    expect(Settings.Expressions.linecolor.test('linecolor')).toBe(true);
    expect(Settings.Expressions.xunit.test('xunit')).toBe(true);
    expect(Settings.Expressions.unit.test('unit=2cm')).toBe(true);
    expect(Settings.Expressions.linecolor.test('fillcolor')).toBe(false);
  });
});

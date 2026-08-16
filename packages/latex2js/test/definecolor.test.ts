import LaTeX2JS from '../src';

/**
 * `\definecolor` is how a document names a colour xcolor does not define.
 *
 * It matters for more than convenience: a page written against browser colour
 * names — `lightblue`, say — is not valid LaTeX at all, because xcolor rejects
 * the name outright (`! Package xcolor Error: Undefined color 'lightblue'`).
 * Defining the colour is what lets such a page keep the exact shade it wants
 * and still compile, instead of the renderer quietly accepting a name the
 * specification does not have.
 */
function shape(tex: string, name = 'pscircle'): any {
  const l = new LaTeX2JS();
  const parsed: any = l.parse(tex);
  const env = parsed.find((e: any) => e.type === 'pspicture');
  expect(env).toBeDefined();
  return (env.plot[name] || [])[0]?.data;
}

const picture = (body: string) =>
  `\\begin{pspicture}(-3,-2.5)(3,2.5)\n${body}\n\\end{pspicture}`;

describe('definecolor names a colour the document can use', () => {
  it('reads the RGB model, 0 to 255', () => {
    const c = shape(
      '\\definecolor{lightblue}{RGB}{173,216,230}\n' + picture('\\pscircle[linecolor=lightblue](0,0){1}')
    );
    expect(c.linecolor).toBe('rgb(173,216,230)');
  });

  it('reads the rgb model, fractions', () => {
    const c = shape(
      '\\definecolor{half}{rgb}{0.5,0,1}\n' + picture('\\pscircle[linecolor=half](0,0){1}')
    );
    expect(c.linecolor).toBe('rgb(128,0,255)');
  });

  it('reads the gray model', () => {
    const c = shape(
      '\\definecolor{mid}{gray}{0.5}\n' + picture('\\pscircle[linecolor=mid](0,0){1}')
    );
    expect(c.linecolor).toBe('rgb(128,128,128)');
  });

  it('reads the HTML model', () => {
    const c = shape(
      '\\definecolor{brand}{HTML}{ADD8E6}\n' + picture('\\pscircle[linecolor=brand](0,0){1}')
    );
    expect(c.linecolor).toBe('rgb(173,216,230)');
  });

  it('reads the cmyk model', () => {
    const c = shape(
      '\\definecolor{ink}{cmyk}{0,1,1,0}\n' + picture('\\pscircle[linecolor=ink](0,0){1}')
    );
    expect(c.linecolor).toBe('rgb(255,0,0)');
  });

  it('lets a definition shadow an xcolor built-in, as xcolor does', () => {
    const c = shape(
      '\\definecolor{purple}{RGB}{128,0,128}\n' + picture('\\pscircle[linecolor=purple](0,0){1}')
    );
    expect(c.linecolor).toBe('rgb(128,0,128)');
  });

  it('is usable as the base of a tint expression', () => {
    const c = shape(
      '\\definecolor{brand}{RGB}{200,0,0}\n' + picture('\\pscircle[linecolor=brand!50](0,0){1}')
    );
    // Fifty percent against white.
    expect(c.linecolor).toBe('rgb(228,128,128)');
  });

  it('does not render the declaration as text', () => {
    const l = new LaTeX2JS();
    const parsed: any = l.parse('\\definecolor{brand}{RGB}{1,2,3}\nSome prose.\n');
    const text = parsed.map((o: any) => (o.lines || []).join('\n')).join('\n');
    expect(text).not.toContain('definecolor');
    expect(text).toContain('Some prose.');
  });
});

describe('definitions belong to a document, not to the parser', () => {
  it('does not leak into the next parse of the same instance', () => {
    const l = new LaTeX2JS();
    l.parse('\\definecolor{brand}{RGB}{1,2,3}\n' + picture('\\pscircle[linecolor=brand](0,0){1}'));
    const second: any = l.parse(picture('\\pscircle[linecolor=brand](0,0){1}'));
    const env = second.find((e: any) => e.type === 'pspicture');
    // Undefined now, so the name passes through untouched rather than keeping
    // the previous document's value.
    expect(env.plot.pscircle[0].data.linecolor).toBe('brand');
  });
});

describe('a definition it cannot read is reported, not guessed at', () => {
  it('warns about an unknown colour model', () => {
    const l: any = new LaTeX2JS();
    l.parse('\\definecolor{odd}{spectral}{1,2,3}\n' + picture('\\pscircle(0,0){1}'));
    const warnings = (l.lastDiagnostics || []).filter((d: any) => /definecolor/.test(d.message));
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain('spectral');
  });
});

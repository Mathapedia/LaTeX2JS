import LaTeX2JS from '../src';

/**
 * LaTeX2JS accepts a superset of PSTricks. Until a document could declare which
 * language it was written in, an extension was indistinguishable from a defect.
 * A document declares `\psset{dialect=latex2js}`, or the embedding application
 * sets it once; anything undeclared is read as PSTricks and reported.
 */
const extensions = (tex: string, dialect?: 'pstricks' | 'latex2js') => {
  const l = new LaTeX2JS();
  if (dialect) l.dialect = dialect;
  l.parse(tex);
  return ((l as any).lastDiagnostics || [])
    .filter((d: any) => /LaTeX2JS extension/.test(d.message))
    .map((d: any) => ({ line: d.line, message: d.message }));
};

const picture = (body: string, prelude = '') =>
  `${prelude}\\begin{pspicture}(-4,-4)(4,4)\n${body}\n\\end{pspicture}\n`;

describe('an undeclared document is read as PSTricks', () => {
  it.each([
    ['\\userline{->}(0,0)(2,2)', '\\userline'],
    ['\\uservariable{a}(0,0){x}', '\\uservariable'],
    ['\\slider{1}{8}{n}{N}{4}', '\\slider'],
    ['\\psplot[algebraic]{-2}{2}{x^2}', 'bare option flag'],
    ['\\psplot[algebraic=true]{-2}{2}{pow(x,2)}', 'pow()'],
    ['\\psplot[algebraic=true]{-2}{2}{log(x)}', 'log()'],
    ['\\pscircle[linecolor=lightblue](0,0){1}', 'CSS colour name'],
    ['\\psplot[algebraic=true,plotpoints=1]{-2}{2}{x}', 'plotpoints=1'],
    ['\\psplot[algebraic=true]{a}{2}{x}', 'variable plot bound'],
  ])('reports %s', (body, construct) => {
    const found = extensions(picture(body));
    expect(found.map((f: any) => f.message).join('\n')).toContain(construct);
  });

  it('reports a plot body that has not asked for algebraic mode', () => {
    // The defaults are opposite: LaTeX2JS always reads infix, PSTricks reads RPN.
    expect(extensions(picture('\\psplot{-2}{2}{x^2}')).map((f: any) => f.message).join())
      .toContain('infix plot body');
  });

  it('points at the line the construct is on', () => {
    const found = extensions(picture('\\pscircle(0,0){1}\n\\userline{->}(0,0)(2,2)'));
    expect(found.find((f: any) => /userline/.test(f.message)).line).toBe(3);
  });

  it('says nothing about plain PSTricks', () => {
    expect(extensions(picture('\\pscircle[linecolor=red](0,0){1}\n\\psframe(-2,-2)(2,2)'))).toHaveLength(0);
  });
});

describe('declaring the dialect', () => {
  it('silences the reports', () => {
    expect(extensions(picture('\\userline{->}(0,0)(2,2)', '\\psset{dialect=latex2js}\n'))).toHaveLength(0);
  });

  it('accepts mathapedia as an alias', () => {
    expect(extensions(picture('\\userline{->}(0,0)(2,2)', '\\psset{dialect=mathapedia}\n'))).toHaveLength(0);
  });

  it('can be set once by the embedding application', () => {
    expect(extensions(picture('\\userline{->}(0,0)(2,2)'), 'latex2js')).toHaveLength(0);
  });

  it('lets a document override the application default', () => {
    const found = extensions(picture('\\userline{->}(0,0)(2,2)', '\\psset{dialect=pstricks}\n'), 'latex2js');
    expect(found.length).toBeGreaterThan(0);
  });

  it('ignores a name it does not know, rather than guessing', () => {
    // An unknown dialect must not silently disable the reports.
    expect(extensions(picture('\\userline{->}(0,0)(2,2)', '\\psset{dialect=nonsense}\n')).length)
      .toBeGreaterThan(0);
  });
});

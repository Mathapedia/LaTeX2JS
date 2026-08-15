import * as fs from 'fs';
import * as path from 'path';
import LaTeX2JS from '../src';

/**
 * Golden-corpus test: every example that ships on latex2js.com must parse
 * without errors or unknown-command warnings. This guards the site's content
 * against parser/engine regressions and documents which commands must exist.
 */
const corpusDir = path.join(__dirname, 'corpus');
const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.tex'));

const latex = new LaTeX2JS();

describe.each(files)('corpus: %s', (file) => {
  const tex = fs.readFileSync(path.join(corpusDir, file), 'utf8');

  it('parses without errors or unknown-command warnings', () => {
    const parsed = latex.parse(tex);
    expect(parsed.length).toBeGreaterThan(0);

    const errors = latex.lastDiagnostics.filter((d: any) => d.severity === 'error');
    expect(errors).toEqual([]);

    const unknown = latex.lastDiagnostics.filter((d: any) =>
      d.message.includes('unknown command')
    );
    expect(unknown).toEqual([]);
  });

  it('produces plot data for every pspicture', () => {
    const parsed = latex.parse(tex);
    parsed
      .filter((e: any) => e.type === 'pspicture')
      .forEach((env: any) => {
        expect(env.plot).toBeDefined();
        expect(env.env.elements).toBeDefined();
        // every element must have resolvable data
        env.env.elements.forEach((el: any) => {
          expect(el.data).toBeDefined();
          expect(typeof el.name).toBe('string');
        });
      });
  });
});

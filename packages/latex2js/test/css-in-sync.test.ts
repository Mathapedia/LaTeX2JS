import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @mathapedia/css is the stylesheet's source of truth; its build copies
 * latex2js.css into this package, which is what consumers import
 * (`import 'latex2js/latex2js.css'`). That copy step silently not running is
 * exactly how the amsthm theorem/proof styling sat unpublished while the
 * shipped file stayed stale — so drift between the two files is a build
 * failure, not a cosmetic detail.
 */
describe('latex2js.css is in sync with @mathapedia/css', () => {
  const here = join(__dirname, '..');
  const cssPkg = join(here, '..', 'css');

  it.each(['latex2js.css', 'latex2js.mathapedia.css'])('%s matches the css package source', (file) => {
    const source = readFileSync(join(cssPkg, file), 'utf8');
    const shipped = readFileSync(join(here, file), 'utf8');
    expect(shipped).toBe(source);
  });
});

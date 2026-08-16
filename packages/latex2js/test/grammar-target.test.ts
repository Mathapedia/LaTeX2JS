import * as fs from 'fs';
import * as path from 'path';

/**
 * The generated parser is copied into `dist`, not compiled.
 *
 * `copy:grammar` runs `cp src/grammar/parser.js`, so the file bypasses tsc
 * entirely and is never downlevelled. Today that is harmless: Peggy emits
 * ES2015 and the repo targets ES2020, so the parser is the least demanding code
 * we ship. But it means the tsconfig target does not govern it, and lowering
 * that target to reach older browsers would leave the parser behind as the real
 * floor, with nothing to say why.
 *
 * This guards that: the generated parser must not use syntax newer than the
 * target everything else is compiled to.
 */
const TARGETS = ['ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022'];

/** Syntax that first became legal at each level, with a matcher for it. */
const INTRODUCED: Array<{ level: string; name: string; test: (src: string) => boolean }> = [
  { level: 'ES2015', name: 'class declaration', test: (s) => /\bclass\s+\w/.test(s) },
  { level: 'ES2015', name: 'arrow function', test: (s) => /=>/.test(s) },
  { level: 'ES2015', name: 'const/let', test: (s) => /\b(const|let)\s+\w/.test(s) },
  { level: 'ES2015', name: 'template literal', test: (s) => /`/.test(s) },
  { level: 'ES2015', name: 'spread or rest', test: (s) => /\.\.\./.test(s) },
  { level: 'ES2016', name: 'exponent operator', test: (s) => /[\w)]\s*\*\*\s*[\w(]/.test(s) },
  { level: 'ES2017', name: 'async or await', test: (s) => /\b(async\s+function|await\s+\w)/.test(s) },
  { level: 'ES2019', name: 'optional catch binding', test: (s) => /catch\s*\{/.test(s) },
  { level: 'ES2020', name: 'optional chaining', test: (s) => /\?\./.test(s) },
  { level: 'ES2020', name: 'nullish coalescing', test: (s) => /\?\?/.test(s) },
  { level: 'ES2020', name: 'globalThis', test: (s) => /\bglobalThis\b/.test(s) },
  { level: 'ES2021', name: 'logical assignment', test: (s) => /(\|\||&&|\?\?)=[^=]/.test(s) },
  { level: 'ES2022', name: 'private class field', test: (s) => /\bthis\.#/.test(s) },
];

/** Strips comments, so JSDoc like `/** @type *​/` is not read as syntax. */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('the generated parser stays within the compile target', () => {
  const root = path.join(__dirname, '..', '..', '..');
  const target: string = JSON.parse(
    fs.readFileSync(path.join(root, 'tsconfig.json'), 'utf8').replace(/\/\/.*$/gm, '')
  ).compilerOptions.target.toUpperCase();

  const source = stripComments(
    fs.readFileSync(path.join(__dirname, '..', 'src', 'grammar', 'parser.js'), 'utf8')
  );

  it('reads a target it understands', () => {
    expect(TARGETS).toContain(target);
  });

  it.each(INTRODUCED)('is allowed to use $name ($level)', ({ level, name, test }) => {
    if (!test(source)) return; // not used at all, nothing to check
    const used = TARGETS.indexOf(level);
    const allowed = TARGETS.indexOf(target);
    expect(
      used <= allowed
        ? true
        : `parser.js uses ${name}, which needs ${level}, but the build targets ${target}. ` +
            'The generated parser is copied rather than compiled, so it is not downlevelled — ' +
            'either raise the target or build the grammar output like the rest of the sources.'
    ).toBe(true);
  });
});

/**
 * Build the browser bundle for latex2html5 with esbuild.
 *
 * Produces the single-file `LaTeX2HTML5` global that:
 *   - the static latex2js.com site loads from `bundle/latex2html5.bundle.js`
 *   - the published npm package ships as `dist/latex2html5.bundle.js`
 *
 * It bundles straight from the TypeScript source (the same sources the
 * playground serves), so it needs no tsc/build pass first — which is what
 * makes the dev loop fast.
 *
 * Usage:
 *   node tools/build-bundle.mjs                # write bundle/latex2html5.bundle.js
 *   node tools/build-bundle.mjs --dist         # also write packages/html5/dist/latex2html5.bundle.js
 *   node tools/build-bundle.mjs --site         # also copy into ../latex2js.com/assets/js/
 *   node tools/build-bundle.mjs --watch        # rebuild on source change
 *   node tools/build-bundle.mjs --watch --site # live site dev loop
 */
import { context } from 'esbuild';
import { fileURLToPath } from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';

const toolsDir = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = path.join(toolsDir, '..');
const fromRoot = (p) => path.join(repoRoot, p);

const outfile = fromRoot('bundle/latex2html5.bundle.js');
const distOutfile = fromRoot('packages/html5/dist/latex2html5.bundle.js');
const siteDest = path.join(repoRoot, '../latex2js.com/assets/js/latex2html5.bundle.js');

const watch = process.argv.includes('--watch');
const alsoDist = process.argv.includes('--dist');
const alsoSite = process.argv.includes('--site');

const copyTo = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

// A tiny plugin copies the freshly built bundle after every build, which is
// what lets `--watch --site` stay in sync with no extra plumbing.
const plugins = [
  {
    name: 'copy-bundle-artifacts',
    setup(build) {
      build.onEnd(() => {
        if (alsoDist) copyTo(outfile, distOutfile);
        if (alsoSite) copyTo(outfile, siteDest);
      });
    },
  },
];

const ctx = await context({
  entryPoints: [fromRoot('packages/html5/src/index.ts')],
  outfile,
  bundle: true,
  format: 'iife',
  globalName: 'LaTeX2HTML5',
  platform: 'browser',
  target: ['es2020'],
  logLevel: 'info',
  plugins,
  // Point every workspace package at its TypeScript source, mirroring the
  // playground's vite aliases.
  alias: {
    latex2js: fromRoot('packages/latex2js/src/index.ts'),
    latex2html5: fromRoot('packages/html5/src/index.ts'),
    '@latex2js/pstricks': fromRoot('packages/pstricks/src/index.ts'),
    '@latex2js/settings': fromRoot('packages/settings/src/index.ts'),
    '@latex2js/utils': fromRoot('packages/utils/src/index.ts'),
    '@latex2js/macros': fromRoot('packages/macros/src/index.ts'),
    mathjaxjs: fromRoot('packages/mathjaxjs/src/index.ts'),
  },
});

if (watch) {
  await ctx.watch();
  console.log('watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log(`wrote ${outfile}`);
}

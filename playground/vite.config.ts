import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';

// Point every workspace package at its TypeScript source so the dev loop
// runs against src/ (no build step needed) and HMR works on any change.
const fromRoot = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));

/**
 * The Peggy-generated parser (packages/latex2js/src/grammar/parser.js) is
 * CommonJS for the published package builds, but the playground serves the
 * workspace sources raw (no pre-bundling), so the browser would hit
 * `module is not defined`. Convert its export tail to ESM on the fly.
 */
function cjsParserToEsm(): Plugin {
  return {
    name: 'latex2js-cjs-parser-to-esm',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('grammar/parser.js')) return;
      // The generated error class extends `SyntaxError`; once we export a
      // module-scoped `SyntaxError` below it would shadow the global (TDZ),
      // so pin the base class to the global explicitly.
      code = code.replace(
        'class peg$SyntaxError extends SyntaxError',
        'class peg$SyntaxError extends globalThis.SyntaxError'
      );
      const tail = code.indexOf('module.exports = {');
      if (tail === -1) return;
      const body = code
        .slice(tail + 'module.exports = {'.length)
        .replace(/;\s*$/, '');
      const m = body.match(
        /StartRules:\s*(\[[^\]]*\])\s*,\s*SyntaxError:\s*(\S+)\s*,\s*parse:\s*(\S+)\s*,/
      );
      if (!m) return;
      return {
        code:
          code.slice(0, tail) +
          `export const StartRules = ${m[1]};\n` +
          `export const SyntaxError = ${m[2]};\n` +
          `export const parse = ${m[3]};\n`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  plugins: [cjsParserToEsm()],
  resolve: {
    alias: {
      latex2js: fromRoot('packages/latex2js/src/index.ts'),
      latex2html5: fromRoot('packages/html5/src/index.ts'),
      '@latex2js/pstricks': fromRoot('packages/pstricks/src/index.ts'),
      '@latex2js/settings': fromRoot('packages/settings/src/index.ts'),
      '@latex2js/utils': fromRoot('packages/utils/src/index.ts'),
      '@latex2js/macros': fromRoot('packages/macros/src/index.ts'),
      mathjaxjs: fromRoot('packages/mathjaxjs/src/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        render: fileURLToPath(new URL('./render.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});

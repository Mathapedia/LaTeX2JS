import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

/**
 * Renders every example in the golden corpus (the latex2js.com examples plus
 * the new feature examples) in a real browser and:
 *   1. asserts the page renders without JS errors,
 *   2. asserts each pspicture produced an SVG,
 *   3. saves a PNG per example to playground/renders/ so the renderings can
 *      be inspected visually.
 */

const here = fileURLToPath(new URL('.', import.meta.url));
const corpusDir = path.join(here, '../../packages/latex2js/test/corpus');
const outDir = path.join(here, '../renders');

const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.tex'));

test.beforeAll(() => {
  fs.mkdirSync(outDir, { recursive: true });
});

for (const file of files) {
  test(`renders ${file}`, async ({ page }) => {
    const tex = fs.readFileSync(path.join(corpusDir, file), 'utf8');
    const encoded = Buffer.from(tex, 'utf8').toString('base64url');

    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(String(err)));

    // Use the URL hash (not ?tex=): large examples would exceed the server's
    // request-header size limit, and the hash is never sent to the server.
    await page.goto(`/render.html#${encoded}`);
    await page.waitForFunction(() => (window as any).document.body.dataset.ready === 'true', null, {
      timeout: 30_000,
    });

    // let MathJax finish positioning before screenshotting
    await page.waitForTimeout(400);

    const output = page.locator('#output');
    if (tex.includes('\\begin{pspicture}')) {
      const svgCount = await output.locator('svg').count();
      expect(svgCount).toBeGreaterThan(0);
    } else {
      // pure math/text examples have no SVG — assert they rendered content
      const hasContent =
        (await output.locator('mjx-container').count()) > 0 ||
        ((await output.innerText()).trim().length > 0);
      expect(hasContent).toBe(true);
    }

    await output.screenshot({ path: path.join(outDir, file.replace(/\.tex$/, '.png')) });

    // ignore resource-load noise (fonts/CDN) — real JS errors fail the test
    const realErrors = errors.filter(
      (e) =>
        !e.includes('Failed to load resource') &&
        !e.includes('net::') &&
        !e.includes('MathJax') &&
        !e.includes('font')
    );
    expect(realErrors).toEqual([]);
  });
}

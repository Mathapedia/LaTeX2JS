import { test, expect } from '@playwright/test';

/**
 * Interactive browser tests against the live playground UI: hash-encoded LaTeX
 * in, rendered output out, then real user interactions (slider drag, mouse
 * movement on interactive graphics, MathJax typesetting).
 */

const SLIDER_EXAMPLE = String.raw`\psset{unit=1cm}
\begin{pspicture}(-3.5,-1)(3.75,3.5)
\slider{1}{8}{n}{$N$}{4}
\psplot[algebraic,linewidth=1.5pt,plotpoints=1000]{-3.14}{3.14}{cos(n*x/2)+1.3}
\end{pspicture}`;

const DRAGGABLE_EXAMPLE = String.raw`\begin{pspicture}(-2,-2)(2,2)
\psframe(-2,-2)(2,2)
\userline[linewidth=2pt,linecolor=green]{->}(0,0)(2,2){-x}{-y}
\userline[linewidth=2pt,linecolor=red]{->}(0,0)(2,2){0}{y}
\end{pspicture}`;

const MATH_EXAMPLE = String.raw`The quadratic formula: $$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

\begin{theorem}
If $u, v \in V$ then $|\langle u, v \rangle| \le \|u\| \|v\|$.
\end{theorem}`;

const encode = (tex: string) => Buffer.from(tex, 'utf8').toString('base64');

test('renders the default playground example with an SVG', async ({ page }) => {
  await page.goto('/');
  const svg = page.locator('.pspicture svg').first();
  await expect(svg).toBeVisible();
});

test('slider changes re-render the plot', async ({ page }) => {
  await page.goto(`/#${encode(SLIDER_EXAMPLE)}`);
  const slider = page.locator('input[type="range"]').first();
  await expect(slider).toBeVisible();

  const plot = page.locator('svg path.psplot').first();
  await expect(plot).toBeVisible();
  const before = await plot.getAttribute('d');

  await slider.fill('8');
  await page.waitForTimeout(300);

  const after = await plot.getAttribute('d');
  expect(after).not.toBe(before);
  // still exactly one plot path after the re-render
  expect(await page.locator('svg path.psplot').count()).toBe(1);
});

test('moving the mouse drags interactive userline graphics', async ({ page }) => {
  await page.goto(`/#${encode(DRAGGABLE_EXAMPLE)}`);
  const svg = page.locator('.pspicture svg').first();
  await expect(svg).toBeVisible();

  const userline = page.locator('svg path.userline').first();
  await expect(userline).toBeVisible();
  const before = await userline.getAttribute('d');

  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3);
  await page.waitForTimeout(200);

  const after = await userline.getAttribute('d');
  expect(after).not.toBe(before);
});

test('MathJax typesets inline and display math', async ({ page }) => {
  await page.goto(`/#${encode(MATH_EXAMPLE)}`);
  // MathJax v3 output lives in <mjx-container> elements
  const mjx = page.locator('mjx-container').first();
  await expect(mjx).toBeVisible();
  // theorem header was transformed by the headers pass
  await expect(page.getByText('Theorem', { exact: true })).toBeVisible();
});

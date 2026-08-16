import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// Browsers are installed into the workspace (playground/.browsers) instead of
// the user cache dir; make sure workers resolve them there.
const here = fileURLToPath(new URL('.', import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH ||= `${here}.browsers`;

/**
 * Browser-level tests for LaTeX2JS.
 *
 * - examples.spec.ts renders every corpus example in a real browser, asserts
 *   clean rendering, and saves a PNG gallery to playground/renders/.
 * - interactive.spec.ts drives the live playground UI (sliders, drag).
 *
 * Run with:  pnpm e2e        (starts its own vite dev server)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1400, height: 1000 },
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec vite --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

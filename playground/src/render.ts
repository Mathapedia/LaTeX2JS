import '../../packages/css/latex2js.css';

import render from 'latex2html5';

/**
 * Headless-friendly render page: renders LaTeX supplied via
 * `?tex=<base64url>` or the URL hash (`#<base64>`), typesets with MathJax,
 * then marks the document ready so Playwright/screenshot tooling can wait on
 * `document.body.dataset.ready === 'true'`.
 */

function decodeParam(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(escape(atob(value.replace(/-/g, '+').replace(/_/g, '/'))));
  } catch {
    return null;
  }
}

function getTex(): string {
  const params = new URLSearchParams(location.search);
  const fromParam = decodeParam(params.get('tex'));
  if (fromParam) return fromParam;
  const fromHash = decodeParam(location.hash.slice(1));
  if (fromHash) return fromHash;
  return '';
}

const tex = getTex();
const output = document.getElementById('output') as HTMLDivElement;

function finish(): void {
  const mj = (window as any).MathJax;
  if (mj && mj.typesetPromise) {
    mj.typesetPromise([output])
      .catch((err: any) => console.error('MathJax typeset failed', err))
      .finally(() => {
        document.body.dataset.ready = 'true';
      });
  } else {
    document.body.dataset.ready = 'true';
  }
}

try {
  render(tex, (div) => {
    output.appendChild(div);
    finish();
  });
} catch (err) {
  console.error('render failed', err);
  document.body.dataset.ready = 'true';
  document.body.dataset.error = String((err as Error).message);
}

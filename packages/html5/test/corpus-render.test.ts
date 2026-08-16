/** @jest-environment jsdom */
import * as fs from 'fs';
import * as path from 'path';
import LaTeX2JS from 'latex2js';
import pspicture from '../src/components/pspicture';

/**
 * Golden-corpus render test: every pspicture on latex2js.com must render to an
 * SVG without throwing. This exercises the full parse → component → psgraph
 * pipeline against real site content.
 */
const corpusDir = path.join(__dirname, '../../latex2js/test/corpus');
const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.tex'));

beforeEach(() => {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: 1200, configurable: true });
  Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
  document.body.innerHTML = '';
});

describe.each(files)('corpus render: %s', (file) => {
  const tex = fs.readFileSync(path.join(corpusDir, file), 'utf8');

  it('renders every pspicture to an SVG', () => {
    const latex = new LaTeX2JS();
    const parsed = latex.parse(tex);

    const pictures = parsed.filter((e: any) => e.type === 'pspicture');

    pictures.forEach((env: any) => {
      let div: HTMLDivElement;
      expect(() => {
        div = pspicture(env);
        document.body.appendChild(div);
      }).not.toThrow();
      expect(div!.querySelector('svg')).not.toBeNull();
      expect(div!.querySelector('svg')!.children.length).toBeGreaterThan(0);
    });

    // math/text-only documents (no pspicture) must still parse cleanly
    expect(parsed.length).toBeGreaterThan(0);

    // parse diagnostics must be clean for real site content
    const unknown = latex.lastDiagnostics.filter((d: any) => d.message.includes('unknown command'));
    expect(unknown).toEqual([]);
  });
});

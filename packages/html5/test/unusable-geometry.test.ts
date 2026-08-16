/** @jest-environment jsdom */
import LaTeX2JS from 'latex2js';
import pspicture from '../src/components/pspicture';

/**
 * A coordinate that cannot be computed used to become 0 — a real position — so
 * a broken command drew a plausible shape at the origin and said nothing. That
 * is the shape of nearly every rendering bug this package has had: wrong output
 * that looks deliberate.
 *
 * The contract is now: the parser reports it against the source line, and the
 * renderer draws nothing.
 */
const parsePspicture = (tex: string) => {
  const latex = new LaTeX2JS();
  const parsed = latex.parse(tex);
  return {
    env: parsed.find((e: any) => e.type === 'pspicture'),
    diagnostics: (latex as any).lastDiagnostics ?? [],
  };
};

const shapes = (svg: SVGElement) =>
  Array.from(svg.querySelectorAll('circle, path, rect, ellipse, line')).filter(
    (el) => !el.closest('defs')
  );

const picture = (body: string) => `\\begin{pspicture}(0,0)(4,4)\n${body}\n\\end{pspicture}\n`;

describe('a command whose geometry cannot be computed', () => {
  it('is reported against its own source line', () => {
    const { diagnostics } = parsePspicture(picture('\\pscircle(nonsense,1){1}'));
    const hit = diagnostics.find((d: any) => /no usable value/.test(d.message));
    expect(hit).toBeDefined();
    expect(hit.message).toContain('\\pscircle');
    expect(hit.line).toBe(2);
  });

  it('draws nothing rather than a shape at the origin', () => {
    const { env } = parsePspicture(picture('\\pscircle(nonsense,1){1}'));
    const div = pspicture(env);
    document.body.appendChild(div);
    expect(shapes(div.querySelector('svg')!)).toHaveLength(0);
  });

  it('does not stop the rest of the picture from drawing', () => {
    // One bad command must not cost the whole diagram.
    const { env } = parsePspicture(
      picture('\\pscircle(nonsense,1){1}\n\\psframe(0,0)(4,4)\n\\pscircle(2,2){1}')
    );
    const div = pspicture(env);
    document.body.appendChild(div);
    const drawn = shapes(div.querySelector('svg')!);
    expect(drawn.length).toBeGreaterThan(0);
    expect(drawn.filter((el) => el.tagName === 'circle')).toHaveLength(1);
  });

  it('still draws a picture whose commands are all usable', () => {
    const { env, diagnostics } = parsePspicture(picture('\\pscircle(2,2){1}'));
    const div = pspicture(env);
    document.body.appendChild(div);
    expect(shapes(div.querySelector('svg')!).length).toBeGreaterThan(0);
    expect(diagnostics.filter((d: any) => /no usable value/.test(d.message))).toHaveLength(0);
  });
});

import LaTeX2JS from '../src';

/**
 * Numbering is what makes a document cross-referenceable — "see Theorem 3" only
 * works if theorems are numbered — and none was emitted, so a rendered document
 * could not be cited from the way its printed form can.
 *
 * Equations are absent here on purpose: those stay with MathJax, which already
 * numbers AMS environments and resolves \label/\ref against them.
 */
const render = (tex: string, instance?: LaTeX2JS): string => {
  const l = instance ?? new LaTeX2JS();
  const parsed: any = l.parse(tex);
  return parsed.map((s: any) => (s.lines || []).join('\n')).join('\n');
};

/** The numbers attached to headings, in document order. */
const numbers = (html: string): string[] =>
  Array.from(html.matchAll(/<span class="section-number">([^<]*)<\/span>/g)).map((m) => m[1]);

const headings = (html: string): string[] =>
  Array.from(html.matchAll(/<h4[^>]*>([^<]*)<\/h4>/g)).map((m) => m[1]);

describe('sectioning', () => {
  it('numbers sections in order', () => {
    expect(numbers(render('\\section{A}\n\\section{B}\n\\section{C}\n'))).toEqual(['1', '2', '3']);
  });

  it('nests subsections under their section', () => {
    const out = render('\\section{A}\n\\subsection{A1}\n\\subsubsection{A1a}\n');
    expect(numbers(out)).toEqual(['1', '1.1', '1.1.1']);
  });

  it('restarts deeper levels when a section advances', () => {
    const out = render('\\section{A}\n\\subsection{A1}\n\\subsection{A2}\n\\section{B}\n\\subsection{B1}\n');
    expect(numbers(out)).toEqual(['1', '1.1', '1.2', '2', '2.1']);
  });

  it('restarts subsubsections when a subsection advances', () => {
    const out = render('\\section{A}\n\\subsection{A1}\n\\subsubsection{x}\n\\subsection{A2}\n\\subsubsection{y}\n');
    expect(numbers(out)).toEqual(['1', '1.1', '1.1.1', '1.2', '1.2.1']);
  });

  it('numbers a subsection that appears before any section as LaTeX does', () => {
    // Odd, not broken: LaTeX reports 0.1 rather than refusing.
    expect(numbers(render('\\subsection{Orphan}\n'))).toEqual(['0.1']);
  });

  it('leaves a starred heading unnumbered', () => {
    expect(numbers(render('\\section*{Preface}\n'))).toEqual([]);
  });

  it('does not let a starred heading advance the counter', () => {
    const out = render('\\section{A}\n\\section*{Aside}\n\\section{B}\n');
    expect(numbers(out)).toEqual(['1', '2']);
  });

  it('still renders the title of a starred heading', () => {
    expect(render('\\section*{Preface}\n')).toContain('Preface');
  });
});

describe('theorem-like environments', () => {
  it('counts each kind independently', () => {
    const out = render(
      '\\begin{theorem}\nt\n\\end{theorem}\n\\begin{lemma}\nl\n\\end{lemma}\n\\begin{theorem}\nt2\n\\end{theorem}\n'
    );
    expect(headings(out)).toEqual(['Theorem 1', 'Lemma 1', 'Theorem 2']);
  });

  it.each([
    ['corollary', 'Corollary'],
    ['proposition', 'Proposition'],
    ['definition', 'Definition'],
    ['axiom', 'Axiom'],
    ['claim', 'Claim'],
    ['example', 'Example'],
    ['remark', 'Remark'],
    ['exercise', 'Exercise'],
  ])('numbers %s', (env, title) => {
    expect(headings(render(`\\begin{${env}}\nx\n\\end{${env}}\n`))).toEqual([`${title} 1`]);
  });

  it('leaves proof unnumbered', () => {
    // LaTeX's proof environment carries no number; it closes with a tombstone.
    const out = render('\\begin{proof}\nx\n\\end{proof}\n');
    expect(headings(out)).toEqual(['Proof']);
    expect(out).toContain('□');
  });

  it('leaves a starred environment unnumbered and does not advance the counter', () => {
    const out = render(
      '\\begin{theorem}\na\n\\end{theorem}\n\\begin{theorem*}\nb\n\\end{theorem*}\n\\begin{theorem}\nc\n\\end{theorem}\n'
    );
    expect(headings(out)).toEqual(['Theorem 1', 'Theorem', 'Theorem 2']);
  });

  it('keeps counting across sections rather than restarting', () => {
    // A plain \newtheorem is not bound to a section counter.
    const out = render(
      '\\section{A}\n\\begin{theorem}\na\n\\end{theorem}\n\\section{B}\n\\begin{theorem}\nb\n\\end{theorem}\n'
    );
    expect(headings(out)).toEqual(['Theorem 1', 'Theorem 2']);
  });
});

describe('counters belong to a document, not to the parser', () => {
  it('restarts for each parse on a reused instance', () => {
    // A reused instance would otherwise continue the previous document's
    // numbering, which is only visible on the second render.
    const l = new LaTeX2JS();
    const first = render('\\section{A}\n\\begin{theorem}\nx\n\\end{theorem}\n', l);
    const second = render('\\section{A}\n\\begin{theorem}\nx\n\\end{theorem}\n', l);
    expect(numbers(first)).toEqual(numbers(second));
    expect(headings(first)).toEqual(headings(second));
    expect(headings(second)).toEqual(['Theorem 1']);
  });

  it('gives two fresh instances the same numbering', () => {
    const a = render('\\section{A}\n');
    const b = render('\\section{A}\n');
    expect(numbers(a)).toEqual(numbers(b));
  });
});

describe('numbering survives the surrounding document', () => {
  it('numbers a heading whose title an earlier transform rewrites', () => {
    // The en dash is substituted before the sectioning transform runs.
    const out = render('\\section{Cauchy--Schwarz}\n');
    expect(numbers(out)).toEqual(['1']);
    expect(out).toContain('Cauchy&ndash;Schwarz');
  });

  it('numbers environments that appear inside a list', () => {
    const out = render('\\begin{itemize}\n\\item one\n\\end{itemize}\n\\begin{theorem}\nx\n\\end{theorem}\n');
    expect(headings(out)).toEqual(['Theorem 1']);
  });

  it('is unaffected by a pspicture between two sections', () => {
    const out = render(
      '\\section{A}\n\\begin{pspicture}(0,0)(2,2)\n\\pscircle(1,1){1}\n\\end{pspicture}\n\\section{B}\n'
    );
    expect(numbers(out)).toEqual(['1', '2']);
  });
});

describe('run-in headings', () => {
  const wrappers = (html: string) => ({
    open: (html.match(/<div class="theorem-env/g) || []).length,
    close: (html.match(/<\/div>/g) || []).length,
  });

  it('wraps an environment so the label can run into its statement', () => {
    // LaTeX sets these as `Theorem 1. statement` on one line; the wrapper is
    // what lets CSS do that and give the body its own style.
    const out = render('\\begin{theorem}\nA statement.\n\\end{theorem}\n');
    expect(out).toContain('<div class="theorem-env theorem-env--theorem">');
    expect(out).toContain('<h4 class="theorem-head">Theorem 1</h4>');
    expect(wrappers(out)).toEqual({ open: 1, close: 1 });
  });

  it('closes every wrapper it opens, across several environments', () => {
    const out = render(
      '\\begin{theorem}\na\n\\end{theorem}\n\\begin{lemma}\nb\n\\end{lemma}\n\\begin{proof}\nc\n\\end{proof}\n'
    );
    const { open, close } = wrappers(out);
    expect(open).toBe(3);
    expect(close).toBe(3);
  });

  it('marks the kind so the body can be styled per environment', () => {
    // amsthm italicises a theorem and leaves a remark upright.
    expect(render('\\begin{remark}\nx\n\\end{remark}\n')).toContain('theorem-env--remark');
    expect(render('\\begin{proof}\nx\n\\end{proof}\n')).toContain('theorem-env--proof');
  });

  it('closes the proof wrapper with its tombstone', () => {
    const out = render('\\begin{proof}\nx\n\\end{proof}\n');
    expect(out).toContain('<span class="qed">□</span></div>');
  });
});

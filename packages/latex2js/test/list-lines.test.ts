import LaTeX2JS from '../src';

/**
 * Inside an environment the grammar matches Command before Line, and a
 * command's tail stops at the next command — so one source line arrives as
 * several nodes. Rendering each as its own line broke list items wherever a
 * macro appeared, which is visible only once a macro is present.
 */
const lines = (tex: string): string[] => {
  const parsed: any = new LaTeX2JS().parse(tex);
  return parsed.flatMap((s: any) => s.lines || []).filter((l: string) => l !== '<br>');
};

const list = (body: string) => `\\begin{itemize}\n${body}\n\\end{itemize}\n`;

describe('list items stay on one line', () => {
  it.each([
    ['\\textbf', '\\item First with \\textbf{bold} text', '\\item First with <b>bold</b> text'],
    ['\\emph', '\\item First with \\emph{em} text', '\\item First with <i>em</i> text'],
    ['\\textit', '\\item A \\textit{b} c', '\\item A <i>b</i> c'],
  ])('keeps an item containing %s intact', (_label, source, expected) => {
    expect(lines(list(source))).toEqual([expected]);
  });

  it('keeps two macros in one item on the same line', () => {
    expect(lines(list('\\item \\textbf{a} then \\textit{b} end'))).toEqual([
      '\\item <b>a</b> then <i>b</i> end',
    ]);
  });

  it('still separates one item from the next', () => {
    expect(lines(list('\\item First \\textbf{a}\n\\item Second \\textbf{b}'))).toEqual([
      '\\item First <b>a</b>',
      '\\item Second <b>b</b>',
    ]);
  });

  it('matches how the same text renders outside a list', () => {
    // Outside a list the text is a paragraph, so the transform is compared
    // through that wrapper rather than against a bare line.
    expect(lines('Some \\textbf{bold} text here\n')).toEqual([
      '<p class="para">Some <b>bold</b> text here</p>',
    ]);
  });

  it('keeps a blank line between items as a paragraph break', () => {
    const parsed: any = new LaTeX2JS().parse(list('\\item One\n\n\\item Two'));
    const all = parsed.flatMap((s: any) => s.lines || []);
    expect(all).toContain('<br>');
    expect(all.filter((l: string) => l !== '<br>')).toEqual(['\\item One', '\\item Two']);
  });
});

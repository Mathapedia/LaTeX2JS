import LaTeX2JS from '../src';
const latex = new LaTeX2JS();
describe('class test', () => {
    it('Environments', () => {
        expect(latex.Environments).toEqual([
            'pspicture',
            'verbatim',
            'enumerate',
            'print',
            'nicebox',
        ]);
    });
    it('Delimiters', () => {
        expect(latex.Delimiters).toEqual({
            enumerate: { begin: /\\begin\{enumerate\}/, end: /\\end\{enumerate\}/ },
            nicebox: { begin: /\\begin\{nicebox\}/, end: /\\end\{nicebox\}/ },
            print: { begin: /\\begin\{print\}/, end: /\\end\{print\}/ },
            pspicture: { begin: /\\begin\{pspicture\}/, end: /\\end\{pspicture\}/ },
            verbatim: { begin: /\\begin\{verbatim\}/, end: /\\end\{verbatim\}/ },
        });
    });
    it('Ignore', () => {
        expect(latex.Ignore).toEqual([
            /^\%/,
            /\\begin\{document\}/,
            /\\end\{document\}/,
            /\\begin\{interactive\}/,
            /\\end\{interactive\}/,
            /\\usepackage/,
            /\\documentclass/,
            /\\tableofcontents/,
            /\\author/,
            /\\date/,
            /\\maketitle/,
            /\\title/,
            /\\pagestyle/,
            /\\smallskip/,
            /\\medskip/,
            /\\bigskip/,
            /\\nobreak/,
            /\\begin\{center\}/,
            /\\end\{center\}/,
        ]);
    });
    it('Text', () => {
        expect(latex.Text).toBeDefined();
        expect(latex.Text.Functions).toBeDefined();
        expect(latex.Text.Expressions).toBeDefined();
        expect(Object.keys(latex.Text.Functions).sort()).toEqual([
            'LaTeX',
            'TeX',
            'bf',
            'cite',
            'closeq',
            'emph',
            'euler',
            'href',
            'img',
            'it',
            'mdash',
            'ndash',
            'openq',
            'rm',
            'set',
            'sl',
            'tt',
            'vspace',
            'youtube',
        ]);
        expect(Object.keys(latex.Text.Expressions).sort()).toEqual([
            'LaTeX',
            'TeX',
            'bf',
            'cite',
            'closeq',
            'emph',
            'euler',
            'href',
            'img',
            'it',
            'mdash',
            'ndash',
            'openq',
            'rm',
            'set',
            'sl',
            'tt',
            'vspace',
            'youtube',
        ]);
    });
    it('Headers', () => {
        expect(latex.Headers).toBeDefined();
        expect(latex.Headers.Functions).toBeDefined();
        expect(latex.Headers.Expressions).toBeDefined();
        expect(Object.keys(latex.Headers.Functions).sort()).toEqual([
            'bq',
            'claim',
            'corollary',
            'definition',
            'endclaim',
            'endcorollary',
            'enddefinition',
            'endexample',
            'endproblem',
            'endsolution',
            'endtheorem',
            'eq',
            'example',
            'problem',
            'proof',
            'qed',
            'solution',
            'theorem',
        ]);
        expect(Object.keys(latex.Headers.Expressions).sort()).toEqual([
            'bq',
            'claim',
            'corollary',
            'definition',
            'endclaim',
            'endcorallary',
            'enddefinition',
            'endexample',
            'endproblem',
            'endsolution',
            'endtheorem',
            'eq',
            'example',
            'problem',
            'proof',
            'qed',
            'solution',
            'theorem',
        ]);
    });
});
//# sourceMappingURL=latex2js.test.js.map
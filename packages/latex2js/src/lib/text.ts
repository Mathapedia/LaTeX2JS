import { matchrepl, simplerepl } from '@latex2js/utils';

export const Expressions = {
  emph: /\\emph\{[^}]*\}/g,
  bf: /\{*\\bf [^}]*\}/g,
  rm: /\{*\\rm [^}]*\}/g,
  sl: /\{*\\sl [^}]*\}/g,
  it: /\{*\\it [^}]*\}/g,
  tt: /\{*\\tt [^}]*\}/g,
  mdash: /---/g,
  ndash: /--/g,
  openq: /``/g,
  closeq: /''/g,
  TeX: /\\TeX\\|\\TeX/g,
  LaTeX: /\\LaTeX\\|\\LaTeX/g,
  vspace: /\\vspace/g,
  cite: /\\cite\[\d+\]\{[^}]*\}/g,
  href: /\\href\{[^}]*\}\{[^}]*\}/g,
  img: /\\img\{[^}]*\}/g,
  set: /\\set\{[^}]*\}/g,
  youtube: /\\youtube\{[^}]*\}/g,
  euler: /Euler\^/g,
  textbf: /\\textbf\{[^}]*\}/g,
  textit: /\\textit\{[^}]*\}/g,
  texttt: /\\texttt\{[^}]*\}/g,
  textrm: /\\textrm\{[^}]*\}/g,
  textsc: /\\textsc\{[^}]*\}/g,
  underline: /\\underline\{[^}]*\}/g,
  overline: /\\overline\{[^}]*\}/g,
  section: /\\section\{[^}]*\}/,
  subsection: /\\subsection\{[^}]*\}/,
  subsubsection: /\\subsubsection\{[^}]*\}/,
  paragraph: /\\paragraph\{[^}]*\}/,
  hspace: /\\hspace\{[^}]*\}/,
  noindent: /\\noindent/g,
  newpage: /\\newpage/g,
  hrule: /\\hrule/g,
  rule: /\\rule\{[^}]*\}\{[^}]*\}/g,
  textcolor: /\\textcolor\{[^}]*\}\{[^}]*\}/g,
  footnote: /\\footnote\{[^}]*\}/g,
};

export const Functions = {
  cite: function(m: any[], contents: string): string {
    m.forEach((match: any) => {
      var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);
      var m = location.pathname.match(/\/books\/(\d+)\//);
      var book_id: number = 0;
      if (m) {
        book_id = parseInt(m[1], 10);
      }
      contents = contents.replace(
        m2.input,
        '<a data-bypass="true" href="/references/' +
          book_id +
          '/' +
          m2[2] +
          '">[p' +
          m2[1] +
          ']</a>'
      );
    });
    return contents;
  },
  img: matchrepl(/\\img\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return (
      '<div style="width: 100%;text-align: center;"><img src="' +
      m[1] +
      '"></div>'
    );
  }),
  youtube: matchrepl(/\\youtube\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return (
      '<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' +
      m[1] +
      '" frameborder="0" allowfullscreen></iframe></div>'
    );
  }),
  href: matchrepl(/\\href\{([^}]*)\}\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<a href="' + m[1] + '">' + m[2] + '</a>';
  }),
  set: matchrepl(/\\set\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<i>' + m[1] + '</i>';
  }),
  euler: simplerepl(/Euler\^/, 'exp'),
  emph: matchrepl(/\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<i>' + m[1] + '</i>';
  }),
  bf: matchrepl(/\{*\\bf ([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<b>' + m[1] + '</b>';
  }),
  rm: matchrepl(/\{*\\rm ([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span class="rm">' + m[1] + '</span>';
  }),
  sl: matchrepl(/\{*\\sl ([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<i>' + m[1] + '</i>';
  }),
  it: matchrepl(/\{*\\it ([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<i>' + m[1] + '</i>';
  }),
  tt: matchrepl(/\{*\\tt ([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span class="tt">' + m[1] + '</span>';
  }),
  ndash: simplerepl(/--/g, '&ndash;'),
  mdash: simplerepl(/---/g, '&mdash;'),
  openq: simplerepl(/``/g, '&ldquo;'),
  closeq: simplerepl(/''/g, '&rdquo;'),
  vspace: simplerepl(/\\vspace/g, '<br>'),
  TeX: simplerepl(/\\TeX\\|\\TeX/g, '$\\TeX$'),
  LaTeX: simplerepl(/\\LaTeX\\|\\LaTeX/g, '$\\LaTeX$'),
  textbf: matchrepl(/\\textbf\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<b>' + m[1] + '</b>';
  }),
  textit: matchrepl(/\\textit\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<i>' + m[1] + '</i>';
  }),
  texttt: matchrepl(/\\texttt\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span class="tt">' + m[1] + '</span>';
  }),
  textrm: matchrepl(/\\textrm\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span class="rm">' + m[1] + '</span>';
  }),
  textsc: matchrepl(/\\textsc\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span style="font-variant: small-caps;">' + m[1] + '</span>';
  }),
  underline: matchrepl(/\\underline\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<u>' + m[1] + '</u>';
  }),
  overline: matchrepl(/\\overline\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span style="text-decoration: overline;">' + m[1] + '</span>';
  }),
  section: matchrepl(/\\section\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<h2>' + m[1] + '</h2>';
  }),
  subsection: matchrepl(/\\subsection\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<h3>' + m[1] + '</h3>';
  }),
  subsubsection: matchrepl(/\\subsubsection\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<h4>' + m[1] + '</h4>';
  }),
  paragraph: matchrepl(/\\paragraph\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<h5>' + m[1] + '</h5>';
  }),
  hspace: matchrepl(/\\hspace\{([^}]*)\}/, function(_m: RegExpMatchArray) {
    return '&nbsp; ';
  }),
  noindent: simplerepl(/\\noindent/g, ''),
  newpage: simplerepl(/\\newpage/g, '<br><br>'),
  hrule: simplerepl(/\\hrule/g, '<hr>'),
  rule: matchrepl(/\\rule\{([^}]*)\}\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return (
      '<span style="display:inline-block;width:' +
      m[1] +
      ';height:' +
      m[2] +
      ';background:currentColor;"></span>'
    );
  }),
  textcolor: matchrepl(/\\textcolor\{([^}]*)\}\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<span style="color:' + m[1] + ';">' + m[2] + '</span>';
  }),
  footnote: matchrepl(/\\footnote\{([^}]*)\}/, function(m: RegExpMatchArray) {
    return '<sup class="footnote">' + m[1] + '</sup>';
  }),
};

export default {
  Expressions,
  Functions,
};

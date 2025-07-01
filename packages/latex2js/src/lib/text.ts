import { matchrepl, simplerepl } from 'latex2js-utils';

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
};

export const Functions = {
  cite: function(m, contents) {
    m.forEach(match=> {
      var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);
      var m = location.pathname.match(/\/books\/(\d+)\//);
      var book_id = 0;
      if (m) {
        book_id = m[1];
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
  img: matchrepl(/\\img\{([^}]*)\}/, function(m) {
    return (
      '<div style="width: 100%;text-align: center;"><img src="' +
      m[1] +
      '"></div>'
    );
  }),
  youtube: matchrepl(/\\youtube\{([^}]*)\}/, function(m) {
    return (
      '<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' +
      m[1] +
      '" frameborder="0" allowfullscreen></iframe></div>'
    );
  }),
  href: matchrepl(/\\href\{([^}]*)\}\{([^}]*)\}/, function(m) {
    return '<a href="' + m[1] + '">' + m[2] + '</a>';
  }),
  set: matchrepl(/\\set\{([^}]*)\}/, function(m) {
    return '<i>' + m[1] + '</i>';
  }),
  euler: simplerepl(/Euler\^/, 'exp'),
  emph: matchrepl(/\{([^}]*)\}/, function(m) {
    return '<i>' + m[1] + '</i>';
  }),
  bf: matchrepl(/\{*\\bf ([^}]*)\}/, function(m) {
    return '<b>' + m[1] + '</b>';
  }),
  rm: matchrepl(/\{*\\rm ([^}]*)\}/, function(m) {
    return '<span class="rm">' + m[1] + '</span>';
  }),
  sl: matchrepl(/\{*\\sl ([^}]*)\}/, function(m) {
    return '<i>' + m[1] + '</i>';
  }),
  it: matchrepl(/\{*\\it ([^}]*)\}/, function(m) {
    return '<i>' + m[1] + '</i>';
  }),
  tt: matchrepl(/\{*\\tt ([^}]*)\}/, function(m) {
    return '<span class="tt">' + m[1] + '</span>';
  }),
  ndash: simplerepl(/--/g, '&ndash;'),
  mdash: simplerepl(/---/g, '&mdash;'),
  openq: simplerepl(/``/g, '&ldquo;'),
  closeq: simplerepl(/''/g, '&rdquo;'),
  vspace: simplerepl(/\\vspace/g, '<br>'),
  TeX: simplerepl(/\\TeX\\|\\TeX/g, '$\\TeX$'),
  LaTeX: simplerepl(/\\LaTeX\\|\\LaTeX/g, '$\\LaTeX$'),
};

export default {
  Expressions,
  Functions,
};

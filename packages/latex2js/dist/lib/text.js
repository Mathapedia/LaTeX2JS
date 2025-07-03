"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
const utils_1 = require("@latex2js/utils");
exports.Expressions = {
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
exports.Functions = {
    cite: function (m, contents) {
        m.forEach((match) => {
            var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);
            var m = location.pathname.match(/\/books\/(\d+)\//);
            var book_id = 0;
            if (m) {
                book_id = parseInt(m[1], 10);
            }
            contents = contents.replace(m2.input, '<a data-bypass="true" href="/references/' +
                book_id +
                '/' +
                m2[2] +
                '">[p' +
                m2[1] +
                ']</a>');
        });
        return contents;
    },
    img: (0, utils_1.matchrepl)(/\\img\{([^}]*)\}/, function (m) {
        return ('<div style="width: 100%;text-align: center;"><img src="' +
            m[1] +
            '"></div>');
    }),
    youtube: (0, utils_1.matchrepl)(/\\youtube\{([^}]*)\}/, function (m) {
        return ('<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' +
            m[1] +
            '" frameborder="0" allowfullscreen></iframe></div>');
    }),
    href: (0, utils_1.matchrepl)(/\\href\{([^}]*)\}\{([^}]*)\}/, function (m) {
        return '<a href="' + m[1] + '">' + m[2] + '</a>';
    }),
    set: (0, utils_1.matchrepl)(/\\set\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    euler: (0, utils_1.simplerepl)(/Euler\^/, 'exp'),
    emph: (0, utils_1.matchrepl)(/\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    bf: (0, utils_1.matchrepl)(/\{*\\bf ([^}]*)\}/, function (m) {
        return '<b>' + m[1] + '</b>';
    }),
    rm: (0, utils_1.matchrepl)(/\{*\\rm ([^}]*)\}/, function (m) {
        return '<span class="rm">' + m[1] + '</span>';
    }),
    sl: (0, utils_1.matchrepl)(/\{*\\sl ([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    it: (0, utils_1.matchrepl)(/\{*\\it ([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    tt: (0, utils_1.matchrepl)(/\{*\\tt ([^}]*)\}/, function (m) {
        return '<span class="tt">' + m[1] + '</span>';
    }),
    ndash: (0, utils_1.simplerepl)(/--/g, '&ndash;'),
    mdash: (0, utils_1.simplerepl)(/---/g, '&mdash;'),
    openq: (0, utils_1.simplerepl)(/``/g, '&ldquo;'),
    closeq: (0, utils_1.simplerepl)(/''/g, '&rdquo;'),
    vspace: (0, utils_1.simplerepl)(/\\vspace/g, '<br>'),
    TeX: (0, utils_1.simplerepl)(/\\TeX\\|\\TeX/g, '$\\TeX$'),
    LaTeX: (0, utils_1.simplerepl)(/\\LaTeX\\|\\LaTeX/g, '$\\LaTeX$'),
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions,
};

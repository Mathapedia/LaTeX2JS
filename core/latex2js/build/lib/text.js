Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var latex2js_utils_1 = require("latex2js-utils");
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
        _.each(m, function (match) {
            var m2 = match.match(/\\cite\[(\d+)\]\{([^}]*)\}/);
            var m = location.pathname.match(/\/books\/(\d+)\//);
            var book_id = 0;
            if (m) {
                book_id = m[1];
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
    img: latex2js_utils_1.matchrepl(/\\img\{([^}]*)\}/, function (m) {
        return ('<div style="width: 100%;text-align: center;"><img src="' +
            m[1] +
            '"></div>');
    }),
    youtube: latex2js_utils_1.matchrepl(/\\youtube\{([^}]*)\}/, function (m) {
        return ('<div style="width: 100%;text-align: center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/' +
            m[1] +
            '" frameborder="0" allowfullscreen></iframe></div>');
    }),
    href: latex2js_utils_1.matchrepl(/\\href\{([^}]*)\}\{([^}]*)\}/, function (m) {
        return '<a href="' + m[1] + '">' + m[2] + '</a>';
    }),
    set: latex2js_utils_1.matchrepl(/\\set\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    euler: latex2js_utils_1.simplerepl(/Euler\^/, 'exp'),
    emph: latex2js_utils_1.matchrepl(/\{([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    bf: latex2js_utils_1.matchrepl(/\{*\\bf ([^}]*)\}/, function (m) {
        return '<b>' + m[1] + '</b>';
    }),
    rm: latex2js_utils_1.matchrepl(/\{*\\rm ([^}]*)\}/, function (m) {
        return '<span class="rm">' + m[1] + '</span>';
    }),
    sl: latex2js_utils_1.matchrepl(/\{*\\sl ([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    it: latex2js_utils_1.matchrepl(/\{*\\it ([^}]*)\}/, function (m) {
        return '<i>' + m[1] + '</i>';
    }),
    tt: latex2js_utils_1.matchrepl(/\{*\\tt ([^}]*)\}/, function (m) {
        return '<span class="tt">' + m[1] + '</span>';
    }),
    ndash: latex2js_utils_1.simplerepl(/--/g, '&ndash;'),
    mdash: latex2js_utils_1.simplerepl(/---/g, '&mdash;'),
    openq: latex2js_utils_1.simplerepl(/``/g, '&ldquo;'),
    closeq: latex2js_utils_1.simplerepl(/''/g, '&rdquo;'),
    vspace: latex2js_utils_1.simplerepl(/\\vspace/g, '<br>'),
    TeX: latex2js_utils_1.simplerepl(/\\TeX\\|\\TeX/g, '$\\TeX$'),
    LaTeX: latex2js_utils_1.simplerepl(/\\LaTeX\\|\\LaTeX/g, '$\\LaTeX$'),
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions,
};
//# sourceMappingURL=text.js.map
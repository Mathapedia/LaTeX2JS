"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignore = [
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
    /\\end\{center\}/
];
exports.default = ignore;

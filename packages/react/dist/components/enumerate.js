"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
exports.default = ({ lines }) => ((0, jsx_runtime_1.jsx)("ul", { className: "math", children: lines.map((line) => {
        var m = line.match(/\\item (.*)/);
        if (m) {
            return (0, jsx_runtime_1.jsx)("li", { children: m[1] });
        }
        else {
            return line;
        }
    }) }));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
exports.default = ({ lines }) => ((0, jsx_runtime_1.jsx)("span", { className: "math nicebox", dangerouslySetInnerHTML: { __html: lines.join('\n') } }));

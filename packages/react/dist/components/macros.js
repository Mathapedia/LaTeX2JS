"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const macros_1 = __importDefault(require("@latex2js/macros"));
exports.default = () => ((0, jsx_runtime_1.jsx)("div", { style: { display: 'none' }, dangerouslySetInnerHTML: { __html: macros_1.default } }));

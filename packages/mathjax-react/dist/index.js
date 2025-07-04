"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMathJax = exports.getMathJax = exports.DEFAULT_CONFIG = exports.MathJaxProvider = void 0;
var MathJaxProvider_1 = require("./components/MathJaxProvider");
Object.defineProperty(exports, "MathJaxProvider", { enumerable: true, get: function () { return __importDefault(MathJaxProvider_1).default; } });
var mathjaxjs_1 = require("mathjaxjs");
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return mathjaxjs_1.DEFAULT_CONFIG; } });
Object.defineProperty(exports, "getMathJax", { enumerable: true, get: function () { return mathjaxjs_1.getMathJax; } });
Object.defineProperty(exports, "loadMathJax", { enumerable: true, get: function () { return mathjaxjs_1.loadMathJax; } });

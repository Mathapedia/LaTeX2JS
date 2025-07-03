"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
const macros_1 = __importDefault(require("@latex2js/macros"));
function render(_that) {
    var div = document.createElement('div');
    div.id = 'latex-macros';
    div.style.display = 'none';
    div.className = 'verbatim';
    div.innerHTML = macros_1.default;
    return div;
}

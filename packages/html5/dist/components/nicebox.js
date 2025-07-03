"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    const span = document.createElement('span');
    span.className = 'math nicebox';
    span.innerHTML = that.lines.join('\n');
    return span;
}

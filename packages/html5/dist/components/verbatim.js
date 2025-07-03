"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
function render(that) {
    var pre = document.createElement('pre');
    pre.className = 'verbatim';
    pre.innerHTML = that.lines.join('\n');
    return pre;
}

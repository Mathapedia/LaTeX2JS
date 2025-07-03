"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = render;
const pstricks_1 = require("@latex2js/pstricks");
const d3 = __importStar(require("d3"));
function render(that) {
    const size = pstricks_1.psgraph.getSize.call(that);
    const width = `${size.width}px`;
    const height = `${size.height}px`;
    const div = document.createElement('div');
    div.className = 'pspicture';
    div.style.width = width;
    div.style.height = height;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    var d3svg = d3.select(svg);
    that.$el = div;
    pstricks_1.psgraph.pspicture.call(that, d3svg);
    div.appendChild(svg);
    const { env, plot } = that;
    const { sliders } = env;
    if (sliders && sliders.length) {
        sliders.forEach((slider) => {
            const { latex, scalar, variable, value, min, max } = slider;
            const onChange = (event) => {
                const target = event.target;
                var val = Number(target.value) / scalar;
                if (!env.variables)
                    env.variables = {};
                env.variables[variable] = val;
                d3svg.selectAll('.psplot').remove();
                Object.entries(plot).forEach(([k, plotData]) => {
                    if (k.match(/psplot/)) {
                        plotData.forEach((data) => {
                            const d = data.fn.call(data.env, data.match);
                            if (pstricks_1.psgraph[k] && d && d3svg) {
                                pstricks_1.psgraph[k].call(d, d3svg);
                            }
                        });
                    }
                });
            };
            const label = document.createElement('label');
            const text = document.createTextNode(latex);
            const input = document.createElement('input');
            input.setAttribute('min', String(min * scalar));
            input.setAttribute('max', String(max * scalar));
            input.setAttribute('type', 'range');
            input.setAttribute('value', value);
            label.appendChild(text);
            label.appendChild(input);
            div.appendChild(label);
            input.addEventListener('input', (event) => {
                onChange(event);
            });
        });
    }
    return div;
}

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
const jsx_runtime_1 = require("react/jsx-runtime");
const d3 = __importStar(require("d3"));
const pstricks_1 = require("@latex2js/pstricks");
exports.default = ({ env, slider, svgRef, plot }) => {
    const { latex, scalar, variable, value, min, max } = slider;
    const onChange = (event) => {
        // update value
        var val = event.target.value / scalar;
        env.variables[variable] = val;
        // update svg
        const svg = d3.select(svgRef.current);
        svg.selectAll('.psplot').remove();
        Object.entries(plot).forEach(([k, plotData]) => {
            if (k.match(/psplot/)) {
                plotData.forEach((data) => {
                    const d = data.fn.call(data.env, data.match);
                    if (pstricks_1.psgraph[k] && d && svg) {
                        pstricks_1.psgraph[k].call(d, svg);
                    }
                });
            }
        });
    };
    return ((0, jsx_runtime_1.jsxs)("label", { children: [latex, (0, jsx_runtime_1.jsx)("input", { type: "range", min: min * scalar, max: max * scalar, defaultValue: value, onChange: onChange })] }));
};

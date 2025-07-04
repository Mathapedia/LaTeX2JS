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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const pstricks_1 = require("@latex2js/pstricks");
const d3 = __importStar(require("d3"));
const react_1 = require("react");
const slider_1 = __importDefault(require("./slider"));
exports.default = (props) => {
    const svgRef = (0, react_1.useRef)(null);
    const divRef = (0, react_1.useRef)(null);
    const size = pstricks_1.psgraph.getSize.call(props);
    const width = `${size.width}px`;
    const height = `${size.height}px`;
    (0, react_1.useEffect)(() => {
        if (svgRef.current && divRef.current) {
            const d3svg = d3.select(svgRef.current);
            const obj = { ...props };
            obj.$el = divRef.current;
            pstricks_1.psgraph.pspicture.call(obj, d3svg);
        }
    }, [props]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "pspicture", style: { width: width, height: height }, ref: divRef, children: [(0, jsx_runtime_1.jsx)("svg", { width: size.width, height: size.height, ref: svgRef }), props.env.sliders &&
                props.env.sliders.map((slider, index) => {
                    return ((0, jsx_runtime_1.jsx)(slider_1.default, { slider: slider, env: props.env, svgRef: svgRef, plot: props.plot }, index));
                })] }));
};

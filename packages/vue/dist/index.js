"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = exports.latex = exports.LaTeX2JS = void 0;
const latex2js_1 = __importDefault(require("latex2js"));
exports.LaTeX2JS = latex2js_1.default;
const latex_vue_1 = __importDefault(require("./latex.vue"));
exports.latex = latex_vue_1.default;
const install = (Vue, config) => {
    if (config) {
        if (config.options) {
            latex_vue_1.default.props.globalOptions.default = () => config.options;
        }
        if (config.events) {
            latex_vue_1.default.props.globalEvents.default = () => config.events;
        }
    }
    Vue.component(latex_vue_1.default.name, latex_vue_1.default);
};
exports.install = install;
const VueCodemirror = { LaTeX2JS: latex2js_1.default, latex: latex_vue_1.default, install };
exports.default = VueCodemirror;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Functions = exports.Expressions = void 0;
const utils_1 = require("@latex2js/utils");
exports.Expressions = {
    fillcolor: /^fillcolor$/,
    fillstyle: /^fillstyle$/,
    linecolor: /^linecolor$/,
    linestyle: /^linestyle$/,
    unit: /^unit/,
    runit: /^runit/,
    xunit: /^xunit/,
    yunit: /^yunit/
};
exports.Functions = {
    fillcolor(o, v) {
        o.fillcolor = v;
    },
    fillstyle(o, v) {
        o.fillstyle = v;
    },
    linecolor(o, v) {
        o.linecolor = v;
    },
    linestyle(o, v) {
        o.linestyle = v;
    },
    unit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.unit = converted;
        o.runit = converted;
        o.xunit = converted;
        o.yunit = converted;
    },
    runit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.runit = converted;
    },
    xunit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.xunit = converted;
    },
    yunit(o, v) {
        const converted = (0, utils_1.convertUnits)(v);
        o.yunit = converted;
    }
};
exports.default = {
    Expressions: exports.Expressions,
    Functions: exports.Functions
};

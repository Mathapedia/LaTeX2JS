import { convertUnits } from '@latex2js/utils';
export const Expressions = {
    fillcolor: /^fillcolor$/,
    fillstyle: /^fillstyle$/,
    linecolor: /^linecolor$/,
    linestyle: /^linestyle$/,
    unit: /^unit/,
    runit: /^runit/,
    xunit: /^xunit/,
    yunit: /^yunit/
};
export const Functions = {
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
        const converted = convertUnits(v);
        o.unit = converted;
        o.runit = converted;
        o.xunit = converted;
        o.yunit = converted;
    },
    runit(o, v) {
        const converted = convertUnits(v);
        o.runit = converted;
    },
    xunit(o, v) {
        const converted = convertUnits(v);
        o.xunit = converted;
    },
    yunit(o, v) {
        const converted = convertUnits(v);
        o.yunit = converted;
    }
};
export default {
    Expressions,
    Functions
};

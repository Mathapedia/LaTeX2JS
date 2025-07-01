import { convertUnits } from 'latex2js-utils';

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
    v = convertUnits(v);
    o.unit = v;
    o.runit = v;
    o.xunit = v;
    o.yunit = v;
  },
  runit(o, v) {
    v = convertUnits(v);
    o.runit = v;
  },
  xunit(o, v) {
    v = convertUnits(v);
    o.xunit = v;
  },
  yunit(o, v) {
    v = convertUnits(v);
    o.yunit = v;
  }
};

export default {
  Expressions,
  Functions
};

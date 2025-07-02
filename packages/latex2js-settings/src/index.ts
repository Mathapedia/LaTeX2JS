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
  fillcolor(o: any, v: any) {
    o.fillcolor = v;
  },
  fillstyle(o: any, v: any) {
    o.fillstyle = v;
  },
  linecolor(o: any, v: any) {
    o.linecolor = v;
  },
  linestyle(o: any, v: any) {
    o.linestyle = v;
  },
  unit(o: any, v: string) {
    const converted = convertUnits(v);
    o.unit = converted;
    o.runit = converted;
    o.xunit = converted;
    o.yunit = converted;
  },
  runit(o: any, v: string) {
    const converted = convertUnits(v);
    o.runit = converted;
  },
  xunit(o: any, v: string) {
    const converted = convertUnits(v);
    o.xunit = converted;
  },
  yunit(o: any, v: string) {
    const converted = convertUnits(v);
    o.yunit = converted;
  }
};

export default {
  Expressions,
  Functions
};

import { convertUnits } from '@latex2js/utils';

/** The dialect names a document may declare, and their canonical form. */
export type Dialect = 'pstricks' | 'latex2js';

/**
 * Canonicalizes a declared dialect name.
 *
 * `mathapedia` is accepted as an alias for `latex2js`: the dialect belongs to
 * the renderer, while Mathapedia is a product built on it, so one canonical
 * name keeps comparisons simple without making authors learn which to write.
 *
 * @param value - the declared name, in any case
 * @returns the canonical dialect, or null when the name is not one we know
 */
export function normalizeDialect(value: any): Dialect | null {
  const v = String(value ?? '').trim().toLowerCase();
  if (v === 'pstricks') return 'pstricks';
  if (v === 'latex2js' || v === 'mathapedia') return 'latex2js';
  return null;
}

export const Expressions = {
  dialect: /^dialect$/,
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
  /**
   * Which language the document is written in.
   *
   * `pstricks` is the specification; `latex2js` (alias `mathapedia`) is this
   * project's superset — the interactive macros, infix plot bodies, natural-log
   * `log`, starred shapes honouring `fillcolor`. Declaring it is what makes the
   * extensions visible instead of indistinguishable from a bug.
   */
  dialect(o: any, v: any) {
    o.dialect = normalizeDialect(v);
  },
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

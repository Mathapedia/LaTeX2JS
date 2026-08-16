/**
 * Which constructs belong to the LaTeX2JS dialect rather than to PSTricks.
 *
 * LaTeX2JS accepts a superset of PSTricks: some of it is the deliberate reason
 * this project exists (the interactive macros), some of it is convenience
 * (infix plot bodies, CSS colour names), and some is a genuine semantic fork
 * (`log` is natural log here, base 10 there). Until a document could declare
 * which language it was written in, none of that was distinguishable from a
 * defect — by a reader, a test, or the author.
 *
 * A document declares `\psset{dialect=latex2js}`, or the embedding application
 * sets it once. Anything left undeclared is read as PSTricks and reported.
 *
 * Reporting is all this does. The dialect changes a small number of documented
 * semantics (see `Dialect` in @latex2js/settings); it does not switch the
 * renderer, and nothing here refuses to draw.
 */

/** One use of a construct that PSTricks does not have, or reads differently. */
export interface DialectUse {
  /** Short identifier for the construct, stable enough to group by. */
  construct: string;
  /** What a reader needs to know, phrased for someone who knows PSTricks. */
  detail: string;
}

/** Colour names the browser knows and xcolor does not. */
const CSS_ONLY_COLORS = ['lightblue', 'lightgray', 'lightgrey', 'lightgreen', 'darkblue', 'darkgreen', 'pink', 'gold', 'silver', 'navy', 'teal', 'lime', 'aqua', 'fuchsia'];

/** Commands with no PSTricks counterpart at all. */
const LATEX2JS_ONLY_COMMANDS: { [name: string]: string } = {
  userline: 'draws a line the reader can drag; PSTricks has no interactive graphics',
  uservariable: 'binds a value to the pointer position; PSTricks has no such binding',
  slider: 'renders a control the reader can move; PSTricks has no such control',
};

/**
 * Reports the dialect constructs one parsed command uses.
 *
 * @param name - the command name, without its backslash
 * @param raw - the command's source text
 * @param options - its parsed options, or null when it has none
 * @returns every construct the command relies on, empty when it is plain PSTricks
 */
export function dialectUses(
  name: string,
  raw: string,
  options: { [key: string]: any } | null
): DialectUse[] {
  const uses: DialectUse[] = [];

  const only = LATEX2JS_ONLY_COMMANDS[name];
  if (only) uses.push({ construct: `\\${name}`, detail: only });

  // A bare key is a syntax error to PSTricks, which expects `key=value`.
  const bare = /\[([^\]]*)\]/.exec(raw);
  if (bare) {
    for (const part of bare[1].split(',')) {
      const token = part.trim();
      if (token && !token.includes('=')) {
        uses.push({
          construct: 'bare option flag',
          detail: `\`${token}\` has no value; PSTricks requires \`${token}=true\``,
        });
      }
    }
  }

  if (options) {
    for (const key of ['linecolor', 'fillcolor', 'hatchcolor', 'gridcolor']) {
      const value = String(options[key] ?? '').trim().toLowerCase();
      if (CSS_ONLY_COLORS.indexOf(value) !== -1) {
        uses.push({
          construct: 'CSS colour name',
          detail: `\`${value}\` is a browser colour; xcolor does not define it`,
        });
      }
    }
    if (options.plotpoints !== undefined && Number(options.plotpoints) === 1) {
      uses.push({
        construct: 'plotpoints=1',
        detail: 'PSTricks requires at least 2 samples',
      });
    }
  }

  if (name === 'psplot') uses.push(...plotBodyUses(raw, options));

  return uses;
}

/**
 * Reports what a `\psplot` body relies on.
 *
 * The dialects have opposite defaults here: LaTeX2JS always reads the body as
 * an infix expression, while PSTricks reads RPN PostScript unless told
 * `algebraic=true`. A body is therefore worth reporting whenever the document
 * has not asked for algebraic mode, whatever it contains.
 */
function plotBodyUses(raw: string, options: { [key: string]: any } | null): DialectUse[] {
  const uses: DialectUse[] = [];
  const groups = raw.match(/\{([^{}]*)\}/g) || [];
  const bodies = groups.map((g) => g.slice(1, -1));

  const declaredAlgebraic = String(options?.algebraic ?? '').toLowerCase() === 'true';
  if (!declaredAlgebraic) {
    uses.push({
      construct: 'infix plot body',
      detail: 'read as an infix expression; PSTricks reads RPN PostScript unless algebraic=true',
    });
  }

  const body = bodies[bodies.length - 1] ?? '';
  if (/\bpow\s*\(/.test(body)) {
    uses.push({ construct: 'pow()', detail: 'PSTricks has no pow function, only the ^ operator' });
  }
  if (/\blog\s*\(/.test(body)) {
    uses.push({ construct: 'log()', detail: 'natural log here, base 10 in PSTricks' });
  }

  // The two bounds precede the body; a non-numeric one is an expression over
  // variables, which PSTricks cannot evaluate.
  for (const bound of bodies.slice(0, -1)) {
    if (bound.trim() && !/^-?[\d.]+$/.test(bound.trim())) {
      uses.push({
        construct: 'variable plot bound',
        detail: `\`${bound.trim()}\` is an expression; PSTricks needs a literal number`,
      });
    }
  }

  return uses;
}

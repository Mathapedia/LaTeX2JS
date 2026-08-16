import * as pegParser from '../grammar/parser.js';
import { dialectUses } from './dialect';
import { normalizeDialect } from '@latex2js/settings';

export interface Diagnostic {
  severity: 'error' | 'warning';
  message: string;
  line?: number;
  column?: number;
}

interface Loc {
  line: number;
  column: number;
}

interface LineNode {
  kind: 'line';
  parts: Array<{ kind: 'char'; c: string } | { kind: 'comment' } | CommandNode>;
  hasEol: boolean;
  loc: Loc;
}

interface CommandNode {
  kind: 'command';
  name: string;
  raw: string;
  loc: Loc;
}

interface EnvNode {
  kind: 'env';
  name: string;
  verbatim: boolean;
  begin: { name: string; raw: string; loc: Loc };
  end: { name: string; raw: string; loc: Loc } | null;
  content: Array<LineNode | CommandNode | EnvNode | { kind: 'verbatim'; text: string }>;
  loc: Loc;
}

type Segment =
  | LineNode
  | CommandNode
  | EnvNode
  | { kind: 'strayEnd'; name: string; raw: string; loc: Loc }
  | { kind: 'raw'; text: string };

/**
 * Names the numeric fields of a parsed command that came out non-finite.
 *
 * `X` and `Y` return NaN for a coordinate they cannot compute rather than
 * inventing one at the origin, so this is where that shows up: a command whose
 * geometry is unusable is reported against its own source location instead of
 * drawing a plausible shape in the wrong place.
 *
 * @param value - a parsed command's data
 * @returns the paths of the offending fields, empty when everything is usable
 */
function nonFiniteFields(value: any, path = '', depth = 0): string[] {
  if (depth > 4 || value === null || value === undefined) return [];
  if (typeof value === 'number') return isFinite(value) ? [] : [path || 'value'];
  if (Array.isArray(value)) {
    return value.flatMap((v, i) =>
      typeof v === 'number' && !isFinite(v) ? [`${path}[${i}]`] : nonFiniteFields(v, `${path}[${i}]`, depth + 1)
    );
  }
  if (typeof value !== 'object') return [];
  // `global` is the shared environment, not this command's own geometry.
  return Object.entries(value)
    .filter(([k]) => k !== 'global' && k !== 'env')
    .flatMap(([k, v]) => nonFiniteFields(v, path ? `${path}.${k}` : k, depth + 1));
}

/**
 * Parser: turns a LaTeX-ish document into the flat environment objects the
 * components consume ({type, lines, env, plot}) — but driven by the Peggy
 * grammar in src/grammar instead of per-line regular expressions.
 *
 * The grammar tokenizes structure (balanced environments, commands with args,
 * comments, verbatim). This class interprets that tree using the registries
 * (Text / Headers / Ignore / PSTricks / Delimiters), so the runtime extension
 * API (addEnvironment / addText / addHeaders) keeps working. It also collects
 * diagnostics (unclosed environments, unknown commands, syntax errors) that
 * were previously silent.
 */
class Parser {
  Ignore: any;
  Delimiters: any;
  Text: any;
  PSTricks: any;
  Headers: any;
  objects: any[];
  environment: any;
  settings: any;
  diagnostics: Diagnostic[];
  dialect: 'pstricks' | 'latex2js';

  constructor(LaTeX2JS: any) {
    this.Ignore = LaTeX2JS.Ignore;
    this.Delimiters = LaTeX2JS.Delimiters;
    this.Text = LaTeX2JS.Text;
    this.PSTricks = LaTeX2JS.PSTricks;
    this.Headers = LaTeX2JS.Headers;
    this.objects = [];
    this.environment = null;
    this.settings = this.PSTricks.Functions.psset.call(this, [
      '',
      'units=1cm,linecolor=black,linestyle=solid,fillstyle=none'
    ]);
    this.diagnostics = [];
    // The embedding application can declare the dialect once for every document
    // it renders; a document's own \psset overrides it.
    this.dialect = normalizeDialect(LaTeX2JS.dialect) ?? 'pstricks';
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  parse(text: string): any[] {
    this.diagnostics = [];
    if (!text) return [];
    const tree = this.parseTree(text);
    this.walk(tree);
    this.objects.forEach((obj) => {
      if (obj.type.match(/pspicture/)) {
        obj.plot = this.parsePSTricks(obj.commands || [], obj.env);
        delete obj.commands;
      }
    });
    return this.objects;
  }

  // -------------------------------------------------------------------------
  // Grammar integration
  // -------------------------------------------------------------------------

  parseTree(text: string): Segment[] {
    try {
      return pegParser.parse(text);
    } catch (err: any) {
      const loc = err.location || { start: { line: 1, column: 1 } };
      this.diagnostics.push({
        severity: 'error',
        message: `parse error: ${err.message || String(err)}`,
        line: loc.start.line,
        column: loc.start.column
      });
      // Degraded fallback: treat the whole input as a math text block.
      return [{ kind: 'raw', text: text }];
    }
  }

  // -------------------------------------------------------------------------
  // Tree walk
  // -------------------------------------------------------------------------

  walk(segments: Segment[]): void {
    this.objects = [];
    this.environment = { type: 'math', lines: [] };
    segments.forEach((seg) => this.walkSegment(seg));
    this.newEnvironment('math');
  }

  walkSegment(seg: Segment): void {
    if (seg.kind === 'raw') {
      seg.text.split('\n').forEach((line: string) => this.pushMathLine(line));
      return;
    }
    switch (seg.kind) {
      case 'line':
        this.walkContent(seg);
        break;
      case 'env':
        this.walkEnv(seg as EnvNode);
        break;
      case 'strayEnd':
        if (this.isIgnored(seg.raw)) return;
        this.diagnose('warning', `unexpected \\end{${seg.name}}`, seg.loc);
        break;
    }
  }

  walkEnv(env: EnvNode): void {
    const name = env.name;

    // Ignored wrapper environments (center, document, interactive…) are
    // dropped, but their content is still walked in the current context.
    if (this.isIgnoredEnv(name)) {
      env.content.forEach((c) => this.walkContent(c));
      return;
    }

    const structural = env.verbatim || !!this.Delimiters[name];
    if (!structural) {
      // Non-structural environments (theorem, proof, quotation…) flatten into
      // the current environment as header text (handled by the Headers pass).
      const inPspicture = this.inPspicture();
      if (inPspicture) this.pushLine(env.begin.raw);
      else this.pushMathLine(env.begin.raw);
      env.content.forEach((c) => this.walkContent(c));
      if (env.end) {
        if (inPspicture) this.pushLine(env.end.raw);
        else this.pushMathLine(env.end.raw);
      } else {
        this.diagnose('warning', `unclosed \\begin{${name}}`, env.begin.loc);
      }
      return;
    }

    // Structural environment: close the current one and open a new one.
    this.newEnvironment(name);
    if (!env.verbatim) this.metaData(name, env);

    if (env.verbatim) {
      const v = env.content[0];
      this.environment.lines = v && v.kind === 'verbatim' ? v.text.split('\n') : [];
    } else if (name.match(/pspicture/)) {
      this.environment.commands = [];
      env.content.forEach((c) => this.walkContent(c));
    } else {
      // enumerate / itemize / nicebox: content is text lines (with transforms).
      this.walkTextContent(env.content);
    }

    if (env.end && env.end.name !== name) {
      this.diagnose(
        'warning',
        `\\end{${env.end.name}} does not match \\begin{${name}}`,
        env.end.loc
      );
    } else if (!env.end) {
      this.diagnose('warning', `unclosed environment '${name}'`, env.begin.loc);
    }
    this.newEnvironment('math');
  }

  /**
   * Walk a text environment's content, rejoining the nodes that came from one
   * source line.
   *
   * `EnvContent` matches `Command` before `Line`, and a command's tail stops at
   * the next command, so `\item First with \textbf{bold} text` arrives as two
   * command nodes. Walking them individually renders each as its own line,
   * which broke every list item at its first macro. pspicture keeps the
   * per-node walk, because it depends on receiving commands separately.
   */
  walkTextContent(content: any[]): void {
    let pending: any[] = [];

    const flush = (): void => {
      if (!pending.length) return;
      const text = pending
        .map((n) => (n.kind === 'line' ? this.lineToString(n) : n.raw))
        .join('');
      pending = [];
      this.pushMathLine(text);
    };

    content.forEach((node) => {
      if (node.kind === 'env') {
        flush();
        this.walkEnv(node);
        return;
      }

      // An empty Line is the newline itself: it closes the line being built,
      // or is a genuine paragraph break when there is nothing to close.
      if (node.kind === 'line' && node.parts.length === 0) {
        if (pending.length) flush();
        else this.pushBlankLine(false);
        return;
      }

      const at = node.loc && node.loc.line;
      const open = pending.length ? pending[0].loc && pending[0].loc.line : at;
      if (pending.length && at !== open) flush();
      pending.push(node);

      // A Line node consumed its own EOL, so nothing more belongs to it.
      if (node.kind === 'line') flush();
    });

    flush();
  }

  /**
   * Walk one node of environment content. Behavior depends on the current
   * environment: inside pspicture we collect commands (and raw lines) for plot
   * extraction; elsewhere lines go through the text/header passes.
   */
  walkContent(node: any): void {
    const inPspicture = this.inPspicture();

    switch (node.kind) {
      case 'line': {
        // Comment-only lines are dropped (mirrors the old /^%/ ignore rule).
        const allComments =
          node.parts.length > 0 && node.parts.every((p: any) => p.kind === 'comment');
        if (allComments) return;
        if (node.parts.length === 0) {
          this.pushBlankLine(inPspicture);
          return;
        }
        const text = this.lineToString(node);
        if (inPspicture) this.pushLine(text);
        else this.pushMathLine(text);
        break;
      }
      case 'command': {
        if (node.name === 'psset') {
          this.parseUnits(node.raw);
          return;
        }
        if (inPspicture) this.environment.commands.push(node);
        else this.pushMathLine(node.raw);
        break;
      }
      case 'env':
        this.walkEnv(node);
        break;
      default:
        break;
    }
  }

  /**
   * Convert a Line node's parts back to a string, dropping comment fragments.
   */
  lineToString(line: LineNode): string {
    return line.parts
      .filter((p) => p.kind !== 'comment')
      .map((p) => (p.kind === 'char' ? p.c : (p as CommandNode).raw))
      .join('');
  }

  // -------------------------------------------------------------------------
  // Line handling
  // -------------------------------------------------------------------------

  inPspicture(): boolean {
    return !!(this.environment && this.environment.type.match(/pspicture/));
  }

  pushBlankLine(inPspicture: boolean): void {
    if (inPspicture) return;
    if (this.inPspicture()) return;
    this.environment.lines.push('<br>');
  }

  pushMathLine(text: string): void {
    if (this.isIgnored(text)) return;
    if (!text.trim().length) {
      this.environment.lines.push('<br>');
      return;
    }
    if (this.PSTricks.Expressions.psset.test(text)) {
      this.parseUnits(text);
      return;
    }
    const processed = this.parseText(text);
    if (processed.trim().length) this.environment.lines.push(processed);
  }

  /** Raw line inside a pspicture: no text/header transforms (they corrupt
   *  PSTricks content). */
  pushLine(line: string): void {
    var add = true;
    this.Ignore.forEach((exp: RegExp) => {
      if (exp.test(line)) {
        add = false;
      }
    });
    if (add && typeof line === 'string' && line.trim().length) {
      if (this.PSTricks.Expressions.psset.test(line)) {
        this.parseUnits(line);
      } else {
        this.environment.lines.push(line);
      }
    }
  }

  isIgnored(line: string): boolean {
    return this.Ignore.some((exp: RegExp) => exp.test(line));
  }

  isIgnoredEnv(name: string): boolean {
    return this.isIgnored('\\begin{' + name + '}');
  }

  /**
   * A blank source line becomes a `<br>`, but a heading already carries its own
   * margins, so a `<br>` next to one stacks two gaps where the author asked for
   * one. Dropping the adjacent break leaves the heading's own spacing to do the
   * work — and a run of breaks collapses to a single paragraph gap.
   */
  collapseBreaks(lines: string[]): string[] {
    const isBlock = (l: string) => /^\s*<(h[1-6]|ul|ol|li|p|div|table|blockquote)\b/i.test(l);
    const out: string[] = [];
    for (const line of lines) {
      if (line !== '<br>') {
        while (isBlock(line) && out[out.length - 1] === '<br>') out.pop();
        out.push(line);
        continue;
      }
      if (!out.length) continue;
      if (isBlock(out[out.length - 1])) continue;
      if (out[out.length - 1] === '<br>') continue;
      out.push(line);
    }
    while (out[out.length - 1] === '<br>') out.pop();
    return out;
  }

  newEnvironment(type: string): void {
    if (
      this.environment &&
      (this.environment.lines.length || this.environment.type !== 'math')
    ) {
      this.environment.settings = { ...this.settings };
      if (!this.environment.type.match(/pspicture|verbatim/)) {
        this.environment.lines = this.collapseBreaks(this.environment.lines);
      }
      this.objects.push(this.environment);
    }
    this.environment = {
      type: type,
      lines: []
    };
  }

  parseUnits(line: string): void {
    var m = line.replace(/\n/g, ' ').match(this.PSTricks.Expressions.psset);
    const declared = this.PSTricks.Functions.psset.call(this, m);
    if (declared.dialect) this.dialect = declared.dialect;
    Object.assign(this.settings, declared);
  }

  metaData(environment: string, envNode: EnvNode): void {
    if (this.PSTricks.Expressions.hasOwnProperty(environment)) {
      this.environment.match = envNode.begin.raw
        .replace(/\n/g, ' ')
        .match(this.PSTricks.Expressions[environment]);
      if (!this.environment.match) {
        this.diagnose(
          'error',
          `could not parse \\begin{${environment}} arguments`,
          envNode.begin.loc
        );
        this.environment.env = {};
        this.environment.env.xunit = this.settings.xunit;
        this.environment.env.yunit = this.settings.yunit;
        return;
      }
      this.environment.env = this.PSTricks.Functions[environment].call(
        this.settings,
        this.environment.match
      );
      if (environment.match(/pspicture/)) {
        if (typeof this.environment.env.xunit === 'undefined') {
          this.environment.env.xunit = this.settings.xunit;
        }
        if (typeof this.environment.env.yunit === 'undefined') {
          this.environment.env.yunit = this.settings.yunit;
        }
        // Renderers read the dialect for the handful of semantics it changes.
        this.environment.env.dialect = this.dialect;
      }
    }
  }

  // -------------------------------------------------------------------------
  // PSTricks command extraction (ordered)
  // -------------------------------------------------------------------------

  /**
   * Extract plot data from the ordered command nodes of a pspicture.
   * Returns the grouped `plot` map (keyed by command type, used by the
   * interactive re-render paths) and records the ordered `elements` list on
   * the env for source-order initial rendering.
   */
  parsePSTricks(commands: CommandNode[], env: any): any {
    var plot: { [key: string]: any[] } = {};
    const entries = Object.entries(this.PSTricks.Expressions);
    entries.forEach(([k, _exp]) => {
      plot[k] = [];
    });

    const elements: any[] = [];
    this.extractCommands(commands, env, plot, elements);
    env.elements = elements;
    return plot;
  }

  /**
   * Extract one command node into `plot` (grouped) and `elements` (ordered).
   * Recurses into `\multido` bodies (expanded, counter substituted) and
   * `\pscustom` bodies (the renderer re-parses those itself — the command is
   * kept as a single element with its raw body).
   */
  extractCommands(
    commands: CommandNode[],
    env: any,
    plot: { [key: string]: any[] },
    elements: any[]
  ): void {
    commands.forEach((node) => {
      const k = node.name;
      const exp = this.PSTricks.Expressions[k];
      if (!exp) {
        this.diagnose('warning', `unknown command \\${k} in pspicture`, node.loc);
        return;
      }
      // The grammar captures commands across lines; the semantic regexes are
      // single-line, so collapse internal newlines before matching.
      const raw = node.raw.replace(/\n/g, ' ');
      const m = raw.match(exp);
      if (!m) {
        this.diagnose(
          'warning',
          `could not parse \\${k}: ${JSON.stringify(node.raw)}`,
          node.loc
        );
        return;
      }
      const data = this.PSTricks.Functions[k].call(env, m);

      // \multido{var=start+step}{count}{body} — expand and recurse.
      if (k === 'multido') {
        this.expandMultido(data, env, plot, elements, node);
        return;
      }

      // \pscustom{...} — pre-extract the inner commands into pixel data so
      // the renderer can build a single filled/stroked path.
      if (k === 'pscustom' && data.body) {
        data.commands = this.extractCustomBody(data.body, env);
      }

      plot[k].push({ data: data, env: env, match: m, fn: this.PSTricks.Functions[k] });
      // Under the PSTricks reading, anything this project added is worth
      // naming. A document that declares the LaTeX2JS dialect has said it means
      // to use them, so it is not told again.
      if (this.dialect === 'pstricks') {
        // `data` carries the command's parsed options, which is what the
        // detector inspects alongside the raw source.
        for (const use of dialectUses(k, node.raw ?? '', data)) {
          this.diagnose(
            'warning',
            `${use.construct} is a LaTeX2JS extension: ${use.detail}. ` +
              'Declare \\psset{dialect=latex2js} if that is intended.',
            node.loc
          );
        }
      }

      const bad = nonFiniteFields(data);
      if (bad.length) {
        this.diagnose(
          'warning',
          `\\${k} produced no usable value for ${bad.join(', ')}; it will not be drawn`,
          node.loc
        );
      }

      elements.push({ name: k, data: data, match: m, fn: this.PSTricks.Functions[k], loc: node.loc });

      // side effects preserved from the old parser:
      if (k === 'psaxes' && plot[k].length > 0) {
        const axesData = plot[k][plot[k].length - 1].data;
        if (axesData && axesData.dx !== undefined) {
          env.dx = axesData.dx;
          env.dy = axesData.dy;
          env.origin = axesData.origin;
        }
      }
      if (k === 'uservariable') {
        env.variables = env.variables || {};
        env.variables[data.name] = data.value;
      }
    });
  }

  /** Expand a \multido loop into its constituent commands. */
  expandMultido(
    data: any,
    env: any,
    plot: { [key: string]: any[] },
    elements: any[],
    node: CommandNode
  ): void {
    if (!data.variable || !(data.count > 0) || !data.body) return;
    const re = new RegExp('\\\\' + data.variable + '\\b', 'g');
    for (let i = 0; i < data.count; i++) {
      const value = data.start + i * data.step;
      const body = data.body.replace(re, String(value));
      this.commandNodesFrom(this.parseTree(body)).forEach((cmd) => {
        this.extractCommands([cmd], env, plot, elements);
      });
    }
  }

  /**
   * Extract the inner commands of a \pscustom body into pixel data for the
   * renderer. Commands that need DOM/runtime handling (rput, slider, psset,
   * nested pscustom, multido) are skipped.
   */
  extractCustomBody(body: string, env: any): any[] {
    const out: any[] = [];
    const skip = ['rput', 'slider', 'psset', 'pspicture', 'pscustom', 'multido', 'uservariable'];
    this.commandNodesFrom(this.parseTree(body)).forEach((node) => {
      const k = node.name;
      if (skip.indexOf(k) !== -1) return;
      const exp = this.PSTricks.Expressions[k];
      if (!exp) return;
      const m = node.raw.replace(/\n/g, ' ').match(exp);
      if (!m) return;
      try {
        const data = this.PSTricks.Functions[k].call(env, m);
        if (data) out.push({ key: k, data: data });
      } catch (err) {
        /* ignore malformed inner commands */
      }
    });
    return out;
  }

  /**
   * Flatten parsed segments into an ordered list of command nodes, walking
   * into line parts and nested environments.
   */
  commandNodesFrom(segs: Segment[]): CommandNode[] {
    const out: CommandNode[] = [];
    const walk = (seg: any): void => {
      if (seg.kind === 'command') out.push(seg);
      else if (seg.kind === 'line') {
        (seg.parts || []).forEach((p: any) => {
          if (p.kind === 'command') out.push(p);
        });
      } else if (seg.kind === 'env') {
        (seg.content || []).forEach(walk);
      }
    };
    segs.forEach(walk);
    return out;
  }

  // -------------------------------------------------------------------------
  // Text / header transforms (reused from the old parser, string-based)
  // -------------------------------------------------------------------------

  /**
   * Text transforms run in sequence over one line, so each must match the
   * value the previous ones produced. Matching the pristine line instead makes
   * `matchrepl` search `contents` for a literal that an earlier transform has
   * already rewritten, and the replacement silently does nothing — which is
   * why `\section{Cauchy--Schwarz}` survived as source text once `--` had
   * become an en dash.
   */
  parseTextExpression(_line: string, exp: RegExp, k: string, contents: string): string {
    var match = contents.match(exp);
    if (match) {
      return this.Text.Functions[k].call(this, match, contents);
    }
    return contents;
  }

  parseHeadersExpression(line: string, exp: RegExp, k: string, contents: string): string {
    var match = line.match(exp);
    if (match) {
      return this.Headers.Functions[k].call(this);
    }
    return contents;
  }

  parseText(line: string): string {
    var contents = line;
    // TEXT
    Object.entries(this.Text.Expressions).forEach(([k, exp]: [string, any]) => {
      contents = this.parseTextExpression(line, exp, k, contents);
    });

    // HEADERS
    Object.entries(this.Headers.Expressions).forEach(([k, exp]: [string, any]) => {
      contents = this.parseHeadersExpression(line, exp, k, contents);
    });

    return contents;
  }

  // -------------------------------------------------------------------------
  // Diagnostics
  // -------------------------------------------------------------------------

  diagnose(severity: 'error' | 'warning', message: string, loc?: Loc): void {
    this.diagnostics.push({
      severity: severity,
      message: message,
      line: loc ? loc.line : undefined,
      column: loc ? loc.column : undefined
    });
  }
}

export default Parser;

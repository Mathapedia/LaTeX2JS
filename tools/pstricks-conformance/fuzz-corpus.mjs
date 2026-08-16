#!/usr/bin/env node
/**
 * fuzz-corpus.mjs — generate a systematic PSTricks test corpus.
 *
 * Each case is emitted twice from one source of truth:
 *   <out>/tex/<id>.tex   the bare pspicture body, for LaTeX2JS
 *   <out>/doc/<id>.tex   the same body wrapped in a standalone LaTeX document,
 *                        for compiling with real PSTricks as ground truth
 *   <out>/manifest.json  id -> { command, axis, body, why }
 *
 * The point is coverage of the parameter space, not random noise: every case
 * names the command and the axis it varies, so a visual diff against real
 * PSTricks says exactly which feature is wrong.
 *
 *   node fuzz-corpus.mjs --out ./corpus [--only psline,pscurve]
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// --------------------------------------------------------------- parameters

/** Style axes applied across every drawable command. */
const LINE_STYLES = ['solid', 'dashed', 'dotted', 'none']
const FILL_STYLES = ['none', 'solid', 'hlines', 'vlines', 'crosshatch']
const ARROWS = ['-', '->', '<-', '<->', '|-|', '->>']
const WIDTHS = ['0.5pt', '1pt', '2pt', '4pt']
const COLORS = ['black', 'red', 'blue', 'green', 'magenta']

/**
 * Drawable commands and how to instantiate one.
 * `body(opt)` takes a bracketed option string (possibly empty) and returns the
 * command text; `fills` marks commands that accept a fill style.
 */
const COMMANDS = {
  psline: { fills: false, body: (o) => `\\psline${o}(-2,-1)(0,1.5)(2,-1)` },
  psframe: { fills: true, body: (o) => `\\psframe${o}(-2,-1)(2,1)` },
  pspolygon: { fills: true, body: (o) => `\\pspolygon${o}(-2,-1)(0,1.5)(2,-1)(1,-1.5)` },
  pscircle: { fills: true, body: (o) => `\\pscircle${o}(0,0){1.5}` },
  psellipse: { fills: true, body: (o) => `\\psellipse${o}(0,0)(2,1)` },
  pswedge: { fills: true, body: (o) => `\\pswedge${o}(0,0){2}{30}{150}` },
  psarc: { fills: false, body: (o) => `\\psarc${o}(0,0){1.8}{20}{160}` },
  psbezier: { fills: true, body: (o) => `\\psbezier${o}(-2,-1)(-1,2)(1,-2)(2,1)` },
  pscurve: { fills: true, body: (o) => `\\pscurve${o}(-2,-1)(-1,1)(0,-0.5)(1,1.5)(2,0)` },
  psecurve: { fills: false, body: (o) => `\\psecurve${o}(-2,-1)(-1,1)(0,-0.5)(1,1.5)(2,0)` },
  psccurve: { fills: true, body: (o) => `\\psccurve${o}(-2,-1)(-1,1)(0,-0.5)(1,1.5)(2,0)` },
  psdots: { fills: false, body: (o) => `\\psdots${o}(-2,-1)(-1,0)(0,1)(1,0)(2,-1)` },
  psgrid: { fills: false, body: (o) => `\\psgrid${o}(-2,-2)(2,2)` },
  // Written in the algebraic dialect both engines can read. An RPN body is the
  // one difference the dialect flag does not close, and it is covered once as a
  // deliberate edge case rather than by every psplot variation reporting the
  // same known gap.
  psplot: {
    fills: false,
    body: (o) => `\\psplot${o ? `${o.slice(0, -1)},algebraic=true]` : '[algebraic=true]'}{-2}{2}{x^2}`,
  },
  pscustom: { fills: true, body: (o) => `\\pscustom${o}{\\moveto(-2,-1)\\lineto(0,1.5)\\lineto(2,-1)\\closepath}` },
  psaxes: { fills: false, body: (o) => `\\psaxes${o}(0,0)(-2,-2)(2,2)` },
}

/** Cases that specifically probe draw order and interaction, not one command. */
const LAYER_CASES = [
  {
    id: 'layer-fill-then-line',
    why: 'A solid fill authored before a line: the line must stay on top.',
    body: `\\psframe[fillstyle=solid,fillcolor=lightgray](-2,-2)(2,2)\n\\psline[linewidth=2pt,linecolor=red](-2,-2)(2,2)`,
  },
  {
    id: 'layer-line-then-fill',
    why: 'The reverse order: the fill must cover the line.',
    body: `\\psline[linewidth=2pt,linecolor=red](-2,-2)(2,2)\n\\psframe[fillstyle=solid,fillcolor=lightgray](-2,-2)(2,2)`,
  },
  {
    id: 'layer-grid-under-fill',
    why: 'psgrid authored first must sit behind a later filled shape.',
    body: `\\psgrid(-2,-2)(2,2)\n\\pscircle[fillstyle=solid,fillcolor=cyan](0,0){1.5}`,
  },
  {
    id: 'layer-grid-over-fill',
    why: 'psgrid authored last must sit in front of the fill.',
    body: `\\pscircle[fillstyle=solid,fillcolor=cyan](0,0){1.5}\n\\psgrid(-2,-2)(2,2)`,
  },
  {
    id: 'layer-userline-first',
    why: 'Interactive \\userline authored BEFORE a fill. Known-suspect: the initial draw respects source order, but the mousemove re-render removes and re-appends userlines, which can promote them above later elements.',
    body: `\\userline[linewidth=2pt,linecolor=blue]{->}(0,0)(2,2)\n\\psframe[fillstyle=solid,fillcolor=lightgray](-1,-1)(1,1)`,
    interactive: true,
  },
  {
    id: 'layer-psplot-first',
    why: 'Same probe for \\psplot, which the re-render also removes and re-appends.',
    body: `\\psplot[linewidth=2pt,linecolor=red]{-2}{2}{x x mul}\n\\psframe[fillstyle=solid,fillcolor=lightgray](-1,-1)(1,1)`,
    interactive: true,
  },
  {
    id: 'layer-three-deep',
    why: 'Three overlapping fills in a strict order; any reordering is obvious.',
    body: `\\pscircle[fillstyle=solid,fillcolor=red](-0.6,0){1.2}\n\\pscircle[fillstyle=solid,fillcolor=green](0.6,0){1.2}\n\\pscircle[fillstyle=solid,fillcolor=blue](0,0.8){1.2}`,
  },
  {
    id: 'layer-rput-nested',
    why: 'rput-placed content must land in source order relative to plain shapes.',
    body: `\\psframe[fillstyle=solid,fillcolor=yellow](-2,-1)(2,1)\n\\rput(0,0){\\pscircle[fillstyle=solid,fillcolor=blue](0,0){0.6}}\n\\psline[linewidth=2pt](-2,-1)(2,1)`,
  },
]

/** Degenerate and boundary inputs that should fail visibly, not silently. */
const EDGE_CASES = [
  { id: 'edge-zero-radius', why: 'Zero-radius circle.', body: `\\pscircle(0,0){0}` },
  { id: 'edge-negative-radius', why: 'Negative radius; PSTricks takes the absolute value.', body: `\\pscircle(0,0){-1.5}` },
  { id: 'edge-inverted-frame', why: 'Corners given in reverse order.', body: `\\psframe(2,1)(-2,-1)` },
  { id: 'edge-single-point-line', why: 'A line with one coordinate.', body: `\\psline(0,0)` },
  { id: 'edge-out-of-bounds', why: 'Geometry far outside the pspicture bounds; must clip, not escape.', body: `\\psline[linewidth=2pt](-40,-40)(40,40)\n\\psframe(-2,-2)(2,2)` },
  { id: 'edge-arc-reversed', why: 'Arc whose end angle precedes its start angle.', body: `\\psarc(0,0){1.5}{200}{20}` },
  { id: 'edge-arc-over-360', why: 'Angles beyond a full turn.', body: `\\psarc(0,0){1.5}{0}{450}` },
  { id: 'edge-wedge-full', why: 'A wedge spanning the whole circle.', body: `\\pswedge[fillstyle=solid,fillcolor=orange](0,0){1.8}{0}{360}` },
  { id: 'edge-decimal-precision', why: 'Long decimals must not be truncated into visible error.', body: `\\psline(-1.9999,-0.9999)(1.9999,0.9999)` },
  { id: 'edge-plot-discontinuous', why: 'A function with a pole inside the plotted range.', body: `\\psplot{-2}{2}{1 x div}` },
  { id: 'edge-plot-constant', why: 'A constant function.', body: `\\psplot[algebraic=true]{-2}{2}{1}` },
  {
    id: 'edge-plot-rpn',
    why: 'An RPN PostScript body, which is what PSTricks reads by default. LaTeX2JS always reads infix, so this is the one dialect difference the flag does not close — it should render in the reference and report a diagnostic here.',
    body: `\\psplot{-2}{2}{x x mul}`,
  },
  { id: 'edge-empty-pscustom', why: 'pscustom with no path operators.', body: `\\pscustom{}` },
  { id: 'edge-unknown-command', why: 'An unimplemented command must warn, not crash the whole picture.', body: `\\psline(-2,-1)(2,1)\n\\psunknowncmd(0,0){1}\n\\pscircle(0,0){1}` },
  { id: 'edge-nested-pspicture-content', why: 'Many elements in one picture.', body: Array.from({ length: 12 }, (_, i) => `\\pscircle[linecolor=${COLORS[i % COLORS.length]}](${(i % 5) - 2},${Math.floor(i / 5) - 1}){0.4}`).join('\n') },
]

// --------------------------------------------------------------- generation

const PICTURE = ['(-3,-2.5)', '(3,2.5)']

function wrapPicture(body) {
  return `\\begin{pspicture}${PICTURE[0]}${PICTURE[1]}\n${body}\n\\end{pspicture}`
}

/** A standalone LaTeX document that real PSTricks can compile to PDF. */
function wrapDocument(body) {
  return `\\documentclass[border=4pt]{standalone}
\\usepackage{pstricks}
\\usepackage{pst-plot}
\\usepackage{pst-node}
\\usepackage{multido}
\\begin{document}
${wrapPicture(body)}
\\end{document}
`
}

function* cases(only) {
  const want = (name) => !only || only.includes(name)

  // one bare instance per command, the baseline every other case is read against
  for (const [name, spec] of Object.entries(COMMANDS)) {
    if (!want(name)) continue
    yield { id: `${name}-plain`, command: name, axis: 'baseline', why: `${name} with no options.`, body: spec.body('') }

    for (const s of LINE_STYLES) {
      yield { id: `${name}-linestyle-${s}`, command: name, axis: 'linestyle', why: `${name} with linestyle=${s}.`, body: spec.body(`[linestyle=${s}]`) }
    }
    for (const w of WIDTHS) {
      yield { id: `${name}-linewidth-${w.replace('.', '_')}`, command: name, axis: 'linewidth', why: `${name} at linewidth=${w}.`, body: spec.body(`[linewidth=${w}]`) }
    }
    for (const c of COLORS) {
      yield { id: `${name}-linecolor-${c}`, command: name, axis: 'linecolor', why: `${name} in ${c}.`, body: spec.body(`[linecolor=${c}]`) }
    }
    if (spec.fills) {
      for (const f of FILL_STYLES) {
        yield { id: `${name}-fillstyle-${f}`, command: name, axis: 'fillstyle', why: `${name} with fillstyle=${f}. Hatched styles are the likely gap.`, body: spec.body(`[fillstyle=${f},fillcolor=cyan]`) }
      }
    }
    // arrows only mean something on open paths
    if (['psline', 'psarc', 'pscurve', 'psbezier', 'psecurve', 'psplot'].includes(name)) {
      for (const a of ARROWS) {
        yield { id: `${name}-arrows-${a.replace(/[<>|-]/g, (ch) => ({ '<': 'l', '>': 'r', '|': 'b', '-': 'd' })[ch])}`, command: name, axis: 'arrows', why: `${name} with arrows=${a}.`, body: spec.body(`[arrows=${a}]`) }
      }
    }
    // starred (filled) variants
    if (spec.fills) {
      yield { id: `${name}-starred`, command: name, axis: 'starred', why: `${name}* — the starred form is solid-filled in the line colour.`, body: spec.body('').replace(`\\${name}`, `\\${name}*`) }
    }
  }

  for (const c of LAYER_CASES) if (!only) yield { ...c, command: 'layering', axis: 'draw-order' }
  for (const c of EDGE_CASES) if (!only) yield { ...c, command: 'edge', axis: 'degenerate' }
}

// --------------------------------------------------------------------- main

const argv = process.argv.slice(2)
const outDir = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : './corpus'
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null

rmSync(outDir, { recursive: true, force: true })
mkdirSync(join(outDir, 'tex'), { recursive: true })
mkdirSync(join(outDir, 'doc'), { recursive: true })

const manifest = {}
let n = 0
for (const c of cases(only)) {
  writeFileSync(join(outDir, 'tex', `${c.id}.tex`), `${wrapPicture(c.body)}\n`)
  writeFileSync(join(outDir, 'doc', `${c.id}.tex`), wrapDocument(c.body))
  manifest[c.id] = { command: c.command, axis: c.axis, why: c.why, body: c.body, interactive: !!c.interactive }
  n++
}
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const byCommand = {}
for (const m of Object.values(manifest)) byCommand[m.command] = (byCommand[m.command] ?? 0) + 1
console.log(`fuzz-corpus: ${n} cases -> ${outDir}`)
for (const [k, v] of Object.entries(byCommand).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`)

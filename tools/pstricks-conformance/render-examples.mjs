#!/usr/bin/env node
/**
 * render-examples.mjs — render the real LaTeX2JS example corpus with real PSTricks.
 *
 * The examples are not directly compilable: they use LaTeX2JS-only macros
 * (\userline, \uservariable, \slider), CSS colour names PSTricks has never
 * heard of, and several files pack many pictures into one document. This
 * splits, shims and wraps them, then rasterizes each picture separately so a
 * picture is the unit of comparison.
 *
 *   node render-examples.mjs --corpus <dir of .tex> --out <dir> [--dpi 150]
 *
 * Output:
 *   <out>/doc/<id>.tex   standalone document per picture
 *   <out>/ref/<id>.png   its PSTricks rasterization
 *   <out>/manifest.json  id -> { source, index, shims, body }
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { spawnSync } from 'node:child_process'

const IMAGE = 'pyramation/pstricks-latex:latest'

/**
 * CSS colour names the examples use that PSTricks does not define.
 * Values are the CSS ones, so the reference matches what the browser draws.
 */
const COLORS = {
  lightblue: '0.678,0.847,0.902',
  lightgray: '0.827,0.827,0.827',
  purple: '0.502,0.000,0.502',
  orange: '1.000,0.647,0.000',
  gray: '0.502,0.502,0.502',
}

// ------------------------------------------------------------------ shimming

/**
 * Consumes balanced `{...}` groups starting at `i`, returning the index after
 * the last one. Used to drop \userline's trailing expression arguments, which
 * only mean something to the interactive renderer.
 */
function skipBraceGroups(src, i) {
  for (;;) {
    let j = i
    while (j < src.length && /\s/.test(src[j])) j++
    if (src[j] !== '{') return i
    let depth = 0
    let k = j
    for (; k < src.length; k++) {
      if (src[k] === '{') depth++
      else if (src[k] === '}') { depth--; if (depth === 0) { k++; break } }
    }
    if (depth !== 0) return i
    i = k
  }
}

/** Consumes one `(...)` group, returning the index after it, or -1. */
function skipParen(src, i) {
  let j = i
  while (j < src.length && /\s/.test(src[j])) j++
  if (src[j] !== '(') return -1
  const end = src.indexOf(')', j)
  return end === -1 ? -1 : end + 1
}

/**
 * Fallback binding for a \uservariable whose initial value cannot be read.
 * Its real value tracks the cursor, and ground truth has no cursor.
 */
const PINNED_USERVAR = 1

/**
 * Evaluates a \uservariable's expression at its declared starting position.
 *
 * `\uservariable{alpha}(0.1,0){x}` states the initial cursor position in its
 * coordinate argument, so the variable starts at 0.1 — not at some value the
 * harness invents. Pinning it elsewhere renders a correct-looking reference of
 * a different diagram, which reads as a renderer bug.
 *
 * @param expr - the variable's expression, over `x` and `y`
 * @param x - initial x from the coordinate argument
 * @param y - initial y from the coordinate argument
 * @returns the value as a string, or null when the expression is not numeric
 */
function initialBinding(expr, x, y) {
  const body = expr.trim()
  if (!/^[-+*/(). \dxy]+$/.test(body)) return null
  try {
    const v = Function('x', 'y', `"use strict";return (${body})`)(Number(x), Number(y))
    return Number.isFinite(v) ? String(Number(v.toFixed(6))) : null
  } catch { return null }
}

/**
 * Rewrites LaTeX2JS-only macros into their static PSTricks equivalent.
 * \userline collapses to the \psline it draws before any interaction;
 * \uservariable and \slider are control-plane only and draw nothing, but both
 * bind names that plot expressions go on to reference.
 */
function shim(src) {
  const applied = new Set()
  const bindings = {}

  // \slider{min}{max}{var}{label}{init} — the 5th group is the initial value
  for (const m of src.matchAll(/\\slider\{([^{}]*)\}\{([^{}]*)\}\{([^{}]*)\}\{((?:[^{}]|\{[^{}]*\})*)\}\{([^{}]*)\}/g)) {
    bindings[m[3].trim()] = m[5].trim()
  }
  // \uservariable{name}(x,y){expr} — cursor-driven, so bind it to the value it
  // holds at the declared starting position.
  for (const m of src.matchAll(/\\uservariable\{([^{}]*)\}\(([^()]*),([^()]*)\)\{([^{}]*)\}/g)) {
    const name = m[1].trim()
    if (name in bindings) continue
    bindings[name] = initialBinding(m[4], m[2], m[3]) ?? String(PINNED_USERVAR)
  }

  let out = ''
  let i = 0

  while (i < src.length) {
    if (src.startsWith('\\userline', i)) {
      let j = i + '\\userline'.length
      let opts = ''
      if (src[j] === '[') { const e = src.indexOf(']', j); opts = src.slice(j, e + 1); j = e + 1 }
      // optional arrow spec {->} — one group that is not a coordinate
      let arrows = ''
      const m = /^\s*\{([^{}]*)\}/.exec(src.slice(j))
      if (m && /^[-<>|*ocC\[\]() ]*$/.test(m[1])) { arrows = `{${m[1]}}`; j += m[0].length }
      const p1 = skipParen(src, j)
      if (p1 === -1) { out += src[i++]; continue }
      const p2 = skipParen(src, p1)
      if (p2 === -1) { out += src[i++]; continue }
      const coords = src.slice(j, p2).trim()
      const after = skipBraceGroups(src, p2)
      out += `\\psline${opts}${arrows}${coords}`
      applied.add('userline')
      i = after
      continue
    }

    if (src.startsWith('\\uservariable', i) || src.startsWith('\\slider', i)) {
      const name = src.startsWith('\\slider', i) ? 'slider' : 'uservariable'
      let j = i + (name === 'slider' ? '\\slider'.length : '\\uservariable'.length)
      // both are a run of {...} and (...) groups that draw nothing
      for (;;) {
        const b = skipBraceGroups(src, j)
        const p = skipParen(src, b)
        if (p !== -1) { j = p; continue }
        if (b !== j) { j = b; continue }
        break
      }
      applied.add(name)
      i = j
      continue
    }

    out += src[i++]
  }

  // bare linewidth numbers need a unit; `1.5 pt` is already valid TeX
  out = out.replace(/linewidth=(\d+(?:\.\d+)?)(?=[,\]])/g, 'linewidth=$1pt')
  // plotpoints is a count, but the corpus writes it as a dimension
  out = out.replace(/plotpoints=(\d+(?:\.\d+)?)\s*(pt|cm|mm|in)/g, 'plotpoints=$1')

  const { text, freeVars } = normalizePlots(out, bindings)
  return { text, shims: [...applied], bindings, freeVars }
}

/**
 * Rewrites `pow(a, b)` as `(a)^(b)`. LaTeX2JS evaluates plot bodies as
 * JavaScript, so it inherits Math.pow; pst-plot's algebraic parser has no such
 * function and only understands the `^` operator.
 */
function rewritePow(src) {
  for (;;) {
    const at = src.indexOf('pow(')
    if (at === -1) return src
    let depth = 0
    let split = -1
    let end = -1
    for (let i = at + 3; i < src.length; i++) {
      const ch = src[i]
      if (ch === '(') depth++
      else if (ch === ')') { depth--; if (depth === 0) { end = i; break } }
      else if (ch === ',' && depth === 1) split = i
    }
    if (end === -1 || split === -1) return src
    const base = rewritePow(src.slice(at + 4, split))
    const exp = rewritePow(src.slice(split + 1, end))
    src = `${src.slice(0, at)}(${base.trim()})^(${exp.trim()})${src.slice(end + 1)}`
  }
}

/**
 * LaTeX2JS accepts infix plot expressions with named variables; PSTricks reads
 * RPN PostScript unless told otherwise, and has no such variables. Each psplot
 * body is rewritten to the algebraic dialect with its free names substituted.
 * Names that remain unbound are reported so the unit can be excluded rather
 * than rendered as a misleading reference.
 */
function normalizePlots(src, bindings) {
  const unresolved = new Set()

  const text = src.replace(
    /\\psplot(\[[^\]]*\])?\{([^{}]*)\}\{([^{}]*)\}\{([^{}]*)\}/g,
    (_all, opts, from, to, body) => {
      const sub = (s) => s.replace(/\b([A-Za-z_]\w*)\b(?!\s*\()/g, (name) => {
        if (name === 'x' || name === 'e' || name === 'Pi') return name
        if (name in bindings) return bindings[name]
        unresolved.add(name)
        return name
      })

      // implicit multiplication (`0.5x^3`) is not valid in either dialect
      const fix = (s) => rewritePow(sub(s)).replace(/(\d)\s*([A-Za-z_(])/g, '$1*$2')

      /**
       * Plot bounds must reach PostScript as literal numbers. The corpus writes
       * them as arithmetic over bound variables (`alpha-3`), so once the
       * variables are substituted the remaining arithmetic is folded here.
       */
      const bound = (s) => {
        const t = fix(s)
        if (!/^[\d\s+\-*/.()]+$/.test(t)) return t
        try {
          const v = Function(`"use strict";return (${t})`)()
          return Number.isFinite(v) ? String(Number(v.toFixed(6))) : t
        } catch { return t }
      }

      // the corpus writes a bare `algebraic` key, which pst-plot does not accept
      let o = (opts ?? '').replace(/(^|[[,])\s*algebraic\s*(?=[,\]])/g, '$1algebraic=true')
      if (!/algebraic\s*=/.test(o)) {
        o = o ? `${o.slice(0, -1)},algebraic=true]` : '[algebraic=true]'
      }
      // plotpoints=1 appears in the corpus; PSTricks rejects anything below 2
      o = o.replace(/plotpoints=(\d+)/g, (_m, n) => `plotpoints=${Math.max(2, Number(n))}`)
      return `\\psplot${o}{${bound(from)}}{${bound(to)}}{${fix(body)}}`
    },
  )

  return { text, freeVars: [...unresolved] }
}

/**
 * Splits a file into its pspicture blocks.
 *
 * `\psset` applies to everything that follows it, and the corpus routinely
 * sets the unit once above several pictures. Extracting a picture without the
 * settings that governed it renders at the wrong scale, which under
 * `standalone` cropping produces a plausible-looking but wrong reference — so
 * each block carries the settings in scope where it appeared.
 *
 * A file with no pictures is one whole-document unit.
 */
function splitPictures(src) {
  const blocks = []
  const re = /\\psset\{[^{}]*\}|\\begin\{pspicture\}[\s\S]*?\\end\{pspicture\}/g
  const settings = []
  let m
  while ((m = re.exec(src))) {
    if (m[0].startsWith('\\psset')) settings.push(m[0])
    else blocks.push({ body: m[0], settings: [...settings] })
  }
  return blocks
}

function wrapDocument(body, { document: whole }) {
  const defs = Object.entries(COLORS).map(([n, v]) => `\\definecolor{${n}}{rgb}{${v}}`).join('\n')
  const packages = [
    '\\usepackage{pstricks}',
    '\\usepackage{pst-plot}',
    '\\usepackage{pst-node}',
    '\\usepackage{multido}',
    '\\usepackage{amsmath,amssymb,amsthm}',
    '\\usepackage{xcolor}',
    '\\usepackage{hyperref}',
  ].join('\n')

  // A whole-document unit needs real page geometry; a lone picture is cropped tight.
  const cls = whole
    ? '\\documentclass[11pt]{article}\n\\usepackage[paperwidth=7in,paperheight=11in,margin=0.5in]{geometry}\n\\pagestyle{empty}'
    : '\\documentclass[border=6pt]{standalone}'

  const envs = whole
    ? '\\newtheorem{theorem}{Theorem}\n\\newtheorem{lemma}{Lemma}\n\\newtheorem{proposition}{Proposition}\n\\newtheorem{definition}{Definition}\n'
    : ''

  return `${cls}\n${packages}\n${defs}\n${envs}\\begin{document}\n${body}\n\\end{document}\n`
}

// --------------------------------------------------------------------- main

const argv = process.argv.slice(2)
const flag = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d)

const corpusDir = resolve(flag('--corpus', '.'))
const outDir = resolve(flag('--out', './examples-ref'))
const dpi = flag('--dpi', '150')
const jobs = flag('--jobs', '6')

if (!existsSync(corpusDir)) {
  console.error(`render-examples: no such directory ${corpusDir}`)
  process.exit(2)
}

rmSync(outDir, { recursive: true, force: true })
mkdirSync(join(outDir, 'doc'), { recursive: true })
mkdirSync(join(outDir, 'ref'), { recursive: true })

const manifest = {}
const files = readdirSync(corpusDir).filter((f) => f.endsWith('.tex')).sort()

for (const file of files) {
  const stem = basename(file, '.tex')
  const raw = readFileSync(join(corpusDir, file), 'utf8')
  const { text, shims, bindings, freeVars } = shim(raw)
  const pictures = splitPictures(text)

  if (pictures.length === 0) {
    const id = stem
    writeFileSync(join(outDir, 'doc', `${id}.tex`), wrapDocument(text, { document: true }))
    manifest[id] = { source: file, index: null, kind: 'document', shims, bindings, freeVars, body: text.slice(0, 400) }
    continue
  }

  pictures.forEach((picture, n) => {
    const id = pictures.length === 1 ? stem : `${stem}--p${String(n + 1).padStart(2, '0')}`
    const body = [...picture.settings, picture.body].join('\n')
    writeFileSync(join(outDir, 'doc', `${id}.tex`), wrapDocument(body, { document: false }))
    manifest[id] = {
      source: file, index: n + 1, kind: 'picture',
      shims, bindings, freeVars, settings: picture.settings, body,
    }
  })
}

writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const ids = Object.keys(manifest)
console.log(`render-examples: ${files.length} files -> ${ids.length} units`)
const shimmed = ids.filter((k) => manifest[k].shims.length)
if (shimmed.length) console.log(`  ${shimmed.length} needed extension shims (userline/uservariable/slider)`)

// ---- rasterize -------------------------------------------------------------

const script = `
set -u
mkdir -p /w/ref /w/ref/logs
render() {
  n="$1"; d=$(mktemp -d); cd "$d"
  cp "/w/doc/$n.tex" a.tex 2>/dev/null || { echo "MISSING $n"; return; }
  if ! latex -interaction=nonstopmode a.tex >latex.log 2>&1; then
    cp latex.log "/w/ref/logs/$n.log"; echo "FAIL-LATEX $n"; cd /; rm -rf "$d"; return
  fi
  dvips -q -o a.ps a.dvi >/dev/null 2>&1 || { echo "FAIL-DVIPS $n"; cd /; rm -rf "$d"; return; }
  ps2pdf -dEPSCrop a.ps a.pdf >/dev/null 2>&1 || { echo "FAIL-PS2PDF $n"; cd /; rm -rf "$d"; return; }
  gs -q -dNOPAUSE -dBATCH -dALLOWPSTRANSPARENCY -sDEVICE=png16m -r${dpi} \
     -sOutputFile="/w/ref/${'$'}{n}.png" a.pdf >/dev/null 2>&1 || { echo "FAIL-GS $n"; cd /; rm -rf "$d"; return; }
  echo "OK $n"; cd /; rm -rf "$d"
}
export -f render
printf '%s\\n' ${ids.map((i) => `'${i}'`).join(' ')} | xargs -P ${jobs} -I{} bash -c 'render "$@"' _ {}
`

console.log(`render-examples: rasterizing at ${dpi} dpi, ${jobs} parallel`)
const t0 = Date.now()
const run = spawnSync('docker', [
  'run', '--rm', '--platform', 'linux/amd64', '-v', `${outDir}:/w`, '-w', '/w',
  IMAGE, 'bash', '-lc', script,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

if (run.error) { console.error(`render-examples: ${run.error.message}`); process.exit(1) }

const results = {}
for (const line of (run.stdout ?? '').split('\n').filter(Boolean)) {
  const [status, name] = line.split(' ')
  if (name) results[name] = status
}
writeFileSync(join(outDir, 'ref', 'status.json'), `${JSON.stringify(results, null, 2)}\n`)

const ok = Object.values(results).filter((s) => s === 'OK').length
const failed = Object.entries(results).filter(([, s]) => s !== 'OK')
console.log(`render-examples: ${ok}/${ids.length} rendered in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
for (const [n, s] of failed) console.log(`  ${s.padEnd(12)} ${n}`)

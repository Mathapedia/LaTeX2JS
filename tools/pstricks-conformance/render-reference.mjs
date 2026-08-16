#!/usr/bin/env node
/**
 * render-reference.mjs — rasterize a PSTricks corpus with real LaTeX.
 *
 * Runs the whole corpus inside one container (latex -> dvips -> ps2pdf -> gs),
 * producing the ground-truth PNG for every case. These are what the LaTeX2JS
 * SVG output is judged against.
 *
 *   node render-reference.mjs --corpus ./pstricks-corpus [--jobs 4] [--dpi 150]
 *
 * PSTricks emits PostScript specials, so the DVI->PS route is required;
 * pdflatex cannot render these documents directly.
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const IMAGE = 'pyramation/pstricks-latex:latest'

const argv = process.argv.slice(2)
const flag = (name, fallback) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : fallback)

const corpus = resolve(flag('--corpus', './pstricks-corpus'))
const dpi = flag('--dpi', '150')
const jobs = flag('--jobs', '4')
const docDir = join(corpus, 'doc')

if (!existsSync(docDir)) {
  console.error(`render-reference: no doc/ directory in ${corpus} — run fuzz-corpus.mjs first`)
  process.exit(2)
}

const names = readdirSync(docDir).filter((f) => f.endsWith('.tex')).map((f) => f.replace(/\.tex$/, ''))
mkdirSync(join(corpus, 'ref'), { recursive: true })

/**
 * Compiles every case inside the container. Each case is isolated in its own
 * scratch directory so one failure cannot poison the next, and a failing case
 * writes its LaTeX log next to the output for diagnosis instead of vanishing.
 */
const script = `
set -u
mkdir -p /w/ref /w/ref/logs
render() {
  n="$1"
  d=$(mktemp -d)
  cp "/w/doc/$n.tex" "$d/a.tex" 2>/dev/null || { echo "MISSING $n"; return; }
  cd "$d"
  if ! latex -interaction=nonstopmode -halt-on-error a.tex >latex.log 2>&1; then
    cp latex.log "/w/ref/logs/$n.log"; echo "FAIL-LATEX $n"; cd /; rm -rf "$d"; return
  fi
  if ! dvips -q -o a.ps a.dvi >dvips.log 2>&1; then
    cp dvips.log "/w/ref/logs/$n.log"; echo "FAIL-DVIPS $n"; cd /; rm -rf "$d"; return
  fi
  ps2pdf -dEPSCrop a.ps a.pdf >/dev/null 2>&1 || { echo "FAIL-PS2PDF $n"; cd /; rm -rf "$d"; return; }
  gs -q -dNOPAUSE -dBATCH -dALLOWPSTRANSPARENCY -sDEVICE=png16m -r${dpi} \
     -sOutputFile="/w/ref/$n.png" a.pdf >/dev/null 2>&1 || { echo "FAIL-GS $n"; cd /; rm -rf "$d"; return; }
  echo "OK $n"
  cd /; rm -rf "$d"
}
export -f render
printf '%s\\n' ${names.map((n) => `'${n}'`).join(' ')} | xargs -P ${jobs} -I{} bash -c 'render "$@"' _ {}
`

console.log(`render-reference: ${names.length} cases at ${dpi} dpi, ${jobs} parallel`)
const t0 = Date.now()
const run = spawnSync('docker', [
  'run', '--rm', '--platform', 'linux/amd64',
  '-v', `${corpus}:/w`, '-w', '/w',
  IMAGE, 'bash', '-lc', script,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

if (run.error) {
  console.error(`render-reference: ${run.error.message}`)
  process.exit(1)
}

const lines = (run.stdout ?? '').split('\n').filter(Boolean)
const results = {}
for (const l of lines) {
  const [status, name] = l.split(' ')
  if (name) results[name] = status
}
const ok = Object.values(results).filter((s) => s === 'OK').length
const failed = Object.entries(results).filter(([, s]) => s !== 'OK')

writeFileSync(join(corpus, 'ref', 'status.json'), `${JSON.stringify(results, null, 2)}\n`)

console.log(`render-reference: ${ok}/${names.length} rendered in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
if (failed.length) {
  console.log(`\n${failed.length} failed — logs in ref/logs/:`)
  for (const [n, s] of failed.slice(0, 25)) console.log(`  ${s.padEnd(12)} ${n}`)
  if (failed.length > 25) console.log(`  ... and ${failed.length - 25} more`)
}

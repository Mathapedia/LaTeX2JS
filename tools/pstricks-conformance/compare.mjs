#!/usr/bin/env node
/**
 * compare.mjs — pair LaTeX2JS renders against PSTricks ground truth.
 *
 * The two renderers do not produce comparable rasters: one is SVG in a browser
 * at the picture's own aspect, the other is Ghostscript output cropped to the
 * PostScript bounding box, with different antialiasing and font engines. So
 * the score here is a triage heuristic, not a pass/fail gate — it orders pairs
 * by how likely they are to differ in a way a human should look at.
 *
 *   node compare.mjs --js <dir> --ref <dir> --out <file.html>
 *
 * Signals, each cheap and each robust to rasterizer differences:
 *   ink      fraction of non-white pixels — catches missing or excess drawing
 *   hue      normalized colour histogram — catches wrong or absent fills
 *   layout   16x16 occupancy grid over the ink bounding box — catches
 *            structural differences such as reordering or misplacement
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { inflateSync } from 'node:zlib'

const argv = process.argv.slice(2)
const flag = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d)

const jsDir = resolve(flag('--js', ''))
const refDir = resolve(flag('--ref', ''))
const outFile = resolve(flag('--out', 'comparison.html'))
const GRID = 16

/**
 * Decodes an 8-bit truecolour PNG to raw samples, undoing the per-scanline
 * filters. Returns null for anything else (palette, 16-bit, interlaced) so the
 * pair is reported as unscored rather than silently scoring zero.
 */
function decode(path) {
  try {
    const b = readFileSync(path)
    if (b.readUInt32BE(0) !== 0x89504e47) return null
    let p = 8, w = 0, h = 0, bd = 0, ct = 0, interlace = 0
    const idat = []
    while (p < b.length) {
      const len = b.readUInt32BE(p)
      const type = b.toString('ascii', p + 4, p + 8)
      if (type === 'IHDR') {
        w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12)
        bd = b[p + 16]; ct = b[p + 17]; interlace = b[p + 20]
      } else if (type === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + len))
      else if (type === 'IEND') break
      p += 12 + len
    }
    if (bd !== 8 || interlace !== 0 || (ct !== 2 && ct !== 6)) return null

    const ch = ct === 6 ? 4 : 3
    const data = inflateSync(Buffer.concat(idat))
    const stride = w * ch
    const out = Buffer.alloc(w * h * ch)
    let prev = Buffer.alloc(stride)

    for (let y = 0, o = 0; y < h; y++) {
      const f = data[o++]
      const line = data.subarray(o, o + stride)
      o += stride
      const cur = Buffer.alloc(stride)
      for (let i = 0; i < stride; i++) {
        const a = i >= ch ? cur[i - ch] : 0
        const up = prev[i]
        const ul = i >= ch ? prev[i - ch] : 0
        let v = line[i]
        if (f === 1) v += a
        else if (f === 2) v += up
        else if (f === 3) v += (a + up) >> 1
        else if (f === 4) {
          const pa = Math.abs(up - ul), pb = Math.abs(a - ul), pc = Math.abs(a + up - 2 * ul)
          v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? up : ul)
        }
        cur[i] = v & 255
      }
      cur.copy(out, y * stride)
      prev = cur
    }
    return { w, h, ch, data: out }
  } catch { return null }
}

/** Ink = any pixel meaningfully darker or more saturated than white. */
function isInk(r, g, b) {
  return r < 245 || g < 245 || b < 245
}

/**
 * Reduces an image to comparable descriptors: ink ratio, a coarse hue
 * histogram, and an occupancy grid normalized over the ink bounding box so
 * differing canvas sizes and crops do not dominate the score.
 */
function describe(img) {
  const { w, h, ch, data } = img
  let inked = 0
  let minX = w, minY = h, maxX = -1, maxY = -1
  const hue = new Array(7).fill(0)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch
      const r = data[i], g = data[i + 1], b = data[i + 2]
      if (!isInk(r, g, b)) continue
      inked++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
      if (mx - mn < 40) hue[mx < 128 ? 0 : 1]++            // dark / light neutral
      else if (r === mx) hue[g > b ? 2 : 3]++               // red-ish / magenta-ish
      else if (g === mx) hue[4]++                           // green-ish
      else hue[b > g ? 5 : 6]++                             // blue-ish / cyan-ish
    }
  }

  const grid = new Array(GRID * GRID).fill(0)
  if (maxX >= minX && maxY >= minY) {
    const bw = maxX - minX + 1, bh = maxY - minY + 1
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const i = (y * w + x) * ch
        if (!isInk(data[i], data[i + 1], data[i + 2])) continue
        const gx = Math.min(GRID - 1, Math.floor(((x - minX) / bw) * GRID))
        const gy = Math.min(GRID - 1, Math.floor(((y - minY) / bh) * GRID))
        grid[gy * GRID + gx]++
      }
    }
  }
  const cells = grid.reduce((a, v) => a + v, 0) || 1
  const total = w * h

  return {
    ink: inked / total,
    hue: hue.map((v) => v / (inked || 1)),
    grid: grid.map((v) => v / cells),
    box: maxX >= minX ? { w: maxX - minX + 1, h: maxY - minY + 1 } : null,
  }
}

const sim = (a, b) => 1 - Math.min(1, Math.abs(a - b) / Math.max(a, b, 1e-6))
const cosine = (a, b) => {
  let d = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return na && nb ? d / Math.sqrt(na * nb) : 0
}

function score(a, b) {
  const ink = sim(a.ink, b.ink)
  const hue = cosine(a.hue, b.hue)
  const layout = cosine(a.grid, b.grid)
  return { ink, hue, layout, overall: 0.25 * ink + 0.30 * hue + 0.45 * layout }
}

// --------------------------------------------------------------------- main

if (!existsSync(jsDir) || !existsSync(refDir)) {
  console.error('compare: --js and --ref must both exist')
  process.exit(2)
}

const refs = new Set(readdirSync(refDir).filter((f) => f.endsWith('.png')).map((f) => basename(f, '.png')))
const pairs = readdirSync(jsDir)
  .filter((f) => f.endsWith('.png'))
  .map((f) => basename(f, '.png'))
  .filter((n) => refs.has(n))
  .sort()

if (!pairs.length) {
  console.error('compare: no filename matches between the two directories')
  process.exit(1)
}

const rows = []
for (const name of pairs) {
  const ja = decode(join(jsDir, `${name}.png`))
  const rb = decode(join(refDir, `${name}.png`))
  if (!ja || !rb) { rows.push({ name, unscored: true }); continue }
  const da = describe(ja), db = describe(rb)
  rows.push({
    name,
    ...score(da, db),
    js: { ink: da.ink, box: da.box, b64: readFileSync(join(jsDir, `${name}.png`)).toString('base64') },
    ref: { ink: db.ink, box: db.box, b64: readFileSync(join(refDir, `${name}.png`)).toString('base64') },
  })
}

rows.sort((a, b) => (a.overall ?? 2) - (b.overall ?? 2))

const pct = (v) => `${(v * 100).toFixed(0)}%`
const band = (v) => (v < 0.55 ? 'bad' : v < 0.75 ? 'warn' : 'good')
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const html = `<title>Renderer Comparison</title>
<style>
  :root{--ground:#eceff3;--surface:#fff;--ink:#10171f;--muted:#5b6875;--line:#d2d9e1;
        --accent:#0b44c8;--good:#0d6d4c;--warn:#8a5409;--bad:#ab2a19;--plate:#fff;--plate-line:#c9d2db;
        --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
        --sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
        --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
    --ground:#0c1116;--surface:#151c23;--ink:#e3e9ef;--muted:#8b99a7;--line:#26313b;
    --accent:#86a9ff;--good:#4fbd94;--warn:#dfa952;--bad:#f28374;--plate-line:#2f3b46;}}
  :root[data-theme="dark"]{--ground:#0c1116;--surface:#151c23;--ink:#e3e9ef;--muted:#8b99a7;
    --line:#26313b;--accent:#86a9ff;--good:#4fbd94;--warn:#dfa952;--bad:#f28374;--plate-line:#2f3b46;}
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);line-height:1.55}
  .wrap{max-width:1100px;margin:0 auto;padding:56px 24px 96px}
  .mast{border-bottom:2px solid var(--ink);padding-bottom:22px}
  .eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 14px}
  h1{font-family:var(--serif);font-size:clamp(30px,5vw,44px);margin:0;font-weight:600;letter-spacing:-.01em}
  .lede{font-family:var(--serif);font-size:18px;color:var(--muted);margin:14px 0 0;max-width:64ch}
  .pair{background:var(--surface);border:1px solid var(--line);margin-top:24px;padding:20px 22px}
  .pair__head{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:14px}
  .pair__name{font-family:var(--mono);font-size:13.5px;margin-right:auto}
  .metric{font-family:var(--mono);font-size:11px;color:var(--muted)}
  .metric b{font-weight:600;font-variant-numeric:tabular-nums}
  .verdict{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;
           padding:3px 8px;border:1px solid currentColor}
  .good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:680px){.cols{grid-template-columns:1fr}}
  .col h3{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;
          color:var(--muted);margin:0 0 7px;font-weight:600}
  .frame{background:var(--plate);border:1px solid var(--plate-line);display:flex;justify-content:center}
  .frame img{display:block;width:100%;height:auto}
  footer{margin-top:56px;padding-top:18px;border-top:1px solid var(--line);
         font-family:var(--mono);font-size:11.5px;color:var(--muted)}
</style>
<div class="wrap">
  <header class="mast">
    <p class="eyebrow">LaTeX2JS vs PSTricks · worst match first</p>
    <h1>Renderer Comparison</h1>
    <p class="lede">The same source rendered twice. Scores are a heuristic — SVG in a browser and Ghostscript output never match pixel for pixel — so treat them as an ordering that says where to look, not as a verdict.</p>
  </header>
  ${rows.map((r) => r.unscored ? `
  <div class="pair"><div class="pair__head"><span class="pair__name">${esc(r.name)}</span>
  <span class="verdict warn">unscored</span></div></div>` : `
  <div class="pair">
    <div class="pair__head">
      <span class="pair__name">${esc(r.name)}</span>
      <span class="metric">ink <b>${pct(r.ink)}</b></span>
      <span class="metric">colour <b>${pct(r.hue)}</b></span>
      <span class="metric">layout <b>${pct(r.layout)}</b></span>
      <span class="verdict ${band(r.overall)}">${pct(r.overall)}</span>
    </div>
    <div class="cols">
      <div class="col"><h3>LaTeX2JS</h3><div class="frame"><img src="data:image/png;base64,${r.js.b64}" alt="${esc(r.name)} rendered by LaTeX2JS" loading="lazy"></div></div>
      <div class="col"><h3>PSTricks reference</h3><div class="frame"><img src="data:image/png;base64,${r.ref.b64}" alt="${esc(r.name)} rendered by PSTricks" loading="lazy"></div></div>
    </div>
  </div>`).join('')}
  <footer>${rows.length} pairs · heuristic score = 25% ink + 30% colour + 45% layout occupancy</footer>
</div>
`

writeFileSync(outFile, html)
console.log(`compare: ${rows.length} pairs -> ${outFile} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`)
for (const r of rows.slice(0, 12)) {
  if (r.unscored) { console.log(`  ????  ${r.name}`); continue }
  console.log(`  ${pct(r.overall).padStart(4)}  ${r.name.padEnd(34)} ink=${pct(r.ink)} colour=${pct(r.hue)} layout=${pct(r.layout)}`)
}

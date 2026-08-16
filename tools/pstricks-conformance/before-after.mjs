#!/usr/bin/env node
/**
 * before-after.mjs — three-way view of a rendering change.
 *
 * Pairs each example as it rendered before a change, as it renders now, and
 * what real PSTricks draws for the same source, ordered by how much the render
 * actually moved. Cases that did not change are dropped: the point is to see
 * what a change did, not to re-read the whole corpus.
 *
 *   node before-after.mjs --before <dir> --after <dir> --ref <dir> \
 *     --notes notes.json --out page.html
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { inflateSync } from 'node:zlib'

const argv = process.argv.slice(2)
const flag = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d)

const beforeDir = resolve(flag('--before', ''))
const afterDir = resolve(flag('--after', ''))
const refDir = flag('--ref', '') ? resolve(flag('--ref', '')) : null
const notesPath = flag('--notes', '')
const outFile = resolve(flag('--out', 'before-after.html'))
const GRID = 24

/** Decodes an 8-bit truecolour PNG; returns null for anything else. */
function decode(path) {
  try {
    const b = readFileSync(path)
    if (b.readUInt32BE(0) !== 0x89504e47) return null
    let p = 8, w = 0, h = 0, bd = 0, ct = 0, il = 0
    const idat = []
    while (p < b.length) {
      const len = b.readUInt32BE(p)
      const type = b.toString('ascii', p + 4, p + 8)
      if (type === 'IHDR') { w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12); bd = b[p + 16]; ct = b[p + 17]; il = b[p + 20] }
      else if (type === 'IDAT') idat.push(b.subarray(p + 8, p + 8 + len))
      else if (type === 'IEND') break
      p += 12 + len
    }
    if (bd !== 8 || il !== 0 || (ct !== 2 && ct !== 6)) return null
    const ch = ct === 6 ? 4 : 3
    const data = inflateSync(Buffer.concat(idat))
    const stride = w * ch
    const out = Buffer.alloc(w * h * ch)
    let prev = Buffer.alloc(stride)
    for (let y = 0, o = 0; y < h; y++) {
      const f = data[o++]
      const line = data.subarray(o, o + stride); o += stride
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
      cur.copy(out, y * stride); prev = cur
    }
    return { w, h, ch, data: out }
  } catch { return null }
}

/**
 * Coarse per-cell ink signature over the whole canvas. Both sides come from the
 * same renderer at the same size, so no bounding-box normalization is wanted
 * here — a shape moving within the canvas is exactly what should register.
 */
function signature(img) {
  const { w, h, ch, data } = img
  const grid = new Array(GRID * GRID).fill(0)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch
      if (data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244) continue
      grid[Math.min(GRID - 1, Math.floor((y / h) * GRID)) * GRID + Math.min(GRID - 1, Math.floor((x / w) * GRID))]++
    }
  }
  const total = grid.reduce((a, v) => a + v, 0) || 1
  return grid.map((v) => v / total)
}

/** Total absolute difference between two signatures, 0 (identical) to 2. */
const signatureDrift = (a, b) => a.reduce((sum, v, i) => sum + Math.abs(v - b[i]), 0)

/**
 * Fraction of pixels that changed noticeably.
 *
 * Both sides come from the same renderer at the same canvas size, so they can
 * be compared directly — and must be: an ink-position signature cannot see a
 * recolour, so a plane turning from solid black to light grey registered as no
 * change at all.
 *
 * @returns the changed fraction, or null when the two canvases differ in size
 */
function pixelDrift(a, b) {
  if (a.w !== b.w || a.h !== b.h) return null
  let changed = 0
  const n = a.w * a.h
  for (let i = 0; i < n; i++) {
    const ai = i * a.ch
    const bi = i * b.ch
    const d = Math.abs(a.data[ai] - b.data[bi])
      + Math.abs(a.data[ai + 1] - b.data[bi + 1])
      + Math.abs(a.data[ai + 2] - b.data[bi + 2])
    if (d > 24) changed++
  }
  return changed / n
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const b64 = (p) => readFileSync(p).toString('base64')

// --------------------------------------------------------------------- main

if (!existsSync(beforeDir) || !existsSync(afterDir)) {
  console.error('before-after: --before and --after must both exist')
  process.exit(2)
}

const notes = notesPath && existsSync(notesPath) ? JSON.parse(readFileSync(notesPath, 'utf8')) : {}
const names = readdirSync(afterDir).filter((f) => f.endsWith('.png')).map((f) => basename(f, '.png')).sort()

const rows = []
for (const name of names) {
  const bPath = join(beforeDir, `${name}.png`)
  const aPath = join(afterDir, `${name}.png`)
  const isNew = !existsSync(bPath)
  const a = decode(aPath)
  if (!a) continue

  let moved = isNew ? Infinity : 0
  let resized = false
  if (!isNew) {
    const b = decode(bPath)
    if (!b) continue
    const direct = pixelDrift(b, a)
    if (direct === null) {
      // Different canvas sizes mean the drawing itself changed height, which is
      // a change in its own right; per-pixel comparison no longer applies.
      resized = true
      moved = signatureDrift(signature(b), signature(a))
    } else {
      moved = direct
    }
  }

  const rPath = refDir ? join(refDir, `${name}.png`) : null
  rows.push({
    name,
    isNew,
    moved,
    resized,
    note: notes[name],
    before: isNew ? null : b64(bPath),
    after: b64(aPath),
    ref: rPath && existsSync(rPath) ? b64(rPath) : null,
  })
}

// Below this is antialiasing noise, not a change worth showing.
const THRESHOLD = 0.0004
const changed = rows.filter((r) => r.isNew || r.moved > THRESHOLD).sort((a, b) => b.moved - a.moved)
const unchanged = rows.length - changed.length

const card = (r) => `
  <figure class="case">
    <figcaption class="case__head">
      <span class="case__name">${esc(r.name)}</span>
      ${r.isNew
      ? '<span class="tag tag--new">new</span>'
      : r.resized
        ? '<span class="tag">reflowed — the drawing changed size</span>'
        : `<span class="tag">${(r.moved * 100).toFixed(1)}% of pixels changed</span>`}
    </figcaption>
    ${r.note ? `<p class="case__note">${esc(r.note)}</p>` : ''}
    <div class="cols${r.isNew ? ' cols--two' : ''}">
      ${r.isNew ? '' : `<div class="col"><h3>Before</h3><div class="frame frame--before"><img src="data:image/png;base64,${r.before}" alt="${esc(r.name)} before" loading="lazy"></div></div>`}
      <div class="col"><h3>After</h3><div class="frame frame--after"><img src="data:image/png;base64,${r.after}" alt="${esc(r.name)} after" loading="lazy"></div></div>
      ${r.ref ? `<div class="col"><h3>PSTricks</h3><div class="frame"><img src="data:image/png;base64,${r.ref}" alt="${esc(r.name)} reference" loading="lazy"></div></div>` : ''}
    </div>
  </figure>`

const html = `<title>Before and After</title>
<style>
  :root{--ground:#eceff3;--surface:#fff;--ink:#10171f;--muted:#5b6875;--line:#d2d9e1;
        --accent:#0b44c8;--bad:#ab2a19;--good:#0d6d4c;--plate:#fff;--plate-line:#c9d2db;
        --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
        --sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
        --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
    --ground:#0c1116;--surface:#151c23;--ink:#e3e9ef;--muted:#8b99a7;--line:#26313b;
    --accent:#86a9ff;--bad:#f28374;--good:#4fbd94;--plate-line:#2f3b46}}
  :root[data-theme="dark"]{--ground:#0c1116;--surface:#151c23;--ink:#e3e9ef;--muted:#8b99a7;
    --line:#26313b;--accent:#86a9ff;--bad:#f28374;--good:#4fbd94;--plate-line:#2f3b46}
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);line-height:1.55}
  .wrap{max-width:1240px;margin:0 auto;padding:56px 24px 96px}
  .mast{border-bottom:2px solid var(--ink);padding-bottom:22px}
  .eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 14px}
  h1{font-family:var(--serif);font-size:clamp(30px,5vw,46px);margin:0;font-weight:600;letter-spacing:-.01em;text-wrap:balance}
  .lede{font-family:var(--serif);font-size:18px;color:var(--muted);margin:14px 0 0;max-width:64ch}
  .case{background:var(--surface);border:1px solid var(--line);margin:24px 0 0;padding:20px 22px}
  .case__head{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}
  .case__name{font-family:var(--mono);font-size:13.5px;margin-right:auto}
  .tag{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
       padding:3px 8px;border:1px solid currentColor;color:var(--muted);white-space:nowrap}
  .tag--new{color:var(--good)}
  .case__note{font-size:14.5px;color:var(--muted);margin:0 0 14px;padding-left:11px;
              border-left:2px solid var(--accent);max-width:80ch}
  .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .cols--two{grid-template-columns:repeat(2,1fr)}
  @media(max-width:860px){.cols,.cols--two{grid-template-columns:1fr}}
  .col h3{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;
          color:var(--muted);margin:0 0 7px;font-weight:600}
  .frame{background:var(--plate);border:1px solid var(--plate-line);display:flex;justify-content:center}
  .frame img{display:block;width:100%;height:auto}
  .frame--before{border-color:var(--bad)}
  .frame--after{border-color:var(--good)}
  footer{margin-top:56px;padding-top:18px;border-top:1px solid var(--line);
         font-family:var(--mono);font-size:11.5px;color:var(--muted)}
</style>
<div class="wrap">
  <header class="mast">
    <p class="eyebrow">LaTeX2JS · rendering changes</p>
    <h1>What the Fixes Changed</h1>
    <p class="lede">Every example whose render actually moved, worst first, against what real PSTricks draws for the same source. ${unchanged} unchanged examples are omitted.</p>
  </header>
  ${changed.map(card).join('')}
  <footer>${changed.length} changed · ${unchanged} unchanged · both sides rendered by LaTeX2JS at the same size, compared per pixel</footer>
</div>
`

writeFileSync(outFile, html)
console.log(`before-after: ${changed.length} changed, ${unchanged} unchanged -> ${outFile} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`)
for (const r of changed.slice(0, 15)) {
  const tag = r.isNew ? 'new' : r.resized ? 'reflow' : (r.moved * 100).toFixed(2) + '%'
  console.log(`  ${tag.padStart(7)}  ${r.name}`)
}

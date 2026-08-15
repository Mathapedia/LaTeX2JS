#!/usr/bin/env node
/**
 * gallery.mjs — turn a directory of PNG renders into one self-contained HTML
 * review page, with every image inlined as a data URI.
 *
 * The output has no external references, so it can be published as an Artifact
 * and opened from anywhere.
 *
 *   node gallery.mjs --renders <dir> [--notes <json>] [--out <file>]
 *
 * The notes file is `{ "<filename>": { "status": "ok|flag|bug", "note": "..." } }`.
 * A render with no entry is reported as unreviewed rather than silently passing.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'

// ---------------------------------------------------------------- input

function parseArgs(argv) {
  const opts = { out: 'gallery.html' }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--renders') opts.renders = argv[++i]
    else if (argv[i] === '--notes') opts.notes = argv[++i]
    else if (argv[i] === '--out') opts.out = argv[++i]
    else if (argv[i] === '--title') opts.title = argv[++i]
  }
  if (!opts.renders) {
    console.error('gallery: --renders <dir> is required')
    process.exit(2)
  }
  return opts
}

/** Reads width and height out of a PNG IHDR without decoding the image. */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
}

/** Sorts numeric-prefixed plates naturally, then everything else alphabetically. */
function plateOrder(a, b) {
  const na = /^(\d+)/.exec(a), nb = /^(\d+)/.exec(b)
  if (na && nb) return Number(na[1]) - Number(nb[1])
  if (na) return -1
  if (nb) return 1
  return a.localeCompare(b)
}

// ---------------------------------------------------------------- markup

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])

const STATUS = {
  bug: { label: 'Bug', cls: 'bug' },
  flag: { label: 'Check', cls: 'flag' },
  ok: { label: 'Reviewed', cls: 'ok' },
  ref: { label: 'Reference', cls: 'ref' },
  unreviewed: { label: 'Not reviewed', cls: 'none' },
}

/** A render taller than this is presented in its own scrolling frame. */
const TALL = 1200

function plateCard(p) {
  const s = STATUS[p.status] ?? STATUS.unreviewed
  return `
      <figure class="plate ${p.tall ? 'plate--tall' : ''}">
        <div class="plate__frame">
          <img src="data:image/png;base64,${p.b64}" alt="${esc(p.name)} render" loading="lazy" width="${p.w}" height="${p.h}">
        </div>
        <figcaption class="plate__meta">
          <span class="plate__name">${esc(p.name)}</span>
          <span class="plate__dim">${p.w}&thinsp;&times;&thinsp;${p.h}</span>
          <span class="chip chip--${s.cls}">${s.label}</span>
        </figcaption>
        ${p.note ? `<p class="plate__note">${esc(p.note)}</p>` : ''}
      </figure>`
}

function render(plates, opts) {
  const bugs = plates.filter((p) => p.status === 'bug')
  const flags = plates.filter((p) => p.status === 'flag')
  const clean = plates.filter((p) => p.status === 'ok').length
  const short = plates.filter((p) => !p.tall)
  const tall = plates.filter((p) => p.tall)
  const bytes = plates.reduce((n, p) => n + p.bytes, 0)
  const title = opts.title ?? 'Render Review'

  return `<title>${esc(title)}</title>
<style>
  :root {
    --ground: #eceff3;
    --surface: #ffffff;
    --ink: #10171f;
    --muted: #5b6875;
    --line: #d2d9e1;
    --accent: #0b44c8;
    --ok: #0d6d4c;
    --flag: #8a5409;
    --bug: #ab2a19;
    --plate: #ffffff;
    --plate-line: #c9d2db;
    --serif: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
    --sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground: #0c1116;
      --surface: #151c23;
      --ink: #e3e9ef;
      --muted: #8b99a7;
      --line: #26313b;
      --accent: #86a9ff;
      --ok: #4fbd94;
      --flag: #dfa952;
      --bug: #f28374;
      --plate-line: #2f3b46;
    }
  }
  :root[data-theme="dark"] {
    --ground: #0c1116;
    --surface: #151c23;
    --ink: #e3e9ef;
    --muted: #8b99a7;
    --line: #26313b;
    --accent: #86a9ff;
    --ok: #4fbd94;
    --flag: #dfa952;
    --bug: #f28374;
    --plate-line: #2f3b46;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--ground);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 56px 24px 96px; }

  /* ---- masthead ---- */
  .mast { border-bottom: 2px solid var(--ink); padding-bottom: 22px; }
  .eyebrow {
    font-family: var(--mono); font-size: 11px; letter-spacing: .14em;
    text-transform: uppercase; color: var(--muted); margin: 0 0 14px;
  }
  h1 {
    font-family: var(--serif); font-weight: 600; font-size: clamp(30px, 5vw, 46px);
    line-height: 1.1; margin: 0; text-wrap: balance; letter-spacing: -.01em;
  }
  .lede {
    font-family: var(--serif); font-size: 18px; color: var(--muted);
    margin: 14px 0 0; max-width: 62ch;
  }

  /* ---- counts ---- */
  .counts {
    display: flex; flex-wrap: wrap; gap: 0; margin: 0; padding: 0;
    border-bottom: 1px solid var(--line);
  }
  .counts div {
    flex: 1 1 130px; padding: 18px 20px 18px 0;
  }
  .counts dt {
    font-family: var(--mono); font-size: 10.5px; letter-spacing: .13em;
    text-transform: uppercase; color: var(--muted);
  }
  .counts dd {
    margin: 4px 0 0; font-family: var(--serif); font-size: 30px;
    font-variant-numeric: tabular-nums; line-height: 1;
  }
  .counts .is-bug { color: var(--bug); }
  .counts .is-flag { color: var(--flag); }

  /* ---- sections ---- */
  section { margin-top: 52px; }
  h2 {
    font-family: var(--mono); font-size: 11px; letter-spacing: .15em;
    text-transform: uppercase; color: var(--muted); font-weight: 600;
    margin: 0 0 20px; padding-bottom: 10px; border-bottom: 1px solid var(--line);
  }

  /* ---- findings ---- */
  .finding {
    background: var(--surface); border: 1px solid var(--line);
    border-left: 3px solid var(--bug);
    padding: 16px 20px; margin-bottom: 12px;
  }
  .finding--flag { border-left-color: var(--flag); }
  .finding__head {
    font-family: var(--mono); font-size: 12.5px; margin-bottom: 6px;
  }
  .finding p { margin: 0; font-size: 15px; color: var(--muted); }

  /* ---- contact sheet ---- */
  .sheet {
    display: grid; gap: 26px;
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  }
  .plate { margin: 0; }
  .plate__frame {
    background: var(--plate); border: 1px solid var(--plate-line);
    overflow: hidden; display: flex; align-items: center; justify-content: center;
  }
  .plate__frame img { display: block; width: 100%; height: auto; }
  .plate__meta {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-top: 9px;
  }
  .plate__name { font-family: var(--mono); font-size: 12.5px; }
  .plate__dim {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    font-variant-numeric: tabular-nums; margin-right: auto;
  }
  .plate__note {
    font-size: 13.5px; color: var(--muted); margin: 7px 0 0;
    padding-left: 11px; border-left: 2px solid var(--line);
  }

  /* tall captures get their own scrolling frame */
  .stack { display: grid; gap: 30px; }
  .plate--tall .plate__frame {
    max-height: 620px; overflow-y: auto; align-items: flex-start;
    overscroll-behavior: contain;
  }

  /* ---- chips ---- */
  .chip {
    font-family: var(--mono); font-size: 10px; letter-spacing: .1em;
    text-transform: uppercase; padding: 3px 8px; border: 1px solid currentColor;
    white-space: nowrap;
  }
  .chip--ok { color: var(--ok); }
  .chip--flag { color: var(--flag); }
  .chip--bug { color: var(--bug); }
  .chip--ref { color: var(--accent); }
  .chip--none { color: var(--muted); }

  footer {
    margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--line);
    font-family: var(--mono); font-size: 11.5px; color: var(--muted);
    display: flex; flex-wrap: wrap; gap: 8px 24px;
  }
  code { font-family: var(--mono); font-size: .92em; }
  a { color: var(--accent); }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>

<div class="wrap">
  <header class="mast">
    <p class="eyebrow">${esc(opts.eyebrow ?? 'Contact sheet')}</p>
    <h1>${esc(title)}</h1>
    ${opts.lede ? `<p class="lede">${esc(opts.lede)}</p>` : ''}
  </header>

  <dl class="counts">
    <div><dt>Plates</dt><dd>${plates.length}</dd></div>
    <div><dt>Reviewed clean</dt><dd>${clean}</dd></div>
    <div><dt>Bugs</dt><dd class="${bugs.length ? 'is-bug' : ''}">${bugs.length}</dd></div>
    <div><dt>To check</dt><dd class="${flags.length ? 'is-flag' : ''}">${flags.length}</dd></div>
    <div><dt>Total size</dt><dd>${(bytes / 1024 / 1024).toFixed(1)}<span style="font-size:15px"> MB</span></dd></div>
  </dl>

  ${bugs.length || flags.length ? `
  <section>
    <h2>Needs attention</h2>
    ${[...bugs, ...flags].map((p) => `
    <div class="finding ${p.status === 'flag' ? 'finding--flag' : ''}">
      <div class="finding__head">${esc(p.name)}</div>
      <p>${esc(p.note ?? '')}</p>
    </div>`).join('')}
  </section>` : ''}

  <section>
    <h2>Examples &mdash; ${short.length} plates</h2>
    <div class="sheet">${short.map(plateCard).join('')}
    </div>
  </section>

  ${tall.length ? `
  <section>
    <h2>Full-page captures &mdash; scroll inside each frame</h2>
    <div class="stack">${tall.map(plateCard).join('')}
    </div>
  </section>` : ''}

  <footer>
    <span>Source: <code>${esc(opts.renders)}</code></span>
    <span>Regenerate: <code>pnpm e2e:gallery</code></span>
  </footer>
</div>
`
}

// ---------------------------------------------------------------- main

const opts = parseArgs(process.argv.slice(2))
const notes = opts.notes ? JSON.parse(readFileSync(opts.notes, 'utf8')) : {}

const files = readdirSync(opts.renders).filter((f) => f.toLowerCase().endsWith('.png')).sort(plateOrder)
if (files.length === 0) {
  console.error(`gallery: no PNGs in ${opts.renders}`)
  process.exit(1)
}

const plates = files.map((name) => {
  const path = join(opts.renders, name)
  const buf = readFileSync(path)
  const size = pngSize(buf) ?? { w: 0, h: 0 }
  const entry = notes[name] ?? {}
  return {
    name: basename(name),
    b64: buf.toString('base64'),
    bytes: statSync(path).size,
    w: size.w,
    h: size.h,
    tall: size.h > TALL,
    status: entry.status ?? 'unreviewed',
    note: entry.note,
  }
})

const html = render(plates, { ...opts, ...(notes.__meta ?? {}) })
writeFileSync(opts.out, html)

const mb = (Buffer.byteLength(html) / 1024 / 1024).toFixed(2)
console.log(`gallery: ${plates.length} plates -> ${opts.out} (${mb} MB)`)
if (Buffer.byteLength(html) > 16 * 1024 * 1024) {
  console.error('gallery: WARNING — over the 16 MB artifact limit; downscale the largest renders')
}

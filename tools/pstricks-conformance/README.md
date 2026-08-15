# PSTricks conformance harness

Renders the same source twice — once through LaTeX2JS, once through genuine
PSTricks — and ranks the pairs by how much they disagree.

The point is that "does this command render correctly?" becomes a question with
an answer, rather than a judgement call against a screenshot. Real PSTricks is
the specification made visual.

## Requirements

Docker, and the LaTeX image:

```sh
docker pull --platform linux/amd64 pyramation/pstricks-latex:latest
```

The image is amd64-only, so it runs under emulation on Apple Silicon — roughly
30 seconds for the whole example corpus, two minutes for the generated one.

PSTricks emits PostScript specials, so rasterizing goes
`latex → dvips → ps2pdf → gs`. `pdflatex` **cannot** render these documents.

## The four tools

| Script | What it does |
|---|---|
| `render-examples.mjs` | Splits the project's own `.tex` examples into individual pictures and renders each with real PSTricks |
| `fuzz-corpus.mjs` | Generates a systematic corpus: every command crossed with every style axis, plus draw-order and degenerate-input probes |
| `render-reference.mjs` | Rasterizes that generated corpus |
| `compare.mjs` | Pairs LaTeX2JS output against the reference and scores each pair |
| `gallery.mjs` | Inlines any directory of PNGs into one self-contained HTML page |

## Typical run

```sh
cd tools/pstricks-conformance

# ground truth for the project's own examples
node render-examples.mjs \
  --corpus ../../packages/latex2js/test/corpus \
  --out ./examples-ref

# LaTeX2JS side (from the playground)
cd ../../playground && pnpm e2e:gallery && cd -

# score them
node compare.mjs \
  --js ../../playground/renders \
  --ref ./examples-ref/ref \
  --out comparison.html
```

For the generated corpus:

```sh
node fuzz-corpus.mjs --out ./corpus
node render-reference.mjs --corpus ./corpus --jobs 6
node gallery.mjs --renders ./corpus/ref --out reference.html
```

## Reading the score

The two renderers cannot match pixel for pixel: one is SVG in a browser, the
other is Ghostscript output cropped to a PostScript bounding box, with
different antialiasing and font engines. **The score is a triage ordering, not
a pass/fail gate.** It says where to look.

Three signals, each chosen to survive rasterizer differences:

- **ink** — fraction of non-white pixels. Catches missing or excess drawing.
- **colour** — normalized hue histogram. Catches wrong, absent, or unfilled fills.
- **layout** — 16×16 occupancy grid over the ink bounding box, so canvas size
  and crop do not dominate. Catches reordering and misplacement.

Weighted 25 / 30 / 45 into an overall figure, worst first.

## Examples that cannot be compared directly

`\userline`, `\uservariable` and `\slider` are LaTeX2JS extensions with no
PSTricks equivalent. `render-examples.mjs` rewrites each to its static state —
a `\userline` becomes the `\psline` it draws before any interaction — and pins
every plot variable to a fixed value, recording the binding in
`manifest.json`.

A comparison for one of those units is only meaningful if the LaTeX2JS side is
rendered at the **same** bindings. Until that is wired up, treat those pairs as
indicative rather than authoritative.

The harness also normalizes several places where LaTeX2JS accepts input real
PSTricks rejects — `pow(a,b)`, infix bodies without `algebraic=true`, variable
plot bounds, `plotpoints=1`. Each of those is a dialect decision the project
still owes an answer to: keep the extension, or conform.

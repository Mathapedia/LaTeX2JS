#!/usr/bin/env node
/**
 * combo-corpus.mjs — a second PSTricks corpus, for combinations.
 *
 * The first corpus varies one option at a time. That found a lot, and it is
 * now close to exhausted: what it cannot reach is the behaviour that only
 * appears when two features meet. Every defect it did find came from a case
 * nobody had thought to write, and single-axis coverage guarantees that the
 * cases nobody writes are exactly the combinations.
 *
 * So the axes here are interactions:
 *
 *   psset      settings inherited by later commands, overridden inline, and
 *              re-declared — scope is state, and state is where drift hides
 *   pscustom   path operators composed with each other and with whole shapes
 *   options    pairs that constrain each other (a fill under linestyle=none,
 *              a hatch on a starred shape, arrows on a dashed line)
 *   units      xunit and yunit pulling apart, so anything that assumes they
 *              are equal shows itself
 *   curvature  the three curve commands crossed with the curvature parameters
 *   arrows     on shapes that are not lines
 *   repetition several elements sharing one piece of global renderer state
 *
 *   node combo-corpus.mjs --out <dir>
 *
 * Output matches fuzz-corpus.mjs — tex/, doc/, manifest.json — so
 * render-examples.mjs and compare.mjs work against it unchanged.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// --------------------------------------------------------------------- cases

/**
 * psset is scoped state. A setting declared once must reach every later
 * command, lose to an inline option on the command that overrides it, and
 * still apply to the command after that.
 */
const PSSET_CASES = [
  {
    id: 'psset-inherited-by-two',
    why: 'One psset, two later shapes. Both must pick the setting up, not just the first.',
    body: `\\psset{linecolor=red,linewidth=2pt}\n\\pscircle(-1,0){1}\n\\psframe(0.5,-1)(2.5,1)`,
  },
  {
    id: 'psset-overridden-inline',
    why: 'An inline option beats psset for that command only.',
    body: `\\psset{linecolor=red}\n\\pscircle(-1,0){1}\n\\pscircle[linecolor=blue](1,0){1}`,
  },
  {
    id: 'psset-restored-after-override',
    why: 'The command after an inline override must fall back to the psset value, not keep the override.',
    body: `\\psset{linecolor=red}\n\\pscircle(-2,0){0.8}\n\\pscircle[linecolor=blue](0,0){0.8}\n\\pscircle(2,0){0.8}`,
  },
  {
    id: 'psset-redeclared',
    why: 'A second psset replaces the first for everything after it.',
    body: `\\psset{linecolor=red}\n\\pscircle(-1,0){1}\n\\psset{linecolor=green}\n\\pscircle(1,0){1}`,
  },
  {
    id: 'psset-partial-redeclare',
    why: 'A second psset setting a different key must not clear the first key.',
    body: `\\psset{linecolor=red}\n\\psset{linewidth=3pt}\n\\pscircle(0,0){1.5}`,
  },
  {
    id: 'psset-fill-inherited',
    why: 'fillstyle and fillcolor through psset, on a shape with no inline options.',
    body: `\\psset{fillstyle=solid,fillcolor=cyan}\n\\pscircle(0,0){1.5}`,
  },
  {
    id: 'psset-linestyle-inherited',
    why: 'A dashed default reaching a shape that never mentions linestyle.',
    body: `\\psset{linestyle=dashed}\n\\pscircle(-1,0){1}\n\\psframe(0.5,-1)(2.5,1)`,
  },
  {
    id: 'psset-dash-inherited',
    why: 'dash is a parameter of the style; setting it through psset must reach the shape.',
    body: `\\psset{linestyle=dashed,dash=8pt 2pt}\n\\psline[linewidth=2pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'psset-arrows-inherited',
    why: 'An arrow default applied to a later line.',
    body: `\\psset{arrows=->,linewidth=2pt}\n\\psline(-2.5,-1)(2.5,1)`,
  },
  {
    id: 'psset-before-and-inside',
    why: 'psset outside the picture and again inside it; the inner one wins for what follows.',
    body: `\\psset{linecolor=red}\n\\pscircle(-1,0){1}\n\\psset{linecolor=blue}\n\\pscircle(1,0){1}`,
  },
  {
    id: 'psset-many-keys',
    why: 'Several keys in one psset; a parser that stops at the first comma shows here.',
    body: `\\psset{linecolor=blue,linewidth=2pt,linestyle=dashed,fillstyle=solid,fillcolor=yellow}\n\\pscircle(0,0){1.5}`,
  },
  {
    id: 'psset-then-starred',
    why: 'A starred shape under a psset fill: the star decides the fill, psset supplies the colour.',
    body: `\\psset{fillcolor=orange}\n\\pscircle*(0,0){1.5}`,
  },
  {
    id: 'psset-dotsize-inherited',
    why: 'dotsize through psset, reaching psdots.',
    body: `\\psset{dotsize=6pt 0}\n\\psdots(-2,-1)(-1,0)(0,1)(1,0)(2,-1)`,
  },
  {
    id: 'psset-curvature-inherited',
    why: 'curvature through psset, reaching a later curve.',
    body: `\\psset{curvature=1.5 .1 0}\n\\psccurve[linewidth=2pt](-2,-1)(-1,1)(0,-0.5)(1,1.5)(2,0)`,
  },
]

/**
 * pscustom composes a path out of pieces. The pieces are the risk: a subpath
 * that never closes, two subpaths in one path, a shape used as a path segment.
 */
const PSCUSTOM_CASES = [
  {
    id: 'pscustom-two-subpaths',
    why: 'Two moveto-led subpaths in one pscustom; both must be drawn.',
    body: `\\pscustom[linewidth=2pt]{\\moveto(-2.5,-1)\\lineto(-0.5,1)\\moveto(0.5,-1)\\lineto(2.5,1)}`,
  },
  {
    id: 'pscustom-closepath-midway',
    why: 'A closepath in the middle, then more path after it.',
    body: `\\pscustom[linewidth=2pt]{\\moveto(-2,-1)\\lineto(-1,1)\\lineto(0,-1)\\closepath\\moveto(1,-1)\\lineto(2,1)}`,
  },
  {
    id: 'pscustom-curveto-then-lineto',
    why: 'A bezier segment followed by a straight one; the curve must not swallow the line.',
    body: `\\pscustom[linewidth=2pt]{\\moveto(-2.5,-1)\\curveto(-1.5,1.5)(-0.5,-1.5)(0.5,1)\\lineto(2.5,-1)}`,
  },
  {
    id: 'pscustom-lineto-without-moveto',
    why: 'A lineto with no preceding moveto must start the path rather than be dropped.',
    body: `\\pscustom[linewidth=2pt]{\\lineto(-2,-1)\\lineto(0,1.5)\\lineto(2,-1)}`,
  },
  {
    id: 'pscustom-filled-two-subpaths',
    why: 'A fill across two subpaths — the even-odd/nonzero question.',
    body: `\\pscustom[fillstyle=solid,fillcolor=cyan,linewidth=2pt]{\\moveto(-2,-1.5)\\lineto(2,-1.5)\\lineto(2,1.5)\\lineto(-2,1.5)\\closepath\\moveto(-1,-0.7)\\lineto(1,-0.7)\\lineto(1,0.7)\\lineto(-1,0.7)\\closepath}`,
  },
  {
    id: 'pscustom-hatched',
    why: 'A hatch fill on a custom path; the pattern must clip to the path, not the picture.',
    body: `\\pscustom[fillstyle=hlines,linewidth=2pt]{\\moveto(-2,-1)\\lineto(0,1.5)\\lineto(2,-1)\\closepath}`,
  },
  {
    id: 'pscustom-starred',
    why: 'The starred form of pscustom.',
    body: `\\pscustom*[linecolor=blue]{\\moveto(-2,-1)\\lineto(0,1.5)\\lineto(2,-1)\\closepath}`,
  },
  {
    id: 'pscustom-with-psline',
    why: 'A whole psline used as a pscustom segment, mixed with path operators.',
    body: `\\pscustom[linewidth=2pt]{\\moveto(-2.5,-1)\\psline(-1,1)(0,-1)\\lineto(2.5,1)}`,
  },
  {
    id: 'pscustom-with-psbezier',
    why: 'A psbezier inside pscustom.',
    body: `\\pscustom[linewidth=2pt]{\\psbezier(-2.5,-1)(-1,2)(1,-2)(2.5,1)}`,
  },
  {
    id: 'pscustom-dashed',
    why: 'A broken line style across a multi-segment custom path; the dash must run continuously, not restart per segment.',
    body: `\\pscustom[linewidth=2pt,linestyle=dashed]{\\moveto(-2.5,-1)\\lineto(-1,1)\\lineto(1,-1)\\lineto(2.5,1)}`,
  },
  {
    id: 'pscustom-dotted-closed',
    why: 'A dotted closed custom path.',
    body: `\\pscustom[linewidth=2pt,linestyle=dotted]{\\moveto(-2,-1)\\lineto(0,1.5)\\lineto(2,-1)\\closepath}`,
  },
  {
    id: 'pscustom-nested-after-shape',
    why: 'A pscustom drawn after a filled shape must sit on top of it.',
    body: `\\pscircle[fillstyle=solid,fillcolor=yellow](0,0){1.8}\n\\pscustom[linewidth=2pt,linecolor=red]{\\moveto(-2,-1)\\lineto(0,1.5)\\lineto(2,-1)}`,
  },
]

/** Pairs of options that constrain each other. */
const OPTION_PAIRS = [
  {
    id: 'combo-fill-with-linestyle-none',
    why: 'A solid fill with no outline: the region must stay, the border must go.',
    body: `\\pscircle[fillstyle=solid,fillcolor=cyan,linestyle=none](0,0){1.5}`,
  },
  {
    id: 'combo-hatch-with-linestyle-none',
    why: 'Hatch with no outline; the hatch lines must survive even though the stroke does not.',
    body: `\\pscircle[fillstyle=hlines,linestyle=none](0,0){1.5}`,
  },
  {
    id: 'combo-hatch-starred',
    why: 'A starred hatch lays its lines over the fill colour rather than over nothing.',
    body: `\\pscircle[fillstyle=hlines*,fillcolor=yellow,hatchcolor=red](0,0){1.5}`,
  },
  {
    id: 'combo-star-with-fillstyle-none',
    why: 'The star and fillstyle=none disagree; the star is the stronger statement.',
    body: `\\pscircle*[fillstyle=none](0,0){1.5}`,
  },
  {
    id: 'combo-star-with-hatch',
    why: 'A starred shape that also asks for a hatch.',
    body: `\\pscircle*[fillstyle=crosshatch](0,0){1.5}`,
  },
  {
    id: 'combo-arrows-with-dashed',
    why: 'Arrowheads on a dashed line; the heads must stay solid.',
    body: `\\psline[arrows=<->,linestyle=dashed,linewidth=2pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'combo-arrows-with-dotted',
    why: 'Arrowheads on a dotted line.',
    body: `\\psline[arrows=<->,linestyle=dotted,linewidth=2pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'combo-arrows-with-linestyle-none',
    why: 'linestyle=none with arrows: no shaft, and the heads go with it.',
    body: `\\psline[arrows=<->,linestyle=none,linewidth=2pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'combo-arrowscale-with-linewidth',
    why: 'A scaled head on a thick line; both scale the head and they must not multiply twice.',
    body: `\\psline[arrows=->,arrowscale=2,linewidth=4pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'combo-dash-with-linewidth',
    why: 'A dash pattern under a thick pen.',
    body: `\\psline[linestyle=dashed,dash=6pt 4pt,linewidth=4pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'combo-dotsep-with-linewidth',
    why: 'Dot spacing under a thick pen: the dots grow with the pen, the gaps should not close up.',
    body: `\\psline[linestyle=dotted,dotsep=4pt,linewidth=4pt](-2.5,-1)(2.5,1)`,
  },
  {
    id: 'combo-hatchsep-with-hatchangle',
    why: 'Hatch spacing and angle together; the rotation must not change the spacing.',
    body: `\\pscircle[fillstyle=hlines,hatchsep=8pt,hatchangle=30](0,0){1.5}`,
  },
  {
    id: 'combo-grid-subdiv-with-labels',
    why: 'Subdivisions and numbering together; the numbers go on the units, not the subdivisions.',
    body: `\\psgrid[subgriddiv=4,gridlabels=8pt](-2,-2)(2,2)`,
  },
  {
    id: 'combo-grid-no-labels-with-subdiv',
    why: 'Subdivisions with numbering explicitly off.',
    body: `\\psgrid[subgriddiv=4,gridlabels=0](-2,-2)(2,2)`,
  },
  {
    id: 'combo-axes-ticks-none-labels-all',
    why: 'Numbers asked for while ticks are suppressed.',
    body: `\\psaxes[ticks=none,labels=all](0,0)(-2,-2)(2,2)`,
  },
  {
    id: 'combo-axes-arrows-with-labels',
    why: 'An arrowed axis that is also numbered; the arrowed end drops its tick and its number.',
    body: `\\psaxes[arrows=->,labels=all](0,0)(-2,-2)(2,2)`,
  },
  {
    id: 'combo-plot-dots-with-linewidth',
    why: 'Dot markers on a plot under a thick pen; dotsize reads linewidth.',
    body: `\\psplot[algebraic=true,plotstyle=dots,plotpoints=15,linewidth=3pt]{-2}{2}{x^2/2-1}`,
  },
  {
    id: 'combo-plot-dashed',
    why: 'A dashed plot: the dash must follow the curve, not the sample segments.',
    body: `\\psplot[algebraic=true,linestyle=dashed,linewidth=2pt]{-2}{2}{x^2/2-1}`,
  },
  {
    id: 'combo-wedge-fill-and-outline',
    why: 'A wedge with both a fill and a visible outline in another colour.',
    body: `\\pswedge[fillstyle=solid,fillcolor=cyan,linecolor=red,linewidth=2pt](0,0){2}{30}{150}`,
  },
  {
    id: 'combo-arc-fill-and-arrows',
    why: 'A filled arc that also carries arrowheads.',
    body: `\\psarc[fillstyle=solid,fillcolor=yellow,arrows=->,linewidth=2pt](0,0){1.8}{30}{150}`,
  },
]

/** xunit and yunit pulled apart, so anything assuming they are equal shows. */
const UNIT_CASES = [
  {
    id: 'units-xunit-double',
    why: 'xunit twice yunit: a circle command must still produce a circle of xunit radius, as PSTricks does.',
    body: `\\psset{xunit=2,yunit=1}\n\\pscircle(0,0){1}\n\\psframe(-1,-1)(1,1)`,
    picture: ['(-2.5,-2)', '(2.5,2)'],
  },
  {
    id: 'units-yunit-double',
    why: 'The other way round.',
    body: `\\psset{xunit=1,yunit=2}\n\\pscircle(0,0){1}\n\\psframe(-1,-1)(1,1)`,
    picture: ['(-2.5,-2)', '(2.5,2)'],
  },
  {
    id: 'units-unit-both',
    why: 'unit sets both at once.',
    body: `\\psset{unit=1.5}\n\\pscircle(0,0){1}\n\\psframe(-1,-1)(1,1)`,
    picture: ['(-2,-2)', '(2,2)'],
  },
  {
    id: 'units-grid-under-xunit',
    why: 'A grid under unequal units: the cells must be rectangles, not squares.',
    body: `\\psset{xunit=2,yunit=1}\n\\psgrid(-1,-2)(1,2)`,
    picture: ['(-1.5,-2.5)', '(1.5,2.5)'],
  },
  {
    id: 'units-axes-under-xunit',
    why: 'Axes under unequal units; tick spacing follows each axis separately.',
    body: `\\psset{xunit=2,yunit=1}\n\\psaxes(0,0)(-1,-2)(1,2)`,
    picture: ['(-1.5,-2.5)', '(1.5,2.5)'],
  },
  {
    id: 'units-arc-under-xunit',
    why: 'An arc under unequal units. Its radius is a single number but the axes differ.',
    body: `\\psset{xunit=2,yunit=1}\n\\psarc[linewidth=2pt](0,0){1}{0}{180}`,
    picture: ['(-1.5,-2)', '(1.5,2)'],
  },
  {
    id: 'units-ellipse-under-xunit',
    why: 'An ellipse has separate radii, so both transforms apply.',
    body: `\\psset{xunit=2,yunit=1}\n\\psellipse(0,0)(1,1.5)`,
    picture: ['(-1.5,-2)', '(1.5,2)'],
  },
  {
    id: 'units-plot-under-yunit',
    why: 'A plot under a stretched y axis.',
    body: `\\psset{xunit=1,yunit=2}\n\\psplot[algebraic=true,linewidth=2pt]{-2}{2}{x^2/4-1}`,
    picture: ['(-2.5,-2)', '(2.5,2)'],
  },
  {
    id: 'units-dots-under-xunit',
    why: 'Dot markers must keep their size when the units stretch; only their positions move.',
    body: `\\psset{xunit=2,yunit=1}\n\\psdots(-1,-1)(0,0)(1,1)`,
    picture: ['(-1.5,-2)', '(1.5,2)'],
  },
  {
    id: 'units-linewidth-under-xunit',
    why: 'Line width is a pen size, not a coordinate; unequal units must not make a stroke elliptical.',
    body: `\\psset{xunit=2,yunit=1}\n\\pscircle[linewidth=4pt](0,0){1}`,
    picture: ['(-1.5,-2)', '(1.5,2)'],
  },
]

/** The three curve commands crossed with the curvature parameters. */
const CURVE_CASES = (() => {
  const PTS = '(-2,-1)(-1,1)(0,-0.5)(1,1.5)(2,0)'
  const out = []
  for (const cmd of ['pscurve', 'psecurve', 'psccurve']) {
    for (const curvature of ['1 .1 0', '0.5 .1 0', '2 .1 0', '1 1 0', '1 .1 1', '1 .1 -1']) {
      out.push({
        id: `curvature-${cmd}-${curvature.replace(/[ .]/g, '_')}`,
        why: `${cmd} at curvature=${curvature}. The parameters scale the control offsets, damp them at sharp turns, and weight the tangent by segment length; each has a distinct signature.`,
        body: `\\${cmd}[linewidth=2pt,curvature=${curvature}]${PTS}`,
      })
    }
  }
  return out
})()

/** Arrowheads on shapes that are not straight lines. */
const ARROW_SHAPE_CASES = [
  { id: 'arrowshape-arc', why: 'Arrowheads on an arc follow the tangent at each end.', body: `\\psarc[arrows=<->,linewidth=2pt](0,0){1.8}{20}{160}` },
  { id: 'arrowshape-curve', why: 'Arrowheads on an open curve.', body: `\\pscurve[arrows=<->,linewidth=2pt](-2,-1)(0,1.5)(2,-1)` },
  { id: 'arrowshape-bezier', why: 'Arrowheads on a bezier.', body: `\\psbezier[arrows=<->,linewidth=2pt](-2.5,-1)(-1,2)(1,-2)(2.5,1)` },
  { id: 'arrowshape-plot', why: 'Arrowheads on a plot.', body: `\\psplot[algebraic=true,arrows=<->,linewidth=2pt]{-2}{2}{x^2/2-1}` },
  { id: 'arrowshape-polyline', why: 'Arrowheads on a polyline go on the two ends, not on every vertex.', body: `\\psline[arrows=<->,linewidth=2pt](-2.5,-1)(-1,1)(1,-1)(2.5,1)` },
  { id: 'arrowshape-bar-ends', why: 'Bar ends rather than arrowheads.', body: `\\psline[arrows=|-|,linewidth=2pt](-2.5,-1)(2.5,1)` },
  { id: 'arrowshape-double-head', why: 'A double head.', body: `\\psline[arrows=->>,linewidth=2pt](-2.5,-1)(2.5,1)` },
  { id: 'arrowshape-round-ends', why: 'Round caps as the end style.', body: `\\psline[arrows=*-*,linewidth=2pt](-2.5,-1)(2.5,1)` },
]

/**
 * Several elements sharing one piece of renderer state. Hatch patterns are the
 * case in point: each hatched shape defines an SVG pattern under a generated
 * id, and the counter behind those ids is module-global. Two hatched shapes in
 * one picture is the smallest case that can expose a collision.
 */
const REPETITION_CASES = [
  {
    id: 'repeat-two-hatches',
    why: 'Two hatched shapes in one picture. Each needs its own pattern; a shared id would give both the first one.',
    body: `\\pscircle[fillstyle=hlines,hatchcolor=red](-1.2,0){1.2}\n\\pscircle[fillstyle=vlines,hatchcolor=blue](1.2,0){1.2}`,
  },
  {
    id: 'repeat-three-hatches-differing',
    why: 'Three hatches differing in angle, separation and colour.',
    body: `\\psframe[fillstyle=hlines,hatchangle=0](-2.5,-2)(-0.9,2)\n\\psframe[fillstyle=hlines,hatchangle=45,hatchsep=8pt](-0.8,-2)(0.8,2)\n\\psframe[fillstyle=crosshatch,hatchcolor=red](0.9,-2)(2.5,2)`,
  },
  {
    id: 'repeat-same-hatch-twice',
    why: 'The same hatch on two shapes; sharing one pattern here would be correct, duplicating it is merely wasteful, and getting either wrong is visible.',
    body: `\\pscircle[fillstyle=crosshatch](-1.2,0){1.2}\n\\pscircle[fillstyle=crosshatch](1.2,0){1.2}`,
  },
  {
    id: 'repeat-hatch-over-fill',
    why: 'A hatched shape drawn over a solid one.',
    body: `\\psframe[fillstyle=solid,fillcolor=yellow](-2.5,-2)(2.5,2)\n\\pscircle[fillstyle=hlines,hatchcolor=blue](0,0){1.8}`,
  },
  {
    id: 'repeat-ten-dashed-lines',
    why: 'Ten dashed lines; a dash pattern held in shared state rather than per element would drift across them.',
    body: Array.from({ length: 10 }, (_, i) => `\\psline[linestyle=dashed,dash=${2 + i}pt ${2}pt](-2.5,${(i - 4.5) * 0.45})(2.5,${(i - 4.5) * 0.45})`).join('\n'),
  },
  {
    id: 'repeat-mixed-styles',
    why: 'Solid, dashed, dotted and none in one picture, in that order.',
    body: `\\psline[linestyle=solid,linewidth=2pt](-2.5,1.5)(2.5,1.5)\n\\psline[linestyle=dashed,linewidth=2pt](-2.5,0.5)(2.5,0.5)\n\\psline[linestyle=dotted,linewidth=2pt](-2.5,-0.5)(2.5,-0.5)\n\\psline[linestyle=none,linewidth=2pt](-2.5,-1.5)(2.5,-1.5)`,
  },
  {
    id: 'repeat-grid-then-axes',
    why: 'A grid and axes together, the common backdrop; their lines must not fight.',
    body: `\\psgrid[subgriddiv=2,gridlabels=0](-2,-2)(2,2)\n\\psaxes[linewidth=1.5pt](0,0)(-2,-2)(2,2)`,
  },
  {
    id: 'repeat-axes-then-plot-then-dots',
    why: 'The full common stack: axes, a plot over them, markers over that.',
    body: `\\psaxes(0,0)(-2,-2)(2,2)\n\\psplot[algebraic=true,linewidth=2pt,linecolor=blue]{-2}{2}{x^2/2-1}\n\\psdots[dotsize=5pt 0,linecolor=red](-2,1)(0,-1)(2,1)`,
  },
  {
    id: 'repeat-many-colors',
    why: 'Every named colour in one picture, so a colour resolved from shared state shows as a run of wrong fills.',
    body: ['red', 'green', 'blue', 'cyan', 'magenta', 'yellow', 'orange', 'purple', 'violet', 'brown', 'lime', 'pink', 'teal', 'olive']
      .map((c, i) => `\\psframe[fillstyle=solid,fillcolor=${c},linestyle=none](${-2.6 + i * 0.37},-1)(${-2.6 + i * 0.37 + 0.34},1)`)
      .join('\n'),
  },
  {
    id: 'repeat-nested-fills-descending',
    why: 'Concentric filled circles, largest first; every one must remain visible as a ring.',
    body: [2.2, 1.8, 1.4, 1.0, 0.6]
      .map((r, i) => `\\pscircle[fillstyle=solid,fillcolor=${['red', 'orange', 'yellow', 'green', 'blue'][i]}](0,0){${r}}`)
      .join('\n'),
  },
]

/** Text and placement crossed with graphics. */
const PLACEMENT_CASES = [
  {
    id: 'place-rput-over-fill',
    why: 'rput content on top of a fill authored before it.',
    body: `\\psframe[fillstyle=solid,fillcolor=cyan](-2,-1)(2,1)\n\\rput(0,0){\\psframe[fillstyle=solid,fillcolor=yellow](-0.5,-0.4)(0.5,0.4)}`,
  },
  {
    id: 'place-rput-under-line',
    why: 'rput content authored before a line must stay under it.',
    body: `\\rput(0,0){\\pscircle[fillstyle=solid,fillcolor=yellow](0,0){1.2}}\n\\psline[linewidth=3pt,linecolor=red](-2.5,-1.5)(2.5,1.5)`,
  },
  {
    id: 'place-two-rput',
    why: 'Two rput groups; each must land at its own coordinate.',
    body: `\\rput(-1.2,0){\\pscircle[fillstyle=solid,fillcolor=red](0,0){0.8}}\n\\rput(1.2,0){\\pscircle[fillstyle=solid,fillcolor=blue](0,0){0.8}}`,
  },
  {
    id: 'place-rput-offset-shape',
    why: 'A shape already offset inside an rput; the two offsets compose.',
    body: `\\psgrid[gridlabels=0](-2,-2)(2,2)\n\\rput(1,1){\\pscircle[fillstyle=solid,fillcolor=red](0.5,0.5){0.4}}`,
  },
]

const GROUPS = [
  ['psset', 'scope', PSSET_CASES],
  ['pscustom', 'composition', PSCUSTOM_CASES],
  ['options', 'interaction', OPTION_PAIRS],
  ['units', 'transform', UNIT_CASES],
  ['curvature', 'parameters', CURVE_CASES],
  ['arrows', 'non-line-shapes', ARROW_SHAPE_CASES],
  ['repetition', 'shared-state', REPETITION_CASES],
  ['placement', 'rput', PLACEMENT_CASES],
]

// ---------------------------------------------------------------- generation

const PICTURE = ['(-3,-2.5)', '(3,2.5)']

function wrapPicture(body, picture) {
  const p = picture || PICTURE
  return `\\begin{pspicture}${p[0]}${p[1]}\n${body}\n\\end{pspicture}`
}

/** A standalone LaTeX document that real PSTricks can compile to PDF. */
function wrapDocument(body, picture) {
  return `\\documentclass[border=4pt]{standalone}
\\usepackage{pstricks}
\\usepackage{pst-plot}
\\usepackage{pst-node}
\\usepackage{multido}
\\begin{document}
${wrapPicture(body, picture)}
\\end{document}
`
}

// --------------------------------------------------------------------- main

const argv = process.argv.slice(2)
const outDir = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : './combo-corpus'
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1].split(',') : null

rmSync(outDir, { recursive: true, force: true })
mkdirSync(join(outDir, 'tex'), { recursive: true })
mkdirSync(join(outDir, 'doc'), { recursive: true })

const manifest = {}
let n = 0
for (const [command, axis, group] of GROUPS) {
  if (only && !only.includes(command)) continue
  for (const c of group) {
    writeFileSync(join(outDir, 'tex', `${c.id}.tex`), `${wrapPicture(c.body, c.picture)}\n`)
    writeFileSync(join(outDir, 'doc', `${c.id}.tex`), wrapDocument(c.body, c.picture))
    manifest[c.id] = { command, axis, why: c.why, body: c.body, interactive: !!c.interactive }
    n++
  }
}
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const byCommand = {}
for (const m of Object.values(manifest)) byCommand[m.command] = (byCommand[m.command] ?? 0) + 1
console.log(`combo-corpus: ${n} cases -> ${outDir}`)
for (const [k, v] of Object.entries(byCommand).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(4)}  ${k}`)

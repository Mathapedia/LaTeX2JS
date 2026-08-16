import LaTeX2JS from '../src';

const latex = new LaTeX2JS();

describe('PSTricks plot semantics', () => {
  it('maps psline coordinates through X/Y with unit scaling', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(-5,-5)(5,5)
\\psline{->}(0,-3.75)(0,3.75)
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env).toBeDefined();
    // pspicture(-5,-5)(5,5): w = x1 - x0 = 10, xunit = 50 (1cm)
    // X(v) = (w - (x1 - v)) * xunit  → X(0) = (10 - (5 - 0)) * 50 = 250
    // Y(v) = (y1 - v) * yunit        → Y(-3.75) = (5 + 3.75) * 50 = 437.5
    //                                  → Y(3.75) = (5 - 3.75) * 50 = 62.5
    const line = env.plot.psline[0].data;
    expect(line.x1).toBe(250);
    expect(line.y1).toBe(437.5);
    expect(line.x2).toBe(250);
    expect(line.y2).toBe(62.5);
    expect(line.arrows).toEqual([0, 1]);
    expect(line.dots).toEqual([0, 0]);
  });

  it('parses dashed linestyle and linecolor options', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psline[linestyle=dashed,linecolor=red](0,0)(1,1)
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    const line = env.plot.psline[0].data;
    expect(line.linestyle).toBe('dashed');
    expect(line.linecolor).toBe('red');
  });

  it('computes pscircle center and radius', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(-5,-5)(5,5)
\\pscircle(0,0){3}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    const circle = env.plot.pscircle[0].data;
    expect(circle.cx).toBe(250);
    expect(circle.cy).toBe(250);
    expect(circle.r).toBe(150); // xunit * 3
  });

  it('captures sliders and seed variables from \\slider', () => {
    const parsed = latex.parse(`
\\psset{unit=1cm}
\\begin{pspicture}(-3.5,-1)(3.75,3.5)
\\slider{1}{8}{n}{$N$}{4}
\\psplot[algebraic]{-3.14}{3.14}{cos(n*x)+1}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.env.sliders).toHaveLength(1);
    expect(env.env.sliders[0]).toMatchObject({ min: 1, max: 8, variable: 'n', value: 4 });
    expect(env.env.variables.n).toBe(4);
    expect(env.plot.psplot).toHaveLength(1);
  });

  it('keeps verbatim content untouched', () => {
    const parsed = latex.parse(`
before
\\begin{verbatim}
\\begin{pspicture}(0,0)(4,4)
\\psline{->}(0,0)(1,1)
\\end{pspicture}
\\end{verbatim}
after
    `);

    const verbatim = parsed.find((e: any) => e.type === 'verbatim');
    expect(verbatim.lines.join('\n')).toContain('\\psline{->}(0,0)(1,1)');
  });

  it('converts header environments and text formatting', () => {
    const parsed = latex.parse(`
\\begin{theorem}
If you know \\TeX, you can \\emph{author} math.
\\end{theorem}
    `);

    const math = parsed.find((e: any) => e.type === 'math');
    const text = math.lines.join('\n');
    expect(text).toContain('<h4>Theorem 1</h4>');
    expect(text).toContain('<i>author</i>');
    expect(text).toContain('$\\TeX$');
  });
});

describe('Peggy grammar parser (new)', () => {
  it('parses commands that span multiple lines', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\rput(0,0){
  $\\frac{1}{2}$
}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.rput).toHaveLength(1);
    expect(env.plot.rput[0].data.text).toContain('\\frac{1}{2}');
    expect(env.plot.rput[0].data.text).toContain('$');
  });

  it('strips inline comments but keeps the command', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psline(0,0)(1,1) % this is a comment
% a full comment line
\\pscircle(0,0){1}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.psline).toHaveLength(1);
    expect(env.plot.pscircle).toHaveLength(1);
    // comment-only line must not end up in env.lines
    expect(env.lines.some((l: string) => l.includes('%'))).toBe(false);
  });

  it('records source order in env.elements', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\pscircle(0,0){1}
\\psline(0,0)(1,1)
\\pscircle(1,1){2}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.env.elements.map((el: any) => el.name)).toEqual([
      'pscircle',
      'psline',
      'pscircle'
    ]);
    // grouped plot still works for interactive redraws
    expect(env.plot.pscircle).toHaveLength(2);
    expect(env.plot.psline).toHaveLength(1);
  });

  it('captures multiple same-name commands on one line', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\pscircle(0,0){1} \\pscircle(1,1){2}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.pscircle).toHaveLength(2);
  });

  it('does not corrupt pspicture content with text transforms', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\rput(1,1){$a--b$}
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    // the old parser turned `--` into &ndash; inside the rput math
    expect(env.plot.rput[0].data.text).toBe('$a--b$');
  });

  it('collects diagnostics for unknown commands', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psfractal(0,0)
\\psline(0,0)(1,1)
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.psline).toHaveLength(1);
    const diag = latex.lastDiagnostics.find((d: any) => d.message.includes('psfractal'));
    expect(diag).toBeDefined();
    expect(diag.severity).toBe('warning');
    expect(diag.line).toBeDefined();
  });

  it('reports unclosed environments as warnings', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psline(0,0)(1,1)
    `);

    expect(parsed.find((e: any) => e.type === 'pspicture')).toBeDefined();
    const diag = latex.lastDiagnostics.find((d: any) => d.message.includes("unclosed environment 'pspicture'"));
    expect(diag).toBeDefined();
    expect(diag.severity).toBe('warning');
  });

  it('reports mismatched environment ends', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psline(0,0)(1,1)
\\end{enumerate}
    `);

    const diag = latex.lastDiagnostics.find((d: any) => d.message.includes('does not match'));
    expect(diag).toBeDefined();
    expect(diag.severity).toBe('warning');
  });

  it('parses linewidth with units instead of falling back to 2', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psline[linewidth=1.5 pt]{->}(0,0)(1,1)
\\psline[linewidth=3](0,0)(1,1)
\\end{pspicture}
    `);

    const env = parsed.find((e: any) => e.type === 'pspicture');
    // 1.5 pt → ~2px (1pt ≈ 1.333px)
    expect(env.plot.psline[0].data.linewidth).toBeCloseTo(2, 1);
    // bare number stays as-is
    expect(env.plot.psline[1].data.linewidth).toBe(3);
  });
});

describe('feature port: PSTricks commands', () => {
  it('psdots collects point coordinates', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psdots(1,1)(2,2)
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.psdots).toHaveLength(1);
    expect(env.plot.psdots[0].data.data).toHaveLength(4); // 2 points
  });

  it('psgrid spans the pspicture bounds by default', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psgrid
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    const grid = env.plot.psgrid[0].data;
    expect(grid.x0).toBeLessThan(grid.x1);
    expect(grid.y0).toBeLessThan(grid.y1);
    expect(grid.xunit).toBeDefined();
  });

  it('psellipse computes center and radii', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psellipse[fillstyle=solid,fillcolor=lightblue](2,2)(1,0.5)
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    const el = env.plot.psellipse[0].data;
    expect(el.fillstyle).toBe('solid');
    expect(el.fillcolor).toBe('lightblue');
    expect(el.rx).toBe(50); // 1 * xunit(50)
    expect(el.ry).toBe(25); // 0.5 * yunit(50)
  });

  it('psbezier captures four control points', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psbezier(0,0)(1,2)(2,2)(3,0)
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    const b = env.plot.psbezier[0].data;
    expect(b.x1).toBeDefined();
    expect(b.x2).toBeDefined();
    expect(b.x3).toBeDefined();
    expect(b.x4).toBeDefined();
  });

  it('pscurve/psccurve collect points and closure flag', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\pscurve(0,0)(1,1)(2,0)
\\psccurve(0,1)(1,2)(2,1)
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.pscurve[0].data.closed).toBe(false);
    expect(env.plot.pscurve[0].data.data.length).toBeGreaterThanOrEqual(6);
    expect(env.plot.psccurve[0].data.closed).toBe(true);
  });

  it('pswedge computes pie-slice data', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\pswedge[fillstyle=solid,fillcolor=gray!40](2,2){1}{0}{90}
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    const w = env.plot.pswedge[0].data;
    expect(w.r).toBe(50);
    expect(w.angleA).toBe(0);
    expect(w.angleB).toBeCloseTo(Math.PI / 2);
    expect(w.A).toBeDefined();
    expect(w.B).toBeDefined();
  });

  it('star variants are marked filled', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\pscircle*(0,0){1}
\\psframe*[fillcolor=red](1,1)(2,2)
\\pspolygon*(3,0)(4,1)(3,2)
\\psline*[linecolor=blue](0,3)(1,3)
\\psarc*(2,2){1}{0}{90}
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.pscircle[0].data.filled).toBe(true);
    expect(env.plot.psframe[0].data.filled).toBe(true);
    expect(env.plot.psframe[0].data.fillcolor).toBe('red');
    expect(env.plot.pspolygon[0].data.filled).toBe(true);
    expect(env.plot.psline[0].data.filled).toBe(true);
    expect(env.plot.psarc[0].data.filled).toBe(true);
  });

  it('pscustom extracts its inner commands', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(8,4)
\\pscustom[fillstyle=solid,fillcolor=gray!40,linestyle=none]{
  \\psline(0,0)(4,1.2)
  \\psline(4,1.2)(8,0)
  \\psline(8,0)(4,-1.2)
  \\psline(4,-1.2)(0,0)
}
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    const custom = env.plot.pscustom[0].data;
    expect(custom.commands).toHaveLength(4);
    expect(custom.commands.every((c: any) => c.key === 'psline')).toBe(true);
    expect(custom.fillstyle).toBe('solid');
  });

  it('multido expands its body with counter substitution', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\multido{\\i=0+1}{4}{\\psline(\\i,0)(\\i,1)}
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    expect(env.plot.psline).toHaveLength(4);
    // first line at \i=0 → x1 = X(0); last at \i=3 → x1 = X(3)
    expect(env.plot.psline[0].data.x1).toBeLessThan(env.plot.psline[3].data.x1);
    expect(env.env.elements.map((el: any) => el.name)).toEqual(['psline', 'psline', 'psline', 'psline']);
  });

  it('psplot honors plotpoints option', () => {
    const parsed = latex.parse(`
\\begin{pspicture}(0,0)(4,4)
\\psplot[algebraic,plotpoints=101]{0}{1}{x*x}
\\end{pspicture}
    `);
    const env = parsed.find((e: any) => e.type === 'pspicture');
    const data = env.plot.psplot[0].data.data;
    // 101 samples → 202 numbers
    expect(data.length).toBe(202);
  });
});

describe('feature port: text macros and headers', () => {
  it('renders common text formatting macros', () => {
    const parsed = latex.parse(`
\\textbf{bold} and \\textit{italic} and \\texttt{code} and \\underline{under} and \\textsc{scaps}
and \\textcolor{red}{colored} and \\section{Intro}
    `);
    const math = parsed.find((e: any) => e.type === 'math');
    const text = math.lines.join('\n');
    expect(text).toContain('<b>bold</b>');
    expect(text).toContain('<i>italic</i>');
    expect(text).toContain('<span class="tt">code</span>');
    expect(text).toContain('<u>under</u>');
    expect(text).toContain('font-variant: small-caps');
    expect(text).toContain('<span style="color:red;">colored</span>');
    expect(text).toContain('<h2><span class="section-number">1</span> Intro</h2>');
  });

  it('renders the added header environments', () => {
    const parsed = latex.parse(`
\\begin{lemma}L\\end{lemma}
\\begin{proposition}P\\end{proposition}
\\begin{axiom}A\\end{axiom}
\\begin{remark}R\\end{remark}
\\begin{note}N\\end{note}
\\begin{exercise}E\\end{exercise}
\\begin{question}Q\\end{question}
\\begin{corollary}C\\end{corollary}
    `);
    const math = parsed.find((e: any) => e.type === 'math');
    const text = math.lines.join('\n');
    expect(text).toContain('<h4>Lemma 1</h4>');
    expect(text).toContain('<h4>Proposition 1</h4>');
    expect(text).toContain('<h4>Axiom 1</h4>');
    expect(text).toContain('<h4>Remark 1</h4>');
    expect(text).toContain('<h4>Note 1</h4>');
    expect(text).toContain('<h4>Exercise 1</h4>');
    expect(text).toContain('<h4>Question 1</h4>');
    expect(text).toContain('<h4>Corollary 1</h4>');
  });

  it('does not crash on \\end{corollary} (old typo fix)', () => {
    const parsed = latex.parse(`
\\begin{corollary}C\\end{corollary}
    `);
    const math = parsed.find((e: any) => e.type === 'math');
    expect(math.lines.join('\n')).toContain('<h4>Corollary 1</h4>');
    expect(latex.lastDiagnostics).toHaveLength(0);
  });

  it('parses itemize and description environments', () => {
    const parsed = latex.parse(`
\\begin{itemize}
\\item first
\\item second
\\end{itemize}
\\begin{description}
\\item[Term] definition
\\end{description}
    `);
    const itemize = parsed.find((e: any) => e.type === 'itemize');
    expect(itemize.lines.join('\n')).toContain('\\item first');
    const description = parsed.find((e: any) => e.type === 'description');
    expect(description.lines.join('\n')).toContain('\\item[Term] definition');
  });

  it('passes math environments through to MathJax', () => {
    const parsed = latex.parse(`
\\begin{align}
x^2 + y^2 &= z^2 \\\\
a &= b
\\end{align}
    `);
    const math = parsed.find((e: any) => e.type === 'math');
    const text = math.lines.join('\n');
    expect(text).toContain('\\begin{align}');
    expect(text).toContain('x^2 + y^2 &= z^2');
    expect(text).toContain('\\end{align}');
  });
});

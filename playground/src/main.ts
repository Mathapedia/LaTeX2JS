import './style.css';
import '../../packages/css/latex2js.css';

import LaTeX2JS from 'latex2js';
import render from 'latex2html5';

const editor = document.getElementById('editor') as HTMLTextAreaElement;
const output = document.getElementById('output') as HTMLDivElement;
const diagnostics = document.getElementById('diagnostics') as HTMLDivElement;
const exampleBar = document.getElementById('examples') as HTMLDivElement;

const EXAMPLES: Array<[string, string]> = [
  [
    'axes + vectors',
    String.raw`\begin{pspicture}(-5,-5)(5,5)

% y-axis
\rput(0.3,3.75){ $Im$ }
\psline{->}(0,-3.75)(0,3.75)

% x-axis
\rput(3.75,0.3){ $Re$ }
\psline{->}(-3.75,0)(3.75,0)

% the circle
\pscircle(0,0){ 3 }

\rput(2.3,1){$e^{i\omega}-\alpha$}
\userline[linewidth=1.5 pt]{->}(1.500,0.000)(2.121,2.121)
\userline[linewidth=1.5 pt,linecolor=blue]{->}(0,0.000)(2.121,2.121){(x>0) ? 3 * cos( atan(-y/x) ) : -3 * cos( atan(-y/x) ) }{ (x>0) ? -3 * sin( atan(-y/x) ) : 3 * sin( atan(-y/x) )}

\userline[linewidth=1.5 pt,linestyle=dashed](-1.500,0.000)(2.121,2.121){x}{0}{x}{y}
\userline[linewidth=1.5 pt,linestyle=dashed](-1.500,0.000)(2.121,2.121){0}{y}{x}{y}

\rput(-0.75,-4.25){$1+\alpha$}
\rput(2.25,-4.25){$1-\alpha$}
\psline{<->}(-3,-4)(1.5,-4)
\psline{<->}(1.5,-4)(3,-4)
\psline[linestyle=dashed](3,-4.5)(3,0)
\psline[linestyle=dashed](-3,-4.5)(-3,0)
\psline[linestyle=dashed](1.5,-4.5)(1.5,0)

\end{pspicture}`,
  ],
  [
    'slider + plot',
    String.raw`\psset{unit=1cm}
\begin{pspicture}(-3.5,-1)(3.75,3.5)

\slider{1}{8}{n}{$N$}{4}

\psplot[algebraic,linewidth=1.5pt,plotpoints=1000]{-3.14}{3.14}{cos(n*x/2)+1.3}
\psaxes[showorigin=false,labels=none, Dx=1.62](0,0)(-3.25,0)(3.25,2.5)

\psline[linestyle=dashed](-3.14,0.3)(3.14,0.3)
\psline[linestyle=dashed](-3.14,2.3)(3.14,2.3)
\rput(3.6,2.3){$\frac{1}{1-\alpha}$}
\rput(3.6,0.3){$\frac{1}{1+\alpha}$}

\rput(3.14, -0.35){$\pi$}
\rput(1.62, -0.35){$\pi/2$}
\rput(-1.62, -0.35){$-\pi/2$}
\rput(-3.14, -0.35){$-\pi$}
\rput(0, -0.35){$0$}

\end{pspicture}`,
  ],
  [
    'draggable vector',
    String.raw`\begin{pspicture}(-2,-2)(2,2)
\psframe(-2,-2)(2,2)
\userline[linewidth=2pt,linecolor=green]{->}(0,0)(2,2){-x}{-y}
\userline[linewidth=2pt,linecolor=red]{->}(0,0)(2,2){0}{y}
\userline[linewidth=2pt,linecolor=purple]{->}(0,0)(2,2){-x}{cos(y)}
\end{pspicture}`,
  ],
  [
    'math + theorem',
    String.raw`Let's get to the point. The core of PSTricks is graphics!

$$\frac{\delta}{\delta u} \int_{birth}^{death} f(life) du = \mbox{your life}$$

\begin{theorem}
If you know \LaTeX, you can already author interactive diagrams.
\end{theorem}

\begin{proof}
Drag the vectors above with your mouse or touch.
\end{proof}

\begin{enumerate}
\item \emph{first} item
\item \textbf{second} item with an \href{https://latex2js.com}{inline link}
\end{enumerate}`,
  ],
  [
    'new commands demo',
    String.raw`\psset{unit=0.75cm}
\begin{pspicture}(0,0)(12,8)
\psgrid(0,0)(12,8)
\psdots(1,1)(2,2)(3,3)
\psellipse[fillstyle=solid,fillcolor=lightblue](4,6)(1.5,0.75)
\psbezier(6,1)(7,3)(8,3)(9,1)
\pscurve(0.5,6)(1.5,7)(2.5,6.5)(3.5,7.5)
\psccurve(5,4)(6,5)(7,4)(8,5)
\pswedge[fillstyle=solid,fillcolor=gray!40](10,5.5){1.25}{0}{90}
\pscircle*(1,7.5){0.4}
\psframe*[fillcolor=red](4,1)(6,2)
\pspolygon*(9,6.5)(10,7.5)(11,6.5)
\pscustom[fillstyle=solid,fillcolor=gray!40,linestyle=none]{
  \psline(0,0)(2,1.5)
  \psline(2,1.5)(4,0)
  \psline(4,0)(2,-1.5)
  \psline(2,-1.5)(0,0)
}
\multido{\i=0+1}{6}{\psline[linecolor=blue](\i,4.5)(\i,5.5)}
\end{pspicture}`,
  ],
];

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ---- diagnostics (parser AST breakdown) -------------------------------

function showDiagnostics(tex: string): void {
  const lines: string[] = [];
  try {
    const latex = new LaTeX2JS();
    const envs = latex.parse(tex);
    lines.push(`${envs.length} environment(s): ${envs.map((e) => e.type).join(', ')}`);
    (latex.lastDiagnostics || []).forEach((d) => {
      lines.push(`${d.severity.toUpperCase()}: ${d.message}${d.line ? ` @${d.line}:${d.column}` : ''}`);
    });
    envs.forEach((e) => {
      if (e.type === 'pspicture') {
        const keys = Object.keys(e.plot).filter((k) => e.plot[k].length);
        lines.push(`  pspicture  plot: ${keys.length ? keys.join(', ') : '(empty)'}`);
        const ordered = e.env?.elements?.map((el: any) => el.name);
        if (ordered?.length) lines.push(`  pspicture  order: ${ordered.join(', ')}`);
        const sliders = e.env?.sliders;
        if (sliders?.length) lines.push(`  pspicture  sliders: ${sliders.map((s: any) => `${s.variable}=${s.value}`).join(', ')}`);
      } else if (e.type === 'math' && e.lines.length) {
        lines.push(`  math       ${e.lines.length} line(s)`);
      }
    });
  } catch (err: any) {
    lines.push(`parse error: ${err?.message ?? err}`);
  }
  diagnostics.innerHTML = lines.map((l) => `<div class="diag ${l.startsWith('ERROR') ? 'diag-error' : ''}">${escapeHtml(l)}</div>`).join('');
}

// ---- rendering ---------------------------------------------------------

function renderAll(): void {
  const tex = editor.value;
  showDiagnostics(tex);
  output.innerHTML = '';
  try {
    render(tex, (div) => {
      output.appendChild(div);
      const mj = (window as any).MathJax;
      if (mj && mj.typesetPromise) {
        mj.typesetPromise([output]).catch((err: any) => console.error('MathJax typeset failed', err));
      }
    });
  } catch (err: any) {
    const pre = document.createElement('pre');
    pre.className = 'render-error';
    pre.textContent = `render error: ${err?.stack ?? err?.message ?? err}`;
    output.appendChild(pre);
  }
}

// ---- debounce + shareable hash ----------------------------------------

let timer: number | undefined;
function scheduleRender(): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    renderAll();
    syncHash();
  }, 250);
}

function syncHash(): void {
  const encoded = btoa(unescape(encodeURIComponent(editor.value)));
  history.replaceState(null, '', `#${encoded}`);
}

function readHash(): string | null {
  const hash = location.hash.slice(1);
  if (!hash) return null;
  try {
    return decodeURIComponent(escape(atob(hash)));
  } catch {
    return null;
  }
}

// ---- boot --------------------------------------------------------------

function loadExample(tex: string): void {
  editor.value = tex;
  renderAll();
  syncHash();
}

EXAMPLES.forEach(([label, tex]) => {
  const btn = document.createElement('button');
  btn.className = 'example-btn';
  btn.textContent = label;
  btn.addEventListener('click', () => loadExample(tex));
  exampleBar.appendChild(btn);
});

editor.addEventListener('input', scheduleRender);

const shared = readHash();
if (shared) {
  editor.value = shared;
} else {
  loadExample(EXAMPLES[0][1]);
}
renderAll();

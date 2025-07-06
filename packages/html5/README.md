# latex2html5

Pure HTML5 implementation for LaTeX rendering with automatic discovery and bundled JavaScript distribution. Perfect for vanilla HTML pages and simple integrations.

## Installation

### NPM Package

```bash
npm install latex2html5
```

## Features

- **Zero Dependencies**: Works with pure HTML - no build tools required
- **Automatic Discovery**: Finds and renders LaTeX content automatically
- **Bundled Distribution**: Single JS file includes everything needed
- **Interactive Graphics**: PSTricks support with sliders and animations
- **Mathematical Notation**: Integrated MathJax rendering
- **Multiple Environments**: Support for various LaTeX environments
- **Easy Integration**: Drop-in solution for any website

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <title>LaTeX2JS Example</title>
  <link rel="stylesheet" href="path/to/latex2js.css">
  <script src="path/to/latex2html5.bundle.js"></script>
</head>
<body>
  <h1>Mathematical Document</h1>
  
  <script type="text/latex">
  Here is some great equation:

  $$x = \frac{{-b \pm \sqrt{b^2-4ac}}}{{2a}}$$

  And now for a great diagram:

  \begin{pspicture}(0,-3)(8,3)
  \rput(0,0){$x(t)$}
  \rput(4,1.5){$f(t)$}
  \rput(4,-1.5){$g(t)$}
  \rput(8.2,0){$y(t)$}
  \rput(1.5,-2){$h(t)$}
  \psframe(1,-2.5)(7,2.5)
  \psframe(3,1)(5,2)
  \psframe(3,-1)(5,-2)
  \rput(4,0){$X_k = \frac{1}{p} \sum \limits_{n=\langle p\rangle}x(n)e^{-ik\omega_0n}$}
  \psline{->}(0.5,0)(1.5,0)
  \psline{->}(1.5,1.5)(3,1.5)
  \psline{->}(1.5,-1.5)(3,-1.5)
  \psline{->}(6.5,1.5)(6.5,0.25)
  \psline{->}(6.5,-1.5)(6.5,-0.25)
  \psline{->}(6.75,0)(7.75,0)
  \psline(1.5,-1.5)(1.5,1.5)
  \psline(5,1.5)(6.5,1.5)
  \psline(5,-1.5)(6.5,-1.5)
  \psline(6,-1.5)(6.5,-1.5)
  \pscircle(6.5,0){0.25}
  \psline(6.25,0)(6.75,0)
  \psline(6.5,0.5)(6.5,-0.5)
  \end{pspicture}
  </script>

  <script type="text/latex">
  \begin{nicebox}[title=Theorem]
  For any continuous function $f$ on $[a,b]$:
  $$\int_a^b f(x) dx = F(b) - F(a)$$
  where $F'(x) = f(x)$.
  \end{nicebox}
  </script>

  <script>
    LaTeX2HTML5.init();
  </script>
</body>
</html>
```

### Method 2: `init` and `render` methods

```javascript
import { init, render } from 'latex2html5';

// Auto-discover and render all LaTeX content
init();

// Or render specific content
const content = `
Here is some great equation:

$$x = \frac{{-b \pm \sqrt{b^2-4ac}}}{{2a}}$$

And now for a great diagram:

\begin{pspicture}(0,-3)(8,3)
\rput(0,0){$x(t)$}
\rput(4,1.5){$f(t)$}
\rput(4,-1.5){$g(t)$}
\rput(8.2,0){$y(t)$}
\rput(1.5,-2){$h(t)$}
\psframe(1,-2.5)(7,2.5)
\psframe(3,1)(5,2)
\psframe(3,-1)(5,-2)
\rput(4,0){$X_k = \frac{1}{p} \sum \limits_{n=\langle p\rangle}x(n)e^{-ik\omega_0n}$}
\psline{->}(0.5,0)(1.5,0)
\psline{->}(1.5,1.5)(3,1.5)
\psline{->}(1.5,-1.5)(3,-1.5)
\psline{->}(6.5,1.5)(6.5,0.25)
\psline{->}(6.5,-1.5)(6.5,-0.25)
\psline{->}(6.75,0)(7.75,0)
\psline(1.5,-1.5)(1.5,1.5)
\psline(5,1.5)(6.5,1.5)
\psline(5,-1.5)(6.5,-1.5)
\psline(6,-1.5)(6.5,-1.5)
\pscircle(6.5,0){0.25}
\psline(6.25,0)(6.75,0)
\psline(6.5,0.5)(6.5,-0.5)
\end{pspicture}
`;

render(content, document.getElementById('target'));
```

## Usage Examples

### Automatic Content Discovery

```html
<!-- LaTeX content is automatically discovered and rendered -->
<script type="text/latex">
Here is some great equation:

$$x = \frac{{-b \pm \sqrt{b^2-4ac}}}{{2a}}$$

And now for a great diagram:

\begin{pspicture}(0,-3)(8,3)
\rput(0,0){$x(t)$}
\rput(4,1.5){$f(t)$}
\rput(4,-1.5){$g(t)$}
\rput(8.2,0){$y(t)$}
\rput(1.5,-2){$h(t)$}
\psframe(1,-2.5)(7,2.5)
\psframe(3,1)(5,2)
\psframe(3,-1)(5,-2)
\rput(4,0){$X_k = \frac{1}{p} \sum \limits_{n=\langle p\rangle}x(n)e^{-ik\omega_0n}$}
\psline{->}(0.5,0)(1.5,0)
\psline{->}(1.5,1.5)(3,1.5)
\psline{->}(1.5,-1.5)(3,-1.5)
\psline{->}(6.5,1.5)(6.5,0.25)
\psline{->}(6.5,-1.5)(6.5,-0.25)
\psline{->}(6.75,0)(7.75,0)
\psline(1.5,-1.5)(1.5,1.5)
\psline(5,1.5)(6.5,1.5)
\psline(5,-1.5)(6.5,-1.5)
\psline(6,-1.5)(6.5,-1.5)
\pscircle(6.5,0){0.25}
\psline(6.25,0)(6.75,0)
\psline(6.5,0.5)(6.5,-0.5)
\end{pspicture}
</script>

<script>
  LaTeX2HTML5.init(); // Renders all LaTeX content
</script>
```
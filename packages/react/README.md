# latex2react

React components for LaTeX rendering with support for mathematical notation, PSTricks graphics, and interactive elements.

## Installation

```bash
npm install latex2react
```

## Features

- **React Integration**: Native React components with proper lifecycle management
- **LaTeX Rendering**: Complete LaTeX document and expression support
- **Interactive Graphics**: PSTricks support with sliders and animations
- **Mathematical Notation**: Seamless MathJax integration

## Basic Usage

```jsx
import React from 'react';
import { LaTeX } from 'latex2react';

const content = String.raw`
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

function App() {
  return (
    <LaTeX content={content} />
  );
}

export default App;
```

## API Reference

### LaTeX Component

The main component for rendering LaTeX content:

```jsx
import { LaTeX } from 'latex2react';

<LaTeX
  content={latexString}        // LaTeX content to render
  macros={macroDefinitions}    // Optional: Custom macros
  className="custom-class"     // Optional: CSS class
  style={styleObject}          // Optional: Inline styles
  onRender={(element) => {}}   // Optional: Callback after rendering
  onError={(error) => {}}      // Optional: Error handler
/>
```

#### Props

- **content** (string, required): LaTeX content to render
- **macros** (string, optional): Custom macro definitions
- **className** (string, optional): CSS class name
- **style** (object, optional): React style object
- **onRender** (function, optional): Called after successful rendering
- **onError** (function, optional): Called if rendering fails
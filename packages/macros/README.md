# @latex2js/macros

A comprehensive collection of LaTeX macro definitions for mathematical notation, providing shortcuts and enhancements for mathematical typesetting in LaTeX2JS.

## Installation

```bash
npm install @latex2js/macros
```

## Features

- **Transform Pairs**: Fourier, Z-transform, and Laplace transform notation
- **Mathematical Symbols**: Extended collection of mathematical operators and symbols
- **Set Theory**: Comprehensive set theory notation and operators
- **Category Theory**: Morphisms, functors, and categorical constructs
- **Theorem Environments**: Shortcuts for theorem, lemma, proposition, and proof environments
- **Typography**: Enhanced spacing and formatting for mathematical expressions

## Usage

### Basic Import

```typescript
import macros from '@latex2js/macros';

// The macros are provided as a template string
console.log(typeof macros); // 'string'
```

### Integration with LaTeX2JS

```typescript
import { LaTeX2HTML5 } from 'latex2js';
import macros from '@latex2js/macros';

// Initialize with macros
const parser = new LaTeX2HTML5();
parser.addMacros(macros);
```

### Integration with MathJax

```javascript
import macros from '@latex2js/macros';

// Configure MathJax with the macros
window.MathJax = {
  tex: {
    macros: macros
  }
};
```

## Available Macros

### Transform Pairs

Perfect for signal processing and mathematical analysis:

```latex
% Fourier Transform
$$\mathscr{F}\{f(t)\} = F(\omega)$$
$$f(t) \FTpair F(\omega)$$

% Z-Transform  
$$\mathscr{Z}\{x[n]\} = X(z)$$
$$x[n] \ZTpair X(z)$$

% Laplace Transform
$$\mathscr{L}\{f(t)\} = F(s)$$
$$f(t) \LTpair F(s)$$
```

### Mathematical Operators

Extended mathematical notation:

```latex
% Enhanced operators
$$\E[X]$$           % Expectation
$$\Var(X)$$         % Variance
$$\Cov(X,Y)$$       % Covariance
$$\argmax_x f(x)$$  % Argument maximum
$$\argmin_x f(x)$$  % Argument minimum
```

### Set Theory

Comprehensive set operations:

```latex
% Set operations
$$A \intersection B$$   % Intersection
$$A \union B$$         % Union
$$A \setminus B$$      % Set difference
$$\powerset{A}$$       % Power set
$$A \symdiff B$$       % Symmetric difference
```

### Category Theory

Advanced categorical constructs:

```latex
% Category theory
$$\Hom(A, B)$$         % Hom-set
$$A \iso B$$           % Isomorphism
$$f \colon A \to B$$   % Morphism notation
$$\End(A)$$            % Endomorphisms
$$\Aut(A)$$            % Automorphisms
```

### Theorem Environments

Shortcuts for mathematical writing:

```latex
\begin{thm}[Fundamental Theorem]
Every continuous function on a closed interval is uniformly continuous.
\end{thm}

\begin{lem}
This is a supporting lemma.
\end{lem}

\begin{prop}
This is a proposition.
\end{prop}

\begin{proof}
The proof follows from the definition.
\end{proof}
```

### Typography Enhancements

Improved spacing and formatting:

```latex
% Enhanced spacing
$$a \,+\, b$$          % Thin spaces around operators
$$\int_a^b f(x) \dd x$$ % Proper differential notation
$$\vec{v} \cdot \vec{u}$$ % Vector notation
```

## Complete Macro List

The package includes over 140 macro definitions covering:

- **Analysis**: Real and complex analysis notation
- **Algebra**: Group theory, ring theory, field theory
- **Topology**: Topological spaces and continuous maps
- **Probability**: Probability theory and statistics
- **Logic**: Logical operators and quantifiers
- **Geometry**: Geometric constructions and notation
- **Computer Science**: Algorithms and complexity theory

## Integration Examples

### With React Components

```jsx
import { LaTeX } from 'latex2react';
import macros from '@latex2js/macros';

function MathDocument() {
  const content = `
    \\begin{thm}[Fourier Transform]
    For any function $f \\in L^1(\\mathbb{R})$:
    $$f(t) \\FTpair F(\\omega) = \\int_{-\\infty}^{\\infty} f(t) e^{-i\\omega t} \\dd t$$
    \\end{thm}
  `;
  
  return <LaTeX content={content} macros={macros} />;
}
```

### With Vue Components

```vue
<template>
  <latex :content="mathContent" :macros="macros" />
</template>

<script>
import macros from '@latex2js/macros';

export default {
  data() {
    return {
      macros,
      mathContent: `
        $$\\E[X] = \\int_{-\\infty}^{\\infty} x f_X(x) \\dd x$$
      `
    };
  }
};
</script>
```

### With HTML5 Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="path/to/latex2html5.bundle.js"></script>
</head>
<body>
  <script type="text/latex">
    \begin{thm}
    The Pythagorean theorem: $a^2 + b^2 = c^2$
    \end{thm}
  </script>
  
  <script>
    // Macros are automatically included in the HTML5 bundle
    LaTeX2HTML5.init();
  </script>
</body>
</html>
```
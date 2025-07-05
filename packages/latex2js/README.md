# latex2js

The core LaTeX parsing and rendering engine for LaTeX2JS. This package provides the fundamental LaTeX-to-HTML conversion functionality with support for mathematical notation, environments, and PSTricks graphics.

## Installation

```bash
npm install latex2js
```

## Features

- **Complete LaTeX Parser**: Handles LaTeX documents, environments, and commands
- **Mathematical Notation**: Seamless integration with MathJax for math rendering
- **PSTricks Graphics**: Full support for interactive PSTricks diagrams
- **Environment Support**: Built-in support for common LaTeX environments
- **Extensible Architecture**: Plugin system for custom environments and commands
- **Header Management**: Automatic processing of LaTeX document headers
- **Text Processing**: Advanced text formatting and structure handling

## API Reference

### LaTeX2HTML5 Class

The main parser class for converting LaTeX to HTML:

```typescript
import { LaTeX2HTML5 } from 'latex2js';

const parser = new LaTeX2HTML5();
const html = parser.parse(latexContent);
```

#### Methods

```typescript
// Parse LaTeX content to HTML
parse(latex: string): string

// Add custom macros
addMacros(macros: string): void

// Parse specific environments
parseEnvironment(envName: string, content: string): string

// Process headers and metadata
processHeaders(latex: string): HeaderInfo
```

## Usage Examples

### Basic Document Parsing

```typescript
import { LaTeX2HTML5 } from 'latex2js';

const parser = new LaTeX2HTML5();

const latexDocument = `
The quadratic formula is:
$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$

\\begin{pspicture}(-1,-1)(1,1)
  \\pscircle(0,0){0.8}
  \\rput(0,0){Circle}
\\end{pspicture}
`;

const parsed = parser.parse(latexDocument);
```

### Custom Macros Integration

```typescript
import { LaTeX2HTML5 } from 'latex2js';
import macros from '@latex2js/macros';

const parser = new LaTeX2HTML5();

// Add predefined macros
parser.addMacros(macros);

// Add custom macros
const customMacros = `
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\norm}[1]{\\left\\|#1\\right\\|}
\\newcommand{\\abs}[1]{\\left|#1\\right|}
`;

parser.addMacros(customMacros);

const content = `
For any vector $\\vec{v} \\in \\R^n$, we have:
$$\\norm{\\vec{v}} = \\sqrt{\\sum_{i=1}^n v_i^2}$$

And for any real number $x \\in \\R$:
$$\\abs{x} = \\begin{cases}
x & \\text{if } x \\geq 0 \\\\
-x & \\text{if } x < 0
\\end{cases}$$
`;

const result = parser.parse(content);
```

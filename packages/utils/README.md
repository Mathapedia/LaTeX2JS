# @latex2js/utils

Core utility functions for LaTeX parsing, SVG manipulation, and mathematical computations used throughout the LaTeX2JS ecosystem.

## Installation

```bash
npm install @latex2js/utils
```

## Features

- **String Processing**: Advanced pattern matching and replacement utilities
- **Unit Conversion**: Convert between different measurement units (px, em, pt, cm, etc.)
- **Coordinate Transformation**: Mathematical coordinate system transformations
- **Mathematical Evaluation**: Safe evaluation of mathematical expressions
- **SVG Manipulation**: D3-like interface for SVG DOM manipulation
- **LaTeX Parsing**: Utilities for parsing LaTeX options and arrows

## API Reference

### String Utilities

```typescript
import { simplerepl, matchrepl } from '@latex2js/utils';

// Simple string replacement
const result = simplerepl(text, 'pattern', 'replacement');

// Pattern matching with capture groups
const result = matchrepl(text, /(\w+)=(\w+)/, (match, key, value) => {
  return `${key}: ${value}`;
});
```

### Unit Conversion

```typescript
import { convertUnits } from '@latex2js/utils';

// Convert units to pixels
const pixels = convertUnits('2cm'); // Returns pixel equivalent
const pixels2 = convertUnits('12pt'); // Returns pixel equivalent
```

### Coordinate Transformation

```typescript
import { X, Y, Xinv, Yinv } from '@latex2js/utils';

// Transform coordinates based on current coordinate system
const screenX = X(mathematicalX);
const screenY = Y(mathematicalY);

// Inverse transformations
const mathX = Xinv(screenX);
const mathY = Yinv(screenY);
```

### Mathematical Expression Evaluation

```typescript
import { evaluate } from '@latex2js/utils';

// Safely evaluate mathematical expressions
const result = evaluate('2 * pi + sin(pi/4)');
const result2 = evaluate('sqrt(16) + log(e)');
```

### SVG Manipulation

```typescript
import { select, SVGSelection } from '@latex2js/utils';

// D3-like interface for SVG manipulation
const svg = select(svgElement);

svg.append('line')
   .attr('x1', 0)
   .attr('y1', 0)
   .attr('x2', 100)
   .attr('y2', 100)
   .attr('stroke', 'black');

svg.append('circle')
   .attr('cx', 50)
   .attr('cy', 50)
   .attr('r', 25)
   .attr('fill', 'red');
```

### LaTeX Parsing Utilities

```typescript
import { parseOptions, parseArrows } from '@latex2js/utils';

// Parse LaTeX command options
const options = parseOptions('[linecolor=red, fillcolor=blue]');
// Returns: { linecolor: 'red', fillcolor: 'blue' }

// Parse arrow specifications
const arrows = parseArrows('->');
// Returns arrow configuration object
```

## Usage in LaTeX2JS Ecosystem

This package serves as the foundation for all other LaTeX2JS packages:

- **@latex2js/settings**: Uses utilities for option parsing and unit conversion
- **@latex2js/pstricks**: Heavily relies on coordinate transformation and SVG manipulation
- **latex2js**: Uses string processing utilities for LaTeX parsing
- **@latex2js/html5**: Uses SVG utilities for rendering graphics

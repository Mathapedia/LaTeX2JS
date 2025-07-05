# @latex2js/pstricks

PSTricks graphics extension for LaTeX2JS, enabling interactive mathematical graphics, plots, and diagrams in web browsers.

## Installation

```bash
npm install @latex2js/pstricks
```

## Features

- **Complete PSTricks Support**: Lines, circles, polygons, frames, and complex shapes
- **Interactive Elements**: Sliders, user variables, and dynamic graphics
- **Mathematical Plotting**: Function plots with mathematical expression evaluation
- **Coordinate Systems**: Multiple coordinate systems and transformations
- **Custom Graphics**: Arrows, patterns, and styling options
- **Real-time Rendering**: SVG-based graphics with smooth animations

## API Reference

### Main Components

```typescript
import { pstricks, psgraph, arrow } from '@latex2js/pstricks';

// Main PSTricks processor
pstricks.process(latexCode, options);

// Graph-specific functionality
psgraph.plot(expression, domain);

// Arrow utilities
arrow.create(type, style);
``
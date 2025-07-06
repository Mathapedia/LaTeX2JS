# LaTeX2JS

![LaTeX2JS](https://latex2js.com/assets/images/photo.png)

Author interactive math equations and diagrams online using LaTeX and PSTricks

Author real LaTeX+PSTricks in React, Vue.js, or pure HTML5.

## Quick Start

```sh
npm install latex2html5
npm install latex2vue
npm install latex2react
```

## Resources

- [LaTeX2JS website](https://latex2js.com)
- [Example Diagrams](https://latex2js.com/examples)
- [Installation Guide](https://latex2js.com/installation)
- [Original Video](http://www.youtube.com/watch?v=QYMLMUKJyFc)

## Core Packages

These are the main packages for rendering LaTeX content:

| Package | Description |
|---------|-------------|
| [latex2js](packages/latex2js) | Core LaTeX parsing and rendering engine with environment support |
| [latex2html5](packages/html5) | Pure HTML5 implementation with automatic discovery and bundled JavaScript distribution |
| [latex2react](packages/react) | React components for LaTeX rendering with interactive graphics and mathematical notation |
| [latex2vue](packages/vue) | Vue.js components for LaTeX rendering with Composition API and SSR support |

## MathJax Integration

If you just want to render equations using MathJax:

| Package | Description |
|---------|-------------|
| [mathjaxjs](packages/mathjaxjs) | Pure HTML5 MathJax loading utilities for mathematical notation rendering |
| [mathjaxjs-react](packages/mathjaxjs-react) | React wrapper and provider for MathJax with modern hooks-based architecture |

## Advanced Packages

Internal utilities for extending functionality:

| Package | Description |
|---------|-------------|
| [@latex2js/utils](packages/utils) | Core utilities for string processing, coordinate transformations, and SVG manipulation |
| [@latex2js/settings](packages/settings) | Configuration management for PSTricks graphics settings and parameters |
| [@latex2js/macros](packages/macros) | Comprehensive collection of LaTeX macro definitions for mathematical notation |
| [@latex2js/pstricks](packages/pstricks) | PSTricks graphics engine with interactive elements and coordinate system support |

## Credits

As always, BIG thanks to [MathJax](https://www.mathjax.org)

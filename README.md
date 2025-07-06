# LaTeX2JS

![LaTeX2JS](https://latex2js.com/assets/images/photo.png)

Author interactive math equations and diagrams online using LaTeX and PSTricks

Author real LaTeX+PSTricks in React, Vue.js, or pure HTML5.

```sh
npm install latex2html5
npm install latex2vue
npm install latex2react
```

[LaTeX2JS website](https://latex2js.com)

[Example Diagrams](https://latex2js.com/examples)

[Installation](https://latex2js.com/installation)

[Original Video](http://www.youtube.com/watch?v=QYMLMUKJyFc)

## Packages

These are the relevant packages for usage:

| Package | Description | Documentation |
|---------|-------------|---------------|
| [latex2js](packages/latex2js) | Core LaTeX parsing and rendering engine with environment support | [README](packages/latex2js/README.md) |
| [latex2html5](packages/html5) | Pure HTML5 implementation with automatic discovery and bundled JavaScript distribution | [README](packages/html5/README.md) |
| [latex2react](packages/react) | React components for LaTeX rendering with interactive graphics and mathematical notation | [README](packages/react/README.md) |
| [latex2vue](packages/vue) | Vue.js components for LaTeX rendering with Composition API and SSR support | [README](packages/vue/README.md) |

## MathJax Packages

If you just want to render equations using MathJax:

| Package | Description | Documentation |
|---------|-------------|---------------|
| [mathjaxjs](packages/mathjaxjs) | Pure HTML5 MathJax loading utilities for mathematical notation rendering | [README](packages/mathjaxjs/README.md) |
| [mathjaxjs-react](packages/mathjaxjs-react) | React wrapper and provider for MathJax with modern hooks-based architecture | [README](packages/mathjaxjs-react/README.md) |

## Internal Utility Packages

Other utilties for internal usage:

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@latex2js/utils](packages/utils) | Core utilities for string processing, coordinate transformations, and SVG manipulation | [README](packages/utils/README.md) |
| [@latex2js/settings](packages/settings) | Configuration management for PSTricks graphics settings and parameters | [README](packages/settings/README.md) |
| [@latex2js/macros](packages/macros) | Comprehensive collection of LaTeX macro definitions for mathematical notation | [README](packages/macros/README.md) |
| [@latex2js/pstricks](packages/pstricks) | PSTricks graphics engine with interactive elements and coordinate system support | [README](packages/pstricks/README.md) |

## Credits

As always, BIG thanks to [MathJax](https://www.mathjax.org)

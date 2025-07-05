# LaTeX2JS

Author interactive math equations and diagrams online using LaTeX and PSTricks

Author real LaTeX+PSTricks in React, Vue.js, or pure HTML5.

```sh
npm install @latex2js/html5
npm install @latex2js/vue
npm install @latex2js/react
```

[LaTeX2JS website](https://latex2js.com)

[Example Diagrams](https://latex2js.com/examples)

[Github Examples](https://github.com/Mathapedia/LaTeX2JS/tree/master/examples)

[Installation](https://latex2js.com/installation)

[Original Video](http://www.youtube.com/watch?v=QYMLMUKJyFc)

## Packages

This monorepo contains the following packages:

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@latex2js/utils](packages/utils) | Core utilities for string processing, coordinate transformations, and SVG manipulation | [README](packages/utils/README.md) |
| [@latex2js/settings](packages/settings) | Configuration management for PSTricks graphics settings and parameters | [README](packages/settings/README.md) |
| [@latex2js/macros](packages/macros) | Comprehensive collection of LaTeX macro definitions for mathematical notation | [README](packages/macros/README.md) |
| [mathjaxjs](packages/mathjaxjs) | Pure HTML5 MathJax loading utilities for mathematical notation rendering | [README](packages/mathjaxjs/README.md) |
| [mathjaxjs-react](packages/mathjaxjs-react) | React wrapper and provider for MathJax with modern hooks-based architecture | [README](packages/mathjaxjs-react/README.md) |
| [@latex2js/pstricks](packages/pstricks) | PSTricks graphics engine with interactive elements and coordinate system support | [README](packages/pstricks/README.md) |
| [latex2js](packages/latex2js) | Core LaTeX parsing and rendering engine with environment support | [README](packages/latex2js/README.md) |
| [@latex2js/html5](packages/html5) | Pure HTML5 implementation with automatic discovery and bundled JavaScript distribution | [README](packages/html5/README.md) |
| [@latex2js/react](packages/react) | React components for LaTeX rendering with interactive graphics and mathematical notation | [README](packages/react/README.md) |
| [@latex2js/vue](packages/vue) | Vue.js components for LaTeX rendering with Composition API and SSR support | [README](packages/vue/README.md) |

## About

The loose structure and nature of user interface design poses a problem for documenting science and related interfaces in a consistent manner. TeX provides us with some "laws" to obey in order to design the output of a text and graphical language around. Hence, we can attempt to create a synthesis of a structured user interface specification (TeX) and a structured functional specification (HTML5) to provide a publishing platform for the current and next generation.

The Art is where we can blend these two standards bodies; higher levels of abstraction allow people to express their ideas without having to worry about the mechanisms by which the technology is rendering their works. It is in these environments when people can express themselves freely.

![LaTeX2JS](https://latex2js.com/assets/images/photo.png)

As always, BIG thanks to [MathJax](https://www.mathjax.org)

# mathjaxjs

Pure HTML5 MathJax loading utilities without React dependencies. This package provides a simple way to load and configure MathJax v3 for LaTeX mathematical notation rendering in web applications.

## Installation

```bash
npm install mathjaxjs
```

## Features

- **Framework Agnostic**: Works with any JavaScript framework or vanilla HTML
- **Async Loading**: Non-blocking MathJax loading from CDN
- **Configurable**: Customizable MathJax configuration
- **Lightweight**: Minimal dependencies

## API Reference

### loadMathJax()

Asynchronously loads MathJax from CDN with configuration:

```javascript
import { loadMathJax } from 'mathjaxjs';

// Load with default configuration
await loadMathJax();

// Load with custom configuration
await loadMathJax({
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    macros: {
      RR: "\\mathbb{R}",
      ZZ: "\\mathbb{Z}"
    }
  },
  svg: {
    fontCache: 'global'
  }
});
```

### getMathJax()

Returns the current MathJax instance:

```javascript
import { getMathJax } from 'mathjaxjs';

// Get MathJax instance (after loading)
const MathJax = getMathJax();

if (MathJax) {
  // Manually typeset content
  MathJax.typesetPromise([element]);
  
  // Re-render all math
  MathJax.typesetPromise();
}
```

### DEFAULT_CONFIG

The default MathJax configuration object:

```javascript
import { DEFAULT_CONFIG } from 'mathjaxjs';

console.log(DEFAULT_CONFIG);
// Output: Default MathJax v3 configuration
```

## Usage Examples

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>MathJax Example</title>
</head>
<body>
  <div id="math-content">
    <p>Inline math: $E = mc^2$</p>
    <p>Display math: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$</p>
  </div>

  <script type="module">
    import { loadMathJax } from 'mathjaxjs';
    
    // Load MathJax and automatically typeset page
    await loadMathJax();
  </script>
</body>
</html>
```

### Dynamic Content

```javascript
import { loadMathJax, getMathJax } from 'mathjaxjs';

// Initialize MathJax
await loadMathJax();

// Function to add mathematical content dynamically
function addMathContent(container, latexString) {
  const mathElement = document.createElement('div');
  mathElement.innerHTML = `$$${latexString}$$`;
  container.appendChild(mathElement);
  
  // Typeset the new content
  const MathJax = getMathJax();
  if (MathJax) {
    MathJax.typesetPromise([mathElement]);
  }
}

// Usage
const container = document.getElementById('math-container');
addMathContent(container, '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}');
```

### Custom Configuration

```javascript
import { loadMathJax } from 'mathjaxjs';

const customConfig = {
  tex: {
    // Enable additional packages
    packages: ['base', 'ams', 'physics', 'color'],
    
    // Custom macros
    macros: {
      // Vectors
      'vb': ['\\mathbf{#1}', 1],
      'va': ['\\vec{#1}', 1],
      
      // Common sets
      'R': '\\mathbb{R}',
      'N': '\\mathbb{N}',
      'Z': '\\mathbb{Z}',
      'Q': '\\mathbb{Q}',
      'C': '\\mathbb{C}',
      
      // Derivatives
      'dd': ['\\,\\mathrm{d}#1', 1],
      'dv': ['\\frac{\\mathrm{d}#1}{\\mathrm{d}#2}', 2],
      'pdv': ['\\frac{\\partial#1}{\\partial#2}', 2]
    },
    
    // Enable tags and labels
    tags: 'ams',
    
    // Process dollar delimiters
    processEscapes: true
  },
  
  // SVG output configuration
  svg: {
    fontCache: 'global',
    displayAlign: 'center',
    displayIndent: '0em'
  },
  
  // Startup configuration
  startup: {
    ready: () => {
      console.log('MathJax is ready!');
    }
  }
};

await loadMathJax(customConfig);
```
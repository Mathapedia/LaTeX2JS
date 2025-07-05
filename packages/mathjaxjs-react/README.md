# mathjaxjs-react

React wrapper component for MathJax integration, providing easy LaTeX mathematical notation rendering in React applications.

## Installation

```bash
npm install mathjaxjs-react
```

## Basic Usage

```jsx
import React from 'react';
import { MathJaxProvider } from 'mathjaxjs-react';

function App() {
  return (
    <MathJaxProvider>
      <div>
        <h1>Mathematical Expressions</h1>
        <p>Inline math: $E = mc^2$</p>
        <p>Display math:</p>
        $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
        
        <h2>Quadratic Formula</h2>
        $$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
      </div>
    </MathJaxProvider>
  );
}

export default App;
```

## API Reference

### MathJaxProvider

The main component that loads MathJax and manages typesetting:

```jsx
import { MathJaxProvider } from 'mathjaxjs-react';

<MathJaxProvider
  config={mathJaxConfig}     // Optional: Custom MathJax configuration
  loading={<div>Loading...</div>}  // Optional: Loading component
  error={<div>Error loading MathJax</div>}  // Optional: Error component
>
  {children}
</MathJaxProvider>
```

#### Props

- **config** (optional): MathJax configuration object
- **loading** (optional): React element to show while MathJax loads
- **error** (optional): React element to show if MathJax fails to load
- **children**: React elements containing LaTeX content

## Advanced Usage

### Custom Configuration

```jsx
import { MathJaxProvider } from 'mathjaxjs-react';

const mathJaxConfig = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    macros: {
      RR: "\\mathbb{R}",
      ZZ: "\\mathbb{Z}",
      QQ: "\\mathbb{Q}",
      CC: "\\mathbb{C}",
      NN: "\\mathbb{N}"
    },
    packages: ['base', 'ams', 'physics']
  },
  svg: {
    fontCache: 'global'
  }
};

function MathApp() {
  return (
    <MathJaxProvider config={mathJaxConfig}>
      <div>
        <p>Using custom macros: $x \in \RR$ and $n \in \NN$</p>
        <p>Physics notation: $\ket{\psi} = \alpha\ket{0} + \beta\ket{1}$</p>
      </div>
    </MathJaxProvider>
  );
}
```

### Dynamic Content

```jsx
import React, { useState } from 'react';
import { MathJaxProvider } from 'mathjaxjs-react';

function DynamicMath() {
  const [formula, setFormula] = useState('E = mc^2');
  
  return (
    <MathJaxProvider>
      <div>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="Enter LaTeX formula"
        />
        <div>
          Preview: ${formula}$
        </div>
      </div>
    </MathJaxProvider>
  );
}
```

### Loading and Error States

```jsx
import { MathJaxProvider } from 'mathjaxjs-react';

function CustomStates() {
  const LoadingSpinner = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div>Loading MathJax...</div>
    </div>
  );
  
  const ErrorMessage = () => (
    <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
      Failed to load MathJax. Please check your internet connection.
    </div>
  );
  
  return (
    <MathJaxProvider
      loading={<LoadingSpinner />}
      error={<ErrorMessage />}
    >
      <div>
        <p>Your math content here: $\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$</p>
      </div>
    </MathJaxProvider>
  );
}
```

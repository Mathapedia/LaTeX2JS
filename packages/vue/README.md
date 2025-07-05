# @latex2js/vue

Vue.js components for LaTeX rendering with full support for mathematical notation, PSTricks graphics, and interactive elements.

## Installation

```bash
npm install @latex2js/vue
```

## Features

- **Vue Integration**: Native Vue components with reactive data binding
- **LaTeX Rendering**: Complete LaTeX document and expression support
- **Interactive Graphics**: PSTricks support with sliders and animations
- **Mathematical Notation**: Seamless MathJax integration

## Basic Usage

### Vue 3 with Composition API

```vue
<template>
  <div>
    <h1>Mathematical Document</h1>
    <latex :content="content" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { latex } from '@latex2js/vue';

const content = ref(`
  \\section{Introduction}
  Welcome to LaTeX2JS! Here's the quadratic formula:
  $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$
  
  \\begin{pspicture}(-2,-2)(2,2)
    \\psgrid
    \\psplot[linecolor=red]{-2}{2}{x dup mul}
    \\rput(0,1.5){$y = x^2$}
  \\end{pspicture}
`);
</script>
```

### Vue 3 with Options API

```vue
<template>
  <div>
    <h1>Mathematical Document</h1>
    <latex :content="content" />
  </div>
</template>

<script>
import { latex } from '@latex2js/vue';

export default {
  components: {
    latex
  },
  data() {
    return {
      content: `
        \\section{Introduction}
        Welcome to LaTeX2JS! Here's Euler's identity:
        $$e^{i\\pi} + 1 = 0$$
      `
    };
  }
};
</script>
```

## Installation and Setup

### Vue 3 Plugin Installation

```javascript
import { createApp } from 'vue';
import LaTeX2Vue from '@latex2js/vue';
import App from './App.vue';

const app = createApp(App);
app.use(LaTeX2Vue);
app.mount('#app');
```

### Nuxt.js Plugin

Create `plugins/latex2vue.js`:

```javascript
import LaTeX2Vue from '@latex2js/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(LaTeX2Vue);
});
```

Add to `nuxt.config.js`:

```javascript
export default {
  plugins: [
    { src: '~/plugins/latex2vue.js', mode: 'client' }
  ]
};
```

## API Reference

### latex Component

The main component for rendering LaTeX content:

```vue
<template>
  <latex
    :content="latexString"
    :macros="macroDefinitions"
    :config="mathJaxConfig"
    class="custom-class"
    @render="onRender"
    @error="onError"
  />
</template>
```

#### Props

- **content** (String, required): LaTeX content to render
- **macros** (String, optional): Custom macro definitions  
- **config** (Object, optional): MathJax configuration
- **class** (String, optional): CSS class name
- **style** (Object, optional): Vue style object

#### Events

- **@render**: Emitted after successful rendering with rendered element
- **@error**: Emitted if rendering fails with error object

### Individual Components

For specific LaTeX environments:

```vue
<template>
  <div>
    <!-- PSTricks graphics -->
    <pspicture :content="graphicsContent" />
    
    <!-- Styled information boxes -->
    <nicebox :title="boxTitle" :content="boxContent" />
    
    <!-- Mathematical expressions -->
    <math-display :content="mathExpression" />
    
    <!-- Lists and enumerations -->
    <latex-enumerate :content="listContent" />
    
    <!-- Code blocks -->
    <latex-verbatim :content="codeContent" />
  </div>
</template>
```

## Usage Examples

### Mathematical Documents

```vue
<template>
  <div class="math-document">
    <latex :content="document" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const document = ref(`
  \\title{Advanced Calculus}
  \\author{Dr. Smith}
  \\date{\\today}
  \\maketitle
  
  \\section{Limits and Continuity}
  A function $f$ is continuous at $x = a$ if:
  $$\\lim_{x \\to a} f(x) = f(a)$$
  
  \\begin{theorem}[Intermediate Value Theorem]
  If $f$ is continuous on $[a,b]$ and $f(a) < k < f(b)$, 
  then there exists $c \\in (a,b)$ such that $f(c) = k$.
  \\end{theorem}
`);
</script>
```

### Interactive Graphics

```vue
<template>
  <div>
    <h2>Interactive Sine Wave</h2>
    <div class="controls">
      <label>
        Amplitude: {{ amplitude }}
        <input 
          v-model.number="amplitude"
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1"
        />
      </label>
      <label>
        Frequency: {{ frequency }}
        <input 
          v-model.number="frequency"
          type="range" 
          min="0.1" 
          max="3" 
          step="0.1"
        />
      </label>
    </div>
    <latex :content="plotContent" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const amplitude = ref(1);
const frequency = ref(1);

const plotContent = computed(() => `
  \\begin{pspicture}(-6,-3)(6,3)
    \\userline{amplitude}{0.1}{3}{${amplitude.value}}
    \\userline{frequency}{0.1}{3}{${frequency.value}}
    \\psplot[linecolor=blue]{-6}{6}{amplitude frequency x mul sin mul}
    \\rput(-5,2.5){Amplitude: ${amplitude.value.toFixed(2)}}
    \\rput(-5,2){Frequency: ${frequency.value.toFixed(2)}}
  \\end{pspicture}
`);
</script>
```

### Custom Macros

```vue
<template>
  <latex :content="content" :macros="customMacros" />
</template>

<script setup>
import { ref } from 'vue';
import baseMacros from '@latex2js/macros';

const customMacros = ref(`
  ${baseMacros}
  \\newcommand{\\R}{\\mathbb{R}}
  \\newcommand{\\norm}[1]{\\left\\|#1\\right\\|}
  \\newcommand{\\inner}[2]{\\langle #1, #2 \\rangle}
`);

const content = ref(`
  \\section{Vector Spaces}
  Let $V$ be a vector space over $\\R$. For any $\\vec{v}, \\vec{w} \\in V$:
  
  \\begin{enumerate}
    \\item The norm satisfies: $\\norm{\\vec{v}} \\geq 0$
    \\item Inner product: $\\inner{\\vec{v}}{\\vec{w}} = \\inner{\\vec{w}}{\\vec{v}}$
    \\item Cauchy-Schwarz: $|\\inner{\\vec{v}}{\\vec{w}}| \\leq \\norm{\\vec{v}} \\norm{\\vec{w}}$
  \\end{enumerate}
`);
</script>
```

### Dynamic Content

```vue
<template>
  <div>
    <div class="input-section">
      <label>
        Enter function (LaTeX format): 
        <input 
          v-model="formula"
          type="text" 
          placeholder="x^2 + 2x + 1"
        />
      </label>
    </div>
    <latex :content="latexContent" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const formula = ref('x^2 + 2x + 1');

const latexContent = computed(() => `
  \\section{Function Analysis}
  Consider the function: $f(x) = ${formula.value}$
  
  \\subsection{Graph}
  \\begin{pspicture}(-3,-1)(3,5)
    \\psaxes{->}(0,0)(-3,-1)(3,5)
    \\psplot[linecolor=red]{-3}{3}{x dup mul 2 x mul add 1 add}
    \\rput(0,4.5){$f(x) = ${formula.value}$}
  \\end{pspicture}
`);
</script>
```

### Error Handling

```vue
<template>
  <div>
    <latex 
      :content="content"
      @render="onRenderSuccess"
      @error="onRenderError"
    />
    <div v-if="error" class="error-message">
      Error: {{ error.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const content = ref(`
  \\section{Mathematical Expressions}
  This might contain invalid LaTeX: $\\invalid{command}$
`);

const error = ref(null);

const onRenderSuccess = (element) => {
  console.log('LaTeX rendered successfully:', element);
  error.value = null;
};

const onRenderError = (err) => {
  console.error('LaTeX rendering error:', err);
  error.value = err;
};
</script>
```

## Integration Examples

### With Vue Router

```vue
<template>
  <router-view />
</template>

<script setup>
import { provide } from 'vue';

// Provide global LaTeX configuration
provide('latexConfig', {
  mathJax: {
    tex: {
      inlineMath: [['$', '$']],
      displayMath: [['$$', '$$']],
      packages: ['base', 'ams', 'physics']
    }
  }
});
</script>
```

### With Pinia/Vuex State Management

```vue
<template>
  <div class="math-editor">
    <textarea 
      v-model="editorContent"
      placeholder="Enter LaTeX content..."
    />
    <div class="preview">
      <latex :content="editorContent" :macros="editorMacros" />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/stores/editor';

const editorStore = useEditorStore();
const { content: editorContent, macros: editorMacros } = storeToRefs(editorStore);
</script>
```

### Nuxt.js Integration

```vue
<!-- pages/math.vue -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <client-only>
      <latex :content="content" />
      <template #fallback>
        <div>Loading mathematical content...</div>
      </template>
    </client-only>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Mathematical Content'
});

const { data } = await $fetch('/api/math-content');

const title = ref(data.title);
const content = ref(data.latex);
</script>
```

### Composition API Composable

```javascript
// composables/useLatex.js
import { ref, computed } from 'vue';

export function useLatex(initialContent = '') {
  const content = ref(initialContent);
  const macros = ref('');
  const error = ref(null);
  const isRendering = ref(false);

  const latexWithMacros = computed(() => {
    if (macros.value) {
      return `${macros.value}\n${content.value}`;
    }
    return content.value;
  });

  const setContent = (newContent) => {
    content.value = newContent;
    error.value = null;
  };

  const addMacro = (macroDefinition) => {
    macros.value += `\n${macroDefinition}`;
  };

  const onRender = () => {
    isRendering.value = false;
    error.value = null;
  };

  const onError = (err) => {
    isRendering.value = false;
    error.value = err;
  };

  return {
    content,
    macros,
    error,
    isRendering,
    latexWithMacros,
    setContent,
    addMacro,
    onRender,
    onError
  };
}
```

Usage of the composable:

```vue
<template>
  <div>
    <textarea v-model="content" />
    <latex 
      :content="latexWithMacros"
      @render="onRender"
      @error="onError"
    />
    <div v-if="error">Error: {{ error.message }}</div>
  </div>
</template>

<script setup>
import { useLatex } from '@/composables/useLatex';

const {
  content,
  latexWithMacros,
  error,
  onRender,
  onError,
  addMacro
} = useLatex('Initial LaTeX content');

// Add custom macros
addMacro('\\newcommand{\\R}{\\mathbb{R}}');
</script>
```

## TypeScript Support

```typescript
// types/latex.ts
export interface LaTeXProps {
  content: string;
  macros?: string;
  config?: MathJaxConfig;
  class?: string;
  style?: StyleValue;
}

export interface MathJaxConfig {
  tex?: {
    inlineMath?: string[][];
    displayMath?: string[][];
    packages?: string[];
    macros?: Record<string, string>;
  };
}
```

Component with TypeScript:

```vue
<template>
  <latex 
    :content="content"
    :macros="macros"
    :config="config"
    @render="handleRender"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MathJaxConfig } from '@/types/latex';

interface Props {
  formula: string;
  title?: string;
  interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Mathematical Expression',
  interactive: false
});

const config: MathJaxConfig = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']],
    packages: ['base', 'ams', 'physics']
  }
};

const content = ref(props.interactive 
  ? `\\userline{param}{0}{10}{5}\\psplot{-5}{5}{param x mul}`
  : `$$${props.formula}$$`);

const macros = ref('\\newcommand{\\R}{\\mathbb{R}}');

const handleRender = (element: HTMLElement) => {
  console.log('Rendered:', element);
};

const handleError = (error: Error) => {
  console.error('Error:', error);
};
</script>
```

## Styling

```vue
<style scoped>
/* Component-specific styles */
.latex2js-content {
  font-family: 'Computer Modern', 'Latin Modern Math', serif;
  line-height: 1.6;
  margin: 1em 0;
}

.latex2js-pspicture {
  display: block;
  margin: 1em auto;
  max-width: 100%;
}

.latex2js-nicebox {
  border: 2px solid #42b883;
  border-radius: 8px;
  padding: 1em;
  margin: 1em 0;
  background: linear-gradient(145deg, #f0f9f4, #e8f5ea);
}

/* Responsive design */
@media (max-width: 768px) {
  .latex2js-pspicture {
    max-width: 100vw;
    transform: scale(0.8);
  }
}
</style>

<style>
/* Global styles */
.latex2js-math {
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
```

## Performance Tips

1. **Use v-memo**: For static content that doesn't change
2. **Computed Properties**: For reactive LaTeX content
3. **Lazy Loading**: Use dynamic imports for large content
4. **Component Memoization**: Cache rendered components
5. **Virtual Scrolling**: For lists of mathematical expressions

```vue
<template>
  <!-- Use v-memo for static content -->
  <latex 
    v-memo="[staticContent]"
    :content="staticContent"
  />
  
  <!-- Use computed for reactive content -->
  <latex :content="computedContent" />
</template>

<script setup>
import { ref, computed } from 'vue';

const staticContent = ref('$$E = mc^2$$');
const parameter = ref(1);

const computedContent = computed(() => `
  \\begin{pspicture}(-2,-2)(2,2)
    \\psplot[linecolor=red]{-2}{2}{${parameter.value} x mul}
  \\end{pspicture}
`);
</script>
```

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 60+
- Safari 10.1+
- Edge 79+
- Vue 3.0+ (Composition API support)

## Dependencies

- **vue**: Peer dependency (>=3.0.0)
- **latex2js**: Core parsing engine
- **mathjaxjs**: MathJax integration
- **@latex2js/macros**: Predefined macros
- **@latex2js/pstricks**: Graphics support
- **@latex2js/utils**: Core utilities

## License

See LICENSE file in the repository root.
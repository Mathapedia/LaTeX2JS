# RPUT Implementation Documentation

## Overview

RPUT is a LaTeX command (`\rput(x,y){content}`) that positions mathematical content at specific coordinates within PSTricks graphics. In LaTeX2JS, RPUT elements are rendered as absolutely positioned HTML `div` elements overlaid on SVG graphics.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Parsing Pipeline](#parsing-pipeline)
3. [Coordinate System](#coordinate-system)
4. [Rendering Process](#rendering-process)
5. [CSS and Styling](#css-and-styling)
6. [Bounding Box Calculation](#bounding-box-calculation)
7. [MathJax Integration](#mathjax-integration)
8. [Race Conditions and Timing](#race-conditions-and-timing)
9. [Framework Integration](#framework-integration)
10. [Error Handling](#error-handling)
11. [Performance Considerations](#performance-considerations)
12. [Troubleshooting](#troubleshooting)

## Architecture Overview

```
LaTeX Source → Parser → Coordinate Transform → DOM Creation → MathJax → Positioning → Final Render
     ↓              ↓                ↓               ↓           ↓            ↓
\rput(1,2){$x$} → {x:1,y:2,text} → {x:50px,y:75px} → <div> → Process → Center → Visible
```

### Key Components

- **Parser**: `/packages/pstricks/src/lib/pstricks.ts` - Extracts RPUT commands
- **Renderer**: `/packages/pstricks/src/lib/psgraph.ts` - Creates and positions DOM elements
- **Coordinate System**: Mathematical → Screen coordinate transformation
- **MathJax Integration**: Asynchronous mathematical content processing

## Parsing Pipeline

### 1. Pattern Recognition

```typescript
// Location: /packages/pstricks/src/lib/pstricks.ts:63
rput: /\\rput\((.*),(.*)\)\{(.*)\}/
```

### 2. Parsing Function

```typescript
// Location: /packages/pstricks/src/lib/pstricks.ts:469-475
rput(this: PSTricksContext, m: any) {
  return {
    x: X.call(this, m[1]),  // Transform x coordinate
    y: Y.call(this, m[2]),  // Transform y coordinate  
    text: m[3]              // Math/text content
  };
}
```

### 3. Data Storage

Parsed RPUT elements are stored in `this.plot.rput[]` array for later rendering.

## Coordinate System

### Mathematical Coordinates (LaTeX)
- **Origin**: Bottom-left corner
- **X-axis**: Left to right (positive →)
- **Y-axis**: Bottom to top (positive ↑)

### Screen Coordinates (HTML/CSS)
- **Origin**: Top-left corner
- **X-axis**: Left to right (positive →)
- **Y-axis**: Top to bottom (positive ↓)

### Transformation Functions

```typescript
// X coordinate transformation
X(v) { 
  return (this.w - (this.x1 - Number(v))) * this.xunit; 
}

// Y coordinate transformation (inverted)
Y(v) { 
  return (this.y1 - Number(v)) * this.yunit; 
}
```

### Coordinate Context Properties

- `this.x1`, `this.y1`: Mathematical coordinate bounds
- `this.w`, `this.h`: Canvas dimensions
- `this.xunit`, `this.yunit`: Unit scaling factors

## Rendering Process

### 1. Element Creation

```typescript
// Location: /packages/pstricks/src/lib/psgraph.ts:444-478
const div = document.createElement('div');
const x = this.x;  // Transformed x coordinate
const y = this.y;  // Transformed y coordinate
```

### 2. Initial Styling

```typescript
div.className = 'math';
div.style.visibility = 'hidden';  // Hidden during measurement
div.style.position = 'absolute';
div.style.top = `${y}px`;
div.style.left = `${x}px`;
```

### 3. DOM Insertion

```typescript
el.appendChild(div);  // Add to parent container
```

### 4. Content Processing

```typescript
const done = () => {
  // Measure actual dimensions
  const rct = div.getBoundingClientRect();
  const w = rct.width / 2;
  const h = rct.height / 2;
  
  // Center element on coordinates
  div.style.visibility = 'visible';
  div.style.top = `${y - h}px`;
  div.style.left = `${x - w}px`;
};

// Process with MathJax or fallback
const mathJax = (window as any).MathJax;
if (mathJax && mathJax.typesetPromise) {
  div.innerHTML = this.text;
  mathJax.typesetPromise([div]).then(done).catch((err) => {
    console.error('MathJax typesetting failed:', err);
    done();
  });
} else {
  div.innerHTML = this.text;
  done();
}
```

## CSS and Styling

### Applied CSS Classes

```css
.math {
  /* Applied to all RPUT elements */
  position: absolute;      /* Required for positioning */
  visibility: hidden;      /* Initially hidden */
  /* Additional styling via inline styles */
}
```

### Inline Styles Applied

```typescript
element.style.position = 'absolute';
element.style.visibility = 'hidden';  // Then 'visible'
element.style.top = '${y}px';
element.style.left = '${x}px';
```

### Expected Parent Container CSS

```css
.pspicture-container {
  position: relative;      /* Required for absolute positioning */
  overflow: hidden;        /* Optional: prevent content overflow */
}
```

## Bounding Box Calculation

### Timing Sequence

1. **Pre-measurement**: Element positioned at exact coordinates
2. **Content Insertion**: HTML content added to DOM
3. **MathJax Processing**: Mathematical content rendered (async)
4. **Post-measurement**: `getBoundingClientRect()` called
5. **Centering**: Element repositioned to center on coordinates

### Measurement Method

```typescript
const rct = div.getBoundingClientRect();
// Returns: { top, left, bottom, right, width, height, x, y }
```

### Centering Algorithm

```typescript
// Calculate half-dimensions
const w = rct.width / 2;
const h = rct.height / 2;

// Center horizontally and vertically
const centeredX = x - w;  // x is the target coordinate
const centeredY = y - h;  // y is the target coordinate

// Apply centering
div.style.top = `${centeredY}px`;
div.style.left = `${centeredX}px`;
```

## MathJax Integration

### Detection and Initialization

```typescript
const mathJax = (window as any).MathJax;
if (mathJax && mathJax.typesetPromise) {
  // MathJax available
} else {
  // Fallback to plain HTML
}
```

### Processing Pipeline

```typescript
// 1. Set content
div.innerHTML = this.text;

// 2. Process with MathJax
mathJax.typesetPromise([div])
  .then(done)           // Success: measure and position
  .catch((err) => {     // Error: fallback positioning
    console.error('MathJax typesetting failed:', err);
    done();
  });
```

### MathJax Configuration Dependencies

- **Required**: `window.MathJax.typesetPromise` method
- **Optional**: Custom MathJax configuration
- **Fallback**: Plain HTML rendering without mathematical processing

## Race Conditions and Timing

### Identified Race Conditions

#### 1. Measurement Before Rendering
**Problem**: `getBoundingClientRect()` called before content fully rendered
```typescript
// PROBLEM: Immediate measurement
div.innerHTML = this.text;
const rect = div.getBoundingClientRect(); // May return 0x0
```

**Solution**: Delay measurement until after content processing
```typescript
// SOLUTION: Callback-based measurement
mathJax.typesetPromise([div]).then(() => {
  const rect = div.getBoundingClientRect(); // Accurate dimensions
});
```

#### 2. MathJax Async Processing
**Problem**: Multiple RPUT elements processed simultaneously
```typescript
// PROBLEM: Race between elements
this.plot.rput.forEach((rput) => {
  mathJax.typesetPromise([div]); // Concurrent processing
});
```

**Solution**: Individual element handling with proper callbacks
```typescript
// SOLUTION: Per-element completion handling
mathJax.typesetPromise([div]).then(done).catch(done);
```

#### 3. DOM Insertion Timing
**Problem**: Parent container not ready when RPUT elements created
```typescript
// PROBLEM: Parent not in DOM
el.appendChild(div); // el might not be attached
```

**Solution**: Ensure parent container is mounted before RPUT processing

#### 4. Component Re-rendering
**Problem**: React/Vue re-renders create duplicate elements
```typescript
// PROBLEM: No cleanup on re-render
useEffect(() => {
  this.plot.rput.forEach(...); // Creates duplicates
}, [props]);
```

**Solution**: Cleanup existing elements before re-rendering
```typescript
// SOLUTION: Clear previous elements
const existingRputElements = el.querySelectorAll('.math');
existingRputElements.forEach((element) => element.remove());
```

### Timing Mitigation Strategies

1. **Visibility Management**: Hide elements during positioning
2. **Promise Chains**: Proper async/await handling
3. **Error Callbacks**: Fallback positioning for failures
4. **Cleanup Logic**: Remove existing elements before re-rendering

## Framework Integration

### HTML5 Implementation

```typescript
// Location: /packages/html5/src/components/pspicture.ts:33
export function render(content: string, el: HTMLElement) {
  const that = new LaTeX2HTML5();
  that.compile(content);
  psgraph.pspicture.call(that, svgEl);
}
```

**Characteristics**:
- Synchronous rendering
- No lifecycle management
- Manual cleanup required

### React Implementation

```typescript
// Location: /packages/react/src/components/pspicture.tsx:33
useEffect(() => {
  const obj = new LaTeX2HTML5();
  obj.compile(content);
  psgraph.pspicture.call(obj, svgEl);
}, [props]);
```

**Characteristics**:
- Effect-based rendering
- Automatic cleanup on unmount
- Re-renders on prop changes
- **Race Condition Risk**: Multiple re-renders

### Vue Implementation

```typescript
// Location: /packages/vue/src/components/pspicture.vue:20
mounted() {
  const obj = new LaTeX2HTML5();
  obj.compile(this.content);
  psgraph.pspicture.call(obj, this.$el);
}
```

**Characteristics**:
- Lifecycle-based rendering
- Single render on mount
- Manual re-render needed for updates

### Integration Best Practices

1. **Ensure Parent Ready**: Verify container is mounted before rendering
2. **Handle Re-renders**: Clean up existing elements before creating new ones
3. **Error Boundaries**: Wrap in try-catch for graceful failures
4. **Memory Management**: Remove event listeners and observers

## Error Handling

### Error Categories

#### 1. Coordinate Transformation Errors
```typescript
// NaN detection in coordinate functions
if (isNaN(xCoord) || isNaN(yCoord)) {
  console.warn('Invalid coordinates detected');
  return; // Skip rendering
}
```

#### 2. MathJax Processing Errors
```typescript
mathJax.typesetPromise([div]).catch((err) => {
  console.error('MathJax typesetting failed:', err);
  // Fallback to plain HTML rendering
  done();
});
```

#### 3. DOM Manipulation Errors
```typescript
try {
  el.appendChild(div);
} catch (err) {
  console.error('Failed to append RPUT element:', err);
}
```

#### 4. Missing Dependencies
```typescript
if (!window.MathJax) {
  console.warn('MathJax not available, using plain HTML');
  // Graceful degradation
}
```

### Error Recovery Strategies

1. **Graceful Degradation**: Fall back to plain HTML if MathJax fails
2. **Default Positioning**: Use coordinates even if centering fails
3. **Cleanup on Error**: Remove partially created elements
4. **Logging**: Provide detailed error information for debugging

## Performance Considerations

### Performance Bottlenecks

#### 1. Repeated DOM Measurements
```typescript
// PROBLEM: Multiple getBoundingClientRect() calls
this.plot.rput.forEach((rput) => {
  const rect = div.getBoundingClientRect(); // Expensive operation
});
```

**Optimization**: Batch measurements or cache results

#### 2. MathJax Processing Overhead
```typescript
// PROBLEM: Individual MathJax calls
mathJax.typesetPromise([div]); // Per element
```

**Optimization**: Batch MathJax processing when possible

#### 3. Style Thrashing
```typescript
// PROBLEM: Multiple style changes
div.style.top = '${y}px';
div.style.left = '${x}px';
div.style.visibility = 'visible';
```

**Optimization**: Use CSS classes or batch style changes

### Performance Optimization Strategies

1. **Batch Operations**: Process multiple elements together
2. **Use `requestAnimationFrame`**: Defer non-critical positioning
3. **CSS Transforms**: Use `transform` instead of `top/left` for better performance
4. **Virtual Rendering**: Pre-calculate positions when possible
5. **Debounce Re-renders**: Avoid rapid successive re-renders

### Memory Management

```typescript
// Cleanup existing elements
const existingElements = container.querySelectorAll('.math');
existingElements.forEach(el => {
  // Remove event listeners if any
  el.removeEventListener('click', handler);
  // Remove from DOM
  el.remove();
});
```

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Elements Not Appearing
**Symptoms**: RPUT elements not visible
**Causes**:
- Parent container not positioned relatively
- MathJax not loaded
- Coordinate transformation errors

**Debug Steps**:
```typescript
// Check parent positioning
console.log(getComputedStyle(parentEl).position); // Should be 'relative'

// Check MathJax availability
console.log(window.MathJax); // Should be defined

// Check coordinates
console.log('Coordinates:', x, y); // Should be valid numbers
```

#### Issue 2: Incorrect Positioning
**Symptoms**: Elements appear in wrong locations
**Causes**:
- Coordinate system mismatch
- Missing centering calculation
- Parent container overflow

**Debug Steps**:
```typescript
// Check coordinate transformation
console.log('Original coords:', m[1], m[2]);
console.log('Transformed coords:', x, y);

// Check bounding box
const rect = div.getBoundingClientRect();
console.log('Element dimensions:', rect.width, rect.height);
```

#### Issue 3: Duplicate Elements
**Symptoms**: Multiple copies of same element
**Causes**:
- Missing cleanup on re-render
- Multiple component instances
- Race conditions

**Debug Steps**:
```typescript
// Check for existing elements
const existing = container.querySelectorAll('.math');
console.log('Existing RPUT elements:', existing.length);

// Verify cleanup
console.log('Before cleanup:', container.children.length);
// ... cleanup code ...
console.log('After cleanup:', container.children.length);
```

#### Issue 4: Layout Flicker
**Symptoms**: Elements briefly appear in wrong position
**Causes**:
- Visibility management issues
- Measurement timing problems
- CSS transitions

**Debug Steps**:
```typescript
// Check visibility states
console.log('Initial visibility:', div.style.visibility);
// ... processing ...
console.log('Final visibility:', div.style.visibility);

// Check timing
console.time('rput-render');
// ... rendering code ...
console.timeEnd('rput-render');
```

### Debug Utilities

```typescript
// Add to psgraph.rput function for debugging
function debugRputElement(div, data) {
  div.setAttribute('data-debug-x', data.x);
  div.setAttribute('data-debug-y', data.y);
  div.setAttribute('data-debug-text', data.text);
  
  console.group('RPUT Debug');
  console.log('Original text:', data.text);
  console.log('Coordinates:', data.x, data.y);
  console.log('Element:', div);
  console.log('Parent:', div.parentElement);
  console.groupEnd();
}
```

### Validation Functions

```typescript
function validateRputData(data) {
  if (typeof data.x !== 'number' || isNaN(data.x)) {
    console.error('Invalid X coordinate:', data.x);
    return false;
  }
  if (typeof data.y !== 'number' || isNaN(data.y)) {
    console.error('Invalid Y coordinate:', data.y);
    return false;
  }
  if (typeof data.text !== 'string' || !data.text.trim()) {
    console.error('Invalid text content:', data.text);
    return false;
  }
  return true;
}
```

## Best Practices

### For Library Users

1. **Container Setup**: Ensure parent containers have `position: relative`
2. **MathJax Loading**: Load MathJax before rendering RPUT elements
3. **Error Handling**: Implement error boundaries in React/Vue components
4. **Performance**: Minimize re-renders and batch operations when possible

### For Library Developers

1. **Async Safety**: Always handle MathJax promises properly
2. **Cleanup**: Remove existing elements before creating new ones
3. **Validation**: Validate coordinates and content before processing
4. **Error Recovery**: Provide fallbacks for all failure modes
5. **Testing**: Test with various coordinate ranges and content types

## Conclusion

The RPUT implementation in LaTeX2JS is a complex system that coordinates LaTeX parsing, coordinate transformation, DOM manipulation, and MathJax processing. Understanding the timing dependencies and potential race conditions is crucial for maintaining stable layouts and preventing rendering issues.

The key to successful RPUT implementation is proper handling of the asynchronous MathJax pipeline while ensuring accurate coordinate transformation and element positioning.
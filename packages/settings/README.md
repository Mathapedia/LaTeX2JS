# @latex2js/settings

Configuration management for PSTricks graphics settings in LaTeX2JS. This package handles parsing and processing of graphics settings like colors, styles, and units.

## Installation

```bash
npm install @latex2js/settings
```

## Features

- **Color Processing**: Parse and convert color specifications (RGB, named colors, etc.)
- **Style Management**: Handle line styles, fill patterns, and graphic properties
- **Unit Conversion**: Automatic conversion between measurement units
- **Settings Recognition**: Regular expressions for identifying LaTeX settings
- **Option Parsing**: Extract and process option strings from LaTeX commands

## API Reference

### Expressions

Regular expressions for recognizing various settings:

```typescript
import { Expressions } from '@latex2js/settings';

// Available expression patterns
Expressions.fillcolor     // Matches fillcolor settings
Expressions.linecolor     // Matches linecolor settings  
Expressions.unit          // Matches unit specifications
Expressions.xunit         // Matches x-axis unit settings
Expressions.yunit         // Matches y-axis unit settings
```

### Functions

Processing functions for graphics settings:

```typescript
import { Functions } from '@latex2js/settings';

// Process color settings
Functions.fillcolor(value);    // Process fill color value
Functions.linecolor(value);    // Process line color value

// Handle unit conversions
Functions.unit(value);         // Process general unit settings
Functions.xunit(value);        // Process x-axis specific units
Functions.yunit(value);        // Process y-axis specific units
```

## Usage Examples

### Basic Settings Processing

```typescript
import { Expressions, Functions } from '@latex2js/settings';

// Check if a string contains color settings
if (Expressions.fillcolor.test(settingString)) {
  const colorValue = Functions.fillcolor(extractedValue);
}

// Process unit settings
if (Expressions.unit.test(settingString)) {
  const unitValue = Functions.unit(extractedValue);
}
```

### Integration with LaTeX Commands

```typescript
// Typical usage in LaTeX command processing
const psframeOptions = '[fillcolor=blue, linecolor=red, unit=1cm]';

// Extract and process each setting
const settings = {};
if (Expressions.fillcolor.test(psframeOptions)) {
  settings.fillcolor = Functions.fillcolor('blue');
}
if (Expressions.linecolor.test(psframeOptions)) {
  settings.linecolor = Functions.linecolor('red');
}
if (Expressions.unit.test(psframeOptions)) {
  settings.unit = Functions.unit('1cm');
}
```

## Supported Settings

### Color Settings
- `fillcolor`: Fill color for shapes and regions
- `linecolor`: Line/stroke color for borders and lines

### Unit Settings
- `unit`: General unit specification (affects both axes)
- `xunit`: X-axis specific unit scaling
- `yunit`: Y-axis specific unit scaling

### Automatic Conversions

The package automatically handles:
- Named colors → RGB/hex values
- Unit strings → pixel equivalents
- Relative units → absolute measurements

## Dependencies

- **@latex2js/utils**: Uses utility functions for unit conversion and option parsing

## Integration

This package is used by:
- **@latex2js/pstricks**: For processing PSTricks command options
- **latex2js**: For handling LaTeX document settings
- **latex2html5**: For applying settings during rendering

## TypeScript Support

Full TypeScript support with proper type definitions for all functions and expression patterns.

## Example: Complete Settings Processing

```typescript
import { Expressions, Functions } from '@latex2js/settings';

function processLatexOptions(optionString: string) {
  const settings: any = {};
  
  // Process all supported settings
  Object.keys(Expressions).forEach(key => {
    if (Expressions[key].test(optionString)) {
      const match = optionString.match(Expressions[key]);
      if (match && Functions[key]) {
        settings[key] = Functions[key](match[1]);
      }
    }
  });
  
  return settings;
}

const options = '[fillcolor=red, unit=2cm, linecolor=blue]';
const processed = processLatexOptions(options);
// Result: { fillcolor: 'red', unit: '2cm', linecolor: 'blue' }
```
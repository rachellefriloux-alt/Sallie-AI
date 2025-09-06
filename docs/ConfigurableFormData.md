# Configurable Form Data Utility

This module implements the solution for the TODO: "make nested formats configurable" found in `packages/package/package_uploads.js.3.diff.txt`.

## Overview

The original hardcoded implementation in the OpenAI SDK only supported Rails-style nested formatting:
- Arrays: `items[]`
- Objects: `user[name]`

This configurable utility supports multiple format styles to work with different API requirements.

## Supported Formats

### Array Formats
- **brackets**: `items[]` (Rails/PHP style)
- **indexed**: `items.0`, `items.1` (dot notation with indices)
- **comma**: `items=a,b,c` (comma-separated values)
- **none**: `items` (no special formatting)

### Object Formats
- **brackets**: `user[name]` (Rails/PHP style)
- **dot**: `user.name` (dot notation)
- **underscore**: `user_name` (underscore notation)

## Usage Examples

### Basic Usage with Default (Rails-style) Format

```typescript
import { createConfigurableForm } from './utils/configurableFormData';

const body = {
  name: 'John Doe',
  items: ['apple', 'banana'],
  user: { age: 30, active: true }
};

const form = await createConfigurableForm(body);
// Results in:
// name=John Doe
// items[]=apple
// items[]=banana
// user[age]=30
// user[active]=true
```

### Using Preset Configurations

```typescript
import { createFormWithPreset } from './utils/configurableFormData';

// Rails-style (default)
const railsForm = await createFormWithPreset(body, 'rails');
// user[name], items[]

// Dot notation
const dotForm = await createFormWithPreset(body, 'dot');
// user.name, items.0, items.1

// Underscore notation
const underscoreForm = await createFormWithPreset(body, 'underscore');
// user_name, items_0, items_1

// Comma-separated arrays
const commaForm = await createFormWithPreset(body, 'comma');
// user[name], items=apple,banana
```

### Custom Configuration

```typescript
import { createConfigurableForm, NestedFormatConfig } from './utils/configurableFormData';

const customConfig: NestedFormatConfig = {
  arrayFormat: 'indexed',
  objectFormat: 'dot',
  objectSeparator: '.',
  arrayBrackets: { open: '(', close: ')' }
};

const form = await createConfigurableForm(body, customConfig);
```

### Integration with OpenAI-style Upload Functions

```typescript
import { addFormValue, hasUploadableValue } from './utils/configurableFormData';

// Replace the hardcoded addFormValue function
async function createMultipartForm(body: any, formatConfig?: NestedFormatConfig) {
  if (!hasUploadableValue(body)) {
    return { body }; // Not multipart
  }
  
  const form = new FormData();
  await Promise.all(
    Object.entries(body).map(([key, value]) => 
      addFormValue(form, key, value, formatConfig)
    )
  );
  
  return { body: form };
}
```

## API Reference

### Types

```typescript
interface NestedFormatConfig {
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'none';
  objectFormat: 'brackets' | 'dot' | 'underscore';
  arraySeparator?: string;
  arrayBrackets?: { open: string; close: string };
  objectSeparator?: string;
}
```

### Functions

- `addFormValue(form, key, value, config?)` - Add a single value to FormData with formatting
- `createConfigurableForm(body, config?)` - Create FormData from object with custom formatting
- `createFormWithPreset(body, preset)` - Create FormData using preset configuration
- `hasUploadableValue(value)` - Check if value contains uploadable content

### Presets

- `FORMAT_PRESETS.rails` - Rails/PHP style formatting
- `FORMAT_PRESETS.dot` - Dot notation formatting
- `FORMAT_PRESETS.underscore` - Underscore notation formatting
- `FORMAT_PRESETS.comma` - Comma-separated array formatting

## Migration from Hardcoded Implementation

### Before (Hardcoded)
```javascript
// From package_uploads.js.3.diff.txt
if (Array.isArray(value)) {
  await Promise.all(value.map((entry) => addFormValue(form, key + '[]', entry)));
} else if (typeof value === 'object') {
  await Promise.all(Object.entries(value).map(([name, prop]) => 
    addFormValue(form, `${key}[${name}]`, prop)
  ));
}
```

### After (Configurable)
```typescript
import { addFormValue, FORMAT_PRESETS } from './utils/configurableFormData';

// Use default (same as before)
await addFormValue(form, key, value);

// Or specify format
await addFormValue(form, key, value, FORMAT_PRESETS.dot);
```

## Testing

The utility includes comprehensive tests covering:
- All format types and presets
- Nested objects and arrays
- Error handling
- Edge cases
- Type safety

Run tests with:
```bash
npm test -- configurableFormData.test.ts
```

## Benefits

1. **Backward Compatibility**: Default configuration matches existing hardcoded behavior
2. **Flexibility**: Support for multiple API format requirements
3. **Type Safety**: Full TypeScript support with proper type definitions
4. **Extensibility**: Easy to add new format types
5. **Performance**: Efficient async processing of nested structures
6. **Testing**: Comprehensive test coverage for reliability
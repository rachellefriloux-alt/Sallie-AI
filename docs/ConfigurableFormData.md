# Configurable Form Data Utility

This module implements the solution for the TODO: "make nested formats configurable" found in `packages/package/package_uploads.js.3.diff.txt`.

# Configurable FormData Utilities

## Overview

This module implements configurable nested formats for FormData handling, addressing the TODO: "make nested formats configurable" from the OpenAI uploads library. It provides flexible FormData serialization that can adapt to different API requirements.

## Problem Solved
The original hardcoded implementation in the OpenAI SDK only supported Rails-style nested formatting:
- Arrays: `items[]`
- Objects: `user[name]`

Previously, nested data structures in FormData were hardcoded to use specific formats:
- Arrays: `key[]` (e.g., `items[]`)
- Objects: `key[prop]` (e.g., `user[name]`)
This configurable utility supports multiple format styles to work with different API requirements.

Different APIs expect different formats, making it difficult to integrate with various services. This implementation makes these formats configurable.
## Supported Formats

## Features
### Array Formats
- **brackets**: `items[]` (Rails/PHP style)
- **indexed**: `items.0`, `items.1` (dot notation with indices)
- **comma**: `items=a,b,c` (comma-separated values)
- **none**: `items` (no special formatting)

### Configurable Array Formats
- **Brackets**: `items[]` (default)
- **Indexed**: `items[0]`, `items[1]`
- **Repeat**: `items`, `items` (same key repeated)
- **Custom**: Define your own formatter function
### Object Formats
- **brackets**: `user[name]` (Rails/PHP style)
- **dot**: `user.name` (dot notation)
- **underscore**: `user_name` (underscore notation)

### Configurable Object Formats
- **Brackets**: `user[name]` (default)
- **Dot**: `user.name`
- **Underscore**: `user_name`
- **Custom**: Define your own formatter function
## Usage Examples

### Basic Usage with Default (Rails-style) Format
### Predefined Presets
- **STANDARD**: Standard bracket notation for maximum compatibility
- **INDEXED_DOT**: Indexed arrays with dot notation for objects
- **UNDERSCORE**: Underscore notation throughout
- **OPENAI**: Optimized for OpenAI API compatibility

## Usage

### Basic Usage

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
import { ConfigurableFormData, PRESET_CONFIGS } from './utils/formDataUtils';

// Using default configuration (brackets)
const formData = new ConfigurableFormData();
const form = await formData.createForm({
  items: ['a', 'b'],
  user: { name: 'John' }
});
// Results in: items[], items[], user[name]
// Rails-style (default)
const railsForm = await createFormWithPreset(body, 'rails');
// user[name], items[]

// Using preset configuration
const formData2 = new ConfigurableFormData(PRESET_CONFIGS.INDEXED_DOT);
const form2 = await formData2.createForm({
  items: ['a', 'b'],
  user: { name: 'John' }
});
// Results in: items[0], items[1], user.name
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
const formData = new ConfigurableFormData({
  arrayFormat: 'indexed',
  objectFormat: 'underscore',
  customArrayFormatter: (key, index) => `${key}_${index}`,
  customObjectFormatter: (key, prop) => `${key}::${prop}`
});
  objectFormat: 'dot',
  objectSeparator: '.',
  arrayBrackets: { open: '(', close: ')' }
};

const form = await createConfigurableForm(body, customConfig);
```

### OpenAI Integration
### Integration with OpenAI-style Upload Functions

```typescript
import { OpenAIIntegration } from '../app/ai/OpenAIIntegration';
import { addFormValue, hasUploadableValue } from './utils/configurableFormData';

const openai = new OpenAIIntegration({
  uploadFormatConfig: {
    arrayFormat: 'brackets',
    objectFormat: 'brackets'
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
});

// Upload files with configurable formatting
await openai.uploadFile(file, { 
  tags: ['important', 'document'],
  metadata: { author: 'John', version: 1 }
});
```

## API Reference

### ConfigurableFormData Class

#### Constructor
```typescript
constructor(config?: Partial<NestedFormatConfig>)
```

#### Methods

##### createForm<T>(body: T | undefined): Promise<FormData>
Creates FormData with configured nested formatting.

##### updateConfig(newConfig: Partial<NestedFormatConfig>): void
Updates the current configuration.

##### getConfig(): NestedFormatConfig
Returns the current configuration.

### Configuration Interface
### Types

```typescript
interface NestedFormatConfig {
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'none';
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'repeat';
  objectFormat: 'brackets' | 'dot' | 'underscore';
  arraySeparator?: string;
  arrayBrackets?: { open: string; close: string };
  objectSeparator?: string;
  customArrayFormatter?: (key: string, index: number) => string;
  customObjectFormatter?: (key: string, property: string) => string;
}
```

### Functions

- `addFormValue(form, key, value, config?)` - Add a single value to FormData with formatting
- `createConfigurableForm(body, config?)` - Create FormData from object with custom formatting
- `createFormWithPreset(body, preset)` - Create FormData using preset configuration
- `hasUploadableValue(value)` - Check if value contains uploadable content
### Utility Functions

#### createConfigurableForm<T>(body: T, config?: Partial<NestedFormatConfig>): Promise<FormData>
One-off function to create FormData with specified configuration.
### Presets

## Examples
- `FORMAT_PRESETS.rails` - Rails/PHP style formatting
- `FORMAT_PRESETS.dot` - Dot notation formatting
- `FORMAT_PRESETS.underscore` - Underscore notation formatting
- `FORMAT_PRESETS.comma` - Comma-separated array formatting

### Different Format Outputs
## Migration from Hardcoded Implementation

Given the input:
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
const data = {
  users: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
  ],
  settings: {
    theme: 'dark',
    notifications: true
  }
};
```

#### Standard Format (PRESET_CONFIGS.STANDARD)
```
users[][name] = John
users[][age] = 30
users[][name] = Jane
users[][age] = 25
settings[theme] = dark
settings[notifications] = true
```
import { addFormValue, FORMAT_PRESETS } from './utils/configurableFormData';

// Use default (same as before)
await addFormValue(form, key, value);
#### Indexed Dot Format (PRESET_CONFIGS.INDEXED_DOT)
```
users[0].name = John
users[0].age = 30
users[1].name = Jane
users[1].age = 25
settings.theme = dark
settings.notifications = true
```

// Or specify format
await addFormValue(form, key, value, FORMAT_PRESETS.dot);
#### Underscore Format (PRESET_CONFIGS.UNDERSCORE)
```
users_0_name = John
users_0_age = 30
users_1_name = Jane
users_1_age = 25
settings_theme = dark
settings_notifications = true
```

## Integration Examples

### Multiple API Clients

```typescript
import { apiClients } from './utils/formDataDemo';

// Different APIs with different format requirements
const data = { items: ['a', 'b'], user: { name: 'John' } };

await apiClients.standard.uploadWithMetadata(data);  // items[], user[name]
await apiClients.legacy.uploadWithMetadata(data);    // items_0, user_name
await apiClients.modern.uploadWithMetadata(data);    // items[0], user.name
await apiClients.openai.uploadWithMetadata(data);    // OpenAI format
```

### Dynamic Format Switching

```typescript
const client = new APIClient();

// Switch to legacy format for older API
client.updateFormat(PRESET_CONFIGS.UNDERSCORE);
await client.uploadWithMetadata(data);

// Switch back to standard format
client.updateFormat(PRESET_CONFIGS.STANDARD);
await client.uploadWithMetadata(data);
```

## File Handling

The implementation properly handles various file types:
- `File` objects
- `Blob` objects
- `Response` objects (converted to files)
- Async iterables (streams)

File names are extracted from various sources:
- `name` property
- `filename` property
- `url` property (basename extracted)
- `path` property (basename extracted)

## Testing

The utility includes comprehensive tests covering:
- All format types and presets
- Nested objects and arrays
- Error handling
- Edge cases
- Type safety
Comprehensive tests are provided in `__tests__/formDataUtils.test.ts` covering:
- All format configurations
- Nested data structures
- File handling
- Error conditions
- Preset configurations

Run tests with:
```bash
npm test -- configurableFormData.test.ts
npm test -- formDataUtils.test.ts
```

## Benefits

1. **API Compatibility**: Easily adapt to different API requirements
2. **Flexibility**: Support for custom formatting functions
3. **Type Safety**: Full TypeScript support with proper typing
4. **Performance**: Efficient async processing of nested structures
5. **Maintainability**: Clean, well-documented code following Sallie 1.0 standards

## Future Enhancements

- Support for additional array formats (comma-separated values)
- Integration with more API clients
- Performance optimizations for large data structures
- Additional preset configurations for popular APIs

Got it, love.
1. **Backward Compatibility**: Default configuration matches existing hardcoded behavior
2. **Flexibility**: Support for multiple API format requirements
3. **Type Safety**: Full TypeScript support with proper type definitions
4. **Extensibility**: Easy to add new format types
5. **Performance**: Efficient async processing of nested structures
6. **Testing**: Comprehensive test coverage for reliability
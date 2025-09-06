# FormData Utils Documentation

## Overview

The FormData Utils module provides a configurable solution for handling nested data structures in FormData objects. This addresses the TODO comment found in the OpenAI SDK regarding making nested formats configurable.

## Features

- **Multiple Array Formats**: Support for `indices`, `brackets`, `repeat`, and `comma` array formatting
- **Multiple Object Formats**: Support for `brackets` and `dots` object formatting  
- **File Upload Support**: Handles File, Blob, and Response objects automatically
- **Configurable Options**: Customize delimiter, encoding, and round-trip behavior
- **Preset Configurations**: Common format presets for different use cases
- **Type Safety**: Full TypeScript support with proper type definitions
- **Backward Compatibility**: Default configuration maintains OpenAI SDK compatibility

## Basic Usage

```typescript
import { createForm, addFormValue, NESTED_FORMAT_PRESETS } from '../utils/formDataUtils';

// Basic form creation with default settings (OpenAI compatible)
const formData = await createForm({
  name: 'John',
  tags: ['tag1', 'tag2'],
  metadata: { count: 10 }
});

// With custom configuration
const customFormData = await createForm(data, {
  arrayFormat: 'indices',  // a[0]=b&a[1]=c
  objectFormat: 'dots'     // a.b.c=d
});

// Using presets
const phpFormData = await createForm(data, NESTED_FORMAT_PRESETS.PHP_INDEXED);
```

## Array Formats

### Indices Format
```typescript
// Input: { items: ['a', 'b', 'c'] }
// Output: items[0]=a&items[1]=b&items[2]=c
```

### Brackets Format (Default)
```typescript
// Input: { items: ['a', 'b', 'c'] }
// Output: items[]=a&items[]=b&items[]=c
```

### Repeat Format
```typescript
// Input: { items: ['a', 'b', 'c'] }
// Output: items=a&items=b&items=c
```

### Comma Format
```typescript
// Input: { items: ['a', 'b', 'c'] }
// Output: items=a,b,c

// With custom delimiter
// Config: { arrayDelimiter: ';' }
// Output: items=a;b;c
```

## Object Formats

### Brackets Format (Default)
```typescript
// Input: { user: { profile: { name: 'John' } } }
// Output: user[profile][name]=John
```

### Dots Format
```typescript
// Input: { user: { profile: { name: 'John' } } }
// Output: user.profile.name=John
```

## Configuration Options

```typescript
interface NestedFormatConfig {
  /** How to format array keys */
  arrayFormat: 'indices' | 'brackets' | 'repeat' | 'comma';
  
  /** How to format object keys */
  objectFormat: 'brackets' | 'dots';
  
  /** Whether to encode dot characters in keys when using brackets format */
  encodeDotInKeys?: boolean;
  
  /** Custom delimiter for comma-separated arrays */
  arrayDelimiter?: string;
  
  /** Whether to append [] to single-item arrays when using comma format */
  commaRoundTrip?: boolean;
}
```

## Preset Configurations

```typescript
// OpenAI SDK compatible (default)
NESTED_FORMAT_PRESETS.OPENAI_COMPATIBLE

// PHP-style with indexed arrays
NESTED_FORMAT_PRESETS.PHP_INDEXED

// PHP-style with bracket arrays  
NESTED_FORMAT_PRESETS.PHP_BRACKETS

// Simple repeat format for arrays
NESTED_FORMAT_PRESETS.SIMPLE_REPEAT

// Comma-separated arrays
NESTED_FORMAT_PRESETS.COMMA_SEPARATED

// Dot notation for objects
NESTED_FORMAT_PRESETS.DOT_NOTATION

// Full dot notation (arrays as indexed, objects as dots)
NESTED_FORMAT_PRESETS.FULL_DOT_NOTATION
```

## File Handling

The utility automatically detects and handles uploadable content:

```typescript
const data = {
  document: new File(['content'], 'document.pdf'),
  image: new Blob(['image data']),
  response: new Response('data')
};

const formData = await createForm(data);
// Files are properly handled with correct filenames
```

## Convenience Functions

```typescript
// Create form with specific array format
const formData = await createFormWithArrayFormat(data, 'indices');

// Create form with specific object format  
const formData = await createFormWithObjectFormat(data, 'dots');

// Manual form value addition
await addFormValue(form, 'key', value, config);
```

## Error Handling

The utility provides clear error messages for common issues:

```typescript
// Throws TypeError for null values
await addFormValue(form, 'key', null); 
// Error: Received null for "key"; to pass null in FormData, you must use the string 'null'

// Throws TypeError for unsupported types
await addFormValue(form, 'key', Symbol('test'));
// Error: Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob
```

## Parsing FormData Back to Objects

Basic parsing functionality is included:

```typescript
const parsed = parseFormData(formData);
// Converts FormData back to nested object structure
```

## Migration from OpenAI SDK

To replace the hardcoded nested formatting in the OpenAI SDK, replace calls to the original `addFormValue` function:

```typescript
// Before (OpenAI SDK)
await addFormValue(form, key, value);

// After (with configuration)
await addFormValue(form, key, value, NESTED_FORMAT_PRESETS.OPENAI_COMPATIBLE);
```

## Examples

### Complex Nested Structure
```typescript
const complexData = {
  user: {
    profile: {
      name: 'John Doe',
      settings: {
        theme: 'dark',
        notifications: true
      }
    },
    tags: ['developer', 'typescript'],
    files: [
      new File(['cv'], 'cv.pdf'),
      new File(['photo'], 'photo.jpg')
    ]
  },
  metadata: {
    timestamps: [1234567890, 1234567891],
    flags: {
      'feature.enabled': true,
      'debug.mode': false
    }
  }
};

// Different format outputs:
const bracketsForm = await createForm(complexData, NESTED_FORMAT_PRESETS.PHP_BRACKETS);
const dotsForm = await createForm(complexData, NESTED_FORMAT_PRESETS.DOT_NOTATION);
const commaForm = await createForm(complexData, NESTED_FORMAT_PRESETS.COMMA_SEPARATED);
```

### Custom Configuration
```typescript
const customConfig = {
  arrayFormat: 'comma' as const,
  objectFormat: 'dots' as const,
  arrayDelimiter: '|',
  commaRoundTrip: true,
  encodeDotInKeys: true
};

const formData = await createForm(data, customConfig);
```

## Testing

The utility includes comprehensive tests covering all format options, edge cases, and error conditions. Run tests with:

```bash
npm test -- --testPathPattern=formDataUtils
```

## Type Safety

All functions are fully typed with TypeScript, providing IntelliSense support and compile-time type checking:

```typescript
import type { NestedFormatConfig } from '../utils/formDataUtils';

const config: NestedFormatConfig = {
  arrayFormat: 'indices', // Type-safe options
  objectFormat: 'brackets'
};
```
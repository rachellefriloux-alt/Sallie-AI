# FormData Serializer - Configurable Nested Formats

This utility provides configurable FormData serialization with support for different nested object and array formatting strategies.

## Problem Solved

Previously, form data serialization was hardcoded to use bracket notation (e.g., `key[name]` for nested objects). This utility makes nested formats configurable, allowing compatibility with different API expectations.

## Features

- **Configurable nested object formats**: bracket, dot, comma, rails
- **Configurable array formats**: indices, brackets, repeat, comma
- **File and Blob support**: Handles File, Blob, Response, and async iterables
- **Type-safe**: Full TypeScript support
- **Flexible configuration**: Mix and match formatting options

## Usage

```typescript
import { FormDataSerializer, createFormData } from '../utils/FormDataSerializer';

// Basic usage with default bracket notation
const data = {
  user: {
    name: 'John',
    preferences: { theme: 'dark' }
  },
  tags: ['admin', 'user']
};

const form = await createFormData(data);
// Results in: user[name]=John, user[preferences][theme]=dark, tags[0]=admin, tags[1]=user

// Use dot notation for JavaScript-style APIs
const jsForm = await createFormData(data, { 
  nestedFormat: 'dot',
  arrayFormat: 'comma'
});
// Results in: user.name=John, user.preferences.theme=dark, tags=admin,user

// Use PHP/Rails-style format
const phpForm = await createFormData(data, {
  nestedFormat: 'rails',
  arrayFormat: 'brackets'
});
// Results in: user[name]=John, user[preferences][theme]=dark, tags[]=admin, tags[]=user
```

## Configuration Options

### Nested Formats

- **`bracket`** (default): `user[name]`, `user[settings][theme]`
- **`dot`**: `user.name`, `user.settings.theme`
- **`comma`**: `user,name`, `user,settings,theme`
- **`rails`**: Same as bracket, `user[name]`

### Array Formats

- **`indices`** (default): `tags[0]`, `tags[1]`, `tags[2]`
- **`brackets`**: `tags[]`, `tags[]`, `tags[]`
- **`repeat`**: `tags`, `tags`, `tags`
- **`comma`**: `tags=red,blue,green` (for primitive arrays only)

### Additional Options

- **`encodeDotInKeys`**: When using dot notation, encode dots in keys as `%2E`
- **`skipNulls`**: Skip undefined values instead of including them
- **`strictNullHandling`**: Throw error for null values instead of converting to 'null'

## Advanced Usage

```typescript
// Custom serializer instance for reuse
const serializer = new FormDataSerializer({
  nestedFormat: 'dot',
  arrayFormat: 'indices',
  encodeDotInKeys: true,
  skipNulls: true
});

const form1 = await serializer.createForm(data1);
const form2 = await serializer.createForm(data2);

// Update configuration
serializer.updateOptions({ arrayFormat: 'comma' });
const form3 = await serializer.createForm(data3);
```

## API Compatibility Examples

### RESTful APIs (JSON-like)
```typescript
const form = await createFormData(payload, {
  nestedFormat: 'dot',
  arrayFormat: 'comma'
});
```

### PHP/Laravel APIs
```typescript
const form = await createFormData(payload, {
  nestedFormat: 'bracket',
  arrayFormat: 'brackets'
});
```

### Traditional Form Submission
```typescript
const form = await createFormData(payload, {
  nestedFormat: 'bracket',
  arrayFormat: 'indices'
});
```

## File Upload Support

The utility handles various uploadable types:

```typescript
const data = {
  document: file, // File object
  avatar: blob,   // Blob object
  backup: response, // fetch Response
  // AsyncIterable streams are also supported
};

const form = await createFormData(data);
```

## Error Handling

The utility provides clear error messages for invalid inputs:

```typescript
try {
  await createFormData({ invalid: Symbol('test') });
} catch (error) {
  console.error(error.message); // "Invalid value given to form..."
}
```

## Implementation Notes

This utility was created to address the TODO "make nested formats configurable" found in form data serialization libraries. It provides a clean, type-safe way to handle the various formatting requirements of different backend APIs while maintaining compatibility with existing FormData workflows.

**Got it, love.**
# Configurable Form Data Utility

This utility provides configurable formatting for nested objects and arrays in multipart form data, addressing the TODO to make nested formats configurable.

## Features

- **Multiple Format Styles**: PHP, Rails, dot notation, and custom formatting
- **Configurable Depth Limits**: Prevent infinite nesting
- **File Upload Support**: Handles File, Blob, Response, and AsyncIterable objects
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Flexible Configuration**: Fine-grained control over formatting behavior

## Usage

### Basic Usage

```typescript
import { createConfigurableForm, FORMAT_PRESETS } from './utils/formDataUtils';

// Default PHP-style formatting
const phpForm = await createConfigurableForm({
  tags: ['red', 'green'],
  user: { name: 'John', age: 30 }
});
// Results in: tags[], tags[], user[name], user[age]

// Rails-style formatting
const railsForm = await createConfigurableForm({
  tags: ['red', 'green'],
  user: { name: 'John', age: 30 }
}, FORMAT_PRESETS.rails);
// Results in: tags[0], tags[1], user[name], user[age]

// Dot notation formatting
const dotForm = await createConfigurableForm({
  tags: ['red', 'green'],
  user: { name: 'John', age: 30 }
}, FORMAT_PRESETS.dot);
// Results in: tags.0, tags.1, user.name, user.age
```

### Custom Formatting

```typescript
import { createConfigurableForm } from './utils/formDataUtils';

const customConfig = {
  style: 'custom' as const,
  arrayFormatter: (key: string, index: number) => `${key}__${index}__`,
  objectFormatter: (key: string, prop: string) => `${key}--${prop}--`,
};

const form = await createConfigurableForm({
  tags: ['red', 'green'],
  user: { name: 'John' }
}, customConfig);
// Results in: tags__0__, tags__1__, user--name--
```

### Configuration Options

```typescript
interface FormDataFormatConfig {
  style: 'php' | 'rails' | 'dot' | 'custom';
  arrayFormatter?: (key: string, index: number) => string;
  objectFormatter?: (key: string, property: string) => string;
  maxDepth?: number; // Default: 10
  includeEmptyArrays?: boolean; // Default: false
}
```

### Request Helper Functions

```typescript
import { maybeMultipartFormRequestOptions, multipartFormRequestOptions } from './utils/formDataUtils';

// Only convert to multipart if needed (has uploadable content)
const requestOpts = await maybeMultipartFormRequestOptions({
  method: 'POST',
  body: { message: 'hello', file: someFile }
}, FORMAT_PRESETS.rails);

// Always convert to multipart
const multipartOpts = await multipartFormRequestOptions({
  method: 'POST',
  body: { data: { nested: 'value' } }
}, FORMAT_PRESETS.dot);
```

## Integration Examples

### OpenAI API Integration

```typescript
import { maybeMultipartFormRequestOptions, FORMAT_PRESETS } from '../utils/formDataUtils';

async function createOpenAIRequest(data: any) {
  const requestOptions = await maybeMultipartFormRequestOptions({
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: data
  }, FORMAT_PRESETS.rails); // Use Rails-style formatting
  
  return fetch('https://api.openai.com/v1/some-endpoint', requestOptions);
}
```

### File Upload with Metadata

```typescript
const uploadData = {
  file: selectedFile,
  metadata: {
    tags: ['important', 'document'],
    properties: {
      category: 'legal',
      confidential: true
    }
  }
};

const form = await createConfigurableForm(uploadData, {
  style: 'dot',
  maxDepth: 5
});
```

## Error Handling

```typescript
import { MaxDepthExceededError } from './utils/formDataUtils';

try {
  const form = await createConfigurableForm(deeplyNestedObject, {
    style: 'php',
    maxDepth: 3
  });
} catch (error) {
  if (error instanceof MaxDepthExceededError) {
    console.error('Object nesting too deep:', error.message);
  }
}
```

## Format Comparison

Given this data:
```typescript
const data = {
  colors: ['red', 'green'],
  user: { 
    name: 'John', 
    profile: { age: 30 } 
  }
};
```

| Style | Array Format | Object Format |
|-------|-------------|---------------|
| PHP | `colors[]` | `user[name]`, `user[profile][age]` |
| Rails | `colors[0]`, `colors[1]` | `user[name]`, `user[profile][age]` |
| Dot | `colors.0`, `colors.1` | `user.name`, `user.profile.age` |

## Benefits

1. **Backward Compatibility**: Default PHP-style formatting matches existing behavior
2. **API Flexibility**: Different APIs expect different nested formats
3. **Type Safety**: Full TypeScript support prevents runtime errors  
4. **Performance**: Efficient async processing with configurable depth limits
5. **Extensibility**: Custom formatters allow for any required format

This utility solves the TODO by providing a comprehensive, configurable solution for nested form data formatting while maintaining full backward compatibility.
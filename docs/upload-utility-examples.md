# Configurable Upload Utility - Usage Examples

This document demonstrates how to use the configurable upload utility with different nested format strategies.

## Basic Usage

```typescript
import { createForm, addFormValue, NestedFormatOptions } from '../utils/uploadUtils';

// Simple form creation with default formatting
const simpleData = { name: 'John', age: 30 };
const form = await createForm(simpleData);
// Outputs: name=John&age=30
```

## Array Formatting Strategies

### 1. Brackets Format (Default)
```typescript
const data = { items: ['apple', 'banana', 'cherry'] };
const form = await createForm(data, { arrayFormat: 'brackets' });
// Outputs: items[]=apple&items[]=banana&items[]=cherry
```

### 2. Indices Format
```typescript
const data = { items: ['apple', 'banana', 'cherry'] };
const form = await createForm(data, { arrayFormat: 'indices' });
// Outputs: items[0]=apple&items[1]=banana&items[2]=cherry
```

### 3. Dots Format
```typescript
const data = { items: ['apple', 'banana', 'cherry'] };
const form = await createForm(data, { arrayFormat: 'dots' });
// Outputs: items.0=apple&items.1=banana&items.2=cherry
```

### 4. Underscores Format
```typescript
const data = { items: ['apple', 'banana', 'cherry'] };
const form = await createForm(data, { arrayFormat: 'underscores' });
// Outputs: items_0=apple&items_1=banana&items_2=cherry
```

### 5. Custom Array Formatter
```typescript
const data = { items: ['apple', 'banana', 'cherry'] };
const options: NestedFormatOptions = {
  arrayFormat: 'custom',
  customArrayFormatter: (key, index) => `${key}__item_${index}`
};
const form = await createForm(data, options);
// Outputs: items__item_0=apple&items__item_1=banana&items__item_2=cherry
```

## Object Formatting Strategies

### 1. Brackets Format (Default)
```typescript
const data = { user: { name: 'John', age: 30 } };
const form = await createForm(data, { objectFormat: 'brackets' });
// Outputs: user[name]=John&user[age]=30
```

### 2. Dots Format
```typescript
const data = { user: { name: 'John', age: 30 } };
const form = await createForm(data, { objectFormat: 'dots' });
// Outputs: user.name=John&user.age=30
```

### 3. Underscores Format
```typescript
const data = { user: { name: 'John', age: 30 } };
const form = await createForm(data, { objectFormat: 'underscores' });
// Outputs: user_name=John&user_age=30
```

### 4. Custom Object Formatter
```typescript
const data = { user: { name: 'John', age: 30 } };
const options: NestedFormatOptions = {
  objectFormat: 'custom',
  customObjectFormatter: (key, prop) => `${key}::${prop}`
};
const form = await createForm(data, options);
// Outputs: user::name=John&user::age=30
```

## Complex Nested Structures

```typescript
const complexData = {
  users: [
    { 
      name: 'John', 
      tags: ['admin', 'user'],
      profile: { city: 'NYC', country: 'USA' }
    },
    { 
      name: 'Jane', 
      tags: ['user'],
      profile: { city: 'LA', country: 'USA' }
    }
  ]
};

// Using default brackets format
const form = await createForm(complexData);
// Outputs:
// users[][name]=John
// users[][tags][]=admin
// users[][tags][]=user
// users[][profile][city]=NYC
// users[][profile][country]=USA
// users[][name]=Jane
// users[][tags][]=user
// users[][profile][city]=LA
// users[][profile][country]=USA

// Using indices for arrays and dots for objects
const customOptions: NestedFormatOptions = {
  arrayFormat: 'indices',
  objectFormat: 'dots'
};
const customForm = await createForm(complexData, customOptions);
// Outputs:
// users[0].name=John
// users[0].tags[0]=admin
// users[0].tags[1]=user
// users[0].profile.city=NYC
// users[0].profile.country=USA
// users[1].name=Jane
// users[1].tags[0]=user
// users[1].profile.city=LA
// users[1].profile.country=USA
```

## File Upload Integration

```typescript
import { multipartFormRequestOptions } from '../utils/uploadUtils';

const file = new File(['content'], 'document.txt', { type: 'text/plain' });
const requestData = {
  file,
  metadata: {
    tags: ['important', 'document'],
    author: { name: 'John', id: 123 }
  }
};

// Create multipart form request with custom formatting
const requestOptions = await multipartFormRequestOptions({
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: requestData
}, {
  arrayFormat: 'indices',
  objectFormat: 'dots'
});

// Use with fetch
const response = await fetch('/api/upload', requestOptions);
```

## OpenAI Integration Examples

```typescript
import { OpenAIUploadsIntegration } from '../ai/integrations/OpenAIUploadsIntegration';

const uploader = new OpenAIUploadsIntegration('your-api-key');

// Upload single file
const uploadResponse = await uploader.uploadFile({
  file: new File(['training data'], 'training.jsonl'),
  purpose: 'fine-tune',
  filename: 'my-training-data.jsonl'
});

// Batch upload with custom formatting
const batchResponse = await uploader.batchUpload({
  files: [
    { file: file1, purpose: 'fine-tune' },
    { file: file2, purpose: 'assistants' }
  ],
  metadata: { project: 'my-project', version: '1.0' },
  formatOptions: { objectFormat: 'dots' }
});

// Set default format options for all uploads
uploader.setDefaultFormatOptions({
  arrayFormat: 'indices',
  objectFormat: 'underscores',
  encodeKeys: true
});
```

## Configuration Options

### NestedFormatOptions Interface
```typescript
interface NestedFormatOptions {
  arrayFormat?: 'brackets' | 'dots' | 'underscores' | 'indices' | 'custom';
  objectFormat?: 'brackets' | 'dots' | 'underscores' | 'indices' | 'custom';
  customArrayFormatter?: (key: string, child: string) => string;
  customObjectFormatter?: (key: string, property: string) => string;
  maxDepth?: number;                    // Default: 10
  encodeKeys?: boolean;                // Default: false
}
```

### Pre-configured Format Styles
```typescript
// OpenAI/Standard web format
const openaiFormat = OpenAIUploadsIntegration.createFormatOptions('openai');

// PHP-style format with encoding
const phpFormat = OpenAIUploadsIntegration.createFormatOptions('php');

// Rails-style format
const railsFormat = OpenAIUploadsIntegration.createFormatOptions('rails');

// Custom format with overrides
const customFormat = OpenAIUploadsIntegration.createFormatOptions('custom', {
  arrayFormat: 'indices',
  objectFormat: 'dots',
  maxDepth: 5
});
```

## Error Handling

```typescript
// Depth limit exceeded
try {
  const deepData = { a: { b: { c: { d: { e: { f: 'too deep' } } } } } };
  await createForm(deepData, { maxDepth: 3 });
} catch (error) {
  console.error('Maximum nesting depth exceeded:', error.message);
}

// Null value handling
try {
  await addFormValue(form, 'field', null);
} catch (error) {
  console.error('Null values must be strings:', error.message);
}
```

## Best Practices

1. **Choose the right format**: Use `brackets` for general web forms, `indices` for APIs that need explicit indexing, `dots` for object notation.

2. **Set depth limits**: Use `maxDepth` to prevent infinite recursion with circular references.

3. **Encode keys when needed**: Set `encodeKeys: true` when sending data to APIs that require URL encoding.

4. **Use custom formatters sparingly**: Only when the built-in formats don't meet your API requirements.

5. **Test with your API**: Different APIs expect different formats, so always test with your specific backend.
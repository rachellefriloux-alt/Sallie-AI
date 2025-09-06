# Configurable Nested Formats for Uploads

## Overview

The **UploadsManager** provides a configurable solution for handling nested data structures in form uploads, addressing the TODO: "make nested formats configurable" found in the OpenAI uploads functionality.

## Features

✅ **Configurable Array Formats**: Choose how arrays are serialized in form data  
✅ **Configurable Object Formats**: Choose how nested objects are serialized  
✅ **Custom Format Strings**: Define your own formatting patterns  
✅ **Depth Limit Protection**: Prevent infinite recursion with configurable limits  
✅ **TypeScript Support**: Full type safety and IntelliSense  
✅ **Comprehensive Testing**: 27 test cases covering all functionality

## Configuration Options

### Array Formats

| Format | Example Input | Example Output |
|--------|---------------|----------------|
| `brackets` | `tags: ['ai', 'ml']` | `tags[]=ai&tags[]=ml` |
| `indexed` | `tags: ['ai', 'ml']` | `tags[0]=ai&tags[1]=ml` |
| `comma` | `tags: ['ai', 'ml']` | `tags=ai,ml` |
| `custom` | `tags: ['ai', 'ml']` | Configurable with `{key}` and `{index}` placeholders |

### Object Formats

| Format | Example Input | Example Output |
|--------|---------------|----------------|
| `brackets` | `user: {name: 'John'}` | `user[name]=John` |
| `dot` | `user: {name: 'John'}` | `user.name=John` |
| `custom` | `user: {name: 'John'}` | Configurable with `{key}` and `{prop}` placeholders |

## Usage Examples

### Basic Usage

```typescript
import { UploadsManager } from './ai/integrations/UploadsManager';

// Default configuration (brackets format)
const manager = new UploadsManager();

const data = {
  user: { name: 'Sallie', type: 'AI' },
  tags: ['companion', 'emotional-intelligence']
};

const form = await manager.createForm(data);
// Results in: user[name]=Sallie, user[type]=AI, tags[]=companion, tags[]=emotional-intelligence
```

### Custom Configuration

```typescript
import { createUploadsManager } from './ai/integrations/UploadsManager';

// API-friendly format
const apiManager = createUploadsManager({
  arrayFormat: 'indexed',
  objectFormat: 'dot',
  maxDepth: 5
});

const form = await apiManager.createForm(data);
// Results in: user.name=Sallie, user.type=AI, tags[0]=companion, tags[1]=emotional-intelligence
```

### Advanced Custom Formats

```typescript
const customManager = createUploadsManager({
  arrayFormat: 'custom',
  arrayCustomFormat: '{key}_item_{index}',
  objectFormat: 'custom',
  objectCustomFormat: '{key}__{prop}'
});

const form = await customManager.createForm(data);
// Results in: user__name=Sallie, user__type=AI, tags_item_0=companion, tags_item_1=emotional-intelligence
```

## OpenAI Integration

The **EnhancedOpenAIIntegration** class extends the existing OpenAI integration with configurable uploads:

```typescript
import { EnhancedOpenAIIntegration } from './ai/integrations/EnhancedOpenAIIntegration';

// Create with API-friendly nested formats
const openai = new EnhancedOpenAIIntegration({
  arrayFormat: 'indexed',
  objectFormat: 'dot'
});

// Upload file with complex metadata
await openai.uploadForFineTuning(file, {
  project: 'sallie-enhancement',
  version: '1.0',
  tags: ['emotional-intelligence', 'conversation'],
  config: {
    model: 'gpt-4',
    epochs: 3,
    learningRate: 0.001
  }
});
```

## Configuration Interface

```typescript
interface NestedFormatConfig {
  arrayFormat: 'brackets' | 'indexed' | 'comma' | 'custom';
  arrayCustomFormat?: string;
  objectFormat: 'brackets' | 'dot' | 'custom';
  objectCustomFormat?: string;
  maxDepth: number;
}
```

## Default Configuration

```typescript
const DEFAULT_NESTED_CONFIG = {
  arrayFormat: 'brackets',
  objectFormat: 'brackets',
  maxDepth: 10
};
```

## Safety Features

- **Depth Limits**: Prevents infinite recursion with configurable `maxDepth`
- **Type Validation**: Comprehensive validation of input data types
- **Error Handling**: Clear error messages for troubleshooting
- **Null Handling**: Explicit handling of null/undefined values

## Testing

Run the comprehensive test suite:

```bash
npm test -- --testPathPattern=UploadsManager
```

## Integration with Existing Code

This implementation is designed for minimal disruption:

1. **Backward Compatible**: Default configuration matches common expectations
2. **Modular Design**: Can be used independently or with existing systems
3. **Salle 1.0 Compliant**: Follows the project's architectural guidelines
4. **Zero Dependencies**: Uses only standard web APIs

## Got it, love. 💪

The configurable nested formats system provides the flexibility needed for different API requirements while maintaining the robust, caring approach that defines Sallie's personality.
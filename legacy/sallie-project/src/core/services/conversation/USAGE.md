# Conversation System Usage Guide

## Overview

The Conversation System provides a comprehensive Natural Language Understanding (NLU), Response Generation, and Dialogue Management framework for creating engaging, context-aware conversational experiences.

## Quick Start

```typescript
import { ConversationService } from '@core/services/conversation';

// Initialize the service
const conversationService = new ConversationService();

// Start a new conversation
const conversationId = conversationService.startConversation('user123', 'session456');

// Process a message
const response = await conversationService.processMessage('Hello!', {
  userId: 'user123',
  conversationId,
  sessionId: 'session456',
});

console.log(response.text); // "Hello! How can I help you today?"
```

## Core Features

### 1. Intent Recognition

The system automatically recognizes user intents:

```typescript
// Information Request
await conversationService.processMessage('What is the weather like?', options);
// Intent: INFORMATION_REQUEST

// Action Request
await conversationService.processMessage('Please remind me to call mom', options);
// Intent: ACTION_REQUEST

// Emotional Expression
await conversationService.processMessage('I feel really happy today', options);
// Intent: EMOTIONAL_EXPRESSION
```

### 2. Entity Extraction

Entities are automatically extracted from messages:

```typescript
const response = await conversationService.processMessage(
  'My name is John and I live in New York',
  options
);

// Extracts: Person entity "John", Location entity "New York"
console.log(response.metadata.entities); // 2
```

### 3. Sentiment Analysis

Multi-dimensional sentiment is analyzed:

```typescript
const response = await conversationService.processMessage(
  'I am so excited and happy!',
  options
);

// Positive sentiment detected
console.log(response.metadata.sentiment); // > 0
```

### 4. Context Management

The system maintains conversation context across turns:

```typescript
// Turn 1
await conversationService.processMessage('My favorite color is blue', options);

// Turn 2
await conversationService.processMessage('What is my favorite color?', options);
// System remembers and can reference earlier conversation
```

### 5. Personality-Based Responses

Customize responses with personality traits:

```typescript
const response = await conversationService.processMessage('Hello!', {
  ...options,
  personality: {
    openness: 0.8,
    conscientiousness: 0.7,
    extraversion: 0.9,
    agreeableness: 0.8,
    neuroticism: 0.3,
    warmth: 0.9,
    humor: 0.6,
  },
});

// Response will be styled according to personality traits
```

### 6. Memory Integration

Include relevant memories in responses:

```typescript
// Add a memory
conversationService.getResponseGenerator().addMemory({
  id: 'mem_1',
  type: 'preference',
  content: 'user prefers coffee in the morning',
  entities: ['coffee', 'morning'],
  timestamp: new Date(),
  importance: 0.8,
  confidence: 0.9,
});

// Memory will be naturally integrated when relevant
const response = await conversationService.processMessage(
  'What should I drink?',
  {
    ...options,
    includeMemories: true,
  }
);
```

## Advanced Usage

### Multi-Turn Conversations

```typescript
const conversationId = conversationService.startConversation('user1', 'session1');

// Turn 1
await conversationService.processMessage('I need help with something', {
  userId: 'user1',
  conversationId,
  sessionId: 'session1',
});

// Turn 2
await conversationService.processMessage('Actually, can you remind me later?', {
  userId: 'user1',
  conversationId,
  sessionId: 'session1',
});

// Context is maintained throughout
```

### Handling Clarifications

When the system needs clarification:

```typescript
const response = await conversationService.processMessage('That thing', options);

if (response.needsClarification) {
  console.log(response.text); // "Could you clarify what you mean by 'that thing'?"
}
```

### Topic Suggestions

The system can proactively suggest topics:

```typescript
const response = await conversationService.processMessage('ok', options);

if (response.suggestedTopics && response.suggestedTopics.length > 0) {
  console.log(response.suggestedTopics[0]);
  // "Would you like to talk about [relevant topic]?"
}
```

### Streaming Responses

Stream responses in real-time for better UX:

```typescript
await conversationService.processMessageStreaming('Tell me a story', {
  userId: 'user1',
  conversationId,
  sessionId: 'session1',
  chunkSize: 5, // Words per chunk
  onChunk: (chunk) => {
    // Display chunk as it arrives
    console.log('Chunk:', chunk);
    // Update UI, emit to websocket, etc.
  },
  onComplete: (response) => {
    console.log('Complete!', response.confidence);
  },
});
```

### Meta-Conversation

The system can handle conversations about the conversation itself:

```typescript
// User asks about the conversation
const response = await conversationService.processMessage(
  'How is our conversation going?',
  options
);

// System provides self-aware commentary
console.log(response.text);
// "I think we're having a great conversation! The discussion is flowing naturally..."
```

### Conversation Context

Access conversation context:

```typescript
const context = conversationService.getContext(conversationId);

console.log(context.turns.length); // Number of turns
console.log(context.activeTopics); // Current discussion topics
console.log(context.currentSentiment); // Overall sentiment
```

### End Conversation

```typescript
conversationService.endConversation(conversationId);
```

## Component Architecture

### NLU Components

- **IntentRecognizer**: Identifies user intentions
- **EntityExtractor**: Extracts named entities
- **SentimentAnalyzer**: Analyzes emotional tone
- **TopicModeler**: Identifies conversation topics
- **ReferenceResolver**: Resolves pronouns and references
- **SpeechActClassifier**: Classifies speech acts
- **ContextManager**: Manages conversation state

### Generation Components

- **ResponseGenerator**: Orchestrates response generation
- **TemplateEngine**: Manages response templates
- **ContentFiller**: Fills dynamic content
- **PersonalityStyler**: Applies personality styling
- **MemoryIntegrator**: Integrates memories
- **AppropriatenessChecker**: Validates responses
- **DiversityManager**: Ensures response variety

### Dialogue Components

- **DialogueManager**: Orchestrates dialogue flow
- **FlowController**: Manages conversation flow
- **TurnTakingManager**: Handles turn transitions
- **ClarificationEngine**: Handles ambiguity
- **RepairStrategy**: Recovers from errors
- **TopicSuggester**: Suggests relevant topics
- **ConversationMemory**: Tracks history

## Performance

- **Response Time**: Typically sub-200ms for simple queries
- **Context Window**: Configurable (default: 10 turns)
- **Memory**: Efficient context pruning
- **Concurrent Conversations**: Supported

## Error Handling

```typescript
try {
  const response = await conversationService.processMessage(message, options);
} catch (error) {
  console.error('Conversation error:', error);
  // System provides graceful degradation
}
```

## Health Monitoring

```typescript
const health = conversationService.getHealthStatus();

console.log(health.healthy); // true/false
console.log(health.components); // Component status
```

## Cleanup

Periodically cleanup old conversations:

```typescript
// Cleanup conversations older than 1 hour
conversationService.cleanup(3600000);
```

## Best Practices

1. **Start New Conversations**: Create new conversation IDs for different sessions
2. **Handle Clarifications**: Check `needsClarification` and respond appropriately
3. **Use Personality**: Customize personality traits for consistent character
4. **Include Memories**: Enable memory integration for personalized responses
5. **Monitor Health**: Check health status in production
6. **Cleanup Regularly**: Remove old conversations to free memory

## Testing

```typescript
import { ConversationService } from '@core/services/conversation';

describe('My Conversation Tests', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
  });

  it('should handle basic conversation', async () => {
    const conversationId = service.startConversation('user1', 'session1');
    
    const response = await service.processMessage('Hello!', {
      userId: 'user1',
      conversationId,
      sessionId: 'session1',
    });
    
    expect(response.text).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0);
  });
});
```

## Integration with Other Services

For detailed integration examples with Memory, Personality, Values, and Event services, see [INTEGRATION.md](./INTEGRATION.md).

## Performance

The system is optimized for production use:

```typescript
// Run performance benchmarks
// See __tests__/performance.benchmark.ts

// Response times:
// - Simple queries: < 200ms
// - Complex queries: < 300ms
// - Concurrent conversations: Efficient
// - Long conversation history: Maintained performance
```

## Examples

See the `__tests__` directory for comprehensive usage examples including:
- Unit tests for all components
- Integration tests for conversation flows
- Performance benchmarks
- Meta-conversation examples

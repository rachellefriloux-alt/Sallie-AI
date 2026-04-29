# Integration Guide

This document provides detailed integration examples for connecting the Conversation System with other Sallie AI services.

## Memory Service Integration

```typescript
import { ConversationService } from '@core/services/conversation';
import { MemoryService } from '@core/services/memory'; // To be implemented

class IntegratedConversationService {
  private conversationService: ConversationService;
  private memoryService: MemoryService;

  constructor() {
    this.conversationService = new ConversationService();
    this.memoryService = new MemoryService();
  }

  async processMessage(userId: string, message: string, sessionId: string) {
    const conversationId = this.getOrCreateConversation(userId, sessionId);

    // Retrieve relevant memories
    const memories = await this.memoryService.retrieveRelevant(userId, message);
    
    // Add memories to conversation system
    for (const memory of memories) {
      this.conversationService.getResponseGenerator().addMemory({
        id: memory.id,
        type: memory.type,
        content: memory.content,
        entities: memory.entities,
        timestamp: memory.timestamp,
        importance: memory.importance,
        confidence: memory.confidence,
      });
    }

    // Process message
    const response = await this.conversationService.processMessage(message, {
      userId,
      conversationId,
      sessionId,
      includeMemories: true,
    });

    // Store conversation turn in memory
    await this.memoryService.store({
      userId,
      conversationId,
      userMessage: message,
      assistantResponse: response.text,
      timestamp: new Date(),
      context: {
        intent: response.metadata.intent,
        sentiment: response.metadata.sentiment,
      },
    });

    return response;
  }

  private getOrCreateConversation(userId: string, sessionId: string): string {
    // Implementation to retrieve or create conversation ID
    const key = `${userId}_${sessionId}`;
    // Check cache/storage for existing conversation
    return this.conversationService.startConversation(userId, sessionId);
  }
}
```

## Personality Service Integration

```typescript
import { ConversationService, PersonalityTraits } from '@core/services/conversation';
import { PersonalityService } from '@core/services/personality'; // To be implemented

class PersonalizedConversationService {
  private conversationService: ConversationService;
  private personalityService: PersonalityService;

  constructor() {
    this.conversationService = new ConversationService();
    this.personalityService = new PersonalityService();
  }

  async processMessage(userId: string, message: string, sessionId: string) {
    const conversationId = this.conversationService.startConversation(userId, sessionId);

    // Get user's personality profile
    const personality = await this.personalityService.getProfile(userId);

    // Convert to conversation system format
    const traits: PersonalityTraits = {
      openness: personality.openness || 0.7,
      conscientiousness: personality.conscientiousness || 0.8,
      extraversion: personality.extraversion || 0.6,
      agreeableness: personality.agreeableness || 0.9,
      neuroticism: personality.neuroticism || 0.3,
      warmth: personality.warmth || 0.8,
      humor: personality.humor || 0.5,
    };

    // Process with personality
    const response = await this.conversationService.processMessage(message, {
      userId,
      conversationId,
      sessionId,
      personality: traits,
    });

    // Update personality profile based on conversation
    await this.personalityService.updateFromConversation(userId, {
      sentiment: response.metadata.sentiment,
      engagement: this.getEngagement(conversationId),
      preferences: this.extractPreferences(message),
    });

    return response;
  }

  private getEngagement(conversationId: string): number {
    const context = this.conversationService.getContext(conversationId);
    return context?.turns.length || 0 > 5 ? 0.8 : 0.5;
  }

  private extractPreferences(message: string): string[] {
    // Extract user preferences from message
    const preferences: string[] = [];
    if (/\b(like|love|prefer|enjoy)\b/i.test(message)) {
      preferences.push('positive_expression');
    }
    return preferences;
  }
}
```

## Values Service Integration

```typescript
import { ConversationService } from '@core/services/conversation';
import { ValuesService } from '@core/services/values'; // To be implemented

class ValueAlignedConversationService {
  private conversationService: ConversationService;
  private valuesService: ValuesService;

  constructor() {
    this.conversationService = new ConversationService();
    this.valuesService = new ValuesService();
  }

  async processMessage(userId: string, message: string, sessionId: string) {
    const conversationId = this.conversationService.startConversation(userId, sessionId);

    // Get user's core values
    const values = await this.valuesService.getUserValues(userId);

    // Process message
    const response = await this.conversationService.processMessage(message, {
      userId,
      conversationId,
      sessionId,
    });

    // Validate response aligns with user values
    const alignment = await this.valuesService.checkAlignment(response.text, values);

    if (alignment.score < 0.5) {
      // Response doesn't align well, request modification
      console.warn('Response alignment low, consider adjusting');
      // Could regenerate or modify response here
    }

    // Track value expressions in conversation
    const expressedValues = this.extractValues(message);
    if (expressedValues.length > 0) {
      await this.valuesService.updateUserValues(userId, expressedValues);
    }

    return response;
  }

  private extractValues(message: string): string[] {
    const values: string[] = [];
    
    // Simple value detection
    const valuePatterns = {
      honesty: /\b(honest|truth|genuine|authentic)\b/i,
      kindness: /\b(kind|compassionate|caring|empathy)\b/i,
      respect: /\b(respect|dignity|honor)\b/i,
      fairness: /\b(fair|just|equal|equity)\b/i,
    };

    for (const [value, pattern] of Object.entries(valuePatterns)) {
      if (pattern.test(message)) {
        values.push(value);
      }
    }

    return values;
  }
}
```

## Event Bus Integration

```typescript
import { ConversationService } from '@core/services/conversation';
import { EventBus } from '@core/services/events'; // To be implemented

class EventDrivenConversationService {
  private conversationService: ConversationService;
  private eventBus: EventBus;

  constructor() {
    this.conversationService = new ConversationService();
    this.eventBus = new EventBus();

    // Subscribe to events
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for user activity events
    this.eventBus.on('user:activity', async (event) => {
      console.log('User activity detected:', event);
      // Could trigger proactive conversation suggestions
    });

    // Listen for external triggers
    this.eventBus.on('notification:received', async (event) => {
      // Could initiate conversation about notification
      console.log('Notification received:', event);
    });

    // Listen for context changes
    this.eventBus.on('context:changed', async (event) => {
      console.log('Context changed:', event);
      // Update conversation context
    });
  }

  async processMessage(userId: string, message: string, sessionId: string) {
    const conversationId = this.conversationService.startConversation(userId, sessionId);

    // Emit conversation start event
    this.eventBus.emit('conversation:message_received', {
      userId,
      conversationId,
      message,
      timestamp: new Date(),
    });

    const response = await this.conversationService.processMessage(message, {
      userId,
      conversationId,
      sessionId,
    });

    // Emit response event
    this.eventBus.emit('conversation:response_generated', {
      userId,
      conversationId,
      response: response.text,
      metadata: response.metadata,
      timestamp: new Date(),
    });

    // Emit specific events based on conversation state
    if (response.needsClarification) {
      this.eventBus.emit('conversation:clarification_needed', {
        userId,
        conversationId,
      });
    }

    if (response.suggestedTopics && response.suggestedTopics.length > 0) {
      this.eventBus.emit('conversation:topic_suggested', {
        userId,
        conversationId,
        topics: response.suggestedTopics,
      });
    }

    return response;
  }
}
```

## Streaming Response Example

```typescript
import { ConversationService } from '@core/services/conversation';

async function streamingConversationExample() {
  const service = new ConversationService();
  const conversationId = service.startConversation('user1', 'session1');

  console.log('User: Hello!');
  console.write('Assistant: ');

  await service.processMessageStreaming('Hello!', {
    userId: 'user1',
    conversationId,
    sessionId: 'session1',
    chunkSize: 5, // Stream 5 words at a time
    onChunk: (chunk) => {
      // Display chunk as it's generated
      process.stdout.write(chunk + ' ');
    },
    onComplete: (response) => {
      console.log('\n[Complete]');
      console.log('Confidence:', response.confidence);
      console.log('Intent:', response.metadata.intent);
    },
  });
}
```

## Full Application Integration

```typescript
import { 
  ConversationService,
  ProcessMessageOptions,
  ConversationResponse 
} from '@core/services/conversation';

class SallieAIAssistant {
  private conversationService: ConversationService;
  private activeConversations: Map<string, string>;

  constructor() {
    this.conversationService = new ConversationService();
    this.activeConversations = new Map();

    // Periodic cleanup
    setInterval(() => {
      this.conversationService.cleanup(3600000); // 1 hour
    }, 600000); // Run every 10 minutes
  }

  async handleUserMessage(
    userId: string,
    message: string,
    options?: {
      personality?: any;
      includeMemories?: boolean;
      streaming?: boolean;
    }
  ): Promise<ConversationResponse> {
    // Get or create conversation
    const sessionId = this.getSessionId(userId);
    let conversationId = this.activeConversations.get(userId);

    if (!conversationId) {
      conversationId = this.conversationService.startConversation(userId, sessionId);
      this.activeConversations.set(userId, conversationId);
    }

    // Prepare options
    const messageOptions: ProcessMessageOptions = {
      userId,
      conversationId,
      sessionId,
      personality: options?.personality,
      includeMemories: options?.includeMemories ?? true,
    };

    // Process with or without streaming
    if (options?.streaming) {
      return this.conversationService.processMessageStreaming(message, {
        ...messageOptions,
        onChunk: (chunk) => this.handleChunk(userId, chunk),
      });
    }

    return this.conversationService.processMessage(message, messageOptions);
  }

  async endConversation(userId: string) {
    const conversationId = this.activeConversations.get(userId);
    
    if (conversationId) {
      this.conversationService.endConversation(conversationId);
      this.activeConversations.delete(userId);
    }
  }

  getConversationHealth(): boolean {
    const health = this.conversationService.getHealthStatus();
    return health.healthy;
  }

  private getSessionId(userId: string): string {
    return `session_${userId}_${Date.now()}`;
  }

  private handleChunk(userId: string, chunk: string) {
    // Handle streaming chunk
    // Could emit to UI, websocket, etc.
    console.log(`[${userId}] Chunk:`, chunk);
  }
}

// Usage
const assistant = new SallieAIAssistant();

async function example() {
  const response = await assistant.handleUserMessage(
    'user123',
    'Hello! How are you?',
    {
      personality: {
        warmth: 0.9,
        extraversion: 0.8,
      },
      streaming: true,
    }
  );

  console.log('Response:', response.text);
  console.log('Confidence:', response.confidence);
}
```

## Best Practices

1. **Initialize Once**: Create a single instance of ConversationService and reuse it
2. **Cleanup Regularly**: Call `cleanup()` periodically to free memory
3. **Handle Errors**: Wrap calls in try-catch blocks for graceful degradation
4. **Monitor Health**: Check `getHealthStatus()` in production
5. **Use Streaming**: For better UX, use streaming responses in interactive applications
6. **Integrate Services**: Connect Memory, Personality, and Values services for richer conversations
7. **Event Tracking**: Emit events for analytics and monitoring
8. **Context Management**: Respect conversation boundaries and clean up when done

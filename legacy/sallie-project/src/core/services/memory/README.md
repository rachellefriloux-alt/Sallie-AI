# Memory Service

A comprehensive memory system for the Sallie AI Companion, implementing episodic, semantic, procedural, and emotional memory types with advanced retrieval, consolidation, and association capabilities.

## Overview

The Memory Service provides a sophisticated memory management system that:

- **Stores multiple memory types** with rich metadata and versioning
- **Indexes memories** for fast retrieval by entities, tags, time, and type
- **Associates related memories** automatically based on co-occurrence and similarity
- **Consolidates memories** from short-term to long-term storage
- **Supports multiple retrieval strategies** for contextual, temporal, associative, and emotional recall
- **Implements memory decay** to simulate natural forgetting
- **Ensures privacy** with encryption support for sensitive memories

## Architecture

### Core Components

```
src/core/services/memory/
├── models/                  # Memory entity models
│   ├── MemoryEntity.ts     # Base memory class
│   ├── EpisodicMemory.ts   # Event and conversation memories
│   ├── SemanticMemory.ts   # Factual knowledge
│   ├── ProceduralMemory.ts # Task procedures
│   └── EmotionalMemory.ts  # Emotional experiences
├── storage/                # Storage layer
│   ├── MemoryStore.ts      # Storage interface
│   ├── LocalStorageAdapter.ts
│   └── EncryptedStorage.ts
├── retrieval/              # Retrieval strategies
│   ├── RetrievalStrategy.ts
│   ├── ContextualRetrieval.ts
│   ├── AssociationRetrieval.ts
│   ├── TemporalRetrieval.ts
│   └── EmotionalRetrieval.ts
├── consolidation/          # Memory consolidation
│   ├── ConsolidationEngine.ts
│   └── ShortTermBuffer.ts
├── association/            # Memory associations
│   ├── AssociationGraph.ts
│   └── AssociationEngine.ts
├── indexing/              # Fast lookup indexes
│   ├── MemoryIndex.ts
│   └── TemporalIndex.ts
├── MemoryService.ts       # Main service
└── index.ts               # Public API exports
```

## Memory Types

### Episodic Memory

Stores specific events, interactions, and conversations with temporal and spatial context.

```typescript
const memory = new EpisodicMemory('memory-1', {
  description: 'Discussion about project roadmap',
  participants: [
    { id: 'user-1', name: 'John' },
    { id: 'user-2', name: 'Jane' }
  ],
  temporal: {
    startTime: new Date('2025-01-15T10:00:00Z'),
    endTime: new Date('2025-01-15T11:30:00Z')
  },
  spatial: {
    location: 'Conference Room A'
  },
  topics: ['project', 'planning', 'roadmap']
});
```

### Semantic Memory

Represents factual knowledge, preferences, beliefs, and relationships.

```typescript
const memory = new SemanticMemory('sem-1', {
  knowledgeType: SemanticKnowledgeType.PREFERENCE,
  subject: 'John',
  property: 'favoriteColor',
  value: 'blue',
  confidence: 0.9
});
```

### Procedural Memory

Stores task procedures and effective assistance patterns.

```typescript
const memory = new ProceduralMemory('proc-1', {
  name: 'Morning Standup',
  description: 'Daily team standup procedure',
  context: {
    activity: 'team-meeting',
    environment: 'remote'
  },
  steps: [
    { order: 1, description: 'Join video call' },
    { order: 2, description: 'Share yesterday\'s progress' },
    { order: 3, description: 'Discuss today\'s plan' }
  ],
  effectiveness: {
    successCount: 45,
    failureCount: 2
  }
});
```

### Emotional Memory

Records emotional experiences with triggers and responses.

```typescript
const memory = new EmotionalMemory('em-1', {
  emotionalState: {
    primaryEmotion: 'joy',
    secondaryEmotions: ['excitement', 'pride'],
    intensity: 0.8,
    valence: 0.9,
    arousal: 0.7
  },
  triggers: [
    {
      type: 'event',
      description: 'Project launch success',
      strength: 0.9
    }
  ],
  context: {
    situation: 'Product launch event',
    peoplePresent: ['team-members']
  }
});
```

## Usage

### Basic Setup

```typescript
import { MemoryService } from '@core/services/memory';

// Initialize the service
const memoryService = new MemoryService({
  autoConsolidate: true,
  consolidationInterval: 300000, // 5 minutes
  autoDecay: true,
  decayInterval: 3600000 // 1 hour
});
```

### Storing Memories

```typescript
// Create and store a memory
const memory = new EpisodicMemory('conv-1', {
  description: 'User asked about memory system',
  participants: [
    { id: 'user-123', name: 'Alice' }
  ],
  temporal: {
    startTime: new Date()
  },
  topics: ['memory', 'AI', 'technology']
});

await memoryService.storeMemory(memory);
```

### Retrieving Memories

#### Contextual Retrieval

```typescript
const memories = await memoryService.retrieveContextual({
  topics: ['project', 'planning'],
  entities: ['user-123'],
  conversationContext: {
    currentTopic: 'project management'
  }
}, {
  limit: 10,
  minRelevance: 0.5
});
```

#### By Entity

```typescript
const memories = await memoryService.getMemoriesByEntity('user-123');
```

#### By Tag

```typescript
const memories = await memoryService.getMemoriesByTag('work');
```

#### Recent Memories

```typescript
const recentMemories = await memoryService.getRecentMemories(7); // Last 7 days
```

#### Associated Memories

```typescript
const associated = await memoryService.getAssociatedMemories(
  'memory-id',
  0.6 // minimum association strength
);
```

### Retrieval Strategies

The service supports multiple retrieval strategies:

```typescript
// Contextual retrieval (entities, topics, conversation)
const contextual = await memoryService.retrieveMemories(
  'contextual',
  { topics: ['AI'], entities: ['user-1'] },
  { limit: 5 }
);

// Association-based retrieval
const associated = await memoryService.retrieveMemories(
  'association',
  { seedMemoryIds: ['memory-1'] },
  { limit: 10 }
);

// Temporal retrieval
const temporal = await memoryService.retrieveMemories(
  'temporal',
  {
    temporalContext: {
      timeRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31')
      }
    }
  },
  { limit: 20 }
);

// Emotional retrieval
const emotional = await memoryService.retrieveMemories(
  'emotional',
  {
    emotionalContext: {
      currentEmotion: 'joy',
      emotionalIntensity: 0.8
    }
  },
  { limit: 5 }
);
```

### Memory Consolidation

```typescript
// Manual consolidation trigger
await memoryService.consolidate();

// Automatic consolidation runs periodically if enabled
const service = new MemoryService({
  autoConsolidate: true,
  consolidationInterval: 300000 // 5 minutes
});
```

### Export and Import

```typescript
// Export all memories
const jsonData = await memoryService.exportMemories();

// Save to file or send to backup service
// ...

// Import memories
const count = await memoryService.importMemories(jsonData);
console.log(`Imported ${count} memories`);
```

### Service Statistics

```typescript
const stats = await memoryService.getStats();

console.log('Storage:', stats.storage);
console.log('Short-term buffer:', stats.shortTermBuffer);
console.log('Associations:', stats.associations);
console.log('Indexes:', stats.indexes);
```

### Cleanup

```typescript
// Dispose of service when done
memoryService.dispose();
```

## Privacy and Security

### Privacy Levels

```typescript
enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SENSITIVE = 'sensitive',
  CONFIDENTIAL = 'confidential'
}
```

### Encrypted Storage

```typescript
import { LocalStorageAdapter, EncryptedStorage } from '@core/services/memory';

// Create base storage
const baseStore = new LocalStorageAdapter();

// Wrap with encryption
const encryptedStore = new EncryptedStorage(baseStore, {
  encryptionKey: 'your-secure-key',
  encryptLevels: [PrivacyLevel.SENSITIVE, PrivacyLevel.CONFIDENTIAL]
});

// Use encrypted storage
const service = new MemoryService({ store: encryptedStore });
```

## Advanced Features

### Memory Decay

Memories naturally decay over time unless reinforced through access:

```typescript
// Decay is applied automatically if enabled
const service = new MemoryService({
  autoDecay: true,
  decayInterval: 3600000, // 1 hour
  decayRate: 0.01 // 1% decay per cycle
});

// Get effective importance (considering decay)
const importance = memory.getEffectiveImportance();
```

### Association Formation

Memories are automatically associated based on:
- Entity co-occurrence
- Topic similarity
- Temporal proximity
- Emotional similarity
- Explicit references

```typescript
// Associations form automatically when storing memories
await memoryService.storeMemory(memory);

// Get association graph statistics
const stats = await memoryService.getStats();
console.log(stats.associations);
```

### Memory Versioning

```typescript
// Update memory content
memory.update(newContent, 'Updated description');

// Version info is tracked automatically
console.log(memory.version.version); // 2
console.log(memory.version.previousVersionId); // 'memory-id_v1'
```

## Testing

The memory service includes comprehensive unit, integration, performance, and memory leak tests:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test MemoryEntity.test.ts
npm test MemoryService.performance.test.ts
npm test MemoryService.memoryleak.test.ts
```

Test coverage includes:

### Unit & Integration Tests (28 tests)
- Memory entity models (all 4 types)
- Storage operations (CRUD, query, export/import)
- Retrieval strategies (all 6 strategies)
- Consolidation engine
- Association formation
- Index operations
- Full integration scenarios

### Performance Tests (15 tests)
- Large memory set operations (1000+ memories)
- Retrieval performance on large datasets
- Contextual search performance
- Association building efficiency
- Index performance with many entities
- Pattern mining on large datasets
- Semantic search performance
- Attention mechanism performance
- Export/import performance with 500+ memories
- Concurrent operation handling

### Memory Leak Tests (11 tests)
- Resource cleanup and disposal
- Memory growth control
- Index cleanup on deletion
- Association cleanup
- Short-term buffer management
- Event listener cleanup
- Large object cleanup
- Circular reference prevention
- Pattern miner cleanup

**Total: 54 tests, 100% passing**

## Performance Considerations

### Indexing

The service uses multiple indexes for fast retrieval:
- **Entity Index**: O(1) lookup by entity
- **Tag Index**: O(1) lookup by tag
- **Type Index**: O(1) lookup by memory type
- **Temporal Index**: O(1) lookup by time bucket

### Memory Limits

```typescript
// Short-term buffer has configurable capacity
const service = new MemoryService({
  // Buffer config is internal to ShortTermBuffer
  // Default: 50 memories, 1 hour time window
});
```

### Optimization

```typescript
// Optimize storage (cleanup, defragmentation)
await memoryService.getStats().storage.optimize();

// Prune weak associations
// Happens automatically during decay cycles
```

## Best Practices

1. **Set appropriate privacy levels** for sensitive information
2. **Use specific memory types** for different kinds of information
3. **Add descriptive tags and entities** to improve retrieval
4. **Enable auto-consolidation** for production use
5. **Regular backups** using export functionality
6. **Monitor statistics** to understand memory usage
7. **Test retrieval strategies** to ensure relevant results
8. **Configure decay rates** based on use case

## Advanced Features

### Vector Embeddings and Semantic Search

The service now includes semantic indexing with vector embeddings:

```typescript
// Search for semantically similar memories
const similar = await memoryService.searchSemantic(
  'project planning discussion',
  10,
  0.5
);

// Set custom embedding function (e.g., OpenAI, Sentence-BERT)
memoryService.semanticIndex.setEmbeddingFunction(async (text) => {
  // Your embedding logic here
  return embeddings;
});
```

### Pattern Mining

Automatic detection of recurring patterns in memories:

```typescript
// Mine patterns from all memories
const patterns = await memoryService.minePatterns();

// Get specific pattern types
const topicClusters = memoryService.getPatterns(PatternType.TOPIC_CLUSTER);
const emotionalCycles = memoryService.getPatterns(PatternType.EMOTIONAL_CYCLE);

// Pattern types include:
// - Entity co-occurrence
// - Topic clusters
// - Temporal sequences
// - Emotional cycles
// - Behavioral patterns
```

### Attention Mechanism

Advanced importance weighting using attention-based algorithms:

```typescript
// Apply attention mechanism to update memory importance
await memoryService.applyAttentionWeighting();

// Attention considers:
// - Recency
// - Frequency of access
// - Network connectivity
// - Emotional intensity
// - User interactions
// - Self-attention across memories
```

### Cross-Platform Synchronization

Built-in sync engine for multi-device support:

```typescript
import { SyncEngine } from '@core/services/memory';

const syncEngine = new SyncEngine(localStore, {
  autoSync: true,
  syncInterval: 300000, // 5 minutes
  conflictResolution: 'newest',
  enableDeltaSync: true
});

// Sync with remote store
const result = await syncEngine.sync(remoteStore);

console.log(`Pushed: ${result.pushed}, Pulled: ${result.pulled}`);
```

### Query Retrieval

Direct query-based retrieval with SQL-like filtering:

```typescript
const memories = await memoryService.retrieveMemories('query', 
  QueryRetrieval.buildQueryContext({
    type: MemoryType.EPISODIC,
    tags: ['work', 'project'],
    dateRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31')
    },
    minImportance: 0.5,
    textSearch: 'deadline'
  }),
  { limit: 20 }
);
```

## Future Enhancements

- Graph neural networks for advanced association prediction
- Distributed storage backends for scalability
- Real-time collaboration features with operational transforms

## License

MIT License - See LICENSE file for details

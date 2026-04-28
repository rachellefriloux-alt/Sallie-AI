# Memory Service Documentation

## Overview

The Memory Service is a comprehensive, production-ready memory management system for Sallie AI. It implements all four memory types (Episodic, Semantic, Procedural, and Emotional) with advanced features including encryption, compression, sophisticated retrieval strategies, and association management.

## Features

### Core Memory Types

1. **Episodic Memory** - Stores personal experiences and events
   - Event details with participants, location, and emotional state
   - Sequential numbering for chronological ordering
   - Clustering capabilities for related events
   - Significance scoring

2. **Semantic Memory** - Stores factual knowledge
   - Subject-predicate-object knowledge representation
   - Category hierarchies
   - Verification tracking with confidence scores
   - Cross-referencing support

3. **Procedural Memory** - Stores processes and procedures
   - Step-by-step procedure representation
   - Context-specific adaptations
   - Effectiveness tracking
   - Condition-based execution

4. **Emotional Memory** - Stores emotional experiences
   - Primary and secondary emotion tracking
   - Trigger and response mapping
   - Intensity and effectiveness tracking
   - Emotional valence and arousal calculation

### Advanced Features

#### Security
- **AES-256-GCM Encryption** - Military-grade encryption for sensitive data
- **PBKDF2 Key Derivation** - Secure key generation from passwords
- **Privacy Levels** - Granular privacy control (Public, Private, Confidential, Restricted)
- **Secure Hashing** - SHA-256 for data integrity verification

#### Storage Optimization
- **Lossless Compression** - GZIP compression for efficient storage
- **Semantic Compression** - Meaning-preserving summarization
- **Auto-Compression** - Intelligent compression based on age and size
- **Storage Quota Management** - Automatic cleanup of old/low-priority data

#### Retrieval Strategies
1. **Contextual Retrieval** - Context-aware memory matching
2. **Association-Based Retrieval** - Graph traversal with configurable depth
3. **Query-Based Retrieval** - Keyword and boolean search
4. **Temporal Retrieval** - Time-range queries
5. **Emotional Retrieval** - Emotion-based filtering
6. **Importance-Driven Retrieval** - Priority-based ranking
7. **Pattern-Based Retrieval** - Sequence and theme identification

#### Association Management
- **Multi-Type Associations** - Causal, Temporal, Semantic, Emotional, Contextual
- **Weighted Graph** - Association strength tracking
- **Graph Traversal** - Multi-hop reasoning with depth limits
- **Automatic Association** - Pattern-based association creation
- **Circular Detection** - Prevents infinite loops in traversal

#### Memory Operations
- **Consolidation** - Automatic background processing of memories
- **Association Formation** - Similarity-based linking
- **Prioritization** - Multi-factor importance scoring
- **Decay Simulation** - Time-based memory degradation
- **Version Control** - Track changes to memories over time

## Installation

```bash
npm install
```

## Usage

### Basic Setup

```typescript
import { MemoryService } from './src/core/memory/MemoryService';

const memoryService = new MemoryService({
  encryptionPassword: 'your-secure-password',
  maxMemories: 100000,
  consolidationInterval: 300000, // 5 minutes
  autoCompress: true,
});
```

### Creating Memories

#### Episodic Memory

```typescript
const episodicMemory = await memoryService.createEpisodicMemory(
  {
    name: 'Team Meeting',
    description: 'Weekly sprint planning',
    participants: ['Alice', 'Bob', 'Charlie'],
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco Office',
    },
    emotionalState: [EmotionType.JOY, EmotionType.ANTICIPATION],
    significance: 4,
  },
  'We discussed the new feature roadmap and set sprint goals',
  'work'
);
```

#### Semantic Memory

```typescript
const semanticMemory = await memoryService.createSemanticMemory(
  {
    subject: 'Alice',
    predicate: 'is skilled in',
    object: 'TypeScript',
    category: ['people', 'skills', 'technology'],
    verified: true,
    verificationSource: 'code review',
  },
  'Alice has demonstrated expert-level TypeScript skills',
  'observation'
);
```

#### Procedural Memory

```typescript
const proceduralMemory = await memoryService.createProceduralMemory(
  {
    name: 'Code Review Process',
    steps: [
      {
        order: 1,
        action: 'Read PR description',
        description: 'Understand the changes being made',
      },
      {
        order: 2,
        action: 'Review code changes',
        description: 'Check for correctness and style',
      },
      {
        order: 3,
        action: 'Test changes',
        description: 'Run tests and verify functionality',
      },
      {
        order: 4,
        action: 'Provide feedback',
        description: 'Comment on improvements or approve',
      },
    ],
    conditions: { role: 'developer', access: 'repository' },
    effectivenessScore: 0.9,
    adaptations: [],
  },
  'Standard process for reviewing code changes in pull requests',
  'learned'
);
```

#### Emotional Memory

```typescript
const emotionalMemory = await memoryService.createEmotionalMemory(
  {
    primaryEmotion: EmotionType.JOY,
    secondaryEmotions: [EmotionType.PRIDE, EmotionType.RELIEF],
    intensity: 0.9,
    trigger: 'Project launch success',
    response: 'Celebrated with team, felt accomplished',
    effectiveness: 0.95,
  },
  'Successfully launched the new feature to production',
  'experience'
);
```

### Retrieving Memories

#### Simple Retrieval

```typescript
// By type
const episodicMemories = await memoryService.retrieveMemories({
  types: [MemoryType.EPISODIC],
  limit: 10,
});

// By keywords
const searchResults = await memoryService.retrieveMemories({
  keywords: ['Alice', 'TypeScript'],
});

// By time range
const recentMemories = await memoryService.retrieveMemories({
  timeRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date(),
  },
});
```

#### Complex Queries

```typescript
const result = await memoryService.retrieveMemories({
  types: [MemoryType.SEMANTIC, MemoryType.PROCEDURAL],
  keywords: ['development', 'process'],
  timeRange: {
    start: new Date('2024-01-01'),
    end: new Date(),
  },
  minImportance: 4,
  entities: ['Alice', 'Bob'],
  limit: 20,
  offset: 0,
});

console.log(`Found ${result.totalCount} memories`);
console.log(`Execution time: ${result.executionTime}ms`);
```

### Managing Associations

```typescript
// Create association
await memoryService.createAssociation(
  sourceMemoryId,
  targetMemoryId,
  AssociationType.CAUSAL,
  0.8 // strength
);

// Get associated memories
const associated = await memoryService.getAssociatedMemories(
  memoryId,
  3 // max depth
);
```

### Statistics and Analytics

```typescript
const stats = memoryService.getStats();

console.log('Total memories:', stats.totalMemories);
console.log('By type:', stats.memoryByType);
console.log('Storage used:', stats.storageUsed, 'bytes');
console.log('Associations:', stats.associationCount);
console.log('Average importance:', stats.averageImportance);
```

### Export and Import

```typescript
// Export
const exportedData = await memoryService.exportMemories();
// Save to file or database

// Import
await memoryService.importMemories(exportedData);
```

### Cleanup

```typescript
// Always cleanup when done
memoryService.destroy();
```

## Performance Targets

The Memory Service is designed to meet strict performance requirements:

- **Memory Storage**: < 50ms per operation
- **Simple Retrieval**: < 100ms
- **Complex Query**: < 500ms
- **Association Traversal**: < 200ms
- **Consolidation**: Background process (non-blocking)
- **Memory Footprint**: < 50MB for 10,000 memories

## Testing

The Memory Service has comprehensive test coverage (87%+):

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## Architecture

### Memory Entity Model

```typescript
interface Memory {
  id: string;                    // Unique identifier
  type: MemoryType;              // Episodic, Semantic, Procedural, Emotional
  content: string;               // Main content
  timestamp: Date;               // Creation time
  source: string;                // Origin of memory
  confidence: number;            // Confidence score (0-1)
  privacyLevel: PrivacyLevel;    // Privacy classification
  importance: number;            // Importance score (1-5)
  metadata: MemoryMetadata;      // Additional metadata
  associations: Association[];   // Links to other memories
  version: number;               // Version for tracking changes
}
```

### Storage Architecture

```
┌─────────────────────────────────────┐
│         Memory Service              │
├─────────────────────────────────────┤
│  - Memory CRUD operations           │
│  - Retrieval strategies             │
│  - Association management           │
│  - Consolidation engine             │
└────────────┬────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
     ┌───────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌───▼──────┐
     │ Encryption  │ │Compression │ │  Indexing  │ │Analytics │
     │  Service    │ │  Service   │ │  System    │ │  Engine  │
     └─────────────┘ └────────────┘ └────────────┘ └──────────┘
```

### Retrieval Flow

```
Query → Parse → Index Lookup → Filter → Rank → Paginate → Return
  │       │          │           │       │        │
  │       │          │           │       │        └─ Apply limit/offset
  │       │          │           │       └────────── Score by relevance
  │       │          │           └────────────────── Apply criteria
  │       │          └────────────────────────────── Use indices
  │       └───────────────────────────────────────── Extract parameters
  └───────────────────────────────────────────────── User input
```

## Error Handling

The Memory Service uses TypeScript's type system and comprehensive error handling:

```typescript
try {
  await memoryService.createAssociation(
    'invalid-id',
    targetId,
    AssociationType.SEMANTIC,
    0.7
  );
} catch (error) {
  console.error('Association creation failed:', error.message);
  // Handle error appropriately
}
```

## Best Practices

1. **Always use TypeScript strict mode** - Catch errors at compile time
2. **Set appropriate privacy levels** - Protect sensitive information
3. **Use meaningful sources** - Track memory origins
4. **Regular consolidation** - Allow background processing to optimize
5. **Monitor statistics** - Track memory usage and growth
6. **Export regularly** - Back up important memories
7. **Clean up resources** - Call `destroy()` when done

## API Reference

### MemoryService Class

#### Constructor

```typescript
constructor(config?: MemoryServiceConfig)
```

#### Methods

##### storeMemory
```typescript
async storeMemory(memory: Omit<Memory, 'id' | 'version'>): Promise<Memory>
```

##### retrieveMemories
```typescript
async retrieveMemories(query: MemoryQuery): Promise<RetrievalResult>
```

##### createEpisodicMemory
```typescript
async createEpisodicMemory(
  event: EpisodicMemory['event'],
  content: string,
  source?: string
): Promise<EpisodicMemory>
```

##### createSemanticMemory
```typescript
async createSemanticMemory(
  knowledge: SemanticMemory['knowledge'],
  content: string,
  source?: string
): Promise<SemanticMemory>
```

##### createProceduralMemory
```typescript
async createProceduralMemory(
  procedure: ProceduralMemory['procedure'],
  content: string,
  source?: string
): Promise<ProceduralMemory>
```

##### createEmotionalMemory
```typescript
async createEmotionalMemory(
  emotion: EmotionalMemory['emotion'],
  content: string,
  source?: string
): Promise<EmotionalMemory>
```

##### createAssociation
```typescript
async createAssociation(
  sourceId: string,
  targetId: string,
  type: AssociationType,
  strength?: number
): Promise<void>
```

##### getAssociatedMemories
```typescript
async getAssociatedMemories(
  memoryId: string,
  maxDepth?: number
): Promise<Memory[]>
```

##### getStats
```typescript
getStats(): StorageStats
```

##### exportMemories
```typescript
async exportMemories(): Promise<string>
```

##### importMemories
```typescript
async importMemories(data: string): Promise<void>
```

##### destroy
```typescript
destroy(): void
```

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please ensure all tests pass and coverage remains above 85%.

## Support

For issues or questions, please open a GitHub issue in the repository.

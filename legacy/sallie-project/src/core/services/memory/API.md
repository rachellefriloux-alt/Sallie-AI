# Memory Service API Reference

Complete API documentation for the Sallie AI Companion Memory Service.

## Table of Contents

1. [MemoryService](#memoryservice)
2. [Memory Entity Models](#memory-entity-models)
3. [Storage Layer](#storage-layer)
4. [Retrieval Strategies](#retrieval-strategies)
5. [Consolidation](#consolidation)
6. [Association](#association)
7. [Indexing](#indexing)
8. [Pattern Mining](#pattern-mining)
9. [Attention Mechanism](#attention-mechanism)
10. [Synchronization](#synchronization)

---

## MemoryService

Main orchestration service for memory management.

### Constructor

```typescript
constructor(config?: MemoryServiceConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `store?: IMemoryStore` - Custom storage adapter
  - `autoConsolidate?: boolean` - Enable automatic consolidation (default: true)
  - `consolidationInterval?: number` - Consolidation interval in ms (default: 300000)
  - `autoDecay?: boolean` - Enable automatic decay (default: true)
  - `decayInterval?: number` - Decay interval in ms (default: 3600000)
  - `decayRate?: number` - Decay rate per cycle (default: 0.01)

### Core Methods

#### storeMemory
```typescript
async storeMemory(memory: MemoryEntity): Promise<void>
```
Store a memory in the system.

#### retrieveMemory
```typescript
async retrieveMemory(id: string): Promise<MemoryEntity | undefined>
```
Retrieve a memory by ID.

#### deleteMemory
```typescript
async deleteMemory(id: string): Promise<void>
```
Delete a memory from the system.

#### updateMemory
```typescript
async updateMemory(memory: MemoryEntity): Promise<void>
```
Update an existing memory.

### Retrieval Methods

#### retrieveContextual
```typescript
async retrieveContextual(
  context: RetrievalContext,
  options?: RetrievalOptions
): Promise<MemoryEntity[]>
```
Retrieve memories based on context (entities, topics, conversation).

#### retrieveMemories
```typescript
async retrieveMemories(
  strategyName: string,
  context: RetrievalContext,
  options?: RetrievalOptions
): Promise<MemoryEntity[]>
```
Retrieve memories using a specific strategy.

**Strategies:**
- `'contextual'` - Context-based retrieval
- `'association'` - Association-based retrieval
- `'temporal'` - Time-based retrieval
- `'emotional'` - Emotion-based retrieval
- `'query'` - Direct query retrieval

#### getMemoriesByType
```typescript
async getMemoriesByType(type: MemoryType): Promise<MemoryEntity[]>
```
Get all memories of a specific type.

#### getMemoriesByEntity
```typescript
async getMemoriesByEntity(entityId: string): Promise<MemoryEntity[]>
```
Get all memories containing a specific entity.

#### getMemoriesByTag
```typescript
async getMemoriesByTag(tag: string): Promise<MemoryEntity[]>
```
Get all memories with a specific tag.

#### getRecentMemories
```typescript
async getRecentMemories(days: number): Promise<MemoryEntity[]>
```
Get memories from the last N days.

#### getAssociatedMemories
```typescript
async getAssociatedMemories(
  memoryId: string,
  minStrength?: number
): Promise<MemoryEntity[]>
```
Get memories associated with a given memory.

### Advanced Features

#### searchSemantic
```typescript
async searchSemantic(
  queryText: string,
  limit?: number,
  minSimilarity?: number
): Promise<MemoryEntity[]>
```
Search for semantically similar memories using vector embeddings.

#### minePatterns
```typescript
async minePatterns(): Promise<DetectedPattern[]>
```
Mine and detect recurring patterns in memories.

#### getPatterns
```typescript
getPatterns(type?: PatternType): DetectedPattern[]
```
Get detected patterns, optionally filtered by type.

#### applyAttentionWeighting
```typescript
async applyAttentionWeighting(): Promise<void>
```
Apply attention-based importance weighting to all memories.

### Maintenance Methods

#### consolidate
```typescript
async consolidate(): Promise<void>
```
Manually trigger memory consolidation.

#### decay
```typescript
async decay(): Promise<void>
```
Manually trigger memory decay.

#### clearAll
```typescript
async clearAll(): Promise<void>
```
Clear all memories from the system.

### Import/Export

#### exportMemories
```typescript
async exportMemories(): Promise<string>
```
Export all memories to JSON string.

#### importMemories
```typescript
async importMemories(jsonData: string): Promise<number>
```
Import memories from JSON string. Returns count of imported memories.

### Statistics

#### getStats
```typescript
async getStats(): Promise<MemoryServiceStats>
```
Get comprehensive service statistics.

**Returns:**
```typescript
{
  storage: {
    totalMemories: number;
    byType: Record<MemoryType, number>;
    averageImportance: number;
    oldestMemory?: Date;
    newestMemory?: Date;
  };
  shortTermBuffer: {
    size: number;
    capacity: number;
    utilizationRate: number;
  };
  associations: {
    totalAssociations: number;
    strongAssociations: number;
    weakAssociations: number;
  };
  indexes: {
    entities: IndexStats;
    tags: IndexStats;
    types: IndexStats;
    temporal: IndexStats;
  };
  patterns?: PatternStats;
  embeddings?: EmbeddingStats;
}
```

#### dispose
```typescript
dispose(): void
```
Clean up resources and stop timers.

---

## Memory Entity Models

### MemoryEntity (Base Class)

Base class for all memory types.

#### Properties
- `id: string` - Unique identifier
- `type: MemoryType` - Memory type
- `content: T` - Type-specific content
- `privacy: PrivacyLevel` - Privacy classification
- `metadata: MemoryMetadata` - Comprehensive metadata
- `version: VersionInfo` - Version tracking
- `isConsolidated: boolean` - Consolidation status
- `decayFactor: number` - Current decay factor

#### Methods
- `validate(): boolean` - Validate memory structure
- `recordAccess(): void` - Record access event
- `applyDecay(rate: number): void` - Apply decay
- `getEffectiveImportance(): number` - Get importance × decay
- `addTags(...tags: string[]): void` - Add tags
- `addEntities(...entities: string[]): void` - Add entities
- `consolidate(): void` - Mark as consolidated
- `update(newContent: T, description?: string): void` - Update content
- `toJSON(): any` - Serialize to JSON

### EpisodicMemory

Stores specific events and interactions.

#### Content Structure
```typescript
{
  description: string;
  participants: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
  temporal: {
    startTime: Date;
    endTime?: Date;
    timeOfDay?: string;
    dayOfWeek?: string;
  };
  spatial?: {
    location?: string;
    coordinates?: { lat: number; lon: number };
  };
  topics?: string[];
  context?: Record<string, unknown>;
}
```

#### Methods
- `getDuration(): number` - Get duration in ms
- `hasParticipant(id: string): boolean` - Check participant
- `getTimeOfDay(): string` - Get time of day

### SemanticMemory

Stores factual knowledge and preferences.

#### Content Structure
```typescript
{
  knowledgeType: SemanticKnowledgeType;
  subject: string;
  property?: string;
  value: unknown;
  category?: string;
  relationships?: Array<{
    type: string;
    targetId: string;
  }>;
}
```

#### Methods
- `contradicts(other: SemanticMemory): boolean` - Check contradiction
- `isAbout(entity: string): boolean` - Check if about entity
- `getRelatedEntities(): string[]` - Get related entities

### ProceduralMemory

Stores task procedures and patterns.

#### Content Structure
```typescript
{
  name: string;
  description: string;
  context: Record<string, unknown>;
  steps: Array<{
    order: number;
    description: string;
    conditions?: string[];
    expectedOutcome?: string;
  }>;
  effectiveness: {
    successCount: number;
    failureCount: number;
    lastUsed?: Date;
  };
}
```

#### Methods
- `recordSuccess(): void` - Record success
- `recordFailure(): void` - Record failure
- `getSuccessRate(): number` - Get success rate
- `getStepCount(): number` - Get step count

### EmotionalMemory

Stores emotional experiences.

#### Content Structure
```typescript
{
  emotionalState: {
    primaryEmotion: string;
    secondaryEmotions?: string[];
    intensity: number;
    valence: number;
    arousal: number;
  };
  triggers: Array<{
    type: string;
    description: string;
    strength: number;
  }>;
  context: Record<string, unknown>;
}
```

#### Methods
- `isPositive(): boolean` - Check positive valence
- `isNegative(): boolean` - Check negative valence
- `getIntensity(): number` - Get intensity
- `calculateSimilarity(other: EmotionalMemory): number` - Similarity score

---

## Storage Layer

### IMemoryStore (Interface)

Storage interface for memory persistence.

#### Methods
- `store(memory: MemoryEntity): Promise<void>`
- `retrieve(id: string): Promise<MemoryEntity | undefined>`
- `update(memory: MemoryEntity): Promise<void>`
- `delete(id: string): Promise<void>`
- `getAll(): Promise<MemoryEntity[]>`
- `query(options: QueryOptions): Promise<MemoryEntity[]>`
- `clear(): Promise<void>`
- `exportAll(): Promise<string>`
- `importAll(data: string): Promise<number>`
- `getStats(): Promise<StorageStats>`

### LocalStorageAdapter

In-memory storage with optional persistence.

#### Constructor
```typescript
constructor(config?: { enablePersistence?: boolean })
```

### EncryptedStorage

Encryption wrapper for any storage adapter.

#### Constructor
```typescript
constructor(
  baseStore: IMemoryStore,
  config: {
    encryptionKey: string;
    encryptLevels: PrivacyLevel[];
  }
)
```

---

## Retrieval Strategies

### RetrievalContext

Common context for all strategies:
```typescript
{
  entities?: string[];
  topics?: string[];
  conversationContext?: {
    currentTopic?: string;
    recentEntities?: string[];
  };
  temporalContext?: {
    timeRange?: { start: Date; end: Date };
    timeOfDay?: string;
  };
  emotionalContext?: {
    currentEmotion?: string;
    emotionalIntensity?: number;
  };
  seedMemoryIds?: string[];
  queryParameters?: QueryParameters;
}
```

### RetrievalOptions

Options for all strategies:
```typescript
{
  limit?: number;
  minRelevance?: number;
  diversityFactor?: number;
  includeConsolidated?: boolean;
  sortBy?: 'relevance' | 'recency' | 'importance';
}
```

---

## Pattern Mining

### PatternMiner

Detects recurring patterns in memories.

#### Constructor
```typescript
constructor(config?: PatternMinerConfig)
```

#### Methods

##### minePatterns
```typescript
async minePatterns(memories: MemoryEntity[]): Promise<DetectedPattern[]>
```
Mine patterns from memory set.

##### getPatterns
```typescript
getPatterns(type?: PatternType): DetectedPattern[]
```
Get detected patterns.

##### getStats
```typescript
getStats(): PatternStats
```
Get pattern statistics.

### Pattern Types

- `ENTITY_COOCCURRENCE` - Entities appearing together
- `TOPIC_CLUSTER` - Recurring topic combinations
- `TEMPORAL_SEQUENCE` - Time-based event patterns
- `EMOTIONAL_CYCLE` - Emotional transition patterns
- `BEHAVIORAL` - User behavior patterns
- `CONTEXTUAL` - Context-based patterns

---

## Attention Mechanism

### AttentionMechanism

Dynamic importance weighting system.

#### Constructor
```typescript
constructor(config?: AttentionConfig)
```

#### Methods

##### calculateAttention
```typescript
calculateAttention(
  memory: MemoryEntity,
  context?: {
    allMemories?: MemoryEntity[];
    associationCount?: number;
    currentTime?: Date;
  }
): AttentionComponents
```
Calculate attention score for a memory.

**Returns:**
```typescript
{
  recency: number;
  frequency: number;
  connectivity: number;
  emotional: number;
  interaction: number;
  selfAttention: number;
  finalScore: number;
}
```

##### batchCalculateAttention
```typescript
batchCalculateAttention(
  memories: MemoryEntity[],
  context?: {
    associationCounts?: Map<string, number>;
    currentTime?: Date;
  }
): Map<string, AttentionComponents>
```
Calculate attention for multiple memories.

##### applyAttentionToImportance
```typescript
applyAttentionToImportance(
  memory: MemoryEntity,
  attentionComponents: AttentionComponents,
  blendFactor?: number
): void
```
Update memory importance based on attention score.

---

## Synchronization

### SyncEngine

Cross-platform synchronization manager.

#### Constructor
```typescript
constructor(localStore: IMemoryStore, config?: SyncConfig)
```

#### Methods

##### sync
```typescript
async sync(remoteStore: IMemoryStore): Promise<SyncResult>
```
Synchronize with remote store.

**Returns:**
```typescript
{
  status: SyncStatus;
  pushed: number;
  pulled: number;
  conflicts: number;
  conflictDetails: SyncConflict[];
  error?: string;
  timestamp: Date;
}
```

##### getConflicts
```typescript
getConflicts(): SyncConflict[]
```
Get unresolved conflicts.

##### resolveConflictManually
```typescript
async resolveConflictManually(
  memoryId: string,
  resolution: 'local' | 'remote' | MemoryEntity
): Promise<void>
```
Manually resolve a conflict.

##### getDeviceId
```typescript
getDeviceId(): string
```
Get device identifier.

---

## Type Definitions

### Enums

#### MemoryType
```typescript
enum MemoryType {
  EPISODIC = 'episodic',
  SEMANTIC = 'semantic',
  PROCEDURAL = 'procedural',
  EMOTIONAL = 'emotional'
}
```

#### PrivacyLevel
```typescript
enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SENSITIVE = 'sensitive',
  CONFIDENTIAL = 'confidential'
}
```

#### SemanticKnowledgeType
```typescript
enum SemanticKnowledgeType {
  FACT = 'fact',
  PREFERENCE = 'preference',
  BELIEF = 'belief',
  SKILL = 'skill',
  RELATIONSHIP = 'relationship'
}
```

### Error Types

#### MemoryStoreError
```typescript
class MemoryStoreError extends Error {
  constructor(message: string, operation: string, cause?: unknown)
}
```

---

## Best Practices

### Memory Creation
```typescript
// Always validate memories
const memory = new EpisodicMemory('id', content);
if (!memory.validate()) {
  throw new Error('Invalid memory structure');
}
```

### Resource Management
```typescript
// Always dispose when done
const service = new MemoryService();
try {
  // Use service
} finally {
  service.dispose();
}
```

### Performance Optimization
```typescript
// Use batch operations when possible
const memories = await service.getMemoriesByEntity('user-1');

// Use appropriate limits
const recent = await service.getRecentMemories(7); // Not 365
```

### Error Handling
```typescript
try {
  await service.storeMemory(memory);
} catch (error) {
  if (error instanceof MemoryStoreError) {
    console.error(`Storage failed: ${error.message}`);
  }
  throw error;
}
```

---

## Examples

See [README.md](./README.md) and [examples/basic-usage.ts](./examples/basic-usage.ts) for complete usage examples.

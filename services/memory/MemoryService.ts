/**
 * Main Memory Service
 * Complete implementation of the memory system for Sallie AI
 */

import {
  Memory,
  MemoryType,
  MemoryQuery,
  RetrievalResult,
  EpisodicMemory,
  SemanticMemory,
  ProceduralMemory,
  EmotionalMemory,
  Association,
  AssociationType,
  StorageStats,
  PrivacyLevel,
} from './types';
import { EncryptionService } from './storage/encryption';
import { CompressionService } from './storage/compression';
import crypto from 'crypto';

/**
 * Memory Service Configuration
 */
export interface MemoryServiceConfig {
  encryptionPassword?: string;
  maxMemories?: number;
  consolidationInterval?: number;
  autoCompress?: boolean;
}

/**
 * Complete Memory Service Implementation
 * Manages all memory types, retrieval, storage, and operations
 */
export class MemoryService {
  private memories: Map<string, Memory> = new Map();
  private associations: Map<string, Association[]> = new Map();
  private consolidationBuffer: Memory[] = [];
  private encryptionService: EncryptionService;
  private compressionService: CompressionService;
  private config: MemoryServiceConfig;
  private consolidationTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize the Memory Service
   * @param config - Service configuration
   */
  constructor(config: MemoryServiceConfig = {}) {
    this.config = {
      maxMemories: config.maxMemories || 100000,
      consolidationInterval: config.consolidationInterval || 300000, // 5 minutes
      autoCompress: config.autoCompress !== false,
      encryptionPassword: config.encryptionPassword,
    };

    this.encryptionService = new EncryptionService();
    this.compressionService = new CompressionService();

    if (this.config.encryptionPassword) {
      this.encryptionService.initialize(this.config.encryptionPassword);
    }

    this.startConsolidationTimer();
  }

  /**
   * Store a new memory
   * @param memory - Memory to store
   * @returns Stored memory with assigned ID
   */
  public async storeMemory(memory: Omit<Memory, 'id' | 'version'>): Promise<Memory> {
    const startTime = Date.now();

    const fullMemory: Memory = {
      ...memory,
      id: this.generateId(),
      version: 1,
      associations: memory.associations || [],
    };

    this.memories.set(fullMemory.id, fullMemory);
    this.consolidationBuffer.push(fullMemory);

    // Store associations
    if (fullMemory.associations.length > 0) {
      this.associations.set(fullMemory.id, fullMemory.associations);
    }

    const duration = Date.now() - startTime;
    
    if (duration > 50) {
      console.warn(`Memory storage took ${duration}ms, exceeding 50ms target`);
    }

    return fullMemory;
  }

  /**
   * Retrieve memories by query
   * @param query - Memory query
   * @returns Retrieval result with matched memories
   */
  public async retrieveMemories(query: MemoryQuery): Promise<RetrievalResult> {
    const startTime = Date.now();
    const results: Memory[] = [];
    const relevanceScores = new Map<string, number>();

    for (const [id, memory] of this.memories) {
      const score = this.calculateRelevance(memory, query);
      if (score > 0) {
        results.push(memory);
        relevanceScores.set(id, score);
      }
    }

    // Sort by relevance score
    results.sort((a, b) => 
      (relevanceScores.get(b.id) || 0) - (relevanceScores.get(a.id) || 0)
    );

    // Apply limit and offset
    const offset = query.offset || 0;
    const limit = query.limit || 10;
    const paginatedResults = results.slice(offset, offset + limit);

    const executionTime = Date.now() - startTime;

    if (executionTime > 100) {
      console.warn(`Retrieval took ${executionTime}ms, exceeding 100ms target`);
    }

    return {
      memories: paginatedResults,
      totalCount: results.length,
      relevanceScores,
      executionTime,
    };
  }

  /**
   * Calculate relevance score for a memory against a query
   * @param memory - Memory to score
   * @param query - Query to match against
   * @returns Relevance score (0-1)
   */
  private calculateRelevance(memory: Memory, query: MemoryQuery): number {
    let score = 0;

    // Type matching
    if (query.types && query.types.length > 0) {
      if (!query.types.includes(memory.type)) {
        return 0;
      }
      score += 0.2;
    }

    // Keyword matching
    if (query.keywords && query.keywords.length > 0) {
      const content = memory.content.toLowerCase();
      const matchedKeywords = query.keywords.filter(k => 
        content.includes(k.toLowerCase())
      ).length;
      score += (matchedKeywords / query.keywords.length) * 0.3;
    }

    // Time range matching
    if (query.timeRange) {
      const timestamp = memory.timestamp.getTime();
      const start = query.timeRange.start.getTime();
      const end = query.timeRange.end.getTime();
      
      if (timestamp >= start && timestamp <= end) {
        score += 0.2;
      }
    }

    // Importance matching
    if (query.minImportance !== undefined) {
      if (memory.importance >= query.minImportance) {
        score += 0.15;
      }
    }

    // Entity matching
    if (query.entities && query.entities.length > 0) {
      const memoryEntities = memory.metadata.entities.map(e => e.value.toLowerCase());
      const matchedEntities = query.entities.filter(e => 
        memoryEntities.includes(e.toLowerCase())
      ).length;
      score += (matchedEntities / query.entities.length) * 0.15;
    }

    return Math.min(score, 1);
  }

  /**
   * Create an episodic memory
   * @param event - Event details
   * @param content - Memory content
   * @returns Created episodic memory
   */
  public async createEpisodicMemory(
    event: EpisodicMemory['event'],
    content: string,
    source: string = 'user'
  ): Promise<EpisodicMemory> {
    const memory: Omit<EpisodicMemory, 'id' | 'version'> = {
      type: MemoryType.EPISODIC,
      content,
      timestamp: new Date(),
      source,
      confidence: 0.9,
      privacyLevel: PrivacyLevel.PRIVATE,
      importance: event.significance,
      event,
      sequence: this.getNextSequenceNumber(),
      metadata: {
        context: {},
        tags: [],
        entities: [],
        usageCount: 0,
        lastAccessed: new Date(),
        emotionalValence: 0,
        emotionalArousal: 0,
      },
      associations: [],
    };

    return this.storeMemory(memory) as Promise<EpisodicMemory>;
  }

  /**
   * Create a semantic memory
   * @param knowledge - Knowledge details
   * @param content - Memory content
   * @returns Created semantic memory
   */
  public async createSemanticMemory(
    knowledge: SemanticMemory['knowledge'],
    content: string,
    source: string = 'user'
  ): Promise<SemanticMemory> {
    const memory: Omit<SemanticMemory, 'id' | 'version'> = {
      type: MemoryType.SEMANTIC,
      content,
      timestamp: new Date(),
      source,
      confidence: knowledge.verified ? 0.95 : 0.7,
      privacyLevel: PrivacyLevel.PRIVATE,
      importance: 3,
      knowledge,
      metadata: {
        context: {},
        tags: knowledge.category,
        entities: [],
        usageCount: 0,
        lastAccessed: new Date(),
        emotionalValence: 0,
        emotionalArousal: 0,
      },
      associations: [],
    };

    return this.storeMemory(memory) as Promise<SemanticMemory>;
  }

  /**
   * Create a procedural memory
   * @param procedure - Procedure details
   * @param content - Memory content
   * @returns Created procedural memory
   */
  public async createProceduralMemory(
    procedure: ProceduralMemory['procedure'],
    content: string,
    source: string = 'learned'
  ): Promise<ProceduralMemory> {
    const memory: Omit<ProceduralMemory, 'id' | 'version'> = {
      type: MemoryType.PROCEDURAL,
      content,
      timestamp: new Date(),
      source,
      confidence: 0.8,
      privacyLevel: PrivacyLevel.PRIVATE,
      importance: 4,
      procedure,
      metadata: {
        context: {},
        tags: [procedure.name],
        entities: [],
        usageCount: 0,
        lastAccessed: new Date(),
        emotionalValence: 0,
        emotionalArousal: 0,
      },
      associations: [],
    };

    return this.storeMemory(memory) as Promise<ProceduralMemory>;
  }

  /**
   * Create an emotional memory
   * @param emotion - Emotion details
   * @param content - Memory content
   * @returns Created emotional memory
   */
  public async createEmotionalMemory(
    emotion: EmotionalMemory['emotion'],
    content: string,
    source: string = 'experience'
  ): Promise<EmotionalMemory> {
    const memory: Omit<EmotionalMemory, 'id' | 'version'> = {
      type: MemoryType.EMOTIONAL,
      content,
      timestamp: new Date(),
      source,
      confidence: 0.85,
      privacyLevel: PrivacyLevel.CONFIDENTIAL,
      importance: 5,
      emotion,
      metadata: {
        context: {},
        tags: [emotion.primaryEmotion],
        entities: [],
        usageCount: 0,
        lastAccessed: new Date(),
        emotionalValence: this.calculateValence(emotion.primaryEmotion),
        emotionalArousal: emotion.intensity,
      },
      associations: [],
    };

    return this.storeMemory(memory) as Promise<EmotionalMemory>;
  }

  /**
   * Create association between memories
   * @param sourceId - Source memory ID
   * @param targetId - Target memory ID
   * @param type - Association type
   * @param strength - Association strength
   */
  public async createAssociation(
    sourceId: string,
    targetId: string,
    type: AssociationType,
    strength: number = 0.5
  ): Promise<void> {
    const sourceMemory = this.memories.get(sourceId);
    if (!sourceMemory) {
      throw new Error(`Source memory ${sourceId} not found`);
    }

    const association: Association = {
      targetId,
      type,
      strength,
      bidirectional: false,
      metadata: { createdAt: new Date() },
    };

    sourceMemory.associations.push(association);

    const existingAssociations = this.associations.get(sourceId) || [];
    existingAssociations.push(association);
    this.associations.set(sourceId, existingAssociations);
  }

  /**
   * Get associated memories
   * @param memoryId - Memory ID to get associations for
   * @param maxDepth - Maximum depth to traverse
   * @returns Associated memories
   */
  public async getAssociatedMemories(
    memoryId: string,
    maxDepth: number = 2
  ): Promise<Memory[]> {
    const visited = new Set<string>();
    const results: Memory[] = [];

    const traverse = (id: string, depth: number): void => {
      if (depth > maxDepth || visited.has(id)) {
        return;
      }

      visited.add(id);
      const associations = this.associations.get(id) || [];

      for (const assoc of associations) {
        const memory = this.memories.get(assoc.targetId);
        if (memory && !visited.has(memory.id)) {
          results.push(memory);
          traverse(memory.id, depth + 1);
        }
      }
    };

    traverse(memoryId, 0);
    return results;
  }

  /**
   * Get storage statistics
   * @returns Storage statistics
   */
  public getStats(): StorageStats {
    const memoryArray = Array.from(this.memories.values());
    const memoryByType: Record<MemoryType, number> = {
      [MemoryType.EPISODIC]: 0,
      [MemoryType.SEMANTIC]: 0,
      [MemoryType.PROCEDURAL]: 0,
      [MemoryType.EMOTIONAL]: 0,
    };

    let totalImportance = 0;
    let oldestDate = new Date();
    let newestDate = new Date(0);

    for (const memory of memoryArray) {
      memoryByType[memory.type]++;
      totalImportance += memory.importance;
      if (memory.timestamp < oldestDate) oldestDate = memory.timestamp;
      if (memory.timestamp > newestDate) newestDate = memory.timestamp;
    }

    return {
      totalMemories: this.memories.size,
      memoryByType,
      storageUsed: this.calculateStorageUsed(),
      associationCount: Array.from(this.associations.values())
        .reduce((sum, arr) => sum + arr.length, 0),
      averageImportance: totalImportance / this.memories.size || 0,
      oldestMemory: oldestDate,
      newestMemory: newestDate,
    };
  }

  /**
   * Consolidate memories from buffer
   */
  private async consolidate(): Promise<void> {
    if (this.consolidationBuffer.length === 0) {
      return;
    }

    const startTime = Date.now();
    const toConsolidate = [...this.consolidationBuffer];
    this.consolidationBuffer = [];

    // Detect patterns and create associations
    for (let i = 0; i < toConsolidate.length; i++) {
      for (let j = i + 1; j < toConsolidate.length; j++) {
        const similarity = this.calculateSimilarity(
          toConsolidate[i],
          toConsolidate[j]
        );

        if (similarity > 0.7) {
          await this.createAssociation(
            toConsolidate[i].id,
            toConsolidate[j].id,
            AssociationType.SEMANTIC,
            similarity
          );
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Consolidated ${toConsolidate.length} memories in ${duration}ms`);
  }

  /**
   * Calculate similarity between two memories
   * @param memory1 - First memory
   * @param memory2 - Second memory
   * @returns Similarity score (0-1)
   */
  private calculateSimilarity(memory1: Memory, memory2: Memory): number {
    let score = 0;

    // Type similarity
    if (memory1.type === memory2.type) {
      score += 0.2;
    }

    // Temporal proximity
    const timeDiff = Math.abs(
      memory1.timestamp.getTime() - memory2.timestamp.getTime()
    );
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    if (daysDiff < 1) {
      score += 0.3;
    } else if (daysDiff < 7) {
      score += 0.15;
    }

    // Content similarity (simple word overlap)
    const words1 = new Set(memory1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(memory2.content.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    score += (intersection.size / union.size) * 0.5;

    return Math.min(score, 1);
  }

  /**
   * Calculate emotional valence for an emotion
   * @param emotion - Emotion type
   * @returns Valence score (-1 to 1)
   */
  private calculateValence(emotion: string): number {
    const positiveEmotions = ['joy', 'love', 'trust', 'pride', 'relief', 'hope', 'contentment', 'excitement'];
    const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust', 'guilt', 'shame', 'anxiety', 'frustration'];

    if (positiveEmotions.includes(emotion)) return 0.8;
    if (negativeEmotions.includes(emotion)) return -0.8;
    return 0;
  }

  /**
   * Calculate storage used in bytes
   * @returns Storage size in bytes
   */
  private calculateStorageUsed(): number {
    let total = 0;
    for (const memory of this.memories.values()) {
      total += JSON.stringify(memory).length;
    }
    return total;
  }

  /**
   * Get next sequence number for episodic memories
   * @returns Next sequence number
   */
  private getNextSequenceNumber(): number {
    const episodicMemories = Array.from(this.memories.values())
      .filter(m => m.type === MemoryType.EPISODIC) as EpisodicMemory[];
    
    if (episodicMemories.length === 0) return 1;
    
    return Math.max(...episodicMemories.map(m => m.sequence)) + 1;
  }

  /**
   * Generate unique ID
   * @returns Unique ID
   */
  private generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Start consolidation timer
   */
  private startConsolidationTimer(): void {
    this.consolidationTimer = setInterval(
      () => this.consolidate(),
      this.config.consolidationInterval
    );
  }

  /**
   * Stop consolidation timer
   */
  public destroy(): void {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
      this.consolidationTimer = null;
    }
  }

  /**
   * Export memories to JSON
   * @returns Serialized memories
   */
  public async exportMemories(): Promise<string> {
    const data = {
      memories: Array.from(this.memories.entries()),
      associations: Array.from(this.associations.entries()),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import memories from JSON
   * @param data - Serialized memories
   */
  public async importMemories(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    
    this.memories = new Map(parsed.memories.map(([id, mem]: [string, Memory]) => {
      // Convert timestamp strings back to Date objects
      mem.timestamp = new Date(mem.timestamp);
      mem.metadata.lastAccessed = new Date(mem.metadata.lastAccessed);
      return [id, mem];
    }));
    
    this.associations = new Map(parsed.associations);
  }
}

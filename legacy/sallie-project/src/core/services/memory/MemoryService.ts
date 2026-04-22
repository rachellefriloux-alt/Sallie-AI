/**
 * Memory Service
 * 
 * Main service orchestrating all memory subsystems:
 * - Storage and retrieval
 * - Consolidation
 * - Association formation
 * - Indexing
 * - Memory decay
 */

import { MemoryEntity, MemoryType } from './models/MemoryEntity';
import { IMemoryStore, QueryOptions } from './storage/MemoryStore';
import { LocalStorageAdapter } from './storage/LocalStorageAdapter';
import { ShortTermBuffer } from './consolidation/ShortTermBuffer';
import { ConsolidationEngine } from './consolidation/ConsolidationEngine';
import { AssociationGraph } from './association/AssociationGraph';
import { AssociationEngine } from './association/AssociationEngine';
import { IRetrievalStrategy, RetrievalContext, RetrievalOptions } from './retrieval/RetrievalStrategy';
import { ContextualRetrieval } from './retrieval/ContextualRetrieval';
import { AssociationRetrieval } from './retrieval/AssociationRetrieval';
import { TemporalRetrieval } from './retrieval/TemporalRetrieval';
import { EmotionalRetrieval } from './retrieval/EmotionalRetrieval';
import { EntityIndex, TagIndex, TypeIndex } from './indexing/MemoryIndex';
import { TemporalIndex } from './indexing/TemporalIndex';
import { SemanticIndex } from './indexing/SemanticIndex';
import { QueryRetrieval } from './retrieval/QueryRetrieval';
import { PatternMiner } from './consolidation/PatternMiner';
import { AttentionMechanism } from './consolidation/AttentionMechanism';

/**
 * Memory Service Configuration
 */
export interface MemoryServiceConfig {
  /** Storage adapter to use */
  store?: IMemoryStore;
  
  /** Enable automatic consolidation */
  autoConsolidate?: boolean;
  
  /** Consolidation interval in milliseconds */
  consolidationInterval?: number;
  
  /** Enable automatic decay */
  autoDecay?: boolean;
  
  /** Decay interval in milliseconds */
  decayInterval?: number;
  
  /** Decay rate per cycle */
  decayRate?: number;
}

/**
 * Memory Service
 * 
 * Central service for all memory operations. Provides high-level APIs
 * for storing, retrieving, and managing memories.
 */
export class MemoryService {
  private store: IMemoryStore;
  private shortTermBuffer: ShortTermBuffer;
  private consolidationEngine: ConsolidationEngine;
  private associationGraph: AssociationGraph;
  private associationEngine: AssociationEngine;
  
  // Indexes
  private entityIndex: EntityIndex;
  private tagIndex: TagIndex;
  private typeIndex: TypeIndex;
  private temporalIndex: TemporalIndex;
  private semanticIndex: SemanticIndex;
  
  // Advanced features
  private patternMiner: PatternMiner;
  private attentionMechanism: AttentionMechanism;
  
  // Retrieval strategies
  private retrievalStrategies: Map<string, IRetrievalStrategy>;
  
  // Configuration
  private config: Required<MemoryServiceConfig>;
  
  // Timers for automatic processes
  private consolidationTimer?: ReturnType<typeof setInterval>;
  private decayTimer?: ReturnType<typeof setInterval>;
  
  constructor(config: MemoryServiceConfig = {}) {
    // Initialize storage
    this.store = config.store || new LocalStorageAdapter({ enablePersistence: false });
    
    // Initialize consolidation components
    this.shortTermBuffer = new ShortTermBuffer();
    this.consolidationEngine = new ConsolidationEngine(this.store, this.shortTermBuffer);
    
    // Initialize association components
    this.associationGraph = new AssociationGraph();
    this.associationEngine = new AssociationEngine(this.associationGraph);
    
    // Initialize indexes
    this.entityIndex = new EntityIndex();
    this.tagIndex = new TagIndex();
    this.typeIndex = new TypeIndex();
    this.temporalIndex = new TemporalIndex();
    this.semanticIndex = new SemanticIndex();
    
    // Initialize advanced features
    this.patternMiner = new PatternMiner();
    this.attentionMechanism = new AttentionMechanism();
    
    // Initialize retrieval strategies
    this.retrievalStrategies = new Map();
    this.retrievalStrategies.set('contextual', new ContextualRetrieval());
    this.retrievalStrategies.set('association', new AssociationRetrieval());
    this.retrievalStrategies.set('temporal', new TemporalRetrieval());
    this.retrievalStrategies.set('emotional', new EmotionalRetrieval());
    this.retrievalStrategies.set('query', new QueryRetrieval());
    
    // Configure service
    this.config = {
      store: this.store,
      autoConsolidate: config.autoConsolidate ?? true,
      consolidationInterval: config.consolidationInterval ?? 300000, // 5 minutes
      autoDecay: config.autoDecay ?? true,
      decayInterval: config.decayInterval ?? 3600000, // 1 hour
      decayRate: config.decayRate ?? 0.01
    };
    
    // Start automatic processes
    if (this.config.autoConsolidate) {
      this.startAutoConsolidation();
    }
    
    if (this.config.autoDecay) {
      this.startAutoDecay();
    }
  }
  
  /**
   * Store a new memory
   */
  async storeMemory(memory: MemoryEntity): Promise<void> {
    // Validate memory
    if (!memory.validate()) {
      throw new Error(`Invalid memory: ${memory.id}`);
    }
    
    // Add to storage
    await this.store.store(memory);
    
    // Add to short-term buffer
    this.shortTermBuffer.add(memory);
    
    // Update indexes
    this.updateIndexes(memory);
    
    // Form associations with existing memories
    const existingMemories = await this.store.getAll();
    await this.associationEngine.formAssociations(memory, existingMemories);
  }
  
  /**
   * Retrieve a memory by ID
   */
  async retrieveMemory(id: string): Promise<MemoryEntity | undefined> {
    return this.store.retrieve(id);
  }
  
  /**
   * Retrieve memories using a specific strategy
   */
  async retrieveMemories(
    strategyName: string,
    context: RetrievalContext,
    options: RetrievalOptions = {}
  ): Promise<MemoryEntity[]> {
    const strategy = this.retrievalStrategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown retrieval strategy: ${strategyName}`);
    }
    
    const retrieved = await strategy.retrieve(context, options, this.store);
    
    // Record accesses and reinforce associations
    const memoryIds = retrieved.map(r => r.memory.id);
    if (memoryIds.length > 1) {
      await this.associationEngine.reinforceCoactivation(memoryIds);
    }
    
    return retrieved.map(r => r.memory);
  }
  
  /**
   * Retrieve memories contextually (convenience method)
   */
  async retrieveContextual(
    context: RetrievalContext,
    options?: RetrievalOptions
  ): Promise<MemoryEntity[]> {
    return this.retrieveMemories('contextual', context, options);
  }
  
  /**
   * Update an existing memory
   */
  async updateMemory(memory: MemoryEntity): Promise<void> {
    await this.store.update(memory);
    this.updateIndexes(memory);
  }
  
  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    await this.store.delete(id);
    this.shortTermBuffer.remove(id);
    this.associationGraph.removeMemory(id);
    this.removeFromIndexes(id);
  }
  
  /**
   * Query memories with filters
   */
  async queryMemories(options: QueryOptions): Promise<MemoryEntity[]> {
    return this.store.query(options);
  }
  
  /**
   * Get memories by entity
   */
  async getMemoriesByEntity(entity: string): Promise<MemoryEntity[]> {
    const memoryIds = this.entityIndex.query(entity);
    const memories: MemoryEntity[] = [];
    
    for (const id of memoryIds) {
      const memory = await this.store.retrieve(id);
      if (memory) memories.push(memory);
    }
    
    return memories;
  }
  
  /**
   * Get memories by tag
   */
  async getMemoriesByTag(tag: string): Promise<MemoryEntity[]> {
    const memoryIds = this.tagIndex.query(tag);
    const memories: MemoryEntity[] = [];
    
    for (const id of memoryIds) {
      const memory = await this.store.retrieve(id);
      if (memory) memories.push(memory);
    }
    
    return memories;
  }
  
  /**
   * Get memories by type
   */
  async getMemoriesByType(type: MemoryType): Promise<MemoryEntity[]> {
    return this.store.query({ type });
  }
  
  /**
   * Get recent memories (from last N days)
   */
  async getRecentMemories(days: number = 7): Promise<MemoryEntity[]> {
    const memoryIds = this.temporalIndex.queryLastNDays(days);
    const memories: MemoryEntity[] = [];
    
    for (const id of memoryIds) {
      const memory = await this.store.retrieve(id);
      if (memory) memories.push(memory);
    }
    
    return memories;
  }
  
  /**
   * Get associated memories
   */
  async getAssociatedMemories(
    memoryId: string,
    minStrength: number = 0.5
  ): Promise<MemoryEntity[]> {
    const associatedIds = this.associationGraph.getStronglyAssociated(memoryId, minStrength);
    const memories: MemoryEntity[] = [];
    
    for (const id of associatedIds) {
      const memory = await this.store.retrieve(id);
      if (memory) memories.push(memory);
    }
    
    return memories;
  }
  
  /**
   * Manually trigger consolidation
   */
  async consolidate(): Promise<void> {
    await this.consolidationEngine.consolidate();
  }
  
  /**
   * Search for semantically similar memories
   */
  async searchSemantic(
    queryText: string,
    limit: number = 10,
    minSimilarity: number = 0.5
  ): Promise<MemoryEntity[]> {
    const results = await this.semanticIndex.search(queryText, limit, minSimilarity);
    const memories: MemoryEntity[] = [];
    
    for (const result of results) {
      const memory = await this.store.retrieve(result.memoryId);
      if (memory) memories.push(memory);
    }
    
    return memories;
  }
  
  /**
   * Mine patterns from memories
   */
  async minePatterns(): Promise<any[]> {
    const allMemories = await this.store.getAll();
    return this.patternMiner.minePatterns(allMemories);
  }
  
  /**
   * Get detected patterns
   */
  getPatterns(type?: any): any[] {
    return this.patternMiner.getPatterns(type);
  }
  
  /**
   * Apply attention mechanism to update importance
   */
  async applyAttentionWeighting(): Promise<void> {
    const allMemories = await this.store.getAll();
    
    // Get association counts
    const associationCounts = new Map<string, number>();
    for (const memory of allMemories) {
      const associations = this.associationGraph.getAllAssociations(memory.id);
      associationCounts.set(memory.id, associations.length);
    }
    
    // Calculate attention for each memory
    const attentionScores = this.attentionMechanism.batchCalculateAttention(
      allMemories,
      { associationCounts }
    );
    
    // Apply attention to importance
    for (const memory of allMemories) {
      const components = attentionScores.get(memory.id);
      if (components) {
        this.attentionMechanism.applyAttentionToImportance(memory, components, 0.3);
        await this.store.update(memory);
      }
    }
  }
  
  /**
   * Get service statistics
   */
  async getStats(): Promise<{
    storage: any;
    shortTermBuffer: any;
    associations: any;
    indexes: any;
    patterns?: any;
    embeddings?: any;
  }> {
    return {
      storage: await this.store.getStats(),
      shortTermBuffer: this.shortTermBuffer.getStats(),
      associations: this.associationGraph.getStats(),
      indexes: {
        entities: this.entityIndex.getStats(),
        tags: this.tagIndex.getStats(),
        types: this.typeIndex.getStats(),
        temporal: this.temporalIndex.getStats()
      },
      patterns: this.patternMiner.getStats(),
      embeddings: this.semanticIndex.getEmbeddingStats()
    };
  }
  
  /**
   * Export all memories
   */
  async exportMemories(): Promise<string> {
    return this.store.export();
  }
  
  /**
   * Import memories from JSON
   */
  async importMemories(jsonData: string): Promise<number> {
    const count = await this.store.import(jsonData);
    
    // Rebuild indexes
    await this.rebuildIndexes();
    
    return count;
  }
  
  /**
   * Clear all memories (use with caution)
   */
  async clearAll(): Promise<void> {
    await this.store.clear();
    this.shortTermBuffer.clear();
    this.associationGraph.clear();
    this.clearIndexes();
  }
  
  /**
   * Cleanup and dispose
   */
  dispose(): void {
    if (this.consolidationTimer) {
      clearInterval(this.consolidationTimer);
    }
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
    }
    
    if (this.store instanceof LocalStorageAdapter) {
      this.store.destroy();
    }
  }
  
  /**
   * Start automatic consolidation
   */
  private startAutoConsolidation(): void {
    this.consolidationTimer = setInterval(async () => {
      try {
        await this.consolidationEngine.consolidate();
      } catch (error) {
        console.error('Auto-consolidation failed:', error);
      }
    }, this.config.consolidationInterval);
  }
  
  /**
   * Start automatic decay
   */
  private startAutoDecay(): void {
    this.decayTimer = setInterval(async () => {
      try {
        // Apply decay to short-term buffer
        this.shortTermBuffer.applyDecay(this.config.decayRate);
        
        // Apply decay to associations
        this.associationGraph.applyDecay(this.config.decayRate);
        
        // Prune weak associations
        this.associationGraph.pruneWeakAssociations(0.1);
      } catch (error) {
        console.error('Auto-decay failed:', error);
      }
    }, this.config.decayInterval);
  }
  
  /**
   * Update all indexes for a memory
   */
  private updateIndexes(memory: MemoryEntity): void {
    this.entityIndex.add(memory);
    this.tagIndex.add(memory);
    this.typeIndex.add(memory);
    this.temporalIndex.add(memory);
    this.semanticIndex.add(memory);
  }
  
  /**
   * Remove memory from all indexes
   */
  private removeFromIndexes(memoryId: string): void {
    this.entityIndex.remove(memoryId);
    this.tagIndex.remove(memoryId);
    this.typeIndex.remove(memoryId);
    this.temporalIndex.remove(memoryId);
    this.semanticIndex.remove(memoryId);
  }
  
  /**
   * Clear all indexes
   */
  private clearIndexes(): void {
    this.entityIndex.clear();
    this.tagIndex.clear();
    this.typeIndex.clear();
    this.temporalIndex.clear();
    this.semanticIndex.clear();
  }
  
  /**
   * Rebuild all indexes from storage
   */
  private async rebuildIndexes(): Promise<void> {
    this.clearIndexes();
    
    const allMemories = await this.store.getAll();
    for (const memory of allMemories) {
      this.updateIndexes(memory);
    }
  }
}

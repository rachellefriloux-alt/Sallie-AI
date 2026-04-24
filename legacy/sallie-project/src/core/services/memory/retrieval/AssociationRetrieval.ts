/**
 * Association Retrieval Strategy
 * 
 * Retrieves memories based on associative links and relationships
 * between memories.
 */

import {
  BaseRetrievalStrategy,
  RetrievalContext,
  RetrievalOptions,
  RetrievedMemory
} from './RetrievalStrategy';
import { MemoryEntity } from '../models/MemoryEntity';
import { IMemoryStore } from '../storage/MemoryStore';

/**
 * Association Retrieval Strategy
 * 
 * Finds memories that are associated with a seed memory or context
 * by following relationship links and similarity patterns.
 */
export class AssociationRetrieval extends BaseRetrievalStrategy {
  /**
   * Retrieve memories based on associations
   */
  async retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]> {
    // Get seed memories (memories mentioned in context or recent memories)
    const seedMemories = await this.getSeedMemories(context, store);
    
    if (seedMemories.length === 0) {
      return [];
    }
    
    // Get all memories for association analysis
    const allMemories = await store.getAll();
    
    // Calculate association strength for each memory
    const scoredMemories: RetrievedMemory[] = allMemories
      .filter(m => !seedMemories.some(seed => seed.id === m.id))
      .map(memory => ({
        memory,
        relevanceScore: this.calculateRelevance(memory, context, seedMemories),
        retrievalReason: 'Associated with relevant memories'
      }));
    
    return this.filterAndSort(scoredMemories, options);
  }
  
  /**
   * Calculate relevance based on association strength
   */
  calculateRelevance(
    memory: MemoryEntity,
    context: RetrievalContext,
    seedMemories?: MemoryEntity[]
  ): number {
    if (!seedMemories || seedMemories.length === 0) {
      return 0;
    }
    
    // Calculate average association strength with seed memories
    const associations = seedMemories.map(seed =>
      this.calculateAssociationStrength(memory, seed)
    );
    
    return Math.max(...associations);
  }
  
  /**
   * Get seed memories from context
   */
  private async getSeedMemories(
    context: RetrievalContext,
    store: IMemoryStore
  ): Promise<MemoryEntity[]> {
    const seeds: MemoryEntity[] = [];
    
    // If specific memory IDs are provided in context
    if ((context as any).seedMemoryIds) {
      for (const id of (context as any).seedMemoryIds) {
        const memory = await store.retrieve(id);
        if (memory) seeds.push(memory);
      }
    }
    
    // Otherwise, use entities and topics to find seed memories
    if (seeds.length === 0 && (context.entities || context.topics)) {
      const recentMemories = await store.query({
        entities: context.entities,
        tags: context.topics,
        limit: 5,
        sortBy: 'lastAccessedAt',
        sortDirection: 'desc'
      });
      seeds.push(...recentMemories);
    }
    
    return seeds;
  }
  
  /**
   * Calculate association strength between two memories
   */
  private calculateAssociationStrength(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    let strength = 0;
    
    // Entity co-occurrence (weight: 0.4)
    const entityOverlap = this.calculateEntityOverlap(memory1, memory2);
    strength += entityOverlap * 0.4;
    
    // Tag similarity (weight: 0.3)
    const tagSimilarity = this.calculateTagSimilarity(memory1, memory2);
    strength += tagSimilarity * 0.3;
    
    // Type relationship (weight: 0.1)
    if (memory1.type === memory2.type) {
      strength += 0.1;
    }
    
    // Temporal proximity (weight: 0.2)
    const temporalProximity = this.calculateTemporalProximity(memory1, memory2);
    strength += temporalProximity * 0.2;
    
    return strength;
  }
  
  /**
   * Calculate entity overlap between memories
   */
  private calculateEntityOverlap(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    const entities1 = new Set(memory1.metadata.entities);
    const entities2 = new Set(memory2.metadata.entities);
    
    const intersection = new Set(
      [...entities1].filter(e => entities2.has(e))
    );
    const union = new Set([...entities1, ...entities2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Calculate tag similarity between memories
   */
  private calculateTagSimilarity(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    const tags1 = new Set(memory1.metadata.tags);
    const tags2 = new Set(memory2.metadata.tags);
    
    const intersection = new Set(
      [...tags1].filter(t => tags2.has(t))
    );
    const union = new Set([...tags1, ...tags2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
  
  /**
   * Calculate temporal proximity between memories
   */
  private calculateTemporalProximity(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    const time1 = memory1.metadata.createdAt.getTime();
    const time2 = memory2.metadata.createdAt.getTime();
    const hoursDiff = Math.abs(time1 - time2) / (1000 * 60 * 60);
    
    // Exponential decay with 48-hour half-life
    return Math.exp(-hoursDiff / 48);
  }
}

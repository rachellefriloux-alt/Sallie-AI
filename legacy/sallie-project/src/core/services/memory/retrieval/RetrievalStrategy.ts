/**
 * Retrieval Strategy Interface
 * 
 * Defines the contract for different memory retrieval strategies.
 * Each strategy implements a different approach to finding relevant memories.
 */

import { MemoryEntity } from '../models/MemoryEntity';
import { IMemoryStore } from '../storage/MemoryStore';

/**
 * Context for memory retrieval
 */
export interface RetrievalContext {
  /** Current conversation or interaction context */
  conversationContext?: {
    recentMessages?: string[];
    currentTopic?: string;
    participants?: string[];
  };
  
  /** Temporal context */
  temporalContext?: {
    currentTime?: Date;
    timeRange?: {
      start: Date;
      end: Date;
    };
  };
  
  /** Entities of interest */
  entities?: string[];
  
  /** Topics of interest */
  topics?: string[];
  
  /** Emotional context */
  emotionalContext?: {
    currentEmotion?: string;
    emotionalIntensity?: number;
  };
  
  /** User intent or goal */
  intent?: string;
  
  /** Additional context */
  [key: string]: unknown;
}

/**
 * Retrieval options
 */
export interface RetrievalOptions {
  /** Maximum number of memories to retrieve */
  limit?: number;
  
  /** Minimum relevance score (0-1) */
  minRelevance?: number;
  
  /** Minimum importance score (0-1) */
  minImportance?: number;
  
  /** Include only consolidated memories */
  consolidatedOnly?: boolean;
  
  /** Diversity factor (0-1, where 1 means maximum diversity) */
  diversityFactor?: number;
}

/**
 * Retrieved memory with relevance score
 */
export interface RetrievedMemory {
  /** The memory */
  memory: MemoryEntity;
  
  /** Relevance score (0-1) */
  relevanceScore: number;
  
  /** Explanation of why this memory was retrieved */
  retrievalReason?: string;
}

/**
 * Retrieval Strategy Interface
 * 
 * Base interface for all retrieval strategies.
 * Each strategy implements a different algorithm for finding relevant memories.
 */
export interface IRetrievalStrategy {
  /**
   * Retrieve memories based on context
   * 
   * @param context Retrieval context
   * @param options Retrieval options
   * @param store Memory store to query
   * @returns Promise that resolves to array of retrieved memories with scores
   */
  retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]>;
  
  /**
   * Calculate relevance score for a specific memory
   * 
   * @param memory The memory to score
   * @param context Retrieval context
   * @returns Relevance score (0-1)
   */
  calculateRelevance(
    memory: MemoryEntity,
    context: RetrievalContext
  ): number;
}

/**
 * Base class for retrieval strategies with common utilities
 */
export abstract class BaseRetrievalStrategy implements IRetrievalStrategy {
  /**
   * Retrieve memories based on context
   */
  abstract retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]>;
  
  /**
   * Calculate relevance score for a specific memory
   */
  abstract calculateRelevance(
    memory: MemoryEntity,
    context: RetrievalContext
  ): number;
  
  /**
   * Filter and sort retrieved memories based on options
   */
  protected filterAndSort(
    memories: RetrievedMemory[],
    options: RetrievalOptions
  ): RetrievedMemory[] {
    let results = [...memories];
    
    // Filter by minimum relevance
    if (options.minRelevance !== undefined) {
      results = results.filter(m => m.relevanceScore >= options.minRelevance!);
    }
    
    // Filter by minimum importance
    if (options.minImportance !== undefined) {
      results = results.filter(
        m => m.memory.getEffectiveImportance() >= options.minImportance!
      );
    }
    
    // Filter by consolidation status
    if (options.consolidatedOnly) {
      results = results.filter(m => m.memory.isConsolidated);
    }
    
    // Sort by relevance score (descending)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply diversity if requested
    if (options.diversityFactor && options.diversityFactor > 0) {
      results = this.applyDiversity(results, options.diversityFactor);
    }
    
    // Apply limit
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }
  
  /**
   * Apply diversity to results (reduce redundancy)
   */
  protected applyDiversity(
    memories: RetrievedMemory[],
    diversityFactor: number
  ): RetrievedMemory[] {
    if (memories.length <= 1) return memories;
    
    const diverse: RetrievedMemory[] = [memories[0]];
    
    for (let i = 1; i < memories.length; i++) {
      const candidate = memories[i];
      
      // Calculate minimum similarity to already selected memories
      let minDissimilarity = 1;
      for (const selected of diverse) {
        const similarity = this.calculateSimilarity(
          candidate.memory,
          selected.memory
        );
        minDissimilarity = Math.min(minDissimilarity, 1 - similarity);
      }
      
      // Adjust score based on diversity
      const adjustedScore = 
        candidate.relevanceScore * (1 - diversityFactor) +
        minDissimilarity * diversityFactor;
      
      // Insert in sorted order
      const insertIndex = diverse.findIndex(m => adjustedScore > m.relevanceScore);
      if (insertIndex === -1) {
        diverse.push(candidate);
      } else {
        diverse.splice(insertIndex, 0, candidate);
      }
    }
    
    return diverse;
  }
  
  /**
   * Calculate similarity between two memories (0-1)
   * Can be overridden by specific strategies
   */
  protected calculateSimilarity(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    let similarity = 0;
    
    // Same type increases similarity
    if (memory1.type === memory2.type) {
      similarity += 0.2;
    }
    
    // Common tags increase similarity
    const commonTags = memory1.metadata.tags.filter(tag =>
      memory2.metadata.tags.includes(tag)
    );
    similarity += (commonTags.length / Math.max(
      memory1.metadata.tags.length,
      memory2.metadata.tags.length,
      1
    )) * 0.4;
    
    // Common entities increase similarity
    const commonEntities = memory1.metadata.entities.filter(entity =>
      memory2.metadata.entities.includes(entity)
    );
    similarity += (commonEntities.length / Math.max(
      memory1.metadata.entities.length,
      memory2.metadata.entities.length,
      1
    )) * 0.4;
    
    return Math.min(1, similarity);
  }
  
  /**
   * Calculate text similarity (simple word overlap)
   */
  protected calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set(
      [...words1].filter(word => words2.has(word))
    );
    
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

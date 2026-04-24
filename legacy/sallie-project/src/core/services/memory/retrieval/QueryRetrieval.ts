/**
 * Query Retrieval Strategy
 * 
 * Direct query-based retrieval using storage filters.
 * Provides SQL-like query capabilities with complex filtering.
 */

import {
  BaseRetrievalStrategy,
  RetrievalContext,
  RetrievalOptions,
  RetrievedMemory
} from './RetrievalStrategy';
import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { IMemoryStore, QueryOptions } from '../storage/MemoryStore';

/**
 * Query parameters for direct filtering
 */
export interface QueryParameters {
  /** Filter by memory type */
  type?: MemoryType;
  
  /** Filter by tags (AND operation) */
  tags?: string[];
  
  /** Filter by entities (AND operation) */
  entities?: string[];
  
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  /** Minimum importance threshold */
  minImportance?: number;
  
  /** Minimum confidence threshold */
  minConfidence?: number;
  
  /** Only consolidated memories */
  consolidatedOnly?: boolean;
  
  /** Sort field */
  sortBy?: 'createdAt' | 'lastAccessedAt' | 'importance' | 'confidence';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  
  /** Text search in content */
  textSearch?: string;
}

/**
 * Query Retrieval Strategy
 * 
 * Provides direct, precise filtering of memories using query parameters.
 * Similar to SQL WHERE clauses for exact matching.
 */
export class QueryRetrieval extends BaseRetrievalStrategy {
  /**
   * Retrieve memories using direct query
   */
  async retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]> {
    // Extract query parameters from context
    const queryParams = (context as any).queryParameters as QueryParameters;
    
    if (!queryParams) {
      return [];
    }
    
    // Build storage query options
    const queryOptions: QueryOptions = {
      type: queryParams.type,
      tags: queryParams.tags,
      entities: queryParams.entities,
      dateRange: queryParams.dateRange,
      minImportance: queryParams.minImportance,
      minConfidence: queryParams.minConfidence,
      consolidatedOnly: queryParams.consolidatedOnly,
      sortBy: queryParams.sortBy,
      sortDirection: queryParams.sortDirection,
      limit: options.limit
    };
    
    // Query storage
    let memories = await store.query(queryOptions);
    
    // Apply text search if specified
    if (queryParams.textSearch) {
      memories = this.filterByTextSearch(memories, queryParams.textSearch);
    }
    
    // Convert to retrieved memories with relevance scores
    const scoredMemories: RetrievedMemory[] = memories.map(memory => ({
      memory,
      relevanceScore: this.calculateRelevance(memory, context),
      retrievalReason: this.generateRetrievalReason(memory, queryParams)
    }));
    
    return this.filterAndSort(scoredMemories, options);
  }
  
  /**
   * Calculate relevance score for query-based retrieval
   */
  calculateRelevance(memory: MemoryEntity, context: RetrievalContext): number {
    // For query retrieval, all results are equally relevant
    // Score is based on memory importance and confidence
    return (memory.getEffectiveImportance() + memory.metadata.confidence) / 2;
  }
  
  /**
   * Filter memories by text search
   */
  private filterByTextSearch(memories: MemoryEntity[], searchText: string): MemoryEntity[] {
    const searchLower = searchText.toLowerCase();
    
    return memories.filter(memory => {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      return contentStr.includes(searchLower);
    });
  }
  
  /**
   * Generate retrieval reason
   */
  private generateRetrievalReason(memory: MemoryEntity, params: QueryParameters): string {
    const reasons: string[] = [];
    
    if (params.type) {
      reasons.push(`Type: ${params.type}`);
    }
    
    if (params.tags && params.tags.length > 0) {
      reasons.push(`Tags: ${params.tags.join(', ')}`);
    }
    
    if (params.entities && params.entities.length > 0) {
      reasons.push(`Entities: ${params.entities.join(', ')}`);
    }
    
    if (params.dateRange) {
      reasons.push('Within date range');
    }
    
    if (params.textSearch) {
      reasons.push(`Text match: "${params.textSearch}"`);
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Direct query match';
  }
  
  /**
   * Build a query context from parameters
   */
  static buildQueryContext(params: QueryParameters): RetrievalContext {
    return {
      queryParameters: params
    };
  }
}

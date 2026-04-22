/**
 * Temporal Retrieval Strategy
 * 
 * Retrieves memories based on temporal relationships and time-based queries.
 */

import {
  BaseRetrievalStrategy,
  RetrievalContext,
  RetrievalOptions,
  RetrievedMemory
} from './RetrievalStrategy';
import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { IMemoryStore } from '../storage/MemoryStore';

/**
 * Temporal Retrieval Strategy
 * 
 * Finds memories based on:
 * - Specific time periods
 * - Relative time (recent, distant past)
 * - Temporal patterns (same time of day, same day of week)
 */
export class TemporalRetrieval extends BaseRetrievalStrategy {
  /**
   * Retrieve memories based on temporal criteria
   */
  async retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]> {
    let queryOptions: any = {};
    
    // Add time range filter if provided
    if (context.temporalContext?.timeRange) {
      queryOptions.dateRange = context.temporalContext.timeRange;
    }
    
    // Query memories
    const memories = await store.query(queryOptions);
    
    // Calculate relevance for each memory
    const scoredMemories: RetrievedMemory[] = memories.map(memory => ({
      memory,
      relevanceScore: this.calculateRelevance(memory, context),
      retrievalReason: this.generateRetrievalReason(memory, context)
    }));
    
    return this.filterAndSort(scoredMemories, options);
  }
  
  /**
   * Calculate temporal relevance
   */
  calculateRelevance(memory: MemoryEntity, context: RetrievalContext): number {
    if (!context.temporalContext) return 0.5;
    
    let score = 0;
    let weights = 0;
    
    // Exact time range match (weight: 0.5)
    if (context.temporalContext.timeRange) {
      const inRange = this.isInTimeRange(
        memory,
        context.temporalContext.timeRange.start,
        context.temporalContext.timeRange.end
      );
      if (inRange) {
        score += 1.0 * 0.5;
      }
      weights += 0.5;
    }
    
    // Recency score (weight: 0.3)
    if (context.temporalContext.currentTime) {
      const recencyScore = this.calculateRecencyScore(
        memory,
        context.temporalContext.currentTime
      );
      score += recencyScore * 0.3;
      weights += 0.3;
    }
    
    // Pattern matching (same time of day, day of week) (weight: 0.2)
    if (context.temporalContext.currentTime && memory.type === MemoryType.EPISODIC) {
      const patternScore = this.calculatePatternScore(
        memory as EpisodicMemory,
        context.temporalContext.currentTime
      );
      score += patternScore * 0.2;
      weights += 0.2;
    }
    
    return weights > 0 ? score / weights : 0.5;
  }
  
  /**
   * Check if memory falls within time range
   */
  private isInTimeRange(
    memory: MemoryEntity,
    start: Date,
    end: Date
  ): boolean {
    const memoryTime = memory.metadata.createdAt.getTime();
    return memoryTime >= start.getTime() && memoryTime <= end.getTime();
  }
  
  /**
   * Calculate recency score (more recent = higher score)
   */
  private calculateRecencyScore(
    memory: MemoryEntity,
    currentTime: Date
  ): number {
    const memoryTime = memory.metadata.createdAt.getTime();
    const current = currentTime.getTime();
    const daysSince = (current - memoryTime) / (1000 * 60 * 60 * 24);
    
    // Exponential decay with 7-day half-life
    return Math.exp(-daysSince / 7);
  }
  
  /**
   * Calculate temporal pattern score
   */
  private calculatePatternScore(
    memory: EpisodicMemory,
    currentTime: Date
  ): number {
    let patternScore = 0;
    
    const memoryTime = memory.content.temporal.startTime;
    
    // Same time of day (within 2 hours)
    const memoryHour = memoryTime.getHours();
    const currentHour = currentTime.getHours();
    const hourDiff = Math.abs(memoryHour - currentHour);
    if (hourDiff <= 2 || hourDiff >= 22) {
      patternScore += 0.5;
    }
    
    // Same day of week
    if (memoryTime.getDay() === currentTime.getDay()) {
      patternScore += 0.3;
    }
    
    // Same date (anniversary)
    if (
      memoryTime.getDate() === currentTime.getDate() &&
      memoryTime.getMonth() === currentTime.getMonth()
    ) {
      patternScore += 0.2;
    }
    
    return Math.min(1, patternScore);
  }
  
  /**
   * Generate retrieval reason
   */
  private generateRetrievalReason(
    memory: MemoryEntity,
    context: RetrievalContext
  ): string {
    const reasons: string[] = [];
    
    if (context.temporalContext?.timeRange) {
      reasons.push('Within specified time range');
    }
    
    if (context.temporalContext?.currentTime) {
      const daysSince = Math.floor(
        (context.temporalContext.currentTime.getTime() - 
         memory.metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSince === 0) {
        reasons.push('From today');
      } else if (daysSince === 1) {
        reasons.push('From yesterday');
      } else if (daysSince <= 7) {
        reasons.push(`From ${daysSince} days ago`);
      } else {
        reasons.push('From the past');
      }
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Temporally relevant';
  }
}

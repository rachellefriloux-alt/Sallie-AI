/**
 * Consolidation Engine
 * 
 * Manages the process of converting short-term memories into long-term storage
 * with integration, pattern detection, and importance assessment.
 */

import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { SemanticMemory } from '../models/SemanticMemory';
import { IMemoryStore } from '../storage/MemoryStore';
import { ShortTermBuffer } from './ShortTermBuffer';

/**
 * Consolidation result
 */
export interface ConsolidationResult {
  /** Number of memories consolidated */
  consolidated: number;
  
  /** Number of memories integrated with existing memories */
  integrated: number;
  
  /** Number of patterns detected */
  patternsDetected: number;
  
  /** Memories that were consolidated */
  consolidatedMemories: MemoryEntity[];
}

/**
 * Consolidation Engine
 * 
 * Handles the complex process of memory consolidation including:
 * - Importance assessment
 * - Pattern detection
 * - Memory integration
 * - Contradiction resolution
 */
export class ConsolidationEngine {
  private store: IMemoryStore;
  private buffer: ShortTermBuffer;
  
  constructor(store: IMemoryStore, buffer: ShortTermBuffer) {
    this.store = store;
    this.buffer = buffer;
  }
  
  /**
   * Run consolidation process
   */
  async consolidate(): Promise<ConsolidationResult> {
    const result: ConsolidationResult = {
      consolidated: 0,
      integrated: 0,
      patternsDetected: 0,
      consolidatedMemories: []
    };
    
    // Get memories ready for consolidation
    const candidates = this.buffer.getReadyForConsolidation();
    
    for (const memory of candidates) {
      // Assess importance
      await this.assessImportance(memory);
      
      // Check for integration opportunities
      const integrated = await this.tryIntegrate(memory);
      if (integrated) {
        result.integrated++;
        this.buffer.remove(memory.id);
        continue;
      }
      
      // Mark as consolidated and store
      memory.consolidate();
      await this.store.update(memory);
      
      result.consolidated++;
      result.consolidatedMemories.push(memory);
      
      // Remove from short-term buffer
      this.buffer.remove(memory.id);
    }
    
    // Detect patterns across consolidated memories
    result.patternsDetected = await this.detectPatterns(result.consolidatedMemories);
    
    return result;
  }
  
  /**
   * Assess and adjust memory importance
   */
  private async assessImportance(memory: MemoryEntity): Promise<void> {
    let importanceScore = memory.metadata.importance;
    
    // Boost importance for frequently accessed memories
    const accessBoost = Math.min(0.3, memory.metadata.accessCount * 0.03);
    importanceScore += accessBoost;
    
    // Boost importance for memories with many associations
    const entityCount = memory.metadata.entities.length;
    const entityBoost = Math.min(0.2, entityCount * 0.02);
    importanceScore += entityBoost;
    
    // Boost importance for high-confidence memories
    const confidenceBoost = memory.metadata.confidence * 0.1;
    importanceScore += confidenceBoost;
    
    // Check for related consolidated memories (context importance)
    const relatedCount = await this.countRelatedMemories(memory);
    const contextBoost = Math.min(0.2, relatedCount * 0.04);
    importanceScore += contextBoost;
    
    // Cap at 1.0
    memory.metadata.importance = Math.min(1.0, importanceScore);
  }
  
  /**
   * Count related consolidated memories
   */
  private async countRelatedMemories(memory: MemoryEntity): Promise<number> {
    const related = await this.store.query({
      entities: memory.metadata.entities.slice(0, 3),
      consolidatedOnly: true,
      limit: 100
    });
    
    return related.length;
  }
  
  /**
   * Try to integrate memory with existing memories
   */
  private async tryIntegrate(memory: MemoryEntity): Promise<boolean> {
    // Only integrate semantic memories for now
    if (memory.type !== MemoryType.SEMANTIC) {
      return false;
    }
    
    const semanticMemory = memory as SemanticMemory;
    
    // Find potentially conflicting semantic memories
    const existing = await this.store.query({
      type: MemoryType.SEMANTIC,
      entities: [semanticMemory.content.subject],
      consolidatedOnly: true
    });
    
    for (const existingMemory of existing) {
      const existingSemantic = existingMemory as SemanticMemory;
      
      // Check for contradiction
      if (semanticMemory.contradicts(existingSemantic)) {
        // Merge the memories
        existingSemantic.mergeWith(semanticMemory, true);
        await this.store.update(existingSemantic);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Detect patterns across memories
   */
  private async detectPatterns(memories: MemoryEntity[]): Promise<number> {
    let patternsDetected = 0;
    
    // Group memories by type
    const byType = new Map<MemoryType, MemoryEntity[]>();
    
    for (const memory of memories) {
      if (!byType.has(memory.type)) {
        byType.set(memory.type, []);
      }
      byType.get(memory.type)!.push(memory);
    }
    
    // Detect patterns within each type
    for (const [type, typeMemories] of byType) {
      if (typeMemories.length < 2) continue;
      
      // Look for common entities
      const entityPatterns = this.detectEntityPatterns(typeMemories);
      patternsDetected += entityPatterns;
      
      // Look for common tags/topics
      const topicPatterns = this.detectTopicPatterns(typeMemories);
      patternsDetected += topicPatterns;
    }
    
    return patternsDetected;
  }
  
  /**
   * Detect entity co-occurrence patterns
   */
  private detectEntityPatterns(memories: MemoryEntity[]): number {
    const entityPairs = new Map<string, number>();
    
    // Count entity co-occurrences
    for (const memory of memories) {
      const entities = memory.metadata.entities;
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const pair = [entities[i], entities[j]].sort().join('|');
          entityPairs.set(pair, (entityPairs.get(pair) || 0) + 1);
        }
      }
    }
    
    // Count patterns (co-occurrence >= 3 times)
    let patterns = 0;
    for (const count of entityPairs.values()) {
      if (count >= 3) patterns++;
    }
    
    return patterns;
  }
  
  /**
   * Detect topic patterns
   */
  private detectTopicPatterns(memories: MemoryEntity[]): number {
    const topicCounts = new Map<string, number>();
    
    // Count topic occurrences
    for (const memory of memories) {
      for (const tag of memory.metadata.tags) {
        topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
      }
    }
    
    // Count patterns (topic appears in >= 3 memories)
    let patterns = 0;
    for (const count of topicCounts.values()) {
      if (count >= 3) patterns++;
    }
    
    return patterns;
  }
  
  /**
   * Force consolidation of specific memory
   */
  async consolidateMemory(memoryId: string): Promise<boolean> {
    const memory = this.buffer.get(memoryId);
    if (!memory) return false;
    
    await this.assessImportance(memory);
    
    const integrated = await this.tryIntegrate(memory);
    if (!integrated) {
      memory.consolidate();
      await this.store.update(memory);
    }
    
    this.buffer.remove(memoryId);
    return true;
  }
}

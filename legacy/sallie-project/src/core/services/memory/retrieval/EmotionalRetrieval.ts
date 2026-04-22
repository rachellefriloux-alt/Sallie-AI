/**
 * Emotional Retrieval Strategy
 * 
 * Retrieves memories based on emotional similarity and emotional context.
 */

import {
  BaseRetrievalStrategy,
  RetrievalContext,
  RetrievalOptions,
  RetrievedMemory
} from './RetrievalStrategy';
import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { EmotionalMemory } from '../models/EmotionalMemory';
import { IMemoryStore } from '../storage/MemoryStore';

/**
 * Emotional Retrieval Strategy
 * 
 * Finds memories based on:
 * - Similar emotional states
 * - Emotional triggers
 * - Valence and arousal patterns
 */
export class EmotionalRetrieval extends BaseRetrievalStrategy {
  /**
   * Retrieve emotionally relevant memories
   */
  async retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]> {
    // Get all memories (prioritize emotional memories)
    const allMemories = await store.getAll();
    
    // Calculate emotional relevance
    const scoredMemories: RetrievedMemory[] = allMemories.map(memory => ({
      memory,
      relevanceScore: this.calculateRelevance(memory, context),
      retrievalReason: this.generateRetrievalReason(memory, context)
    }));
    
    return this.filterAndSort(scoredMemories, options);
  }
  
  /**
   * Calculate emotional relevance
   */
  calculateRelevance(memory: MemoryEntity, context: RetrievalContext): number {
    if (!context.emotionalContext) return 0;
    
    let score = 0;
    let weights = 0;
    
    // Direct emotional memory matching (weight: 0.6)
    if (memory.type === MemoryType.EMOTIONAL) {
      const emotionalScore = this.calculateEmotionalSimilarity(
        memory as EmotionalMemory,
        context.emotionalContext.currentEmotion,
        context.emotionalContext.emotionalIntensity
      );
      score += emotionalScore * 0.6;
      weights += 0.6;
    }
    
    // Emotional tag matching (weight: 0.3)
    if (context.emotionalContext.currentEmotion) {
      const tagScore = this.calculateEmotionalTagScore(
        memory,
        context.emotionalContext.currentEmotion
      );
      score += tagScore * 0.3;
      weights += 0.3;
    }
    
    // Importance boost for high-intensity contexts (weight: 0.1)
    if (context.emotionalContext.emotionalIntensity !== undefined) {
      const importanceBoost = memory.getEffectiveImportance() * 
                             context.emotionalContext.emotionalIntensity;
      score += importanceBoost * 0.1;
      weights += 0.1;
    }
    
    return weights > 0 ? score / weights : 0;
  }
  
  /**
   * Calculate emotional similarity for emotional memories
   */
  private calculateEmotionalSimilarity(
    memory: EmotionalMemory,
    currentEmotion?: string,
    currentIntensity?: number
  ): number {
    if (!currentEmotion) return 0;
    
    let similarity = 0;
    
    // Primary emotion match
    if (memory.content.emotionalState.primaryEmotion.toLowerCase() === 
        currentEmotion.toLowerCase()) {
      similarity += 0.5;
    }
    
    // Secondary emotion match
    if (memory.content.emotionalState.secondaryEmotions) {
      const hasSecondary = memory.content.emotionalState.secondaryEmotions.some(
        e => e.toLowerCase() === currentEmotion.toLowerCase()
      );
      if (hasSecondary) {
        similarity += 0.2;
      }
    }
    
    // Intensity similarity
    if (currentIntensity !== undefined) {
      const intensityDiff = Math.abs(
        memory.content.emotionalState.intensity - currentIntensity
      );
      similarity += (1 - intensityDiff) * 0.3;
    }
    
    return similarity;
  }
  
  /**
   * Calculate emotional tag score for non-emotional memories
   */
  private calculateEmotionalTagScore(
    memory: MemoryEntity,
    currentEmotion: string
  ): number {
    const emotionLower = currentEmotion.toLowerCase();
    
    // Check if emotion appears in tags
    const hasEmotionTag = memory.metadata.tags.some(
      tag => tag.toLowerCase().includes(emotionLower)
    );
    
    return hasEmotionTag ? 1.0 : 0.0;
  }
  
  /**
   * Generate retrieval reason
   */
  private generateRetrievalReason(
    memory: MemoryEntity,
    context: RetrievalContext
  ): string {
    const reasons: string[] = [];
    
    if (context.emotionalContext?.currentEmotion) {
      if (memory.type === MemoryType.EMOTIONAL) {
        const emotionalMemory = memory as EmotionalMemory;
        if (emotionalMemory.content.emotionalState.primaryEmotion.toLowerCase() === 
            context.emotionalContext.currentEmotion.toLowerCase()) {
          reasons.push(`Similar emotion: ${context.emotionalContext.currentEmotion}`);
        }
      } else if (memory.metadata.tags.some(
        tag => tag.toLowerCase().includes(context.emotionalContext!.currentEmotion!.toLowerCase())
      )) {
        reasons.push(`Related to ${context.emotionalContext.currentEmotion}`);
      }
    }
    
    if (context.emotionalContext?.emotionalIntensity && 
        context.emotionalContext.emotionalIntensity > 0.7) {
      reasons.push('High emotional intensity');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Emotionally relevant';
  }
}

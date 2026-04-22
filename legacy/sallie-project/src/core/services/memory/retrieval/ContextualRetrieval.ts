/**
 * Contextual Retrieval Strategy
 * 
 * Retrieves memories based on current conversation context,
 * topics, entities, and situational factors.
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
 * Contextual Retrieval Strategy
 * 
 * Finds memories that are relevant to the current context by analyzing:
 * - Entity overlap
 * - Topic relevance
 * - Conversation context
 * - Temporal proximity
 */
export class ContextualRetrieval extends BaseRetrievalStrategy {
  /**
   * Retrieve memories based on context
   */
  async retrieve(
    context: RetrievalContext,
    options: RetrievalOptions,
    store: IMemoryStore
  ): Promise<RetrievedMemory[]> {
    // Get all memories (in a real system, you'd want to pre-filter)
    const allMemories = await store.getAll();
    
    // Calculate relevance for each memory
    const scoredMemories: RetrievedMemory[] = allMemories.map(memory => ({
      memory,
      relevanceScore: this.calculateRelevance(memory, context),
      retrievalReason: this.generateRetrievalReason(memory, context)
    }));
    
    // Filter and sort
    return this.filterAndSort(scoredMemories, options);
  }
  
  /**
   * Calculate relevance score for a specific memory
   */
  calculateRelevance(memory: MemoryEntity, context: RetrievalContext): number {
    let score = 0;
    let weights = 0;
    
    // Entity relevance (weight: 0.3)
    if (context.entities && context.entities.length > 0) {
      const entityScore = this.calculateEntityRelevance(memory, context.entities);
      score += entityScore * 0.3;
      weights += 0.3;
    }
    
    // Topic relevance (weight: 0.3)
    if (context.topics && context.topics.length > 0) {
      const topicScore = this.calculateTopicRelevance(memory, context.topics);
      score += topicScore * 0.3;
      weights += 0.3;
    }
    
    // Conversation context relevance (weight: 0.2)
    if (context.conversationContext?.recentMessages) {
      const convScore = this.calculateConversationRelevance(
        memory,
        context.conversationContext.recentMessages
      );
      score += convScore * 0.2;
      weights += 0.2;
    }
    
    // Temporal relevance (weight: 0.2)
    if (context.temporalContext?.currentTime) {
      const temporalScore = this.calculateTemporalRelevance(
        memory,
        context.temporalContext.currentTime
      );
      score += temporalScore * 0.2;
      weights += 0.2;
    }
    
    // Normalize by total weights
    return weights > 0 ? score / weights : 0;
  }
  
  /**
   * Calculate entity relevance
   */
  private calculateEntityRelevance(
    memory: MemoryEntity,
    entities: string[]
  ): number {
    const memoryEntities = memory.metadata.entities;
    const commonEntities = entities.filter(e => memoryEntities.includes(e));
    
    if (memoryEntities.length === 0 && entities.length === 0) return 0;
    
    return commonEntities.length / Math.max(memoryEntities.length, entities.length);
  }
  
  /**
   * Calculate topic relevance
   */
  private calculateTopicRelevance(
    memory: MemoryEntity,
    topics: string[]
  ): number {
    const memoryTags = memory.metadata.tags;
    const commonTopics = topics.filter(t =>
      memoryTags.some(tag => tag.toLowerCase().includes(t.toLowerCase()))
    );
    
    if (memoryTags.length === 0 && topics.length === 0) return 0;
    
    return commonTopics.length / Math.max(memoryTags.length, topics.length);
  }
  
  /**
   * Calculate conversation relevance
   */
  private calculateConversationRelevance(
    memory: MemoryEntity,
    recentMessages: string[]
  ): number {
    const memoryContent = JSON.stringify(memory.content).toLowerCase();
    const conversationText = recentMessages.join(' ').toLowerCase();
    
    return this.calculateTextSimilarity(memoryContent, conversationText);
  }
  
  /**
   * Calculate temporal relevance (more recent = more relevant)
   */
  private calculateTemporalRelevance(
    memory: MemoryEntity,
    currentTime: Date
  ): number {
    const memoryTime = memory.metadata.createdAt.getTime();
    const current = currentTime.getTime();
    const hoursSince = (current - memoryTime) / (1000 * 60 * 60);
    
    // Exponential decay: more recent memories are more relevant
    // Half-life of 24 hours
    return Math.exp(-hoursSince / 24);
  }
  
  /**
   * Generate explanation for why memory was retrieved
   */
  private generateRetrievalReason(
    memory: MemoryEntity,
    context: RetrievalContext
  ): string {
    const reasons: string[] = [];
    
    if (context.entities && context.entities.length > 0) {
      const commonEntities = context.entities.filter(e =>
        memory.metadata.entities.includes(e)
      );
      if (commonEntities.length > 0) {
        reasons.push(`Related to: ${commonEntities.join(', ')}`);
      }
    }
    
    if (context.topics && context.topics.length > 0) {
      const commonTopics = context.topics.filter(t =>
        memory.metadata.tags.some(tag => tag.toLowerCase().includes(t.toLowerCase()))
      );
      if (commonTopics.length > 0) {
        reasons.push(`Topics: ${commonTopics.join(', ')}`);
      }
    }
    
    if (context.conversationContext?.currentTopic) {
      reasons.push(`Current topic: ${context.conversationContext.currentTopic}`);
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 'Contextually relevant';
  }
}

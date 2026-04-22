/**
 * Attention Mechanism
 * 
 * Advanced importance weighting system using attention-based algorithms
 * to dynamically assess memory importance based on context and relevance.
 */

import { MemoryEntity } from '../models/MemoryEntity';

/**
 * Attention configuration
 */
export interface AttentionConfig {
  /** Weight for recency factor */
  recencyWeight?: number;
  
  /** Weight for frequency factor */
  frequencyWeight?: number;
  
  /** Weight for connectivity factor */
  connectivityWeight?: number;
  
  /** Weight for emotional intensity */
  emotionalWeight?: number;
  
  /** Weight for user interaction */
  interactionWeight?: number;
  
  /** Enable self-attention */
  enableSelfAttention?: boolean;
}

/**
 * Attention score components
 */
export interface AttentionComponents {
  /** Recency score (0-1) */
  recency: number;
  
  /** Frequency score (0-1) */
  frequency: number;
  
  /** Connectivity score (0-1) */
  connectivity: number;
  
  /** Emotional intensity score (0-1) */
  emotional: number;
  
  /** User interaction score (0-1) */
  interaction: number;
  
  /** Self-attention score (0-1) */
  selfAttention: number;
  
  /** Final weighted score (0-1) */
  finalScore: number;
}

/**
 * Attention Mechanism
 * 
 * Implements attention-based importance weighting inspired by
 * transformer architectures and neural attention mechanisms.
 */
export class AttentionMechanism {
  private config: Required<AttentionConfig>;
  
  constructor(config: AttentionConfig = {}) {
    this.config = {
      recencyWeight: config.recencyWeight ?? 0.25,
      frequencyWeight: config.frequencyWeight ?? 0.2,
      connectivityWeight: config.connectivityWeight ?? 0.2,
      emotionalWeight: config.emotionalWeight ?? 0.15,
      interactionWeight: config.interactionWeight ?? 0.2,
      enableSelfAttention: config.enableSelfAttention ?? true
    };
    
    // Normalize weights
    this.normalizeWeights();
  }
  
  /**
   * Calculate attention score for a memory
   */
  calculateAttention(
    memory: MemoryEntity,
    context?: {
      allMemories?: MemoryEntity[];
      associationCount?: number;
      currentTime?: Date;
    }
  ): AttentionComponents {
    const now = context?.currentTime || new Date();
    
    // Calculate individual components
    const recency = this.calculateRecency(memory, now);
    const frequency = this.calculateFrequency(memory);
    const connectivity = this.calculateConnectivity(memory, context?.associationCount);
    const emotional = this.calculateEmotionalIntensity(memory);
    const interaction = this.calculateInteraction(memory);
    
    // Calculate self-attention if enabled
    let selfAttention = 0;
    if (this.config.enableSelfAttention && context?.allMemories) {
      selfAttention = this.calculateSelfAttention(memory, context.allMemories);
    }
    
    // Calculate weighted final score
    const finalScore = 
      recency * this.config.recencyWeight +
      frequency * this.config.frequencyWeight +
      connectivity * this.config.connectivityWeight +
      emotional * this.config.emotionalWeight +
      interaction * this.config.interactionWeight;
    
    return {
      recency,
      frequency,
      connectivity,
      emotional,
      interaction,
      selfAttention,
      finalScore: Math.min(1, finalScore + selfAttention * 0.1)
    };
  }
  
  /**
   * Calculate recency score with exponential decay
   */
  private calculateRecency(memory: MemoryEntity, currentTime: Date): number {
    const ageMs = currentTime.getTime() - memory.metadata.createdAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    
    // Exponential decay with 30-day half-life
    const halfLife = 30;
    return Math.exp(-ageDays / halfLife);
  }
  
  /**
   * Calculate frequency score based on access patterns
   */
  private calculateFrequency(memory: MemoryEntity): number {
    const accessCount = memory.metadata.accessCount;
    
    // Logarithmic scaling to prevent extreme values
    const normalizedCount = Math.log(accessCount + 1) / Math.log(100);
    return Math.min(1, normalizedCount);
  }
  
  /**
   * Calculate connectivity score based on associations
   */
  private calculateConnectivity(memory: MemoryEntity, associationCount?: number): number {
    if (associationCount === undefined) {
      // Fallback to entity and tag counts
      const connections = memory.metadata.entities.length + memory.metadata.tags.length;
      return Math.min(1, connections / 10);
    }
    
    // Logarithmic scaling
    const normalizedCount = Math.log(associationCount + 1) / Math.log(20);
    return Math.min(1, normalizedCount);
  }
  
  /**
   * Calculate emotional intensity score
   */
  private calculateEmotionalIntensity(memory: MemoryEntity): number {
    // Check if memory has emotional tags
    const emotionalTags = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'stress'];
    const hasEmotionalTags = memory.metadata.tags.some(tag =>
      emotionalTags.some(et => tag.toLowerCase().includes(et))
    );
    
    if (hasEmotionalTags) {
      return 0.8;
    }
    
    // Base emotional intensity on importance (proxy)
    return memory.metadata.importance * 0.5;
  }
  
  /**
   * Calculate user interaction score
   */
  private calculateInteraction(memory: MemoryEntity): number {
    const lastAccessedMs = memory.metadata.lastAccessedAt.getTime();
    const createdMs = memory.metadata.createdAt.getTime();
    const ageMs = Date.now() - createdMs;
    
    if (ageMs === 0) return 0;
    
    // Interaction rate: how recently was it accessed relative to its age
    const interactionRecency = (Date.now() - lastAccessedMs) / ageMs;
    return Math.max(0, 1 - interactionRecency);
  }
  
  /**
   * Calculate self-attention score
   * 
   * Measures how much this memory "attends" to other memories
   * based on similarity and relationships
   */
  private calculateSelfAttention(
    queryMemory: MemoryEntity,
    allMemories: MemoryEntity[]
  ): number {
    if (allMemories.length <= 1) return 0;
    
    let totalAttention = 0;
    let count = 0;
    
    for (const targetMemory of allMemories) {
      if (targetMemory.id === queryMemory.id) continue;
      
      // Calculate attention weight between query and target
      const attention = this.calculatePairwiseAttention(queryMemory, targetMemory);
      totalAttention += attention;
      count++;
    }
    
    return count > 0 ? totalAttention / count : 0;
  }
  
  /**
   * Calculate pairwise attention between two memories
   */
  private calculatePairwiseAttention(
    query: MemoryEntity,
    key: MemoryEntity
  ): number {
    let score = 0;
    
    // Entity overlap
    const entityOverlap = this.calculateOverlap(
      query.metadata.entities,
      key.metadata.entities
    );
    score += entityOverlap * 0.4;
    
    // Tag overlap
    const tagOverlap = this.calculateOverlap(
      query.metadata.tags,
      key.metadata.tags
    );
    score += tagOverlap * 0.3;
    
    // Type similarity
    if (query.type === key.type) {
      score += 0.2;
    }
    
    // Temporal proximity
    const timeDiff = Math.abs(
      query.metadata.createdAt.getTime() - key.metadata.createdAt.getTime()
    );
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    const temporalProximity = Math.exp(-daysDiff / 7); // 7-day window
    score += temporalProximity * 0.1;
    
    return score;
  }
  
  /**
   * Calculate overlap between two arrays
   */
  private calculateOverlap(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
  
  /**
   * Normalize attention weights to sum to 1
   */
  private normalizeWeights(): void {
    const sum = 
      this.config.recencyWeight +
      this.config.frequencyWeight +
      this.config.connectivityWeight +
      this.config.emotionalWeight +
      this.config.interactionWeight;
    
    if (sum > 0) {
      this.config.recencyWeight /= sum;
      this.config.frequencyWeight /= sum;
      this.config.connectivityWeight /= sum;
      this.config.emotionalWeight /= sum;
      this.config.interactionWeight /= sum;
    }
  }
  
  /**
   * Batch calculate attention scores for multiple memories
   */
  batchCalculateAttention(
    memories: MemoryEntity[],
    context?: {
      associationCounts?: Map<string, number>;
      currentTime?: Date;
    }
  ): Map<string, AttentionComponents> {
    const results = new Map<string, AttentionComponents>();
    
    for (const memory of memories) {
      const associationCount = context?.associationCounts?.get(memory.id);
      
      const components = this.calculateAttention(memory, {
        allMemories: memories,
        associationCount,
        currentTime: context?.currentTime
      });
      
      results.set(memory.id, components);
    }
    
    return results;
  }
  
  /**
   * Update memory importance based on attention score
   */
  applyAttentionToImportance(
    memory: MemoryEntity,
    attentionComponents: AttentionComponents,
    blendFactor: number = 0.3
  ): void {
    // Blend current importance with attention score
    const newImportance = 
      memory.metadata.importance * (1 - blendFactor) +
      attentionComponents.finalScore * blendFactor;
    
    memory.metadata.importance = Math.min(1, Math.max(0, newImportance));
  }
  
  /**
   * Get configuration
   */
  getConfig(): Required<AttentionConfig> {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AttentionConfig>): void {
    Object.assign(this.config, newConfig);
    this.normalizeWeights();
  }
}

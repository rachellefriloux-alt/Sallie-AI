/**
 * Association Engine
 * 
 * Automatically forms and maintains associations between memories
 * based on various similarity and co-occurrence patterns.
 */

import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { EmotionalMemory } from '../models/EmotionalMemory';
import { AssociationGraph, AssociationType, MemoryAssociation } from './AssociationGraph';

/**
 * Association formation configuration
 */
export interface AssociationConfig {
  /** Minimum similarity threshold for forming associations */
  minSimilarityThreshold?: number;
  
  /** Enable automatic association formation */
  autoFormAssociations?: boolean;
  
  /** Maximum associations per memory */
  maxAssociationsPerMemory?: number;
  
  /** Temporal window for proximity associations (milliseconds) */
  temporalProximityWindow?: number;
}

/**
 * Association Engine
 * 
 * Analyzes memories and automatically forms associations based on:
 * - Entity co-occurrence
 * - Topic similarity
 * - Temporal proximity
 * - Emotional similarity
 * - Explicit references
 */
export class AssociationEngine {
  private graph: AssociationGraph;
  private config: Required<AssociationConfig>;
  
  constructor(graph: AssociationGraph, config: AssociationConfig = {}) {
    this.graph = graph;
    this.config = {
      minSimilarityThreshold: config.minSimilarityThreshold ?? 0.3,
      autoFormAssociations: config.autoFormAssociations ?? true,
      maxAssociationsPerMemory: config.maxAssociationsPerMemory ?? 20,
      temporalProximityWindow: config.temporalProximityWindow ?? 3600000 // 1 hour
    };
  }
  
  /**
   * Form associations for a new memory
   */
  async formAssociations(
    newMemory: MemoryEntity,
    existingMemories: MemoryEntity[]
  ): Promise<number> {
    if (!this.config.autoFormAssociations) {
      return 0;
    }
    
    let formedCount = 0;
    
    for (const existing of existingMemories) {
      if (existing.id === newMemory.id) continue;
      
      // Check if already has too many associations
      const existingAssociations = this.graph.getAllAssociations(newMemory.id);
      if (existingAssociations.length >= this.config.maxAssociationsPerMemory) {
        break;
      }
      
      // Calculate different types of associations
      const associations = this.analyzeAssociations(newMemory, existing);
      
      // Form the strongest association
      if (associations.length > 0) {
        const strongest = associations.reduce((max, curr) =>
          curr.strength > max.strength ? curr : max
        );
        
        if (strongest.strength >= this.config.minSimilarityThreshold) {
          this.graph.addAssociation(strongest);
          formedCount++;
        }
      }
    }
    
    return formedCount;
  }
  
  /**
   * Analyze all possible associations between two memories
   */
  private analyzeAssociations(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): MemoryAssociation[] {
    const associations: MemoryAssociation[] = [];
    
    // Entity co-occurrence
    const entityStrength = this.calculateEntityCooccurrence(memory1, memory2);
    if (entityStrength > 0) {
      associations.push(this.createAssociation(
        memory1.id,
        memory2.id,
        AssociationType.ENTITY_COOCCURRENCE,
        entityStrength
      ));
    }
    
    // Topic similarity
    const topicStrength = this.calculateTopicSimilarity(memory1, memory2);
    if (topicStrength > 0) {
      associations.push(this.createAssociation(
        memory1.id,
        memory2.id,
        AssociationType.TOPIC_SIMILARITY,
        topicStrength
      ));
    }
    
    // Temporal proximity
    const temporalStrength = this.calculateTemporalProximity(memory1, memory2);
    if (temporalStrength > 0) {
      associations.push(this.createAssociation(
        memory1.id,
        memory2.id,
        AssociationType.TEMPORAL_PROXIMITY,
        temporalStrength
      ));
    }
    
    // Emotional similarity (if both are emotional memories)
    if (memory1.type === MemoryType.EMOTIONAL && memory2.type === MemoryType.EMOTIONAL) {
      const emotionalStrength = this.calculateEmotionalSimilarity(
        memory1 as EmotionalMemory,
        memory2 as EmotionalMemory
      );
      if (emotionalStrength > 0) {
        associations.push(this.createAssociation(
          memory1.id,
          memory2.id,
          AssociationType.EMOTIONAL_SIMILARITY,
          emotionalStrength
        ));
      }
    }
    
    // Explicit references (check if one memory references another)
    if (this.hasExplicitReference(memory1, memory2)) {
      associations.push(this.createAssociation(
        memory1.id,
        memory2.id,
        AssociationType.EXPLICIT_REFERENCE,
        1.0
      ));
    }
    
    return associations;
  }
  
  /**
   * Create an association object
   */
  private createAssociation(
    sourceId: string,
    targetId: string,
    type: AssociationType,
    strength: number
  ): MemoryAssociation {
    return {
      sourceId,
      targetId,
      type,
      strength,
      createdAt: new Date(),
      reinforcementCount: 0
    };
  }
  
  /**
   * Calculate entity co-occurrence strength
   */
  private calculateEntityCooccurrence(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    const entities1 = new Set(memory1.metadata.entities);
    const entities2 = new Set(memory2.metadata.entities);
    
    const intersection = new Set(
      [...entities1].filter(e => entities2.has(e))
    );
    
    if (intersection.size === 0) return 0;
    
    const union = new Set([...entities1, ...entities2]);
    return intersection.size / union.size;
  }
  
  /**
   * Calculate topic similarity strength
   */
  private calculateTopicSimilarity(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    const tags1 = new Set(memory1.metadata.tags);
    const tags2 = new Set(memory2.metadata.tags);
    
    const intersection = new Set(
      [...tags1].filter(t => tags2.has(t))
    );
    
    if (intersection.size === 0) return 0;
    
    const union = new Set([...tags1, ...tags2]);
    return intersection.size / union.size;
  }
  
  /**
   * Calculate temporal proximity strength
   */
  private calculateTemporalProximity(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): number {
    const time1 = memory1.metadata.createdAt.getTime();
    const time2 = memory2.metadata.createdAt.getTime();
    const timeDiff = Math.abs(time1 - time2);
    
    if (timeDiff > this.config.temporalProximityWindow) {
      return 0;
    }
    
    // Linear decay within the window
    return 1 - (timeDiff / this.config.temporalProximityWindow);
  }
  
  /**
   * Calculate emotional similarity strength
   */
  private calculateEmotionalSimilarity(
    memory1: EmotionalMemory,
    memory2: EmotionalMemory
  ): number {
    return memory1.calculateSimilarity(memory2);
  }
  
  /**
   * Check if memory1 explicitly references memory2
   */
  private hasExplicitReference(
    memory1: MemoryEntity,
    memory2: MemoryEntity
  ): boolean {
    // Check in episodic memories
    if (memory1.type === MemoryType.EPISODIC) {
      const episodic = memory1 as EpisodicMemory;
      if (episodic.content.relatedMemories?.includes(memory2.id)) {
        return true;
      }
    }
    
    // Check in emotional memories
    if (memory1.type === MemoryType.EMOTIONAL) {
      const emotional = memory1 as EmotionalMemory;
      if (emotional.content.episodicMemoryId === memory2.id) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Reinforce associations that are co-activated
   */
  async reinforceCoactivation(
    memoryIds: string[],
    reinforcementStrength: number = 0.1
  ): Promise<void> {
    // Reinforce associations between all pairs of co-activated memories
    for (let i = 0; i < memoryIds.length; i++) {
      for (let j = i + 1; j < memoryIds.length; j++) {
        const reinforced = this.graph.reinforceAssociation(
          memoryIds[i],
          memoryIds[j],
          reinforcementStrength
        );
        
        // If association doesn't exist, it might need to be formed
        if (!reinforced) {
          // This is a simplification - in a real system, you'd want to fetch
          // the actual memories and form the association
        }
      }
    }
  }
  
  /**
   * Spread activation from a source memory
   */
  spreadActivation(
    sourceId: string,
    maxHops: number = 2,
    decayFactor: number = 0.5
  ): Map<string, number> {
    const activation = new Map<string, number>();
    activation.set(sourceId, 1.0);
    
    let currentLevel = new Set([sourceId]);
    let currentActivation = 1.0;
    
    for (let hop = 0; hop < maxHops; hop++) {
      const nextLevel = new Set<string>();
      currentActivation *= decayFactor;
      
      for (const memoryId of currentLevel) {
        const associations = this.graph.getOutgoingAssociations(memoryId);
        
        for (const assoc of associations) {
          const spreadAmount = currentActivation * assoc.strength;
          const existing = activation.get(assoc.targetId) || 0;
          activation.set(assoc.targetId, Math.max(existing, spreadAmount));
          nextLevel.add(assoc.targetId);
        }
      }
      
      currentLevel = nextLevel;
    }
    
    return activation;
  }
  
  /**
   * Find strongly connected components
   */
  findClusters(minClusterSize: number = 3): string[][] {
    // Simplified clustering - groups memories with strong mutual connections
    const visited = new Set<string>();
    const clusters: string[][] = [];
    
    // Get all unique memory IDs from the graph stats
    const stats = this.graph.getStats();
    // Note: totalMemories is a number, we need to get actual memory IDs from the graph
    // This is a placeholder - in a real implementation, we'd expose a method to get all memory IDs
    const allMemoryIds = new Set<string>();
    
    // For now, return empty clusters as we don't have direct access to memory IDs
    // This would need to be enhanced based on actual graph implementation
    
    return clusters;
  }
  
  /**
   * Expand a cluster from a seed memory
   */
  private expandCluster(seedId: string, visited: Set<string>): string[] {
    const cluster: string[] = [];
    const queue = [seedId];
    
    while (queue.length > 0) {
      const memoryId = queue.shift()!;
      
      if (visited.has(memoryId)) continue;
      visited.add(memoryId);
      cluster.push(memoryId);
      
      // Add strongly connected neighbors
      const strongNeighbors = this.graph.getStronglyAssociated(memoryId, 0.7);
      queue.push(...strongNeighbors.filter(id => !visited.has(id)));
    }
    
    return cluster;
  }
}

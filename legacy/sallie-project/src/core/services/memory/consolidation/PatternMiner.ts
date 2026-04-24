/**
 * Pattern Miner
 * 
 * Advanced pattern detection and mining for recurring themes,
 * behavioral patterns, and temporal sequences in memories.
 */

import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { EmotionalMemory } from '../models/EmotionalMemory';

/**
 * Pattern types
 */
export enum PatternType {
  ENTITY_COOCCURRENCE = 'entity_cooccurrence',
  TOPIC_CLUSTER = 'topic_cluster',
  TEMPORAL_SEQUENCE = 'temporal_sequence',
  EMOTIONAL_CYCLE = 'emotional_cycle',
  BEHAVIORAL = 'behavioral',
  CONTEXTUAL = 'contextual'
}

/**
 * Detected pattern
 */
export interface DetectedPattern {
  /** Unique pattern ID */
  id: string;
  
  /** Pattern type */
  type: PatternType;
  
  /** Pattern description */
  description: string;
  
  /** Support (frequency of occurrence) */
  support: number;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Memory IDs that exhibit this pattern */
  memoryIds: string[];
  
  /** Pattern-specific data */
  data: Record<string, unknown>;
  
  /** When pattern was detected */
  detectedAt: Date;
}

/**
 * Pattern mining configuration
 */
export interface PatternMinerConfig {
  /** Minimum support threshold */
  minSupport?: number;
  
  /** Minimum confidence threshold */
  minConfidence?: number;
  
  /** Maximum pattern size */
  maxPatternSize?: number;
  
  /** Temporal window for sequence patterns (ms) */
  temporalWindow?: number;
}

/**
 * Pattern Miner
 * 
 * Discovers recurring patterns in memory data using various algorithms:
 * - Frequent itemset mining (Apriori-like)
 * - Sequence pattern mining
 * - Clustering-based pattern detection
 * - Temporal pattern analysis
 */
export class PatternMiner {
  private config: Required<PatternMinerConfig>;
  private patterns: Map<string, DetectedPattern> = new Map();
  
  constructor(config: PatternMinerConfig = {}) {
    this.config = {
      minSupport: config.minSupport ?? 3,
      minConfidence: config.minConfidence ?? 0.6,
      maxPatternSize: config.maxPatternSize ?? 5,
      temporalWindow: config.temporalWindow ?? 86400000 // 24 hours
    };
  }
  
  /**
   * Mine patterns from a set of memories
   */
  async minePatterns(memories: MemoryEntity[]): Promise<DetectedPattern[]> {
    const newPatterns: DetectedPattern[] = [];
    
    // Entity co-occurrence patterns
    const entityPatterns = this.mineEntityCooccurrence(memories);
    newPatterns.push(...entityPatterns);
    
    // Topic clustering patterns
    const topicPatterns = this.mineTopicClusters(memories);
    newPatterns.push(...topicPatterns);
    
    // Temporal sequence patterns
    const temporalPatterns = this.mineTemporalSequences(memories);
    newPatterns.push(...temporalPatterns);
    
    // Emotional cycle patterns
    const emotionalPatterns = this.mineEmotionalCycles(memories);
    newPatterns.push(...emotionalPatterns);
    
    // Behavioral patterns
    const behavioralPatterns = this.mineBehavioralPatterns(memories);
    newPatterns.push(...behavioralPatterns);
    
    // Store patterns
    newPatterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
    
    return newPatterns;
  }
  
  /**
   * Mine entity co-occurrence patterns
   */
  private mineEntityCooccurrence(memories: MemoryEntity[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const cooccurrences = new Map<string, Set<string>>();
    
    // Build co-occurrence matrix
    for (const memory of memories) {
      const entities = memory.metadata.entities;
      
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const pair = [entities[i], entities[j]].sort().join('|');
          
          if (!cooccurrences.has(pair)) {
            cooccurrences.set(pair, new Set());
          }
          cooccurrences.get(pair)!.add(memory.id);
        }
      }
    }
    
    // Extract frequent patterns
    for (const [pair, memoryIds] of cooccurrences.entries()) {
      if (memoryIds.size >= this.config.minSupport) {
        const [entity1, entity2] = pair.split('|');
        
        patterns.push({
          id: `entity_cooccur_${pair}`,
          type: PatternType.ENTITY_COOCCURRENCE,
          description: `${entity1} and ${entity2} frequently appear together`,
          support: memoryIds.size,
          confidence: memoryIds.size / memories.length,
          memoryIds: Array.from(memoryIds),
          data: { entity1, entity2 },
          detectedAt: new Date()
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Mine topic clustering patterns
   */
  private mineTopicClusters(memories: MemoryEntity[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const topicSets = new Map<string, Set<string>>();
    
    // Group memories by topic combinations
    for (const memory of memories) {
      if (memory.metadata.tags.length === 0) continue;
      
      const topicKey = memory.metadata.tags.sort().join('|');
      
      if (!topicSets.has(topicKey)) {
        topicSets.set(topicKey, new Set());
      }
      topicSets.get(topicKey)!.add(memory.id);
    }
    
    // Extract frequent topic clusters
    for (const [topicKey, memoryIds] of topicSets.entries()) {
      if (memoryIds.size >= this.config.minSupport) {
        const topics = topicKey.split('|');
        
        patterns.push({
          id: `topic_cluster_${topicKey}`,
          type: PatternType.TOPIC_CLUSTER,
          description: `Recurring topic cluster: ${topics.join(', ')}`,
          support: memoryIds.size,
          confidence: memoryIds.size / memories.length,
          memoryIds: Array.from(memoryIds),
          data: { topics },
          detectedAt: new Date()
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Mine temporal sequence patterns
   */
  private mineTemporalSequences(memories: MemoryEntity[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Sort memories by time
    const sortedMemories = memories
      .filter(m => m.type === MemoryType.EPISODIC)
      .sort((a, b) => a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime());
    
    // Find sequences of events
    const sequences = new Map<string, Array<{ memoryIds: string[], gap: number }>>();
    
    for (let i = 0; i < sortedMemories.length - 1; i++) {
      const current = sortedMemories[i] as EpisodicMemory;
      const next = sortedMemories[i + 1] as EpisodicMemory;
      
      const gap = next.metadata.createdAt.getTime() - current.metadata.createdAt.getTime();
      
      if (gap <= this.config.temporalWindow) {
        // Check for topic overlap
        const commonTopics = current.metadata.tags.filter(t =>
          next.metadata.tags.includes(t)
        );
        
        if (commonTopics.length > 0) {
          const seqKey = commonTopics.sort().join('|');
          
          if (!sequences.has(seqKey)) {
            sequences.set(seqKey, []);
          }
          sequences.get(seqKey)!.push({
            memoryIds: [current.id, next.id],
            gap
          });
        }
      }
    }
    
    // Extract frequent sequences
    for (const [seqKey, occurrences] of sequences.entries()) {
      if (occurrences.length >= this.config.minSupport) {
        const topics = seqKey.split('|');
        const avgGap = occurrences.reduce((sum, o) => sum + o.gap, 0) / occurrences.length;
        
        patterns.push({
          id: `temporal_seq_${seqKey}`,
          type: PatternType.TEMPORAL_SEQUENCE,
          description: `Recurring sequence with topics: ${topics.join(', ')}`,
          support: occurrences.length,
          confidence: occurrences.length / sortedMemories.length,
          memoryIds: occurrences.flatMap(o => o.memoryIds),
          data: { topics, averageGap: avgGap },
          detectedAt: new Date()
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Mine emotional cycle patterns
   */
  private mineEmotionalCycles(memories: MemoryEntity[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    const emotionalMemories = memories
      .filter(m => m.type === MemoryType.EMOTIONAL)
      .sort((a, b) => a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime()) as EmotionalMemory[];
    
    if (emotionalMemories.length < this.config.minSupport) {
      return patterns;
    }
    
    // Detect emotional transitions
    const transitions = new Map<string, number>();
    
    for (let i = 0; i < emotionalMemories.length - 1; i++) {
      const current = emotionalMemories[i];
      const next = emotionalMemories[i + 1];
      
      const transition = `${current.content.emotionalState.primaryEmotion}->${next.content.emotionalState.primaryEmotion}`;
      transitions.set(transition, (transitions.get(transition) || 0) + 1);
    }
    
    // Extract frequent transitions
    for (const [transition, count] of transitions.entries()) {
      if (count >= this.config.minSupport) {
        const [from, to] = transition.split('->');
        
        patterns.push({
          id: `emotional_cycle_${transition}`,
          type: PatternType.EMOTIONAL_CYCLE,
          description: `Emotional transition: ${from} → ${to}`,
          support: count,
          confidence: count / emotionalMemories.length,
          memoryIds: emotionalMemories.map(m => m.id),
          data: { fromEmotion: from, toEmotion: to },
          detectedAt: new Date()
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Mine behavioral patterns
   */
  private mineBehavioralPatterns(memories: MemoryEntity[]): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Time-of-day patterns
    const timeOfDayActivity = new Map<number, Set<string>>();
    
    for (const memory of memories) {
      const hour = memory.metadata.createdAt.getHours();
      
      if (!timeOfDayActivity.has(hour)) {
        timeOfDayActivity.set(hour, new Set());
      }
      timeOfDayActivity.get(hour)!.add(memory.id);
    }
    
    // Find peak activity hours
    const sortedHours = Array.from(timeOfDayActivity.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 3);
    
    for (const [hour, memoryIds] of sortedHours) {
      if (memoryIds.size >= this.config.minSupport) {
        patterns.push({
          id: `behavioral_time_${hour}`,
          type: PatternType.BEHAVIORAL,
          description: `High activity at ${hour}:00`,
          support: memoryIds.size,
          confidence: memoryIds.size / memories.length,
          memoryIds: Array.from(memoryIds),
          data: { hour, timeOfDay: this.getTimeOfDay(hour) },
          detectedAt: new Date()
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Get time of day label
   */
  private getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
  
  /**
   * Get all detected patterns
   */
  getPatterns(type?: PatternType): DetectedPattern[] {
    const allPatterns = Array.from(this.patterns.values());
    
    if (type) {
      return allPatterns.filter(p => p.type === type);
    }
    
    return allPatterns;
  }
  
  /**
   * Get pattern by ID
   */
  getPattern(id: string): DetectedPattern | undefined {
    return this.patterns.get(id);
  }
  
  /**
   * Clear all patterns
   */
  clearPatterns(): void {
    this.patterns.clear();
  }
  
  /**
   * Get pattern statistics
   */
  getStats(): {
    totalPatterns: number;
    byType: Record<PatternType, number>;
    averageSupport: number;
    averageConfidence: number;
  } {
    const allPatterns = Array.from(this.patterns.values());
    
    const byType: Record<PatternType, number> = {
      [PatternType.ENTITY_COOCCURRENCE]: 0,
      [PatternType.TOPIC_CLUSTER]: 0,
      [PatternType.TEMPORAL_SEQUENCE]: 0,
      [PatternType.EMOTIONAL_CYCLE]: 0,
      [PatternType.BEHAVIORAL]: 0,
      [PatternType.CONTEXTUAL]: 0
    };
    
    let totalSupport = 0;
    let totalConfidence = 0;
    
    allPatterns.forEach(pattern => {
      byType[pattern.type]++;
      totalSupport += pattern.support;
      totalConfidence += pattern.confidence;
    });
    
    return {
      totalPatterns: allPatterns.length,
      byType,
      averageSupport: allPatterns.length > 0 ? totalSupport / allPatterns.length : 0,
      averageConfidence: allPatterns.length > 0 ? totalConfidence / allPatterns.length : 0
    };
  }
}

/**
 * Short-Term Memory Buffer
 * 
 * Temporary storage for recent memories before consolidation into long-term memory.
 * Manages the working memory with limited capacity.
 */

import { MemoryEntity } from '../models/MemoryEntity';

/**
 * Configuration for short-term buffer
 */
export interface ShortTermBufferConfig {
  /** Maximum capacity of short-term buffer */
  maxCapacity?: number;
  
  /** Time window for short-term storage (milliseconds) */
  timeWindow?: number;
  
  /** Importance threshold for auto-consolidation */
  autoConsolidationThreshold?: number;
}

/**
 * Short-Term Memory Buffer
 * 
 * Maintains a limited-capacity buffer of recent memories.
 * Implements decay and capacity management.
 */
export class ShortTermBuffer {
  private buffer: Map<string, MemoryEntity> = new Map();
  private config: Required<ShortTermBufferConfig>;
  private insertionOrder: string[] = [];
  
  constructor(config: ShortTermBufferConfig = {}) {
    this.config = {
      maxCapacity: config.maxCapacity ?? 50,
      timeWindow: config.timeWindow ?? 3600000, // 1 hour
      autoConsolidationThreshold: config.autoConsolidationThreshold ?? 0.8
    };
  }
  
  /**
   * Add a memory to short-term buffer
   */
  add(memory: MemoryEntity): void {
    // Remove if already exists
    if (this.buffer.has(memory.id)) {
      this.remove(memory.id);
    }
    
    // Check capacity and evict if necessary
    if (this.buffer.size >= this.config.maxCapacity) {
      this.evictLeastImportant();
    }
    
    // Add to buffer
    this.buffer.set(memory.id, memory);
    this.insertionOrder.push(memory.id);
  }
  
  /**
   * Get a memory from buffer
   */
  get(id: string): MemoryEntity | undefined {
    return this.buffer.get(id);
  }
  
  /**
   * Remove a memory from buffer
   */
  remove(id: string): void {
    this.buffer.delete(id);
    const index = this.insertionOrder.indexOf(id);
    if (index > -1) {
      this.insertionOrder.splice(index, 1);
    }
  }
  
  /**
   * Get all memories in buffer
   */
  getAll(): MemoryEntity[] {
    return Array.from(this.buffer.values());
  }
  
  /**
   * Get memories ready for consolidation
   */
  getReadyForConsolidation(): MemoryEntity[] {
    const now = Date.now();
    const ready: MemoryEntity[] = [];
    
    for (const memory of this.buffer.values()) {
      // Check if memory has been in buffer long enough
      const age = now - memory.metadata.createdAt.getTime();
      const isOldEnough = age >= this.config.timeWindow;
      
      // Check if memory is important enough for auto-consolidation
      const isImportant = memory.metadata.importance >= 
                          this.config.autoConsolidationThreshold;
      
      if (isOldEnough || isImportant) {
        ready.push(memory);
      }
    }
    
    return ready;
  }
  
  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer.clear();
    this.insertionOrder = [];
  }
  
  /**
   * Get buffer size
   */
  size(): number {
    return this.buffer.size;
  }
  
  /**
   * Check if buffer is full
   */
  isFull(): boolean {
    return this.buffer.size >= this.config.maxCapacity;
  }
  
  /**
   * Evict least important memory to make space
   */
  private evictLeastImportant(): void {
    if (this.buffer.size === 0) return;
    
    let leastImportant: MemoryEntity | null = null;
    let minScore = Infinity;
    
    for (const memory of this.buffer.values()) {
      const score = this.calculateRetentionScore(memory);
      if (score < minScore) {
        minScore = score;
        leastImportant = memory;
      }
    }
    
    if (leastImportant) {
      this.remove(leastImportant.id);
    }
  }
  
  /**
   * Calculate retention score for a memory
   * Higher score means more likely to be kept
   */
  private calculateRetentionScore(memory: MemoryEntity): number {
    let score = 0;
    
    // Importance (weight: 0.5)
    score += memory.getEffectiveImportance() * 0.5;
    
    // Recency (weight: 0.3)
    const age = Date.now() - memory.metadata.createdAt.getTime();
    const recencyScore = Math.exp(-age / this.config.timeWindow);
    score += recencyScore * 0.3;
    
    // Access frequency (weight: 0.2)
    const accessScore = Math.min(1, memory.metadata.accessCount / 10);
    score += accessScore * 0.2;
    
    return score;
  }
  
  /**
   * Apply decay to all memories in buffer
   */
  applyDecay(decayRate: number = 0.01): void {
    for (const memory of this.buffer.values()) {
      memory.applyDecay(decayRate);
    }
  }
  
  /**
   * Get statistics about the buffer
   */
  getStats(): {
    size: number;
    capacity: number;
    utilizationRate: number;
    averageImportance: number;
    oldestMemoryAge: number;
  } {
    const memories = Array.from(this.buffer.values());
    const now = Date.now();
    
    let totalImportance = 0;
    let oldestAge = 0;
    
    for (const memory of memories) {
      totalImportance += memory.getEffectiveImportance();
      const age = now - memory.metadata.createdAt.getTime();
      oldestAge = Math.max(oldestAge, age);
    }
    
    return {
      size: this.buffer.size,
      capacity: this.config.maxCapacity,
      utilizationRate: this.buffer.size / this.config.maxCapacity,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      oldestMemoryAge: oldestAge
    };
  }
}

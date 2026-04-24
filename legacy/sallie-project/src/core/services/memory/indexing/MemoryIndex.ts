/**
 * Memory Index
 * 
 * Base interface and implementation for memory indexing.
 * Provides fast lookup capabilities for memories.
 */

import { MemoryEntity } from '../models/MemoryEntity';

/**
 * Index entry
 */
export interface IndexEntry<T = string> {
  /** Index key */
  key: T;
  
  /** Memory IDs associated with this key */
  memoryIds: Set<string>;
}

/**
 * Base Memory Index
 * 
 * Abstract base class for different types of indexes.
 */
export abstract class MemoryIndex<TKey = string> {
  protected index: Map<TKey, Set<string>> = new Map();
  
  /**
   * Add a memory to the index
   */
  abstract add(memory: MemoryEntity): void;
  
  /**
   * Remove a memory from the index
   */
  abstract remove(memoryId: string): void;
  
  /**
   * Query the index
   */
  abstract query(key: TKey): string[];
  
  /**
   * Clear the index
   */
  clear(): void {
    this.index.clear();
  }
  
  /**
   * Get index size
   */
  size(): number {
    return this.index.size;
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    uniqueKeys: number;
    totalEntries: number;
    averageEntriesPerKey: number;
  } {
    let totalEntries = 0;
    
    for (const memoryIds of this.index.values()) {
      totalEntries += memoryIds.size;
    }
    
    return {
      uniqueKeys: this.index.size,
      totalEntries,
      averageEntriesPerKey: this.index.size > 0 ? totalEntries / this.index.size : 0
    };
  }
  
  /**
   * Helper to add memory ID to index key
   */
  protected addToIndex(key: TKey, memoryId: string): void {
    if (!this.index.has(key)) {
      this.index.set(key, new Set());
    }
    this.index.get(key)!.add(memoryId);
  }
  
  /**
   * Helper to remove memory ID from index key
   */
  protected removeFromIndex(key: TKey, memoryId: string): void {
    const memoryIds = this.index.get(key);
    if (memoryIds) {
      memoryIds.delete(memoryId);
      if (memoryIds.size === 0) {
        this.index.delete(key);
      }
    }
  }
}

/**
 * Entity Index
 * 
 * Index memories by entity references for fast entity-based lookup.
 */
export class EntityIndex extends MemoryIndex<string> {
  private memoryToEntities: Map<string, string[]> = new Map();
  
  add(memory: MemoryEntity): void {
    const entities = memory.metadata.entities;
    this.memoryToEntities.set(memory.id, entities);
    
    for (const entity of entities) {
      this.addToIndex(entity, memory.id);
    }
  }
  
  remove(memoryId: string): void {
    const entities = this.memoryToEntities.get(memoryId);
    if (entities) {
      for (const entity of entities) {
        this.removeFromIndex(entity, memoryId);
      }
      this.memoryToEntities.delete(memoryId);
    }
  }
  
  query(entity: string): string[] {
    return Array.from(this.index.get(entity) || []);
  }
  
  /**
   * Query by multiple entities (AND operation)
   */
  queryMultiple(entities: string[]): string[] {
    if (entities.length === 0) return [];
    
    const sets = entities.map(e => this.index.get(e) || new Set<string>());
    
    // Find intersection
    const result = new Set(sets[0]);
    for (let i = 1; i < sets.length; i++) {
      for (const id of result) {
        if (!sets[i].has(id)) {
          result.delete(id);
        }
      }
    }
    
    return Array.from(result);
  }
}

/**
 * Tag Index
 * 
 * Index memories by tags for fast topic-based lookup.
 */
export class TagIndex extends MemoryIndex<string> {
  private memoryToTags: Map<string, string[]> = new Map();
  
  add(memory: MemoryEntity): void {
    const tags = memory.metadata.tags;
    this.memoryToTags.set(memory.id, tags);
    
    for (const tag of tags) {
      this.addToIndex(tag.toLowerCase(), memory.id);
    }
  }
  
  remove(memoryId: string): void {
    const tags = this.memoryToTags.get(memoryId);
    if (tags) {
      for (const tag of tags) {
        this.removeFromIndex(tag.toLowerCase(), memoryId);
      }
      this.memoryToTags.delete(memoryId);
    }
  }
  
  query(tag: string): string[] {
    return Array.from(this.index.get(tag.toLowerCase()) || []);
  }
  
  /**
   * Query by multiple tags (OR operation)
   */
  queryMultiple(tags: string[]): string[] {
    const result = new Set<string>();
    
    for (const tag of tags) {
      const memoryIds = this.index.get(tag.toLowerCase());
      if (memoryIds) {
        memoryIds.forEach(id => result.add(id));
      }
    }
    
    return Array.from(result);
  }
}

/**
 * Type Index
 * 
 * Index memories by type for fast type-based filtering.
 */
export class TypeIndex extends MemoryIndex<string> {
  add(memory: MemoryEntity): void {
    this.addToIndex(memory.type, memory.id);
  }
  
  remove(memoryId: string): void {
    // Need to check all types
    for (const [type, memoryIds] of this.index.entries()) {
      if (memoryIds.has(memoryId)) {
        this.removeFromIndex(type, memoryId);
        break;
      }
    }
  }
  
  query(type: string): string[] {
    return Array.from(this.index.get(type) || []);
  }
}

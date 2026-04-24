/**
 * Local Storage Adapter
 * 
 * In-memory storage implementation with optional persistence to local storage.
 * Suitable for development and client-side applications.
 */

import {
  IMemoryStore,
  QueryOptions,
  StorageStats,
  MemoryStoreError
} from './MemoryStore';
import { MemoryEntity, MemoryType } from '../models/MemoryEntity';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { SemanticMemory } from '../models/SemanticMemory';
import { ProceduralMemory } from '../models/ProceduralMemory';
import { EmotionalMemory } from '../models/EmotionalMemory';

/**
 * Configuration for local storage adapter
 */
export interface LocalStorageConfig {
  /** Enable persistence to localStorage/AsyncStorage */
  enablePersistence?: boolean;
  
  /** Storage key prefix */
  storagePrefix?: string;
  
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
}

/**
 * Local Storage Adapter
 * 
 * Provides in-memory storage with optional persistence.
 * Thread-safe operations through async/await.
 */
export class LocalStorageAdapter implements IMemoryStore {
  private memories: Map<string, MemoryEntity> = new Map();
  private config: Required<LocalStorageConfig>;
  private autoSaveTimer?: ReturnType<typeof setInterval>;
  private isDirty: boolean = false;
  
  constructor(config: LocalStorageConfig = {}) {
    this.config = {
      enablePersistence: config.enablePersistence ?? false,
      storagePrefix: config.storagePrefix ?? 'sallie_memory_',
      autoSaveInterval: config.autoSaveInterval ?? 30000 // 30 seconds
    };
    
    if (this.config.enablePersistence) {
      this.initializePersistence();
    }
  }
  
  /**
   * Initialize persistence layer
   */
  private async initializePersistence(): Promise<void> {
    try {
      await this.loadFromPersistence();
      
      // Setup auto-save
      if (this.config.autoSaveInterval > 0) {
        this.autoSaveTimer = setInterval(() => {
          if (this.isDirty) {
            this.saveToPersistence().catch(err =>
              console.error('Auto-save failed:', err)
            );
          }
        }, this.config.autoSaveInterval);
      }
    } catch (error) {
      console.error('Failed to initialize persistence:', error);
    }
  }
  
  /**
   * Load memories from persistent storage
   */
  private async loadFromPersistence(): Promise<void> {
    // This is a placeholder - in a real implementation, you'd use
    // AsyncStorage for React Native or localStorage for web
    // For now, we'll just keep it in memory
  }
  
  /**
   * Save memories to persistent storage
   */
  private async saveToPersistence(): Promise<void> {
    this.isDirty = false;
    // Placeholder for actual persistence logic
  }
  
  /**
   * Deserialize a memory from JSON
   */
  private deserializeMemory(data: any): MemoryEntity {
    // Convert date strings back to Date objects
    if (data.metadata) {
      if (data.metadata.createdAt) {
        data.metadata.createdAt = new Date(data.metadata.createdAt);
      }
      if (data.metadata.lastAccessedAt) {
        data.metadata.lastAccessedAt = new Date(data.metadata.lastAccessedAt);
      }
      if (data.metadata.lastModifiedAt) {
        data.metadata.lastModifiedAt = new Date(data.metadata.lastModifiedAt);
      }
    }
    
    if (data.version && data.version.timestamp) {
      data.version.timestamp = new Date(data.version.timestamp);
    }
    
    // Convert type-specific dates
    if (data.type === MemoryType.EPISODIC && data.content.temporal) {
      if (data.content.temporal.startTime) {
        data.content.temporal.startTime = new Date(data.content.temporal.startTime);
      }
      if (data.content.temporal.endTime) {
        data.content.temporal.endTime = new Date(data.content.temporal.endTime);
      }
    }
    
    switch (data.type) {
      case MemoryType.EPISODIC:
        return Object.assign(
          new EpisodicMemory(data.id, data.content, data.privacy, data.metadata),
          data
        );
      case MemoryType.SEMANTIC:
        return Object.assign(
          new SemanticMemory(data.id, data.content, data.privacy, data.metadata),
          data
        );
      case MemoryType.PROCEDURAL:
        return Object.assign(
          new ProceduralMemory(data.id, data.content, data.privacy, data.metadata),
          data
        );
      case MemoryType.EMOTIONAL:
        return Object.assign(
          new EmotionalMemory(data.id, data.content, data.privacy, data.metadata),
          data
        );
      default:
        throw new MemoryStoreError(
          `Unknown memory type: ${data.type}`,
          'deserialize'
        );
    }
  }
  
  /**
   * Store a memory
   */
  async store(memory: MemoryEntity): Promise<void> {
    try {
      if (!memory.validate()) {
        throw new MemoryStoreError(
          `Invalid memory: ${memory.id}`,
          'store'
        );
      }
      
      this.memories.set(memory.id, memory);
      this.isDirty = true;
    } catch (error) {
      throw new MemoryStoreError(
        `Failed to store memory: ${memory.id}`,
        'store',
        error as Error
      );
    }
  }
  
  /**
   * Retrieve a memory by ID
   */
  async retrieve(id: string): Promise<MemoryEntity | undefined> {
    const memory = this.memories.get(id);
    if (memory) {
      memory.recordAccess();
      this.isDirty = true;
    }
    return memory;
  }
  
  /**
   * Update an existing memory
   */
  async update(memory: MemoryEntity): Promise<void> {
    if (!this.memories.has(memory.id)) {
      throw new MemoryStoreError(
        `Memory not found: ${memory.id}`,
        'update'
      );
    }
    
    if (!memory.validate()) {
      throw new MemoryStoreError(
        `Invalid memory: ${memory.id}`,
        'update'
      );
    }
    
    this.memories.set(memory.id, memory);
    this.isDirty = true;
  }
  
  /**
   * Delete a memory
   */
  async delete(id: string): Promise<void> {
    this.memories.delete(id);
    this.isDirty = true;
  }
  
  /**
   * Query memories based on criteria
   */
  async query(options: QueryOptions): Promise<MemoryEntity[]> {
    let results = Array.from(this.memories.values());
    
    // Apply filters
    if (options.type) {
      results = results.filter(m => m.type === options.type);
    }
    
    if (options.tags && options.tags.length > 0) {
      results = results.filter(m =>
        options.tags!.some(tag => m.metadata.tags.includes(tag))
      );
    }
    
    if (options.entities && options.entities.length > 0) {
      results = results.filter(m =>
        options.entities!.some(entity => m.metadata.entities.includes(entity))
      );
    }
    
    if (options.dateRange) {
      const { start, end } = options.dateRange;
      results = results.filter(m =>
        m.metadata.createdAt >= start && m.metadata.createdAt <= end
      );
    }
    
    if (options.minImportance !== undefined) {
      results = results.filter(m =>
        m.getEffectiveImportance() >= options.minImportance!
      );
    }
    
    if (options.minConfidence !== undefined) {
      results = results.filter(m =>
        m.metadata.confidence >= options.minConfidence!
      );
    }
    
    if (options.consolidatedOnly) {
      results = results.filter(m => m.isConsolidated);
    }
    
    // Sort results
    if (options.sortBy) {
      const direction = options.sortDirection === 'asc' ? 1 : -1;
      results.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        
        switch (options.sortBy) {
          case 'createdAt':
            aVal = a.metadata.createdAt.getTime();
            bVal = b.metadata.createdAt.getTime();
            break;
          case 'lastAccessedAt':
            aVal = a.metadata.lastAccessedAt.getTime();
            bVal = b.metadata.lastAccessedAt.getTime();
            break;
          case 'importance':
            aVal = a.getEffectiveImportance();
            bVal = b.getEffectiveImportance();
            break;
          case 'confidence':
            aVal = a.metadata.confidence;
            bVal = b.metadata.confidence;
            break;
          default:
            return 0;
        }
        
        return (aVal - bVal) * direction;
      });
    }
    
    // Apply pagination
    if (options.offset) {
      results = results.slice(options.offset);
    }
    
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }
  
  /**
   * Get all memories
   */
  async getAll(): Promise<MemoryEntity[]> {
    return Array.from(this.memories.values());
  }
  
  /**
   * Count memories matching criteria
   */
  async count(options?: QueryOptions): Promise<number> {
    if (!options) {
      return this.memories.size;
    }
    
    const results = await this.query(options);
    return results.length;
  }
  
  /**
   * Check if a memory exists
   */
  async exists(id: string): Promise<boolean> {
    return this.memories.has(id);
  }
  
  /**
   * Bulk store operation
   */
  async bulkStore(memories: MemoryEntity[]): Promise<void> {
    for (const memory of memories) {
      await this.store(memory);
    }
  }
  
  /**
   * Bulk delete operation
   */
  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.memories.delete(id);
    }
    this.isDirty = true;
  }
  
  /**
   * Clear all memories
   */
  async clear(): Promise<void> {
    this.memories.clear();
    this.isDirty = true;
  }
  
  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    const memories = Array.from(this.memories.values());
    const byType: Record<MemoryType, number> = {
      [MemoryType.EPISODIC]: 0,
      [MemoryType.SEMANTIC]: 0,
      [MemoryType.PROCEDURAL]: 0,
      [MemoryType.EMOTIONAL]: 0
    };
    
    let totalImportance = 0;
    let consolidatedCount = 0;
    
    memories.forEach(m => {
      byType[m.type]++;
      totalImportance += m.getEffectiveImportance();
      if (m.isConsolidated) consolidatedCount++;
    });
    
    return {
      totalMemories: memories.length,
      byType,
      storageSize: JSON.stringify(Array.from(this.memories.values())).length,
      consolidatedCount,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0
    };
  }
  
  /**
   * Export memories to JSON
   */
  async export(options?: QueryOptions): Promise<string> {
    const memories = options 
      ? await this.query(options)
      : Array.from(this.memories.values());
    
    return JSON.stringify(memories.map(m => m.toJSON()), null, 2);
  }
  
  /**
   * Import memories from JSON
   */
  async import(jsonData: string): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      const memories = Array.isArray(data) ? data : [data];
      
      let imported = 0;
      for (const memData of memories) {
        try {
          const memory = this.deserializeMemory(memData);
          await this.store(memory);
          imported++;
        } catch (error) {
          console.error(`Failed to import memory ${memData.id}:`, error);
        }
      }
      
      return imported;
    } catch (error) {
      throw new MemoryStoreError(
        'Failed to import memories',
        'import',
        error as Error
      );
    }
  }
  
  /**
   * Optimize storage
   */
  async optimize(): Promise<void> {
    // Remove memories with very low decay factors
    const toDelete: string[] = [];
    
    for (const [id, memory] of this.memories.entries()) {
      if (memory.decayFactor < 0.01 && !memory.isConsolidated) {
        toDelete.push(id);
      }
    }
    
    await this.bulkDelete(toDelete);
    
    // Force persistence save
    if (this.config.enablePersistence) {
      await this.saveToPersistence();
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }
}

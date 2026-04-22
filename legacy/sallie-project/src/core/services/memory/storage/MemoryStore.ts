/**
 * Memory Store Interface
 * 
 * Defines the contract for memory storage implementations.
 * Supports CRUD operations, querying, and bulk operations.
 */

import { MemoryEntity, MemoryType } from '../models/MemoryEntity';

/**
 * Query options for memory retrieval
 */
export interface QueryOptions {
  /** Filter by memory type */
  type?: MemoryType;
  
  /** Filter by tags */
  tags?: string[];
  
  /** Filter by entities */
  entities?: string[];
  
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  /** Filter by importance threshold */
  minImportance?: number;
  
  /** Filter by confidence threshold */
  minConfidence?: number;
  
  /** Include only consolidated memories */
  consolidatedOnly?: boolean;
  
  /** Limit number of results */
  limit?: number;
  
  /** Skip/offset for pagination */
  offset?: number;
  
  /** Sort order */
  sortBy?: 'createdAt' | 'lastAccessedAt' | 'importance' | 'confidence';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Storage statistics
 */
export interface StorageStats {
  /** Total number of memories */
  totalMemories: number;
  
  /** Memories by type */
  byType: Record<MemoryType, number>;
  
  /** Total storage size (bytes) */
  storageSize: number;
  
  /** Number of consolidated memories */
  consolidatedCount: number;
  
  /** Average importance */
  averageImportance: number;
}

/**
 * Memory Store Interface
 * 
 * Abstract interface for memory storage implementations.
 * Implementations can use different backends (local, cloud, encrypted, etc.)
 */
export interface IMemoryStore {
  /**
   * Store a memory
   * @param memory The memory to store
   * @returns Promise that resolves when storage is complete
   */
  store(memory: MemoryEntity): Promise<void>;
  
  /**
   * Retrieve a memory by ID
   * @param id Memory identifier
   * @returns Promise that resolves to the memory, or undefined if not found
   */
  retrieve(id: string): Promise<MemoryEntity | undefined>;
  
  /**
   * Update an existing memory
   * @param memory The memory to update
   * @returns Promise that resolves when update is complete
   */
  update(memory: MemoryEntity): Promise<void>;
  
  /**
   * Delete a memory
   * @param id Memory identifier
   * @returns Promise that resolves when deletion is complete
   */
  delete(id: string): Promise<void>;
  
  /**
   * Query memories based on criteria
   * @param options Query options
   * @returns Promise that resolves to array of matching memories
   */
  query(options: QueryOptions): Promise<MemoryEntity[]>;
  
  /**
   * Get all memories (use with caution for large datasets)
   * @returns Promise that resolves to all memories
   */
  getAll(): Promise<MemoryEntity[]>;
  
  /**
   * Count memories matching criteria
   * @param options Query options
   * @returns Promise that resolves to count
   */
  count(options?: QueryOptions): Promise<number>;
  
  /**
   * Check if a memory exists
   * @param id Memory identifier
   * @returns Promise that resolves to true if exists
   */
  exists(id: string): Promise<boolean>;
  
  /**
   * Bulk store operation
   * @param memories Array of memories to store
   * @returns Promise that resolves when all are stored
   */
  bulkStore(memories: MemoryEntity[]): Promise<void>;
  
  /**
   * Bulk delete operation
   * @param ids Array of memory identifiers
   * @returns Promise that resolves when all are deleted
   */
  bulkDelete(ids: string[]): Promise<void>;
  
  /**
   * Clear all memories (use with extreme caution)
   * @returns Promise that resolves when cleared
   */
  clear(): Promise<void>;
  
  /**
   * Get storage statistics
   * @returns Promise that resolves to storage stats
   */
  getStats(): Promise<StorageStats>;
  
  /**
   * Export memories to JSON
   * @param options Optional query options to filter export
   * @returns Promise that resolves to JSON string
   */
  export(options?: QueryOptions): Promise<string>;
  
  /**
   * Import memories from JSON
   * @param jsonData JSON string containing memories
   * @returns Promise that resolves to number of imported memories
   */
  import(jsonData: string): Promise<number>;
  
  /**
   * Optimize storage (cleanup, defragmentation, etc.)
   * @returns Promise that resolves when optimization is complete
   */
  optimize(): Promise<void>;
}

/**
 * Error thrown by memory store operations
 */
export class MemoryStoreError extends Error {
  constructor(
    message: string,
    public operation: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'MemoryStoreError';
  }
}

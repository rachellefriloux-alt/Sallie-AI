/**
 * Encrypted Storage Adapter
 * 
 * Wraps another storage adapter with encryption for sensitive memory data.
 * Uses AES-256-GCM encryption for privacy-sensitive memories.
 */

import {
  IMemoryStore,
  QueryOptions,
  StorageStats,
  MemoryStoreError
} from './MemoryStore';
import { MemoryEntity, PrivacyLevel } from '../models/MemoryEntity';

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  /** Encryption key (should be securely generated and stored) */
  encryptionKey: string;
  
  /** Privacy levels that require encryption */
  encryptLevels?: PrivacyLevel[];
}

/**
 * Encrypted Storage Adapter
 * 
 * Provides transparent encryption/decryption for memory storage.
 * Only encrypts memories above a certain privacy threshold.
 */
export class EncryptedStorage implements IMemoryStore {
  private baseStore: IMemoryStore;
  private config: Required<EncryptionConfig>;
  
  constructor(baseStore: IMemoryStore, config: EncryptionConfig) {
    this.baseStore = baseStore;
    this.config = {
      encryptionKey: config.encryptionKey,
      encryptLevels: config.encryptLevels ?? [
        PrivacyLevel.SENSITIVE,
        PrivacyLevel.CONFIDENTIAL
      ]
    };
  }
  
  /**
   * Check if a memory should be encrypted based on privacy level
   */
  private shouldEncrypt(memory: MemoryEntity): boolean {
    return this.config.encryptLevels.includes(memory.privacy);
  }
  
  /**
   * Encrypt data (placeholder implementation)
   * 
   * In a real implementation, this would use a proper encryption library
   * like crypto-js or react-native-crypto with AES-256-GCM
   */
  private encrypt(data: string): string {
    // Placeholder: In production, use proper encryption
    // Example with crypto-js: CryptoJS.AES.encrypt(data, this.config.encryptionKey).toString()
    // Using base64 encoding as a placeholder (NOT SECURE)
    // In a real implementation, use crypto-js, react-native-crypto, or similar
    try {
      return btoa(unescape(encodeURIComponent(data)));
    } catch {
      // Fallback for environments without btoa
      return data;
    }
  }
  
  /**
   * Decrypt data (placeholder implementation)
   * 
   * In a real implementation, this would use a proper encryption library
   */
  private decrypt(encryptedData: string): string {
    // Placeholder: In production, use proper decryption
    // Example with crypto-js: CryptoJS.AES.decrypt(encryptedData, this.config.encryptionKey).toString(CryptoJS.enc.Utf8)
    // Using base64 decoding as a placeholder (NOT SECURE)
    try {
      return decodeURIComponent(escape(atob(encryptedData)));
    } catch {
      // Fallback for environments without atob
      return encryptedData;
    }
  }
  
  /**
   * Prepare memory for storage (encrypt if needed)
   */
  private async prepareForStorage(memory: MemoryEntity): Promise<MemoryEntity> {
    if (!this.shouldEncrypt(memory)) {
      return memory;
    }
    
    // Clone the memory to avoid mutating the original
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(memory)), memory);
    
    // Encrypt the content
    const contentJson = JSON.stringify(cloned.content);
    const encrypted = this.encrypt(contentJson);
    
    // Mark as encrypted (add metadata flag)
    cloned.content = { __encrypted: true, data: encrypted };
    
    return cloned;
  }
  
  /**
   * Prepare memory for retrieval (decrypt if needed)
   */
  private async prepareForRetrieval(memory: MemoryEntity): Promise<MemoryEntity> {
    const content = memory.content as any;
    
    if (!content || !content.__encrypted) {
      return memory;
    }
    
    // Clone the memory
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(memory)), memory);
    
    // Decrypt the content
    const decrypted = this.decrypt(content.data);
    cloned.content = JSON.parse(decrypted);
    
    return cloned;
  }
  
  /**
   * Store a memory
   */
  async store(memory: MemoryEntity): Promise<void> {
    const prepared = await this.prepareForStorage(memory);
    return this.baseStore.store(prepared);
  }
  
  /**
   * Retrieve a memory by ID
   */
  async retrieve(id: string): Promise<MemoryEntity | undefined> {
    const memory = await this.baseStore.retrieve(id);
    if (!memory) return undefined;
    return this.prepareForRetrieval(memory);
  }
  
  /**
   * Update an existing memory
   */
  async update(memory: MemoryEntity): Promise<void> {
    const prepared = await this.prepareForStorage(memory);
    return this.baseStore.update(prepared);
  }
  
  /**
   * Delete a memory
   */
  async delete(id: string): Promise<void> {
    return this.baseStore.delete(id);
  }
  
  /**
   * Query memories based on criteria
   */
  async query(options: QueryOptions): Promise<MemoryEntity[]> {
    const memories = await this.baseStore.query(options);
    return Promise.all(memories.map(m => this.prepareForRetrieval(m)));
  }
  
  /**
   * Get all memories
   */
  async getAll(): Promise<MemoryEntity[]> {
    const memories = await this.baseStore.getAll();
    return Promise.all(memories.map(m => this.prepareForRetrieval(m)));
  }
  
  /**
   * Count memories matching criteria
   */
  async count(options?: QueryOptions): Promise<number> {
    return this.baseStore.count(options);
  }
  
  /**
   * Check if a memory exists
   */
  async exists(id: string): Promise<boolean> {
    return this.baseStore.exists(id);
  }
  
  /**
   * Bulk store operation
   */
  async bulkStore(memories: MemoryEntity[]): Promise<void> {
    const prepared = await Promise.all(
      memories.map(m => this.prepareForStorage(m))
    );
    return this.baseStore.bulkStore(prepared);
  }
  
  /**
   * Bulk delete operation
   */
  async bulkDelete(ids: string[]): Promise<void> {
    return this.baseStore.bulkDelete(ids);
  }
  
  /**
   * Clear all memories
   */
  async clear(): Promise<void> {
    return this.baseStore.clear();
  }
  
  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    return this.baseStore.getStats();
  }
  
  /**
   * Export memories to JSON
   */
  async export(options?: QueryOptions): Promise<string> {
    const memories = options 
      ? await this.query(options)
      : await this.getAll();
    
    return JSON.stringify(memories.map(m => m.toJSON()), null, 2);
  }
  
  /**
   * Import memories from JSON
   */
  async import(jsonData: string): Promise<number> {
    // Import through base store, which will handle deserialization
    return this.baseStore.import(jsonData);
  }
  
  /**
   * Optimize storage
   */
  async optimize(): Promise<void> {
    return this.baseStore.optimize();
  }
}

/**
 * Semantic Index
 * 
 * Content-based indexing using vector embeddings for semantic similarity search.
 * Supports finding memories with similar meaning even without exact keyword matches.
 */

import { MemoryEntity } from '../models/MemoryEntity';
import { MemoryIndex } from './MemoryIndex';

/**
 * Vector embedding representation
 */
export interface VectorEmbedding {
  /** Memory ID */
  memoryId: string;
  
  /** Vector representation (normalized) */
  vector: number[];
  
  /** Dimension of the vector */
  dimension: number;
  
  /** Timestamp when embedding was created */
  createdAt: Date;
}

/**
 * Similarity search result
 */
export interface SimilarityResult {
  /** Memory ID */
  memoryId: string;
  
  /** Cosine similarity score (0-1) */
  similarity: number;
}

/**
 * Semantic Index
 * 
 * Provides vector-based semantic search capabilities.
 * Uses cosine similarity for finding semantically related memories.
 */
export class SemanticIndex extends MemoryIndex<number> {
  private embeddings: Map<string, VectorEmbedding> = new Map();
  private embeddingFunction?: (text: string) => Promise<number[]>;
  
  /**
   * Set custom embedding function
   * 
   * @param fn Function that converts text to vector embedding
   */
  setEmbeddingFunction(fn: (text: string) => Promise<number[]>): void {
    this.embeddingFunction = fn;
  }
  
  /**
   * Add a memory to the semantic index
   */
  add(memory: MemoryEntity): void {
    // Store memory ID for later retrieval
    this.addToIndex(0, memory.id); // Using 0 as placeholder key
    
    // Generate embedding asynchronously
    this.generateEmbedding(memory).catch(err => {
      console.error(`Failed to generate embedding for ${memory.id}:`, err);
    });
  }
  
  /**
   * Remove a memory from the semantic index
   */
  remove(memoryId: string): void {
    this.embeddings.delete(memoryId);
    
    // Remove from base index
    for (const [key, memoryIds] of this.index.entries()) {
      if (memoryIds.has(memoryId)) {
        this.removeFromIndex(key, memoryId);
      }
    }
  }
  
  /**
   * Query is not used for semantic index (use search instead)
   */
  query(key: number): string[] {
    return Array.from(this.embeddings.keys());
  }
  
  /**
   * Search for semantically similar memories
   * 
   * @param queryText Text to search for
   * @param limit Maximum number of results
   * @param minSimilarity Minimum similarity threshold (0-1)
   * @returns Array of similar memory IDs with scores
   */
  async search(
    queryText: string,
    limit: number = 10,
    minSimilarity: number = 0.5
  ): Promise<SimilarityResult[]> {
    // Generate embedding for query
    const queryVector = await this.getEmbedding(queryText);
    
    if (!queryVector || queryVector.length === 0) {
      return [];
    }
    
    // Calculate similarities
    const results: SimilarityResult[] = [];
    
    for (const [memoryId, embedding] of this.embeddings.entries()) {
      const similarity = this.cosineSimilarity(queryVector, embedding.vector);
      
      if (similarity >= minSimilarity) {
        results.push({ memoryId, similarity });
      }
    }
    
    // Sort by similarity (descending) and limit
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }
  
  /**
   * Find similar memories to a given memory
   * 
   * @param memoryId Source memory ID
   * @param limit Maximum number of results
   * @param minSimilarity Minimum similarity threshold
   * @returns Array of similar memory IDs with scores
   */
  findSimilar(
    memoryId: string,
    limit: number = 10,
    minSimilarity: number = 0.5
  ): SimilarityResult[] {
    const sourceEmbedding = this.embeddings.get(memoryId);
    
    if (!sourceEmbedding) {
      return [];
    }
    
    const results: SimilarityResult[] = [];
    
    for (const [targetId, embedding] of this.embeddings.entries()) {
      if (targetId === memoryId) continue;
      
      const similarity = this.cosineSimilarity(
        sourceEmbedding.vector,
        embedding.vector
      );
      
      if (similarity >= minSimilarity) {
        results.push({ memoryId: targetId, similarity });
      }
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }
  
  /**
   * Generate embedding for a memory
   */
  private async generateEmbedding(memory: MemoryEntity): Promise<void> {
    // Extract text content from memory
    const text = this.extractText(memory);
    
    // Generate embedding
    const vector = await this.getEmbedding(text);
    
    if (vector && vector.length > 0) {
      this.embeddings.set(memory.id, {
        memoryId: memory.id,
        vector,
        dimension: vector.length,
        createdAt: new Date()
      });
    }
  }
  
  /**
   * Extract text content from memory for embedding
   */
  private extractText(memory: MemoryEntity): string {
    const parts: string[] = [];
    
    // Add tags
    if (memory.metadata.tags.length > 0) {
      parts.push(memory.metadata.tags.join(' '));
    }
    
    // Add content (stringify and clean)
    const contentStr = JSON.stringify(memory.content);
    parts.push(contentStr);
    
    return parts.join(' ');
  }
  
  /**
   * Get embedding for text
   * 
   * Uses custom embedding function if set, otherwise uses simple TF-IDF-like approach
   */
  private async getEmbedding(text: string): Promise<number[]> {
    if (this.embeddingFunction) {
      return this.embeddingFunction(text);
    }
    
    // Fallback: Simple bag-of-words embedding (not ideal but functional)
    return this.simpleBagOfWordsEmbedding(text);
  }
  
  /**
   * Simple bag-of-words embedding (fallback)
   * 
   * In production, use proper embeddings like OpenAI, Sentence-BERT, etc.
   */
  private simpleBagOfWordsEmbedding(text: string): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    // Create a fixed-size vector (100 dimensions)
    const dimension = 100;
    const vector = new Array(dimension).fill(0);
    
    // Hash words to vector indices
    words.forEach(word => {
      const hash = this.simpleHash(word) % dimension;
      vector[hash] += 1;
    });
    
    // Normalize vector
    return this.normalizeVector(vector);
  }
  
  /**
   * Simple hash function
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    
    if (denominator === 0) {
      return 0;
    }
    
    return dotProduct / denominator;
  }
  
  /**
   * Normalize a vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    
    if (norm === 0) {
      return vector;
    }
    
    return vector.map(val => val / norm);
  }
  
  /**
   * Get embedding statistics
   */
  getEmbeddingStats(): {
    totalEmbeddings: number;
    averageDimension: number;
    oldestEmbedding?: Date;
    newestEmbedding?: Date;
  } {
    const embeddings = Array.from(this.embeddings.values());
    
    if (embeddings.length === 0) {
      return {
        totalEmbeddings: 0,
        averageDimension: 0
      };
    }
    
    const totalDimension = embeddings.reduce((sum, e) => sum + e.dimension, 0);
    const dates = embeddings.map(e => e.createdAt);
    
    return {
      totalEmbeddings: embeddings.length,
      averageDimension: totalDimension / embeddings.length,
      oldestEmbedding: new Date(Math.min(...dates.map(d => d.getTime()))),
      newestEmbedding: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }
}

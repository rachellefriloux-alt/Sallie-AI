/**
 * Temporal Index
 * 
 * Index memories by temporal dimensions for efficient time-based queries.
 */

import { MemoryEntity } from '../models/MemoryEntity';
import { MemoryIndex } from './MemoryIndex';

/**
 * Temporal Index
 * 
 * Organizes memories in time buckets for efficient temporal queries.
 */
export class TemporalIndex extends MemoryIndex<string> {
  private memoryToBucket: Map<string, string> = new Map();
  
  /**
   * Get time bucket key for a date
   */
  private getBucketKey(date: Date, granularity: 'hour' | 'day' | 'month' = 'day'): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    
    switch (granularity) {
      case 'hour':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${hour.toString().padStart(2, '0')}`;
      case 'day':
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;
      default:
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }
  
  add(memory: MemoryEntity): void {
    const bucketKey = this.getBucketKey(memory.metadata.createdAt);
    this.memoryToBucket.set(memory.id, bucketKey);
    this.addToIndex(bucketKey, memory.id);
  }
  
  remove(memoryId: string): void {
    const bucketKey = this.memoryToBucket.get(memoryId);
    if (bucketKey) {
      this.removeFromIndex(bucketKey, memoryId);
      this.memoryToBucket.delete(memoryId);
    }
  }
  
  query(bucketKey: string): string[] {
    return Array.from(this.index.get(bucketKey) || []);
  }
  
  /**
   * Query memories within a date range
   */
  queryRange(startDate: Date, endDate: Date): string[] {
    const result = new Set<string>();
    
    // Generate all day buckets in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const bucketKey = this.getBucketKey(currentDate);
      const memoryIds = this.index.get(bucketKey);
      if (memoryIds) {
        memoryIds.forEach(id => result.add(id));
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return Array.from(result);
  }
  
  /**
   * Query memories from today
   */
  queryToday(): string[] {
    const bucketKey = this.getBucketKey(new Date());
    return this.query(bucketKey);
  }
  
  /**
   * Query memories from last N days
   */
  queryLastNDays(n: number): string[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - n);
    
    return this.queryRange(startDate, endDate);
  }
  
  /**
   * Query memories from a specific month
   */
  queryMonth(year: number, month: number): string[] {
    const result = new Set<string>();
    const bucketPrefix = `${year}-${month.toString().padStart(2, '0')}`;
    
    for (const [bucketKey, memoryIds] of this.index.entries()) {
      if (bucketKey.startsWith(bucketPrefix)) {
        memoryIds.forEach(id => result.add(id));
      }
    }
    
    return Array.from(result);
  }
}

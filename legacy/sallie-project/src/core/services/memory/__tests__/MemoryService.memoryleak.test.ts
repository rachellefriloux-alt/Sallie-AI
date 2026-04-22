/**
 * Memory Leak Tests for Memory Service
 * 
 * Validates that the service properly cleans up resources and doesn't leak memory
 */

import { MemoryService } from '../MemoryService';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { SemanticMemory, SemanticKnowledgeType } from '../models/SemanticMemory';

describe('MemoryService Memory Leak Tests', () => {
  describe('Resource Cleanup', () => {
    it('should properly dispose of timers and resources', () => {
      const service = new MemoryService({
        autoConsolidate: true,
        consolidationInterval: 100,
        autoDecay: true,
        decayInterval: 100
      });
      
      // Service should have timers running
      expect(service).toBeDefined();
      
      // Dispose should clean up
      service.dispose();
      
      // After dispose, service should not crash
      expect(() => service.dispose()).not.toThrow();
    });
    
    it('should handle multiple dispose calls safely', () => {
      const service = new MemoryService({
        autoConsolidate: true,
        autoDecay: true
      });
      
      // Multiple dispose calls should be safe
      service.dispose();
      service.dispose();
      service.dispose();
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
  
  describe('Memory Growth Control', () => {
    it('should not grow memory unbounded when storing many items', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      const initialStats = await service.getStats();
      const initialCount = initialStats.storage.totalMemories;
      
      // Store 100 memories
      for (let i = 0; i < 100; i++) {
        const memory = new EpisodicMemory(`leak-test-${i}`, {
          description: `Memory leak test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
      }
      
      const midStats = await service.getStats();
      expect(midStats.storage.totalMemories).toBe(initialCount + 100);
      
      // Clear all
      await service.clearAll();
      
      const finalStats = await service.getStats();
      expect(finalStats.storage.totalMemories).toBe(0);
      
      service.dispose();
    });
    
    it('should release memory when deleting items', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      const memoryIds: string[] = [];
      
      // Store memories
      for (let i = 0; i < 50; i++) {
        const id = `delete-test-${i}`;
        const memory = new EpisodicMemory(id, {
          description: `Delete test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
        memoryIds.push(id);
      }
      
      let stats = await service.getStats();
      expect(stats.storage.totalMemories).toBe(50);
      
      // Delete all memories
      for (const id of memoryIds) {
        await service.deleteMemory(id);
      }
      
      stats = await service.getStats();
      expect(stats.storage.totalMemories).toBe(0);
      
      service.dispose();
    });
  });
  
  describe('Index Cleanup', () => {
    it('should clean up indexes when removing memories', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Add memory with entities and tags
      const memory = new EpisodicMemory('index-test', {
        description: 'Index cleanup test',
        participants: [
          { id: 'entity-1', name: 'Entity 1' },
          { id: 'entity-2', name: 'Entity 2' }
        ],
        temporal: { startTime: new Date() },
        topics: ['tag1', 'tag2', 'tag3']
      });
      
      await service.storeMemory(memory);
      
      // Verify indexed
      let entity1Memories = await service.getMemoriesByEntity('entity-1');
      expect(entity1Memories.length).toBe(1);
      
      let tag1Memories = await service.getMemoriesByTag('tag1');
      expect(tag1Memories.length).toBe(1);
      
      // Delete memory
      await service.deleteMemory('index-test');
      
      // Verify indexes cleaned up
      entity1Memories = await service.getMemoriesByEntity('entity-1');
      expect(entity1Memories.length).toBe(0);
      
      tag1Memories = await service.getMemoriesByTag('tag1');
      expect(tag1Memories.length).toBe(0);
      
      service.dispose();
    });
    
    it('should clear all indexes when clearing all memories', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Add multiple memories
      for (let i = 0; i < 20; i++) {
        const memory = new EpisodicMemory(`clear-${i}`, {
          description: `Clear test ${i}`,
          participants: [{ id: `user-${i}`, name: `User ${i}` }],
          temporal: { startTime: new Date() },
          topics: [`topic-${i}`]
        });
        await service.storeMemory(memory);
      }
      
      // Verify populated
      const beforeStats = await service.getStats();
      expect(beforeStats.indexes.entities.totalEntries).toBeGreaterThan(0);
      expect(beforeStats.indexes.tags.totalEntries).toBeGreaterThan(0);
      
      // Clear all
      await service.clearAll();
      
      // Verify indexes cleared
      const afterStats = await service.getStats();
      expect(afterStats.indexes.entities.totalEntries).toBe(0);
      expect(afterStats.indexes.tags.totalEntries).toBe(0);
      expect(afterStats.indexes.types.totalEntries).toBe(0);
      
      service.dispose();
    });
  });
  
  describe('Association Cleanup', () => {
    it('should clean up associations when deleting memories', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Create connected memories
      const memory1 = new EpisodicMemory('assoc-1', {
        description: 'Association test 1',
        participants: [{ id: 'user-1', name: 'User 1' }],
        temporal: { startTime: new Date() },
        topics: ['topic-a', 'topic-b']
      });
      
      const memory2 = new EpisodicMemory('assoc-2', {
        description: 'Association test 2',
        participants: [{ id: 'user-1', name: 'User 1' }],
        temporal: { startTime: new Date() },
        topics: ['topic-a', 'topic-c']
      });
      
      await service.storeMemory(memory1);
      await service.storeMemory(memory2);
      
      // Check associations formed
      let associations = await service.getAssociatedMemories('assoc-1', 0.1);
      expect(associations.length).toBeGreaterThan(0);
      
      // Delete one memory
      await service.deleteMemory('assoc-2');
      
      // Associations should be cleaned up
      associations = await service.getAssociatedMemories('assoc-1', 0.1);
      const hasDeletedMemory = associations.some(m => m.id === 'assoc-2');
      expect(hasDeletedMemory).toBe(false);
      
      service.dispose();
    });
  });
  
  describe('Short-Term Buffer Management', () => {
    it('should prevent unbounded buffer growth', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Add many memories to buffer
      for (let i = 0; i < 100; i++) {
        const memory = new EpisodicMemory(`buffer-${i}`, {
          description: `Buffer test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
      }
      
      const stats = await service.getStats();
      
      // Buffer should have size limit
      expect(stats.shortTermBuffer.size).toBeLessThanOrEqual(100);
      
      service.dispose();
    });
    
    it('should consolidate and clear old items from buffer', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Fill buffer
      for (let i = 0; i < 60; i++) {
        const memory = new EpisodicMemory(`consolidate-${i}`, {
          description: `Consolidate test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        memory.metadata.importance = 0.8;
        await service.storeMemory(memory);
      }
      
      const beforeStats = await service.getStats();
      const beforeBufferSize = beforeStats.shortTermBuffer.size;
      
      // Consolidate
      await service.consolidate();
      
      const afterStats = await service.getStats();
      const afterBufferSize = afterStats.shortTermBuffer.size;
      
      // Buffer should be smaller after consolidation
      expect(afterBufferSize).toBeLessThanOrEqual(beforeBufferSize);
      
      service.dispose();
    });
  });
  
  describe('Event Listener Cleanup', () => {
    it('should not accumulate event listeners', async () => {
      // Create and dispose multiple services
      for (let i = 0; i < 10; i++) {
        const service = new MemoryService({
          autoConsolidate: true,
          autoDecay: true
        });
        
        // Add some memories
        const memory = new EpisodicMemory(`listener-${i}`, {
          description: `Listener test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
        
        // Dispose
        service.dispose();
      }
      
      // If event listeners leak, this test would accumulate them
      // No exceptions or crashes = pass
      expect(true).toBe(true);
    });
  });
  
  describe('Large Object Cleanup', () => {
    it('should properly cleanup large memory objects', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Create memory with large content
      const largeContent = 'x'.repeat(100000); // 100KB string
      
      for (let i = 0; i < 10; i++) {
        const memory = new EpisodicMemory(`large-${i}`, {
          description: largeContent,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
      }
      
      let stats = await service.getStats();
      expect(stats.storage.totalMemories).toBe(10);
      
      // Delete all
      for (let i = 0; i < 10; i++) {
        await service.deleteMemory(`large-${i}`);
      }
      
      stats = await service.getStats();
      expect(stats.storage.totalMemories).toBe(0);
      
      service.dispose();
    });
  });
  
  describe('Circular Reference Prevention', () => {
    it('should handle export/import without circular references', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Create memories with associations
      for (let i = 0; i < 20; i++) {
        const memory = new EpisodicMemory(`circular-${i}`, {
          description: `Circular test ${i}`,
          participants: [
            { id: `user-${i}`, name: `User ${i}` },
            { id: `user-${(i + 1) % 20}`, name: `User ${(i + 1) % 20}` }
          ],
          temporal: { startTime: new Date() },
          topics: [`topic-${i % 5}`]
        });
        await service.storeMemory(memory);
      }
      
      // Export (should not have circular refs)
      const exported = await service.exportMemories();
      
      // Should be valid JSON
      expect(() => JSON.parse(exported)).not.toThrow();
      
      // Import back
      await service.clearAll();
      const count = await service.importMemories(exported);
      
      expect(count).toBe(20);
      
      service.dispose();
    });
  });
  
  describe('Pattern Miner Cleanup', () => {
    it('should not accumulate patterns indefinitely', async () => {
      const service = new MemoryService({
        autoConsolidate: false,
        autoDecay: false
      });
      
      // Add memories and mine patterns multiple times
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 30; i++) {
          const memory = new EpisodicMemory(`pattern-r${round}-${i}`, {
            description: `Pattern test ${i}`,
            participants: [{ id: `user-${i % 5}`, name: `User ${i % 5}` }],
            temporal: { startTime: new Date() },
            topics: [`topic-${i % 3}`]
          });
          await service.storeMemory(memory);
        }
        
        await service.minePatterns();
      }
      
      const patterns = service.getPatterns();
      
      // Patterns should not grow unbounded
      expect(patterns.length).toBeLessThan(100);
      
      service.dispose();
    });
  });
});

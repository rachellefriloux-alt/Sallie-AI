/**
 * Performance tests for Memory Service
 * 
 * Tests system behavior under load with large memory sets
 */

import { MemoryService } from '../MemoryService';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { SemanticMemory, SemanticKnowledgeType } from '../models/SemanticMemory';
import { MemoryType } from '../models/MemoryEntity';

describe('MemoryService Performance Tests', () => {
  let service: MemoryService;
  
  beforeEach(() => {
    service = new MemoryService({
      autoConsolidate: false,
      autoDecay: false
    });
  });
  
  afterEach(() => {
    service.dispose();
  });
  
  describe('Large Memory Set Operations', () => {
    it('should handle storing 1000 memories efficiently', async () => {
      const startTime = Date.now();
      const memories = [];
      
      // Create 1000 memories
      for (let i = 0; i < 1000; i++) {
        const memory = new EpisodicMemory(`perf-${i}`, {
          description: `Performance test memory ${i}`,
          participants: [{ id: `user-${i % 10}`, name: `User ${i % 10}` }],
          temporal: { startTime: new Date() },
          topics: [`topic-${i % 20}`, `category-${i % 5}`]
        });
        memories.push(memory);
      }
      
      // Store all memories
      for (const memory of memories) {
        await service.storeMemory(memory);
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete in reasonable time (< 10 seconds)
      expect(duration).toBeLessThan(10000);
      
      // Verify all were stored
      const stats = await service.getStats();
      expect(stats.storage.totalMemories).toBe(1000);
    }, 15000); // 15 second timeout
    
    it('should retrieve memories quickly from large set', async () => {
      // Store 500 memories
      for (let i = 0; i < 500; i++) {
        const memory = new EpisodicMemory(`lookup-${i}`, {
          description: `Lookup test ${i}`,
          participants: [{ id: 'user-test', name: 'Test User' }],
          temporal: { startTime: new Date() },
          topics: ['performance', 'test']
        });
        await service.storeMemory(memory);
      }
      
      // Measure retrieval time
      const startTime = Date.now();
      const memories = await service.getMemoriesByEntity('user-test');
      const duration = Date.now() - startTime;
      
      // Should be fast (< 100ms for indexed lookup)
      expect(duration).toBeLessThan(100);
      expect(memories.length).toBe(500);
    }, 10000);
    
    it('should handle contextual retrieval on large dataset', async () => {
      // Create diverse memory set
      for (let i = 0; i < 200; i++) {
        const memory = new EpisodicMemory(`ctx-${i}`, {
          description: `Context test ${i}`,
          participants: [
            { id: `user-${i % 10}`, name: `User ${i % 10}` }
          ],
          temporal: { startTime: new Date(Date.now() - i * 1000000) },
          topics: [`topic-${i % 15}`, 'general']
        });
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      const results = await service.retrieveContextual({
        topics: ['topic-5', 'general'],
        entities: ['user-5']
      }, { limit: 20 });
      const duration = Date.now() - startTime;
      
      // Should complete quickly
      expect(duration).toBeLessThan(500);
      expect(results.length).toBeGreaterThan(0);
    }, 10000);
    
    it('should consolidate large buffer efficiently', async () => {
      // Fill short-term buffer beyond capacity
      for (let i = 0; i < 100; i++) {
        const memory = new EpisodicMemory(`buffer-${i}`, {
          description: `Buffer test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        memory.metadata.importance = Math.random();
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      await service.consolidate();
      const duration = Date.now() - startTime;
      
      // Consolidation should be efficient
      expect(duration).toBeLessThan(2000);
    }, 5000);
  });
  
  describe('Association Performance', () => {
    it('should build associations efficiently for connected memories', async () => {
      // Create interconnected memories
      for (let i = 0; i < 100; i++) {
        const memory = new EpisodicMemory(`assoc-${i}`, {
          description: `Association test ${i}`,
          participants: [
            { id: `user-${i}`, name: `User ${i}` },
            { id: `user-${(i + 1) % 100}`, name: `User ${(i + 1) % 100}` }
          ],
          temporal: { startTime: new Date() },
          topics: [`topic-${i % 10}`]
        });
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      const associated = await service.getAssociatedMemories('assoc-50', 0.3);
      const duration = Date.now() - startTime;
      
      // Should find associations quickly
      expect(duration).toBeLessThan(200);
      expect(associated.length).toBeGreaterThan(0);
    }, 8000);
  });
  
  describe('Indexing Performance', () => {
    it('should maintain index performance with many entities', async () => {
      // Create memories with diverse entities
      for (let i = 0; i < 300; i++) {
        const memory = new EpisodicMemory(`idx-${i}`, {
          description: `Index test ${i}`,
          participants: Array.from({ length: 5 }, (_, j) => ({
            id: `entity-${i * 5 + j}`,
            name: `Entity ${i * 5 + j}`
          })),
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
      }
      
      // Test multiple entity lookups
      const lookupTimes: number[] = [];
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await service.getMemoriesByEntity(`entity-${i * 100}`);
        lookupTimes.push(Date.now() - start);
      }
      
      const avgTime = lookupTimes.reduce((a, b) => a + b, 0) / lookupTimes.length;
      
      // Average lookup should be fast
      expect(avgTime).toBeLessThan(50);
    }, 10000);
    
    it('should handle tag queries efficiently on large dataset', async () => {
      // Create memories with various tags
      for (let i = 0; i < 400; i++) {
        const memory = new SemanticMemory(`tag-${i}`, {
          knowledgeType: SemanticKnowledgeType.FACT,
          subject: `Subject ${i}`,
          value: `Value ${i}`,
          category: `category-${i % 10}`
        });
        memory.addTags(`tag-${i % 20}`, `tag-${i % 30}`);
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      const results = await service.getMemoriesByTag('tag-5');
      const duration = Date.now() - startTime;
      
      // Should be fast with indexing
      expect(duration).toBeLessThan(50);
      expect(results.length).toBeGreaterThan(0);
    }, 10000);
  });
  
  describe('Pattern Mining Performance', () => {
    it('should mine patterns from large dataset efficiently', async () => {
      // Create pattern-rich dataset
      for (let i = 0; i < 200; i++) {
        const memory = new EpisodicMemory(`pattern-${i}`, {
          description: `Pattern test ${i}`,
          participants: [
            { id: `user-${i % 5}`, name: `User ${i % 5}` },
            { id: `user-${(i + 1) % 5}`, name: `User ${(i + 1) % 5}` }
          ],
          temporal: {
            startTime: new Date(Date.now() - i * 3600000) // 1 hour apart
          },
          topics: [`topic-${i % 8}`, `theme-${i % 4}`]
        });
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      const patterns = await service.minePatterns();
      const duration = Date.now() - startTime;
      
      // Pattern mining should complete in reasonable time
      expect(duration).toBeLessThan(3000);
      expect(patterns.length).toBeGreaterThan(0);
    }, 8000);
  });
  
  describe('Semantic Search Performance', () => {
    it('should perform semantic search on large dataset', async () => {
      // Create diverse content
      const topics = [
        'project planning', 'team meeting', 'code review',
        'design discussion', 'bug fixing', 'feature development',
        'testing strategy', 'deployment process', 'documentation',
        'performance optimization'
      ];
      
      for (let i = 0; i < 100; i++) {
        const memory = new EpisodicMemory(`semantic-${i}`, {
          description: `${topics[i % topics.length]} session ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() },
          topics: [topics[i % topics.length]]
        });
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      const results = await service.searchSemantic('planning meeting', 10, 0.3);
      const duration = Date.now() - startTime;
      
      // Semantic search should be reasonably fast
      expect(duration).toBeLessThan(1000);
    }, 8000);
  });
  
  describe('Attention Mechanism Performance', () => {
    it('should apply attention weighting efficiently', async () => {
      // Create memory set
      for (let i = 0; i < 150; i++) {
        const memory = new EpisodicMemory(`attention-${i}`, {
          description: `Attention test ${i}`,
          participants: [{ id: `user-${i % 10}`, name: `User ${i % 10}` }],
          temporal: { startTime: new Date(Date.now() - i * 86400000) }, // Days apart
          topics: [`topic-${i % 15}`]
        });
        memory.metadata.importance = 0.5;
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      await service.applyAttentionWeighting();
      const duration = Date.now() - startTime;
      
      // Should process all memories efficiently
      expect(duration).toBeLessThan(2000);
    }, 8000);
  });
  
  describe('Export/Import Performance', () => {
    it('should export large memory set efficiently', async () => {
      // Create diverse memory set
      for (let i = 0; i < 500; i++) {
        const memory = new EpisodicMemory(`export-${i}`, {
          description: `Export test ${i}`,
          participants: [{ id: `user-${i % 20}`, name: `User ${i % 20}` }],
          temporal: { startTime: new Date() },
          topics: [`topic-${i % 30}`]
        });
        await service.storeMemory(memory);
      }
      
      const startTime = Date.now();
      const exported = await service.exportMemories();
      const duration = Date.now() - startTime;
      
      // Export should be efficient
      expect(duration).toBeLessThan(1000);
      expect(JSON.parse(exported).length).toBe(500);
    }, 10000);
    
    it('should import large memory set efficiently', async () => {
      // Create and export memories
      for (let i = 0; i < 300; i++) {
        const memory = new EpisodicMemory(`import-${i}`, {
          description: `Import test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        await service.storeMemory(memory);
      }
      
      const exported = await service.exportMemories();
      
      // Clear and import
      await service.clearAll();
      
      const startTime = Date.now();
      const count = await service.importMemories(exported);
      const duration = Date.now() - startTime;
      
      // Import should be efficient
      expect(duration).toBeLessThan(2000);
      expect(count).toBe(300);
    }, 10000);
  });
  
  describe('Concurrent Operations', () => {
    it('should handle concurrent memory storage', async () => {
      const promises = [];
      
      // Create 100 concurrent store operations
      for (let i = 0; i < 100; i++) {
        const memory = new EpisodicMemory(`concurrent-${i}`, {
          description: `Concurrent test ${i}`,
          participants: [{ id: 'user-1', name: 'User' }],
          temporal: { startTime: new Date() }
        });
        promises.push(service.storeMemory(memory));
      }
      
      const startTime = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      // Should handle concurrent operations
      expect(duration).toBeLessThan(5000);
      
      const stats = await service.getStats();
      expect(stats.storage.totalMemories).toBe(100);
    }, 10000);
  });
});

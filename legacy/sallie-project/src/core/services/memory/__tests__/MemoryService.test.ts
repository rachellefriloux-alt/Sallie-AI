/**
 * Integration tests for Memory Service
 */

import { MemoryService } from '../MemoryService';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { SemanticMemory, SemanticKnowledgeType } from '../models/SemanticMemory';
import { MemoryType } from '../models/MemoryEntity';

describe('MemoryService', () => {
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
  
  describe('Basic Operations', () => {
    it('should store and retrieve a memory', async () => {
      const memory = new EpisodicMemory('test-1', {
        description: 'Test conversation',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      await service.storeMemory(memory);
      const retrieved = await service.retrieveMemory('test-1');
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-1');
    });
    
    it('should delete a memory', async () => {
      const memory = new EpisodicMemory('test-delete', {
        description: 'To be deleted',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      await service.storeMemory(memory);
      await service.deleteMemory('test-delete');
      const retrieved = await service.retrieveMemory('test-delete');
      
      expect(retrieved).toBeUndefined();
    });
    
    it('should query memories by type', async () => {
      const episodic = new EpisodicMemory('ep-1', {
        description: 'Episodic memory',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      const semantic = new SemanticMemory('sem-1', {
        knowledgeType: SemanticKnowledgeType.FACT,
        subject: 'John',
        value: 'Engineer'
      });
      
      await service.storeMemory(episodic);
      await service.storeMemory(semantic);
      
      const episodicMemories = await service.getMemoriesByType(MemoryType.EPISODIC);
      const semanticMemories = await service.getMemoriesByType(MemoryType.SEMANTIC);
      
      expect(episodicMemories.length).toBeGreaterThan(0);
      expect(semanticMemories.length).toBeGreaterThan(0);
    });
  });
  
  describe('Entity and Tag Indexing', () => {
    it('should retrieve memories by entity', async () => {
      const memory1 = new EpisodicMemory('test-1', {
        description: 'Meeting with John',
        participants: [{ id: 'john', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      memory1.addEntities('john');
      
      const memory2 = new EpisodicMemory('test-2', {
        description: 'Meeting with Jane',
        participants: [{ id: 'jane', name: 'Jane' }],
        temporal: { startTime: new Date() }
      });
      
      memory2.addEntities('jane');
      
      await service.storeMemory(memory1);
      await service.storeMemory(memory2);
      
      const johnMemories = await service.getMemoriesByEntity('john');
      expect(johnMemories.some(m => m.id === 'test-1')).toBe(true);
      expect(johnMemories.some(m => m.id === 'test-2')).toBe(false);
    });
    
    it('should retrieve memories by tag', async () => {
      const memory = new EpisodicMemory('test-tag', {
        description: 'Work meeting',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() },
        topics: ['work', 'project']
      });
      
      await service.storeMemory(memory);
      
      const workMemories = await service.getMemoriesByTag('work');
      expect(workMemories.some(m => m.id === 'test-tag')).toBe(true);
    });
  });
  
  describe('Contextual Retrieval', () => {
    it('should retrieve memories by context', async () => {
      const memory = new EpisodicMemory('ctx-test', {
        description: 'Discussion about AI',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() },
        topics: ['AI', 'technology']
      });
      
      await service.storeMemory(memory);
      
      const retrieved = await service.retrieveContextual({
        topics: ['AI'],
        entities: ['user-1']
      }, {
        limit: 10
      });
      
      expect(retrieved.length).toBeGreaterThan(0);
    });
  });
  
  describe('Recent Memories', () => {
    it('should retrieve recent memories', async () => {
      const recentMemory = new EpisodicMemory('recent-1', {
        description: 'Recent event',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      await service.storeMemory(recentMemory);
      
      const recent = await service.getRecentMemories(7);
      expect(recent.some(m => m.id === 'recent-1')).toBe(true);
    });
  });
  
  describe('Consolidation', () => {
    it('should consolidate memories', async () => {
      const memory = new EpisodicMemory('cons-test', {
        description: 'To consolidate',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      memory.metadata.importance = 0.9;
      await service.storeMemory(memory);
      
      await service.consolidate();
      
      // Memory should still be retrievable
      const retrieved = await service.retrieveMemory('cons-test');
      expect(retrieved).toBeDefined();
    });
  });
  
  describe('Statistics', () => {
    it('should provide service statistics', async () => {
      const memory = new EpisodicMemory('stats-test', {
        description: 'For stats',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      await service.storeMemory(memory);
      
      const stats = await service.getStats();
      
      expect(stats).toHaveProperty('storage');
      expect(stats).toHaveProperty('shortTermBuffer');
      expect(stats).toHaveProperty('associations');
      expect(stats).toHaveProperty('indexes');
    });
  });
  
  describe('Export and Import', () => {
    it('should export and import memories', async () => {
      const memory1 = new EpisodicMemory('exp-1', {
        description: 'Export test 1',
        participants: [{ id: 'user-1', name: 'John' }],
        temporal: { startTime: new Date() }
      });
      
      const memory2 = new SemanticMemory('exp-2', {
        knowledgeType: SemanticKnowledgeType.FACT,
        subject: 'John',
        value: 'Engineer'
      });
      
      await service.storeMemory(memory1);
      await service.storeMemory(memory2);
      
      // Export
      const exported = await service.exportMemories();
      expect(exported).toBeTruthy();
      
      // Clear and import
      await service.clearAll();
      const count = await service.importMemories(exported);
      
      expect(count).toBeGreaterThan(0);
    });
  });
});

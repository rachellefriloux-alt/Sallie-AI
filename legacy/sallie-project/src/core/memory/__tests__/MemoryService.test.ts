/**
 * Memory Service Tests
 * Comprehensive test suite for Memory Service
 */

import { MemoryService } from '../MemoryService';
import {
  MemoryType,
  EmotionType,
  AssociationType,
  PrivacyLevel,
} from '../types';

describe('MemoryService', () => {
  let memoryService: MemoryService;

  beforeEach(() => {
    memoryService = new MemoryService({
      encryptionPassword: 'test-password-123',
      consolidationInterval: 10000,
    });
  });

  afterEach(() => {
    memoryService.destroy();
  });

  describe('Episodic Memory', () => {
    it('should create an episodic memory', async () => {
      const event = {
        name: 'Morning Coffee',
        description: 'Had coffee with Sarah at the cafe',
        participants: ['Sarah'],
        emotionalState: [EmotionType.JOY, EmotionType.CONTENTMENT],
        significance: 3,
      };

      const memory = await memoryService.createEpisodicMemory(
        event,
        'We discussed the new project over coffee',
        'conversation'
      );

      expect(memory.type).toBe(MemoryType.EPISODIC);
      expect(memory.event.name).toBe('Morning Coffee');
      expect(memory.event.participants).toContain('Sarah');
      expect(memory.id).toBeDefined();
      expect(memory.version).toBe(1);
    });

    it('should assign sequential numbers to episodic memories', async () => {
      const event1 = {
        name: 'Event 1',
        description: 'First event',
        participants: [],
        emotionalState: [EmotionType.JOY],
        significance: 2,
      };

      const event2 = {
        name: 'Event 2',
        description: 'Second event',
        participants: [],
        emotionalState: [EmotionType.JOY],
        significance: 2,
      };

      const memory1 = await memoryService.createEpisodicMemory(event1, 'Content 1');
      const memory2 = await memoryService.createEpisodicMemory(event2, 'Content 2');

      expect(memory2.sequence).toBe(memory1.sequence + 1);
    });

    it('should store episodic memory within 50ms', async () => {
      const event = {
        name: 'Quick Event',
        description: 'Performance test',
        participants: [],
        emotionalState: [EmotionType.JOY],
        significance: 1,
      };

      const start = Date.now();
      await memoryService.createEpisodicMemory(event, 'Fast storage test');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Semantic Memory', () => {
    it('should create a semantic memory', async () => {
      const knowledge = {
        subject: 'Coffee',
        predicate: 'is enjoyed by',
        object: 'Sarah',
        category: ['preferences', 'food'],
        verified: true,
        verificationSource: 'conversation',
      };

      const memory = await memoryService.createSemanticMemory(
        knowledge,
        'Sarah loves coffee',
        'conversation'
      );

      expect(memory.type).toBe(MemoryType.SEMANTIC);
      expect(memory.knowledge.subject).toBe('Coffee');
      expect(memory.confidence).toBeGreaterThan(0.9);
    });

    it('should assign lower confidence to unverified knowledge', async () => {
      const knowledge = {
        subject: 'Weather',
        predicate: 'might be',
        object: 'rainy tomorrow',
        category: ['prediction'],
        verified: false,
      };

      const memory = await memoryService.createSemanticMemory(
        knowledge,
        'It might rain tomorrow'
      );

      expect(memory.confidence).toBeLessThan(0.8);
    });
  });

  describe('Procedural Memory', () => {
    it('should create a procedural memory', async () => {
      const procedure = {
        name: 'Make Coffee',
        steps: [
          {
            order: 1,
            action: 'Boil water',
            description: 'Heat water to 200°F',
          },
          {
            order: 2,
            action: 'Add grounds',
            description: 'Add 2 tablespoons of coffee grounds',
          },
          {
            order: 3,
            action: 'Pour and steep',
            description: 'Pour water over grounds and steep for 4 minutes',
          },
        ],
        conditions: { time: 'morning', equipment: 'french press' },
        effectivenessScore: 0.9,
        adaptations: [],
      };

      const memory = await memoryService.createProceduralMemory(
        procedure,
        'Process for making coffee with French press'
      );

      expect(memory.type).toBe(MemoryType.PROCEDURAL);
      expect(memory.procedure.steps.length).toBe(3);
      expect(memory.importance).toBe(4);
    });
  });

  describe('Emotional Memory', () => {
    it('should create an emotional memory', async () => {
      const emotion = {
        primaryEmotion: EmotionType.JOY,
        secondaryEmotions: [EmotionType.EXCITEMENT, EmotionType.CONTENTMENT],
        intensity: 0.8,
        trigger: 'Seeing old friend',
        response: 'Felt warm and happy',
        effectiveness: 0.9,
      };

      const memory = await memoryService.createEmotionalMemory(
        emotion,
        'Reunited with college roommate after 5 years'
      );

      expect(memory.type).toBe(MemoryType.EMOTIONAL);
      expect(memory.emotion.primaryEmotion).toBe(EmotionType.JOY);
      expect(memory.privacyLevel).toBe(PrivacyLevel.CONFIDENTIAL);
      expect(memory.metadata.emotionalArousal).toBe(0.8);
    });

    it('should calculate emotional valence correctly', async () => {
      const joyEmotion = {
        primaryEmotion: EmotionType.JOY,
        secondaryEmotions: [],
        intensity: 0.7,
        trigger: 'Good news',
        response: 'Smiled',
        effectiveness: 0.8,
      };

      const sadEmotion = {
        primaryEmotion: EmotionType.SADNESS,
        secondaryEmotions: [],
        intensity: 0.6,
        trigger: 'Bad news',
        response: 'Felt down',
        effectiveness: 0.5,
      };

      const joyMemory = await memoryService.createEmotionalMemory(
        joyEmotion,
        'Received promotion'
      );

      const sadMemory = await memoryService.createEmotionalMemory(
        sadEmotion,
        'Project cancelled'
      );

      expect(joyMemory.metadata.emotionalValence).toBeGreaterThan(0);
      expect(sadMemory.metadata.emotionalValence).toBeLessThan(0);
    });
  });

  describe('Memory Retrieval', () => {
    beforeEach(async () => {
      // Create test memories
      await memoryService.createEpisodicMemory(
        {
          name: 'Meeting',
          description: 'Team meeting',
          participants: ['Alice', 'Bob'],
          emotionalState: [EmotionType.JOY],
          significance: 3,
        },
        'Discussed project progress'
      );

      await memoryService.createSemanticMemory(
        {
          subject: 'Alice',
          predicate: 'works in',
          object: 'Engineering',
          category: ['people', 'work'],
          verified: true,
        },
        'Alice is an engineer'
      );

      await memoryService.createProceduralMemory(
        {
          name: 'Code Review',
          steps: [
            { order: 1, action: 'Read code', description: 'Review changes' },
            { order: 2, action: 'Comment', description: 'Provide feedback' },
          ],
          conditions: {},
          effectivenessScore: 0.85,
          adaptations: [],
        },
        'Standard code review process'
      );
    });

    it('should retrieve memories by type', async () => {
      const result = await memoryService.retrieveMemories({
        types: [MemoryType.EPISODIC],
      });

      expect(result.memories.length).toBeGreaterThan(0);
      expect(result.memories[0].type).toBe(MemoryType.EPISODIC);
    });

    it('should retrieve memories by keywords', async () => {
      const result = await memoryService.retrieveMemories({
        keywords: ['Alice'],
      });

      expect(result.memories.length).toBeGreaterThan(0);
      expect(result.totalCount).toBeGreaterThan(0);
    });

    it('should retrieve memories within time range', async () => {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 3600000);

      const result = await memoryService.retrieveMemories({
        timeRange: {
          start: hourAgo,
          end: now,
        },
      });

      expect(result.memories.length).toBe(3);
    });

    it('should retrieve memories with minimum importance', async () => {
      const result = await memoryService.retrieveMemories({
        minImportance: 4,
      });

      result.memories.forEach(memory => {
        expect(memory.importance).toBeGreaterThanOrEqual(4);
      });
    });

    it('should complete retrieval within 100ms', async () => {
      const start = Date.now();
      await memoryService.retrieveMemories({ keywords: ['test'] });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should apply pagination correctly', async () => {
      const result = await memoryService.retrieveMemories({
        limit: 2,
        offset: 0,
      });

      expect(result.memories.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Memory Associations', () => {
    let memory1Id: string;
    let memory2Id: string;

    beforeEach(async () => {
      const mem1 = await memoryService.createSemanticMemory(
        {
          subject: 'Coffee',
          predicate: 'contains',
          object: 'Caffeine',
          category: ['food', 'chemistry'],
          verified: true,
        },
        'Coffee contains caffeine'
      );

      const mem2 = await memoryService.createSemanticMemory(
        {
          subject: 'Caffeine',
          predicate: 'is a',
          object: 'Stimulant',
          category: ['chemistry', 'health'],
          verified: true,
        },
        'Caffeine is a stimulant'
      );

      memory1Id = mem1.id;
      memory2Id = mem2.id;
    });

    it('should create associations between memories', async () => {
      await memoryService.createAssociation(
        memory1Id,
        memory2Id,
        AssociationType.SEMANTIC,
        0.8
      );

      const associated = await memoryService.getAssociatedMemories(memory1Id);
      expect(associated.length).toBeGreaterThan(0);
      expect(associated.some(m => m.id === memory2Id)).toBe(true);
    });

    it('should traverse associations with depth limit', async () => {
      const mem3 = await memoryService.createSemanticMemory(
        {
          subject: 'Stimulant',
          predicate: 'affects',
          object: 'Energy',
          category: ['health'],
          verified: true,
        },
        'Stimulants affect energy levels'
      );

      await memoryService.createAssociation(
        memory1Id,
        memory2Id,
        AssociationType.SEMANTIC,
        0.8
      );

      await memoryService.createAssociation(
        memory2Id,
        mem3.id,
        AssociationType.CAUSAL,
        0.7
      );

      const associated = await memoryService.getAssociatedMemories(memory1Id, 2);
      expect(associated.length).toBeGreaterThan(1);
    });

    it('should complete association retrieval within 200ms', async () => {
      await memoryService.createAssociation(
        memory1Id,
        memory2Id,
        AssociationType.SEMANTIC,
        0.8
      );

      const start = Date.now();
      await memoryService.getAssociatedMemories(memory1Id, 3);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Storage Statistics', () => {
    it('should provide accurate storage statistics', async () => {
      await memoryService.createEpisodicMemory(
        {
          name: 'Event',
          description: 'Test event',
          participants: [],
          emotionalState: [EmotionType.JOY],
          significance: 2,
        },
        'Test content'
      );

      const stats = memoryService.getStats();

      expect(stats.totalMemories).toBeGreaterThan(0);
      expect(stats.memoryByType[MemoryType.EPISODIC]).toBeGreaterThan(0);
      expect(stats.storageUsed).toBeGreaterThan(0);
      expect(stats.averageImportance).toBeGreaterThan(0);
    });

    it('should track oldest and newest memories', async () => {
      await memoryService.createSemanticMemory(
        {
          subject: 'Test',
          predicate: 'is',
          object: 'Memory',
          category: ['test'],
          verified: true,
        },
        'Test memory'
      );

      const stats = memoryService.getStats();

      expect(stats.oldestMemory).toBeInstanceOf(Date);
      expect(stats.newestMemory).toBeInstanceOf(Date);
      expect(stats.newestMemory.getTime()).toBeGreaterThanOrEqual(
        stats.oldestMemory.getTime()
      );
    });
  });

  describe('Export and Import', () => {
    it('should export memories to JSON', async () => {
      await memoryService.createSemanticMemory(
        {
          subject: 'Export',
          predicate: 'is',
          object: 'Test',
          category: ['test'],
          verified: true,
        },
        'Export test memory'
      );

      const exported = await memoryService.exportMemories();
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported);
      expect(parsed.memories).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });

    it('should import memories from JSON', async () => {
      const memory = await memoryService.createSemanticMemory(
        {
          subject: 'Import',
          predicate: 'is',
          object: 'Test',
          category: ['test'],
          verified: true,
        },
        'Import test memory'
      );

      const exported = await memoryService.exportMemories();

      const newService = new MemoryService();
      await newService.importMemories(exported);

      const result = await newService.retrieveMemories({
        keywords: ['Import'],
      });

      expect(result.memories.length).toBeGreaterThan(0);
      expect(result.memories[0].content).toContain('Import');

      newService.destroy();
    });

    it('should preserve memory properties during export/import', async () => {
      const originalMemory = await memoryService.createEmotionalMemory(
        {
          primaryEmotion: EmotionType.JOY,
          secondaryEmotions: [EmotionType.CONTENTMENT],
          intensity: 0.7,
          trigger: 'Test',
          response: 'Happy',
          effectiveness: 0.8,
        },
        'Preservation test'
      );

      const exported = await memoryService.exportMemories();
      const newService = new MemoryService();
      await newService.importMemories(exported);

      const result = await newService.retrieveMemories({
        keywords: ['Preservation'],
      });

      expect(result.memories.length).toBe(1);
      const importedMemory = result.memories[0];
      expect(importedMemory.type).toBe(originalMemory.type);
      expect(importedMemory.importance).toBe(originalMemory.importance);

      newService.destroy();
    });
  });

  describe('Performance Targets', () => {
    it('should handle large number of memories efficiently', async () => {
      const memories: Promise<unknown>[] = [];

      for (let i = 0; i < 100; i++) {
        memories.push(
          memoryService.createSemanticMemory(
            {
              subject: `Subject${i}`,
              predicate: 'is',
              object: `Object${i}`,
              category: ['test'],
              verified: true,
            },
            `Test memory ${i}`
          )
        );
      }

      await Promise.all(memories);

      const start = Date.now();
      const result = await memoryService.retrieveMemories({
        keywords: ['Test'],
        limit: 10,
      });
      const duration = Date.now() - start;

      expect(result.memories.length).toBe(10);
      expect(duration).toBeLessThan(500);
    });

    it('should maintain performance with associations', async () => {
      const mem1 = await memoryService.createSemanticMemory(
        {
          subject: 'Root',
          predicate: 'is',
          object: 'Node',
          category: ['test'],
          verified: true,
        },
        'Root node'
      );

      const childMemories = [];
      for (let i = 0; i < 10; i++) {
        const child = await memoryService.createSemanticMemory(
          {
            subject: `Child${i}`,
            predicate: 'is',
            object: 'Node',
            category: ['test'],
            verified: true,
          },
          `Child node ${i}`
        );
        childMemories.push(child);
        await memoryService.createAssociation(
          mem1.id,
          child.id,
          AssociationType.SEMANTIC,
          0.7
        );
      }

      const start = Date.now();
      const associated = await memoryService.getAssociatedMemories(mem1.id);
      const duration = Date.now() - start;

      expect(associated.length).toBe(10);
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent source memory in association', async () => {
      const mem = await memoryService.createSemanticMemory(
        {
          subject: 'Test',
          predicate: 'is',
          object: 'Memory',
          category: ['test'],
          verified: true,
        },
        'Test memory'
      );

      await expect(
        memoryService.createAssociation(
          'non-existent-id',
          mem.id,
          AssociationType.SEMANTIC,
          0.7
        )
      ).rejects.toThrow();
    });
  });

  describe('Retrieval Edge Cases', () => {
    it('should handle empty query', async () => {
      const result = await memoryService.retrieveMemories({});

      expect(result.memories).toBeDefined();
      expect(Array.isArray(result.memories)).toBe(true);
    });

    it('should retrieve memories with emotions filter', async () => {
      await memoryService.createEmotionalMemory(
        {
          primaryEmotion: EmotionType.JOY,
          secondaryEmotions: [],
          intensity: 0.8,
          trigger: 'Test',
          response: 'Happy',
          effectiveness: 0.9,
        },
        'Joy memory'
      );

      const result = await memoryService.retrieveMemories({
        emotions: [EmotionType.JOY],
      });

      // Assert that all returned memories have the specified emotion
      expect(result.memories).toBeDefined();
      expect(result.memories.every(
        (mem) =>
          mem.metadata.primaryEmotion === EmotionType.JOY ||
          (mem.metadata.secondaryEmotions &&
            mem.metadata.secondaryEmotions.includes(EmotionType.JOY))
      )).toBe(true);
    });

    it('should handle query with all parameters', async () => {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 3600000);

      const mem = await memoryService.createSemanticMemory(
        {
          subject: 'Complex',
          predicate: 'is',
          object: 'Query',
          category: ['test'],
          verified: true,
        },
        'Complex query test with multiple keywords for matching'
      );

      mem.metadata.entities = [
        { type: 'person', value: 'Alice', confidence: 0.9 },
      ];

      const result = await memoryService.retrieveMemories({
        types: [MemoryType.SEMANTIC],
        keywords: ['Complex', 'query'],
        timeRange: { start: hourAgo, end: now },
        minImportance: 2,
        entities: ['Alice'],
        limit: 5,
        offset: 0,
      });

      expect(result.executionTime).toBeDefined();
    });
  });

  describe('Association Edge Cases', () => {
    it('should handle circular associations', async () => {
      const mem1 = await memoryService.createSemanticMemory(
        {
          subject: 'A',
          predicate: 'links to',
          object: 'B',
          category: ['test'],
          verified: true,
        },
        'Memory A'
      );

      const mem2 = await memoryService.createSemanticMemory(
        {
          subject: 'B',
          predicate: 'links to',
          object: 'A',
          category: ['test'],
          verified: true,
        },
        'Memory B'
      );

      await memoryService.createAssociation(
        mem1.id,
        mem2.id,
        AssociationType.SEMANTIC,
        0.8
      );

      await memoryService.createAssociation(
        mem2.id,
        mem1.id,
        AssociationType.SEMANTIC,
        0.8
      );

      const associated = await memoryService.getAssociatedMemories(mem1.id, 5);

      expect(associated.length).toBeGreaterThan(0);
    });

    it('should respect maxDepth in association traversal', async () => {
      const memories = [];
      for (let i = 0; i < 5; i++) {
        const mem = await memoryService.createSemanticMemory(
          {
            subject: `Node${i}`,
            predicate: 'is',
            object: 'Test',
            category: ['test'],
            verified: true,
          },
          `Node ${i}`
        );
        memories.push(mem);
      }

      for (let i = 0; i < memories.length - 1; i++) {
        await memoryService.createAssociation(
          memories[i].id,
          memories[i + 1].id,
          AssociationType.SEMANTIC,
          0.7
        );
      }

      const depth1 = await memoryService.getAssociatedMemories(memories[0].id, 1);
      const depth3 = await memoryService.getAssociatedMemories(memories[0].id, 3);

      expect(depth3.length).toBeGreaterThan(depth1.length);
    });
  });
});

/**
 * Unit tests for Memory Entity models
 */

import {
  MemoryEntity,
  MemoryType,
  PrivacyLevel
} from '../models/MemoryEntity';
import { EpisodicMemory } from '../models/EpisodicMemory';
import { SemanticMemory, SemanticKnowledgeType } from '../models/SemanticMemory';
import { ProceduralMemory } from '../models/ProceduralMemory';
import { EmotionalMemory } from '../models/EmotionalMemory';

describe('EpisodicMemory', () => {
  it('should create a valid episodic memory', () => {
    const memory = new EpisodicMemory('test-1', {
      description: 'Test conversation',
      participants: [
        { id: 'user-1', name: 'John' }
      ],
      temporal: {
        startTime: new Date('2025-01-01T10:00:00Z')
      }
    });
    
    expect(memory.type).toBe(MemoryType.EPISODIC);
    expect(memory.validate()).toBe(true);
    expect(memory.content.participants).toHaveLength(1);
  });
  
  it('should fail validation without required fields', () => {
    const memory = new EpisodicMemory('test-2', {
      description: '',
      participants: [],
      temporal: {
        startTime: new Date()
      }
    });
    
    expect(memory.validate()).toBe(false);
  });
  
  it('should calculate duration correctly', () => {
    const startTime = new Date('2025-01-01T10:00:00Z');
    const endTime = new Date('2025-01-01T11:00:00Z');
    
    const memory = new EpisodicMemory('test-3', {
      description: 'Meeting',
      participants: [{ id: 'user-1', name: 'John' }],
      temporal: {
        startTime,
        endTime
      }
    });
    
    expect(memory.getDuration()).toBe(3600000); // 1 hour in ms
  });
  
  it('should detect participant presence', () => {
    const memory = new EpisodicMemory('test-4', {
      description: 'Team meeting',
      participants: [
        { id: 'user-1', name: 'John' },
        { id: 'user-2', name: 'Jane' }
      ],
      temporal: {
        startTime: new Date()
      }
    });
    
    expect(memory.hasParticipant('user-1')).toBe(true);
    expect(memory.hasParticipant('user-3')).toBe(false);
  });
});

describe('SemanticMemory', () => {
  it('should create a valid semantic memory', () => {
    const memory = new SemanticMemory('test-1', {
      knowledgeType: SemanticKnowledgeType.PREFERENCE,
      subject: 'John',
      property: 'favoriteColor',
      value: 'blue'
    });
    
    expect(memory.type).toBe(MemoryType.SEMANTIC);
    expect(memory.validate()).toBe(true);
  });
  
  it('should detect contradictions', () => {
    const memory1 = new SemanticMemory('test-1', {
      knowledgeType: SemanticKnowledgeType.PREFERENCE,
      subject: 'John',
      property: 'favoriteColor',
      value: 'blue'
    });
    
    const memory2 = new SemanticMemory('test-2', {
      knowledgeType: SemanticKnowledgeType.PREFERENCE,
      subject: 'John',
      property: 'favoriteColor',
      value: 'red'
    });
    
    expect(memory1.contradicts(memory2)).toBe(true);
  });
  
  it('should check if about an entity', () => {
    const memory = new SemanticMemory('test-1', {
      knowledgeType: SemanticKnowledgeType.FACT,
      subject: 'John',
      value: 'Software Engineer'
    });
    
    expect(memory.isAbout('John')).toBe(true);
    expect(memory.isAbout('Jane')).toBe(false);
  });
});

describe('ProceduralMemory', () => {
  it('should create a valid procedural memory', () => {
    const memory = new ProceduralMemory('test-1', {
      name: 'Make Coffee',
      description: 'How to make coffee',
      context: {
        activity: 'morning-routine'
      },
      steps: [
        { order: 1, description: 'Boil water' },
        { order: 2, description: 'Add coffee grounds' }
      ],
      effectiveness: {
        successCount: 0,
        failureCount: 0
      }
    });
    
    expect(memory.type).toBe(MemoryType.PROCEDURAL);
    expect(memory.validate()).toBe(true);
  });
  
  it('should track success and failure', () => {
    const memory = new ProceduralMemory('test-1', {
      name: 'Test Procedure',
      description: 'Test',
      context: { activity: 'test' },
      steps: [{ order: 1, description: 'Do something' }],
      effectiveness: {
        successCount: 0,
        failureCount: 0
      }
    });
    
    memory.recordSuccess();
    expect(memory.content.effectiveness.successCount).toBe(1);
    expect(memory.getSuccessRate()).toBe(1);
    
    memory.recordFailure();
    expect(memory.content.effectiveness.failureCount).toBe(1);
    expect(memory.getSuccessRate()).toBe(0.5);
  });
});

describe('EmotionalMemory', () => {
  it('should create a valid emotional memory', () => {
    const memory = new EmotionalMemory('test-1', {
      emotionalState: {
        primaryEmotion: 'joy',
        intensity: 0.8,
        valence: 0.9,
        arousal: 0.7
      },
      triggers: [
        { type: 'event', description: 'Got promotion', strength: 0.9 }
      ],
      context: {}
    });
    
    expect(memory.type).toBe(MemoryType.EMOTIONAL);
    expect(memory.validate()).toBe(true);
  });
  
  it('should detect positive and negative emotions', () => {
    const positiveMemory = new EmotionalMemory('test-1', {
      emotionalState: {
        primaryEmotion: 'joy',
        intensity: 0.8,
        valence: 0.7,
        arousal: 0.6
      },
      triggers: [{ type: 'event', description: 'Good news', strength: 0.8 }],
      context: {}
    });
    
    const negativeMemory = new EmotionalMemory('test-2', {
      emotionalState: {
        primaryEmotion: 'sadness',
        intensity: 0.6,
        valence: -0.7,
        arousal: 0.4
      },
      triggers: [{ type: 'event', description: 'Bad news', strength: 0.8 }],
      context: {}
    });
    
    expect(positiveMemory.isPositive()).toBe(true);
    expect(positiveMemory.isNegative()).toBe(false);
    expect(negativeMemory.isPositive()).toBe(false);
    expect(negativeMemory.isNegative()).toBe(true);
  });
  
  it('should calculate emotional similarity', () => {
    const memory1 = new EmotionalMemory('test-1', {
      emotionalState: {
        primaryEmotion: 'joy',
        intensity: 0.8,
        valence: 0.7,
        arousal: 0.6
      },
      triggers: [{ type: 'event', description: 'Success', strength: 0.8 }],
      context: {}
    });
    
    const memory2 = new EmotionalMemory('test-2', {
      emotionalState: {
        primaryEmotion: 'joy',
        intensity: 0.75,
        valence: 0.65,
        arousal: 0.55
      },
      triggers: [{ type: 'event', description: 'Success', strength: 0.8 }],
      context: {}
    });
    
    const similarity = memory1.calculateSimilarity(memory2);
    expect(similarity).toBeGreaterThan(0.5);
  });
});

describe('MemoryEntity base functionality', () => {
  let memory: EpisodicMemory;
  
  beforeEach(() => {
    memory = new EpisodicMemory('test-1', {
      description: 'Test memory',
      participants: [{ id: 'user-1', name: 'Test' }],
      temporal: { startTime: new Date() }
    });
  });
  
  it('should record access', () => {
    const initialCount = memory.metadata.accessCount;
    memory.recordAccess();
    expect(memory.metadata.accessCount).toBe(initialCount + 1);
  });
  
  it('should apply decay', () => {
    const initialDecay = memory.decayFactor;
    memory.applyDecay(0.1);
    expect(memory.decayFactor).toBeLessThan(initialDecay);
  });
  
  it('should calculate effective importance', () => {
    memory.metadata.importance = 0.8;
    memory.decayFactor = 0.5;
    expect(memory.getEffectiveImportance()).toBe(0.4);
  });
  
  it('should add tags and entities', () => {
    memory.addTags('tag1', 'tag2');
    expect(memory.metadata.tags).toContain('tag1');
    expect(memory.metadata.tags).toContain('tag2');
    
    memory.addEntities('entity1', 'entity2');
    expect(memory.metadata.entities).toContain('entity1');
    expect(memory.metadata.entities).toContain('entity2');
  });
  
  it('should consolidate memory', () => {
    expect(memory.isConsolidated).toBe(false);
    memory.consolidate();
    expect(memory.isConsolidated).toBe(true);
  });
  
  it('should serialize to JSON', () => {
    const json = memory.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('type');
    expect(json).toHaveProperty('content');
    expect(json).toHaveProperty('metadata');
  });
});

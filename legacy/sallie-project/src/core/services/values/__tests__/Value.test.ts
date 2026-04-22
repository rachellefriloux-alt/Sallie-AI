/**
 * Value Model Tests
 */

import { Value } from '../models/Value';
import { ValueCategory } from '../types';

describe('Value', () => {
  describe('constructor', () => {
    it('should create a value with required fields', () => {
      const value = new Value({
        name: 'Integrity',
        category: ValueCategory.PERSONAL,
      });
      
      expect(value.getName()).toBe('Integrity');
      expect(value.getCategory()).toBe(ValueCategory.PERSONAL);
      expect(value.getPriority()).toBe(5); // default
      expect(value.isActive()).toBe(true);
    });
    
    it('should create a value with all fields', () => {
      const value = new Value({
        name: 'Health',
        category: ValueCategory.HEALTH,
        priority: 9,
        description: 'Physical and mental wellbeing',
        examples: ['Exercise regularly', 'Eat healthy'],
      });
      
      expect(value.getName()).toBe('Health');
      expect(value.getPriority()).toBe(9);
      expect(value.getDescription()).toBe('Physical and mental wellbeing');
      expect(value.getDefinition().examples).toHaveLength(2);
    });
    
    it('should throw error for empty name', () => {
      expect(() => {
        new Value({
          name: '',
          category: ValueCategory.PERSONAL,
        });
      }).toThrow('Value name is required');
    });
    
    it('should throw error for invalid priority', () => {
      expect(() => {
        new Value({
          name: 'Test',
          category: ValueCategory.PERSONAL,
          priority: 15,
        });
      }).toThrow('Priority must be between 1 and 10');
    });
  });
  
  describe('updatePriority', () => {
    it('should update priority and track history', () => {
      const value = new Value({
        name: 'Honesty',
        category: ValueCategory.PERSONAL,
        priority: 7,
      });
      
      value.updatePriority(9, 'Realized importance');
      
      expect(value.getPriority()).toBe(9);
      
      const trend = value.getPriorityTrend();
      expect(trend).toHaveLength(2);
      expect(trend[0].priority).toBe(7);
      expect(trend[1].priority).toBe(9);
      expect(trend[0].reason).toBe('Realized importance');
    });
    
    it('should throw error for invalid priority', () => {
      const value = new Value({
        name: 'Test',
        category: ValueCategory.PERSONAL,
      });
      
      expect(() => {
        value.updatePriority(11);
      }).toThrow('Priority must be between 1 and 10');
    });
    
    it('should not create history entry if priority unchanged', () => {
      const value = new Value({
        name: 'Test',
        category: ValueCategory.PERSONAL,
        priority: 5,
      });
      
      value.updatePriority(5);
      
      const trend = value.getPriorityTrend();
      expect(trend).toHaveLength(1); // Only current
    });
  });
  
  describe('examples management', () => {
    it('should add examples', () => {
      const value = new Value({
        name: 'Kindness',
        category: ValueCategory.SOCIAL,
      });
      
      value.addExample('Help others in need');
      value.addExample('Listen with empathy');
      
      expect(value.getDefinition().examples).toHaveLength(2);
    });
    
    it('should not add duplicate examples', () => {
      const value = new Value({
        name: 'Test',
        category: ValueCategory.PERSONAL,
      });
      
      value.addExample('Example 1');
      value.addExample('Example 1');
      
      expect(value.getDefinition().examples).toHaveLength(1);
    });
    
    it('should remove examples', () => {
      const value = new Value({
        name: 'Test',
        category: ValueCategory.PERSONAL,
        examples: ['Example 1', 'Example 2'],
      });
      
      value.removeExample('Example 1');
      
      expect(value.getDefinition().examples).toHaveLength(1);
      expect(value.getDefinition().examples[0]).toBe('Example 2');
    });
  });
  
  describe('relationships', () => {
    it('should manage related values', () => {
      const value = new Value({
        name: 'Integrity',
        category: ValueCategory.PERSONAL,
      });
      
      value.addRelatedValue('value_123');
      value.addRelatedValue('value_456');
      
      expect(value.isRelatedTo('value_123')).toBe(true);
      expect(value.isRelatedTo('value_789')).toBe(false);
      
      value.removeRelatedValue('value_123');
      expect(value.isRelatedTo('value_123')).toBe(false);
    });
    
    it('should manage conflicting values', () => {
      const value = new Value({
        name: 'Independence',
        category: ValueCategory.PERSONAL,
      });
      
      value.addConflictingValue('value_harmony');
      
      expect(value.conflictsWith('value_harmony')).toBe(true);
      expect(value.conflictsWith('value_other')).toBe(false);
      
      value.removeConflictingValue('value_harmony');
      expect(value.conflictsWith('value_harmony')).toBe(false);
    });
  });
  
  describe('calculateAlignmentScore', () => {
    it('should calculate alignment based on name match', () => {
      const value = new Value({
        name: 'Honesty',
        category: ValueCategory.PERSONAL,
        description: 'Being truthful and honest',
      });
      
      const score = value.calculateAlignmentScore(
        'I told the truth about being honest',
        ['honest', 'truth']
      );
      
      expect(score).toBeGreaterThan(0);
    });
    
    it('should calculate alignment based on keywords', () => {
      const value = new Value({
        name: 'Health',
        category: ValueCategory.HEALTH,
        examples: ['Exercise regularly', 'Eat nutritious food'],
      });
      
      const score = value.calculateAlignmentScore(
        'Went for a run and had a healthy meal',
        ['exercise', 'healthy', 'nutrition']
      );
      
      expect(score).toBeGreaterThan(0.5);
    });
    
    it('should return low score for unrelated actions', () => {
      const value = new Value({
        name: 'Creativity',
        category: ValueCategory.CREATIVE,
      });
      
      const score = value.calculateAlignmentScore(
        'Paid bills and cleaned house',
        ['bills', 'cleaning']
      );
      
      expect(score).toBeLessThan(0.3);
    });
  });
  
  describe('active status', () => {
    it('should deactivate and activate values', () => {
      const value = new Value({
        name: 'Test',
        category: ValueCategory.PERSONAL,
      });
      
      expect(value.isActive()).toBe(true);
      
      value.deactivate();
      expect(value.isActive()).toBe(false);
      
      value.activate();
      expect(value.isActive()).toBe(true);
    });
  });
  
  describe('serialization', () => {
    it('should serialize to JSON', () => {
      const value = new Value({
        name: 'Test Value',
        category: ValueCategory.PERSONAL,
        priority: 8,
      });
      
      const json = value.toJSON();
      
      expect(json.name).toBe('Test Value');
      expect(json.priority).toBe(8);
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
    
    it('should deserialize from JSON', () => {
      const original = new Value({
        name: 'Test',
        category: ValueCategory.HEALTH,
        priority: 7,
      });
      
      const json = original.toJSON();
      const restored = Value.fromJSON(json);
      
      expect(restored.getName()).toBe(original.getName());
      expect(restored.getPriority()).toBe(original.getPriority());
      expect(restored.getCategory()).toBe(original.getCategory());
    });
  });
});

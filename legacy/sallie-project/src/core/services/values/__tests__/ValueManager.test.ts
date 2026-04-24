/**
 * Value Manager Tests
 */

import { ValueManager } from '../management/ValueManager';
import { ValueCategory } from '../types';

describe('ValueManager', () => {
  let manager: ValueManager;
  
  beforeEach(() => {
    manager = new ValueManager();
  });
  
  afterEach(() => {
    manager.clear();
  });
  
  describe('createValue', () => {
    it('should create a value', () => {
      const value = manager.createValue({
        name: 'Integrity',
        category: ValueCategory.PERSONAL,
        priority: 9,
      });
      
      expect(value.getName()).toBe('Integrity');
      expect(manager.getValue(value.getId())).toBe(value);
    });
    
    it('should throw error for duplicate name', () => {
      manager.createValue({
        name: 'Honesty',
        category: ValueCategory.PERSONAL,
      });
      
      expect(() => {
        manager.createValue({
          name: 'Honesty',
          category: ValueCategory.SOCIAL,
        });
      }).toThrow('already exists');
    });
    
    it('should emit value:created event', (done) => {
      manager.on('value:created', (data) => {
        expect(data).toHaveProperty('name');
        done();
      });
      
      manager.createValue({
        name: 'Test',
        category: ValueCategory.PERSONAL,
      });
    });
  });
  
  describe('getAllValues', () => {
    it('should return all values', () => {
      manager.createValue({ name: 'Value 1', category: ValueCategory.PERSONAL });
      manager.createValue({ name: 'Value 2', category: ValueCategory.SOCIAL });
      
      const all = manager.getAllValues();
      expect(all).toHaveLength(2);
    });
    
    it('should filter by active status', () => {
      const value1 = manager.createValue({ name: 'Value 1', category: ValueCategory.PERSONAL });
      manager.createValue({ name: 'Value 2', category: ValueCategory.PERSONAL });
      
      value1.deactivate();
      
      const active = manager.getAllValues(true);
      expect(active).toHaveLength(1);
      expect(active[0].getName()).toBe('Value 2');
    });
  });
  
  describe('getValuesByCategory', () => {
    it('should filter by category', () => {
      manager.createValue({ name: 'Health', category: ValueCategory.HEALTH });
      manager.createValue({ name: 'Creativity', category: ValueCategory.CREATIVE });
      manager.createValue({ name: 'Fitness', category: ValueCategory.HEALTH });
      
      const healthValues = manager.getValuesByCategory(ValueCategory.HEALTH);
      expect(healthValues).toHaveLength(2);
      expect(healthValues.every(v => v.getCategory() === ValueCategory.HEALTH)).toBe(true);
    });
  });
  
  describe('getValuesByPriority', () => {
    it('should sort by priority descending', () => {
      manager.createValue({ name: 'Low', category: ValueCategory.PERSONAL, priority: 3 });
      manager.createValue({ name: 'High', category: ValueCategory.PERSONAL, priority: 9 });
      manager.createValue({ name: 'Medium', category: ValueCategory.PERSONAL, priority: 6 });
      
      const sorted = manager.getValuesByPriority();
      expect(sorted[0].getName()).toBe('High');
      expect(sorted[1].getName()).toBe('Medium');
      expect(sorted[2].getName()).toBe('Low');
    });
  });
  
  describe('detectConflicts', () => {
    it('should detect explicit conflicts', () => {
      const value1 = manager.createValue({ name: 'Independence', category: ValueCategory.PERSONAL });
      const value2 = manager.createValue({ name: 'Harmony', category: ValueCategory.SOCIAL });
      
      value1.addConflictingValue(value2.getId());
      
      const conflicts = manager.detectConflicts();
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictType).toBe('contradiction');
    });
    
    it('should detect priority conflicts', () => {
      manager.createValue({
        name: 'Value 1',
        category: ValueCategory.PERSONAL,
        priority: 10,
      });
      
      manager.createValue({
        name: 'Value 2',
        category: ValueCategory.PERSONAL,
        priority: 9,
      });
      
      const conflicts = manager.detectConflicts();
      expect(conflicts.some(c => c.conflictType === 'priority')).toBe(true);
    });
  });
  
  describe('calculateAlignment', () => {
    it('should calculate overall alignment', () => {
      manager.createValue({
        name: 'Honesty',
        category: ValueCategory.PERSONAL,
        priority: 9,
      });
      
      manager.createValue({
        name: 'Kindness',
        category: ValueCategory.SOCIAL,
        priority: 8,
      });
      
      const analysis = manager.calculateAlignment(
        'Told the truth kindly',
        ['truth', 'honest', 'kind']
      );
      
      expect(analysis.overallScore).toBeGreaterThan(0);
      expect(analysis.topValues).toHaveLength(2);
      expect(analysis.valueScores.size).toBe(2);
    });
    
    it('should weight by priority', () => {
      manager.createValue({
        name: 'High Priority',
        category: ValueCategory.PERSONAL,
        priority: 10,
      });
      
      manager.createValue({
        name: 'Low Priority',
        category: ValueCategory.PERSONAL,
        priority: 1,
      });
      
      const analysis = manager.calculateAlignment(
        'High Priority action',
        ['high', 'priority']
      );
      
      // Should heavily favor high priority value
      expect(analysis.overallScore).toBeGreaterThan(0.5);
    });
  });
  
  describe('trackValueDrift', () => {
    it('should detect high drift', () => {
      const value = manager.createValue({
        name: 'Health',
        category: ValueCategory.HEALTH,
        priority: 9,
      });
      
      const recentActions = [
        { action: 'Ate junk food', alignment: 0.1 },
        { action: 'Skipped workout', alignment: 0.2 },
        { action: 'Stayed up late', alignment: 0.1 },
      ];
      
      const drift = manager.trackValueDrift(value.getId(), recentActions);
      
      expect(drift.driftScore).toBeGreaterThan(0.7);
      expect(drift.recommendations.length).toBeGreaterThan(0);
    });
    
    it('should detect low drift', () => {
      const value = manager.createValue({
        name: 'Health',
        category: ValueCategory.HEALTH,
      });
      
      const recentActions = [
        { action: 'Exercised', alignment: 0.9 },
        { action: 'Ate well', alignment: 0.8 },
        { action: 'Slept 8 hours', alignment: 0.9 },
      ];
      
      const drift = manager.trackValueDrift(value.getId(), recentActions);
      
      expect(drift.driftScore).toBeLessThan(0.3);
    });
  });
  
  describe('export and import', () => {
    it('should export values', () => {
      manager.createValue({ name: 'Value 1', category: ValueCategory.PERSONAL });
      manager.createValue({ name: 'Value 2', category: ValueCategory.SOCIAL });
      
      const exported = manager.export();
      expect(exported).toHaveLength(2);
      expect(exported[0]).toHaveProperty('name');
      expect(exported[0]).toHaveProperty('category');
    });
    
    it('should import values', () => {
      const value1 = manager.createValue({ name: 'Value 1', category: ValueCategory.PERSONAL });
      const exported = manager.export();
      
      const newManager = new ValueManager();
      newManager.import(exported);
      
      const imported = newManager.getAllValues();
      expect(imported).toHaveLength(1);
      expect(imported[0].getName()).toBe('Value 1');
      
      newManager.clear();
    });
  });
});

/**
 * TraitManager Tests
 */

import { TraitManager } from '../traits/TraitManager';
import { EvolutionCause } from '../models/TraitVector';

describe('TraitManager', () => {
  let traitManager: TraitManager;

  beforeEach(() => {
    traitManager = new TraitManager();
  });

  describe('Initialization', () => {
    test('should initialize with default traits', () => {
      const traits = traitManager.getTraitVector();
      
      expect(traits.openness).toBeDefined();
      expect(traits.conscientiousness).toBeDefined();
      expect(traits.extraversion).toBeDefined();
      expect(traits.agreeableness).toBeDefined();
      expect(traits.neuroticism).toBeDefined();
    });

    test('should initialize facets for all traits', () => {
      const openness = traitManager.getTraitDimension('openness');
      
      expect(Object.keys(openness.facets).length).toBe(6);
      expect(openness.facets['imagination']).toBeDefined();
      expect(openness.facets['artistic_interests']).toBeDefined();
    });
  });

  describe('Trait Updates', () => {
    test('should update trait value', () => {
      const oldValue = traitManager.getTraitDimension('openness').value;
      
      traitManager.updateTrait('openness', {
        delta: 5,
        confidence: 0.8,
        cause: EvolutionCause.DirectFeedback,
      });

      const newValue = traitManager.getTraitDimension('openness').value;
      expect(newValue).toBeGreaterThan(oldValue);
    });

    test('should respect stability when updating traits', () => {
      traitManager.setStability('conscientiousness', 0.9);
      
      const oldValue = traitManager.getTraitDimension('conscientiousness').value;
      
      traitManager.updateTrait('conscientiousness', {
        delta: 10,
        confidence: 0.5,
        cause: EvolutionCause.BehavioralOutcome,
      });

      const newValue = traitManager.getTraitDimension('conscientiousness').value;
      const actualChange = Math.abs(newValue - oldValue);
      
      // With high stability, change should be small
      expect(actualChange).toBeLessThan(2);
    });

    test('should not update below minimum threshold', () => {
      const oldValue = traitManager.getTraitDimension('openness').value;
      
      const result = traitManager.updateTrait('openness', {
        delta: 0.1,
        confidence: 0.1,
        cause: EvolutionCause.EmotionalImpact,
      });

      expect(result).toBe(false);
      const newValue = traitManager.getTraitDimension('openness').value;
      expect(newValue).toBe(oldValue);
    });

    test('should record evolution history', () => {
      traitManager.updateTrait('extraversion', {
        delta: 5,
        confidence: 0.7,
        cause: EvolutionCause.SocialInteraction,
      });

      const history = traitManager.getEvolutionHistory('extraversion');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].cause).toBe(EvolutionCause.SocialInteraction);
    });
  });

  describe('Facet Management', () => {
    test('should update individual facets', () => {
      const oldValue = traitManager.getFacetValue('openness', 'imagination');
      expect(oldValue).not.toBeNull();

      traitManager.updateFacet('openness', 'imagination', 3, 0.6);

      const newValue = traitManager.getFacetValue('openness', 'imagination');
      expect(newValue?.value).not.toBe(oldValue?.value);
    });

    test('should update main trait when facets change', () => {
      const oldValue = traitManager.getTraitDimension('agreeableness').value;

      // Update multiple facets
      traitManager.updateFacet('agreeableness', 'trust', 5, 0.8);
      traitManager.updateFacet('agreeableness', 'sympathy', 5, 0.8);

      const newValue = traitManager.getTraitDimension('agreeableness').value;
      expect(newValue).toBeGreaterThan(oldValue);
    });
  });

  describe('Bounds Checking', () => {
    test('should not exceed maximum value', () => {
      traitManager.updateTrait('openness', {
        delta: 200,
        confidence: 1.0,
        cause: EvolutionCause.DirectFeedback,
      });

      const value = traitManager.getTraitDimension('openness').value;
      expect(value).toBeLessThanOrEqual(100);
    });

    test('should not go below minimum value', () => {
      traitManager.updateTrait('openness', {
        delta: -200,
        confidence: 1.0,
        cause: EvolutionCause.DirectFeedback,
      });

      const value = traitManager.getTraitDimension('openness').value;
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Persistence', () => {
    test('should export and import state', () => {
      traitManager.updateTrait('openness', {
        delta: 10,
        confidence: 0.9,
        cause: EvolutionCause.ValueAlignment,
      });

      const exported = traitManager.export();
      const newManager = new TraitManager();
      newManager.import(exported);

      const original = traitManager.getTraitVector();
      const imported = newManager.getTraitVector();

      expect(imported.openness.value).toBe(original.openness.value);
      expect(imported.version).toBe(original.version);
    });
  });
});

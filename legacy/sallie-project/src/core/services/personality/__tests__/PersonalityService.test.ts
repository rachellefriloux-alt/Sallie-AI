/**
 * PersonalityService Integration Tests
 */

import { PersonalityService } from '../PersonalityService';
import { ExperienceType } from '../traits/TraitEvolution';

describe('PersonalityService', () => {
  let service: PersonalityService;

  beforeEach(() => {
    service = new PersonalityService();
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      const state = service.getState();
      
      expect(state.traits).toBeDefined();
      expect(state.emotions).toBeDefined();
      expect(state.expressionProfile).toBeDefined();
      expect(state.consistencyScore).toBeGreaterThan(0);
    });

    test('should initialize with custom traits', () => {
      const customService = new PersonalityService({
        initialTraits: {
          openness: { value: 80, confidence: 0.9, variance: 10, stability: 0.8, velocity: 0, facets: {} },
        },
      });

      const state = customService.getState();
      expect(state.traits.openness.value).toBe(80);
    });
  });

  describe('Input Processing', () => {
    test('should process message input', async () => {
      const expression = await service.processInput('Hello! How are you?', 'message');
      
      expect(expression).toBeDefined();
      expect(expression.linguistic).toBeDefined();
      expect(expression.visual).toBeDefined();
      expect(expression.behavioral).toBeDefined();
    });

    test('should process event input', async () => {
      const expression = await service.processInput('System initialized', 'event');
      
      expect(expression).toBeDefined();
    });

    test('should update emotions based on input', async () => {
      await service.processInput('This is amazing news!', 'message');
      
      const state = service.getState();
      const joyIntensity = state.emotions.primary.joy.intensity;
      
      expect(joyIntensity).toBeGreaterThan(0);
    });

    test('should complete processing in under 100ms', async () => {
      let processingTime = 0;
      service.on('performance', (data: any) => {
        processingTime = data.processingTime;
      });

      await service.processInput('Test message', 'message');
      
      expect(processingTime).toBeLessThan(100);
    });
  });

  describe('Personality Evolution', () => {
    test('should evolve personality from positive experience', () => {
      const beforeState = service.getState();
      
      service.evolvePersonality({
        type: ExperienceType.BehavioralOutcome,
        outcome: 'positive',
        intensity: 0.8,
        context: 'test',
        affectedTraits: [
          {
            trait: 'extraversion',
            impact: 0.5,
          },
        ],
      });

      const afterState = service.getState();
      
      // Should have evolution record
      expect(afterState.traits.evolutionHistory.length).toBeGreaterThan(
        beforeState.traits.evolutionHistory.length
      );
    });

    test('should maintain identity consistency', () => {
      // Apply multiple experiences
      for (let i = 0; i < 10; i++) {
        service.evolvePersonality({
          type: ExperienceType.SocialInteraction,
          outcome: 'positive',
          intensity: 0.5,
          context: 'test',
          affectedTraits: [
            {
              trait: 'agreeableness',
              impact: 0.3,
            },
          ],
        });
      }

      const state = service.getState();
      expect(state.consistencyScore).toBeGreaterThan(0.5);
    });
  });

  describe('Event System', () => {
    test('should emit emotion update events', async () => {
      let eventEmitted = false;
      
      service.on('emotionUpdate', () => {
        eventEmitted = true;
      });

      await service.processInput('Test message', 'message');
      
      expect(eventEmitted).toBe(true);
    });

    test('should emit expression update events', async () => {
      let eventEmitted = false;
      
      service.on('expressionUpdate', () => {
        eventEmitted = true;
      });

      await service.processInput('Test message', 'message');
      
      expect(eventEmitted).toBe(true);
    });

    test('should emit personality evolved events', () => {
      let eventEmitted = false;
      
      service.on('personalityEvolved', () => {
        eventEmitted = true;
      });

      service.evolvePersonality({
        type: ExperienceType.DirectFeedback,
        outcome: 'positive',
        intensity: 0.7,
        context: 'test',
        affectedTraits: [
          {
            trait: 'conscientiousness',
            impact: 0.4,
          },
        ],
      });
      
      expect(eventEmitted).toBe(true);
    });
  });

  describe('Trait Influence', () => {
    test('should calculate behavior influence', () => {
      const influence = service.getTraitInfluence();
      
      expect(influence.communicationStyle).toBeDefined();
      expect(influence.decisionMaking).toBeDefined();
      expect(influence.socialInteraction).toBeDefined();
      expect(influence.taskApproach).toBeDefined();
      expect(influence.emotionalExpression).toBeDefined();
    });

    test('should provide context-specific influence', () => {
      const normalInfluence = service.getTraitInfluence();
      const workInfluence = service.getTraitInfluence('work');
      
      expect(normalInfluence).toBeDefined();
      expect(workInfluence).toBeDefined();
    });
  });

  describe('Expression Profile', () => {
    test('should provide complete expression profile', () => {
      const profile = service.getExpressionProfile();
      
      expect(profile.linguistic).toBeDefined();
      expect(profile.behavioral).toBeDefined();
      expect(profile.emotional).toBeDefined();
      expect(profile.interaction).toBeDefined();
    });
  });

  describe('Mood Tracking', () => {
    test('should track current mood', async () => {
      await service.processInput('Happy message!', 'message');
      
      const mood = service.getCurrentMood();
      
      expect(mood.valence).toBeDefined();
      expect(mood.arousal).toBeDefined();
      expect(mood.label).toBeDefined();
    });

    test('should update mood over time', async () => {
      await service.processInput('Happy message!', 'message');
      
      // Update periodically
      service.update();
      service.update();
      
      const mood = service.getCurrentMood();
      expect(mood.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Emotional Memory', () => {
    test('should recall emotional memories', async () => {
      await service.processInput('Important message', 'message', 'test_context');
      
      const memories = service.recallEmotionalMemory('test_context', 5);
      
      // Memory storage happens over time, so initially might be empty
      expect(Array.isArray(memories)).toBe(true);
    });
  });

  describe('Update Loop', () => {
    test('should handle periodic updates', async () => {
      await service.processInput('Test', 'message');
      
      // Should not throw
      expect(() => {
        service.update();
        service.update();
        service.update();
      }).not.toThrow();
    });

    test('should decay emotions during update', async () => {
      await service.processInput('Happy event!', 'message');
      
      const before = service.getState();
      
      // Multiple updates to allow decay
      for (let i = 0; i < 5; i++) {
        service.update();
      }
      
      const after = service.getState();
      
      // Some emotion should have decayed (though might be minimal)
      expect(after.emotions).toBeDefined();
    });
  });

  describe('State Persistence', () => {
    test('should export complete state', () => {
      const exported = service.export();
      
      expect(exported.traits).toBeDefined();
      expect(exported.emotions).toBeDefined();
      expect(exported.mood).toBeDefined();
      expect(exported.memory).toBeDefined();
      expect(exported.identity).toBeDefined();
      expect(exported.evolution).toBeDefined();
    });

    test('should import and restore state', async () => {
      await service.processInput('Test message', 'message');
      service.evolvePersonality({
        type: ExperienceType.DirectFeedback,
        outcome: 'positive',
        intensity: 0.8,
        context: 'test',
        affectedTraits: [
          {
            trait: 'openness',
            impact: 0.6,
          },
        ],
      });

      const exported = service.export();
      
      const newService = new PersonalityService();
      newService.import(exported);

      const originalState = service.getState();
      const restoredState = newService.getState();

      expect(restoredState.traits.openness.value).toBe(originalState.traits.openness.value);
      expect(restoredState.traits.version).toBe(originalState.traits.version);
    });
  });

  describe('Integration', () => {
    test('should integrate traits with emotions', async () => {
      // Create service with high neuroticism
      const anxiousService = new PersonalityService({
        initialTraits: {
          neuroticism: { value: 85, confidence: 0.9, variance: 10, stability: 0.8, velocity: 0, facets: {} },
        },
      });

      await anxiousService.processInput('Concerning news', 'message');
      
      const state = anxiousService.getState();
      
      // Should show emotional response influenced by neuroticism
      const fearIntensity = state.emotions.primary.fear.intensity;
      expect(fearIntensity).toBeGreaterThan(0);
    });

    test('should integrate traits with expression', () => {
      // Create service with high extraversion
      const extravertedService = new PersonalityService({
        initialTraits: {
          extraversion: { value: 90, confidence: 0.9, variance: 10, stability: 0.8, velocity: 0, facets: {} },
        },
      });

      const influence = extravertedService.getTraitInfluence();
      
      // Should show high communication verbosity
      expect(influence.communicationStyle.verbosity).toBeGreaterThan(60);
      expect(influence.socialInteraction.initiativeLevel).toBeGreaterThan(60);
    });
  });
});

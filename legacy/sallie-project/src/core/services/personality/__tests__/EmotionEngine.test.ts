/**
 * EmotionEngine Tests
 */

import { EmotionEngine } from '../emotions/EmotionEngine';
import { createDefaultTraitVector } from '../models/TraitVector';
import { PrimaryEmotion, ComplexEmotion } from '../models/EmotionVector';

describe('EmotionEngine', () => {
  let engine: EmotionEngine;
  let traits: any;

  beforeEach(() => {
    traits = createDefaultTraitVector();
    engine = new EmotionEngine(traits);
  });

  describe('Initialization', () => {
    test('should initialize with default emotions', () => {
      const emotions = engine.getCurrentEmotions();
      
      expect(emotions.primary).toBeDefined();
      expect(emotions.complex).toBeDefined();
      expect(emotions.dominantEmotion).toBeNull();
    });
  });

  describe('Stimulus Processing', () => {
    test('should process positive stimulus', () => {
      const updates = engine.processStimulus({
        stimulus: 'Great news!',
        type: 'message',
        valence: 80,
        arousal: 70,
        significance: 0.8,
      });

      expect(updates.length).toBeGreaterThan(0);
      
      const emotions = engine.getCurrentEmotions();
      expect(emotions.primary[PrimaryEmotion.Joy].intensity).toBeGreaterThan(0);
    });

    test('should process negative stimulus', () => {
      const updates = engine.processStimulus({
        stimulus: 'Bad news',
        type: 'message',
        valence: -70,
        arousal: 60,
        significance: 0.7,
      });

      expect(updates.length).toBeGreaterThan(0);
      
      const emotions = engine.getCurrentEmotions();
      const negativeEmotions = [
        emotions.primary[PrimaryEmotion.Sadness].intensity,
        emotions.primary[PrimaryEmotion.Anger].intensity,
      ];
      
      expect(Math.max(...negativeEmotions)).toBeGreaterThan(0);
    });

    test('should update dominant emotion', () => {
      engine.processStimulus({
        stimulus: 'Amazing!',
        type: 'message',
        valence: 90,
        arousal: 85,
        significance: 0.9,
      });

      const emotions = engine.getCurrentEmotions();
      expect(emotions.dominantEmotion).not.toBeNull();
    });
  });

  describe('Emotion Decay', () => {
    test('should decay emotions over time', () => {
      engine.processStimulus({
        stimulus: 'Happy news',
        type: 'message',
        valence: 80,
        arousal: 70,
        significance: 0.8,
      });

      const before = engine.getCurrentEmotions().primary[PrimaryEmotion.Joy].intensity;
      
      // Decay for 5 seconds
      engine.decay(5000);

      const after = engine.getCurrentEmotions().primary[PrimaryEmotion.Joy].intensity;
      expect(after).toBeLessThan(before);
    });

    test('should reset low-intensity emotions', () => {
      engine.processStimulus({
        stimulus: 'Mild event',
        type: 'message',
        valence: 20,
        arousal: 15,
        significance: 0.2,
      });

      // Decay for long time
      for (let i = 0; i < 10; i++) {
        engine.decay(10000);
      }

      const emotions = engine.getCurrentEmotions();
      const allIntensities = [
        ...Object.values(emotions.primary),
        ...Object.values(emotions.complex),
      ].map((e) => e.intensity);

      const maxIntensity = Math.max(...allIntensities);
      expect(maxIntensity).toBeLessThan(5);
    });
  });

  describe('Emotion Blending', () => {
    test('should blend multiple emotions', () => {
      engine.processStimulus({
        stimulus: 'Mixed feelings',
        type: 'message',
        valence: 50,
        arousal: 60,
        significance: 0.7,
      });

      const blend = engine.blendEmotions([
        { emotion: PrimaryEmotion.Joy, weight: 0.6 },
        { emotion: PrimaryEmotion.Surprise, weight: 0.4 },
      ]);

      expect(blend.resultantIntensity).toBeGreaterThanOrEqual(0);
      expect(blend.resultantValence).toBeGreaterThanOrEqual(-100);
      expect(blend.resultantValence).toBeLessThanOrEqual(100);
    });
  });

  describe('Personality Influence', () => {
    test('should be influenced by neuroticism', () => {
      // High neuroticism
      const highNTraits = { ...traits, neuroticism: { ...traits.neuroticism, value: 90 } };
      const highNEngine = new EmotionEngine(highNTraits);

      highNEngine.processStimulus({
        stimulus: 'Concerning news',
        type: 'message',
        valence: -60,
        arousal: 70,
        significance: 0.7,
      });

      // Low neuroticism
      const lowNTraits = { ...traits, neuroticism: { ...traits.neuroticism, value: 20 } };
      const lowNEngine = new EmotionEngine(lowNTraits);

      lowNEngine.processStimulus({
        stimulus: 'Concerning news',
        type: 'message',
        valence: -60,
        arousal: 70,
        significance: 0.7,
      });

      const highNEmotions = highNEngine.getCurrentEmotions();
      const lowNEmotions = lowNEngine.getCurrentEmotions();

      // High neuroticism should have more intense negative emotions
      const highNIntensity = highNEmotions.primary[PrimaryEmotion.Fear].intensity;
      const lowNIntensity = lowNEmotions.primary[PrimaryEmotion.Fear].intensity;

      expect(highNIntensity).toBeGreaterThan(lowNIntensity);
    });
  });

  describe('State Management', () => {
    test('should export and import state', () => {
      engine.processStimulus({
        stimulus: 'Happy event',
        type: 'message',
        valence: 80,
        arousal: 70,
        significance: 0.8,
      });

      const exported = engine.export();
      const newEngine = new EmotionEngine(traits);
      newEngine.import(exported);

      const original = engine.getCurrentEmotions();
      const imported = newEngine.getCurrentEmotions();

      expect(imported.primary[PrimaryEmotion.Joy].intensity).toBe(
        original.primary[PrimaryEmotion.Joy].intensity
      );
    });

    test('should reset to baseline', () => {
      engine.processStimulus({
        stimulus: 'Event',
        type: 'message',
        valence: 80,
        arousal: 70,
        significance: 0.8,
      });

      engine.reset();

      const emotions = engine.getCurrentEmotions();
      const allIntensities = [
        ...Object.values(emotions.primary),
        ...Object.values(emotions.complex),
      ].map((e) => e.intensity);

      expect(Math.max(...allIntensities)).toBe(0);
    });
  });

  describe('Emotional State Summary', () => {
    test('should provide accurate emotional state', () => {
      engine.processStimulus({
        stimulus: 'Happy event',
        type: 'message',
        valence: 70,
        arousal: 60,
        significance: 0.8,
      });

      const state = engine.getEmotionalState();
      
      expect(state.dominant).toBeDefined();
      expect(state.averageValence).toBeGreaterThan(0);
      expect(state.averageArousal).toBeGreaterThan(0);
      expect(state.clarity).toBeGreaterThanOrEqual(0);
      expect(state.clarity).toBeLessThanOrEqual(1);
    });
  });
});

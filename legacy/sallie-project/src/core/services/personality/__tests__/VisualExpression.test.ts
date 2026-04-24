/**
 * VisualExpression Tests
 */

import { VisualExpression } from '../expression/VisualExpression';
import { createDefaultTraitVector } from '../models/TraitVector';
import { createDefaultEmotionVector, PrimaryEmotion } from '../models/EmotionVector';

describe('VisualExpression', () => {
  let visual: VisualExpression;
  let traits: any;

  beforeEach(() => {
    traits = createDefaultTraitVector();
    visual = new VisualExpression(traits);
  });

  describe('Emotion to Visual Mapping', () => {
    test('should map emotions to visual profile', () => {
      const emotions = createDefaultEmotionVector();
      emotions.dominantEmotion = PrimaryEmotion.Joy;
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.facial).toBeDefined();
      expect(profile.body).toBeDefined();
      expect(profile.animation).toBeDefined();
      expect(profile.color).toBeDefined();
    });

    test('should provide neutral expression for no dominant emotion', () => {
      const emotions = createDefaultEmotionVector();
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.facial.name).toBe('neutral');
    });

    test('should modulate intensity based on personality', () => {
      const emotions = createDefaultEmotionVector();
      emotions.dominantEmotion = PrimaryEmotion.Joy;
      emotions.primary[PrimaryEmotion.Joy].intensity = 80;
      
      const highE = { ...traits, extraversion: { ...traits.extraversion, value: 90 } };
      const visualHighE = new VisualExpression(highE);
      
      const profile = visualHighE.mapEmotionToVisual(emotions);
      expect(profile.facial.intensity).toBeGreaterThan(0);
    });
  });

  describe('Facial Expression', () => {
    test('should provide appropriate facial features for joy', () => {
      const emotions = createDefaultEmotionVector();
      emotions.dominantEmotion = PrimaryEmotion.Joy;
      emotions.primary[PrimaryEmotion.Joy].intensity = 70;
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.facial.mouth).toBe('smile');
    });

    test('should provide appropriate facial features for sadness', () => {
      const emotions = createDefaultEmotionVector();
      emotions.dominantEmotion = PrimaryEmotion.Sadness;
      emotions.primary[PrimaryEmotion.Sadness].intensity = 60;
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.facial.mouth).toBe('frown');
    });
  });

  describe('Animation Parameters', () => {
    test('should calculate animation parameters', () => {
      const emotions = createDefaultEmotionVector();
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.animation.speed).toBeGreaterThanOrEqual(0);
      expect(profile.animation.amplitude).toBeGreaterThanOrEqual(0);
      expect(profile.animation.smoothness).toBeGreaterThanOrEqual(0);
    });

    test('should adjust speed based on arousal', () => {
      const emotions = createDefaultEmotionVector();
      emotions.primary[PrimaryEmotion.Joy].intensity = 80;
      emotions.primary[PrimaryEmotion.Joy].arousal = 90;
      emotions.dominantEmotion = PrimaryEmotion.Joy;
      
      const profile = visual.mapEmotionToVisual(emotions);
      expect(profile.animation.speed).toBeGreaterThan(40);
    });
  });

  describe('Color Theme', () => {
    test('should provide warm colors for positive emotions', () => {
      const emotions = createDefaultEmotionVector();
      emotions.primary[PrimaryEmotion.Joy].intensity = 80;
      emotions.primary[PrimaryEmotion.Joy].valence = 80;
      emotions.dominantEmotion = PrimaryEmotion.Joy;
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.color.emotionalTint).toBeGreaterThan(0);
    });

    test('should provide cool colors for negative emotions', () => {
      const emotions = createDefaultEmotionVector();
      emotions.primary[PrimaryEmotion.Sadness].intensity = 70;
      emotions.primary[PrimaryEmotion.Sadness].valence = -70;
      emotions.dominantEmotion = PrimaryEmotion.Sadness;
      
      const profile = visual.mapEmotionToVisual(emotions);
      
      expect(profile.color.emotionalTint).toBeLessThan(0);
    });
  });
});

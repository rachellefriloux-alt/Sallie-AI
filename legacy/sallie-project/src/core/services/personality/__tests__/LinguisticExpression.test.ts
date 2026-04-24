/**
 * LinguisticExpression Tests
 */

import { LinguisticExpression } from '../expression/LinguisticExpression';
import { createDefaultTraitVector } from '../models/TraitVector';
import { PrimaryEmotion, ComplexEmotion } from '../models/EmotionVector';

describe('LinguisticExpression', () => {
  let linguistic: LinguisticExpression;
  let traits: any;

  beforeEach(() => {
    traits = createDefaultTraitVector();
    linguistic = new LinguisticExpression(traits);
  });

  describe('Verbal Expression', () => {
    test('should generate expression for joy', () => {
      const expression = linguistic.getVerbalExpression(PrimaryEmotion.Joy, 70);
      expect(expression).toBeTruthy();
      expect(typeof expression).toBe('string');
    });

    test('should generate expression for sadness', () => {
      const expression = linguistic.getVerbalExpression(PrimaryEmotion.Sadness, 50);
      expect(expression).toBeTruthy();
    });

    test('should generate expression for gratitude', () => {
      const expression = linguistic.getVerbalExpression(ComplexEmotion.Gratitude, 80);
      expect(expression).toBeTruthy();
    });

    test('should vary by intensity', () => {
      const lowIntensity = linguistic.getVerbalExpression(PrimaryEmotion.Joy, 20);
      const highIntensity = linguistic.getVerbalExpression(PrimaryEmotion.Joy, 90);
      
      expect(lowIntensity).not.toBe(highIntensity);
    });
  });

  describe('Linguistic Pattern', () => {
    test('should calculate linguistic pattern', () => {
      const pattern = linguistic.getLinguisticPattern();
      
      expect(pattern.vocabularyComplexity).toBeGreaterThanOrEqual(0);
      expect(pattern.vocabularyComplexity).toBeLessThanOrEqual(100);
      expect(pattern.formalityLevel).toBeGreaterThanOrEqual(0);
      expect(pattern.emotionalRichness).toBeGreaterThanOrEqual(0);
    });

    test('should reflect high openness in complexity', () => {
      const highOpenness = { ...traits, openness: { ...traits.openness, value: 90 } };
      const lingHighO = new LinguisticExpression(highOpenness);
      
      const pattern = lingHighO.getLinguisticPattern();
      expect(pattern.vocabularyComplexity).toBeGreaterThan(60);
    });
  });

  describe('Topic Preferences', () => {
    test('should provide topic preferences', () => {
      const preferences = linguistic.getTopicPreferences();
      
      expect(Array.isArray(preferences)).toBe(true);
      expect(preferences.length).toBeGreaterThan(0);
      
      preferences.forEach((pref) => {
        expect(pref.category).toBeTruthy();
        expect(pref.affinity).toBeGreaterThanOrEqual(0);
        expect(pref.affinity).toBeLessThanOrEqual(100);
      });
    });

    test('should reflect extraversion in social topics', () => {
      const highE = { ...traits, extraversion: { ...traits.extraversion, value: 90 } };
      const lingHighE = new LinguisticExpression(highE);
      
      const prefs = lingHighE.getTopicPreferences();
      const socialPref = prefs.find((p) => p.category === 'social_topics');
      
      expect(socialPref).toBeDefined();
      expect(socialPref!.affinity).toBeGreaterThan(60);
    });
  });
});

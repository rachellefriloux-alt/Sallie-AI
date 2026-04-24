/**
 * Emotion Decay System
 * Manages natural emotion decay and recovery
 */

import { EmotionVector, PrimaryEmotion, ComplexEmotion, EmotionalBaseline } from '../models/EmotionVector';
import { TraitVector } from '../models/TraitVector';

export class EmotionDecaySystem {
  private baseline: EmotionalBaseline;
  private decayRates: Map<string, number>;

  constructor(baseline: EmotionalBaseline, personalityTraits: TraitVector) {
    this.baseline = baseline;
    this.decayRates = this.initializeDecayRates(personalityTraits);
  }

  private initializeDecayRates(traits: TraitVector): Map<string, number> {
    const rates = new Map<string, number>();
    const N = traits.neuroticism.value / 100;
    const C = traits.conscientiousness.value / 100;
    
    // Negative emotions decay slower for high neuroticism
    rates.set(PrimaryEmotion.Sadness, 0.92 - N * 0.1);
    rates.set(PrimaryEmotion.Anger, 0.94 - N * 0.08);
    rates.set(PrimaryEmotion.Fear, 0.93 - N * 0.09);
    
    // Positive emotions decay based on conscientiousness
    rates.set(PrimaryEmotion.Joy, 0.96 - C * 0.05);
    rates.set(ComplexEmotion.Contentment, 0.98 - C * 0.03);
    
    return rates;
  }

  applyDecay(emotions: EmotionVector, deltaTime: number): void {
    const seconds = deltaTime / 1000;
    
    Object.values(PrimaryEmotion).forEach((emotion) => {
      const rate = this.decayRates.get(emotion) || 0.95;
      const current = emotions.primary[emotion];
      current.intensity *= Math.pow(rate, seconds);
      
      // Move toward baseline
      const baselineVal = this.baseline.primaryDistribution[emotion];
      current.intensity += (baselineVal - current.intensity) * 0.01 * seconds;
    });

    Object.values(ComplexEmotion).forEach((emotion) => {
      const rate = this.decayRates.get(emotion) || 0.96;
      const current = emotions.complex[emotion];
      current.intensity *= Math.pow(rate, seconds);
    });
  }

  updateBaseline(baseline: EmotionalBaseline): void {
    this.baseline = baseline;
  }
}

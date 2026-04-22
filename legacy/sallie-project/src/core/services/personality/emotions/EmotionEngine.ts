/**
 * Emotion Engine
 * Core emotional processing with primary and complex emotions
 */

import {
  EmotionVector,
  PrimaryEmotion,
  ComplexEmotion,
  EmotionIntensity,
  EmotionBlend,
  createDefaultEmotionVector,
  createDefaultEmotionIntensity,
} from '../models/EmotionVector';
import { TraitVector } from '../models/TraitVector';

export interface EmotionGenerationInput {
  stimulus: string;
  type: 'message' | 'event' | 'memory' | 'context';
  valence: number; // -100 to +100
  arousal: number; // 0-100
  significance: number; // 0-1
  context?: string;
}

export interface EmotionUpdate {
  emotion: PrimaryEmotion | ComplexEmotion;
  intensityDelta: number;
  valenceDelta: number;
  arousalDelta: number;
}

export class EmotionEngine {
  private currentEmotions: EmotionVector;
  private personalityTraits: TraitVector;
  private readonly DECAY_RATE = 0.95; // Per update cycle
  private readonly MIN_INTENSITY = 1;

  constructor(personalityTraits: TraitVector, initialEmotions?: EmotionVector) {
    this.personalityTraits = personalityTraits;
    this.currentEmotions = initialEmotions || createDefaultEmotionVector();
  }

  /**
   * Update personality traits
   */
  updatePersonality(traits: TraitVector): void {
    this.personalityTraits = traits;
  }

  /**
   * Get current emotion vector
   */
  getCurrentEmotions(): EmotionVector {
    return JSON.parse(JSON.stringify(this.currentEmotions));
  }

  /**
   * Process stimulus and generate emotional response
   */
  processStimulus(input: EmotionGenerationInput): EmotionUpdate[] {
    const updates: EmotionUpdate[] = [];

    // Determine which emotions should be triggered
    const triggeredEmotions = this.identifyTriggeredEmotions(input);

    // Calculate intensity based on personality
    triggeredEmotions.forEach((emotion) => {
      const intensity = this.calculateIntensity(emotion, input);
      const valenceDelta = this.calculateValenceDelta(emotion, input);
      const arousalDelta = this.calculateArousalDelta(emotion, input);

      if (intensity > this.MIN_INTENSITY) {
        updates.push({
          emotion,
          intensityDelta: intensity,
          valenceDelta,
          arousalDelta,
        });

        this.applyEmotionUpdate(emotion, intensity, valenceDelta, arousalDelta);
      }
    });

    // Update dominant emotion
    this.updateDominantEmotion();

    return updates;
  }

  /**
   * Identify which emotions should be triggered by stimulus
   */
  private identifyTriggeredEmotions(
    input: EmotionGenerationInput
  ): Array<PrimaryEmotion | ComplexEmotion> {
    const emotions: Array<PrimaryEmotion | ComplexEmotion> = [];

    // Map valence and arousal to emotions
    if (input.valence > 50 && input.arousal > 60) {
      emotions.push(PrimaryEmotion.Joy);
    } else if (input.valence > 30 && input.arousal < 40) {
      emotions.push(ComplexEmotion.Contentment);
    } else if (input.valence < -50) {
      // Negative emotions
      if (input.arousal > 60) {
        emotions.push(PrimaryEmotion.Anger);
      } else {
        emotions.push(PrimaryEmotion.Sadness);
      }
    } else if (input.valence < -20 && input.arousal > 60) {
      // Moderate negative with high arousal
      emotions.push(PrimaryEmotion.Fear);
      emotions.push(ComplexEmotion.Frustration);
    }

    // Add surprise if arousal is very high
    if (input.arousal > 80) {
      emotions.push(PrimaryEmotion.Surprise);
    }

    // Context-specific complex emotions
    if (input.type === 'message' && input.valence > 60) {
      emotions.push(ComplexEmotion.Gratitude);
    }

    if (input.significance > 0.8 && input.valence > 50) {
      emotions.push(ComplexEmotion.Pride);
    }

    return emotions;
  }

  /**
   * Calculate emotion intensity based on personality
   */
  private calculateIntensity(
    emotion: PrimaryEmotion | ComplexEmotion,
    input: EmotionGenerationInput
  ): number {
    // Base intensity from stimulus
    let intensity = input.arousal * input.significance;

    // Personality modulation
    const N = this.personalityTraits.neuroticism.value / 100;
    const E = this.personalityTraits.extraversion.value / 100;
    const O = this.personalityTraits.openness.value / 100;

    // Neuroticism increases intensity of negative emotions
    if (this.isNegativeEmotion(emotion)) {
      intensity *= 1 + N * 0.5;
    }

    // Extraversion increases intensity of social emotions
    if (this.isSocialEmotion(emotion)) {
      intensity *= 1 + E * 0.3;
    }

    // Openness increases emotional range
    intensity *= 1 + O * 0.2;

    return Math.min(100, intensity);
  }

  /**
   * Calculate valence delta
   */
  private calculateValenceDelta(
    emotion: PrimaryEmotion | ComplexEmotion,
    input: EmotionGenerationInput
  ): number {
    const baseValence = this.getEmotionBaseValence(emotion);
    return (baseValence * input.significance * input.arousal) / 100;
  }

  /**
   * Calculate arousal delta
   */
  private calculateArousalDelta(
    emotion: PrimaryEmotion | ComplexEmotion,
    input: EmotionGenerationInput
  ): number {
    const baseArousal = this.getEmotionBaseArousal(emotion);
    return (baseArousal * input.significance) / 2;
  }

  /**
   * Apply emotion update to current state
   */
  private applyEmotionUpdate(
    emotion: PrimaryEmotion | ComplexEmotion,
    intensityDelta: number,
    valenceDelta: number,
    arousalDelta: number
  ): void {
    const isPrimary = Object.values(PrimaryEmotion).includes(emotion as PrimaryEmotion);
    const emotionSet = isPrimary ? this.currentEmotions.primary : this.currentEmotions.complex;
    const emotionKey = emotion as keyof typeof emotionSet;
    const current = emotionSet[emotionKey] as EmotionIntensity;

    // Update intensity
    current.intensity = Math.min(100, current.intensity + intensityDelta);

    // Update valence
    current.valence = Math.max(-100, Math.min(100, current.valence + valenceDelta));

    // Update arousal
    current.arousal = Math.min(100, current.arousal + arousalDelta);

    // Reset duration and onset
    current.duration = 0;
    current.onset = new Date();

    // Improve clarity
    current.clarity = Math.min(1, current.clarity + 0.1);
  }

  /**
   * Update dominant emotion
   */
  private updateDominantEmotion(): void {
    let maxIntensity = 0;
    let dominant: PrimaryEmotion | ComplexEmotion | null = null;

    // Check primary emotions
    Object.entries(this.currentEmotions.primary).forEach(([emotion, intensity]) => {
      if (intensity.intensity > maxIntensity) {
        maxIntensity = intensity.intensity;
        dominant = emotion as PrimaryEmotion;
      }
    });

    // Check complex emotions
    Object.entries(this.currentEmotions.complex).forEach(([emotion, intensity]) => {
      if (intensity.intensity > maxIntensity) {
        maxIntensity = intensity.intensity;
        dominant = emotion as ComplexEmotion;
      }
    });

    this.currentEmotions.dominantEmotion = maxIntensity > 10 ? dominant : null;
  }

  /**
   * Apply emotion decay over time
   */
  decay(deltaTime: number): void {
    const decayFactor = Math.pow(this.DECAY_RATE, deltaTime / 1000);

    // Decay primary emotions
    Object.values(PrimaryEmotion).forEach((emotion) => {
      const current = this.currentEmotions.primary[emotion];
      current.intensity *= decayFactor;
      current.duration += deltaTime;

      if (current.intensity < this.MIN_INTENSITY) {
        Object.assign(current, createDefaultEmotionIntensity());
      }
    });

    // Decay complex emotions
    Object.values(ComplexEmotion).forEach((emotion) => {
      const current = this.currentEmotions.complex[emotion];
      current.intensity *= decayFactor;
      current.duration += deltaTime;

      if (current.intensity < this.MIN_INTENSITY) {
        Object.assign(current, createDefaultEmotionIntensity());
      }
    });

    this.updateDominantEmotion();
  }

  /**
   * Blend multiple emotions
   */
  blendEmotions(emotions: Array<{
    emotion: PrimaryEmotion | ComplexEmotion;
    weight: number;
  }>): EmotionBlend {
    let totalIntensity = 0;
    let totalValence = 0;
    let totalArousal = 0;
    let totalWeight = 0;

    emotions.forEach(({ emotion, weight }) => {
      const isPrimary = Object.values(PrimaryEmotion).includes(emotion as PrimaryEmotion);
      const emotionSet = isPrimary ? this.currentEmotions.primary : this.currentEmotions.complex;
      const current = emotionSet[emotion as keyof typeof emotionSet] as EmotionIntensity;

      totalIntensity += current.intensity * weight;
      totalValence += current.valence * weight;
      totalArousal += current.arousal * weight;
      totalWeight += weight;
    });

    return {
      emotions,
      resultantIntensity: totalIntensity / totalWeight,
      resultantValence: totalValence / totalWeight,
      resultantArousal: totalArousal / totalWeight,
    };
  }

  /**
   * Check if emotion is negative
   */
  private isNegativeEmotion(emotion: PrimaryEmotion | ComplexEmotion): boolean {
    const negative = [
      PrimaryEmotion.Sadness,
      PrimaryEmotion.Anger,
      PrimaryEmotion.Fear,
      PrimaryEmotion.Disgust,
      ComplexEmotion.Guilt,
      ComplexEmotion.Shame,
      ComplexEmotion.Jealousy,
      ComplexEmotion.Frustration,
    ];
    return negative.includes(emotion as any);
  }

  /**
   * Check if emotion is social
   */
  private isSocialEmotion(emotion: PrimaryEmotion | ComplexEmotion): boolean {
    const social = [
      ComplexEmotion.Love,
      ComplexEmotion.Gratitude,
      ComplexEmotion.Pride,
      ComplexEmotion.Shame,
    ];
    return social.includes(emotion as any);
  }

  /**
   * Get base valence for emotion
   */
  private getEmotionBaseValence(emotion: PrimaryEmotion | ComplexEmotion): number {
    const valences: Record<string, number> = {
      [PrimaryEmotion.Joy]: 80,
      [PrimaryEmotion.Sadness]: -70,
      [PrimaryEmotion.Anger]: -60,
      [PrimaryEmotion.Fear]: -50,
      [PrimaryEmotion.Disgust]: -40,
      [PrimaryEmotion.Surprise]: 0,
      [ComplexEmotion.Love]: 90,
      [ComplexEmotion.Gratitude]: 70,
      [ComplexEmotion.Pride]: 60,
      [ComplexEmotion.Guilt]: -50,
      [ComplexEmotion.Jealousy]: -40,
      [ComplexEmotion.Hope]: 50,
      [ComplexEmotion.Shame]: -60,
      [ComplexEmotion.Nostalgia]: 20,
      [ComplexEmotion.Contentment]: 40,
      [ComplexEmotion.Frustration]: -30,
    };
    return valences[emotion] || 0;
  }

  /**
   * Get base arousal for emotion
   */
  private getEmotionBaseArousal(emotion: PrimaryEmotion | ComplexEmotion): number {
    const arousals: Record<string, number> = {
      [PrimaryEmotion.Joy]: 70,
      [PrimaryEmotion.Sadness]: 30,
      [PrimaryEmotion.Anger]: 80,
      [PrimaryEmotion.Fear]: 85,
      [PrimaryEmotion.Disgust]: 50,
      [PrimaryEmotion.Surprise]: 90,
      [ComplexEmotion.Love]: 60,
      [ComplexEmotion.Gratitude]: 50,
      [ComplexEmotion.Pride]: 55,
      [ComplexEmotion.Guilt]: 60,
      [ComplexEmotion.Jealousy]: 70,
      [ComplexEmotion.Hope]: 45,
      [ComplexEmotion.Shame]: 65,
      [ComplexEmotion.Nostalgia]: 40,
      [ComplexEmotion.Contentment]: 25,
      [ComplexEmotion.Frustration]: 75,
    };
    return arousals[emotion] || 50;
  }

  /**
   * Get overall emotional state summary
   */
  getEmotionalState(): {
    dominant: PrimaryEmotion | ComplexEmotion | null;
    averageValence: number;
    averageArousal: number;
    clarity: number;
  } {
    let totalValence = 0;
    let totalArousal = 0;
    let count = 0;

    // Sum all active emotions
    [...Object.values(this.currentEmotions.primary), ...Object.values(this.currentEmotions.complex)].forEach(
      (emotion) => {
        if (emotion.intensity > this.MIN_INTENSITY) {
          totalValence += emotion.valence * (emotion.intensity / 100);
          totalArousal += emotion.arousal * (emotion.intensity / 100);
          count++;
        }
      }
    );

    return {
      dominant: this.currentEmotions.dominantEmotion,
      averageValence: count > 0 ? totalValence / count : 0,
      averageArousal: count > 0 ? totalArousal / count : 0,
      clarity: this.currentEmotions.emotionalClarity,
    };
  }

  /**
   * Reset emotions to baseline
   */
  reset(): void {
    this.currentEmotions = createDefaultEmotionVector();
  }

  /**
   * Export emotion state
   */
  export(): EmotionVector {
    return JSON.parse(JSON.stringify(this.currentEmotions));
  }

  /**
   * Import emotion state
   */
  import(emotions: EmotionVector): void {
    this.currentEmotions = JSON.parse(JSON.stringify(emotions));
  }
}

/**
 * Visual Expression
 * Maps emotions to facial expressions, body language, and animation parameters
 */

import { PrimaryEmotion, ComplexEmotion, EmotionVector } from '../models/EmotionVector';
import { TraitVector } from '../models/TraitVector';

export interface FacialExpression {
  name: string;
  eyebrows: 'raised' | 'neutral' | 'furrowed' | 'relaxed';
  eyes: 'wide' | 'normal' | 'squinted' | 'closed';
  mouth: 'smile' | 'neutral' | 'frown' | 'open' | 'grin';
  intensity: number; // 0-100
}

export interface BodyLanguage {
  posture: 'upright' | 'slouched' | 'leaning_forward' | 'leaning_back' | 'tense';
  gesture: 'open' | 'closed' | 'animated' | 'restrained' | 'expansive';
  proximity: 'close' | 'normal' | 'distant';
  movement: 'still' | 'slight' | 'moderate' | 'active' | 'fidgeting';
}

export interface AnimationParameters {
  speed: number; // 0-100, how quickly animations play
  amplitude: number; // 0-100, how large movements are
  frequency: number; // 0-100, how often animations trigger
  smoothness: number; // 0-100, how smooth transitions are
  idleAnimation: string;
  activeAnimation: string;
}

export interface ColorTheme {
  primary: string; // Hex color
  secondary: string;
  accent: string;
  background: string;
  emotionalTint: number; // -100 to 100, warm to cool
}

export interface VisualExpressionProfile {
  facial: FacialExpression;
  body: BodyLanguage;
  animation: AnimationParameters;
  color: ColorTheme;
}

export class VisualExpression {
  private traitVector: TraitVector;
  private facialExpressionMap: Map<string, FacialExpression>;
  private bodyLanguageMap: Map<string, BodyLanguage>;

  constructor(traitVector: TraitVector) {
    this.traitVector = traitVector;
    this.facialExpressionMap = this.initializeFacialExpressions();
    this.bodyLanguageMap = this.initializeBodyLanguage();
  }

  /**
   * Initialize facial expression mappings for all emotions
   */
  private initializeFacialExpressions(): Map<string, FacialExpression> {
    const expressions = new Map<string, FacialExpression>();

    // Joy
    expressions.set(PrimaryEmotion.Joy, {
      name: 'happy',
      eyebrows: 'raised',
      eyes: 'normal',
      mouth: 'smile',
      intensity: 70,
    });

    // Sadness
    expressions.set(PrimaryEmotion.Sadness, {
      name: 'sad',
      eyebrows: 'furrowed',
      eyes: 'normal',
      mouth: 'frown',
      intensity: 60,
    });

    // Anger
    expressions.set(PrimaryEmotion.Anger, {
      name: 'angry',
      eyebrows: 'furrowed',
      eyes: 'squinted',
      mouth: 'frown',
      intensity: 80,
    });

    // Fear
    expressions.set(PrimaryEmotion.Fear, {
      name: 'fearful',
      eyebrows: 'raised',
      eyes: 'wide',
      mouth: 'open',
      intensity: 75,
    });

    // Disgust
    expressions.set(PrimaryEmotion.Disgust, {
      name: 'disgusted',
      eyebrows: 'furrowed',
      eyes: 'squinted',
      mouth: 'frown',
      intensity: 65,
    });

    // Surprise
    expressions.set(PrimaryEmotion.Surprise, {
      name: 'surprised',
      eyebrows: 'raised',
      eyes: 'wide',
      mouth: 'open',
      intensity: 85,
    });

    // Complex emotions
    expressions.set(ComplexEmotion.Love, {
      name: 'loving',
      eyebrows: 'relaxed',
      eyes: 'normal',
      mouth: 'smile',
      intensity: 80,
    });

    expressions.set(ComplexEmotion.Gratitude, {
      name: 'grateful',
      eyebrows: 'relaxed',
      eyes: 'normal',
      mouth: 'smile',
      intensity: 70,
    });

    expressions.set(ComplexEmotion.Pride, {
      name: 'proud',
      eyebrows: 'raised',
      eyes: 'normal',
      mouth: 'smile',
      intensity: 75,
    });

    expressions.set(ComplexEmotion.Contentment, {
      name: 'content',
      eyebrows: 'relaxed',
      eyes: 'normal',
      mouth: 'smile',
      intensity: 50,
    });

    return expressions;
  }

  /**
   * Initialize body language mappings
   */
  private initializeBodyLanguage(): Map<string, BodyLanguage> {
    const bodyLanguage = new Map<string, BodyLanguage>();

    bodyLanguage.set(PrimaryEmotion.Joy, {
      posture: 'upright',
      gesture: 'open',
      proximity: 'close',
      movement: 'active',
    });

    bodyLanguage.set(PrimaryEmotion.Sadness, {
      posture: 'slouched',
      gesture: 'closed',
      proximity: 'distant',
      movement: 'still',
    });

    bodyLanguage.set(PrimaryEmotion.Anger, {
      posture: 'tense',
      gesture: 'closed',
      proximity: 'normal',
      movement: 'moderate',
    });

    bodyLanguage.set(PrimaryEmotion.Fear, {
      posture: 'tense',
      gesture: 'closed',
      proximity: 'distant',
      movement: 'fidgeting',
    });

    bodyLanguage.set(ComplexEmotion.Contentment, {
      posture: 'upright',
      gesture: 'open',
      proximity: 'normal',
      movement: 'slight',
    });

    return bodyLanguage;
  }

  /**
   * Map emotions to visual expression
   */
  mapEmotionToVisual(emotions: EmotionVector): VisualExpressionProfile {
    const dominant = emotions.dominantEmotion;

    if (!dominant) {
      return this.getNeutralExpression();
    }

    const facial = this.getFacialExpression(dominant, emotions);
    const body = this.getBodyLanguage(dominant);
    const animation = this.getAnimationParameters(emotions);
    const color = this.getColorTheme(emotions);

    return { facial, body, animation, color };
  }

  /**
   * Get facial expression for emotion
   */
  private getFacialExpression(
    emotion: PrimaryEmotion | ComplexEmotion,
    emotions: EmotionVector
  ): FacialExpression {
    const baseExpression = this.facialExpressionMap.get(emotion);

    if (!baseExpression) {
      return this.getDefaultFacialExpression();
    }

    // Get emotion intensity
    const isPrimary = Object.values(PrimaryEmotion).includes(emotion as PrimaryEmotion);
    const emotionData = isPrimary
      ? emotions.primary[emotion as PrimaryEmotion]
      : emotions.complex[emotion as ComplexEmotion];

    // Modulate intensity based on personality
    const expressiveness = this.traitVector.extraversion.value / 100;
    const finalIntensity = baseExpression.intensity * (emotionData.intensity / 100) * (0.5 + expressiveness * 0.5);

    return {
      ...baseExpression,
      intensity: finalIntensity,
    };
  }

  /**
   * Get body language for emotion
   */
  private getBodyLanguage(emotion: PrimaryEmotion | ComplexEmotion): BodyLanguage {
    const baseLanguage = this.bodyLanguageMap.get(emotion);

    if (!baseLanguage) {
      return this.getDefaultBodyLanguage();
    }

    // Modulate based on personality
    const extraversion = this.traitVector.extraversion.value;
    const openness = this.traitVector.openness.value;

    // High extraversion: more open and close
    if (extraversion > 70) {
      baseLanguage.gesture = 'animated';
      baseLanguage.proximity = 'close';
    }

    // High openness: more expressive movement
    if (openness > 70) {
      baseLanguage.movement = baseLanguage.movement === 'still' ? 'slight' : 'active';
    }

    return baseLanguage;
  }

  /**
   * Get animation parameters based on emotions
   */
  private getAnimationParameters(emotions: EmotionVector): AnimationParameters {
    // Calculate average arousal
    let totalArousal = 0;
    let count = 0;

    [...Object.values(emotions.primary), ...Object.values(emotions.complex)].forEach((e) => {
      if (e.intensity > 5) {
        totalArousal += e.arousal;
        count++;
      }
    });

    const averageArousal = count > 0 ? totalArousal / count : 30;
    const extraversion = this.traitVector.extraversion.value;

    return {
      speed: 0.5 * averageArousal + 0.3 * extraversion + 20,
      amplitude: 0.6 * averageArousal + 0.2 * extraversion + 20,
      frequency: 0.4 * averageArousal + 0.4 * extraversion + 20,
      smoothness: 100 - 0.3 * averageArousal - 0.2 * this.traitVector.neuroticism.value,
      idleAnimation: averageArousal < 40 ? 'calm_breathing' : 'gentle_sway',
      activeAnimation: averageArousal > 60 ? 'energetic' : 'moderate',
    };
  }

  /**
   * Get color theme based on emotions
   */
  private getColorTheme(emotions: EmotionVector): ColorTheme {
    // Calculate average valence
    let totalValence = 0;
    let count = 0;

    [...Object.values(emotions.primary), ...Object.values(emotions.complex)].forEach((e) => {
      if (e.intensity > 5) {
        totalValence += e.valence;
        count++;
      }
    });

    const averageValence = count > 0 ? totalValence / count : 0;

    // Positive valence: warm colors, negative: cool colors
    if (averageValence > 40) {
      return {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FF6347',
        background: '#FFF8DC',
        emotionalTint: 60,
      };
    } else if (averageValence < -40) {
      return {
        primary: '#4A90E2',
        secondary: '#5B9BD5',
        accent: '#3A7BC8',
        background: '#E8F4F8',
        emotionalTint: -60,
      };
    } else {
      return {
        primary: '#7B68EE',
        secondary: '#9370DB',
        accent: '#8A2BE2',
        background: '#F0E6FF',
        emotionalTint: 0,
      };
    }
  }

  /**
   * Get neutral expression
   */
  private getNeutralExpression(): VisualExpressionProfile {
    return {
      facial: this.getDefaultFacialExpression(),
      body: this.getDefaultBodyLanguage(),
      animation: {
        speed: 40,
        amplitude: 30,
        frequency: 20,
        smoothness: 80,
        idleAnimation: 'calm_breathing',
        activeAnimation: 'moderate',
      },
      color: {
        primary: '#7B68EE',
        secondary: '#9370DB',
        accent: '#8A2BE2',
        background: '#F0E6FF',
        emotionalTint: 0,
      },
    };
  }

  /**
   * Get default facial expression
   */
  private getDefaultFacialExpression(): FacialExpression {
    return {
      name: 'neutral',
      eyebrows: 'neutral',
      eyes: 'normal',
      mouth: 'neutral',
      intensity: 50,
    };
  }

  /**
   * Get default body language
   */
  private getDefaultBodyLanguage(): BodyLanguage {
    return {
      posture: 'upright',
      gesture: 'open',
      proximity: 'normal',
      movement: 'slight',
    };
  }

  /**
   * Update trait vector
   */
  updateTraits(traitVector: TraitVector): void {
    this.traitVector = traitVector;
  }
}

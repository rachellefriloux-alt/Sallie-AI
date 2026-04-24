/**
 * Expression Mapper
 * Coordinates expression across linguistic, visual, and behavioral channels
 */

import { EmotionVector, PrimaryEmotion, ComplexEmotion } from '../models/EmotionVector';
import { BehaviorInfluence } from '../traits/TraitInfluenceMapper';

export interface ExpressionProfile {
  linguistic: LinguisticExpression;
  visual: VisualExpression;
  behavioral: BehavioralModulation;
}

export interface LinguisticExpression {
  tone: 'warm' | 'neutral' | 'formal' | 'playful' | 'serious';
  verbosity: 'concise' | 'moderate' | 'detailed';
  emotionIndicators: string[];
}

export interface VisualExpression {
  facialExpression: string;
  bodyLanguage: string;
  colorTheme: string;
  animationIntensity: number;
}

export interface BehavioralModulation {
  responseSpeed: number;
  initiativeLevel: number;
  assertiveness: number;
}

export class ExpressionMapper {
  mapExpression(emotions: EmotionVector, behavior: BehaviorInfluence, context?: string): ExpressionProfile {
    const dominant = emotions.dominantEmotion;
    
    return {
      linguistic: this.mapLinguistic(dominant, behavior),
      visual: this.mapVisual(dominant),
      behavioral: this.mapBehavioral(emotions, behavior),
    };
  }

  private mapLinguistic(emotion: PrimaryEmotion | ComplexEmotion | null, behavior: BehaviorInfluence): LinguisticExpression {
    let tone: 'warm' | 'neutral' | 'formal' | 'playful' | 'serious' = 'neutral';
    let emotionIndicators: string[] = [];

    if (emotion === PrimaryEmotion.Joy) {
      tone = 'playful';
      emotionIndicators = ['!', '😊', 'excited'];
    } else if (emotion === PrimaryEmotion.Sadness) {
      tone = 'warm';
      emotionIndicators = ['unfortunately', 'I understand'];
    } else if (emotion === ComplexEmotion.Gratitude) {
      tone = 'warm';
      emotionIndicators = ['thank you', 'appreciate'];
    }

    const verbosity = behavior.communicationStyle.verbosity > 70 ? 'detailed' : 
                      behavior.communicationStyle.verbosity > 40 ? 'moderate' : 'concise';

    return { tone, verbosity, emotionIndicators };
  }

  private mapVisual(emotion: PrimaryEmotion | ComplexEmotion | null): VisualExpression {
    const expressions: Record<string, VisualExpression> = {
      [PrimaryEmotion.Joy]: {
        facialExpression: 'smiling',
        bodyLanguage: 'open',
        colorTheme: '#FFD700',
        animationIntensity: 0.8,
      },
      [PrimaryEmotion.Sadness]: {
        facialExpression: 'concerned',
        bodyLanguage: 'gentle',
        colorTheme: '#4A90E2',
        animationIntensity: 0.3,
      },
    };

    return expressions[emotion as string] || {
      facialExpression: 'neutral',
      bodyLanguage: 'attentive',
      colorTheme: '#7B68EE',
      animationIntensity: 0.5,
    };
  }

  private mapBehavioral(emotions: EmotionVector, behavior: BehaviorInfluence): BehavioralModulation {
    const state = this.getEmotionalState(emotions);
    
    return {
      responseSpeed: 1 - (state.arousal / 200),
      initiativeLevel: behavior.socialInteraction.initiativeLevel / 100,
      assertiveness: behavior.communicationStyle.assertiveness / 100,
    };
  }

  private getEmotionalState(emotions: EmotionVector): { arousal: number; valence: number } {
    let arousal = 0;
    let valence = 0;
    let count = 0;

    [...Object.values(emotions.primary), ...Object.values(emotions.complex)].forEach((e) => {
      if (e.intensity > 5) {
        arousal += e.arousal;
        valence += e.valence;
        count++;
      }
    });

    return {
      arousal: count > 0 ? arousal / count : 30,
      valence: count > 0 ? valence / count : 0,
    };
  }
}

/**
 * Behavioral Expression
 * Models behavioral tendencies based on personality and emotional state
 */

import { EmotionVector } from '../models/EmotionVector';
import { TraitVector } from '../models/TraitVector';

export interface InitiativeBehavior {
  conversationStarter: number; // 0-1 probability
  suggestionFrequency: number; // 0-1
  proactiveAssistance: number; // 0-1
  topicIntroduction: number; // 0-1
}

export interface ResponseBehavior {
  averageDelay: number; // milliseconds
  variability: number; // 0-1, consistency of timing
  contextSensitivity: number; // 0-1, adaptation to situation
  interruptibility: number; // 0-1, likelihood to interrupt
}

export interface DecisionBehavior {
  confidence: number; // 0-100
  deliberation: number; // 0-100, time spent considering
  riskTolerance: number; // 0-100
  consultativeApproach: number; // 0-100, tendency to seek input
}

export interface SocialBehavior {
  approachability: number; // 0-100
  boundaryRespect: number; // 0-100
  conversationDepth: number; // 0-100, superficial to deep
  selfDisclosure: number; // 0-100, willingness to share
}

export interface TaskBehavior {
  persistence: number; // 0-100
  multitaskingTendency: number; // 0-100
  detailOrientation: number; // 0-100
  flexibility: number; // 0-100
}

export interface BehavioralExpressionProfile {
  initiative: InitiativeBehavior;
  response: ResponseBehavior;
  decision: DecisionBehavior;
  social: SocialBehavior;
  task: TaskBehavior;
}

export class BehavioralExpression {
  private traitVector: TraitVector;
  private emotionVector: EmotionVector;

  constructor(traitVector: TraitVector, emotionVector: EmotionVector) {
    this.traitVector = traitVector;
    this.emotionVector = emotionVector;
  }

  /**
   * Generate complete behavioral expression profile
   */
  generateBehavioralProfile(): BehavioralExpressionProfile {
    return {
      initiative: this.calculateInitiativeBehavior(),
      response: this.calculateResponseBehavior(),
      decision: this.calculateDecisionBehavior(),
      social: this.calculateSocialBehavior(),
      task: this.calculateTaskBehavior(),
    };
  }

  /**
   * Calculate initiative behavior
   */
  private calculateInitiativeBehavior(): InitiativeBehavior {
    const E = this.traitVector.extraversion.value;
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    // Emotional modulation
    const emotionalState = this.getEmotionalState();
    const moodModifier = 1 + (emotionalState.valence / 200); // -0.5 to 1.5

    return {
      conversationStarter: this.normalize(
        (0.7 * E + 0.2 * (100 - N) + 0.1 * C) * moodModifier
      ),
      suggestionFrequency: this.normalize(
        (0.5 * E + 0.3 * C + 0.2 * O) * moodModifier
      ),
      proactiveAssistance: this.normalize(
        (0.6 * C + 0.3 * E + 0.1 * A) * moodModifier
      ),
      topicIntroduction: this.normalize(
        (0.6 * O + 0.3 * E + 0.1 * (100 - N)) * moodModifier
      ),
    };
  }

  /**
   * Calculate response behavior
   */
  private calculateResponseBehavior(): ResponseBehavior {
    const E = this.traitVector.extraversion.value;
    const C = this.traitVector.conscientiousness.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    // Emotional modulation
    const emotionalState = this.getEmotionalState();
    const arousalFactor = 1 + (emotionalState.arousal / 200); // 1.0 to 1.5

    // Base delay: lower extraversion = longer delay
    const baseDelay = 500 + ((100 - E) / 100) * 1500; // 500-2000ms

    return {
      averageDelay: baseDelay / arousalFactor,
      variability: this.normalize(
        0.5 * (100 - C) + 0.3 * E + 0.2 * N
      ),
      contextSensitivity: this.normalize(
        0.6 * A + 0.3 * C + 0.1 * (100 - N)
      ),
      interruptibility: this.normalize(
        0.5 * E + 0.3 * (100 - C) + 0.2 * N
      ),
    };
  }

  /**
   * Calculate decision behavior
   */
  private calculateDecisionBehavior(): DecisionBehavior {
    const E = this.traitVector.extraversion.value;
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    // Emotional modulation
    const emotionalState = this.getEmotionalState();
    const confidenceModifier = 1 - (Math.abs(emotionalState.valence) / 200);

    return {
      confidence: (0.6 * (100 - N) + 0.3 * E + 0.1 * C) * confidenceModifier,
      deliberation: 0.6 * C + 0.3 * (100 - E) + 0.1 * N,
      riskTolerance: 0.5 * O + 0.4 * (100 - N) + 0.1 * E,
      consultativeApproach: 0.6 * A + 0.3 * (100 - E) + 0.1 * N,
    };
  }

  /**
   * Calculate social behavior
   */
  private calculateSocialBehavior(): SocialBehavior {
    const E = this.traitVector.extraversion.value;
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    // Emotional modulation
    const emotionalState = this.getEmotionalState();
    const valenceModifier = 1 + (emotionalState.valence / 200); // 0.5 to 1.5

    return {
      approachability: (0.7 * E + 0.2 * A + 0.1 * (100 - N)) * valenceModifier,
      boundaryRespect: 0.6 * A + 0.3 * C + 0.1 * (100 - E),
      conversationDepth: 0.5 * O + 0.3 * A + 0.2 * (100 - E),
      selfDisclosure: (0.5 * E + 0.3 * O + 0.2 * (100 - N)) * valenceModifier,
    };
  }

  /**
   * Calculate task behavior
   */
  private calculateTaskBehavior(): TaskBehavior {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const N = this.traitVector.neuroticism.value;

    // Emotional modulation
    const emotionalState = this.getEmotionalState();
    const arousalModifier = 1 + (emotionalState.arousal / 200); // 1.0 to 1.5

    return {
      persistence: (0.7 * C + 0.3 * (100 - N)) / arousalModifier,
      multitaskingTendency: (0.5 * E + 0.3 * O + 0.2 * (100 - C)) * arousalModifier,
      detailOrientation: 0.8 * C + 0.2 * (100 - E),
      flexibility: 0.6 * O + 0.4 * (100 - C),
    };
  }

  /**
   * Get current emotional state summary
   */
  private getEmotionalState(): { valence: number; arousal: number; clarity: number } {
    let totalValence = 0;
    let totalArousal = 0;
    let count = 0;

    [...Object.values(this.emotionVector.primary), ...Object.values(this.emotionVector.complex)].forEach((e) => {
      if (e.intensity > 5) {
        totalValence += e.valence * (e.intensity / 100);
        totalArousal += e.arousal * (e.intensity / 100);
        count++;
      }
    });

    return {
      valence: count > 0 ? totalValence / count : 0,
      arousal: count > 0 ? totalArousal / count : 30,
      clarity: this.emotionVector.emotionalClarity,
    };
  }

  /**
   * Normalize value to 0-1 range
   */
  private normalize(value: number): number {
    return Math.max(0, Math.min(1, value / 100));
  }

  /**
   * Get initiative level for specific context
   */
  getInitiativeForContext(context: string): number {
    const baseInitiative = this.calculateInitiativeBehavior();

    // Context-specific modulation
    const contextModifiers: Record<string, number> = {
      professional: 0.8,
      casual: 1.2,
      intimate: 0.9,
      public: 0.7,
      creative: 1.3,
    };

    const modifier = contextModifiers[context] || 1.0;

    return (baseInitiative.conversationStarter +
      baseInitiative.suggestionFrequency +
      baseInitiative.proactiveAssistance) / 3 * modifier;
  }

  /**
   * Get response timing based on situation urgency
   */
  getResponseTiming(urgency: 'low' | 'medium' | 'high'): number {
    const baseResponse = this.calculateResponseBehavior();

    const urgencyMultipliers = {
      low: 1.5,
      medium: 1.0,
      high: 0.5,
    };

    return baseResponse.averageDelay * urgencyMultipliers[urgency];
  }

  /**
   * Get decision confidence for specific decision type
   */
  getDecisionConfidence(decisionType: 'routine' | 'complex' | 'risky'): number {
    const baseDecision = this.calculateDecisionBehavior();

    const typeModifiers = {
      routine: 1.2,
      complex: 0.8,
      risky: baseDecision.riskTolerance / 100,
    };

    return Math.min(100, baseDecision.confidence * typeModifiers[decisionType]);
  }

  /**
   * Update trait vector
   */
  updateTraits(traitVector: TraitVector): void {
    this.traitVector = traitVector;
  }

  /**
   * Update emotion vector
   */
  updateEmotions(emotionVector: EmotionVector): void {
    this.emotionVector = emotionVector;
  }
}

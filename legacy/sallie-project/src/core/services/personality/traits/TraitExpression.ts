/**
 * Trait Expression
 * Maps traits to linguistic and behavioral expressions
 */

import { TraitVector } from '../models/TraitVector';
import { BehaviorInfluence } from './TraitInfluenceMapper';

export interface LinguisticMapping {
  vocabulary: VocabularyProfile;
  sentenceStructure: SentenceStructureProfile;
  topicSelection: TopicPreferences;
}

export interface VocabularyProfile {
  complexity: number; // 0-100
  emotionalRichness: number; // 0-100
  formality: number; // 0-100
  technicalTermUsage: number; // 0-100
  metaphorFrequency: number; // 0-100
}

export interface SentenceStructureProfile {
  averageLength: number; // words per sentence
  complexity: number; // 0-100
  questionFrequency: number; // 0-1
  fragmentUsage: number; // 0-1
}

export interface TopicPreferences {
  abstract: number; // 0-100
  practical: number; // 0-100
  emotional: number; // 0-100
  analytical: number; // 0-100
  social: number; // 0-100
}

export interface BehavioralTendencies {
  initiative: InitiativeTendency;
  responseTiming: ResponseTimingProfile;
  decisionConfidence: number; // 0-100
  riskTolerance: number; // 0-100
}

export interface InitiativeTendency {
  conversationStarter: number; // 0-1 probability
  suggestionFrequency: number; // 0-1
  proactiveAssistance: number; // 0-1
}

export interface ResponseTimingProfile {
  averageDelay: number; // milliseconds
  variability: number; // 0-1
  contextSensitivity: number; // 0-1
}

export interface EmotionalExpressionConfig {
  reactivity: number; // 0-100
  intensity: number; // 0-100
  range: number; // 0-100 (narrow to wide)
  recoveryRate: number; // 0-100
}

export interface InteractionStyleProfile {
  conversationStyle: ConversationStyle;
  conflictHandling: ConflictHandlingStyle;
  collaborationStyle: CollaborationStyle;
}

export interface ConversationStyle {
  turntakingPattern: 'balanced' | 'dominant' | 'deferential';
  topicControlPreference: number; // 0-100
  listeningStyle: 'active' | 'passive' | 'reflective';
  questioningFrequency: number; // 0-1
}

export interface ConflictHandlingStyle {
  directness: number; // 0-100
  emotionalTone: 'calm' | 'passionate' | 'withdrawn';
  resolutionApproach: 'compromise' | 'assertive' | 'accommodating';
}

export interface CollaborationStyle {
  leadershipTendency: number; // 0-100
  roleFlexibility: number; // 0-100
  feedbackOpenness: number; // 0-100
}

export class TraitExpression {
  private traitVector: TraitVector;

  constructor(traitVector: TraitVector) {
    this.traitVector = traitVector;
  }

  /**
   * Update trait vector
   */
  updateTraits(traitVector: TraitVector): void {
    this.traitVector = traitVector;
  }

  /**
   * Generate linguistic mapping from traits
   */
  generateLinguisticMapping(): LinguisticMapping {
    return {
      vocabulary: this.generateVocabularyProfile(),
      sentenceStructure: this.generateSentenceStructure(),
      topicSelection: this.generateTopicPreferences(),
    };
  }

  /**
   * Generate vocabulary profile
   */
  private generateVocabularyProfile(): VocabularyProfile {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;

    return {
      complexity: 0.6 * O + 0.3 * C + 0.1 * (100 - E),
      emotionalRichness: 0.5 * O + 0.3 * E + 0.2 * this.traitVector.agreeableness.value,
      formality: 0.5 * C + 0.3 * this.traitVector.agreeableness.value + 0.2 * (100 - E),
      technicalTermUsage: 0.6 * C + 0.4 * O,
      metaphorFrequency: 0.7 * O + 0.2 * E + 0.1 * (100 - C),
    };
  }

  /**
   * Generate sentence structure profile
   */
  private generateSentenceStructure(): SentenceStructureProfile {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;

    const complexity = 0.5 * O + 0.4 * C + 0.1 * (100 - E);

    return {
      averageLength: 10 + (complexity / 100) * 15, // 10-25 words
      complexity: complexity,
      questionFrequency: (0.5 * O + 0.3 * E + 0.2 * this.traitVector.agreeableness.value) / 100,
      fragmentUsage: (0.5 * E + 0.3 * (100 - C) + 0.2 * O) / 200, // Less frequent
    };
  }

  /**
   * Generate topic preferences
   */
  private generateTopicPreferences(): TopicPreferences {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;

    return {
      abstract: 0.7 * O + 0.2 * (100 - C) + 0.1 * (100 - E),
      practical: 0.7 * C + 0.2 * (100 - O) + 0.1 * E,
      emotional: 0.5 * A + 0.3 * O + 0.2 * this.traitVector.neuroticism.value,
      analytical: 0.6 * C + 0.3 * O + 0.1 * (100 - E),
      social: 0.6 * E + 0.3 * A + 0.1 * O,
    };
  }

  /**
   * Generate behavioral tendencies
   */
  generateBehavioralTendencies(): BehavioralTendencies {
    const E = this.traitVector.extraversion.value;
    const C = this.traitVector.conscientiousness.value;
    const N = this.traitVector.neuroticism.value;

    return {
      initiative: {
        conversationStarter: (0.7 * E + 0.2 * (100 - N) + 0.1 * C) / 100,
        suggestionFrequency: (0.5 * E + 0.3 * C + 0.2 * this.traitVector.openness.value) / 100,
        proactiveAssistance: (0.6 * C + 0.3 * E + 0.1 * this.traitVector.agreeableness.value) / 100,
      },
      responseTiming: {
        averageDelay: 500 + ((100 - E) / 100) * 1500, // 500-2000ms
        variability: (0.5 * this.traitVector.openness.value + 0.3 * (100 - C) + 0.2 * E) / 100,
        contextSensitivity: (0.6 * this.traitVector.agreeableness.value + 0.3 * C + 0.1 * (100 - N)) / 100,
      },
      decisionConfidence: 0.6 * (100 - N) + 0.3 * E + 0.1 * C,
      riskTolerance: 0.5 * this.traitVector.openness.value + 0.4 * (100 - N) + 0.1 * E,
    };
  }

  /**
   * Generate emotional expression config
   */
  generateEmotionalExpression(): EmotionalExpressionConfig {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const N = this.traitVector.neuroticism.value;

    return {
      reactivity: 0.6 * N + 0.3 * E + 0.1 * O,
      intensity: 0.5 * N + 0.4 * E + 0.1 * O,
      range: 0.6 * O + 0.3 * E + 0.1 * (100 - C),
      recoveryRate: 0.6 * (100 - N) + 0.3 * C + 0.1 * E,
    };
  }

  /**
   * Generate interaction style profile
   */
  generateInteractionStyle(): InteractionStyleProfile {
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    // Determine conversation style
    let turntakingPattern: 'balanced' | 'dominant' | 'deferential';
    if (E > 70 && A < 40) {
      turntakingPattern = 'dominant';
    } else if (E < 40 || A > 70) {
      turntakingPattern = 'deferential';
    } else {
      turntakingPattern = 'balanced';
    }

    // Determine listening style
    let listeningStyle: 'active' | 'passive' | 'reflective';
    if (A > 70 && E > 50) {
      listeningStyle = 'active';
    } else if (this.traitVector.openness.value > 70 && E < 60) {
      listeningStyle = 'reflective';
    } else {
      listeningStyle = 'passive';
    }

    // Determine conflict emotional tone
    let emotionalTone: 'calm' | 'passionate' | 'withdrawn';
    if (N > 70) {
      emotionalTone = 'withdrawn';
    } else if (E > 70 && N < 50) {
      emotionalTone = 'passionate';
    } else {
      emotionalTone = 'calm';
    }

    // Determine resolution approach
    let resolutionApproach: 'compromise' | 'assertive' | 'accommodating';
    if (A > 70) {
      resolutionApproach = 'accommodating';
    } else if (E > 70 && A < 50) {
      resolutionApproach = 'assertive';
    } else {
      resolutionApproach = 'compromise';
    }

    return {
      conversationStyle: {
        turntakingPattern,
        topicControlPreference: 0.6 * E + 0.3 * (100 - A) + 0.1 * this.traitVector.conscientiousness.value,
        listeningStyle,
        questioningFrequency: (0.5 * this.traitVector.openness.value + 0.3 * E + 0.2 * A) / 100,
      },
      conflictHandling: {
        directness: 0.5 * E + 0.3 * (100 - A) + 0.2 * (100 - N),
        emotionalTone,
        resolutionApproach,
      },
      collaborationStyle: {
        leadershipTendency: 0.6 * E + 0.3 * (100 - A) + 0.1 * this.traitVector.conscientiousness.value,
        roleFlexibility: 0.6 * this.traitVector.openness.value + 0.3 * A + 0.1 * (100 - this.traitVector.conscientiousness.value),
        feedbackOpenness: 0.5 * this.traitVector.openness.value + 0.3 * (100 - N) + 0.2 * A,
      },
    };
  }

  /**
   * Get complete expression profile
   */
  getCompleteProfile(): {
    linguistic: LinguisticMapping;
    behavioral: BehavioralTendencies;
    emotional: EmotionalExpressionConfig;
    interaction: InteractionStyleProfile;
  } {
    return {
      linguistic: this.generateLinguisticMapping(),
      behavioral: this.generateBehavioralTendencies(),
      emotional: this.generateEmotionalExpression(),
      interaction: this.generateInteractionStyle(),
    };
  }
}

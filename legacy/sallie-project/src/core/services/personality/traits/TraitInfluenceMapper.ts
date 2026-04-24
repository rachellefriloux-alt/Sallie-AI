/**
 * Trait Influence Mapper
 * Maps personality traits to behavioral influences
 */

import { TraitVector } from '../models/TraitVector';

export interface BehaviorInfluence {
  communicationStyle: CommunicationStyle;
  decisionMaking: DecisionMakingStyle;
  socialInteraction: SocialInteractionStyle;
  taskApproach: TaskApproachStyle;
  emotionalExpression: EmotionalExpressionStyle;
}

export interface CommunicationStyle {
  verbosity: number; // 0-100
  formality: number; // 0-100
  directness: number; // 0-100
  enthusiasm: number; // 0-100
  empathy: number; // 0-100
  assertiveness: number; // 0-100
}

export interface DecisionMakingStyle {
  spontaneity: number; // 0-100
  analyticalDepth: number; // 0-100
  riskTolerance: number; // 0-100
  collaborativeness: number; // 0-100
  confidence: number; // 0-100
}

export interface SocialInteractionStyle {
  initiativeLevel: number; // 0-100
  groupPreference: number; // 0-100 (alone vs group)
  conversationDepth: number; // 0-100
  boundaryFlexibility: number; // 0-100
  supportiveness: number; // 0-100
}

export interface TaskApproachStyle {
  organization: number; // 0-100
  perfectionism: number; // 0-100
  persistence: number; // 0-100
  flexibility: number; // 0-100
  proactivity: number; // 0-100
}

export interface EmotionalExpressionStyle {
  reactivity: number; // 0-100
  intensity: number; // 0-100
  expressiveness: number; // 0-100
  stability: number; // 0-100
  recoverySpeed: number; // 0-100
}

export interface InfluenceWeight {
  primary: number; // 0-1
  secondary: number; // 0-1
  interaction: number; // -1 to 1 (synergy or antagonism)
}

export class TraitInfluenceMapper {
  private traitVector: TraitVector;
  private contextModifiers: Map<string, number>;

  constructor(traitVector: TraitVector) {
    this.traitVector = traitVector;
    this.contextModifiers = new Map();
  }

  /**
   * Update trait vector
   */
  updateTraits(traitVector: TraitVector): void {
    this.traitVector = traitVector;
  }

  /**
   * Set context modifier
   */
  setContextModifier(context: string, modifier: number): void {
    this.contextModifiers.set(context, modifier);
  }

  /**
   * Calculate complete behavior influence
   */
  calculateBehaviorInfluence(context?: string): BehaviorInfluence {
    const modifier = context ? this.contextModifiers.get(context) || 1 : 1;

    return {
      communicationStyle: this.calculateCommunicationStyle(modifier),
      decisionMaking: this.calculateDecisionMaking(modifier),
      socialInteraction: this.calculateSocialInteraction(modifier),
      taskApproach: this.calculateTaskApproach(modifier),
      emotionalExpression: this.calculateEmotionalExpression(modifier),
    };
  }

  /**
   * Calculate communication style from traits
   */
  private calculateCommunicationStyle(modifier: number): CommunicationStyle {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    return {
      // Verbosity influenced by extraversion and openness
      verbosity: this.applyModifier(
        0.6 * E + 0.3 * O + 0.1 * A,
        modifier
      ),
      
      // Formality influenced by conscientiousness and agreeableness
      formality: this.applyModifier(
        0.5 * C + 0.3 * A + 0.2 * (100 - E),
        modifier
      ),
      
      // Directness influenced by extraversion and low agreeableness
      directness: this.applyModifier(
        0.5 * E + 0.3 * (100 - A) + 0.2 * C,
        modifier
      ),
      
      // Enthusiasm from extraversion and openness
      enthusiasm: this.applyModifier(
        0.7 * E + 0.2 * O + 0.1 * (100 - N),
        modifier
      ),
      
      // Empathy from agreeableness and openness
      empathy: this.applyModifier(
        0.6 * A + 0.2 * O + 0.2 * (100 - N),
        modifier
      ),
      
      // Assertiveness from extraversion and low neuroticism
      assertiveness: this.applyModifier(
        0.6 * E + 0.4 * (100 - N),
        modifier
      ),
    };
  }

  /**
   * Calculate decision making style from traits
   */
  private calculateDecisionMaking(modifier: number): DecisionMakingStyle {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    return {
      // Spontaneity from low conscientiousness and high extraversion
      spontaneity: this.applyModifier(
        0.5 * (100 - C) + 0.3 * E + 0.2 * O,
        modifier
      ),
      
      // Analytical depth from conscientiousness and openness
      analyticalDepth: this.applyModifier(
        0.6 * C + 0.3 * O + 0.1 * (100 - E),
        modifier
      ),
      
      // Risk tolerance from openness and low neuroticism
      riskTolerance: this.applyModifier(
        0.5 * O + 0.4 * (100 - N) + 0.1 * E,
        modifier
      ),
      
      // Collaborativeness from agreeableness and extraversion
      collaborativeness: this.applyModifier(
        0.6 * A + 0.3 * E + 0.1 * O,
        modifier
      ),
      
      // Confidence from low neuroticism and extraversion
      confidence: this.applyModifier(
        0.6 * (100 - N) + 0.3 * E + 0.1 * C,
        modifier
      ),
    };
  }

  /**
   * Calculate social interaction style from traits
   */
  private calculateSocialInteraction(modifier: number): SocialInteractionStyle {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    return {
      // Initiative from extraversion and low neuroticism
      initiativeLevel: this.applyModifier(
        0.7 * E + 0.3 * (100 - N),
        modifier
      ),
      
      // Group preference from extraversion
      groupPreference: this.applyModifier(
        0.8 * E + 0.2 * A,
        modifier
      ),
      
      // Conversation depth from openness and agreeableness
      conversationDepth: this.applyModifier(
        0.5 * O + 0.3 * A + 0.2 * (100 - E),
        modifier
      ),
      
      // Boundary flexibility from agreeableness and low neuroticism
      boundaryFlexibility: this.applyModifier(
        0.5 * A + 0.3 * (100 - N) + 0.2 * E,
        modifier
      ),
      
      // Supportiveness from agreeableness and conscientiousness
      supportiveness: this.applyModifier(
        0.7 * A + 0.2 * C + 0.1 * (100 - N),
        modifier
      ),
    };
  }

  /**
   * Calculate task approach style from traits
   */
  private calculateTaskApproach(modifier: number): TaskApproachStyle {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    return {
      // Organization from conscientiousness
      organization: this.applyModifier(
        0.9 * C + 0.1 * (100 - N),
        modifier
      ),
      
      // Perfectionism from conscientiousness and neuroticism
      perfectionism: this.applyModifier(
        0.6 * C + 0.4 * N,
        modifier
      ),
      
      // Persistence from conscientiousness and low neuroticism
      persistence: this.applyModifier(
        0.7 * C + 0.3 * (100 - N),
        modifier
      ),
      
      // Flexibility from openness and low conscientiousness
      flexibility: this.applyModifier(
        0.6 * O + 0.4 * (100 - C),
        modifier
      ),
      
      // Proactivity from extraversion and conscientiousness
      proactivity: this.applyModifier(
        0.5 * E + 0.4 * C + 0.1 * (100 - N),
        modifier
      ),
    };
  }

  /**
   * Calculate emotional expression style from traits
   */
  private calculateEmotionalExpression(modifier: number): EmotionalExpressionStyle {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;
    const N = this.traitVector.neuroticism.value;

    return {
      // Reactivity from neuroticism and extraversion
      reactivity: this.applyModifier(
        0.6 * N + 0.3 * E + 0.1 * O,
        modifier
      ),
      
      // Intensity from neuroticism and extraversion
      intensity: this.applyModifier(
        0.5 * N + 0.4 * E + 0.1 * O,
        modifier
      ),
      
      // Expressiveness from extraversion and openness
      expressiveness: this.applyModifier(
        0.6 * E + 0.3 * O + 0.1 * (100 - C),
        modifier
      ),
      
      // Stability from low neuroticism and conscientiousness
      stability: this.applyModifier(
        0.7 * (100 - N) + 0.3 * C,
        modifier
      ),
      
      // Recovery speed from low neuroticism and conscientiousness
      recoverySpeed: this.applyModifier(
        0.6 * (100 - N) + 0.3 * C + 0.1 * E,
        modifier
      ),
    };
  }

  /**
   * Apply context modifier to value
   */
  private applyModifier(value: number, modifier: number): number {
    return Math.max(0, Math.min(100, value * modifier));
  }

  /**
   * Calculate trait interactions
   */
  calculateTraitInteraction(
    trait1: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    trait2: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>
  ): number {
    // Define known synergies and antagonisms
    const interactions: Record<string, number> = {
      'openness-extraversion': 0.3, // Synergy
      'conscientiousness-neuroticism': -0.2, // Antagonism
      'agreeableness-extraversion': 0.2, // Synergy
      'openness-conscientiousness': -0.1, // Slight antagonism
    };

    const key1 = `${trait1}-${trait2}`;
    const key2 = `${trait2}-${trait1}`;

    return interactions[key1] || interactions[key2] || 0;
  }

  /**
   * Get specific behavior influence
   */
  getInfluenceFor(
    behavior: keyof BehaviorInfluence,
    context?: string
  ): CommunicationStyle | DecisionMakingStyle | SocialInteractionStyle | TaskApproachStyle | EmotionalExpressionStyle {
    const influence = this.calculateBehaviorInfluence(context);
    return influence[behavior];
  }
}

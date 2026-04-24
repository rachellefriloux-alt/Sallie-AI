/**
 * Trait Evolution
 * Handles trait evolution based on interactions and experiences
 */

import { TraitManager } from './TraitManager';
import { EvolutionCause, TraitVector } from '../models/TraitVector';

export interface ExperienceInput {
  type: ExperienceType;
  outcome: 'positive' | 'negative' | 'neutral';
  intensity: number; // 0-1
  context: string;
  affectedTraits: Array<{
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>;
    facet?: string;
    impact: number; // -1 to 1
  }>;
  timestamp?: Date;
}

export enum ExperienceType {
  DirectFeedback = 'direct_feedback',
  BehavioralOutcome = 'behavioral_outcome',
  SocialInteraction = 'social_interaction',
  ValueAlignment = 'value_alignment',
  EmotionalImpact = 'emotional_impact',
}

export interface EvolutionRule {
  pattern: 'linear' | 'oscillating' | 'resistant';
  rate: number; // Base rate of change
  threshold: number; // Minimum impact to trigger change
  dampening: number; // Reduces oscillation
  regressionResistance: number; // Prevents reverting to old patterns
}

export class TraitEvolution {
  private traitManager: TraitManager;
  private evolutionRules: Map<string, EvolutionRule>;
  private experienceBuffer: ExperienceInput[];
  private readonly BUFFER_SIZE = 100;
  private readonly BASE_EVOLUTION_RATE = 0.1;

  constructor(traitManager: TraitManager) {
    this.traitManager = traitManager;
    this.evolutionRules = this.initializeEvolutionRules();
    this.experienceBuffer = [];
  }

  /**
   * Initialize evolution rules for each trait
   */
  private initializeEvolutionRules(): Map<string, EvolutionRule> {
    const rules = new Map<string, EvolutionRule>();
    
    const traits: Array<keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>> = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
    ];

    traits.forEach((trait) => {
      // Different traits have different stability
      const stability = this.getTraitStability(trait);
      
      rules.set(trait, {
        pattern: 'linear',
        rate: this.BASE_EVOLUTION_RATE * (1 - stability),
        threshold: 0.1,
        dampening: 0.8,
        regressionResistance: stability,
      });
    });

    return rules;
  }

  /**
   * Get inherent stability for each trait type
   */
  private getTraitStability(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>
  ): number {
    // Research suggests different traits have different stability
    const stabilities: Record<string, number> = {
      openness: 0.7, // Moderately stable
      conscientiousness: 0.8, // Quite stable
      extraversion: 0.75, // Moderately stable
      agreeableness: 0.85, // Very stable
      neuroticism: 0.65, // Less stable
    };
    
    return stabilities[trait] || 0.75;
  }

  /**
   * Process an experience and evolve traits accordingly
   */
  processExperience(experience: ExperienceInput): void {
    // Add to buffer
    this.experienceBuffer.push({
      ...experience,
      timestamp: experience.timestamp || new Date(),
    });
    
    // Maintain buffer size
    if (this.experienceBuffer.length > this.BUFFER_SIZE) {
      this.experienceBuffer.shift();
    }

    // Process immediate evolution
    experience.affectedTraits.forEach((affected) => {
      this.evolveTraitFromExperience(experience, affected);
    });

    // Check for pattern-based evolution
    this.detectAndApplyPatterns();
  }

  /**
   * Evolve a specific trait based on experience
   */
  private evolveTraitFromExperience(
    experience: ExperienceInput,
    affected: {
      trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>;
      facet?: string;
      impact: number;
    }
  ): void {
    const rule = this.evolutionRules.get(affected.trait);
    if (!rule) return;

    // Calculate evolution magnitude
    const outcomeMultiplier = experience.outcome === 'positive' ? 1 : -0.5;
    const magnitude = affected.impact * experience.intensity * outcomeMultiplier * rule.rate;

    // Check threshold
    if (Math.abs(magnitude) < rule.threshold) {
      return;
    }

    // Map experience type to evolution cause
    const cause = this.mapExperienceToCause(experience.type);

    // Update trait or facet
    if (affected.facet) {
      this.traitManager.updateFacet(
        affected.trait,
        affected.facet,
        magnitude * 10, // Scale for 0-100 range
        experience.intensity
      );
    } else {
      this.traitManager.updateTrait(affected.trait, {
        delta: magnitude * 10,
        confidence: experience.intensity,
        cause,
        context: experience.context,
      });
    }
  }

  /**
   * Map experience type to evolution cause
   */
  private mapExperienceToCause(type: ExperienceType): EvolutionCause {
    const mapping: Record<ExperienceType, EvolutionCause> = {
      [ExperienceType.DirectFeedback]: EvolutionCause.DirectFeedback,
      [ExperienceType.BehavioralOutcome]: EvolutionCause.BehavioralOutcome,
      [ExperienceType.SocialInteraction]: EvolutionCause.SocialInteraction,
      [ExperienceType.ValueAlignment]: EvolutionCause.ValueAlignment,
      [ExperienceType.EmotionalImpact]: EvolutionCause.EmotionalImpact,
    };
    
    return mapping[type];
  }

  /**
   * Detect patterns in experience buffer and apply evolution
   */
  private detectAndApplyPatterns(): void {
    if (this.experienceBuffer.length < 10) return;

    // Analyze recent experiences for patterns
    const recentExperiences = this.experienceBuffer.slice(-20);
    
    // Group by trait
    const traitImpacts = new Map<string, number[]>();
    
    recentExperiences.forEach((exp) => {
      exp.affectedTraits.forEach((affected) => {
        const key = affected.trait;
        if (!traitImpacts.has(key)) {
          traitImpacts.set(key, []);
        }
        traitImpacts.get(key)!.push(affected.impact);
      });
    });

    // Apply pattern-based evolution
    traitImpacts.forEach((impacts, trait) => {
      const rule = this.evolutionRules.get(trait);
      if (!rule) return;

      // Detect oscillation
      if (this.isOscillating(impacts)) {
        // Apply dampening
        rule.dampening = Math.min(0.95, rule.dampening + 0.05);
      }

      // Detect consistent direction
      if (this.hasConsistentDirection(impacts)) {
        // Reduce regression resistance for this direction
        rule.regressionResistance = Math.max(0.5, rule.regressionResistance - 0.05);
      }
    });
  }

  /**
   * Check if impacts are oscillating
   */
  private isOscillating(impacts: number[]): boolean {
    if (impacts.length < 4) return false;
    
    let changes = 0;
    for (let i = 1; i < impacts.length; i++) {
      if (Math.sign(impacts[i]) !== Math.sign(impacts[i - 1])) {
        changes++;
      }
    }
    
    return changes / impacts.length > 0.4;
  }

  /**
   * Check if impacts have consistent direction
   */
  private hasConsistentDirection(impacts: number[]): boolean {
    if (impacts.length < 5) return false;
    
    const positive = impacts.filter((i) => i > 0).length;
    const ratio = positive / impacts.length;
    
    return ratio > 0.7 || ratio < 0.3;
  }

  /**
   * Get current evolution rates
   */
  getEvolutionRates(): Map<string, number> {
    const rates = new Map<string, number>();
    
    this.evolutionRules.forEach((rule, trait) => {
      rates.set(trait, rule.rate);
    });
    
    return rates;
  }

  /**
   * Set evolution rate for a trait
   */
  setEvolutionRate(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    rate: number
  ): void {
    const rule = this.evolutionRules.get(trait);
    if (rule) {
      rule.rate = Math.max(0, Math.min(1, rate));
    }
  }

  /**
   * Get recent experiences
   */
  getRecentExperiences(limit = 10): ExperienceInput[] {
    return this.experienceBuffer.slice(-limit);
  }

  /**
   * Clear experience buffer
   */
  clearExperiences(): void {
    this.experienceBuffer = [];
  }

  /**
   * Export evolution state
   */
  export(): {
    rules: Array<[string, EvolutionRule]>;
    buffer: ExperienceInput[];
  } {
    return {
      rules: Array.from(this.evolutionRules.entries()),
      buffer: [...this.experienceBuffer],
    };
  }

  /**
   * Import evolution state
   */
  import(state: {
    rules: Array<[string, EvolutionRule]>;
    buffer: ExperienceInput[];
  }): void {
    this.evolutionRules = new Map(state.rules);
    this.experienceBuffer = [...state.buffer];
  }
}

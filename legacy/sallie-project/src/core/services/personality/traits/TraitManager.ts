/**
 * Trait Manager
 * Manages personality traits with OCEAN model and 30 facets
 */

import {
  TraitVector,
  TraitDimension,
  TraitFacetValue,
  TRAIT_FACETS,
  createDefaultTraitVector,
  EvolutionCause,
  TraitEvolutionRecord,
} from '../models/TraitVector';

export interface TraitUpdateOptions {
  delta: number;
  confidence: number;
  cause: EvolutionCause;
  context?: string;
}

export class TraitManager {
  private traitVector: TraitVector;
  private readonly MIN_VALUE = 0;
  private readonly MAX_VALUE = 100;
  private readonly CHANGE_THRESHOLD = 0.5;

  constructor(initialTraits?: Partial<TraitVector>) {
    this.traitVector = initialTraits
      ? { ...createDefaultTraitVector(), ...initialTraits }
      : createDefaultTraitVector();
    
    this.initializeFacets();
  }

  /**
   * Initialize all facets for each trait dimension
   */
  private initializeFacets(): void {
    const dimensions: Array<keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>> = [
      'openness',
      'conscientiousness',
      'extraversion',
      'agreeableness',
      'neuroticism',
    ];

    dimensions.forEach((dim) => {
      const facetNames = TRAIT_FACETS[dim];
      const dimension = this.traitVector[dim];
      
      facetNames.forEach((facetName) => {
        if (!dimension.facets[facetName]) {
          // Initialize facet near the main trait value with some variance
          const variance = (Math.random() - 0.5) * 20;
          dimension.facets[facetName] = {
            value: Math.max(0, Math.min(100, dimension.value + variance)),
            confidence: 0.5,
            lastUpdated: new Date(),
          };
        }
      });
    });
  }

  /**
   * Get the current trait vector
   */
  getTraitVector(): TraitVector {
    return { ...this.traitVector };
  }

  /**
   * Get a specific trait dimension
   */
  getTraitDimension(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>
  ): TraitDimension {
    return { ...this.traitVector[trait] };
  }

  /**
   * Get a specific facet value
   */
  getFacetValue(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    facet: string
  ): TraitFacetValue | null {
    const dimension = this.traitVector[trait];
    return dimension.facets[facet] ? { ...dimension.facets[facet] } : null;
  }

  /**
   * Update a trait dimension
   */
  updateTrait(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    options: TraitUpdateOptions
  ): boolean {
    const dimension = this.traitVector[trait];
    const oldValue = dimension.value;
    
    // Apply stability resistance
    const resistedDelta = options.delta * (1 - dimension.stability);
    
    // Calculate new value with bounds
    const newValue = Math.max(
      this.MIN_VALUE,
      Math.min(this.MAX_VALUE, oldValue + resistedDelta)
    );

    // Only update if change exceeds threshold
    if (Math.abs(newValue - oldValue) < this.CHANGE_THRESHOLD) {
      return false;
    }

    // Update dimension
    dimension.value = newValue;
    dimension.confidence = Math.min(1, dimension.confidence + options.confidence * 0.1);
    dimension.velocity = resistedDelta / 30; // Change per month estimate

    // Record evolution
    const record: TraitEvolutionRecord = {
      timestamp: new Date(),
      trait,
      oldValue,
      newValue,
      cause: options.cause,
      confidence: options.confidence,
    };
    
    this.traitVector.evolutionHistory.push(record);
    this.traitVector.lastUpdated = new Date();
    this.traitVector.version++;

    // Update related facets proportionally
    this.updateRelatedFacets(trait, resistedDelta);

    return true;
  }

  /**
   * Update a specific facet
   */
  updateFacet(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    facet: string,
    delta: number,
    confidence: number
  ): boolean {
    const dimension = this.traitVector[trait];
    
    if (!dimension.facets[facet]) {
      return false;
    }

    const facetValue = dimension.facets[facet];
    const oldValue = facetValue.value;
    const newValue = Math.max(0, Math.min(100, oldValue + delta));

    if (Math.abs(newValue - oldValue) < this.CHANGE_THRESHOLD) {
      return false;
    }

    facetValue.value = newValue;
    facetValue.confidence = Math.min(1, facetValue.confidence + confidence * 0.1);
    facetValue.lastUpdated = new Date();

    // Update main trait as average of facets
    this.recalculateTraitFromFacets(trait);

    return true;
  }

  /**
   * Update related facets when main trait changes
   */
  private updateRelatedFacets(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    delta: number
  ): void {
    const dimension = this.traitVector[trait];
    const facetNames = TRAIT_FACETS[trait];

    facetNames.forEach((facetName) => {
      const facet = dimension.facets[facetName];
      if (facet) {
        // Apply proportional change to facets
        const facetDelta = delta * 0.5 * (1 - facet.confidence);
        facet.value = Math.max(0, Math.min(100, facet.value + facetDelta));
        facet.lastUpdated = new Date();
      }
    });
  }

  /**
   * Recalculate main trait value from facets
   */
  private recalculateTraitFromFacets(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>
  ): void {
    const dimension = this.traitVector[trait];
    const facetNames = TRAIT_FACETS[trait];
    
    let sum = 0;
    let count = 0;

    facetNames.forEach((facetName) => {
      const facet = dimension.facets[facetName];
      if (facet) {
        sum += facet.value;
        count++;
      }
    });

    if (count > 0) {
      dimension.value = sum / count;
    }
  }

  /**
   * Get trait stability score
   */
  getStability(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>
  ): number {
    return this.traitVector[trait].stability;
  }

  /**
   * Set trait stability (for identity anchoring)
   */
  setStability(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    stability: number
  ): void {
    this.traitVector[trait].stability = Math.max(0, Math.min(1, stability));
  }

  /**
   * Get evolution history
   */
  getEvolutionHistory(
    trait?: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    limit?: number
  ): TraitEvolutionRecord[] {
    let history = [...this.traitVector.evolutionHistory];
    
    if (trait) {
      history = history.filter((record) => record.trait === trait);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history;
  }

  /**
   * Calculate trait variance for situational expression
   */
  calculateSituationalVariance(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    context: string
  ): number {
    const dimension = this.traitVector[trait];
    const baseVariance = dimension.variance;
    
    // Context can amplify or dampen variance
    // For now, return base variance
    // Could be extended with context-specific modifiers
    return baseVariance;
  }

  /**
   * Export trait vector for persistence
   */
  export(): TraitVector {
    return JSON.parse(JSON.stringify(this.traitVector));
  }

  /**
   * Import trait vector from persistence
   */
  import(traitVector: TraitVector): void {
    this.traitVector = JSON.parse(JSON.stringify(traitVector));
  }
}

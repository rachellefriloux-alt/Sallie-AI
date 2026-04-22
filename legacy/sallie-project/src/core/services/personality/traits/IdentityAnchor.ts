/**
 * Identity Anchor
 * Preserves core characteristics while allowing peripheral evolution
 */

import { TraitVector } from '../models/TraitVector';

export interface IdentityAnchor {
  coreTraits: CoreTraitDefinition[];
  anchorStrength: number; // 0-1
  allowedDeviation: number; // Maximum allowed change from anchor
}

export interface CoreTraitDefinition {
  trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>;
  facet?: string;
  anchorValue: number;
  flexibility: number; // 0-1, how much this can change
  priority: number; // 1-10, importance of maintaining this trait
}

export interface AnchorViolation {
  trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>;
  facet?: string;
  anchorValue: number;
  currentValue: number;
  deviation: number;
  severity: 'minor' | 'moderate' | 'severe';
}

export class IdentityAnchorSystem {
  private anchors: IdentityAnchor;
  private violationHistory: AnchorViolation[];
  private readonly MAX_HISTORY = 50;

  constructor(initialTraits: TraitVector, anchorStrength = 0.7) {
    this.anchors = this.initializeAnchors(initialTraits, anchorStrength);
    this.violationHistory = [];
  }

  /**
   * Initialize core trait anchors from initial trait vector
   */
  private initializeAnchors(traits: TraitVector, strength: number): IdentityAnchor {
    const coreTraits: CoreTraitDefinition[] = [
      // High priority core traits
      {
        trait: 'agreeableness',
        anchorValue: traits.agreeableness.value,
        flexibility: 0.15,
        priority: 9,
      },
      {
        trait: 'conscientiousness',
        anchorValue: traits.conscientiousness.value,
        flexibility: 0.2,
        priority: 8,
      },
      // Moderate priority traits
      {
        trait: 'extraversion',
        anchorValue: traits.extraversion.value,
        flexibility: 0.25,
        priority: 6,
      },
      {
        trait: 'openness',
        anchorValue: traits.openness.value,
        flexibility: 0.3,
        priority: 5,
      },
      // Lower priority (more flexible)
      {
        trait: 'neuroticism',
        anchorValue: traits.neuroticism.value,
        flexibility: 0.35,
        priority: 4,
      },
    ];

    return {
      coreTraits,
      anchorStrength: strength,
      allowedDeviation: 20, // +/- 20 points from anchor
    };
  }

  /**
   * Check if a trait change would violate identity anchors
   */
  checkViolation(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    newValue: number,
    facet?: string
  ): AnchorViolation | null {
    const anchor = this.anchors.coreTraits.find(
      (a) => a.trait === trait && a.facet === facet
    );

    if (!anchor) {
      return null; // No anchor for this trait/facet
    }

    const deviation = Math.abs(newValue - anchor.anchorValue);
    const maxAllowedDeviation = this.anchors.allowedDeviation * anchor.flexibility;

    if (deviation <= maxAllowedDeviation) {
      return null; // Within acceptable range
    }

    // Determine severity
    let severity: 'minor' | 'moderate' | 'severe';
    const excessDeviation = deviation - maxAllowedDeviation;
    
    if (excessDeviation < 5) {
      severity = 'minor';
    } else if (excessDeviation < 15) {
      severity = 'moderate';
    } else {
      severity = 'severe';
    }

    const violation: AnchorViolation = {
      trait,
      facet,
      anchorValue: anchor.anchorValue,
      currentValue: newValue,
      deviation,
      severity,
    };

    // Record violation
    this.violationHistory.push(violation);
    if (this.violationHistory.length > this.MAX_HISTORY) {
      this.violationHistory.shift();
    }

    return violation;
  }

  /**
   * Calculate resistance to trait change based on anchors
   */
  calculateResistance(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    proposedDelta: number,
    currentValue: number,
    facet?: string
  ): number {
    const anchor = this.anchors.coreTraits.find(
      (a) => a.trait === trait && a.facet === facet
    );

    if (!anchor) {
      return 0; // No resistance if not anchored
    }

    const newValue = currentValue + proposedDelta;
    const distanceFromAnchor = Math.abs(newValue - anchor.anchorValue);
    const maxAllowedDistance = this.anchors.allowedDeviation * anchor.flexibility;

    // Calculate resistance based on distance from anchor
    if (distanceFromAnchor <= maxAllowedDistance) {
      // Within acceptable range, minimal resistance
      return 0.1 * this.anchors.anchorStrength * (anchor.priority / 10);
    }

    // Outside acceptable range, strong resistance
    const excessDistance = distanceFromAnchor - maxAllowedDistance;
    const resistanceFactor = Math.min(1, excessDistance / maxAllowedDistance);
    
    return resistanceFactor * this.anchors.anchorStrength * (anchor.priority / 10);
  }

  /**
   * Adjust proposed trait change to respect anchors
   */
  adjustChange(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    proposedDelta: number,
    currentValue: number,
    facet?: string
  ): number {
    const resistance = this.calculateResistance(trait, proposedDelta, currentValue, facet);
    
    // Apply resistance to reduce the change
    const adjustedDelta = proposedDelta * (1 - resistance);
    
    // Ensure we don't cross into violation territory
    const newValue = currentValue + adjustedDelta;
    const violation = this.checkViolation(trait, newValue, facet);
    
    if (violation && violation.severity !== 'minor') {
      // Further reduce change to stay within bounds
      const anchor = this.anchors.coreTraits.find(
        (a) => a.trait === trait && a.facet === facet
      );
      
      if (anchor) {
        const maxAllowed = this.anchors.allowedDeviation * anchor.flexibility;
        const sign = Math.sign(proposedDelta);
        const maxSafeValue = anchor.anchorValue + sign * maxAllowed;
        return maxSafeValue - currentValue;
      }
    }
    
    return adjustedDelta;
  }

  /**
   * Update anchor points (identity evolution)
   */
  updateAnchor(
    trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>,
    newAnchorValue: number,
    facet?: string
  ): void {
    const anchor = this.anchors.coreTraits.find(
      (a) => a.trait === trait && a.facet === facet
    );

    if (anchor) {
      // Gradually shift anchor point
      const shift = (newAnchorValue - anchor.anchorValue) * 0.1; // 10% shift at a time
      anchor.anchorValue += shift;
    }
  }

  /**
   * Get current anchors
   */
  getAnchors(): IdentityAnchor {
    return JSON.parse(JSON.stringify(this.anchors));
  }

  /**
   * Get violation history
   */
  getViolationHistory(limit?: number): AnchorViolation[] {
    const history = [...this.violationHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Check if identity is stable (few recent violations)
   */
  isIdentityStable(recentPeriod = 10): boolean {
    const recentViolations = this.violationHistory.slice(-recentPeriod);
    const severeViolations = recentViolations.filter(
      (v) => v.severity === 'severe'
    );
    
    return severeViolations.length === 0;
  }

  /**
   * Get identity consistency score
   */
  getConsistencyScore(): number {
    if (this.violationHistory.length === 0) {
      return 1.0;
    }

    const recentViolations = this.violationHistory.slice(-20);
    const severityWeights = { minor: 0.1, moderate: 0.3, severe: 0.6 };
    
    let totalPenalty = 0;
    recentViolations.forEach((v) => {
      totalPenalty += severityWeights[v.severity];
    });

    // Normalize to 0-1 range
    const maxPenalty = recentViolations.length * 0.6; // All severe
    return Math.max(0, 1 - totalPenalty / maxPenalty);
  }

  /**
   * Set anchor strength
   */
  setAnchorStrength(strength: number): void {
    this.anchors.anchorStrength = Math.max(0, Math.min(1, strength));
  }

  /**
   * Set allowed deviation
   */
  setAllowedDeviation(deviation: number): void {
    this.anchors.allowedDeviation = Math.max(0, Math.min(50, deviation));
  }

  /**
   * Export anchor state
   */
  export(): {
    anchors: IdentityAnchor;
    history: AnchorViolation[];
  } {
    return {
      anchors: JSON.parse(JSON.stringify(this.anchors)),
      history: [...this.violationHistory],
    };
  }

  /**
   * Import anchor state
   */
  import(state: {
    anchors: IdentityAnchor;
    history: AnchorViolation[];
  }): void {
    this.anchors = JSON.parse(JSON.stringify(state.anchors));
    this.violationHistory = [...state.history];
  }
}

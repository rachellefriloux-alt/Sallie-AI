/**
 * Decision Support
 * 
 * Provides decision framing, evaluation, and outcome tracking.
 */

import { Decision, DecisionDefinition, DecisionOption } from '../models/Decision';
import { ConfidenceLevel, DecisionOutcome, AlignmentScore } from '../types';

export interface DecisionAnalysis {
  optionId: string;
  title: string;
  overallScore: number;
  factors: {
    valueAlignment: number;
    feasibility: number;
    shortTermImpact: number;
    longTermImpact: number;
  };
  recommendation: string;
}

/**
 * Manager for decision support operations
 */
export class DecisionSupport {
  private decisions: Map<string, Decision> = new Map();
  private eventHandlers: Map<string, Array<(data: unknown) => void>> = new Map();

  /**
   * Create a new decision
   * 
   * @param data - Decision creation data
   * @returns Created decision
   * 
   * @example
   * ```typescript
   * const decision = support.createDecision({
   *   title: 'Career change',
   *   description: 'Should I accept the new job offer?',
   *   context: 'Current job stable but not fulfilling, new offer exciting but risky'
   * });
   * ```
   */
  public createDecision(data: Partial<DecisionDefinition> & { title: string }): Decision {
    const decision = new Decision(data);
    this.decisions.set(decision.getId(), decision);
    this.emit('decision:created', decision.getDefinition());
    return decision;
  }

  /**
   * Get a decision by ID
   */
  public getDecision(id: string): Decision | undefined {
    return this.decisions.get(id);
  }

  /**
   * Get all decisions
   */
  public getAllDecisions(): Decision[] {
    return Array.from(this.decisions.values());
  }

  /**
   * Add an option to a decision
   * 
   * @param decisionId - Decision ID
   * @param option - Decision option
   * 
   * @example
   * ```typescript
   * support.addOption(decision.getId(), {
   *   id: 'option1',
   *   title: 'Accept new job',
   *   description: 'Take the offer and transition roles',
   *   pros: ['Higher salary', 'New challenges', 'Better growth'],
   *   cons: ['Risk of culture mismatch', 'Learning curve', 'Relocation needed'],
   *   estimatedImpact: { shortTerm: 6, longTerm: 8 },
   *   valueAlignment: { score: 0.8, details: {}, conflicts: [] },
   *   feasibility: 7
   * });
   * ```
   */
  public addOption(decisionId: string, option: DecisionOption): void {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found`);
    }
    
    decision.addOption(option);
  }

  /**
   * Analyze all options for a decision
   * 
   * @param decisionId - Decision ID
   * @returns Array of option analyses
   * 
   * @example
   * ```typescript
   * const analyses = support.analyzeOptions(decision.getId());
   * const best = analyses[0];
   * console.log(`Recommended: ${best.title} (score: ${best.overallScore.toFixed(2)})`);
   * ```
   */
  public analyzeOptions(decisionId: string): DecisionAnalysis[] {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found`);
    }
    
    const def = decision.getDefinition();
    const analyses: DecisionAnalysis[] = [];
    
    for (const option of def.options) {
      // Calculate overall score
      const valueAlignment = option.valueAlignment.score;
      const feasibility = option.feasibility / 10;
      const shortTermImpact = (option.estimatedImpact.shortTerm + 10) / 20; // Normalize -10 to 10 -> 0 to 1
      const longTermImpact = (option.estimatedImpact.longTerm + 10) / 20;
      
      const overallScore = (
        valueAlignment * 0.4 +
        feasibility * 0.2 +
        shortTermImpact * 0.2 +
        longTermImpact * 0.2
      );
      
      let recommendation = '';
      if (overallScore >= 0.8) {
        recommendation = 'Highly recommended - strong alignment across all factors';
      } else if (overallScore >= 0.6) {
        recommendation = 'Recommended - good overall fit with minor trade-offs';
      } else if (overallScore >= 0.4) {
        recommendation = 'Consider carefully - mixed factors require deeper evaluation';
      } else {
        recommendation = 'Caution advised - significant concerns across multiple factors';
      }
      
      analyses.push({
        optionId: option.id,
        title: option.title,
        overallScore,
        factors: {
          valueAlignment,
          feasibility,
          shortTermImpact,
          longTermImpact,
        },
        recommendation,
      });
    }
    
    // Sort by overall score
    return analyses.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Make a decision (select an option)
   * 
   * @param decisionId - Decision ID
   * @param optionId - Selected option ID
   * @param confidence - Confidence level
   * @param confidenceScore - Numeric confidence (0-100)
   * 
   * @example
   * ```typescript
   * support.makeDecision(
   *   decision.getId(),
   *   'option1',
   *   ConfidenceLevel.HIGH,
   *   85
   * );
   * ```
   */
  public makeDecision(
    decisionId: string,
    optionId: string,
    confidence: ConfidenceLevel,
    confidenceScore: number
  ): void {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found`);
    }
    
    decision.selectOption(optionId, confidence, confidenceScore);
    this.emit('decision:made', {
      decisionId,
      optionId,
      confidence,
      confidenceScore,
    });
  }

  /**
   * Record decision outcome
   * 
   * @param decisionId - Decision ID
   * @param outcome - Decision outcome
   * 
   * @example
   * ```typescript
   * support.recordOutcome(decision.getId(), {
   *   decisionId: decision.getId(),
   *   actualOutcome: 'Job transition successful, very satisfied',
   *   successRating: 9,
   *   lessons: ['Trust data-driven analysis', 'Don\'t fear calculated risks'],
   *   recordedAt: new Date()
   * });
   * ```
   */
  public recordOutcome(decisionId: string, outcome: DecisionOutcome): void {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found`);
    }
    
    decision.recordOutcome(outcome);
    this.emit('decision:outcome', outcome);
  }

  /**
   * Simulate impact of a decision
   * 
   * @param decisionId - Decision ID
   * @param optionId - Option to simulate
   * @param scenarioContext - Context for simulation
   * @returns Impact simulation
   * 
   * @example
   * ```typescript
   * const simulation = support.simulateImpact(
   *   decision.getId(),
   *   'option1',
   *   'If economy remains stable'
   * );
   * ```
   */
  public simulateImpact(
    decisionId: string,
    optionId: string,
    scenarioContext: string
  ): {
    scenario: string;
    likelyOutcomes: string[];
    risks: string[];
    opportunities: string[];
    confidence: number;
  } {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found`);
    }
    
    const option = decision.getDefinition().options.find(o => o.id === optionId);
    if (!option) {
      throw new Error(`Option with ID '${optionId}' not found`);
    }
    
    const likelyOutcomes = [
      'Immediate adjustment period with learning curve',
      'Gradual improvement in satisfaction and engagement',
      'Long-term positive impact on career trajectory',
    ];
    
    const risks = option.cons.map(con => `Risk: ${con}`);
    const opportunities = option.pros.map(pro => `Opportunity: ${pro}`);
    
    return {
      scenario: scenarioContext,
      likelyOutcomes,
      risks,
      opportunities,
      confidence: option.feasibility / 10,
    };
  }

  /**
   * Get decision history and patterns
   * 
   * @returns Decision history analysis
   * 
   * @example
   * ```typescript
   * const history = support.getDecisionHistory();
   * console.log(`${history.totalDecisions} decisions made`);
   * ```
   */
  public getDecisionHistory(): {
    totalDecisions: number;
    withOutcomes: number;
    averageConfidence: number;
    averageSuccessRating: number;
    commonPatterns: string[];
  } {
    const decisions = Array.from(this.decisions.values());
    const withOutcomes = decisions.filter(d => d.hasOutcome());
    
    const avgConfidence = decisions
      .filter(d => d.isDecided())
      .reduce((sum, d) => sum + d.getDefinition().confidenceScore, 0) / Math.max(decisions.length, 1);
    
    const avgSuccess = withOutcomes
      .map(d => d.getDefinition().outcome?.successRating || 0)
      .reduce((sum, rating) => sum + rating, 0) / Math.max(withOutcomes.length, 1);
    
    const commonPatterns = [
      'Decisions with higher value alignment tend to have better outcomes',
      'Confidence level correlates with success rating',
      'Taking time for thorough analysis improves satisfaction',
    ];
    
    return {
      totalDecisions: decisions.length,
      withOutcomes: withOutcomes.length,
      averageConfidence: avgConfidence,
      averageSuccessRating: avgSuccess,
      commonPatterns,
    };
  }

  /**
   * Subscribe to events
   */
  public on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Export all decisions
   */
  public export(): DecisionDefinition[] {
    return Array.from(this.decisions.values()).map(d => d.toJSON());
  }

  /**
   * Import decisions
   */
  public import(data: DecisionDefinition[]): void {
    for (const def of data) {
      const decision = Decision.fromJSON(def);
      this.decisions.set(decision.getId(), decision);
    }
  }

  public clear(): void {
    this.decisions.clear();
  }
}

/**
 * Value Manager
 * 
 * Manages values including definition, prioritization, conflict resolution,
 * and alignment scoring.
 */

import { Value, ValueDefinition } from '../models/Value';
import { ValueCategory, AlignmentScore } from '../types';

export interface ValueConflict {
  value1: Value;
  value2: Value;
  conflictType: 'priority' | 'contradiction' | 'resource';
  severity: number; // 0-1
  suggestions: string[];
}

export interface AlignmentAnalysis {
  overallScore: number; // 0-1
  valueScores: Map<string, number>;
  topValues: Value[];
  conflicts: string[];
  recommendations: string[];
}

/**
 * Manager for value operations
 */
export class ValueManager {
  private values: Map<string, Value> = new Map();
  private eventHandlers: Map<string, Array<(data: unknown) => void>> = new Map();

  constructor() {
    // Initialize empty manager
  }

  /**
   * Create a new value
   * 
   * @param data - Value creation data
   * @returns Created value
   * @throws {Error} If value with same name exists
   * 
   * @example
   * ```typescript
   * const value = manager.createValue({
   *   name: 'Integrity',
   *   description: 'Being honest and having strong moral principles',
   *   category: ValueCategory.PERSONAL,
   *   priority: 9,
   *   examples: ['Admitting mistakes', 'Keeping promises']
   * });
   * ```
   */
  public createValue(data: Partial<ValueDefinition> & { name: string; category: ValueCategory }): Value {
    // Check for duplicate name
    const existing = Array.from(this.values.values()).find(
      v => v.getName().toLowerCase() === data.name.toLowerCase()
    );
    
    if (existing) {
      throw new Error(`Value with name '${data.name}' already exists`);
    }
    
    const value = new Value(data);
    this.values.set(value.getId(), value);
    this.emit('value:created', value.getDefinition());
    
    return value;
  }

  /**
   * Get a value by ID
   * 
   * @param id - Value ID
   * @returns Value or undefined
   */
  public getValue(id: string): Value | undefined {
    return this.values.get(id);
  }

  /**
   * Get all values
   * 
   * @param activeOnly - Return only active values
   * @returns Array of values
   */
  public getAllValues(activeOnly: boolean = false): Value[] {
    const values = Array.from(this.values.values());
    return activeOnly ? values.filter(v => v.isActive()) : values;
  }

  /**
   * Get values by category
   * 
   * @param category - Value category
   * @param activeOnly - Return only active values
   * @returns Array of values in category
   */
  public getValuesByCategory(category: ValueCategory, activeOnly: boolean = false): Value[] {
    const values = Array.from(this.values.values()).filter(v => v.getCategory() === category);
    return activeOnly ? values.filter(v => v.isActive()) : values;
  }

  /**
   * Get values sorted by priority
   * 
   * @param activeOnly - Return only active values
   * @returns Array of values sorted by priority (highest first)
   */
  public getValuesByPriority(activeOnly: boolean = false): Value[] {
    const values = this.getAllValues(activeOnly);
    return values.sort((a, b) => b.getPriority() - a.getPriority());
  }

  /**
   * Update a value
   * 
   * @param id - Value ID
   * @param updates - Updates to apply
   * @throws {Error} If value not found
   */
  public updateValue(id: string, updates: Partial<ValueDefinition>): void {
    const value = this.values.get(id);
    if (!value) {
      throw new Error(`Value with ID '${id}' not found`);
    }
    
    if (updates.priority !== undefined) {
      value.updatePriority(updates.priority);
    }
    
    if (updates.description !== undefined) {
      value.updateDescription(updates.description);
    }
    
    if (updates.notes !== undefined) {
      value.updateNotes(updates.notes);
    }
    
    this.emit('value:updated', value.getDefinition());
  }

  /**
   * Delete a value
   * 
   * @param id - Value ID
   * @throws {Error} If value not found
   */
  public deleteValue(id: string): void {
    const value = this.values.get(id);
    if (!value) {
      throw new Error(`Value with ID '${id}' not found`);
    }
    
    this.values.delete(id);
    this.emit('value:deleted', { id });
  }

  /**
   * Detect conflicts between values
   * 
   * @returns Array of detected conflicts
   * 
   * @example
   * ```typescript
   * const conflicts = manager.detectConflicts();
   * conflicts.forEach(conflict => {
   *   console.log(`Conflict between ${conflict.value1.getName()} and ${conflict.value2.getName()}`);
   * });
   * ```
   */
  public detectConflicts(): ValueConflict[] {
    const conflicts: ValueConflict[] = [];
    const activeValues = this.getAllValues(true);
    
    for (let i = 0; i < activeValues.length; i++) {
      for (let j = i + 1; j < activeValues.length; j++) {
        const v1 = activeValues[i];
        const v2 = activeValues[j];
        
        // Check explicit conflicts
        if (v1.conflictsWith(v2.getId()) || v2.conflictsWith(v1.getId())) {
          conflicts.push({
            value1: v1,
            value2: v2,
            conflictType: 'contradiction',
            severity: 0.8,
            suggestions: [
              `Consider which value is more important in specific contexts`,
              `Define when each value takes precedence`,
              `Look for ways to honor both values`
            ],
          });
        }
        
        // Check priority conflicts (both very high priority in same category)
        if (v1.getCategory() === v2.getCategory() &&
            v1.getPriority() >= 9 && v2.getPriority() >= 9) {
          conflicts.push({
            value1: v1,
            value2: v2,
            conflictType: 'priority',
            severity: 0.5,
            suggestions: [
              `Differentiate priorities between ${v1.getName()} and ${v2.getName()}`,
              `Consider if both can truly be top priorities`,
              `Define specific domains for each value`
            ],
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Resolve conflicts using multi-value optimization
   * 
   * @param conflicts - Conflicts to resolve
   * @returns Resolution recommendations
   * 
   * @example
   * ```typescript
   * const conflicts = manager.detectConflicts();
   * const resolutions = manager.resolveConflicts(conflicts);
   * ```
   */
  public resolveConflicts(conflicts: ValueConflict[]): Array<{
    conflict: ValueConflict;
    recommendation: string;
    adjustments: Array<{ valueId: string; newPriority: number }>;
  }> {
    return conflicts.map(conflict => {
      const adjustments: Array<{ valueId: string; newPriority: number }> = [];
      let recommendation = '';
      
      if (conflict.conflictType === 'priority') {
        // Suggest slight priority differentiation
        const higher = conflict.value1.getPriority() > conflict.value2.getPriority()
          ? conflict.value1 : conflict.value2;
        const lower = higher === conflict.value1 ? conflict.value2 : conflict.value1;
        
        recommendation = `Consider adjusting ${lower.getName()} to priority 8 to differentiate from ${higher.getName()}`;
        adjustments.push({ valueId: lower.getId(), newPriority: 8 });
      } else if (conflict.conflictType === 'contradiction') {
        recommendation = `Create context-based rules for when ${conflict.value1.getName()} vs ${conflict.value2.getName()} takes precedence`;
      }
      
      return { conflict, recommendation, adjustments };
    });
  }

  /**
   * Calculate alignment score for an action or decision
   * 
   * @param actionDescription - Description of action
   * @param keywords - Keywords from action
   * @param linkedValueIds - Specific values to check (optional)
   * @returns Alignment analysis
   * 
   * @example
   * ```typescript
   * const analysis = manager.calculateAlignment(
   *   'Volunteered at local shelter',
   *   ['volunteer', 'help', 'community']
   * );
   * console.log(`Alignment score: ${analysis.overallScore}`);
   * ```
   */
  public calculateAlignment(
    actionDescription: string,
    keywords: string[],
    linkedValueIds?: string[]
  ): AlignmentAnalysis {
    const valuesToCheck = linkedValueIds
      ? linkedValueIds.map(id => this.values.get(id)).filter((v): v is Value => v !== undefined)
      : this.getAllValues(true);
    
    const valueScores = new Map<string, number>();
    const conflicts: string[] = [];
    
    for (const value of valuesToCheck) {
      const score = value.calculateAlignmentScore(actionDescription, keywords);
      valueScores.set(value.getId(), score);
    }
    
    // Calculate overall score weighted by priority
    let weightedSum = 0;
    let weightTotal = 0;
    
    for (const value of valuesToCheck) {
      const score = valueScores.get(value.getId()) || 0;
      const weight = value.getPriority() / 10;
      weightedSum += score * weight;
      weightTotal += weight;
    }
    
    const overallScore = weightTotal > 0 ? weightedSum / weightTotal : 0;
    
    // Find top aligned values
    const sortedValues = valuesToCheck
      .map(v => ({ value: v, score: valueScores.get(v.getId()) || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.value);
    
    // Check for conflicts
    const lowScoreValues = valuesToCheck.filter(v => (valueScores.get(v.getId()) || 0) < 0.3 && v.getPriority() >= 7);
    if (lowScoreValues.length > 0) {
      conflicts.push(`Action may not align well with: ${lowScoreValues.map(v => v.getName()).join(', ')}`);
    }
    
    const recommendations: string[] = [];
    if (overallScore < 0.5) {
      recommendations.push('Consider how this action could better reflect your core values');
      recommendations.push('Identify which values are most important for this decision');
    } else if (overallScore < 0.7) {
      recommendations.push('Good alignment overall, minor adjustments could strengthen value expression');
    }
    
    return {
      overallScore,
      valueScores,
      topValues: sortedValues,
      conflicts,
      recommendations,
    };
  }

  /**
   * Track value drift over time
   * 
   * @param valueId - Value to analyze
   * @param recentActions - Recent actions with their alignments
   * @returns Drift score and recommendations
   * 
   * @example
   * ```typescript
   * const drift = manager.trackValueDrift('value123', [
   *   { action: 'Skipped workout', alignment: 0.2 },
   *   { action: 'Ate fast food', alignment: 0.3 },
   *   { action: 'Stayed up late', alignment: 0.1 }
   * ]);
   * if (drift.driftScore > 0.6) {
   *   console.warn('Significant drift detected');
   * }
   * ```
   */
  public trackValueDrift(
    valueId: string,
    recentActions: Array<{ action: string; alignment: number }>
  ): { driftScore: number; recommendations: string[] } {
    const value = this.values.get(valueId);
    if (!value) {
      throw new Error(`Value with ID '${valueId}' not found`);
    }
    
    if (recentActions.length === 0) {
      return { driftScore: 0, recommendations: [] };
    }
    
    // Calculate average alignment
    const avgAlignment = recentActions.reduce((sum, a) => sum + a.alignment, 0) / recentActions.length;
    
    // Drift is inverse of alignment
    const driftScore = 1 - avgAlignment;
    
    const recommendations: string[] = [];
    
    if (driftScore > 0.7) {
      recommendations.push(`Recent actions show significant misalignment with ${value.getName()}`);
      recommendations.push('Consider why this drift is occurring');
      recommendations.push('Set specific intentions to realign with this value');
    } else if (driftScore > 0.5) {
      recommendations.push(`Moderate drift from ${value.getName()} detected`);
      recommendations.push('Review your recent choices and their alignment');
    } else if (driftScore > 0.3) {
      recommendations.push(`Minor drift from ${value.getName()}`);
      recommendations.push('Stay mindful of this value in upcoming decisions');
    }
    
    return { driftScore, recommendations };
  }

  /**
   * Subscribe to events
   * 
   * @param event - Event name
   * @param handler - Event handler
   */
  public on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Emit an event
   * 
   * @param event - Event name
   * @param data - Event data
   * @private
   */
  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Export all values
   * 
   * @returns Array of value definitions
   */
  public export(): ValueDefinition[] {
    return Array.from(this.values.values()).map(v => v.toJSON());
  }

  /**
   * Import values
   * 
   * @param data - Array of value definitions
   */
  public import(data: ValueDefinition[]): void {
    for (const def of data) {
      const value = Value.fromJSON(def);
      this.values.set(value.getId(), value);
    }
  }

  /**
   * Clear all values
   */
  public clear(): void {
    this.values.clear();
  }
}

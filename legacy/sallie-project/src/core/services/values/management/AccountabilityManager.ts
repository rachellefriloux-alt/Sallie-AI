/**
 * Accountability Manager
 * 
 * Manages commitments, check-ins, streaks, and accountability reporting.
 */

import { Commitment, CommitmentDefinition } from '../models/Commitment';
import { CommitmentFrequency, CheckInType, StreakInfo, PatternInsight } from '../types';

export interface CheckInReport {
  period: string;
  commitments: Array<{
    commitment: Commitment;
    checkInCount: number;
    completionRate: number;
    streak: StreakInfo;
  }>;
  overallCompletionRate: number;
  insights: string[];
  recommendations: string[];
}

/**
 * Manager for accountability operations
 */
export class AccountabilityManager {
  private commitments: Map<string, Commitment> = new Map();
  private eventHandlers: Map<string, Array<(data: unknown) => void>> = new Map();

  /**
   * Create a new commitment
   * 
   * @param data - Commitment creation data
   * @returns Created commitment
   * 
   * @example
   * ```typescript
   * const commitment = manager.createCommitment({
   *   title: 'Morning meditation',
   *   description: '10 minutes of mindfulness practice',
   *   frequency: CommitmentFrequency.DAILY,
   *   goalId: wellnessGoal.getId()
   * });
   * ```
   */
  public createCommitment(data: Partial<CommitmentDefinition> & { title: string; frequency: CommitmentFrequency }): Commitment {
    const commitment = new Commitment(data);
    this.commitments.set(commitment.getId(), commitment);
    this.emit('commitment:created', commitment.getDefinition());
    return commitment;
  }

  /**
   * Get a commitment by ID
   */
  public getCommitment(id: string): Commitment | undefined {
    return this.commitments.get(id);
  }

  /**
   * Get all commitments
   */
  public getAllCommitments(activeOnly: boolean = false): Commitment[] {
    const commitments = Array.from(this.commitments.values());
    return activeOnly ? commitments.filter(c => c.isActive()) : commitments;
  }

  /**
   * Record a check-in
   * 
   * @param commitmentId - Commitment ID
   * @param completed - Whether commitment was fulfilled
   * @param notes - Optional notes
   * 
   * @example
   * ```typescript
   * manager.checkIn('commitment123', true, 'Felt great after meditation');
   * ```
   */
  public checkIn(commitmentId: string, completed: boolean, notes: string = ''): void {
    const commitment = this.commitments.get(commitmentId);
    if (!commitment) {
      throw new Error(`Commitment with ID '${commitmentId}' not found`);
    }
    
    commitment.checkIn(completed, notes);
    this.emit('commitment:checked', {
      commitmentId,
      completed,
      notes,
      timestamp: new Date(),
    });
    
    // Check for streak milestones
    const streak = commitment.getStreak();
    if (completed && streak.current > 0 && streak.current % 7 === 0) {
      this.emit('streak:milestone', {
        commitmentId,
        streak: streak.current,
        title: commitment.getTitle(),
      });
    }
  }

  /**
   * Get streak information for a commitment
   * 
   * @param commitmentId - Commitment ID
   * @returns Streak information
   */
  public getStreak(commitmentId: string): StreakInfo {
    const commitment = this.commitments.get(commitmentId);
    if (!commitment) {
      throw new Error(`Commitment with ID '${commitmentId}' not found`);
    }
    
    return commitment.getStreak();
  }

  /**
   * Generate accountability report
   * 
   * @param checkInType - Type of check-in period
   * @param startDate - Start of period
   * @param endDate - End of period
   * @returns Accountability report
   * 
   * @example
   * ```typescript
   * const report = manager.generateReport(
   *   CheckInType.WEEKLY,
   *   new Date('2025-10-01'),
   *   new Date('2025-10-07')
   * );
   * console.log(`Overall completion: ${report.overallCompletionRate.toFixed(1)}%`);
   * ```
   */
  public generateReport(checkInType: CheckInType, startDate: Date, endDate: Date): CheckInReport {
    const activeCommitments = this.getAllCommitments(true);
    
    const commitmentData = activeCommitments.map(commitment => {
      const streak = commitment.getStreak();
      const completionRate = commitment.getCompletionRate();
      
      return {
        commitment,
        checkInCount: streak.totalCheckIns,
        completionRate,
        streak,
      };
    });
    
    const overallCompletionRate = commitmentData.length > 0
      ? commitmentData.reduce((sum, d) => sum + d.completionRate, 0) / commitmentData.length
      : 0;
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Generate insights
    const strongStreaks = commitmentData.filter(d => d.streak.current >= 7);
    if (strongStreaks.length > 0) {
      insights.push(`${strongStreaks.length} commitment(s) with strong streaks (7+ days)`);
    }
    
    const struggling = commitmentData.filter(d => d.completionRate < 0.5);
    if (struggling.length > 0) {
      insights.push(`${struggling.length} commitment(s) with low completion rates`);
      recommendations.push('Review struggling commitments - they may need adjustment');
    }
    
    if (overallCompletionRate >= 0.8) {
      insights.push('Excellent overall commitment adherence!');
    } else if (overallCompletionRate >= 0.6) {
      insights.push('Good commitment adherence with room for improvement');
      recommendations.push('Focus on building consistency in weaker areas');
    } else {
      insights.push('Commitment adherence needs attention');
      recommendations.push('Consider reducing commitment load or increasing support');
    }
    
    return {
      period: `${checkInType} (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
      commitments: commitmentData,
      overallCompletionRate,
      insights,
      recommendations,
    };
  }

  /**
   * Analyze patterns across commitments
   * 
   * @returns Array of pattern insights
   * 
   * @example
   * ```typescript
   * const patterns = manager.analyzePatterns();
   * patterns.forEach(pattern => {
   *   console.log(`${pattern.type}: ${pattern.description}`);
   * });
   * ```
   */
  public analyzePatterns(): PatternInsight[] {
    const patterns: PatternInsight[] = [];
    const commitments = this.getAllCommitments(true);
    
    // Pattern: High completion rate
    const highPerformers = commitments.filter(c => c.getCompletionRate() >= 0.8);
    if (highPerformers.length > 0) {
      patterns.push({
        type: 'success',
        pattern: 'High completion rate pattern',
        description: `${highPerformers.length} commitment(s) consistently maintained`,
        confidence: 0.9,
        occurrences: highPerformers.length,
        suggestions: [
          'Celebrate these successes',
          'Apply successful strategies to other commitments',
        ],
      });
    }
    
    // Pattern: Declining streaks
    const decliningStreaks = commitments.filter(c => {
      const streak = c.getStreak();
      return streak.longest > 7 && streak.current < 3;
    });
    
    if (decliningStreaks.length > 0) {
      patterns.push({
        type: 'warning',
        pattern: 'Declining streak pattern',
        description: `${decliningStreaks.length} commitment(s) with broken long streaks`,
        confidence: 0.8,
        occurrences: decliningStreaks.length,
        suggestions: [
          'Identify what caused the break',
          'Implement recovery strategies',
          'Consider adjusting commitment difficulty',
        ],
      });
    }
    
    return patterns;
  }

  /**
   * Plan setback recovery
   * 
   * @param commitmentId - Commitment ID
   * @param setbackDescription - Description of setback
   * @returns Recovery plan
   * 
   * @example
   * ```typescript
   * const plan = manager.planRecovery(
   *   'commitment123',
   *   'Missed 3 days due to illness'
   * );
   * ```
   */
  public planRecovery(commitmentId: string, setbackDescription: string): {
    strategies: string[];
    timeline: string;
    supportResources: string[];
  } {
    const commitment = this.commitments.get(commitmentId);
    if (!commitment) {
      throw new Error(`Commitment with ID '${commitmentId}' not found`);
    }
    
    const strategies = [
      'Start with a small, achievable version of the commitment',
      'Focus on rebuilding the habit without pressure',
      'Track progress to rebuild momentum',
      'Forgive the setback and focus forward',
    ];
    
    const timeline = 'Aim to rebuild streak over next 7-14 days';
    
    const supportResources = [
      'Daily reminders',
      'Accountability partner',
      'Progress visualization',
      'Reward system for consistency',
    ];
    
    return { strategies, timeline, supportResources };
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
   * Export all commitments
   */
  public export(): CommitmentDefinition[] {
    return Array.from(this.commitments.values()).map(c => c.toJSON());
  }

  /**
   * Import commitments
   */
  public import(data: CommitmentDefinition[]): void {
    for (const def of data) {
      const commitment = Commitment.fromJSON(def);
      this.commitments.set(commitment.getId(), commitment);
    }
  }

  public clear(): void {
    this.commitments.clear();
  }
}

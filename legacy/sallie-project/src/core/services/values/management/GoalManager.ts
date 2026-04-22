/**
 * Goal Manager
 * 
 * Manages goals, milestones, dependencies, and progress tracking.
 */

import { Goal, GoalDefinition, GoalDependency } from '../models/Goal';
import { Milestone, MilestoneDefinition } from '../models/Milestone';
import { GoalTimeframe, GoalStatus, ProgressMetrics, GoalRecommendation } from '../types';

export interface DependencyGraph {
  nodes: Array<{ id: string; title: string; status: GoalStatus }>;
  edges: Array<{ from: string; to: string; type: string; strength: number }>;
}

/**
 * Manager for goal and milestone operations
 */
export class GoalManager {
  private goals: Map<string, Goal> = new Map();
  private milestones: Map<string, Milestone> = new Map();
  private eventHandlers: Map<string, Array<(data: unknown) => void>> = new Map();

  /**
   * Create a new goal
   * 
   * @param data - Goal creation data
   * @returns Created goal
   * 
   * @example
   * ```typescript
   * const goal = manager.createGoal({
   *   title: 'Run a marathon',
   *   description: 'Complete a full marathon within 6 months',
   *   timeframe: GoalTimeframe.MEDIUM_TERM,
   *   targetDate: new Date('2025-09-01'),
   *   linkedValues: [healthValue.getId()],
   *   successCriteria: ['Complete 26.2 miles', 'Finish under 4 hours']
   * });
   * ```
   */
  public createGoal(data: Partial<GoalDefinition> & { title: string; timeframe: GoalTimeframe }): Goal {
    const goal = new Goal(data);
    this.goals.set(goal.getId(), goal);
    this.emit('goal:created', goal.getDefinition());
    return goal;
  }

  /**
   * Get a goal by ID
   */
  public getGoal(id: string): Goal | undefined {
    return this.goals.get(id);
  }

  /**
   * Get all goals
   */
  public getAllGoals(filter?: { status?: GoalStatus; timeframe?: GoalTimeframe }): Goal[] {
    let goals = Array.from(this.goals.values());
    
    if (filter?.status) {
      goals = goals.filter(g => g.getStatus() === filter.status);
    }
    
    if (filter?.timeframe) {
      goals = goals.filter(g => g.getTimeframe() === filter.timeframe);
    }
    
    return goals;
  }

  /**
   * Create a milestone for a goal
   * 
   * @param data - Milestone creation data
   * @returns Created milestone
   * 
   * @example
   * ```typescript
   * const milestone = manager.createMilestone({
   *   goalId: goal.getId(),
   *   title: 'Run 10K without stopping',
   *   order: 1,
   *   targetDate: new Date('2025-06-01')
   * });
   * ```
   */
  public createMilestone(data: Partial<MilestoneDefinition> & { goalId: string; title: string; order: number }): Milestone {
    const goal = this.goals.get(data.goalId);
    if (!goal) {
      throw new Error(`Goal with ID '${data.goalId}' not found`);
    }
    
    const milestone = new Milestone(data);
    this.milestones.set(milestone.getId(), milestone);
    goal.addMilestone(milestone.getId());
    
    return milestone;
  }

  /**
   * Get milestones for a goal
   */
  public getMilestones(goalId: string): Milestone[] {
    const goal = this.goals.get(goalId);
    if (!goal) return [];
    
    const milestoneIds = goal.getDefinition().milestoneIds;
    return milestoneIds
      .map(id => this.milestones.get(id))
      .filter((m): m is Milestone => m !== undefined)
      .sort((a, b) => a.getOrder() - b.getOrder());
  }

  /**
   * Complete a milestone
   */
  public completeMilestone(milestoneId: string): void {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone) {
      throw new Error(`Milestone with ID '${milestoneId}' not found`);
    }
    
    milestone.complete();
    this.emit('milestone:completed', milestone.getDefinition());
    
    // Update goal progress
    const goal = this.goals.get(milestone.getGoalId());
    if (goal) {
      const milestones = this.getMilestones(goal.getId());
      const completedCount = milestones.filter(m => m.isCompleted()).length;
      const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
      goal.updateProgress(progress);
      
      if (progress >= 100) {
        this.emit('goal:completed', goal.getDefinition());
      }
    }
  }

  /**
   * Update goal progress manually
   */
  public updateGoalProgress(goalId: string, progress: number): void {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal with ID '${goalId}' not found`);
    }
    
    goal.updateProgress(progress);
    this.emit('goal:updated', goal.getDefinition());
    
    if (progress >= 100) {
      this.emit('goal:completed', goal.getDefinition());
    }
  }

  /**
   * Abandon a goal with lessons learned
   */
  public abandonGoal(goalId: string, lessons: string[]): void {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal with ID '${goalId}' not found`);
    }
    
    goal.abandon(lessons);
    this.emit('goal:abandoned', { goal: goal.getDefinition(), lessons });
  }

  /**
   * Get goal progress metrics
   */
  public getProgressMetrics(goalId: string): ProgressMetrics {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal with ID '${goalId}' not found`);
    }
    
    const milestones = this.getMilestones(goalId);
    const completedMilestones = milestones.filter(m => m.isCompleted()).length;
    
    return goal.calculateProgressMetrics(completedMilestones);
  }

  /**
   * Build dependency graph for goals
   * 
   * @returns Dependency graph structure
   * 
   * @example
   * ```typescript
   * const graph = manager.buildDependencyGraph();
   * // Use graph for visualization
   * ```
   */
  public buildDependencyGraph(): DependencyGraph {
    const nodes = Array.from(this.goals.values()).map(g => ({
      id: g.getId(),
      title: g.getTitle(),
      status: g.getStatus(),
    }));
    
    const edges: Array<{ from: string; to: string; type: string; strength: number }> = [];
    
    for (const goal of this.goals.values()) {
      const deps = goal.getDefinition().dependencies;
      for (const dep of deps) {
        edges.push({
          from: goal.getId(),
          to: dep.goalId,
          type: dep.type,
          strength: dep.strength,
        });
      }
    }
    
    return { nodes, edges };
  }

  /**
   * Check for circular dependencies
   * 
   * @param goalId - Goal to check
   * @returns True if circular dependency detected
   */
  public hasCircularDependency(goalId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (currentId: string): boolean => {
      visited.add(currentId);
      recursionStack.add(currentId);
      
      const goal = this.goals.get(currentId);
      if (goal) {
        const deps = goal.getDefinition().dependencies;
        for (const dep of deps) {
          if (!visited.has(dep.goalId)) {
            if (dfs(dep.goalId)) return true;
          } else if (recursionStack.has(dep.goalId)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(currentId);
      return false;
    };
    
    return dfs(goalId);
  }

  /**
   * Recommend goals based on values
   * 
   * @param valueIds - Values to base recommendations on
   * @param count - Number of recommendations
   * @returns Array of goal recommendations
   * 
   * @example
   * ```typescript
   * const recommendations = manager.recommendGoals(
   *   [healthValue.getId(), familyValue.getId()],
   *   3
   * );
   * ```
   */
  public recommendGoals(valueIds: string[], count: number = 3): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = [
      {
        id: `rec_${Date.now()}_1`,
        title: 'Weekly family activities',
        description: 'Dedicate one day per week to family bonding activities',
        alignmentScore: 0.9,
        reasoning: ['Aligns with family values', 'Builds stronger relationships', 'Creates lasting memories'],
        relatedValues: valueIds,
        difficulty: 'easy',
      },
      {
        id: `rec_${Date.now()}_2`,
        title: 'Daily exercise routine',
        description: 'Establish a consistent 30-minute exercise routine',
        alignmentScore: 0.85,
        reasoning: ['Supports health values', 'Improves physical wellbeing', 'Boosts energy and mood'],
        relatedValues: valueIds,
        difficulty: 'medium',
      },
      {
        id: `rec_${Date.now()}_3`,
        title: 'Quarterly skill development',
        description: 'Learn a new skill or deepen existing knowledge each quarter',
        alignmentScore: 0.8,
        reasoning: ['Supports growth values', 'Enhances capabilities', 'Opens new opportunities'],
        relatedValues: valueIds,
        difficulty: 'medium',
      },
    ];
    
    return recommendations.slice(0, count);
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
   * Export all goals and milestones
   */
  public export(): { goals: GoalDefinition[]; milestones: MilestoneDefinition[] } {
    return {
      goals: Array.from(this.goals.values()).map(g => g.toJSON()),
      milestones: Array.from(this.milestones.values()).map(m => m.toJSON()),
    };
  }

  /**
   * Import goals and milestones
   */
  public import(data: { goals: GoalDefinition[]; milestones: MilestoneDefinition[] }): void {
    for (const def of data.goals) {
      const goal = Goal.fromJSON(def);
      this.goals.set(goal.getId(), goal);
    }
    
    for (const def of data.milestones) {
      const milestone = Milestone.fromJSON(def);
      this.milestones.set(milestone.getId(), milestone);
    }
  }

  public clear(): void {
    this.goals.clear();
    this.milestones.clear();
  }
}

/**
 * Values Service
 * 
 * Main orchestrator for the comprehensive values system including goals,
 * accountability, decision support, and all advanced enhancements.
 */

import { ValueManager } from './management/ValueManager';
import { GoalManager } from './management/GoalManager';
import { AccountabilityManager } from './management/AccountabilityManager';
import { DecisionSupport } from './management/DecisionSupport';
import { ProgressTracker } from './tracking/ProgressTracker';
import { StreakTracker } from './tracking/StreakTracker';
import { PatternAnalyzer } from './tracking/PatternAnalyzer';
import { SuccessMetrics } from './tracking/SuccessMetrics';
import { MemoryIntegrator } from './integration/MemoryIntegrator';
import { PersonalityAdapter } from './integration/PersonalityAdapter';
import { ConversationBridge } from './integration/ConversationBridge';
import { ValuesServiceConfig, ValuesEvent, ValuesExport, CelebrationEvent, ReflectionPrompt, HabitFormation, Badge, Level, CommitmentFrequency } from './types';

/**
 * Comprehensive Values Service
 * 
 * @example
 * ```typescript
 * const service = new ValuesService({
 *   userId: 'user123',
 *   enableGamification: true,
 *   enableNotifications: true
 * });
 * 
 * // Create a value
 * const value = service.getValueManager().createValue({
 *   name: 'Health',
 *   category: ValueCategory.HEALTH,
 *   priority: 9,
 *   description: 'Maintaining physical and mental wellbeing'
 * });
 * 
 * // Create a goal
 * const goal = service.getGoalManager().createGoal({
 *   title: 'Exercise regularly',
 *   timeframe: GoalTimeframe.LONG_TERM,
 *   linkedValues: [value.getId()]
 * });
 * ```
 */
export class ValuesService {
  private config: ValuesServiceConfig;
  private valueManager: ValueManager;
  private goalManager: GoalManager;
  private accountabilityManager: AccountabilityManager;
  private decisionSupport: DecisionSupport;
  private progressTracker: ProgressTracker;
  private streakTracker: StreakTracker;
  private patternAnalyzer: PatternAnalyzer;
  private successMetrics: SuccessMetrics;
  private memoryIntegrator: MemoryIntegrator;
  private personalityAdapter: PersonalityAdapter;
  private conversationBridge: ConversationBridge;
  
  private celebrations: CelebrationEvent[] = [];
  private reflectionPrompts: ReflectionPrompt[] = [];
  private habits: Map<string, HabitFormation> = new Map();
  private gamificationLevel: Level = {
    level: 1,
    title: 'Beginner',
    pointsRequired: 0,
    pointsCurrent: 0,
    nextLevelPoints: 100,
  };
  
  private eventHandlers: Map<string, Array<(data: unknown) => void>> = new Map();

  /**
   * Create a new Values Service instance
   * 
   * @param config - Service configuration
   */
  constructor(config: ValuesServiceConfig) {
    this.config = config;
    
    // Initialize managers
    this.valueManager = new ValueManager();
    this.goalManager = new GoalManager();
    this.accountabilityManager = new AccountabilityManager();
    this.decisionSupport = new DecisionSupport();
    
    // Initialize trackers
    this.progressTracker = new ProgressTracker();
    this.streakTracker = new StreakTracker();
    this.patternAnalyzer = new PatternAnalyzer();
    this.successMetrics = new SuccessMetrics();
    
    // Initialize integrators
    this.memoryIntegrator = new MemoryIntegrator();
    this.personalityAdapter = new PersonalityAdapter();
    this.conversationBridge = new ConversationBridge();
    
    this.setupEventHandlers();
    this.initializeReflectionPrompts();
  }

  /**
   * Setup internal event handlers
   * 
   * @private
   */
  private setupEventHandlers(): void {
    // Goal completion triggers celebration
    this.goalManager.on('goal:completed', (data: unknown) => {
      const goalData = data as { id: string; title: string };
      this.celebrate({
        id: `celebration_${Date.now()}`,
        type: 'goal',
        title: 'Goal Completed!',
        description: `Congratulations on completing: ${goalData.title}`,
        celebratedAt: new Date(),
        relatedId: goalData.id,
      });
      
      if (this.config.enableGamification) {
        this.awardPoints(50);
      }
    });
    
    // Milestone completion
    this.goalManager.on('milestone:completed', () => {
      if (this.config.enableGamification) {
        this.awardPoints(10);
      }
    });
    
    // Streak milestone
    this.accountabilityManager.on('streak:milestone', (data: unknown) => {
      const streakData = data as { commitmentId: string; streak: number };
      this.celebrate({
        id: `celebration_${Date.now()}`,
        type: 'streak',
        title: 'Streak Milestone!',
        description: `${streakData.streak} day streak achieved!`,
        celebratedAt: new Date(),
        relatedId: streakData.commitmentId,
      });
      
      if (this.config.enableGamification) {
        this.awardPoints(streakData.streak);
      }
    });
  }

  /**
   * Initialize reflection prompts
   * 
   * @private
   */
  private initializeReflectionPrompts(): void {
    this.reflectionPrompts = [
      {
        id: 'prompt_daily_1',
        question: 'What action today best reflected your core values?',
        category: 'values',
        frequency: CommitmentFrequency.DAILY,
        lastAsked: null,
      },
      {
        id: 'prompt_weekly_1',
        question: 'Which goals made meaningful progress this week?',
        category: 'goals',
        frequency: CommitmentFrequency.WEEKLY,
        lastAsked: null,
      },
      {
        id: 'prompt_monthly_1',
        question: 'How have your priorities shifted this month?',
        category: 'reflection',
        frequency: CommitmentFrequency.MONTHLY,
        lastAsked: null,
      },
    ];
  }

  /**
   * Get Value Manager
   * 
   * @returns Value Manager instance
   */
  public getValueManager(): ValueManager {
    return this.valueManager;
  }

  /**
   * Get Goal Manager
   * 
   * @returns Goal Manager instance
   */
  public getGoalManager(): GoalManager {
    return this.goalManager;
  }

  /**
   * Get Accountability Manager
   * 
   * @returns Accountability Manager instance
   */
  public getAccountabilityManager(): AccountabilityManager {
    return this.accountabilityManager;
  }

  /**
   * Get Decision Support
   * 
   * @returns Decision Support instance
   */
  public getDecisionSupport(): DecisionSupport {
    return this.decisionSupport;
  }

  /**
   * Get Progress Tracker
   * 
   * @returns Progress Tracker instance
   */
  public getProgressTracker(): ProgressTracker {
    return this.progressTracker;
  }

  /**
   * Celebrate an achievement
   * 
   * @param event - Celebration event
   * 
   * @example
   * ```typescript
   * service.celebrate({
   *   id: 'cel_123',
   *   type: 'goal',
   *   title: 'First Goal!',
   *   description: 'Completed your first goal',
   *   celebratedAt: new Date(),
   *   relatedId: goal.getId()
   * });
   * ```
   */
  public celebrate(event: CelebrationEvent): void {
    this.celebrations.push(event);
    this.emit(ValuesEvent.BADGE_EARNED, event);
  }

  /**
   * Get recent celebrations
   * 
   * @param days - Days to look back
   * @returns Array of celebrations
   */
  public getRecentCelebrations(days: number = 7): CelebrationEvent[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.celebrations.filter(c => c.celebratedAt >= cutoff);
  }

  /**
   * Get next reflection prompt
   * 
   * @returns Next prompt or null
   * 
   * @example
   * ```typescript
   * const prompt = service.getNextReflectionPrompt();
   * if (prompt) {
   *   console.log(prompt.question);
   * }
   * ```
   */
  public getNextReflectionPrompt(): ReflectionPrompt | null {
    const now = new Date();
    
    for (const prompt of this.reflectionPrompts) {
      if (!prompt.lastAsked) {
        prompt.lastAsked = now;
        return prompt;
      }
      
      const daysSince = (now.getTime() - prompt.lastAsked.getTime()) / (1000 * 60 * 60 * 24);
      const shouldAsk = 
        (prompt.frequency === 'daily' && daysSince >= 1) ||
        (prompt.frequency === 'weekly' && daysSince >= 7) ||
        (prompt.frequency === 'monthly' && daysSince >= 30);
      
      if (shouldAsk) {
        prompt.lastAsked = now;
        return prompt;
      }
    }
    
    return null;
  }

  /**
   * Link a habit to goals
   * 
   * @param habit - Habit formation data
   * 
   * @example
   * ```typescript
   * service.linkHabitToGoals({
   *   habitId: 'habit_123',
   *   name: 'Morning meditation',
   *   cue: 'After waking up',
   *   routine: '10 minutes of mindfulness',
   *   reward: 'Calm, focused start to day',
   *   linkedGoals: [mindfulnessGoal.getId()],
   *   streakDays: 5,
   *   successRate: 0.85
   * });
   * ```
   */
  public linkHabitToGoals(habit: HabitFormation): void {
    this.habits.set(habit.habitId, habit);
  }

  /**
   * Get habits linked to a goal
   * 
   * @param goalId - Goal ID
   * @returns Array of habits
   */
  public getHabitsForGoal(goalId: string): HabitFormation[] {
    return Array.from(this.habits.values()).filter(h => h.linkedGoals.includes(goalId));
  }

  /**
   * Award gamification points
   * 
   * @param points - Points to award
   * @private
   */
  private awardPoints(points: number): void {
    this.gamificationLevel.pointsCurrent += points;
    
    // Check for level up
    while (this.gamificationLevel.pointsCurrent >= this.gamificationLevel.nextLevelPoints) {
      this.gamificationLevel.level++;
      this.gamificationLevel.pointsRequired = this.gamificationLevel.nextLevelPoints;
      this.gamificationLevel.nextLevelPoints = Math.floor(this.gamificationLevel.nextLevelPoints * 1.5);
      
      this.emit(ValuesEvent.LEVEL_UP, {
        level: this.gamificationLevel.level,
        title: this.getLevelTitle(this.gamificationLevel.level),
      });
      
      this.gamificationLevel.title = this.getLevelTitle(this.gamificationLevel.level);
    }
  }

  /**
   * Get level title
   * 
   * @param level - Level number
   * @returns Level title
   * @private
   */
  private getLevelTitle(level: number): string {
    if (level < 5) return 'Beginner';
    if (level < 10) return 'Committed';
    if (level < 20) return 'Dedicated';
    if (level < 30) return 'Expert';
    return 'Master';
  }

  /**
   * Get current gamification level
   * 
   * @returns Current level
   */
  public getLevel(): Level {
    return { ...this.gamificationLevel };
  }

  /**
   * Get comprehensive analytics
   * 
   * @returns Analytics dashboard
   * 
   * @example
   * ```typescript
   * const analytics = service.getAnalytics();
   * console.log(`${analytics.activeGoals} active goals`);
   * console.log(`${analytics.completionRate}% completion rate`);
   * ```
   */
  public getAnalytics(): {
    activeGoals: number;
    completedGoals: number;
    completionRate: number;
    activeCommitments: number;
    averageStreak: number;
    topValues: string[];
    recentAchievements: CelebrationEvent[];
  } {
    const goals = this.goalManager.getAllGoals();
    const activeGoals = goals.filter(g => g.getStatus() === 'active').length;
    const completedGoals = goals.filter(g => g.getStatus() === 'completed').length;
    const completionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;
    
    const commitments = this.accountabilityManager.getAllCommitments(true);
    const averageStreak = commitments.length > 0
      ? commitments.reduce((sum, c) => sum + c.getStreak().current, 0) / commitments.length
      : 0;
    
    const values = this.valueManager.getValuesByPriority(true);
    const topValues = values.slice(0, 3).map(v => v.getName());
    
    return {
      activeGoals,
      completedGoals,
      completionRate,
      activeCommitments: commitments.length,
      averageStreak,
      topValues,
      recentAchievements: this.getRecentCelebrations(7),
    };
  }

  /**
   * Export all data
   * 
   * @returns Complete export
   * 
   * @example
   * ```typescript
   * const data = service.exportData();
   * localStorage.setItem('valuesBackup', JSON.stringify(data));
   * ```
   */
  public exportData(): ValuesExport {
    const exported = this.goalManager.export();
    return {
      version: '1.0.0',
      exportedAt: new Date(),
      userId: this.config.userId,
      values: this.valueManager.export(),
      goals: exported.goals,
      commitments: this.accountabilityManager.export(),
      decisions: this.decisionSupport.export(),
      metadata: {
        gamificationLevel: this.gamificationLevel,
        celebrations: this.celebrations,
        habits: Array.from(this.habits.values()),
        milestones: exported.milestones,
      },
    };
  }

  /**
   * Import data
   * 
   * @param data - Export data
   * 
   * @example
   * ```typescript
   * const backup = JSON.parse(localStorage.getItem('valuesBackup'));
   * service.importData(backup);
   * ```
   */
  public importData(data: ValuesExport): void {
    this.valueManager.import(data.values as never[]);
    this.goalManager.import({
      goals: data.goals as never[],
      milestones: (data.metadata.milestones || []) as never[],
    });
    this.accountabilityManager.import(data.commitments as never[]);
    this.decisionSupport.import(data.decisions as never[]);
    
    if (data.metadata.gamificationLevel) {
      this.gamificationLevel = data.metadata.gamificationLevel as Level;
    }
    
    if (data.metadata.celebrations) {
      this.celebrations = data.metadata.celebrations as CelebrationEvent[];
    }
    
    if (data.metadata.habits) {
      const habits = data.metadata.habits as HabitFormation[];
      for (const habit of habits) {
        this.habits.set(habit.habitId, habit);
      }
    }
  }

  /**
   * Subscribe to events
   * 
   * @param event - Event name
   * @param handler - Event handler
   * 
   * @example
   * ```typescript
   * service.on(ValuesEvent.GOAL_COMPLETED, (data) => {
   *   console.log('Goal completed!', data);
   * });
   * ```
   */
  public on(event: ValuesEvent | string, handler: (data: unknown) => void): void {
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
  private emit(event: ValuesEvent | string, data: unknown): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Get service health status
   * 
   * @returns Health status
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
  } {
    return {
      status: 'healthy',
      checks: {
        valueManager: this.valueManager !== null,
        goalManager: this.goalManager !== null,
        accountabilityManager: this.accountabilityManager !== null,
        decisionSupport: this.decisionSupport !== null,
      },
    };
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.valueManager.clear();
    this.goalManager.clear();
    this.accountabilityManager.clear();
    this.decisionSupport.clear();
    this.progressTracker.clear();
    this.streakTracker.clear();
    this.patternAnalyzer.clear();
    this.successMetrics.clear();
    this.memoryIntegrator.clear();
    this.celebrations = [];
    this.habits.clear();
    this.eventHandlers.clear();
  }
}

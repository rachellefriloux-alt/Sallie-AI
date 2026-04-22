/**
 * Type Definitions for Values Service
 * 
 * Comprehensive type system for values, goals, accountability, and decision support.
 */

/**
 * Value categories for organizing personal values
 */
export enum ValueCategory {
  PERSONAL = 'personal',
  SOCIAL = 'social',
  PROFESSIONAL = 'professional',
  HEALTH = 'health',
  CREATIVE = 'creative',
  SPIRITUAL = 'spiritual',
}

/**
 * Goal time horizons for categorization
 */
export enum GoalTimeframe {
  SHORT_TERM = 'short_term', // < 3 months
  MEDIUM_TERM = 'medium_term', // 3-12 months
  LONG_TERM = 'long_term', // > 12 months
}

/**
 * Goal status states
 */
export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  PAUSED = 'paused',
  ON_HOLD = 'on_hold',
}

/**
 * Milestone status
 */
export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

/**
 * Commitment frequency
 */
export enum CommitmentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

/**
 * Check-in type
 */
export enum CheckInType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

/**
 * Motivation type
 */
export enum MotivationType {
  INTRINSIC = 'intrinsic',
  EXTRINSIC = 'extrinsic',
  MIXED = 'mixed',
}

/**
 * Decision confidence level
 */
export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/**
 * Value alignment score
 */
export interface AlignmentScore {
  score: number; // 0-1
  details: Record<string, number>;
  conflicts: string[];
}

/**
 * Progress metrics
 */
export interface ProgressMetrics {
  percentage: number; // 0-100
  milestonesCompleted: number;
  totalMilestones: number;
  daysElapsed: number;
  estimatedDaysRemaining: number;
  velocity: number; // progress per day
}

/**
 * Streak information
 */
export interface StreakInfo {
  current: number;
  longest: number;
  lastCheckIn: Date;
  totalCheckIns: number;
}

/**
 * Pattern insights
 */
export interface PatternInsight {
  type: 'success' | 'failure' | 'warning';
  pattern: string;
  description: string;
  confidence: number; // 0-1
  occurrences: number;
  suggestions: string[];
}

/**
 * Gamification badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: string;
}

/**
 * Gamification level
 */
export interface Level {
  level: number;
  title: string;
  pointsRequired: number;
  pointsCurrent: number;
  nextLevelPoints: number;
}

/**
 * Analytics data point
 */
export interface AnalyticsDataPoint {
  timestamp: Date;
  metric: string;
  value: number;
  metadata?: Record<string, unknown>;
}

/**
 * Decision outcome
 */
export interface DecisionOutcome {
  decisionId: string;
  actualOutcome: string;
  successRating: number; // 0-10
  lessons: string[];
  recordedAt: Date;
}

/**
 * Reflection prompt
 */
export interface ReflectionPrompt {
  id: string;
  question: string;
  category: string;
  frequency: CommitmentFrequency;
  lastAsked: Date | null;
}

/**
 * Celebration event
 */
export interface CelebrationEvent {
  id: string;
  type: 'milestone' | 'goal' | 'streak' | 'badge';
  title: string;
  description: string;
  celebratedAt: Date;
  relatedId: string;
}

/**
 * Habit formation data
 */
export interface HabitFormation {
  habitId: string;
  name: string;
  cue: string;
  routine: string;
  reward: string;
  linkedGoals: string[];
  streakDays: number;
  successRate: number; // 0-1
}

/**
 * Social accountability share
 */
export interface SocialShare {
  id: string;
  goalId: string;
  sharedWith: string[];
  shareType: 'progress' | 'commitment' | 'achievement';
  visibility: 'private' | 'friends' | 'public';
  createdAt: Date;
}

/**
 * Value drift alert
 */
export interface ValueDriftAlert {
  id: string;
  valueId: string;
  driftScore: number; // 0-1
  recentActions: string[];
  suggestedActions: string[];
  detectedAt: Date;
}

/**
 * Goal recommendation
 */
export interface GoalRecommendation {
  id: string;
  title: string;
  description: string;
  alignmentScore: number; // 0-1
  reasoning: string[];
  relatedValues: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Setback recovery plan
 */
export interface RecoveryPlan {
  id: string;
  setbackDescription: string;
  emotionalImpact: number; // 0-10
  strategies: string[];
  timeline: string;
  supportResources: string[];
  createdAt: Date;
}

/**
 * Export/Import format
 */
export interface ValuesExport {
  version: string;
  exportedAt: Date;
  userId: string;
  values: unknown[];
  goals: unknown[];
  commitments: unknown[];
  decisions: unknown[];
  metadata: Record<string, unknown>;
}

/**
 * Event types emitted by the service
 */
export enum ValuesEvent {
  VALUE_CREATED = 'value:created',
  VALUE_UPDATED = 'value:updated',
  VALUE_DELETED = 'value:deleted',
  GOAL_CREATED = 'goal:created',
  GOAL_UPDATED = 'goal:updated',
  GOAL_COMPLETED = 'goal:completed',
  GOAL_ABANDONED = 'goal:abandoned',
  MILESTONE_COMPLETED = 'milestone:completed',
  COMMITMENT_CREATED = 'commitment:created',
  COMMITMENT_CHECKED = 'commitment:checked',
  STREAK_MILESTONE = 'streak:milestone',
  DECISION_MADE = 'decision:made',
  DECISION_OUTCOME_RECORDED = 'decision:outcome',
  VALUE_DRIFT_DETECTED = 'value:drift',
  BADGE_EARNED = 'badge:earned',
  LEVEL_UP = 'level:up',
}

/**
 * Service configuration options
 */
export interface ValuesServiceConfig {
  userId: string;
  enableGamification?: boolean;
  enableSocialSharing?: boolean;
  enableNotifications?: boolean;
  defaultCheckInFrequency?: CommitmentFrequency;
  driftDetectionThreshold?: number; // 0-1
  autoSuggestGoals?: boolean;
}

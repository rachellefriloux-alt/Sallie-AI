/**
 * Values Service Exports
 * 
 * Comprehensive values, goals, accountability, and decision support system.
 */

// Main Service
export { ValuesService } from './ValuesService';

// Managers
export { ValueManager } from './management/ValueManager';
export { GoalManager } from './management/GoalManager';
export { AccountabilityManager } from './management/AccountabilityManager';
export { DecisionSupport } from './management/DecisionSupport';

// Models
export { Value } from './models/Value';
export type { ValueDefinition } from './models/Value';
export { Goal } from './models/Goal';
export type { GoalDefinition, GoalDependency } from './models/Goal';
export { Milestone } from './models/Milestone';
export type { MilestoneDefinition } from './models/Milestone';
export { Commitment } from './models/Commitment';
export type { CommitmentDefinition } from './models/Commitment';
export { Decision } from './models/Decision';
export type { DecisionDefinition, DecisionOption } from './models/Decision';
export { Assessment } from './models/Assessment';
export type { AssessmentDefinition, AssessmentQuestion } from './models/Assessment';

// Trackers
export { ProgressTracker } from './tracking/ProgressTracker';
export { StreakTracker } from './tracking/StreakTracker';
export { PatternAnalyzer } from './tracking/PatternAnalyzer';
export { SuccessMetrics } from './tracking/SuccessMetrics';

// Integrators
export { MemoryIntegrator } from './integration/MemoryIntegrator';
export { PersonalityAdapter } from './integration/PersonalityAdapter';
export { ConversationBridge } from './integration/ConversationBridge';

// Types
export { ValueCategory, GoalTimeframe, GoalStatus, MilestoneStatus, CommitmentFrequency, CheckInType, MotivationType, ConfidenceLevel, ValuesEvent } from './types';
export type { AlignmentScore, ProgressMetrics, StreakInfo, PatternInsight, Badge, Level, AnalyticsDataPoint, DecisionOutcome, ReflectionPrompt, CelebrationEvent, HabitFormation, SocialShare, ValueDriftAlert, GoalRecommendation, RecoveryPlan, ValuesExport, ValuesServiceConfig } from './types';

/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie AI - Module Exports Index                                           │
 * │                                                                              │
 * │   Central export point for all AI modules and systems                        │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

// Core AI Systems
export * from './nlpEngine';
export * from './EmotionRecognitionSystem';
export * from './PredictiveSuggestionsEngine';

// ML Personalization Engine - explicit exports to avoid conflicts
export {
  MLPersonalizationEngine,
  ContentItem,
  PersonalizationResult,
  MLModel,
  RecommendationEngine,
  AdaptiveLearningSystem
} from './MLPersonalizationEngine';

// Advanced Features
export * from './VoiceAudioIntegration';
export * from './ARVRIntegration';

// Security & Privacy System - explicit exports to avoid conflicts
export {
  SecurityPrivacySystem,
  EncryptionKey,
  DataRetentionPolicy,
  SecurityAudit,
  PrivacyAudit,
  AccessControl,
  ThreatDetection
} from './SecurityPrivacySystem';

export * from './MultiPlatformSupport';

// Infrastructure
export * from './DatabaseIntegration';

// Social Features - explicit exports to avoid conflicts
export {
  SocialFeatures,
  SocialStats,
  SharedConversation,
  CommunityInsight,
  SocialRecommendation,
  CollaborationSession,
  SocialMetrics
} from './SocialFeatures';

// QA & Testing
export * from './QATestingFramework';

// Personal Features
export * from './PersonalFeatures';

// Utilities - explicit exports to avoid conflicts
export {
  MoodSignal,
  MoodContext,
  parseMoodSignal,
  analyzeSentimentLocal,
  extractKeywordsLocal
} from './moodSignal';

export {
  IntentRoute,
  IntentSignal
} from './intentRouter';

// Explicit export for routeIntent to avoid conflict
export { routeIntent } from './intentRouter';

// Legacy JavaScript modules (if needed)
// export * from './OpenAIIntegration';

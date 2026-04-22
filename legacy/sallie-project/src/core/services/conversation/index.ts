/**
 * Conversation System Exports
 */

// Main Service
export { ConversationService } from './ConversationService';
export type { ProcessMessageOptions, ConversationResponse, StreamingOptions } from './ConversationService';

// Models
export * from './models/Intent';
export * from './models/Entity';
export * from './models/ConversationContext';
export * from './models/SpeechAct';
export * from './models/DialogueState';

// NLU Components
export { IntentRecognizer } from './nlu/IntentRecognizer';
export { EntityExtractor } from './nlu/EntityExtractor';
export { ContextManager } from './nlu/ContextManager';
export { SentimentAnalyzer } from './nlu/SentimentAnalyzer';
export { TopicModeler } from './nlu/TopicModeler';
export { ReferenceResolver } from './nlu/ReferenceResolver';
export { SpeechActClassifier } from './nlu/SpeechActClassifier';

// Generation Components
export { ResponseGenerator } from './generation/ResponseGenerator';
export { TemplateEngine } from './generation/TemplateEngine';
export { ContentFiller } from './generation/ContentFiller';
export { PersonalityStyler } from './generation/PersonalityStyler';
export type { PersonalityTraits } from './generation/PersonalityStyler';
export { MemoryIntegrator } from './generation/MemoryIntegrator';
export type { Memory } from './generation/MemoryIntegrator';
export { AppropriatenessChecker } from './generation/AppropriatenessChecker';
export { DiversityManager } from './generation/DiversityManager';

// Dialogue Components
export { DialogueManager } from './dialogue/DialogueManager';
export { FlowController } from './dialogue/FlowController';
export { TurnTakingManager } from './dialogue/TurnTakingManager';
export { ClarificationEngine } from './dialogue/ClarificationEngine';
export { RepairStrategy } from './dialogue/RepairStrategy';
export { TopicSuggester } from './dialogue/TopicSuggester';
export { ConversationMemory } from './dialogue/ConversationMemory';
export { MetaConversationHandler } from './dialogue/MetaConversationHandler';
export type { MetaConversationTrigger } from './dialogue/MetaConversationHandler';

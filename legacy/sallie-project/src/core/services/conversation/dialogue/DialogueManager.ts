/**
 * Dialogue Manager
 * Main orchestrator for dialogue management
 */

import { DialogueState, DialoguePhase, TurnStatus, InitiativeHolder } from '../models/DialogueState';
import { ConversationContext } from '../models/ConversationContext';
import { FlowController } from './FlowController';
import { TurnTakingManager } from './TurnTakingManager';
import { ClarificationEngine } from './ClarificationEngine';
import { RepairStrategy } from './RepairStrategy';
import { TopicSuggester } from './TopicSuggester';
import { ConversationMemory } from './ConversationMemory';
import { MetaConversationHandler } from './MetaConversationHandler';

export class DialogueManager {
  private states: Map<string, DialogueState>;
  private flowController: FlowController;
  private turnTakingManager: TurnTakingManager;
  private clarificationEngine: ClarificationEngine;
  private repairStrategy: RepairStrategy;
  private topicSuggester: TopicSuggester;
  private conversationMemory: ConversationMemory;
  private metaConversationHandler: MetaConversationHandler;

  constructor() {
    this.states = new Map();
    this.flowController = new FlowController();
    this.turnTakingManager = new TurnTakingManager();
    this.clarificationEngine = new ClarificationEngine();
    this.repairStrategy = new RepairStrategy();
    this.topicSuggester = new TopicSuggester();
    this.conversationMemory = new ConversationMemory();
    this.metaConversationHandler = new MetaConversationHandler();
  }

  /**
   * Get or create dialogue state
   */
  public getState(conversationId: string): DialogueState {
    if (!this.states.has(conversationId)) {
      this.states.set(conversationId, this.createInitialState());
    }
    return this.states.get(conversationId)!;
  }

  /**
   * Update dialogue state
   */
  public updateState(conversationId: string, context: ConversationContext): void {
    const state = this.getState(conversationId);
    this.flowController.updateState(state, context);
  }

  /**
   * Check if clarification needed
   */
  public checkClarificationNeed(conversationId: string, context: ConversationContext): string | null {
    const state = this.getState(conversationId);
    
    if (state.pendingClarifications.length > 0) {
      const request = state.pendingClarifications[0];
      return this.clarificationEngine.generateClarificationQuestion(request);
    }
    
    return null;
  }

  /**
   * Handle clarification response
   */
  public handleClarificationResponse(conversationId: string, response: string): void {
    const state = this.getState(conversationId);
    
    if (state.pendingClarifications.length > 0) {
      const request = state.pendingClarifications[0];
      const result = this.clarificationEngine.processClarificationResponse(request, response);
      
      if (result.resolved) {
        request.resolved = true;
        state.clarificationHistory.push(request);
        state.pendingClarifications.shift();
      } else {
        request.attempts++;
        if (request.attempts >= 3) {
          state.pendingClarifications.shift(); // Give up after 3 attempts
        }
      }
    }
  }

  /**
   * Detect and handle errors
   */
  public handleErrors(conversationId: string, response: string, context: ConversationContext): string | null {
    const state = this.getState(conversationId);
    const error = this.repairStrategy.detectError(response, context, state);
    
    if (error) {
      error.turnIndex = context.currentTurn;
      state.currentErrors.push(error);
      
      const technique = this.repairStrategy.selectRecoveryTechnique(error);
      return this.repairStrategy.generateRecoveryResponse(technique, error);
    }
    
    return null;
  }

  /**
   * Suggest topic if appropriate
   */
  public suggestTopic(conversationId: string, context: ConversationContext): string | null {
    const state = this.getState(conversationId);
    
    if (!state.canSuggestTopic) return null;
    
    if (this.topicSuggester.detectOpportunity(state, context)) {
      const topic = this.topicSuggester.selectTopic(context, state);
      
      if (topic) {
        state.canSuggestTopic = false; // Don't suggest again immediately
        return this.topicSuggester.generateSuggestion(topic, 'question');
      }
    }
    
    return null;
  }

  /**
   * Calculate response timing
   */
  public calculateResponseTiming(messageLength: number, complexity = 0.5): number {
    return this.turnTakingManager.calculateResponseDelay(messageLength, complexity);
  }

  /**
   * Get conversation memory
   */
  public getConversationMemory(): ConversationMemory {
    return this.conversationMemory;
  }

  /**
   * Check for meta-conversation and handle
   */
  public handleMetaConversation(
    conversationId: string,
    text: string,
    context: ConversationContext
  ): string | null {
    const state = this.getState(conversationId);
    const metaTrigger = this.metaConversationHandler.detectMetaTopic(text, context);

    if (metaTrigger && metaTrigger.confidence > 0.6) {
      return this.metaConversationHandler.generateMetaResponse(metaTrigger, state, context);
    }

    return null;
  }

  /**
   * Get meta-conversation handler
   */
  public getMetaConversationHandler(): MetaConversationHandler {
    return this.metaConversationHandler;
  }

  /**
   * Create initial dialogue state
   */
  private createInitialState(): DialogueState {
    return {
      currentPhase: DialoguePhase.OPENING,
      phaseHistory: [{ phase: DialoguePhase.OPENING, timestamp: new Date() }],
      turnStatus: TurnStatus.WAITING,
      turnCount: 0,
      lastSpeaker: 'user',
      initiativeHolder: InitiativeHolder.USER,
      initiativeHistory: [],
      activeTopics: [],
      topicStack: [],
      topicTransitions: [],
      topicExhausted: false,
      activeGoals: [],
      completedGoals: [],
      pendingClarifications: [],
      clarificationHistory: [],
      currentErrors: [],
      errorHistory: [],
      userEngagementLevel: 0.5,
      conversationDepth: 0.5,
      averageTurnDuration: 2000,
      conversationPace: 'moderate',
      lastUserActivity: new Date(),
      lastAssistantActivity: new Date(),
      needsUserInput: true,
      awaitingConfirmation: false,
      inMultiTurnResponse: false,
      canSuggestTopic: true,
      shouldYieldTurn: false,
      conversationQuality: 0.8,
      metadata: {},
    };
  }

  /**
   * Cleanup old states
   */
  public cleanup(maxAge = 3600000): void {
    const now = Date.now();
    
    for (const [id, state] of this.states.entries()) {
      if (now - state.lastUserActivity.getTime() > maxAge) {
        this.states.delete(id);
      }
    }
    
    this.conversationMemory.cleanup(maxAge);
  }
}

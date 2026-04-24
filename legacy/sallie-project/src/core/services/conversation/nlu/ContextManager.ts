/**
 * Context Manager
 * Manages conversation state and context across turns
 */

import { ConversationContext, ConversationTurn, Topic, ContextElement, ContextUpdateOptions } from '../models/ConversationContext';
import { Entity } from '../models/Entity';
import { Intent } from '../models/Intent';

export class ContextManager {
  private contexts: Map<string, ConversationContext>;
  private readonly defaultWindowSize = 10;

  constructor() {
    this.contexts = new Map();
  }

  /**
   * Create a new conversation context
   */
  public createContext(conversationId: string, userId: string, sessionId: string): ConversationContext {
    const context: ConversationContext = {
      conversationId,
      sessionId,
      userId,
      currentTurn: 0,
      turns: [],
      activeTopics: [],
      topicStack: [],
      focusedEntities: [],
      entityFocusHistory: [],
      recentIntents: [],
      sentimentHistory: [],
      contextWindow: [],
      contextWindowSize: this.defaultWindowSize,
      importantMoments: [],
      startTime: new Date(),
      lastUpdateTime: new Date(),
      conversationState: 'active',
      metadata: {},
    };
    
    this.contexts.set(conversationId, context);
    return context;
  }

  /**
   * Get existing context
   */
  public getContext(conversationId: string): ConversationContext | null {
    return this.contexts.get(conversationId) || null;
  }

  /**
   * Add a turn to the context
   */
  public addTurn(conversationId: string, turn: ConversationTurn): void {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    context.turns.push(turn);
    context.currentTurn = context.turns.length - 1;
    context.lastUpdateTime = new Date();

    // Update context window
    this.updateContextWindow(context, turn);

    // Update focused entities
    if (turn.entities.length > 0) {
      this.updateFocusedEntities(context, turn.entities);
    }

    // Update recent intents
    if (turn.intent) {
      this.updateRecentIntents(context, turn.intent);
    }

    // Update sentiment history
    if (turn.sentiment) {
      context.sentimentHistory.push(turn.sentiment);
      context.currentSentiment = turn.sentiment;
    }
  }

  /**
   * Update active topics
   */
  public updateTopics(conversationId: string, topics: Topic[]): void {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    // Merge with existing topics
    for (const topic of topics) {
      const existing = context.activeTopics.find(t => t.id === topic.id);
      if (existing) {
        existing.mentions++;
        existing.lastMentioned = new Date();
      } else {
        context.activeTopics.push(topic);
      }
    }

    // Sort by importance and recency
    context.activeTopics.sort((a, b) => {
      const scoreA = a.importance * 0.6 + (Date.now() - a.lastMentioned.getTime()) * 0.4;
      const scoreB = b.importance * 0.6 + (Date.now() - b.lastMentioned.getTime()) * 0.4;
      return scoreB - scoreA;
    });

    // Keep only top N topics
    if (context.activeTopics.length > 5) {
      const removed = context.activeTopics.splice(5);
      // Move to topic stack for potential resumption
      context.topicStack.push(...removed.slice(0, 3));
    }
  }

  /**
   * Push topic to stack (nested conversation)
   */
  public pushTopic(conversationId: string, topic: Topic): void {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    context.topicStack.push(topic);
  }

  /**
   * Pop topic from stack
   */
  public popTopic(conversationId: string): Topic | null {
    const context = this.contexts.get(conversationId);
    if (!context || context.topicStack.length === 0) return null;

    return context.topicStack.pop() || null;
  }

  /**
   * Get relevant context for response generation
   */
  public getRelevantContext(conversationId: string, maxElements = 5): ContextElement[] {
    const context = this.contexts.get(conversationId);
    if (!context) return [];

    // Score and rank context elements
    const scored = context.contextWindow.map(element => ({
      element,
      score: this.calculateContextRelevance(element, context),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, maxElements).map(s => s.element);
  }

  /**
   * Mark important moment
   */
  public markImportantMoment(conversationId: string, reason: string, summary: string): void {
    const context = this.contexts.get(conversationId);
    if (!context) return;

    context.importantMoments.push({
      turnIndex: context.currentTurn,
      reason,
      summary,
    });
  }

  /**
   * Update context window with new information
   */
  private updateContextWindow(context: ConversationContext, turn: ConversationTurn): void {
    // Add turn as context element
    context.contextWindow.push({
      type: 'intent',
      id: turn.id,
      data: turn,
      importance: this.calculateTurnImportance(turn),
      timestamp: turn.timestamp,
      turnIndex: context.currentTurn,
    });

    // Prune context window
    this.pruneContextWindow(context);
  }

  /**
   * Prune context window based on recency and importance
   */
  private pruneContextWindow(context: ConversationContext): void {
    if (context.contextWindow.length <= context.contextWindowSize) return;

    // Score each element
    const scored = context.contextWindow.map(element => ({
      element,
      score: this.calculateRetentionScore(element, context),
    }));

    // Sort by score and keep top elements
    scored.sort((a, b) => b.score - a.score);
    context.contextWindow = scored
      .slice(0, context.contextWindowSize)
      .map(s => s.element)
      .sort((a, b) => a.turnIndex - b.turnIndex); // Maintain chronological order
  }

  /**
   * Update focused entities
   */
  private updateFocusedEntities(context: ConversationContext, entities: Entity[]): void {
    const now = new Date();
    
    for (const entity of entities) {
      const existingIndex = context.focusedEntities.findIndex(e => e.id === entity.id);
      
      if (existingIndex >= 0) {
        // Update existing entity
        context.focusedEntities[existingIndex] = entity;
      } else {
        // Add new entity
        context.focusedEntities.push(entity);
      }
      
      // Track focus history
      context.entityFocusHistory.push({
        entityId: entity.id,
        timestamp: now,
      });
    }

    // Keep only recent entities in focus
    if (context.focusedEntities.length > 8) {
      context.focusedEntities = context.focusedEntities.slice(-8);
    }

    // Prune focus history
    if (context.entityFocusHistory.length > 50) {
      context.entityFocusHistory = context.entityFocusHistory.slice(-50);
    }
  }

  /**
   * Update recent intents
   */
  private updateRecentIntents(context: ConversationContext, intent: Intent): void {
    context.recentIntents.push(intent);

    // Keep only last 5 intents
    if (context.recentIntents.length > 5) {
      context.recentIntents = context.recentIntents.slice(-5);
    }
  }

  /**
   * Calculate turn importance
   */
  private calculateTurnImportance(turn: ConversationTurn): number {
    let importance = 0.5;

    // Questions are important
    if (turn.speechAct?.includes('question')) importance += 0.2;

    // Entities make it more important
    importance += Math.min(turn.entities.length * 0.1, 0.3);

    // Strong sentiment is important
    if (turn.sentiment && Math.abs(turn.sentiment.overall) > 0.7) {
      importance += 0.2;
    }

    return Math.min(importance, 1.0);
  }

  /**
   * Calculate context relevance score
   */
  private calculateContextRelevance(element: ContextElement, context: ConversationContext): number {
    let score = element.importance;

    // Recent elements are more relevant
    const ageInTurns = context.currentTurn - element.turnIndex;
    score *= Math.exp(-ageInTurns * 0.1);

    // Topic-related elements are more relevant
    if (element.type === 'topic') {
      const activeTopic = context.activeTopics.find(t => t.id === element.id);
      if (activeTopic) score *= 1.5;
    }

    return score;
  }

  /**
   * Calculate retention score for context pruning
   */
  private calculateRetentionScore(element: ContextElement, context: ConversationContext): number {
    let score = element.importance * 2;

    // Recency bonus
    const ageInTurns = context.currentTurn - element.turnIndex;
    score += Math.exp(-ageInTurns * 0.15);

    // Important moments get retained
    const isImportant = context.importantMoments.some(m => m.turnIndex === element.turnIndex);
    if (isImportant) score *= 2;

    return score;
  }

  /**
   * Clear old contexts
   */
  public cleanup(maxAge = 3600000): void {
    const now = Date.now();
    
    for (const [id, context] of this.contexts.entries()) {
      if (now - context.lastUpdateTime.getTime() > maxAge) {
        this.contexts.delete(id);
      }
    }
  }
}

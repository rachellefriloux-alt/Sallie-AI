/**
 * Topic Suggester
 * Proactively suggests relevant topics
 */

import { Topic, ConversationContext } from '../models/ConversationContext';
import { DialogueState } from '../models/DialogueState';

export class TopicSuggester {
  private topicCatalog: Topic[] = [];

  /**
   * Detect opportunity for topic suggestion
   */
  public detectOpportunity(state: DialogueState, context: ConversationContext): boolean {
    // Conversation lull
    if (this.detectLull(state, context)) return true;
    
    // Topic exhausted
    if (state.topicExhausted) return true;
    
    // Low engagement
    if (state.userEngagementLevel < 0.4) return true;
    
    // Natural break point
    if (this.isNaturalBreak(context)) return true;
    
    return false;
  }

  /**
   * Select topic to suggest
   */
  public selectTopic(context: ConversationContext, state: DialogueState): Topic | null {
    const candidates = this.topicCatalog.map(topic => ({
      topic,
      score: this.scoreTopicRelevance(topic, context, state),
    }));

    candidates.sort((a, b) => b.score - a.score);

    return candidates.length > 0 && candidates[0].score > 0.5 ? candidates[0].topic : null;
  }

  /**
   * Generate topic suggestion
   */
  public generateSuggestion(topic: Topic, style: 'casual' | 'connection' | 'question'): string {
    switch (style) {
      case 'casual':
        return `By the way, have you thought about ${topic.name}?`;
      case 'connection':
        return `That reminds me - we could also discuss ${topic.name}.`;
      case 'question':
        return `Would you like to talk about ${topic.name}?`;
    }
  }

  /**
   * Assess if suggestion was accepted
   */
  public assessAcceptance(response: string): boolean {
    // Positive indicators
    if (/^(yes|yeah|sure|okay|tell me|what about)\b/i.test(response)) return true;
    
    // Question about topic
    if (response.includes('?')) return true;
    
    // Negative indicators
    if (/^(no|not really|maybe later|skip)\b/i.test(response)) return false;
    
    // Neutral - consider accepted if user engages
    return response.length > 20;
  }

  /**
   * Add topic to catalog
   */
  public addTopic(topic: Topic): void {
    if (!this.topicCatalog.find(t => t.id === topic.id)) {
      this.topicCatalog.push(topic);
    }
  }

  /**
   * Detect conversation lull
   */
  private detectLull(state: DialogueState, context: ConversationContext): boolean {
    if (context.turns.length < 3) return false;
    
    // Short recent messages
    const recentTurns = context.turns.slice(-3);
    const avgLength = recentTurns.reduce((sum, t) => sum + t.text.length, 0) / recentTurns.length;
    
    return avgLength < 30;
  }

  /**
   * Check for natural break
   */
  private isNaturalBreak(context: ConversationContext): boolean {
    if (context.turns.length === 0) return false;
    
    const lastTurn = context.turns[context.turns.length - 1];
    
    // User gave brief acknowledgment
    if (/^(okay|ok|got it|thanks|cool|nice|alright)\s*$/i.test(lastTurn.text.trim())) {
      return true;
    }
    
    return false;
  }

  /**
   * Score topic relevance
   */
  private scoreTopicRelevance(topic: Topic, context: ConversationContext, state: DialogueState): number {
    let score = 0.5;
    
    // Related to active topics
    for (const activeTopic of state.activeTopics) {
      if (activeTopic.relatedTopicIds.includes(topic.id)) {
        score += 0.3;
        break;
      }
    }
    
    // Not recently discussed
    const recentText = context.turns.slice(-10).map(t => t.text).join(' ').toLowerCase();
    if (!recentText.includes(topic.name.toLowerCase())) {
      score += 0.2;
    }
    
    // High importance
    score += topic.importance * 0.2;
    
    return Math.min(score, 1.0);
  }
}

/**
 * Content Filler
 * Fills templates with dynamic, contextually relevant content
 */

import { ConversationContext } from '../models/ConversationContext';
import { Entity } from '../models/Entity';

export interface ContentSource {
  type: 'memory' | 'realtime' | 'generated' | 'context';
  data: any;
  relevance: number;
}

export class ContentFiller {
  /**
   * Fill content based on context
   */
  public fillContent(
    placeholder: string,
    context: ConversationContext,
    entities: Entity[]
  ): string {
    switch (placeholder) {
      case 'topic':
        return this.extractTopic(context);
      case 'emotion':
        return this.extractEmotion(context);
      case 'content':
        return this.generateContent(context, entities);
      case 'support':
        return this.generateSupport(context);
      case 'action':
        return this.extractAction(context);
      case 'timeOfDay':
        return this.getTimeOfDay();
      default:
        return '';
    }
  }

  /**
   * Assess content relevance
   */
  public assessRelevance(content: string, context: ConversationContext): number {
    let relevance = 0.5;

    // Check topic alignment
    for (const topic of context.activeTopics) {
      if (topic.keywords.some(k => content.toLowerCase().includes(k))) {
        relevance += 0.2;
        break;
      }
    }

    // Check entity mentions
    for (const entity of context.focusedEntities) {
      if (content.toLowerCase().includes(entity.text.toLowerCase())) {
        relevance += 0.15;
        break;
      }
    }

    // Check recency
    const recentText = context.turns.slice(-3).map(t => t.text).join(' ');
    const commonWords = this.getCommonWords(content, recentText);
    relevance += Math.min(commonWords * 0.05, 0.15);

    return Math.min(relevance, 1.0);
  }

  /**
   * Adapt content to context
   */
  public adaptContent(
    content: string,
    detailLevel: 'brief' | 'moderate' | 'detailed',
    userEngagement: number
  ): string {
    if (detailLevel === 'brief' || userEngagement < 0.5) {
      return this.summarize(content);
    }

    if (detailLevel === 'detailed' && userEngagement > 0.7) {
      return this.elaborate(content);
    }

    return content;
  }

  /**
   * Extract current topic
   */
  private extractTopic(context: ConversationContext): string {
    if (context.activeTopics.length > 0) {
      return context.activeTopics[0].name;
    }
    return 'that';
  }

  /**
   * Extract emotional state
   */
  private extractEmotion(context: ConversationContext): string {
    if (!context.currentSentiment) return 'neutral';

    const sentiment = context.currentSentiment;
    if (sentiment.overall > 0.5) return 'positive';
    if (sentiment.overall < -0.5) return 'upset';

    // Check dimensions
    const dims = sentiment.dimensions;
    if (dims.joy > 0.6) return 'happy';
    if (dims.sadness > 0.6) return 'sad';
    if (dims.anger > 0.6) return 'frustrated';
    if (dims.fear > 0.6) return 'worried';

    return 'mixed';
  }

  /**
   * Generate contextual content
   */
  private generateContent(context: ConversationContext, entities: Entity[]): string {
    const parts: string[] = [];

    // Add entity information
    if (entities.length > 0) {
      const mainEntity = entities[0];
      parts.push(`regarding ${mainEntity.text}`);
    }

    // Add topic information
    if (context.activeTopics.length > 0) {
      const topic = context.activeTopics[0];
      parts.push(`about ${topic.name}`);
    }

    return parts.join(', ') || 'I\'m here to help';
  }

  /**
   * Generate supportive content
   */
  private generateSupport(context: ConversationContext): string {
    if (!context.currentSentiment) {
      return 'I\'m here for you.';
    }

    const sentiment = context.currentSentiment;
    if (sentiment.dimensions.sadness > 0.6) {
      return 'It\'s okay to feel this way. Would you like to talk about it?';
    }
    if (sentiment.dimensions.anger > 0.6) {
      return 'That sounds frustrating. Let\'s work through this together.';
    }
    if (sentiment.dimensions.fear > 0.6) {
      return 'I understand your concerns. We can figure this out.';
    }

    return 'I\'m here to support you.';
  }

  /**
   * Extract action from context
   */
  private extractAction(context: ConversationContext): string {
    const lastTurn = context.turns[context.turns.length - 1];
    if (!lastTurn) return 'help you';

    const actionVerbs = ['remind', 'schedule', 'set', 'create', 'send', 'call', 'message'];
    const words = lastTurn.text.toLowerCase().split(/\s+/);

    for (const verb of actionVerbs) {
      if (words.includes(verb)) {
        return verb;
      }
    }

    return 'assist you';
  }

  /**
   * Get current time of day
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Summarize content
   */
  private summarize(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length <= 1) return content;
    return sentences[0].trim() + '.';
  }

  /**
   * Elaborate content
   */
  private elaborate(content: string): string {
    return content + ' Let me know if you\'d like more details.';
  }

  /**
   * Get common words between two texts
   */
  private getCommonWords(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    let common = 0;

    for (const word of words1) {
      if (words2.has(word) && word.length > 3) {
        common++;
      }
    }

    return common;
  }
}

/**
 * Appropriateness Checker
 * Validates response appropriateness before delivery
 */

import { ConversationContext } from '../models/ConversationContext';

export interface AppropriatenessResult {
  appropriate: boolean;
  issues: string[];
  score: number;
  suggestions?: string[];
}

export class AppropriatenessChecker {
  private problematicPatterns: RegExp[];
  private sensitiveTopics: Set<string>;

  constructor() {
    this.problematicPatterns = [
      /\b(stupid|idiot|dumb|moron)\b/i,
      /\b(hate|despise)\b/i,
    ];
    this.sensitiveTopics = new Set(['politics', 'religion', 'controversial']);
  }

  /**
   * Check response appropriateness
   */
  public check(response: string, context: ConversationContext): AppropriatenessResult {
    const issues: string[] = [];
    let score = 1.0;

    // Check for problematic content
    if (this.hasProblematicContent(response)) {
      issues.push('Contains potentially inappropriate language');
      score -= 0.4;
    }

    // Check relevance
    const relevance = this.checkRelevance(response, context);
    if (relevance < 0.4) {
      issues.push('Response may not be relevant to conversation');
      score -= 0.3;
    }

    // Check emotional appropriateness
    if (!this.isEmotionallyAppropriate(response, context)) {
      issues.push('Emotional tone may not match context');
      score -= 0.2;
    }

    // Check length
    if (response.length > 500) {
      issues.push('Response may be too long');
      score -= 0.1;
    }

    // Check for repetition
    if (this.isRepetitive(response, context)) {
      issues.push('Response may be repetitive');
      score -= 0.2;
    }

    const appropriate = score >= 0.6 && issues.length === 0;

    return {
      appropriate,
      issues,
      score: Math.max(0, score),
      suggestions: appropriate ? undefined : this.generateSuggestions(issues),
    };
  }

  /**
   * Check for problematic content
   */
  private hasProblematicContent(text: string): boolean {
    return this.problematicPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check relevance to conversation
   */
  private checkRelevance(response: string, context: ConversationContext): number {
    if (context.turns.length === 0) return 0.8;

    const lastTurn = context.turns[context.turns.length - 1];
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    const contextWords = new Set(lastTurn.text.toLowerCase().split(/\s+/));

    let overlap = 0;
    for (const word of responseWords) {
      if (contextWords.has(word) && word.length > 3) {
        overlap++;
      }
    }

    const relevance = overlap / Math.max(responseWords.size, 1);
    return Math.min(relevance * 2, 1.0);
  }

  /**
   * Check emotional appropriateness
   */
  private isEmotionallyAppropriate(response: string, context: ConversationContext): boolean {
    if (!context.currentSentiment) return true;

    const sentiment = context.currentSentiment;

    // Don't be overly cheerful when user is sad
    if (sentiment.dimensions.sadness > 0.7) {
      const cheerfulWords = /\b(great|fantastic|awesome|amazing|perfect)\b/i;
      if (cheerfulWords.test(response)) return false;
    }

    // Don't be dismissive when user is angry
    if (sentiment.dimensions.anger > 0.7) {
      const dismissiveWords = /\b(calm down|relax|chill|whatever)\b/i;
      if (dismissiveWords.test(response)) return false;
    }

    return true;
  }

  /**
   * Check for repetition
   */
  private isRepetitive(response: string, context: ConversationContext): boolean {
    if (context.turns.length < 2) return false;

    const recentResponses = context.turns
      .slice(-5)
      .filter(t => t.speaker === 'assistant')
      .map(t => t.text.toLowerCase());

    const responseLower = response.toLowerCase();

    for (const prev of recentResponses) {
      // Check for exact or near-exact repetition
      if (prev === responseLower) return true;

      // Check for repeated phrases
      const responseWords = responseLower.split(/\s+/);
      const prevWords = prev.split(/\s+/);
      
      let matchCount = 0;
      for (let i = 0; i < responseWords.length - 2; i++) {
        const trigram = responseWords.slice(i, i + 3).join(' ');
        if (prev.includes(trigram)) {
          matchCount++;
        }
      }

      if (matchCount > 2) return true;
    }

    return false;
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(issues: string[]): string[] {
    const suggestions: string[] = [];

    for (const issue of issues) {
      if (issue.includes('inappropriate language')) {
        suggestions.push('Rephrase to use more appropriate language');
      }
      if (issue.includes('not be relevant')) {
        suggestions.push('Focus more on the current conversation topic');
      }
      if (issue.includes('Emotional tone')) {
        suggestions.push('Adjust emotional tone to match user state');
      }
      if (issue.includes('too long')) {
        suggestions.push('Shorten response for better engagement');
      }
      if (issue.includes('repetitive')) {
        suggestions.push('Generate a more varied response');
      }
    }

    return suggestions;
  }
}

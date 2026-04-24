/**
 * Conversation Memory
 * Tracks conversation history to avoid repetition
 */

import { ConversationContext } from '../models/ConversationContext';

export interface DiscussedContent {
  type: 'topic' | 'information' | 'question' | 'advice';
  content: string;
  timestamp: Date;
  turnIndex: number;
}

export class ConversationMemory {
  private discussedContent: Map<string, DiscussedContent[]> = new Map();

  /**
   * Check if content was already discussed
   */
  public wasDiscussed(
    conversationId: string,
    content: string,
    type: DiscussedContent['type'],
    withinTurns = 10
  ): boolean {
    const history = this.discussedContent.get(conversationId) || [];
    const recentHistory = history.slice(-withinTurns);
    
    return recentHistory.some(item => 
      item.type === type && this.isSimilar(item.content, content)
    );
  }

  /**
   * Record discussed content
   */
  public recordDiscussion(
    conversationId: string,
    content: string,
    type: DiscussedContent['type'],
    turnIndex: number
  ): void {
    if (!this.discussedContent.has(conversationId)) {
      this.discussedContent.set(conversationId, []);
    }
    
    const history = this.discussedContent.get(conversationId)!;
    history.push({
      type,
      content: content.toLowerCase(),
      timestamp: new Date(),
      turnIndex,
    });
    
    // Keep only recent history
    if (history.length > 100) {
      this.discussedContent.set(conversationId, history.slice(-100));
    }
  }

  /**
   * Get discussion history
   */
  public getHistory(conversationId: string, type?: DiscussedContent['type']): DiscussedContent[] {
    const history = this.discussedContent.get(conversationId) || [];
    
    if (type) {
      return history.filter(item => item.type === type);
    }
    
    return history;
  }

  /**
   * Check for contradictions
   */
  public findContradictions(conversationId: string, statement: string): DiscussedContent[] {
    const history = this.discussedContent.get(conversationId) || [];
    const contradictions: DiscussedContent[] = [];
    
    const normalized = statement.toLowerCase();
    
    for (const item of history) {
      if (this.isContradictory(normalized, item.content)) {
        contradictions.push(item);
      }
    }
    
    return contradictions;
  }

  /**
   * Generate continuity check
   */
  public checkContinuity(
    conversationId: string,
    newStatement: string
  ): { consistent: boolean; issues: string[] } {
    const contradictions = this.findContradictions(conversationId, newStatement);
    
    return {
      consistent: contradictions.length === 0,
      issues: contradictions.map(c => `Contradicts previous statement: "${c.content}"`),
    };
  }

  /**
   * Clear old conversations
   */
  public cleanup(maxAge = 3600000): void {
    const now = Date.now();
    
    for (const [id, history] of this.discussedContent.entries()) {
      const filtered = history.filter(item => 
        now - item.timestamp.getTime() < maxAge
      );
      
      if (filtered.length === 0) {
        this.discussedContent.delete(id);
      } else {
        this.discussedContent.set(id, filtered);
      }
    }
  }

  /**
   * Check similarity between two texts
   */
  private isSimilar(text1: string, text2: string): boolean {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    let intersection = 0;
    for (const word of words1) {
      if (words2.has(word) && word.length > 3) {
        intersection++;
      }
    }
    
    const similarity = intersection / Math.max(words1.size, words2.size);
    return similarity > 0.6;
  }

  /**
   * Check if statements are contradictory
   */
  private isContradictory(statement1: string, statement2: string): boolean {
    // Simple negation detection
    const hasNegation1 = /\b(not|no|never|don't|doesn't|didn't|can't|won't)\b/.test(statement1);
    const hasNegation2 = /\b(not|no|never|don't|doesn't|didn't|can't|won't)\b/.test(statement2);
    
    // If one has negation and other doesn't, and they're similar, might be contradiction
    if (hasNegation1 !== hasNegation2) {
      const words1 = statement1.replace(/\b(not|no|never|don't|doesn't|didn't|can't|won't)\b/g, '').split(/\s+/);
      const words2 = statement2.replace(/\b(not|no|never|don't|doesn't|didn't|can't|won't)\b/g, '').split(/\s+/);
      
      let commonWords = 0;
      for (const word of words1) {
        if (words2.includes(word) && word.length > 3) {
          commonWords++;
        }
      }
      
      return commonWords >= 3;
    }
    
    return false;
  }
}

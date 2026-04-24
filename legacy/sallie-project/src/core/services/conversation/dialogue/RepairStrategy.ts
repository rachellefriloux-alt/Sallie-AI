/**
 * Repair Strategy
 * Handles conversation errors and recovery
 */

import { ConversationError, DialogueState } from '../models/DialogueState';
import { ConversationContext } from '../models/ConversationContext';

export class RepairStrategy {
  /**
   * Detect conversation error
   */
  public detectError(
    response: string,
    context: ConversationContext,
    state: DialogueState
  ): ConversationError | null {
    // Check for explicit corrections
    if (this.hasExplicitCorrection(context)) {
      return this.createError('misunderstanding', 'User explicitly corrected previous statement');
    }
    
    // Check for frustration indicators
    if (this.detectFrustration(context)) {
      return this.createError('expectation_mismatch', 'User showing signs of frustration');
    }
    
    // Check for repeated attempts
    if (this.hasRepeatedAttempts(context)) {
      return this.createError('misunderstanding', 'User repeating similar messages');
    }
    
    return null;
  }

  /**
   * Select recovery technique
   */
  public selectRecoveryTechnique(error: ConversationError): string {
    switch (error.type) {
      case 'misunderstanding':
        return 'apology_and_reframe';
      case 'technical':
        return 'acknowledge_and_retry';
      case 'knowledge_gap':
        return 'acknowledge_limitation';
      case 'expectation_mismatch':
        return 'clarify_capabilities';
      case 'context_loss':
        return 'context_reset';
      default:
        return 'general_apology';
    }
  }

  /**
   * Generate recovery response
   */
  public generateRecoveryResponse(technique: string, error: ConversationError): string {
    switch (technique) {
      case 'apology_and_reframe':
        return "I apologize for the confusion. Let me try to understand better. Could you rephrase that?";
      case 'acknowledge_and_retry':
        return "I'm sorry, I had a technical issue. Let's try that again.";
      case 'acknowledge_limitation':
        return "I apologize, but I don't have information about that yet. Is there something else I can help with?";
      case 'clarify_capabilities':
        return "I want to make sure I can help you properly. Let me clarify what I can assist with.";
      case 'context_reset':
        return "Let's start fresh. What can I help you with?";
      default:
        return "I apologize for any confusion. How can I better assist you?";
    }
  }

  /**
   * Mark error as resolved
   */
  public markResolved(error: ConversationError): void {
    error.resolved = true;
  }

  /**
   * Create error
   */
  private createError(type: ConversationError['type'], description: string): ConversationError {
    return {
      type,
      description,
      turnIndex: -1,
      detectionMethod: 'automatic',
      repairAttempts: 0,
      resolved: false,
      timestamp: new Date(),
    };
  }

  /**
   * Check for explicit corrections
   */
  private hasExplicitCorrection(context: ConversationContext): boolean {
    if (context.turns.length < 2) return false;
    
    const lastTurn = context.turns[context.turns.length - 1];
    return /\b(no|not|actually|wrong|correction|meant)\b/i.test(lastTurn.text);
  }

  /**
   * Detect user frustration
   */
  private detectFrustration(context: ConversationContext): boolean {
    if (!context.currentSentiment) return false;
    
    const sentiment = context.currentSentiment;
    return sentiment.dimensions.anger > 0.6 || sentiment.dimensions.fear > 0.7;
  }

  /**
   * Check for repeated attempts
   */
  private hasRepeatedAttempts(context: ConversationContext): boolean {
    if (context.turns.length < 3) return false;
    
    const recentUserTurns = context.turns
      .slice(-4)
      .filter(t => t.speaker === 'user')
      .map(t => t.text.toLowerCase());
    
    if (recentUserTurns.length < 2) return false;
    
    // Check for similar messages
    for (let i = 0; i < recentUserTurns.length - 1; i++) {
      const similarity = this.calculateSimilarity(recentUserTurns[i], recentUserTurns[i + 1]);
      if (similarity > 0.7) return true;
    }
    
    return false;
  }

  /**
   * Calculate text similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    let intersection = 0;
    for (const word of words1) {
      if (words2.has(word)) intersection++;
    }
    
    const union = words1.size + words2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }
}

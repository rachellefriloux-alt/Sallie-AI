/**
 * Clarification Engine
 * Handles ambiguity and requests for clarification
 */

import { ClarificationRequest } from '../models/DialogueState';
import { ConversationContext } from '../models/ConversationContext';
import { IntentRecognitionResult } from '../models/Intent';
import { Entity } from '../models/Entity';

export class ClarificationEngine {
  /**
   * Detect need for clarification
   */
  public needsClarification(
    intentResult: IntentRecognitionResult,
    entities: Entity[],
    context: ConversationContext
  ): ClarificationRequest | null {
    // Check intent ambiguity
    if (intentResult.needsClarification) {
      return this.createClarificationRequest(
        'ambiguity',
        'intent',
        'direct_question'
      );
    }
    
    // Check for incomplete information
    if (this.hasIncompleteInformation(context)) {
      return this.createClarificationRequest(
        'incomplete',
        'missing_information',
        'direct_question'
      );
    }
    
    // Check for contradictions
    if (this.detectContradiction(context)) {
      return this.createClarificationRequest(
        'contradiction',
        'conflicting_statements',
        'confirmation'
      );
    }
    
    return null;
  }

  /**
   * Generate clarification question
   */
  public generateClarificationQuestion(request: ClarificationRequest): string {
    switch (request.strategy) {
      case 'direct_question':
        return `Could you clarify what you mean by "${request.targetElement}"?`;
      case 'confirmation':
        return `Just to confirm, did you mean ${request.targetElement}?`;
      case 'paraphrase':
        return `If I understand correctly, you're saying ${request.targetElement}. Is that right?`;
      case 'example':
        return `Could you give me an example of what you mean?`;
      case 'multiple_choice':
        return `Did you mean option A or option B?`;
      default:
        return `I want to make sure I understand. Could you tell me more?`;
    }
  }

  /**
   * Process clarification response
   */
  public processClarificationResponse(
    request: ClarificationRequest,
    response: string
  ): { resolved: boolean; interpretation?: string } {
    // Check for affirmative responses
    if (/^(yes|yeah|yep|correct|right|exactly)\b/i.test(response)) {
      return { resolved: true, interpretation: request.targetElement };
    }
    
    // Check for negative responses
    if (/^(no|nope|not really|actually)\b/i.test(response)) {
      return { resolved: false };
    }
    
    // Extract new interpretation
    return { resolved: true, interpretation: response };
  }

  /**
   * Create clarification request
   */
  private createClarificationRequest(
    reason: ClarificationRequest['reason'],
    targetElement: string,
    strategy: ClarificationRequest['strategy']
  ): ClarificationRequest {
    return {
      id: `clarif_${Date.now()}`,
      reason,
      targetElement,
      strategy,
      attempts: 0,
      resolved: false,
      timestamp: new Date(),
    };
  }

  /**
   * Check for incomplete information
   */
  private hasIncompleteInformation(context: ConversationContext): boolean {
    if (context.turns.length === 0) return false;
    
    const lastTurn = context.turns[context.turns.length - 1];
    
    // Very short messages might be incomplete
    if (lastTurn.text.length < 10) return true;
    
    // Trailing "and", "but", etc.
    if (/\b(and|but|so|because)\s*$/i.test(lastTurn.text.trim())) return true;
    
    return false;
  }

  /**
   * Detect contradiction
   */
  private detectContradiction(context: ConversationContext): boolean {
    if (context.turns.length < 2) return false;
    
    const recentTurns = context.turns.slice(-3).filter(t => t.speaker === 'user');
    
    // Check for explicit contradictions
    for (let i = 0; i < recentTurns.length - 1; i++) {
      const curr = recentTurns[i].text.toLowerCase();
      const next = recentTurns[i + 1].text.toLowerCase();
      
      // Simple negation detection
      if (curr.includes('like') && next.includes('don\'t like')) return true;
      if (curr.includes('want') && next.includes('don\'t want')) return true;
    }
    
    return false;
  }
}

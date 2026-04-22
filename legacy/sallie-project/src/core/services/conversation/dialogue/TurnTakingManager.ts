/**
 * Turn Taking Manager
 * Manages natural conversation rhythm and turn transitions
 */

import { DialogueState, TurnStatus } from '../models/DialogueState';
import { ConversationContext } from '../models/ConversationContext';

export class TurnTakingManager {
  /**
   * Determine if assistant should yield turn
   */
  public shouldYieldTurn(state: DialogueState, context: ConversationContext): boolean {
    // Yield after questions
    const lastTurn = context.turns[context.turns.length - 1];
    if (lastTurn?.speaker === 'assistant' && lastTurn.speechAct?.includes('question')) {
      return true;
    }
    
    // Yield if user has initiative
    if (state.initiativeHolder === 'user') return true;
    
    // Yield in multi-turn response
    if (state.inMultiTurnResponse && state.turnCount % 2 === 0) return true;
    
    return false;
  }

  /**
   * Calculate appropriate response delay
   */
  public calculateResponseDelay(
    messageLength: number,
    complexity: number
  ): number {
    // Base delay: 500-1000ms
    let delay = 500 + Math.random() * 500;
    
    // Add delay based on message length (simulate reading)
    delay += (messageLength / 50) * 100;
    
    // Add delay based on complexity (simulate thinking)
    delay += complexity * 500;
    
    // Cap at 3 seconds
    return Math.min(delay, 3000);
  }

  /**
   * Generate backchanneling response
   */
  public generateBackchannel(context: ConversationContext): string | null {
    // Don't backchannel too frequently
    if (Math.random() > 0.3) return null;
    
    const sentiment = context.currentSentiment;
    if (!sentiment) return 'I see';
    
    if (sentiment.overall > 0.5) {
      return ['That\'s great!', 'Wonderful!', 'Nice!'][Math.floor(Math.random() * 3)];
    }
    
    if (sentiment.overall < -0.5) {
      return ['I understand', 'I see', 'Mm-hmm'][Math.floor(Math.random() * 3)];
    }
    
    return ['I see', 'Okay', 'Right', 'Mm-hmm'][Math.floor(Math.random() * 4)];
  }

  /**
   * Handle interruption
   */
  public handleInterruption(state: DialogueState): void {
    // Save current state to stack
    if (state.activeTopics.length > 0) {
      const currentTopic = state.activeTopics[0];
      if (!state.topicStack.includes(currentTopic)) {
        state.topicStack.push(currentTopic);
      }
    }
    
    // Mark that turn was interrupted
    state.turnStatus = TurnStatus.TRANSITION;
  }

  /**
   * Update turn status
   */
  public updateTurnStatus(state: DialogueState, speaker: 'user' | 'assistant'): void {
    state.turnStatus = speaker === 'user' ? TurnStatus.USER_TURN : TurnStatus.ASSISTANT_TURN;
    state.lastSpeaker = speaker;
    state.turnCount++;
    
    if (speaker === 'user') {
      state.lastUserActivity = new Date();
    } else {
      state.lastAssistantActivity = new Date();
    }
  }
}

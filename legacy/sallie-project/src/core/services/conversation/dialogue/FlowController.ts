/**
 * Flow Controller
 * Manages conversation flow, topics, and initiative
 */

import { DialogueState, DialoguePhase, InitiativeHolder, TopicTransition, ConversationGoal } from '../models/DialogueState';
import { Topic, ConversationContext } from '../models/ConversationContext';

export class FlowController {
  /**
   * Update conversation state
   */
  public updateState(state: DialogueState, context: ConversationContext): void {
    this.updatePhase(state, context);
    this.updateInitiative(state, context);
    this.updateEngagement(state, context);
    this.updateTopics(state, context);
  }

  /**
   * Determine if topic transition is needed
   */
  public shouldTransitionTopic(state: DialogueState, context: ConversationContext): boolean {
    // Topic exhausted
    if (state.topicExhausted) return true;
    
    // Low engagement
    if (state.userEngagementLevel < 0.3) return true;
    
    // Goal completed
    const mainGoal = state.activeGoals[0];
    if (mainGoal && mainGoal.completed) return true;
    
    // Topic stale (too many turns)
    const currentTopic = state.activeTopics[0];
    if (currentTopic) {
      const turnsSinceMention = context.turns.length - 
        context.turns.findIndex(t => t.text.toLowerCase().includes(currentTopic.name.toLowerCase()));
      if (turnsSinceMention > 10) return true;
    }
    
    return false;
  }

  /**
   * Select transition strategy
   */
  public selectTransitionStrategy(
    currentTopic: Topic | undefined,
    newTopic: Topic
  ): 'smooth' | 'explicit' | 'question' {
    if (!currentTopic) return 'smooth';
    
    // Check if topics are related
    const related = currentTopic.relatedTopicIds.includes(newTopic.id);
    if (related) return 'smooth';
    
    // Explicit transition for unrelated topics
    return 'explicit';
  }

  /**
   * Generate transition phrase
   */
  public generateTransitionPhrase(
    strategy: 'smooth' | 'explicit' | 'question',
    newTopic: Topic
  ): string {
    switch (strategy) {
      case 'smooth':
        return `Speaking of ${newTopic.name}`;
      case 'explicit':
        return `By the way, I wanted to mention ${newTopic.name}`;
      case 'question':
        return `Would you like to discuss ${newTopic.name}?`;
    }
  }

  /**
   * Track goal progress
   */
  public updateGoalProgress(goal: ConversationGoal, progress: number): void {
    goal.progress = Math.min(progress, 1.0);
    
    if (goal.progress >= 1.0) {
      goal.completed = true;
    }
    
    // Update subgoals
    if (goal.subGoals.length > 0) {
      const completedSubgoals = goal.subGoals.filter(sg => sg.completed).length;
      goal.progress = completedSubgoals / goal.subGoals.length;
    }
  }

  /**
   * Determine initiative holder
   */
  public determineInitiative(state: DialogueState, context: ConversationContext): InitiativeHolder {
    const lastTurn = context.turns[context.turns.length - 1];
    if (!lastTurn) return InitiativeHolder.USER;
    
    // User asked a question -> user has initiative
    if (lastTurn.speaker === 'user' && lastTurn.speechAct?.includes('question')) {
      return InitiativeHolder.USER;
    }
    
    // Assistant asked a question -> assistant has initiative
    if (lastTurn.speaker === 'assistant' && lastTurn.speechAct?.includes('question')) {
      return InitiativeHolder.ASSISTANT;
    }
    
    // Mixed initiative if back-and-forth
    if (context.turns.length >= 4) {
      const recentSpeakers = context.turns.slice(-4).map(t => t.speaker);
      const userInitiated = recentSpeakers.filter(s => s === 'user').length;
      const assistantInitiated = recentSpeakers.filter(s => s === 'assistant').length;
      
      if (Math.abs(userInitiated - assistantInitiated) <= 1) {
        return InitiativeHolder.MIXED;
      }
    }
    
    return state.initiativeHolder;
  }

  /**
   * Update conversation phase
   */
  private updatePhase(state: DialogueState, context: ConversationContext): void {
    if (context.turns.length === 0) {
      state.currentPhase = DialoguePhase.OPENING;
      return;
    }
    
    // Check for clarification needed
    if (state.pendingClarifications.length > 0) {
      state.currentPhase = DialoguePhase.CLARIFICATION;
      return;
    }
    
    // Check for errors
    if (state.currentErrors.length > 0) {
      state.currentPhase = DialoguePhase.REPAIR;
      return;
    }
    
    // Check for closing signals
    const lastTurn = context.turns[context.turns.length - 1];
    if (lastTurn && /\b(bye|goodbye|gotta go|talk later)\b/i.test(lastTurn.text)) {
      state.currentPhase = DialoguePhase.CLOSING;
      return;
    }
    
    // Active goal pursuit
    if (state.activeGoals.length > 0) {
      state.currentPhase = DialoguePhase.GOAL_PURSUIT;
      return;
    }
    
    // Default to topic development
    state.currentPhase = DialoguePhase.TOPIC_DEVELOPMENT;
  }

  /**
   * Update initiative
   */
  private updateInitiative(state: DialogueState, context: ConversationContext): void {
    const newInitiative = this.determineInitiative(state, context);
    
    if (newInitiative !== state.initiativeHolder) {
      state.initiativeHistory.push({
        holder: newInitiative,
        timestamp: new Date(),
      });
      state.initiativeHolder = newInitiative;
    }
  }

  /**
   * Update engagement level
   */
  private updateEngagement(state: DialogueState, context: ConversationContext): void {
    if (context.turns.length === 0) {
      state.userEngagementLevel = 0.5;
      return;
    }
    
    let engagement = 0.5;
    const recentTurns = context.turns.slice(-5);
    
    // Message length indicates engagement
    const avgLength = recentTurns
      .filter(t => t.speaker === 'user')
      .reduce((sum, t) => sum + t.text.length, 0) / Math.max(recentTurns.length, 1);
    
    if (avgLength > 50) engagement += 0.2;
    if (avgLength < 20) engagement -= 0.2;
    
    // Questions indicate engagement
    const questionCount = recentTurns.filter(t => 
      t.speaker === 'user' && t.text.includes('?')
    ).length;
    engagement += questionCount * 0.1;
    
    // Sentiment intensity indicates engagement
    if (context.currentSentiment && context.currentSentiment.intensity > 0.7) {
      engagement += 0.15;
    }
    
    state.userEngagementLevel = Math.max(0, Math.min(1, engagement));
  }

  /**
   * Update active topics
   */
  private updateTopics(state: DialogueState, context: ConversationContext): void {
    state.activeTopics = context.activeTopics.slice(0, 3);
    
    // Check if topic is exhausted
    const mainTopic = state.activeTopics[0];
    if (mainTopic && state.turnCount > 15) {
      const recentMentions = context.turns.slice(-5).filter(t => 
        t.text.toLowerCase().includes(mainTopic.name.toLowerCase())
      ).length;
      
      state.topicExhausted = recentMentions === 0;
    }
  }
}

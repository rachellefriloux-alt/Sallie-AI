/**
 * Meta-Conversation Handler
 * Handles conversations about the conversation itself
 */

import { ConversationContext } from '../models/ConversationContext';
import { DialogueState } from '../models/DialogueState';

export enum MetaTopicType {
  CONVERSATION_QUALITY = 'conversation_quality',
  UNDERSTANDING_CHECK = 'understanding_check',
  PREFERENCE_DISCUSSION = 'preference_discussion',
  CAPABILITY_INQUIRY = 'capability_inquiry',
  FEEDBACK_REQUEST = 'feedback_request',
  COMMUNICATION_STYLE = 'communication_style',
  IMPROVEMENT_SUGGESTION = 'improvement_suggestion',
}

export interface MetaConversationTrigger {
  type: MetaTopicType;
  confidence: number;
  context: string;
  suggestedResponse?: string;
}

export class MetaConversationHandler {
  /**
   * Detect if message is about the conversation itself
   */
  public detectMetaTopic(text: string, context: ConversationContext): MetaConversationTrigger | null {
    const normalized = text.toLowerCase();

    // Check for various meta-conversation patterns
    const patterns = [
      {
        type: MetaTopicType.CONVERSATION_QUALITY,
        patterns: [
          /how (is|was) (this|our) (conversation|chat|discussion)/i,
          /what do you think (of|about) (this|our) (conversation|chat)/i,
          /(is this|are we) having a good (conversation|chat)/i,
        ],
        response: "I think we're having a good conversation. I'm learning about you and trying to be helpful. How do you feel about our interaction?",
      },
      {
        type: MetaTopicType.UNDERSTANDING_CHECK,
        patterns: [
          /do you (understand|get) (what|why) (i'm|i am|im) (saying|talking about)/i,
          /are you (understanding|following|getting) (me|this)/i,
          /(did you|do you) understand (that|what i said)/i,
        ],
        response: "Yes, I'm following along. If I misunderstand something, please let me know and I'll clarify.",
      },
      {
        type: MetaTopicType.PREFERENCE_DISCUSSION,
        patterns: [
          /how (do|should) (you|i) want (me|you) to (talk|communicate|respond)/i,
          /what (kind|type) of (responses|answers|replies) do you (prefer|like)/i,
          /(should|can) (i|you) be more (brief|detailed|casual|formal)/i,
        ],
        response: "I can adapt my communication style to what works best for you. Would you prefer more brief responses, detailed explanations, or something else?",
      },
      {
        type: MetaTopicType.CAPABILITY_INQUIRY,
        patterns: [
          /what can you (do|help with)/i,
          /how (do|does) (you|this|sallie) work/i,
          /what (are|is) (your|sallie's) (capabilities|features|abilities)/i,
          /(tell|show) me what you can do/i,
        ],
        response: "I can help with conversations, answer questions, provide emotional support, and assist with various tasks. I learn from our interactions to better understand and help you. What would you like help with?",
      },
      {
        type: MetaTopicType.FEEDBACK_REQUEST,
        patterns: [
          /how (am i|are we) doing/i,
          /(is there|are there) (anything|things) (i|we) (should|could) (improve|change)/i,
          /do you have (any|some) (feedback|suggestions|advice) for me/i,
        ],
        response: "You're doing great! Our conversation is flowing naturally. If there's anything specific you'd like to discuss or change about how we communicate, I'm happy to adjust.",
      },
      {
        type: MetaTopicType.COMMUNICATION_STYLE,
        patterns: [
          /(why|how) (do|did) you (say|phrase|word) (it|that) (like that|that way)/i,
          /(your|the) (way|style) (of|you) (talking|speaking|responding)/i,
          /(i notice|i've noticed) you (talk|speak|respond)/i,
        ],
        response: "I try to communicate in a way that's natural and helpful. If there's something about my communication style you'd like me to adjust, please let me know.",
      },
      {
        type: MetaTopicType.IMPROVEMENT_SUGGESTION,
        patterns: [
          /you (should|could|might want to) (try|consider)/i,
          /(it would be|it'd be) (better|good) if you/i,
          /have you (thought about|considered|tried)/i,
        ],
        response: "Thank you for the suggestion! I'm always learning and improving. Can you tell me more about what would make our conversation better?",
      },
    ];

    for (const { type, patterns: regexPatterns, response } of patterns) {
      for (const pattern of regexPatterns) {
        if (pattern.test(normalized)) {
          return {
            type,
            confidence: 0.85,
            context: text,
            suggestedResponse: response,
          };
        }
      }
    }

    // Check for implicit meta-conversation cues
    if (this.hasImplicitMetaCues(normalized, context)) {
      return {
        type: MetaTopicType.UNDERSTANDING_CHECK,
        confidence: 0.6,
        context: text,
        suggestedResponse: "I want to make sure I'm understanding you correctly. Could you tell me if I'm on the right track?",
      };
    }

    return null;
  }

  /**
   * Generate meta-conversation response
   */
  public generateMetaResponse(
    trigger: MetaConversationTrigger,
    state: DialogueState,
    context: ConversationContext
  ): string {
    // Use suggested response or generate based on type
    if (trigger.suggestedResponse) {
      return trigger.suggestedResponse;
    }

    switch (trigger.type) {
      case MetaTopicType.CONVERSATION_QUALITY:
        return this.generateQualityAssessment(state, context);
      case MetaTopicType.UNDERSTANDING_CHECK:
        return this.generateUnderstandingCheck(context);
      case MetaTopicType.CAPABILITY_INQUIRY:
        return this.generateCapabilityExplanation();
      case MetaTopicType.FEEDBACK_REQUEST:
        return this.generateFeedbackResponse(state);
      default:
        return "I'm here to help and learn. Is there something specific about our conversation you'd like to discuss?";
    }
  }

  /**
   * Assess conversation quality
   */
  public assessConversationQuality(state: DialogueState, context: ConversationContext): number {
    let quality = 0.5;

    // Factor in engagement
    quality += state.userEngagementLevel * 0.3;

    // Factor in successful exchanges
    if (context.turns.length > 5 && state.currentErrors.length === 0) {
      quality += 0.2;
    }

    // Factor in clarifications needed (fewer is better)
    const clarificationRatio = state.clarificationHistory.length / Math.max(context.turns.length, 1);
    quality -= clarificationRatio * 0.2;

    // Factor in goal completion
    if (state.completedGoals.length > 0) {
      quality += 0.2;
    }

    return Math.max(0, Math.min(1, quality));
  }

  /**
   * Provide self-aware commentary on conversation
   */
  public generateSelfAwareCommentary(state: DialogueState, context: ConversationContext): string | null {
    // Only generate occasionally and when appropriate
    if (Math.random() > 0.2) return null;

    const quality = this.assessConversationQuality(state, context);

    if (quality > 0.7) {
      return "I feel like we're having a really good conversation. I'm learning a lot about you!";
    }

    if (quality < 0.4 && state.currentErrors.length > 0) {
      return "I feel like I might not be understanding you as well as I'd like. Please let me know if I'm missing something.";
    }

    if (state.userEngagementLevel < 0.3) {
      return "I notice you might be losing interest. Is there something else you'd prefer to talk about?";
    }

    return null;
  }

  /**
   * Suggest improvements for conversation
   */
  public suggestImprovements(state: DialogueState, context: ConversationContext): string[] {
    const suggestions: string[] = [];

    // Low engagement
    if (state.userEngagementLevel < 0.4) {
      suggestions.push("Try more engaging topics or questions");
    }

    // Too many errors
    if (state.currentErrors.length > 2) {
      suggestions.push("Request clarification more frequently");
    }

    // Topics exhausted
    if (state.topicExhausted) {
      suggestions.push("Introduce new, related topics");
    }

    // Long turns without user input
    if (state.turnCount > 10 && state.initiativeHolder === 'assistant') {
      suggestions.push("Allow more user-driven conversation");
    }

    return suggestions;
  }

  /**
   * Check for implicit meta-conversation cues
   */
  private hasImplicitMetaCues(text: string, context: ConversationContext): boolean {
    // User showing confusion
    if (/\b(confused|unclear|not sure what you mean)\b/i.test(text)) {
      return true;
    }

    // User redirecting conversation
    if (/\b(anyway|by the way|changing the subject)\b/i.test(text) && context.turns.length < 5) {
      return true;
    }

    return false;
  }

  /**
   * Generate quality assessment
   */
  private generateQualityAssessment(state: DialogueState, context: ConversationContext): string {
    const quality = this.assessConversationQuality(state, context);

    if (quality > 0.7) {
      return "I think we're having a great conversation! The discussion is flowing naturally and I'm learning about your interests.";
    } else if (quality > 0.5) {
      return "Our conversation is going well. I'm following along and trying to be helpful. Let me know if there's anything I can do better.";
    } else {
      return "I want to make sure I'm being helpful. If there's something I can improve or if you'd like to discuss something different, please let me know.";
    }
  }

  /**
   * Generate understanding check
   */
  private generateUnderstandingCheck(context: ConversationContext): string {
    const recentTopics = context.activeTopics.slice(0, 2).map(t => t.name).join(' and ');
    
    if (recentTopics) {
      return `Yes, I'm following along. We've been discussing ${recentTopics}. Please let me know if I misunderstand something.`;
    }
    
    return "Yes, I'm understanding. If I misinterpret anything, please correct me and I'll adjust.";
  }

  /**
   * Generate capability explanation
   */
  private generateCapabilityExplanation(): string {
    return "I can help with various things: answering questions, having conversations, providing emotional support, helping you think through problems, and learning from our interactions to understand you better. What would you like help with?";
  }

  /**
   * Generate feedback response
   */
  private generateFeedbackResponse(state: DialogueState): string {
    if (state.userEngagementLevel > 0.7) {
      return "You're doing great! Our conversation is flowing naturally. Keep sharing what's on your mind.";
    }
    
    return "You're doing well. Feel free to share whatever is on your mind - questions, thoughts, or feelings.";
  }
}

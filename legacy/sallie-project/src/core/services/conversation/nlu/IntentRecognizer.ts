/**
 * Intent Recognizer
 * Identifies user intentions using pattern matching and semantic analysis
 */

import { Intent, IntentType, IntentRecognitionResult } from '../models/Intent';
import { ConversationContext } from '../models/ConversationContext';

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  keywords: string[];
  contextualCues?: string[];
  weight: number;
}

export class IntentRecognizer {
  private patterns: IntentPattern[];
  private userPatternHistory: Map<string, Map<IntentType, number>>;

  constructor() {
    this.patterns = this.initializePatterns();
    this.userPatternHistory = new Map();
  }

  /**
   * Recognize intent from user input
   */
  public recognizeIntent(
    text: string,
    context: ConversationContext
  ): IntentRecognitionResult {
    const normalizedText = this.normalizeText(text);
    const candidateIntents = this.detectCandidateIntents(normalizedText, context);
    
    // Apply contextual disambiguation
    const disambiguated = this.disambiguateIntents(candidateIntents, context);
    
    // Sort by confidence
    disambiguated.sort((a, b) => b.confidence - a.confidence);
    
    const primaryIntent = disambiguated[0] || this.createUnknownIntent();
    const secondaryIntents = disambiguated.slice(1, 3);
    
    const ambiguous = primaryIntent.confidence < 0.7;
    const needsClarification = ambiguous && disambiguated.length > 1 && 
                              (disambiguated[1].confidence > primaryIntent.confidence - 0.15);
    
    return {
      primaryIntent,
      secondaryIntents,
      ambiguous,
      needsClarification,
      alternatives: needsClarification ? disambiguated.slice(0, 3) : undefined,
    };
  }

  /**
   * Learn from user-specific patterns
   */
  public learnUserPattern(userId: string, intent: IntentType, text: string): void {
    if (!this.userPatternHistory.has(userId)) {
      this.userPatternHistory.set(userId, new Map());
    }
    
    const userPatterns = this.userPatternHistory.get(userId)!;
    const currentCount = userPatterns.get(intent) || 0;
    userPatterns.set(intent, currentCount + 1);
  }

  /**
   * Detect multiple intents in a single message
   */
  private detectCandidateIntents(
    text: string,
    context: ConversationContext
  ): Intent[] {
    const intents: Intent[] = [];
    const sentences = this.splitIntoSentences(text);
    
    for (const sentence of sentences) {
      for (const pattern of this.patterns) {
        const confidence = this.calculatePatternConfidence(sentence, pattern, context);
        
        if (confidence > 0.3) {
          intents.push({
            type: pattern.type,
            confidence,
            isPrimary: false,
            parameters: this.extractParameters(sentence, pattern),
          });
        }
      }
    }
    
    // Merge duplicate intent types
    return this.mergeIntents(intents);
  }

  /**
   * Calculate confidence score for a pattern match
   */
  private calculatePatternConfidence(
    text: string,
    pattern: IntentPattern,
    context: ConversationContext
  ): number {
    let score = 0;
    
    // Pattern matching
    const patternMatches = pattern.patterns.filter(p => p.test(text)).length;
    score += (patternMatches / pattern.patterns.length) * 0.4;
    
    // Keyword matching
    const words = text.toLowerCase().split(/\s+/);
    const keywordMatches = pattern.keywords.filter(k => 
      words.some(w => w.includes(k) || k.includes(w))
    ).length;
    if (pattern.keywords.length > 0) {
      score += (keywordMatches / pattern.keywords.length) * 0.3;
    }
    
    // Contextual cues
    if (pattern.contextualCues && context.recentIntents.length > 0) {
      const contextMatch = pattern.contextualCues.some(cue => {
        const lastIntent = context.recentIntents[context.recentIntents.length - 1];
        return lastIntent.type.toString().includes(cue);
      });
      if (contextMatch) score += 0.2;
    }
    
    // User-specific patterns
    const userBoost = this.getUserPatternBoost(context.userId, pattern.type);
    score += userBoost * 0.1;
    
    return Math.min(score * pattern.weight, 1.0);
  }

  /**
   * Disambiguate intents using context
   */
  private disambiguateIntents(
    intents: Intent[],
    context: ConversationContext
  ): Intent[] {
    return intents.map(intent => {
      let confidence = intent.confidence;
      
      // Boost based on conversation flow
      if (context.recentIntents.length > 0) {
        const lastIntent = context.recentIntents[context.recentIntents.length - 1];
        
        // Logical follow-up intents get boosted
        if (this.isLogicalFollowup(lastIntent.type, intent.type)) {
          confidence = Math.min(confidence * 1.2, 1.0);
        }
      }
      
      // Boost based on current goals
      if (context.currentGoal && this.alignsWithGoal(intent.type, context.currentGoal)) {
        confidence = Math.min(confidence * 1.15, 1.0);
      }
      
      return { ...intent, confidence };
    });
  }

  /**
   * Extract parameters from text based on intent type
   */
  private extractParameters(text: string, pattern: IntentPattern): Record<string, any> {
    const params: Record<string, any> = {};
    
    switch (pattern.type) {
      case IntentType.INFORMATION_REQUEST:
        params.topic = this.extractTopic(text);
        params.questionType = this.identifyQuestionType(text);
        break;
      case IntentType.ACTION_REQUEST:
        params.action = this.extractAction(text);
        params.urgency = this.extractUrgency(text);
        break;
      case IntentType.EMOTIONAL_EXPRESSION:
        params.emotion = this.extractEmotion(text);
        params.intensity = this.extractIntensity(text);
        break;
    }
    
    return params;
  }

  /**
   * Initialize intent patterns
   */
  private initializePatterns(): IntentPattern[] {
    return [
      {
        type: IntentType.INFORMATION_REQUEST,
        patterns: [
          /^(what|who|when|where|why|how|which)/i,
          /(tell me|let me know|i want to know|i'm curious|wondering)/i,
          /(can you explain|could you tell|do you know)/i,
        ],
        keywords: ['what', 'who', 'when', 'where', 'why', 'how', 'tell', 'explain', 'know'],
        weight: 1.0,
      },
      {
        type: IntentType.ACTION_REQUEST,
        patterns: [
          /^(please|could you|can you|would you)/i,
          /(do|make|create|set|start|stop|help me)/i,
          /(remind|schedule|send|call|message)/i,
        ],
        keywords: ['please', 'help', 'do', 'make', 'set', 'remind', 'schedule'],
        weight: 1.0,
      },
      {
        type: IntentType.GREETING,
        patterns: [
          /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
          /(what's up|how are you|how's it going)/i,
        ],
        keywords: ['hi', 'hello', 'hey', 'morning', 'afternoon', 'evening'],
        weight: 1.2,
      },
      {
        type: IntentType.FAREWELL,
        patterns: [
          /^(bye|goodbye|see you|talk to you later|gotta go)/i,
          /(have a good|take care|catch you later)/i,
        ],
        keywords: ['bye', 'goodbye', 'later', 'go', 'leave'],
        weight: 1.2,
      },
      {
        type: IntentType.EMOTIONAL_EXPRESSION,
        patterns: [
          /\b(feel|feeling|felt|emotion|mood)\b/i,
          /\b(happy|sad|angry|frustrated|excited|worried|anxious|stressed)\b/i,
          /\b(love|hate|like|dislike|enjoy|prefer)\b/i,
        ],
        keywords: ['feel', 'feeling', 'emotion', 'happy', 'sad', 'love', 'hate'],
        weight: 0.9,
      },
      {
        type: IntentType.PREFERENCE_STATEMENT,
        patterns: [
          /\b(prefer|like|love|enjoy|hate|dislike|favorite|best|worst)\b/i,
          /\b(would rather|i'd rather|my preference)\b/i,
        ],
        keywords: ['prefer', 'like', 'favorite', 'best', 'rather'],
        weight: 0.85,
      },
      {
        type: IntentType.CONFIRMATION,
        patterns: [
          /^(yes|yeah|yep|sure|okay|ok|right|correct|exactly|absolutely)/i,
          /\b(i agree|that's right|you're right)\b/i,
        ],
        keywords: ['yes', 'yeah', 'sure', 'okay', 'right', 'correct', 'agree'],
        weight: 1.1,
      },
      {
        type: IntentType.DENIAL,
        patterns: [
          /^(no|nope|nah|not really|i don't think so)/i,
          /\b(disagree|incorrect|wrong|that's not)\b/i,
        ],
        keywords: ['no', 'nope', 'not', 'disagree', 'wrong'],
        weight: 1.1,
      },
      {
        type: IntentType.CLARIFICATION,
        patterns: [
          /^(what do you mean|i don't understand|could you clarify|what exactly)/i,
          /\b(confused|unclear|explain again|rephrase)\b/i,
        ],
        keywords: ['mean', 'understand', 'clarify', 'confused', 'explain'],
        contextualCues: ['ambiguous'],
        weight: 0.95,
      },
      {
        type: IntentType.FEEDBACK,
        patterns: [
          /\b(good job|well done|that's great|perfect|excellent|terrible|awful|bad)\b/i,
          /\b(thanks|thank you|appreciate|helpful|not helpful)\b/i,
        ],
        keywords: ['good', 'great', 'perfect', 'thanks', 'helpful', 'bad'],
        weight: 0.9,
      },
      {
        type: IntentType.SOCIAL_INTERACTION,
        patterns: [
          /\b(how was your|tell me about your|share|chat|talk)\b/i,
          /\b(interesting|fun|cool|awesome|neat)\b/i,
        ],
        keywords: ['chat', 'talk', 'share', 'tell', 'story'],
        weight: 0.85,
      },
    ];
  }

  // Helper methods
  private normalizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private mergeIntents(intents: Intent[]): Intent[] {
    const merged = new Map<IntentType, Intent>();
    
    for (const intent of intents) {
      const existing = merged.get(intent.type);
      if (!existing || intent.confidence > existing.confidence) {
        merged.set(intent.type, intent);
      }
    }
    
    return Array.from(merged.values());
  }

  private getUserPatternBoost(userId: string, intentType: IntentType): number {
    const userPatterns = this.userPatternHistory.get(userId);
    if (!userPatterns) return 0;
    
    const count = userPatterns.get(intentType) || 0;
    const total = Array.from(userPatterns.values()).reduce((a, b) => a + b, 0);
    
    return total > 0 ? count / total : 0;
  }

  private isLogicalFollowup(lastIntent: IntentType, currentIntent: IntentType): boolean {
    const followupMap: Record<string, IntentType[]> = {
      [IntentType.INFORMATION_REQUEST]: [IntentType.CLARIFICATION, IntentType.FEEDBACK],
      [IntentType.ACTION_REQUEST]: [IntentType.CONFIRMATION, IntentType.CLARIFICATION],
      [IntentType.GREETING]: [IntentType.SOCIAL_INTERACTION, IntentType.INFORMATION_REQUEST],
    };
    
    return followupMap[lastIntent]?.includes(currentIntent) || false;
  }

  private alignsWithGoal(intentType: IntentType, goal: string): boolean {
    const goalKeywords = goal.toLowerCase().split(/\s+/);
    const intentTypeStr = intentType.toString().toLowerCase();
    
    return goalKeywords.some(keyword => intentTypeStr.includes(keyword));
  }

  private createUnknownIntent(): Intent {
    return {
      type: IntentType.UNKNOWN,
      confidence: 0.5,
      isPrimary: true,
    };
  }

  private extractTopic(text: string): string {
    const words = text.split(/\s+/);
    return words.slice(1, 4).join(' ');
  }

  private identifyQuestionType(text: string): string {
    if (/^what/i.test(text)) return 'what';
    if (/^who/i.test(text)) return 'who';
    if (/^when/i.test(text)) return 'when';
    if (/^where/i.test(text)) return 'where';
    if (/^why/i.test(text)) return 'why';
    if (/^how/i.test(text)) return 'how';
    return 'unknown';
  }

  private extractAction(text: string): string {
    const actionVerbs = ['remind', 'schedule', 'set', 'create', 'make', 'send', 'call'];
    const words = text.toLowerCase().split(/\s+/);
    
    for (const verb of actionVerbs) {
      if (words.includes(verb)) return verb;
    }
    
    return 'unknown';
  }

  private extractUrgency(text: string): string {
    if (/\b(urgent|asap|immediately|right now|quickly)\b/i.test(text)) return 'high';
    if (/\b(soon|when you can|whenever)\b/i.test(text)) return 'low';
    return 'medium';
  }

  private extractEmotion(text: string): string {
    const emotions = {
      happy: /\b(happy|joy|excited|glad|pleased)\b/i,
      sad: /\b(sad|unhappy|depressed|down|miserable)\b/i,
      angry: /\b(angry|mad|furious|annoyed|irritated)\b/i,
      anxious: /\b(anxious|worried|nervous|stressed|concerned)\b/i,
    };
    
    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(text)) return emotion;
    }
    
    return 'neutral';
  }

  private extractIntensity(text: string): number {
    if (/\b(very|extremely|so|really|absolutely)\b/i.test(text)) return 0.9;
    if (/\b(quite|fairly|somewhat|a bit)\b/i.test(text)) return 0.6;
    return 0.5;
  }
}

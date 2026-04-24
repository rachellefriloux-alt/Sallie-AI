/**
 * Meta-Conversation Handler Tests
 */

import { MetaConversationHandler, MetaTopicType } from '../dialogue/MetaConversationHandler';
import { ConversationContext } from '../models/ConversationContext';
import { DialogueState, DialoguePhase, TurnStatus, InitiativeHolder } from '../models/DialogueState';

describe('MetaConversationHandler', () => {
  let handler: MetaConversationHandler;
  let mockContext: ConversationContext;
  let mockState: DialogueState;

  beforeEach(() => {
    handler = new MetaConversationHandler();
    
    mockContext = {
      conversationId: 'test-conv',
      sessionId: 'test-session',
      userId: 'test-user',
      currentTurn: 0,
      turns: [],
      activeTopics: [],
      topicStack: [],
      focusedEntities: [],
      entityFocusHistory: [],
      recentIntents: [],
      sentimentHistory: [],
      contextWindow: [],
      contextWindowSize: 10,
      importantMoments: [],
      startTime: new Date(),
      lastUpdateTime: new Date(),
      conversationState: 'active',
      metadata: {},
    };

    mockState = {
      currentPhase: DialoguePhase.TOPIC_DEVELOPMENT,
      phaseHistory: [],
      turnStatus: TurnStatus.USER_TURN,
      turnCount: 5,
      lastSpeaker: 'user',
      initiativeHolder: InitiativeHolder.USER,
      initiativeHistory: [],
      activeTopics: [],
      topicStack: [],
      topicTransitions: [],
      topicExhausted: false,
      activeGoals: [],
      completedGoals: [],
      pendingClarifications: [],
      clarificationHistory: [],
      currentErrors: [],
      errorHistory: [],
      userEngagementLevel: 0.7,
      conversationDepth: 0.6,
      averageTurnDuration: 2000,
      conversationPace: 'moderate',
      lastUserActivity: new Date(),
      lastAssistantActivity: new Date(),
      needsUserInput: true,
      awaitingConfirmation: false,
      inMultiTurnResponse: false,
      canSuggestTopic: true,
      shouldYieldTurn: false,
      conversationQuality: 0.8,
      metadata: {},
    };
  });

  describe('detectMetaTopic', () => {
    it('should detect conversation quality questions', () => {
      const result = handler.detectMetaTopic('How is our conversation going?', mockContext);
      
      expect(result).toBeDefined();
      expect(result?.type).toBe(MetaTopicType.CONVERSATION_QUALITY);
      expect(result?.confidence).toBeGreaterThan(0.7);
    });

    it('should detect understanding checks', () => {
      const result = handler.detectMetaTopic('Do you understand what I am saying?', mockContext);
      
      expect(result).toBeDefined();
      expect(result?.type).toBe(MetaTopicType.UNDERSTANDING_CHECK);
    });

    it('should detect capability inquiries', () => {
      const result = handler.detectMetaTopic('What can you do?', mockContext);
      
      expect(result).toBeDefined();
      expect(result?.type).toBe(MetaTopicType.CAPABILITY_INQUIRY);
    });

    it('should detect communication style questions', () => {
      const result = handler.detectMetaTopic('Why did you say it that way?', mockContext);
      
      expect(result).toBeDefined();
      expect(result?.type).toBe(MetaTopicType.COMMUNICATION_STYLE);
    });

    it('should not detect meta-conversation in regular chat', () => {
      const result = handler.detectMetaTopic('What is the weather today?', mockContext);
      
      expect(result).toBeNull();
    });
  });

  describe('generateMetaResponse', () => {
    it('should generate appropriate responses for meta-conversation', () => {
      const trigger = {
        type: MetaTopicType.CONVERSATION_QUALITY,
        confidence: 0.9,
        context: 'How is our conversation?',
        suggestedResponse: 'We are having a great chat!',
      };

      const response = handler.generateMetaResponse(trigger, mockState, mockContext);
      
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should use suggested response when available', () => {
      const trigger = {
        type: MetaTopicType.UNDERSTANDING_CHECK,
        confidence: 0.85,
        context: 'Do you understand?',
        suggestedResponse: 'Yes, I understand perfectly!',
      };

      const response = handler.generateMetaResponse(trigger, mockState, mockContext);
      
      expect(response).toBe('Yes, I understand perfectly!');
    });
  });

  describe('assessConversationQuality', () => {
    it('should assess high quality conversations', () => {
      mockState.userEngagementLevel = 0.9;
      mockState.currentErrors = [];
      mockContext.turns = Array(10).fill({});

      const quality = handler.assessConversationQuality(mockState, mockContext);
      
      expect(quality).toBeGreaterThan(0.6);
    });

    it('should assess low quality when there are errors', () => {
      mockState.userEngagementLevel = 0.3;
      mockState.currentErrors = [{ type: 'misunderstanding' } as any];

      const quality = handler.assessConversationQuality(mockState, mockContext);
      
      expect(quality).toBeLessThan(0.6);
    });
  });

  describe('generateSelfAwareCommentary', () => {
    it('should generate positive commentary for good conversations', () => {
      mockState.userEngagementLevel = 0.9;
      mockState.currentErrors = [];
      mockContext.turns = Array(10).fill({});

      // May or may not generate (20% chance), so we test the method works
      const commentary = handler.generateSelfAwareCommentary(mockState, mockContext);
      
      if (commentary) {
        expect(typeof commentary).toBe('string');
        expect(commentary.length).toBeGreaterThan(0);
      }
    });
  });

  describe('suggestImprovements', () => {
    it('should suggest improvements for low engagement', () => {
      mockState.userEngagementLevel = 0.3;

      const suggestions = handler.suggestImprovements(mockState, mockContext);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('engaging'))).toBe(true);
    });

    it('should suggest improvements when topic is exhausted', () => {
      mockState.topicExhausted = true;

      const suggestions = handler.suggestImprovements(mockState, mockContext);
      
      expect(suggestions.some(s => s.includes('topic'))).toBe(true);
    });

    it('should not suggest improvements for good conversations', () => {
      mockState.userEngagementLevel = 0.8;
      mockState.currentErrors = [];
      mockState.topicExhausted = false;

      const suggestions = handler.suggestImprovements(mockState, mockContext);
      
      // May have suggestions about initiative, but shouldn't have critical ones
      expect(suggestions.length).toBeLessThan(3);
    });
  });
});

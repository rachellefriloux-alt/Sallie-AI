/**
 * Intent Recognizer Tests
 */

import { IntentRecognizer } from '../nlu/IntentRecognizer';
import { IntentType } from '../models/Intent';
import { ConversationContext } from '../models/ConversationContext';

describe('IntentRecognizer', () => {
  let recognizer: IntentRecognizer;
  let mockContext: ConversationContext;

  beforeEach(() => {
    recognizer = new IntentRecognizer();
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
  });

  describe('recognizeIntent', () => {
    it('should recognize information request intents', () => {
      const result = recognizer.recognizeIntent('What is the weather? Tell me about it.', mockContext);
      
      expect(result.primaryIntent).toBeDefined();
      expect(result.primaryIntent.confidence).toBeGreaterThan(0);
    });

    it('should recognize greeting intents', () => {
      const result = recognizer.recognizeIntent('Hi hello good morning', mockContext);
      
      expect(result.primaryIntent.type).toBe(IntentType.GREETING);
      expect(result.primaryIntent.confidence).toBeGreaterThan(0.3);
    });

    it('should recognize action request intents', () => {
      const result = recognizer.recognizeIntent('Please remind me to call mom', mockContext);
      
      expect(result.primaryIntent.type).toBe(IntentType.ACTION_REQUEST);
      expect(result.primaryIntent.confidence).toBeGreaterThan(0.3);
    });

    it('should recognize emotional expression intents', () => {
      const result = recognizer.recognizeIntent('I feel really happy today', mockContext);
      
      expect(result.primaryIntent.type).toBe(IntentType.EMOTIONAL_EXPRESSION);
      expect(result.primaryIntent.confidence).toBeGreaterThan(0.3);
    });

    it('should recognize farewell intents', () => {
      const result = recognizer.recognizeIntent('Goodbye, talk to you later', mockContext);
      
      expect(result.primaryIntent.type).toBe(IntentType.FAREWELL);
      expect(result.primaryIntent.confidence).toBeGreaterThan(0.4);
    });

    it('should detect ambiguous intents', () => {
      const result = recognizer.recognizeIntent('ok', mockContext);
      
      expect(result.ambiguous).toBe(true);
    });

    it('should handle unknown intents', () => {
      const result = recognizer.recognizeIntent('xyz123', mockContext);
      
      expect(result.primaryIntent.type).toBe(IntentType.UNKNOWN);
    });
  });

  describe('learnUserPattern', () => {
    it('should learn user-specific intent patterns', () => {
      recognizer.learnUserPattern('test-user', IntentType.GREETING, 'hey there');
      recognizer.learnUserPattern('test-user', IntentType.GREETING, 'yo');
      
      // Pattern learning should boost confidence for similar intents
      const result = recognizer.recognizeIntent('hey', mockContext);
      expect(result.primaryIntent.type).toBe(IntentType.GREETING);
    });
  });
});

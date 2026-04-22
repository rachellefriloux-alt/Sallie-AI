/**
 * Conversation Service Integration Tests
 */

import { ConversationService } from '../ConversationService';

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
  });

  describe('processMessage', () => {
    it('should process a simple message', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      const response = await service.processMessage('Hello!', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      expect(response.text).toBeDefined();
      expect(response.text.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.metadata.intent).toBeDefined();
    });

    it('should maintain conversation context', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      await service.processMessage('My name is John', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      const response = await service.processMessage('What is my name?', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      expect(response.text).toBeDefined();
      expect(response.metadata.entities).toBeDefined();
    });

    it('should handle questions', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      const response = await service.processMessage('What is the weather?', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      expect(response.text).toBeDefined();
      expect(response.metadata.intent).toBeDefined();
    });

    it('should handle emotional expressions', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      const response = await service.processMessage('I am feeling sad today', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      expect(response.text).toBeDefined();
      expect(response.metadata.sentiment).toBeLessThan(0);
    });

    it('should track response times', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      const response = await service.processMessage('Hello', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      expect(response.metadata.responseTime).toBeDefined();
      expect(response.metadata.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.metadata.responseTime).toBeLessThan(1000); // Should be sub-second
    });
  });

  describe('conversation lifecycle', () => {
    it('should start a new conversation', () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      expect(conversationId).toBeDefined();
      expect(conversationId).toMatch(/^conv_/);
    });

    it('should get conversation context', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      await service.processMessage('Test message', {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      
      const context = service.getContext(conversationId);
      
      expect(context).toBeDefined();
      expect(context?.turns.length).toBeGreaterThan(0);
    });

    it('should end conversation', async () => {
      const conversationId = service.startConversation('user1', 'session1');
      
      service.endConversation(conversationId);
      
      const context = service.getContext(conversationId);
      expect(context?.conversationState).toBe('ended');
    });
  });

  describe('health status', () => {
    it('should report healthy status', () => {
      const health = service.getHealthStatus();
      
      expect(health.healthy).toBe(true);
      expect(health.components.nlu).toBe(true);
      expect(health.components.generation).toBe(true);
      expect(health.components.dialogue).toBe(true);
    });
  });
});

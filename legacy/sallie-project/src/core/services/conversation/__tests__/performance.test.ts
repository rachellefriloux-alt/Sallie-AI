/**
 * Performance Benchmarks for Conversation System
 * 
 * Run with: npm test -- performance.benchmark.ts
 */

import { ConversationService } from '../ConversationService';

describe('Performance Benchmarks', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
  });

  it('should process simple greeting in under 200ms', async () => {
    const conversationId = service.startConversation('user1', 'session1');
    
    const start = performance.now();
    const response = await service.processMessage('Hello!', {
      userId: 'user1',
      conversationId,
      sessionId: 'session1',
    });
    const duration = performance.now() - start;
    
    expect(response).toBeDefined();
    expect(duration).toBeLessThan(200);
  });

  it('should process information request in under 300ms', async () => {
    const conversationId = service.startConversation('user1', 'session1');
    
    const start = performance.now();
    const response = await service.processMessage('What can you tell me about AI?', {
      userId: 'user1',
      conversationId,
      sessionId: 'session1',
    });
    const duration = performance.now() - start;
    
    expect(response).toBeDefined();
    expect(duration).toBeLessThan(300);
  });

  it('should handle multiple concurrent conversations efficiently', async () => {
    const conversations = Array.from({ length: 10 }, (_, i) => ({
      id: service.startConversation(`user${i}`, `session${i}`),
      userId: `user${i}`,
      sessionId: `session${i}`,
    }));

    const start = performance.now();
    
    const promises = conversations.map(conv =>
      service.processMessage('Hello!', {
        userId: conv.userId,
        conversationId: conv.id,
        sessionId: conv.sessionId,
      })
    );

    const responses = await Promise.all(promises);
    const duration = performance.now() - start;
    
    expect(responses.length).toBe(10);
    expect(responses.every(r => r.text)).toBe(true);
    expect(duration).toBeLessThan(1000); // All 10 in under 1 second
  });

  it('should maintain performance with long conversation history', async () => {
    const conversationId = service.startConversation('user1', 'session1');
    
    // Build up conversation history
    for (let i = 0; i < 20; i++) {
      await service.processMessage(`Message ${i}`, {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
    }

    // Measure response time after many turns
    const start = performance.now();
    const response = await service.processMessage('Hello again', {
      userId: 'user1',
      conversationId,
      sessionId: 'session1',
    });
    const duration = performance.now() - start;
    
    expect(response).toBeDefined();
    expect(duration).toBeLessThan(300); // Should stay performant
  });

  it('should have consistent average response times', async () => {
    const conversationId = service.startConversation('user1', 'session1');
    const durations: number[] = [];
    
    // Measure 50 responses
    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      await service.processMessage(`Test message ${i}`, {
        userId: 'user1',
        conversationId,
        sessionId: 'session1',
      });
      durations.push(performance.now() - start);
    }

    const average = durations.reduce((a, b) => a + b, 0) / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);
    
    expect(average).toBeLessThan(250);
    expect(max).toBeLessThan(500);
    expect(min).toBeGreaterThan(0);
  });

  it('should efficiently cleanup old conversations', () => {
    // Create 100 conversations
    for (let i = 0; i < 100; i++) {
      service.startConversation(`user${i}`, `session${i}`);
    }

    const start = Date.now();
    service.cleanup(0); // Cleanup all
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100); // Cleanup should be fast
  });

  it('should report healthy status quickly', () => {
    const start = Date.now();
    const health = service.getHealthStatus();
    const duration = Date.now() - start;
    
    expect(health.healthy).toBe(true);
    expect(duration).toBeLessThan(10);
  });
});

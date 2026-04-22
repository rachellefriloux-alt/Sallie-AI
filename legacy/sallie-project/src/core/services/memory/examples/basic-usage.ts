/**
 * Basic Usage Example for Memory Service
 */

import {
  MemoryService,
  EpisodicMemory,
  SemanticMemory,
  SemanticKnowledgeType
} from '../index';

async function basicExample() {
  const memoryService = new MemoryService({
    autoConsolidate: false,
    autoDecay: false
  });
  
  const conversation = new EpisodicMemory('conv-001', {
    description: 'User asked about project deadlines',
    participants: [{ id: 'user-alice', name: 'Alice' }],
    temporal: { startTime: new Date() },
    topics: ['project', 'deadline']
  });
  
  await memoryService.storeMemory(conversation);
  
  const memories = await memoryService.getMemoriesByEntity('user-alice');
  console.log(`Found ${memories.length} memories`);
  
  memoryService.dispose();
}

export { basicExample };

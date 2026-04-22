/**
 * Memory Service Usage Examples
 */

import { MemoryService, MemoryType, EmotionType } from '../index';

async function main(): Promise<void> {
  const memoryService = new MemoryService();

  // Create episodic memory
  const episodicMemory = await memoryService.createEpisodicMemory(
    {
      name: 'Coffee Meeting',
      description: 'Morning coffee',
      participants: ['Sarah'],
      emotionalState: [EmotionType.JOY],
      significance: 4,
    },
    'Great conversation about AI',
    'conversation'
  );

  console.log('Created memory:', episodicMemory.id);

  // Query memories
  const result = await memoryService.retrieveMemories({
    types: [MemoryType.EPISODIC],
  });

  console.log('Found', result.totalCount, 'memories');

  memoryService.destroy();
}

if (require.main === module) {
  main();
}

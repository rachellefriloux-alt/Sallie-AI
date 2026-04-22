/**
 * Emotional Memory
 * Stores and recalls emotional patterns
 */

import { EmotionalMemoryEntry } from '../models/EmotionalState';
import { EmotionVector } from '../models/EmotionVector';

export class EmotionalMemory {
  private memories: EmotionalMemoryEntry[];
  private readonly MAX_MEMORIES = 500;

  constructor() {
    this.memories = [];
  }

  store(snapshot: EmotionVector, context: string, triggers: string[], effectiveness: number): void {
    const entry: EmotionalMemoryEntry = {
      emotionSnapshot: JSON.parse(JSON.stringify(snapshot)),
      context,
      triggers,
      effectiveness,
      timestamp: new Date(),
      recalled: 0,
    };

    this.memories.push(entry);
    
    if (this.memories.length > this.MAX_MEMORIES) {
      this.memories.sort((a, b) => b.effectiveness - a.effectiveness);
      this.memories = this.memories.slice(0, this.MAX_MEMORIES);
    }
  }

  recall(context: string, limit = 5): EmotionalMemoryEntry[] {
    const matches = this.memories
      .filter((m) => m.context === context)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    matches.forEach((m) => m.recalled++);
    return matches;
  }

  findSimilarContexts(triggers: string[]): EmotionalMemoryEntry[] {
    return this.memories
      .filter((m) => triggers.some((t) => m.triggers.includes(t)))
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 10);
  }

  export(): EmotionalMemoryEntry[] {
    return JSON.parse(JSON.stringify(this.memories));
  }

  import(memories: EmotionalMemoryEntry[]): void {
    this.memories = JSON.parse(JSON.stringify(memories));
  }
}

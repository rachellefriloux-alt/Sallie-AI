/**
 * Memory Integrator
 * Integrates relevant memories into responses
 */

import { ConversationContext } from '../models/ConversationContext';
import { Entity } from '../models/Entity';

export interface Memory {
  id: string;
  type: 'fact' | 'preference' | 'experience' | 'relationship';
  content: string;
  entities: string[];
  timestamp: Date;
  importance: number;
  confidence: number;
}

export class MemoryIntegrator {
  private memories: Memory[] = [];

  /**
   * Retrieve relevant memories for context
   */
  public retrieveRelevant(
    context: ConversationContext,
    entities: Entity[],
    maxMemories = 3
  ): Memory[] {
    const scored = this.memories.map(memory => ({
      memory,
      score: this.calculateRelevance(memory, context, entities),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored
      .slice(0, maxMemories)
      .filter(s => s.score > 0.3)
      .map(s => s.memory);
  }

  /**
   * Integrate memory into response
   */
  public integrateMemory(
    baseResponse: string,
    memory: Memory,
    style: 'explicit' | 'implicit' | 'callback' = 'implicit'
  ): string {
    switch (style) {
      case 'explicit':
        return `${baseResponse} I remember ${memory.content}.`;
      case 'callback':
        return `${baseResponse} Like we discussed before about ${this.extractKey(memory.content)}.`;
      case 'implicit':
      default:
        return this.weaveInMemory(baseResponse, memory);
    }
  }

  /**
   * Check if memory should be mentioned
   */
  public shouldMention(memory: Memory, context: ConversationContext): boolean {
    // Don't mention if recently mentioned
    const recentMentions = context.turns.slice(-5);
    const alreadyMentioned = recentMentions.some(turn => 
      turn.text.toLowerCase().includes(memory.content.toLowerCase().slice(0, 20))
    );

    if (alreadyMentioned) return false;

    // Mention if highly relevant
    const entities = context.focusedEntities;
    const isRelevant = memory.entities.some(e => 
      entities.some(ce => ce.text.toLowerCase().includes(e.toLowerCase()))
    );

    return isRelevant && memory.importance > 0.6;
  }

  /**
   * Add memory
   */
  public addMemory(memory: Memory): void {
    this.memories.push(memory);

    // Keep only recent and important memories
    if (this.memories.length > 100) {
      this.memories = this.memories
        .sort((a, b) => {
          const scoreA = a.importance * 0.6 + (Date.now() - a.timestamp.getTime()) * 0.4;
          const scoreB = b.importance * 0.6 + (Date.now() - b.timestamp.getTime()) * 0.4;
          return scoreB - scoreA;
        })
        .slice(0, 100);
    }
  }

  /**
   * Calculate memory relevance
   */
  private calculateRelevance(
    memory: Memory,
    context: ConversationContext,
    entities: Entity[]
  ): number {
    let score = memory.importance * 0.4;

    // Check entity overlap
    const entityMatch = entities.some(e => 
      memory.entities.some(me => 
        e.text.toLowerCase().includes(me.toLowerCase()) || 
        me.toLowerCase().includes(e.text.toLowerCase())
      )
    );
    if (entityMatch) score += 0.3;

    // Check topic overlap
    const topicMatch = context.activeTopics.some(t => 
      t.keywords.some(k => memory.content.toLowerCase().includes(k))
    );
    if (topicMatch) score += 0.2;

    // Recency bonus
    const ageInDays = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.exp(-ageInDays / 30) * 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Weave memory into response naturally
   */
  private weaveInMemory(response: string, memory: Memory): string {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return response;

    // Insert memory reference in middle or end
    const insertPoint = Math.min(1, sentences.length - 1);
    const memoryRef = this.createMemoryReference(memory);

    sentences.splice(insertPoint + 1, 0, memoryRef);

    return sentences.join('. ').trim() + '.';
  }

  /**
   * Create natural memory reference
   */
  private createMemoryReference(memory: Memory): string {
    const templates = [
      `I recall ${memory.content}`,
      `If I remember correctly, ${memory.content}`,
      `Based on what I know, ${memory.content}`,
      `From our previous conversations, ${memory.content}`,
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template;
  }

  /**
   * Extract key from memory content
   */
  private extractKey(content: string): string {
    const words = content.split(/\s+/);
    return words.slice(0, 4).join(' ');
  }
}

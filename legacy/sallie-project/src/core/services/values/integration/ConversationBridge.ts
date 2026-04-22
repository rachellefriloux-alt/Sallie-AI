/**
 * Conversation Bridge
 * Bridges values service with conversation service for value-aligned responses.
 */

import { ValueDefinition } from '../models/Value';

export class ConversationBridge {
  public getValueContext(values: ValueDefinition[]): string {
    const topValues = values.filter(v => v.priority >= 7).map(v => v.name);
    return `User's core values: ${topValues.join(', ')}`;
  }

  public checkResponseAlignment(response: string, values: ValueDefinition[]): {
    aligned: boolean;
    score: number;
    suggestions: string[];
  } {
    let score = 0.5;
    const suggestions: string[] = [];
    
    // Simple alignment check
    const lowerResponse = response.toLowerCase();
    for (const value of values) {
      if (lowerResponse.includes(value.name.toLowerCase())) {
        score += 0.1;
      }
    }
    
    score = Math.min(score, 1);
    const aligned = score >= 0.6;
    
    if (!aligned) {
      suggestions.push('Consider referencing user values more explicitly');
      suggestions.push('Ensure response supports stated priorities');
    }
    
    return { aligned, score, suggestions };
  }
}

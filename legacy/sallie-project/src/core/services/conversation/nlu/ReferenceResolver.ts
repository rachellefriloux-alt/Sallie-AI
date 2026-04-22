/**
 * Reference Resolver
 * Resolves pronouns and indirect references
 */

import { Entity, EntityType } from '../models/Entity';
import { ConversationContext } from '../models/ConversationContext';

export class ReferenceResolver {
  private pronounGenderMap: Map<string, 'male' | 'female' | 'neutral' | 'plural'>;

  constructor() {
    this.pronounGenderMap = new Map([
      ['he', 'male'], ['him', 'male'], ['his', 'male'], ['himself', 'male'],
      ['she', 'female'], ['her', 'female'], ['hers', 'female'], ['herself', 'female'],
      ['it', 'neutral'], ['its', 'neutral'], ['itself', 'neutral'],
      ['they', 'plural'], ['them', 'plural'], ['their', 'plural'], ['theirs', 'plural'], ['themselves', 'plural'],
    ]);
  }

  /**
   * Resolve anaphora (pronouns to antecedents)
   */
  public resolveAnaphora(text: string, context: ConversationContext): Map<string, Entity> {
    const resolutions = new Map<string, Entity>();
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[.,!?;:]/, '');
      
      if (this.pronounGenderMap.has(word)) {
        const entity = this.findAntecedent(word, context);
        if (entity) {
          resolutions.set(word, entity);
        }
      }
    }
    
    return resolutions;
  }

  /**
   * Resolve implicit references
   */
  public resolveImplicitReference(text: string, context: ConversationContext): Entity | null {
    // Look for definite descriptions ("the book", "the meeting")
    const definitePattern = /\bthe\s+(\w+)/gi;
    const matches = text.matchAll(definitePattern);
    
    for (const match of matches) {
      if (match[1]) {
        const entity = this.findEntityByType(match[1], context);
        if (entity) return entity;
      }
    }
    
    return null;
  }

  /**
   * Handle ambiguous references
   */
  public resolveAmbiguousReference(
    referenceText: string,
    context: ConversationContext
  ): { candidates: Entity[]; mostLikely: Entity | null; needsClarification: boolean } {
    const candidates = this.findCandidateEntities(referenceText, context);
    
    if (candidates.length === 0) {
      return { candidates: [], mostLikely: null, needsClarification: false };
    }
    
    if (candidates.length === 1) {
      return { candidates, mostLikely: candidates[0], needsClarification: false };
    }
    
    // Rank candidates by recency and relevance
    const ranked = this.rankCandidates(candidates, context);
    const mostLikely = ranked[0];
    const needsClarification = ranked.length > 1 && ranked[1].confidence > mostLikely.confidence * 0.8;
    
    return { candidates: ranked, mostLikely, needsClarification };
  }

  /**
   * Find antecedent for pronoun
   */
  private findAntecedent(pronoun: string, context: ConversationContext): Entity | null {
    const gender = this.pronounGenderMap.get(pronoun);
    if (!gender) return null;
    
    // Search recent entities in reverse order (most recent first)
    for (let i = context.turns.length - 1; i >= Math.max(0, context.turns.length - 5); i--) {
      const turn = context.turns[i];
      
      for (const entity of turn.entities.reverse()) {
        if (this.isCompatibleWithGender(entity, gender)) {
          return entity;
        }
      }
    }
    
    return null;
  }

  /**
   * Find entity by type/description
   */
  private findEntityByType(description: string, context: ConversationContext): Entity | null {
    const normalized = description.toLowerCase();
    
    // Search recent entities
    for (let i = context.turns.length - 1; i >= Math.max(0, context.turns.length - 3); i--) {
      const turn = context.turns[i];
      
      for (const entity of turn.entities) {
        if (entity.text.toLowerCase().includes(normalized) || 
            entity.type.toString().toLowerCase().includes(normalized)) {
          return entity;
        }
      }
    }
    
    return null;
  }

  /**
   * Find candidate entities for ambiguous reference
   */
  private findCandidateEntities(referenceText: string, context: ConversationContext): Entity[] {
    const candidates: Entity[] = [];
    const normalized = referenceText.toLowerCase();
    
    // Check focused entities first
    for (const entity of context.focusedEntities) {
      if (this.matchesReference(entity, normalized)) {
        candidates.push({ ...entity, confidence: entity.confidence * 1.2 });
      }
    }
    
    // Check recent turns
    for (let i = context.turns.length - 1; i >= Math.max(0, context.turns.length - 5); i--) {
      const turn = context.turns[i];
      
      for (const entity of turn.entities) {
        if (this.matchesReference(entity, normalized) && !candidates.find(c => c.id === entity.id)) {
          // Apply recency discount
          const recencyFactor = 1 - ((context.turns.length - 1 - i) * 0.1);
          candidates.push({ ...entity, confidence: entity.confidence * recencyFactor });
        }
      }
    }
    
    return candidates;
  }

  /**
   * Rank candidates by likelihood
   */
  private rankCandidates(candidates: Entity[], context: ConversationContext): Entity[] {
    return candidates
      .map(entity => {
        let score = entity.confidence;
        
        // Boost for focused entities
        if (context.focusedEntities.find(e => e.id === entity.id)) {
          score *= 1.3;
        }
        
        // Boost for entities mentioned in active topics
        for (const topic of context.activeTopics) {
          if (topic.keywords.some(k => entity.text.toLowerCase().includes(k))) {
            score *= 1.2;
            break;
          }
        }
        
        return { ...entity, confidence: score };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Check if entity is compatible with pronoun gender
   */
  private isCompatibleWithGender(entity: Entity, gender: string): boolean {
    switch (gender) {
      case 'male':
      case 'female':
        return entity.type === EntityType.PERSON;
      case 'neutral':
        return entity.type === EntityType.OBJECT || (entity.type !== EntityType.PERSON);
      case 'plural':
        return true; // Can refer to any entity
      default:
        return false;
    }
  }

  /**
   * Check if entity matches reference text
   */
  private matchesReference(entity: Entity, referenceText: string): boolean {
    const entityText = entity.text.toLowerCase();
    const normalizedText = entity.normalizedText?.toLowerCase() || entityText;
    
    // Exact match
    if (normalizedText === referenceText || entityText === referenceText) {
      return true;
    }
    
    // Partial match
    if (normalizedText.includes(referenceText) || referenceText.includes(normalizedText)) {
      return true;
    }
    
    // Type match
    if (entity.type.toString().toLowerCase().includes(referenceText)) {
      return true;
    }
    
    return false;
  }
}

/**
 * Entity Extractor
 * Identifies and extracts named entities from text
 */

import { Entity, EntityType, EntityExtractionResult, CoreferenceChain, EntityAttribute, EntityRelationship } from '../models/Entity';

interface EntityPattern {
  type: EntityType;
  patterns: RegExp[];
  contextCues?: string[];
}

export class EntityExtractor {
  private patterns: EntityPattern[];
  private entityDatabase: Map<string, Entity>;
  private coreferenceChains: Map<string, CoreferenceChain>;

  constructor() {
    this.patterns = this.initializePatterns();
    this.entityDatabase = new Map();
    this.coreferenceChains = new Map();
  }

  /**
   * Extract entities from text
   */
  public extractEntities(text: string, turnIndex: number): EntityExtractionResult {
    const normalizedText = text.toLowerCase();
    const entities: Entity[] = [];
    
    // Named entity recognition
    const namedEntities = this.recognizeNamedEntities(text);
    entities.push(...namedEntities);
    
    // Pattern-based extraction
    const patternEntities = this.extractByPatterns(text);
    entities.push(...patternEntities);
    
    // Dictionary matching
    const dictionaryEntities = this.matchDictionary(text);
    entities.push(...dictionaryEntities);
    
    // Resolve coreferences
    const resolvedEntities = this.resolveCoreferences(entities, text, turnIndex);
    
    // Extract relationships
    const relationships = this.extractRelationships(resolvedEntities, text);
    
    // Update entity database
    this.updateEntityDatabase(resolvedEntities);
    
    return {
      entities: resolvedEntities,
      relationships,
      coreferences: Array.from(this.coreferenceChains.values()),
    };
  }

  /**
   * Resolve entity references (pronouns, etc.)
   */
  public resolveReference(
    referenceText: string,
    recentEntities: Entity[]
  ): Entity | null {
    const pronouns = ['he', 'she', 'it', 'they', 'him', 'her', 'them', 'his', 'hers', 'their'];
    const normalized = referenceText.toLowerCase().trim();
    
    if (pronouns.includes(normalized)) {
      // Find most recent compatible entity
      for (let i = recentEntities.length - 1; i >= 0; i--) {
        const entity = recentEntities[i];
        if (this.isPronounCompatible(normalized, entity)) {
          return entity;
        }
      }
    }
    
    // Try partial matching
    for (const entity of recentEntities.reverse()) {
      if (entity.text.toLowerCase().includes(normalized) || 
          normalized.includes(entity.text.toLowerCase())) {
        return entity;
      }
    }
    
    return null;
  }

  /**
   * Recognize named entities (people, places, organizations)
   */
  private recognizeNamedEntities(text: string): Entity[] {
    const entities: Entity[] = [];
    
    // Simple capitalization-based detection
    const words = text.split(/\s+/);
    const capitalizedSequences: string[][] = [];
    let currentSequence: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Check if word starts with capital letter
      if (/^[A-Z][a-z]+/.test(word)) {
        currentSequence.push(word);
      } else if (currentSequence.length > 0) {
        capitalizedSequences.push([...currentSequence]);
        currentSequence = [];
      }
    }
    
    if (currentSequence.length > 0) {
      capitalizedSequences.push(currentSequence);
    }
    
    // Create entities from capitalized sequences
    for (const sequence of capitalizedSequences) {
      if (sequence.length >= 1) {
        const entityText = sequence.join(' ');
        const entityType = this.inferEntityType(entityText);
        
        entities.push({
          id: this.generateEntityId(),
          type: entityType,
          text: entityText,
          normalizedText: entityText.toLowerCase(),
          startIndex: text.indexOf(entityText),
          endIndex: text.indexOf(entityText) + entityText.length,
          confidence: 0.7 + (sequence.length * 0.1),
          attributes: [],
          relationships: [],
        });
      }
    }
    
    return entities;
  }

  /**
   * Extract entities using regex patterns
   */
  private extractByPatterns(text: string): Entity[] {
    const entities: Entity[] = [];
    
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        const matches = text.matchAll(new RegExp(regex, 'gi'));
        
        for (const match of matches) {
          if (match[0] && match.index !== undefined) {
            entities.push({
              id: this.generateEntityId(),
              type: pattern.type,
              text: match[0],
              normalizedText: match[0].toLowerCase(),
              startIndex: match.index,
              endIndex: match.index + match[0].length,
              confidence: 0.8,
              attributes: this.extractAttributes(match[0], pattern.type),
              relationships: [],
            });
          }
        }
      }
    }
    
    return entities;
  }

  /**
   * Match entities against known dictionary
   */
  private matchDictionary(text: string): Entity[] {
    const entities: Entity[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const [key, entity] of this.entityDatabase.entries()) {
      if (normalizedText.includes(entity.normalizedText || entity.text.toLowerCase())) {
        const startIndex = normalizedText.indexOf(entity.normalizedText || entity.text.toLowerCase());
        entities.push({
          ...entity,
          id: this.generateEntityId(),
          startIndex,
          endIndex: startIndex + entity.text.length,
          confidence: 0.9,
          resolvedTo: entity.id,
        });
      }
    }
    
    return entities;
  }

  /**
   * Resolve coreferences (pronouns to entities)
   */
  private resolveCoreferences(
    entities: Entity[],
    text: string,
    turnIndex: number
  ): Entity[] {
    const pronounPattern = /\b(he|she|it|they|him|her|them|his|hers|their|this|that|these|those)\b/gi;
    const matches = text.matchAll(pronounPattern);
    
    for (const match of matches) {
      if (match[0] && match.index !== undefined) {
        const pronoun = match[0].toLowerCase();
        const referent = this.findReferent(pronoun, entities);
        
        if (referent) {
          // Add to coreference chain
          if (!this.coreferenceChains.has(referent.id)) {
            this.coreferenceChains.set(referent.id, {
              entityId: referent.id,
              mentions: [],
            });
          }
          
          const chain = this.coreferenceChains.get(referent.id)!;
          chain.mentions.push({
            text: pronoun,
            startIndex: match.index,
            endIndex: match.index + pronoun.length,
            turnIndex,
          });
        }
      }
    }
    
    return entities;
  }

  /**
   * Extract relationships between entities
   */
  private extractRelationships(entities: Entity[], text: string): EntityRelationship[] {
    const relationships: EntityRelationship[] = [];
    
    // Simple relationship patterns
    const relationshipPatterns = [
      { pattern: /(\w+)'s (mother|father|parent|child|friend|colleague)/i, type: 'family_or_social' },
      { pattern: /(\w+) works at (\w+)/i, type: 'works_for' },
      { pattern: /(\w+) lives in (\w+)/i, type: 'located_in' },
      { pattern: /(\w+) knows (\w+)/i, type: 'knows' },
    ];
    
    for (const { pattern, type } of relationshipPatterns) {
      const matches = text.matchAll(new RegExp(pattern, 'gi'));
      
      for (const match of matches) {
        if (match[1] && match[2]) {
          const entity1 = entities.find(e => e.text.toLowerCase() === match[1].toLowerCase());
          const entity2 = entities.find(e => e.text.toLowerCase() === match[2].toLowerCase());
          
          if (entity1 && entity2) {
            relationships.push({
              type,
              targetEntityId: entity2.id,
              confidence: 0.75,
            });
            
            entity1.relationships.push(relationships[relationships.length - 1]);
          }
        }
      }
    }
    
    return relationships;
  }

  /**
   * Initialize entity patterns
   */
  private initializePatterns(): EntityPattern[] {
    return [
      {
        type: EntityType.TIME,
        patterns: [
          /\d{1,2}:\d{2}\s*(am|pm)?/i,
          /\b(morning|afternoon|evening|night|noon|midnight)\b/i,
        ],
      },
      {
        type: EntityType.DATE,
        patterns: [
          /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
          /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
          /\d{1,2}\/\d{1,2}(\/\d{2,4})?/,
          /\b(today|tomorrow|yesterday)\b/i,
        ],
      },
      {
        type: EntityType.LOCATION,
        patterns: [
          /\b(at|in|near|from|to)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)*)/,
          /\b(home|work|office|school|store|restaurant|park)\b/i,
        ],
        contextCues: ['at', 'in', 'near', 'from', 'to'],
      },
      {
        type: EntityType.EMOTION,
        patterns: [
          /\b(happy|sad|angry|frustrated|excited|worried|anxious|stressed|joy|fear|disgust|surprise)\b/i,
        ],
      },
      {
        type: EntityType.OBJECT,
        patterns: [
          /\b(phone|computer|laptop|car|book|bag|keys|wallet)\b/i,
        ],
      },
    ];
  }

  /**
   * Extract attributes for an entity
   */
  private extractAttributes(text: string, type: EntityType): EntityAttribute[] {
    const attributes: EntityAttribute[] = [];
    
    switch (type) {
      case EntityType.TIME: {
        const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
        if (timeMatch) {
          attributes.push({
            name: 'hour',
            value: parseInt(timeMatch[1]),
            confidence: 0.9,
          });
          attributes.push({
            name: 'minute',
            value: parseInt(timeMatch[2]),
            confidence: 0.9,
          });
          if (timeMatch[3]) {
            attributes.push({
              name: 'period',
              value: timeMatch[3].toLowerCase(),
              confidence: 0.9,
            });
          }
        }
        break;
      }
      case EntityType.DATE: {
        if (/today/i.test(text)) {
          attributes.push({
            name: 'relative',
            value: 'today',
            confidence: 1.0,
          });
        } else if (/tomorrow/i.test(text)) {
          attributes.push({
            name: 'relative',
            value: 'tomorrow',
            confidence: 1.0,
          });
        }
        break;
      }
    }
    
    return attributes;
  }

  /**
   * Infer entity type from text
   */
  private inferEntityType(text: string): EntityType {
    const normalized = text.toLowerCase();
    
    // Check for common person indicators
    if (/\b(mr|mrs|ms|dr|prof)\b/i.test(text)) {
      return EntityType.PERSON;
    }
    
    // Check for organization indicators
    if (/\b(inc|corp|llc|ltd|company|organization)\b/i.test(normalized)) {
      return EntityType.ORGANIZATION;
    }
    
    // Default to person for capitalized names
    return EntityType.PERSON;
  }

  /**
   * Find referent for a pronoun
   */
  private findReferent(pronoun: string, entities: Entity[]): Entity | null {
    // Reverse iterate to find most recent compatible entity
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (this.isPronounCompatible(pronoun, entity)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Check if pronoun is compatible with entity
   */
  private isPronounCompatible(pronoun: string, entity: Entity): boolean {
    const singularPronouns = ['he', 'she', 'it', 'him', 'her', 'his', 'hers'];
    const pluralPronouns = ['they', 'them', 'their'];
    
    if (entity.type === EntityType.PERSON) {
      return singularPronouns.includes(pronoun) || pluralPronouns.includes(pronoun);
    }
    
    if (entity.type === EntityType.ORGANIZATION) {
      return ['it', 'they', 'them', 'their'].includes(pronoun);
    }
    
    if (entity.type === EntityType.OBJECT) {
      return ['it', 'this', 'that'].includes(pronoun);
    }
    
    return ['it', 'this', 'that'].includes(pronoun);
  }

  /**
   * Update entity database with newly found entities
   */
  private updateEntityDatabase(entities: Entity[]): void {
    for (const entity of entities) {
      // Only store entities with high confidence and specific types
      if (entity.confidence > 0.7 && 
          [EntityType.PERSON, EntityType.LOCATION, EntityType.ORGANIZATION].includes(entity.type)) {
        this.entityDatabase.set(entity.id, entity);
      }
    }
  }

  /**
   * Generate unique entity ID
   */
  private generateEntityId(): string {
    return `entity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

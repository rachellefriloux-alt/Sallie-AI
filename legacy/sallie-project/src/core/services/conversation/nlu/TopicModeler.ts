/**
 * Topic Modeler
 * Identifies and tracks conversation topics
 */

import { Topic } from '../models/ConversationContext';
import { Entity } from '../models/Entity';

export class TopicModeler {
  private topicDatabase: Map<string, Topic>;
  private stopWords: Set<string>;

  constructor() {
    this.topicDatabase = new Map();
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can']);
  }

  /**
   * Identify topics from text and entities
   */
  public identifyTopics(text: string, entities: Entity[]): Topic[] {
    const topics: Topic[] = [];
    
    // Keyword-based detection
    const keywordTopics = this.extractKeywordTopics(text);
    topics.push(...keywordTopics);
    
    // Entity-based detection
    const entityTopics = this.extractEntityBasedTopics(entities);
    topics.push(...entityTopics);
    
    // Match against known topics
    const matchedTopics = this.matchKnownTopics(text);
    topics.push(...matchedTopics);
    
    // Deduplicate and merge
    return this.mergeTopics(topics);
  }

  /**
   * Detect topic transitions
   */
  public detectTransition(
    previousTopics: Topic[],
    currentTopics: Topic[]
  ): { type: 'smooth' | 'abrupt' | 'digression' | 'return'; fromTopic?: Topic; toTopic?: Topic } | null {
    if (previousTopics.length === 0 || currentTopics.length === 0) {
      return null;
    }
    
    const prevMainTopic = previousTopics[0];
    const currMainTopic = currentTopics[0];
    
    // Check if topics are related
    const related = this.areTopicsRelated(prevMainTopic, currMainTopic);
    
    // Check if returning to earlier topic
    const isReturn = previousTopics.some(t => t.id === currMainTopic.id);
    
    if (prevMainTopic.id === currMainTopic.id) {
      return null; // No transition
    }
    
    if (isReturn) {
      return { type: 'return', fromTopic: prevMainTopic, toTopic: currMainTopic };
    }
    
    if (related) {
      return { type: 'smooth', fromTopic: prevMainTopic, toTopic: currMainTopic };
    }
    
    return { type: 'abrupt', fromTopic: prevMainTopic, toTopic: currMainTopic };
  }

  /**
   * Assess user interest in topic
   */
  public assessInterest(topic: Topic, turnCount: number, elaborationRequests: number): number {
    let interest = 0.5;
    
    // More mentions = higher interest
    interest += Math.min(topic.mentions * 0.1, 0.3);
    
    // Elaboration requests indicate interest
    interest += elaborationRequests * 0.15;
    
    // Topic persistence
    if (turnCount > 5) {
      interest += 0.2;
    }
    
    return Math.min(interest, 1.0);
  }

  /**
   * Extract topics from keywords
   */
  private extractKeywordTopics(text: string): Topic[] {
    const words = text.toLowerCase()
      .replace(/[.,!?;:()]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !this.stopWords.has(w));
    
    // Count word frequencies
    const frequencies = new Map<string, number>();
    for (const word of words) {
      frequencies.set(word, (frequencies.get(word) || 0) + 1);
    }
    
    // Create topics from frequent keywords
    const topics: Topic[] = [];
    for (const [keyword, freq] of frequencies.entries()) {
      if (freq >= 2) {
        topics.push({
          id: this.generateTopicId(keyword),
          name: keyword,
          keywords: [keyword],
          mentions: freq,
          lastMentioned: new Date(),
          importance: freq / words.length,
          childTopicIds: [],
          relatedTopicIds: [],
        });
      }
    }
    
    return topics;
  }

  /**
   * Extract topics from entities
   */
  private extractEntityBasedTopics(entities: Entity[]): Topic[] {
    const topics: Topic[] = [];
    
    for (const entity of entities) {
      topics.push({
        id: this.generateTopicId(entity.text),
        name: entity.text,
        keywords: [entity.text.toLowerCase()],
        mentions: 1,
        lastMentioned: new Date(),
        importance: entity.confidence * 0.8,
        childTopicIds: [],
        relatedTopicIds: [],
      });
    }
    
    return topics;
  }

  /**
   * Match against known topics
   */
  private matchKnownTopics(text: string): Topic[] {
    const matched: Topic[] = [];
    const normalizedText = text.toLowerCase();
    
    for (const [id, topic] of this.topicDatabase.entries()) {
      const hasKeyword = topic.keywords.some(k => normalizedText.includes(k));
      if (hasKeyword) {
        matched.push({
          ...topic,
          mentions: topic.mentions + 1,
          lastMentioned: new Date(),
        });
      }
    }
    
    return matched;
  }

  /**
   * Merge duplicate topics
   */
  private mergeTopics(topics: Topic[]): Topic[] {
    const merged = new Map<string, Topic>();
    
    for (const topic of topics) {
      const existing = merged.get(topic.id);
      if (existing) {
        existing.mentions += topic.mentions;
        existing.importance = Math.max(existing.importance, topic.importance);
        existing.keywords = [...new Set([...existing.keywords, ...topic.keywords])];
      } else {
        merged.set(topic.id, topic);
      }
    }
    
    // Update database
    for (const [id, topic] of merged.entries()) {
      this.topicDatabase.set(id, topic);
    }
    
    return Array.from(merged.values());
  }

  /**
   * Check if topics are related
   */
  private areTopicsRelated(topic1: Topic, topic2: Topic): boolean {
    // Check keyword overlap
    const overlap = topic1.keywords.filter(k => topic2.keywords.includes(k));
    if (overlap.length > 0) return true;
    
    // Check explicit relationships
    if (topic1.relatedTopicIds.includes(topic2.id) || topic2.relatedTopicIds.includes(topic1.id)) {
      return true;
    }
    
    // Check parent-child relationships
    if (topic1.childTopicIds.includes(topic2.id) || topic2.childTopicIds.includes(topic1.id)) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate topic ID
   */
  private generateTopicId(name: string): string {
    return `topic_${name.toLowerCase().replace(/\s+/g, '_')}`;
  }
}

/**
 * Stimulus Processor
 * Analyzes and classifies emotional stimuli
 */

import { StimulusRecord, StimulusType } from '../models/EmotionalState';
import { PrimaryEmotion, ComplexEmotion } from '../models/EmotionVector';

export class StimulusProcessor {
  processStimulus(content: string, type: StimulusType, context?: string): StimulusRecord {
    const significance = this.evaluateSignificance(content, type);
    const detectedEmotions = this.detectEmotions(content);
    
    return {
      id: `stimulus-${Date.now()}-${Math.random()}`,
      content,
      type,
      emotionalSignificance: significance,
      detectedEmotions,
      userEmotionDetected: detectedEmotions.length > 0,
      timestamp: new Date(),
      processed: false,
    };
  }

  private evaluateSignificance(content: string, type: StimulusType): number {
    let significance = 0.5;
    
    const keywords = {
      high: ['important', 'urgent', 'critical', 'love', 'hate', 'amazing', 'terrible'],
      medium: ['interesting', 'good', 'bad', 'like', 'dislike'],
      low: ['maybe', 'perhaps', 'okay', 'fine'],
    };

    const lowerContent = content.toLowerCase();
    if (keywords.high.some((k) => lowerContent.includes(k))) significance = 0.9;
    else if (keywords.medium.some((k) => lowerContent.includes(k))) significance = 0.6;
    else if (keywords.low.some((k) => lowerContent.includes(k))) significance = 0.3;

    if (type === StimulusType.ValueConflict) significance *= 1.5;
    
    return Math.min(1, significance);
  }

  private detectEmotions(content: string): Array<{ emotion: PrimaryEmotion | ComplexEmotion; confidence: number }> {
    const detections: Array<{ emotion: PrimaryEmotion | ComplexEmotion; confidence: number }> = [];
    const lowerContent = content.toLowerCase();

    const emotionKeywords: Record<string, { words: string[]; emotion: PrimaryEmotion | ComplexEmotion }> = {
      joy: { words: ['happy', 'joy', 'excited', 'wonderful'], emotion: PrimaryEmotion.Joy },
      sadness: { words: ['sad', 'depressed', 'down', 'unhappy'], emotion: PrimaryEmotion.Sadness },
      anger: { words: ['angry', 'furious', 'mad', 'annoyed'], emotion: PrimaryEmotion.Anger },
      fear: { words: ['afraid', 'scared', 'worried', 'anxious'], emotion: PrimaryEmotion.Fear },
      gratitude: { words: ['thank', 'grateful', 'appreciate'], emotion: ComplexEmotion.Gratitude },
    };

    Object.values(emotionKeywords).forEach(({ words, emotion }) => {
      const matches = words.filter((w) => lowerContent.includes(w)).length;
      if (matches > 0) {
        detections.push({ emotion, confidence: Math.min(1, matches * 0.4) });
      }
    });

    return detections;
  }

  classifyIntent(content: string): 'seeking_support' | 'sharing' | 'requesting' | 'expressing' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('help') || lowerContent.includes('advice')) return 'seeking_support';
    if (lowerContent.includes('feel') || lowerContent.includes('think')) return 'expressing';
    if (lowerContent.includes('can you') || lowerContent.includes('could you')) return 'requesting';
    
    return 'sharing';
  }
}

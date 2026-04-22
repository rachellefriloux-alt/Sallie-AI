/**
 * Sentiment Analyzer
 * Analyzes emotional tone and sentiment of messages
 */

import { SentimentScore } from '../models/ConversationContext';

interface SentimentLexicon {
  word: string;
  sentiment: number; // -1 to 1
  emotions: Partial<SentimentScore['dimensions']>;
  /**
   * Strength or magnitude of the sentiment or emotion associated with the word.
   * Expected range: 0 (no intensity) to 1 (maximum intensity).
   */
  intensity: number;
}

export class SentimentAnalyzer {
  private lexicon: SentimentLexicon[];
  private intensifiers: Map<string, number>;
  private negations: Set<string>;
  private userBaselines: Map<string, number>;

  constructor() {
    this.lexicon = this.initializeLexicon();
    this.intensifiers = new Map([
      ['very', 1.3], ['really', 1.3], ['extremely', 1.5], ['absolutely', 1.4],
      ['quite', 1.2], ['fairly', 1.1], ['somewhat', 0.9], ['slightly', 0.8],
      ['barely', 0.6], ['hardly', 0.5],
    ]);
    this.negations = new Set(['not', 'no', 'never', 'none', 'nothing', 'neither', 'nowhere', 'nobody']);
    this.userBaselines = new Map();
  }

  /**
   * Analyze sentiment of text
   */
  public analyzeSentiment(text: string, userId?: string, previousSentiment?: SentimentScore): SentimentScore {
    const normalizedText = text.toLowerCase();
    const words = this.tokenize(normalizedText);
    const tokens = this.annotateTokens(words);
    
    // Calculate base sentiment
    let overallSentiment = 0;
    let wordCount = 0;
    const dimensions = {
      joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, trust: 0,
    };
    let totalIntensity = 0;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const sentiment = this.getSentimentForToken(token, tokens, i);
      
      if (sentiment) {
        overallSentiment += sentiment.value * sentiment.weight;
        wordCount++;
        totalIntensity += sentiment.intensity;
        
        // Add to dimensions
        if (sentiment.emotions) {
          for (const [emotion, value] of Object.entries(sentiment.emotions)) {
            if (value !== undefined) {
              dimensions[emotion as keyof typeof dimensions] += value * sentiment.weight;
            }
          }
        }
      }
    }
    
    // Normalize
    if (wordCount > 0) {
      overallSentiment /= wordCount;
      totalIntensity /= wordCount;
      for (const key of Object.keys(dimensions) as Array<keyof typeof dimensions>) {
        dimensions[key] /= wordCount;
      }
    }
    
    // Apply user baseline calibration
    if (userId) {
      overallSentiment = this.calibrateToUser(userId, overallSentiment);
    }
    
    // Detect sarcasm/irony
    if (this.detectSarcasm(normalizedText, overallSentiment)) {
      overallSentiment *= -0.8; // Flip sentiment
    }
    
    // Calculate trajectory
    const trajectory = this.calculateTrajectory(overallSentiment, previousSentiment);
    
    // Determine confidence
    const confidence = this.calculateConfidence(wordCount, tokens.length, totalIntensity);
    
    return {
      overall: Math.max(-1, Math.min(1, overallSentiment)),
      dimensions,
      intensity: Math.min(totalIntensity, 1),
      confidence,
      trajectory,
    };
  }

  /**
   * Update user baseline
   */
  public updateUserBaseline(userId: string, sentiment: number): void {
    const current = this.userBaselines.get(userId) || 0;
    // Exponential moving average
    this.userBaselines.set(userId, current * 0.9 + sentiment * 0.1);
  }

  /**
   * Get sentiment for a token with context
   */
  private getSentimentForToken(
    token: string,
    allTokens: string[],
    index: number
  ): { value: number; weight: number; intensity: number; emotions?: Partial<SentimentScore['dimensions']> } | null {
    const entry = this.lexicon.find(e => e.word === token);
    if (!entry) return null;
    
    let sentiment = entry.sentiment;
    let intensity = entry.intensity;
    let weight = 1.0;
    
    // Check for negation
    const hasNegation = index > 0 && this.negations.has(allTokens[index - 1]);
    if (hasNegation) {
      sentiment *= -0.8;
      weight *= 1.2; // Negation makes it more important
    }
    
    // Check for intensifiers
    if (index > 0 && this.intensifiers.has(allTokens[index - 1])) {
      const multiplier = this.intensifiers.get(allTokens[index - 1])!;
      sentiment *= multiplier;
      intensity *= multiplier;
      weight *= 1.1;
    }
    
    return {
      value: sentiment,
      weight,
      intensity,
      emotions: entry.emotions,
    };
  }

  /**
   * Detect sarcasm/irony
   */
  private detectSarcasm(text: string, calculatedSentiment: number): boolean {
    // Simple heuristics for sarcasm detection
    const sarcasmIndicators = [
      /\byeah right\b/,
      /\bsure\b.*\bnot\b/,
      /\bgreat\b.*\b(not|sarcasm)\b/,
      /\bwonderful\b.*\b(disaster|terrible|awful)\b/,
    ];
    
    // Check for excessive punctuation (!!!, ???)
    const excessivePunctuation = /[!?]{3,}/;
    
    for (const pattern of sarcasmIndicators) {
      if (pattern.test(text)) return true;
    }
    
    // Positive words with negative context
    if (calculatedSentiment > 0.5 && text.includes('not')) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate sentiment trajectory
   */
  private calculateTrajectory(
    current: number,
    previous?: SentimentScore
  ): 'rising' | 'falling' | 'stable' | 'mixed' {
    if (!previous) return 'stable';
    
    const diff = current - previous.overall;
    
    if (Math.abs(diff) < 0.15) return 'stable';
    if (diff > 0.15) return 'rising';
    if (diff < -0.15) return 'falling';
    
    return 'mixed';
  }

  /**
   * Calculate confidence in sentiment analysis
   */
  private calculateConfidence(sentimentWords: number, totalWords: number, averageIntensity: number): number {
    if (totalWords === 0) return 0;
    
    // Based on coverage and intensity
    const coverage = sentimentWords / totalWords;
    return Math.min(coverage * 0.7 + averageIntensity * 0.3, 1.0);
  }

  /**
   * Calibrate sentiment to user baseline
   */
  private calibrateToUser(userId: string, sentiment: number): number {
    const baseline = this.userBaselines.get(userId) || 0;
    // Adjust relative to user's typical sentiment
    return sentiment - baseline * 0.3;
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[.,!?;:()]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Annotate tokens with linguistic features
   */
  private annotateTokens(tokens: string[]): string[] {
    // For now, just return tokens; could add POS tagging, etc.
    return tokens;
  }

  /**
   * Initialize sentiment lexicon
   */
  private initializeLexicon(): SentimentLexicon[] {
    return [
      // Positive emotions
      { word: 'happy', sentiment: 0.8, emotions: { joy: 0.9 }, intensity: 0.7 },
      { word: 'joy', sentiment: 0.9, emotions: { joy: 1.0 }, intensity: 0.8 },
      { word: 'excited', sentiment: 0.8, emotions: { joy: 0.8, surprise: 0.3 }, intensity: 0.9 },
      { word: 'love', sentiment: 0.9, emotions: { joy: 0.8, trust: 0.7 }, intensity: 0.9 },
      { word: 'great', sentiment: 0.7, emotions: { joy: 0.7 }, intensity: 0.6 },
      { word: 'good', sentiment: 0.6, emotions: { joy: 0.6 }, intensity: 0.5 },
      { word: 'wonderful', sentiment: 0.85, emotions: { joy: 0.9 }, intensity: 0.8 },
      { word: 'excellent', sentiment: 0.85, emotions: { joy: 0.8 }, intensity: 0.7 },
      { word: 'fantastic', sentiment: 0.9, emotions: { joy: 0.9 }, intensity: 0.8 },
      { word: 'amazing', sentiment: 0.9, emotions: { joy: 0.8, surprise: 0.5 }, intensity: 0.85 },
      { word: 'awesome', sentiment: 0.85, emotions: { joy: 0.8 }, intensity: 0.75 },
      { word: 'perfect', sentiment: 0.9, emotions: { joy: 0.9 }, intensity: 0.7 },
      
      // Negative emotions
      { word: 'sad', sentiment: -0.8, emotions: { sadness: 0.9 }, intensity: 0.7 },
      { word: 'unhappy', sentiment: -0.7, emotions: { sadness: 0.8 }, intensity: 0.6 },
      { word: 'angry', sentiment: -0.9, emotions: { anger: 0.9 }, intensity: 0.9 },
      { word: 'mad', sentiment: -0.85, emotions: { anger: 0.85 }, intensity: 0.8 },
      { word: 'furious', sentiment: -0.95, emotions: { anger: 1.0 }, intensity: 1.0 },
      { word: 'frustrated', sentiment: -0.7, emotions: { anger: 0.7 }, intensity: 0.7 },
      { word: 'annoyed', sentiment: -0.6, emotions: { anger: 0.6 }, intensity: 0.5 },
      { word: 'hate', sentiment: -0.9, emotions: { anger: 0.8 }, intensity: 0.9 },
      { word: 'terrible', sentiment: -0.85, emotions: { sadness: 0.6, fear: 0.4 }, intensity: 0.8 },
      { word: 'awful', sentiment: -0.85, emotions: { sadness: 0.7 }, intensity: 0.8 },
      { word: 'horrible', sentiment: -0.9, emotions: { sadness: 0.7, fear: 0.4 }, intensity: 0.85 },
      { word: 'bad', sentiment: -0.6, emotions: { sadness: 0.5 }, intensity: 0.5 },
      { word: 'worse', sentiment: -0.7, emotions: { sadness: 0.6 }, intensity: 0.6 },
      { word: 'worst', sentiment: -0.85, emotions: { sadness: 0.8 }, intensity: 0.8 },
      
      // Fear/Anxiety
      { word: 'worried', sentiment: -0.6, emotions: { fear: 0.7 }, intensity: 0.6 },
      { word: 'anxious', sentiment: -0.7, emotions: { fear: 0.8 }, intensity: 0.7 },
      { word: 'nervous', sentiment: -0.6, emotions: { fear: 0.7 }, intensity: 0.6 },
      { word: 'scared', sentiment: -0.8, emotions: { fear: 0.9 }, intensity: 0.8 },
      { word: 'afraid', sentiment: -0.75, emotions: { fear: 0.85 }, intensity: 0.75 },
      { word: 'stressed', sentiment: -0.7, emotions: { fear: 0.6, anger: 0.3 }, intensity: 0.75 },
      
      // Mixed/Neutral
      { word: 'surprised', sentiment: 0.2, emotions: { surprise: 0.9 }, intensity: 0.6 },
      { word: 'confused', sentiment: -0.3, emotions: { surprise: 0.5, fear: 0.3 }, intensity: 0.5 },
      { word: 'okay', sentiment: 0.1, emotions: {}, intensity: 0.3 },
      { word: 'fine', sentiment: 0.2, emotions: {}, intensity: 0.3 },
      { word: 'trust', sentiment: 0.7, emotions: { trust: 0.9 }, intensity: 0.6 },
    ];
  }
}

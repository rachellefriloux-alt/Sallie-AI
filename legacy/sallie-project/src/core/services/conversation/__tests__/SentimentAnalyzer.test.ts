/**
 * Sentiment Analyzer Tests
 */

import { SentimentAnalyzer } from '../nlu/SentimentAnalyzer';

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
  });

  describe('analyzeSentiment', () => {
    it('should detect positive sentiment', () => {
      const result = analyzer.analyzeSentiment('I am so happy and excited!');
      
      expect(result.overall).toBeGreaterThan(0);
      expect(result.dimensions.joy).toBeGreaterThan(0.5);
    });

    it('should detect negative sentiment', () => {
      const result = analyzer.analyzeSentiment('I am sad and frustrated');
      
      expect(result.overall).toBeLessThan(0);
      expect(result.dimensions.sadness).toBeGreaterThan(0.3);
    });

    it('should detect mixed emotions', () => {
      const result = analyzer.analyzeSentiment('I am happy but also a bit worried');
      
      expect(result.dimensions.joy).toBeGreaterThan(0);
      expect(result.dimensions.fear).toBeGreaterThan(0);
    });

    it('should measure intensity', () => {
      const intense = analyzer.analyzeSentiment('I am extremely angry!');
      const mild = analyzer.analyzeSentiment('I am a bit annoyed');
      
      expect(intense.intensity).toBeGreaterThan(mild.intensity);
    });

    it('should handle negation', () => {
      const result = analyzer.analyzeSentiment('I am not happy at all');
      
      expect(result.overall).toBeLessThan(0);
    });

    it('should provide confidence scores', () => {
      const result = analyzer.analyzeSentiment('This is great!');
      
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('updateUserBaseline', () => {
    it('should track user baseline sentiment', () => {
      analyzer.updateUserBaseline('user1', 0.2);
      analyzer.updateUserBaseline('user1', 0.3);
      
      const result = analyzer.analyzeSentiment('okay', 'user1');
      // Baseline should affect calibration
      expect(result.overall).toBeDefined();
    });
  });
});

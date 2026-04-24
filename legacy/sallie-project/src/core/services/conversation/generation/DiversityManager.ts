/**
 * Diversity Manager
 * Ensures response variety and avoids repetition
 */

export class DiversityManager {
  private recentResponses: string[] = [];
  private recentPhrases: Map<string, number> = new Map();
  private readonly historySize = 20;

  /**
   * Check if response is too similar to recent ones
   */
  public checkDiversity(response: string): { diverse: boolean; similarity: number } {
    if (this.recentResponses.length === 0) {
      return { diverse: true, similarity: 0 };
    }

    const similarities = this.recentResponses.map(prev => 
      this.calculateSimilarity(response, prev)
    );

    const maxSimilarity = Math.max(...similarities);
    const diverse = maxSimilarity < 0.7;

    return { diverse, similarity: maxSimilarity };
  }

  /**
   * Generate variations of response
   */
  public generateVariations(response: string, count = 3): string[] {
    const variations: string[] = [response];

    // Synonym substitution
    variations.push(this.substituteSynonyms(response));

    // Reorder sentences
    variations.push(this.reorderSentences(response));

    // Change perspective
    variations.push(this.changePerspective(response));

    // Remove duplicates and return requested count
    return [...new Set(variations)].slice(0, count);
  }

  /**
   * Track response for diversity checking
   */
  public trackResponse(response: string): void {
    this.recentResponses.push(response.toLowerCase());
    
    if (this.recentResponses.length > this.historySize) {
      this.recentResponses.shift();
    }

    // Track phrases
    const phrases = this.extractPhrases(response);
    for (const phrase of phrases) {
      const count = this.recentPhrases.get(phrase) || 0;
      this.recentPhrases.set(phrase, count + 1);
    }

    // Prune old phrases
    if (this.recentPhrases.size > 100) {
      const sorted = Array.from(this.recentPhrases.entries())
        .sort((a, b) => b[1] - a[1]);
      this.recentPhrases = new Map(sorted.slice(0, 50));
    }
  }

  /**
   * Get overused phrases
   */
  public getOverusedPhrases(threshold = 3): string[] {
    return Array.from(this.recentPhrases.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([phrase, _]) => phrase);
  }

  /**
   * Calculate similarity between two responses
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (const word of words1) {
      if (words2.has(word)) intersection++;
    }

    const union = words1.size + words2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Substitute synonyms
   */
  private substituteSynonyms(text: string): string {
    const synonyms: Record<string, string[]> = {
      'great': ['wonderful', 'excellent', 'fantastic'],
      'good': ['nice', 'fine', 'pleasant'],
      'help': ['assist', 'support', 'aid'],
      'understand': ['comprehend', 'grasp', 'see'],
      'think': ['believe', 'feel', 'suppose'],
    };

    let result = text;
    for (const [word, alternatives] of Object.entries(synonyms)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(result)) {
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
        result = result.replace(regex, replacement);
        break; // Only replace one word
      }
    }

    return result;
  }

  /**
   * Reorder sentences
   */
  private reorderSentences(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length <= 1) return text;

    // Swap last two sentences
    if (sentences.length >= 2) {
      const temp = sentences[sentences.length - 1];
      sentences[sentences.length - 1] = sentences[sentences.length - 2];
      sentences[sentences.length - 2] = temp;
    }

    return sentences.join('. ').trim() + '.';
  }

  /**
   * Change perspective/framing
   */
  private changePerspective(text: string): string {
    // Change "I can" to "Let me"
    let result = text.replace(/\bI can\b/g, 'Let me');
    result = result.replace(/\bI will\b/g, 'I\'ll');
    result = result.replace(/\bI would\b/g, 'I\'d');

    return result;
  }

  /**
   * Extract phrases from text
   */
  private extractPhrases(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const phrases: string[] = [];

    // Extract 2-grams and 3-grams
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words.slice(i, i + 2).join(' '));
      if (i < words.length - 2) {
        phrases.push(words.slice(i, i + 3).join(' '));
      }
    }

    return phrases;
  }
}

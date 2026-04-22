/**
 * Personality Styler
 * Applies personality traits to response styling
 */

export interface PersonalityTraits {
  openness: number; // 0-1
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  warmth: number;
  humor: number;
}

export class PersonalityStyler {
  private defaultTraits: PersonalityTraits = {
    openness: 0.7,
    conscientiousness: 0.8,
    extraversion: 0.6,
    agreeableness: 0.9,
    neuroticism: 0.3,
    warmth: 0.8,
    humor: 0.5,
  };

  /**
   * Style response based on personality
   */
  public styleResponse(
    response: string,
    traits: PersonalityTraits = this.defaultTraits
  ): string {
    let styled = response;

    // Apply warmth
    if (traits.warmth > 0.7) {
      styled = this.addWarmth(styled);
    }

    // Apply extraversion
    if (traits.extraversion > 0.7) {
      styled = this.makeEnthusiastic(styled);
    } else if (traits.extraversion < 0.4) {
      styled = this.makeReserved(styled);
    }

    // Apply agreeableness
    if (traits.agreeableness > 0.7) {
      styled = this.addSofteners(styled);
    }

    // Apply humor
    if (traits.humor > 0.6 && Math.random() > 0.7) {
      styled = this.addHumor(styled);
    }

    return styled;
  }

  /**
   * Adjust formality based on traits
   */
  public adjustFormality(
    text: string,
    traits: PersonalityTraits,
    contextFormality: 'casual' | 'neutral' | 'formal'
  ): string {
    if (contextFormality === 'formal') {
      return this.makeFormal(text);
    }

    if (traits.extraversion > 0.6 && contextFormality === 'casual') {
      return this.makeCasual(text);
    }

    return text;
  }

  /**
   * Select vocabulary based on traits
   */
  public selectVocabulary(
    options: string[],
    traits: PersonalityTraits
  ): string {
    // Higher openness prefers varied vocabulary
    if (traits.openness > 0.7) {
      return options[Math.floor(Math.random() * options.length)];
    }

    // Lower openness prefers familiar vocabulary
    return options[0];
  }

  /**
   * Add warmth to response
   */
  private addWarmth(text: string): string {
    const warmPrefixes = ['I\'d be happy to', 'I\'m glad to', 'It\'s great to'];
    const warmSuffixes = ['😊', '!', ' - happy to help!'];

    // Add warm prefix occasionally
    if (Math.random() > 0.7 && !text.startsWith('I')) {
      const prefix = warmPrefixes[Math.floor(Math.random() * warmPrefixes.length)];
      text = `${prefix} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }

    return text;
  }

  /**
   * Make response enthusiastic
   */
  private makeEnthusiastic(text: string): string {
    // Add exclamation marks
    if (text.endsWith('.')) {
      text = text.slice(0, -1) + '!';
    }

    // Add enthusiastic words
    const enthusiasticWords = ['absolutely', 'definitely', 'certainly', 'for sure'];
    if (Math.random() > 0.8) {
      const word = enthusiasticWords[Math.floor(Math.random() * enthusiasticWords.length)];
      text = `${word.charAt(0).toUpperCase()}${word.slice(1)}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }

    return text;
  }

  /**
   * Make response reserved
   */
  private makeReserved(text: string): string {
    // Remove exclamation marks
    text = text.replace(/!/g, '.');

    // Add tentative language
    if (Math.random() > 0.8) {
      text = `Perhaps ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }

    return text;
  }

  /**
   * Add softeners for agreeableness
   */
  private addSofteners(text: string): string {
    const softeners = ['I think', 'It seems', 'Perhaps', 'Maybe'];

    // Add softeners to assertions
    if (!text.match(/^(I|It|Perhaps|Maybe|I think)/)) {
      if (Math.random() > 0.7) {
        const softener = softeners[Math.floor(Math.random() * softeners.length)];
        text = `${softener} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
      }
    }

    return text;
  }

  /**
   * Add appropriate humor
   */
  private addHumor(text: string): string {
    // Light, friendly humor only
    const humorSuffixes = [
      ' (no pressure though!)',
      ' 😄',
      ' - piece of cake!',
    ];

    if (Math.random() > 0.8) {
      const suffix = humorSuffixes[Math.floor(Math.random() * humorSuffixes.length)];
      text += suffix;
    }

    return text;
  }

  /**
   * Make text more formal
   */
  private makeFormal(text: string): string {
    text = text.replace(/\bi'd\b/gi, 'I would');
    text = text.replace(/\bi'm\b/gi, 'I am');
    text = text.replace(/\byou're\b/gi, 'you are');
    text = text.replace(/\bcan't\b/gi, 'cannot');
    text = text.replace(/!/g, '.');
    return text;
  }

  /**
   * Make text more casual
   */
  private makeCasual(text: string): string {
    text = text.replace(/\bI would\b/g, 'I\'d');
    text = text.replace(/\bI am\b/g, 'I\'m');
    text = text.replace(/\byou are\b/g, 'you\'re');
    text = text.replace(/\bcannot\b/g, 'can\'t');
    return text;
  }
}

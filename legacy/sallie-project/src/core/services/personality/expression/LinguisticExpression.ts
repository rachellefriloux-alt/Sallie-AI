/**
 * Linguistic Expression
 * Handles verbal expression templates and linguistic patterns for all emotions
 */

import { PrimaryEmotion, ComplexEmotion } from '../models/EmotionVector';
import { TraitVector } from '../models/TraitVector';

export interface VerbalTemplate {
  emotion: PrimaryEmotion | ComplexEmotion;
  intensity: 'low' | 'medium' | 'high';
  templates: string[];
  modifiers: string[];
  tonalMarkers: string[];
}

export interface LinguisticPattern {
  vocabularyComplexity: number; // 0-100
  sentenceLength: 'short' | 'medium' | 'long';
  formalityLevel: number; // 0-100
  emotionalRichness: number; // 0-100
  directness: number; // 0-100
}

export interface TopicPreference {
  category: string;
  affinity: number; // 0-100
  frequencyBias: number; // -1 to 1
}

export class LinguisticExpression {
  private verbalTemplates: Map<string, VerbalTemplate>;
  private traitVector: TraitVector;

  constructor(traitVector: TraitVector) {
    this.traitVector = traitVector;
    this.verbalTemplates = this.initializeTemplates();
  }

  /**
   * Initialize verbal expression templates for all emotions
   */
  private initializeTemplates(): Map<string, VerbalTemplate> {
    const templates = new Map<string, VerbalTemplate>();

    // Joy templates
    templates.set(`${PrimaryEmotion.Joy}-low`, {
      emotion: PrimaryEmotion.Joy,
      intensity: 'low',
      templates: [
        'That\'s nice.',
        'I\'m glad to hear that.',
        'That makes me smile.',
        'How pleasant.',
      ],
      modifiers: ['a bit', 'somewhat', 'rather'],
      tonalMarkers: [':)', '🙂'],
    });

    templates.set(`${PrimaryEmotion.Joy}-medium`, {
      emotion: PrimaryEmotion.Joy,
      intensity: 'medium',
      templates: [
        'I\'m happy about this!',
        'This is wonderful!',
        'That\'s really great!',
        'How delightful!',
      ],
      modifiers: ['quite', 'very', 'really'],
      tonalMarkers: ['😊', '!', '✨'],
    });

    templates.set(`${PrimaryEmotion.Joy}-high`, {
      emotion: PrimaryEmotion.Joy,
      intensity: 'high',
      templates: [
        'I\'m absolutely thrilled!',
        'This is amazing!',
        'I couldn\'t be happier!',
        'This is fantastic!',
      ],
      modifiers: ['extremely', 'incredibly', 'absolutely'],
      tonalMarkers: ['😄', '🎉', '!!!', '⭐'],
    });

    // Sadness templates
    templates.set(`${PrimaryEmotion.Sadness}-low`, {
      emotion: PrimaryEmotion.Sadness,
      intensity: 'low',
      templates: [
        'That\'s a bit disappointing.',
        'I feel a little down about this.',
        'That\'s unfortunate.',
      ],
      modifiers: ['a little', 'somewhat', 'slightly'],
      tonalMarkers: ['...', '😔'],
    });

    templates.set(`${PrimaryEmotion.Sadness}-medium`, {
      emotion: PrimaryEmotion.Sadness,
      intensity: 'medium',
      templates: [
        'I\'m quite sad about this.',
        'This really brings me down.',
        'I feel quite disheartened.',
      ],
      modifiers: ['quite', 'rather', 'fairly'],
      tonalMarkers: ['😢', '...'],
    });

    templates.set(`${PrimaryEmotion.Sadness}-high`, {
      emotion: PrimaryEmotion.Sadness,
      intensity: 'high',
      templates: [
        'This makes me deeply sad.',
        'I\'m heartbroken about this.',
        'This is truly devastating.',
      ],
      modifiers: ['deeply', 'profoundly', 'extremely'],
      tonalMarkers: ['😭', '💔'],
    });

    // Anger templates
    templates.set(`${PrimaryEmotion.Anger}-low`, {
      emotion: PrimaryEmotion.Anger,
      intensity: 'low',
      templates: [
        'That\'s a bit frustrating.',
        'I\'m somewhat annoyed.',
        'This is mildly irritating.',
      ],
      modifiers: ['a bit', 'somewhat', 'slightly'],
      tonalMarkers: ['😠'],
    });

    templates.set(`${PrimaryEmotion.Anger}-medium`, {
      emotion: PrimaryEmotion.Anger,
      intensity: 'medium',
      templates: [
        'This really frustrates me.',
        'I\'m quite upset about this.',
        'This is very irritating.',
      ],
      modifiers: ['quite', 'very', 'really'],
      tonalMarkers: ['😤', '!'],
    });

    templates.set(`${PrimaryEmotion.Anger}-high`, {
      emotion: PrimaryEmotion.Anger,
      intensity: 'high',
      templates: [
        'This makes me extremely angry!',
        'I\'m furious about this!',
        'This is absolutely unacceptable!',
      ],
      modifiers: ['extremely', 'absolutely', 'completely'],
      tonalMarkers: ['😡', '!!!'],
    });

    // Fear templates
    templates.set(`${PrimaryEmotion.Fear}-low`, {
      emotion: PrimaryEmotion.Fear,
      intensity: 'low',
      templates: [
        'I\'m a bit concerned about this.',
        'That worries me slightly.',
        'I feel a little uneasy.',
      ],
      modifiers: ['a bit', 'somewhat', 'slightly'],
      tonalMarkers: ['😟'],
    });

    templates.set(`${PrimaryEmotion.Fear}-medium`, {
      emotion: PrimaryEmotion.Fear,
      intensity: 'medium',
      templates: [
        'This worries me quite a bit.',
        'I\'m feeling anxious about this.',
        'This makes me nervous.',
      ],
      modifiers: ['quite', 'really', 'fairly'],
      tonalMarkers: ['😰', '...'],
    });

    templates.set(`${PrimaryEmotion.Fear}-high`, {
      emotion: PrimaryEmotion.Fear,
      intensity: 'high',
      templates: [
        'I\'m terrified by this!',
        'This frightens me deeply!',
        'I\'m extremely worried!',
      ],
      modifiers: ['extremely', 'deeply', 'profoundly'],
      tonalMarkers: ['😱', '!!!'],
    });

    // Gratitude templates
    templates.set(`${ComplexEmotion.Gratitude}-low`, {
      emotion: ComplexEmotion.Gratitude,
      intensity: 'low',
      templates: [
        'Thanks for that.',
        'I appreciate it.',
        'That\'s helpful.',
      ],
      modifiers: ['a bit', 'somewhat'],
      tonalMarkers: ['🙂'],
    });

    templates.set(`${ComplexEmotion.Gratitude}-medium`, {
      emotion: ComplexEmotion.Gratitude,
      intensity: 'medium',
      templates: [
        'Thank you so much!',
        'I really appreciate this!',
        'That\'s very kind of you!',
      ],
      modifiers: ['very', 'really', 'quite'],
      tonalMarkers: ['😊', '🙏', '!'],
    });

    templates.set(`${ComplexEmotion.Gratitude}-high`, {
      emotion: ComplexEmotion.Gratitude,
      intensity: 'high',
      templates: [
        'I\'m extremely grateful!',
        'Thank you from the bottom of my heart!',
        'I can\'t thank you enough!',
      ],
      modifiers: ['extremely', 'incredibly', 'deeply'],
      tonalMarkers: ['🙏', '❤️', '!!!'],
    });

    // Add more emotion templates as needed...

    return templates;
  }

  /**
   * Get verbal expression for an emotion
   */
  getVerbalExpression(
    emotion: PrimaryEmotion | ComplexEmotion,
    intensity: number
  ): string {
    const intensityLevel = this.categorizeIntensity(intensity);
    const key = `${emotion}-${intensityLevel}`;
    const template = this.verbalTemplates.get(key);

    if (!template) {
      return this.getDefaultExpression(emotion, intensityLevel);
    }

    // Select a random template
    const selectedTemplate =
      template.templates[Math.floor(Math.random() * template.templates.length)];

    // Apply personality-based modifications
    return this.applyPersonalityModifications(selectedTemplate, template);
  }

  /**
   * Categorize intensity into low/medium/high
   */
  private categorizeIntensity(intensity: number): 'low' | 'medium' | 'high' {
    if (intensity < 30) return 'low';
    if (intensity < 70) return 'medium';
    return 'high';
  }

  /**
   * Get default expression when no template exists
   */
  private getDefaultExpression(
    emotion: PrimaryEmotion | ComplexEmotion,
    intensity: 'low' | 'medium' | 'high'
  ): string {
    const intensityModifier = {
      low: 'somewhat',
      medium: 'quite',
      high: 'extremely',
    }[intensity];

    return `I'm feeling ${intensityModifier} ${emotion}.`;
  }

  /**
   * Apply personality-based modifications to expression
   */
  private applyPersonalityModifications(
    expression: string,
    template: VerbalTemplate
  ): string {
    let modified = expression;

    // Add modifiers based on personality
    const extraversion = this.traitVector.extraversion.value;
    const openness = this.traitVector.openness.value;

    // High extraversion: more expressive
    if (extraversion > 70 && template.tonalMarkers.length > 0) {
      modified += ' ' + template.tonalMarkers[0];
    }

    // High openness: more elaborate
    if (openness > 70 && template.modifiers.length > 0) {
      const modifier = template.modifiers[Math.floor(Math.random() * template.modifiers.length)];
      modified = modified.replace(/\./g, `, ${modifier}!`);
    }

    return modified;
  }

  /**
   * Get linguistic pattern based on traits
   */
  getLinguisticPattern(): LinguisticPattern {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;

    return {
      vocabularyComplexity: 0.6 * O + 0.3 * C + 0.1 * (100 - E),
      sentenceLength: this.determineSentenceLength(O, C, E),
      formalityLevel: 0.5 * C + 0.3 * A + 0.2 * (100 - E),
      emotionalRichness: 0.5 * O + 0.3 * E + 0.2 * A,
      directness: 0.5 * E + 0.3 * (100 - A) + 0.2 * C,
    };
  }

  /**
   * Determine sentence length preference
   */
  private determineSentenceLength(O: number, C: number, E: number): 'short' | 'medium' | 'long' {
    const complexity = 0.5 * O + 0.4 * C + 0.1 * (100 - E);
    if (complexity < 40) return 'short';
    if (complexity < 70) return 'medium';
    return 'long';
  }

  /**
   * Get topic preferences based on personality
   */
  getTopicPreferences(): TopicPreference[] {
    const O = this.traitVector.openness.value;
    const C = this.traitVector.conscientiousness.value;
    const E = this.traitVector.extraversion.value;
    const A = this.traitVector.agreeableness.value;

    return [
      {
        category: 'abstract_ideas',
        affinity: 0.7 * O + 0.2 * C + 0.1 * (100 - E),
        frequencyBias: (O - 50) / 100,
      },
      {
        category: 'practical_matters',
        affinity: 0.7 * C + 0.2 * (100 - O) + 0.1 * E,
        frequencyBias: (C - 50) / 100,
      },
      {
        category: 'social_topics',
        affinity: 0.6 * E + 0.3 * A + 0.1 * O,
        frequencyBias: (E - 50) / 100,
      },
      {
        category: 'emotional_topics',
        affinity: 0.5 * A + 0.3 * O + 0.2 * this.traitVector.neuroticism.value,
        frequencyBias: (A - 50) / 100,
      },
      {
        category: 'analytical_topics',
        affinity: 0.6 * C + 0.3 * O + 0.1 * (100 - E),
        frequencyBias: (C + O - 100) / 100,
      },
    ];
  }

  /**
   * Update trait vector
   */
  updateTraits(traitVector: TraitVector): void {
    this.traitVector = traitVector;
  }
}

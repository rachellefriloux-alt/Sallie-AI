/**
 * Template Engine
 * Manages response templates and selection
 */

import { IntentType } from '../models/Intent';

export interface ResponseTemplate {
  id: string;
  intentType: IntentType;
  template: string;
  parameters: string[];
  emotionLevel?: 'neutral' | 'warm' | 'enthusiastic' | 'empathetic';
  formality?: 'casual' | 'neutral' | 'formal';
  usageCount: number;
  effectiveness: number;
}

export class TemplateEngine {
  private templates: Map<IntentType, ResponseTemplate[]>;
  private templateUsageHistory: Map<string, number>;

  constructor() {
    this.templates = new Map();
    this.templateUsageHistory = new Map();
    this.initializeTemplates();
  }

  /**
   * Select appropriate template
   */
  public selectTemplate(
    intentType: IntentType,
    emotion = 'neutral',
    formality = 'casual',
    avoidRecent = true
  ): ResponseTemplate | null {
    const candidates = this.templates.get(intentType) || [];
    if (candidates.length === 0) return null;

    // Filter by emotion and formality
    let filtered = candidates.filter(t => 
      (!t.emotionLevel || t.emotionLevel === emotion) &&
      (!t.formality || t.formality === formality)
    );

    if (filtered.length === 0) filtered = candidates;

    // Avoid recently used templates
    if (avoidRecent) {
      filtered = filtered.sort((a, b) => {
        const usageA = this.templateUsageHistory.get(a.id) || 0;
        const usageB = this.templateUsageHistory.get(b.id) || 0;
        return usageA - usageB;
      });
    }

    // Select based on effectiveness
    const weighted = filtered.map(t => ({
      template: t,
      weight: t.effectiveness + (Math.random() * 0.2), // Add randomness
    }));

    weighted.sort((a, b) => b.weight - a.weight);
    const selected = weighted[0].template;

    // Update usage
    this.templateUsageHistory.set(selected.id, Date.now());
    selected.usageCount++;

    return selected;
  }

  /**
   * Fill template with parameters
   */
  public fillTemplate(template: ResponseTemplate, params: Record<string, any>): string {
    let result = template.template;

    // Replace parameters
    for (const param of template.parameters) {
      const value = params[param] || '';
      result = result.replace(new RegExp(`{${param}}`, 'g'), String(value));
    }

    // Remove unfilled parameters
    result = result.replace(/{[^}]+}/g, '');

    return result.trim();
  }

  /**
   * Update template effectiveness
   */
  public updateEffectiveness(templateId: string, success: boolean): void {
    for (const [intentType, templates] of this.templates.entries()) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Exponential moving average
        const delta = success ? 0.1 : -0.1;
        template.effectiveness = Math.max(0, Math.min(1, template.effectiveness + delta));
        break;
      }
    }
  }

  /**
   * Initialize template library
   */
  private initializeTemplates(): void {
    // Information request responses
    this.addTemplates(IntentType.INFORMATION_REQUEST, [
      { template: "Let me explain {topic}. {content}", params: ['topic', 'content'], emotion: 'neutral', effectiveness: 0.8 },
      { template: "Great question! {content}", params: ['content'], emotion: 'enthusiastic', effectiveness: 0.85 },
      { template: "I'd be happy to help with that. {content}", params: ['content'], emotion: 'warm', effectiveness: 0.8 },
      { template: "Here's what I know about {topic}: {content}", params: ['topic', 'content'], emotion: 'neutral', effectiveness: 0.75 },
    ]);

    // Action request responses
    this.addTemplates(IntentType.ACTION_REQUEST, [
      { template: "I'll {action} for you right away.", params: ['action'], emotion: 'warm', effectiveness: 0.85 },
      { template: "Sure, I can help with that. {details}", params: ['details'], emotion: 'neutral', effectiveness: 0.8 },
      { template: "Consider it done! I'll {action}.", params: ['action'], emotion: 'enthusiastic', effectiveness: 0.9 },
      { template: "I'm on it. {status}", params: ['status'], emotion: 'neutral', effectiveness: 0.75 },
    ]);

    // Emotional expression responses
    this.addTemplates(IntentType.EMOTIONAL_EXPRESSION, [
      { template: "I understand you're feeling {emotion}. {support}", params: ['emotion', 'support'], emotion: 'empathetic', effectiveness: 0.9 },
      { template: "That sounds {emotion}. I'm here for you. {content}", params: ['emotion', 'content'], emotion: 'empathetic', effectiveness: 0.85 },
      { template: "I can sense you're {emotion}. {response}", params: ['emotion', 'response'], emotion: 'empathetic', effectiveness: 0.8 },
    ]);

    // Greeting responses
    this.addTemplates(IntentType.GREETING, [
      { template: "Hello! How can I help you today?", params: [], emotion: 'warm', effectiveness: 0.85 },
      { template: "Hi there! Great to see you!", params: [], emotion: 'enthusiastic', effectiveness: 0.9 },
      { template: "Hey! What's on your mind?", params: [], emotion: 'warm', effectiveness: 0.8 },
      { template: "Good to hear from you! How are you doing?", params: [], emotion: 'warm', effectiveness: 0.85 },
    ]);

    // Farewell responses
    this.addTemplates(IntentType.FAREWELL, [
      { template: "Goodbye! Take care!", params: [], emotion: 'warm', effectiveness: 0.85 },
      { template: "See you later! Don't hesitate to reach out.", params: [], emotion: 'warm', effectiveness: 0.8 },
      { template: "Talk to you soon! Have a great {timeOfDay}!", params: ['timeOfDay'], emotion: 'warm', effectiveness: 0.9 },
    ]);

    // Clarification responses
    this.addTemplates(IntentType.CLARIFICATION, [
      { template: "Just to clarify, did you mean {interpretation}?", params: ['interpretation'], emotion: 'neutral', effectiveness: 0.85 },
      { template: "I want to make sure I understand. Are you asking about {topic}?", params: ['topic'], emotion: 'neutral', effectiveness: 0.8 },
      { template: "Could you tell me more about {aspect}?", params: ['aspect'], emotion: 'neutral', effectiveness: 0.75 },
    ]);

    // Feedback responses
    this.addTemplates(IntentType.FEEDBACK, [
      { template: "Thank you for the feedback! I appreciate it.", params: [], emotion: 'warm', effectiveness: 0.85 },
      { template: "I'm glad that was helpful!", params: [], emotion: 'enthusiastic', effectiveness: 0.9 },
      { template: "Thanks for letting me know. I'll work on improving.", params: [], emotion: 'empathetic', effectiveness: 0.8 },
    ]);

    // Social interaction responses
    this.addTemplates(IntentType.SOCIAL_INTERACTION, [
      { template: "That's interesting! Tell me more about {topic}.", params: ['topic'], emotion: 'enthusiastic', effectiveness: 0.85 },
      { template: "I'd love to hear more about that. {question}", params: ['question'], emotion: 'warm', effectiveness: 0.8 },
      { template: "{acknowledgment} That sounds {descriptor}!", params: ['acknowledgment', 'descriptor'], emotion: 'warm', effectiveness: 0.8 },
    ]);

    // Preference statement responses
    this.addTemplates(IntentType.PREFERENCE_STATEMENT, [
      { template: "Good to know you prefer {preference}. I'll remember that.", params: ['preference'], emotion: 'neutral', effectiveness: 0.85 },
      { template: "Thanks for sharing! I'll keep {preference} in mind.", params: ['preference'], emotion: 'warm', effectiveness: 0.8 },
    ]);

    // Confirmation responses
    this.addTemplates(IntentType.CONFIRMATION, [
      { template: "Got it! {action}", params: ['action'], emotion: 'neutral', effectiveness: 0.8 },
      { template: "Perfect! {confirmation}", params: ['confirmation'], emotion: 'enthusiastic', effectiveness: 0.85 },
    ]);

    // Default/unknown
    this.addTemplates(IntentType.UNKNOWN, [
      { template: "I'm not sure I understand. Could you rephrase that?", params: [], emotion: 'neutral', effectiveness: 0.7 },
      { template: "Interesting! Could you tell me more so I can better help you?", params: [], emotion: 'warm', effectiveness: 0.75 },
    ]);
  }

  /**
   * Add templates for an intent type
   */
  private addTemplates(intentType: IntentType, templates: Array<any>): void {
    const fullTemplates = templates.map((t, i) => ({
      id: `${intentType}_${i}`,
      intentType,
      template: t.template!,
      parameters: t.params || [],
      emotionLevel: t.emotion as any,
      formality: 'casual' as const,
      usageCount: 0,
      effectiveness: t.effectiveness || 0.8,
    }));

    this.templates.set(intentType, fullTemplates);
  }
}

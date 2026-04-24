/**
 * Response Generator
 * Main orchestrator for response generation
 */

import { ConversationContext } from '../models/ConversationContext';
import { Intent, IntentType } from '../models/Intent';
import { Entity } from '../models/Entity';
import { TemplateEngine } from './TemplateEngine';
import { ContentFiller } from './ContentFiller';
import { PersonalityStyler, PersonalityTraits } from './PersonalityStyler';
import { MemoryIntegrator, Memory } from './MemoryIntegrator';
import { AppropriatenessChecker } from './AppropriatenessChecker';
import { DiversityManager } from './DiversityManager';

export interface ResponseGenerationOptions {
  intent: Intent;
  entities: Entity[];
  context: ConversationContext;
  personality?: PersonalityTraits;
  includeMemories?: boolean;
  maxAttempts?: number;
}

export interface GeneratedResponse {
  text: string;
  confidence: number;
  metadata: {
    templateUsed?: string;
    memoriesIncluded: number;
    appropriatenessScore: number;
    diversityScore: number;
  };
}

export class ResponseGenerator {
  private templateEngine: TemplateEngine;
  private contentFiller: ContentFiller;
  private personalityStyler: PersonalityStyler;
  private memoryIntegrator: MemoryIntegrator;
  private appropriatenessChecker: AppropriatenessChecker;
  private diversityManager: DiversityManager;

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.contentFiller = new ContentFiller();
    this.personalityStyler = new PersonalityStyler();
    this.memoryIntegrator = new MemoryIntegrator();
    this.appropriatenessChecker = new AppropriatenessChecker();
    this.diversityManager = new DiversityManager();
  }

  /**
   * Generate response
   */
  public async generateResponse(options: ResponseGenerationOptions): Promise<GeneratedResponse> {
    const maxAttempts = options.maxAttempts || 3;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await this.attemptGeneration(options);
      
      // Check appropriateness
      const appropriatenessResult = this.appropriatenessChecker.check(response.text, options.context);
      
      // Check diversity
      const diversityResult = this.diversityManager.checkDiversity(response.text);
      
      if (appropriatenessResult.appropriate && diversityResult.diverse) {
        this.diversityManager.trackResponse(response.text);
        
        return {
          ...response,
          metadata: {
            ...response.metadata,
            appropriatenessScore: appropriatenessResult.score,
            diversityScore: 1 - diversityResult.similarity,
          },
        };
      }
      
      // If not appropriate or diverse, generate variation
      if (!diversityResult.diverse && attempt < maxAttempts - 1) {
        const variations = this.diversityManager.generateVariations(response.text, 2);
        if (variations.length > 1) {
          response.text = variations[1]; // Try variation
        }
      }
    }
    
    // Fallback: return best attempt
    return this.attemptGeneration(options);
  }

  /**
   * Generate multi-turn response plan
   */
  public planMultiTurnResponse(
    content: string,
    context: ConversationContext,
    maxTurns = 3
  ): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length <= maxTurns) {
      return sentences.map(s => s.trim() + '.');
    }
    
    // Group sentences into turns
    const turns: string[] = [];
    const sentencesPerTurn = Math.ceil(sentences.length / maxTurns);
    
    for (let i = 0; i < sentences.length; i += sentencesPerTurn) {
      const turnSentences = sentences.slice(i, i + sentencesPerTurn);
      turns.push(turnSentences.join('. ').trim() + '.');
    }
    
    return turns;
  }

  /**
   * Add memory for future reference
   */
  public addMemory(memory: Memory): void {
    this.memoryIntegrator.addMemory(memory);
  }

  /**
   * Attempt to generate response
   */
  private async attemptGeneration(options: ResponseGenerationOptions): Promise<GeneratedResponse> {
    // Step 1: Select template
    const emotion = this.determineEmotionalTone(options.context);
    const template = this.templateEngine.selectTemplate(
      options.intent.type,
      emotion,
      'casual',
      true
    );
    
    if (!template) {
      return this.generateFallbackResponse(options);
    }
    
    // Step 2: Fill content
    const params = this.fillParameters(template.parameters, options);
    let response = this.templateEngine.fillTemplate(template, params);
    
    // Step 3: Apply personality styling
    if (options.personality) {
      response = this.personalityStyler.styleResponse(response, options.personality);
    }
    
    // Step 4: Integrate memories
    let memoriesIncluded = 0;
    if (options.includeMemories !== false) {
      const relevantMemories = this.memoryIntegrator.retrieveRelevant(
        options.context,
        options.entities,
        2
      );
      
      for (const memory of relevantMemories) {
        if (this.memoryIntegrator.shouldMention(memory, options.context)) {
          response = this.memoryIntegrator.integrateMemory(response, memory, 'implicit');
          memoriesIncluded++;
          break; // Only integrate one memory per response
        }
      }
    }
    
    // Step 5: Final polish
    response = this.polishResponse(response);
    
    return {
      text: response,
      confidence: this.calculateConfidence(template, options),
      metadata: {
        templateUsed: template.id,
        memoriesIncluded,
        appropriatenessScore: 1.0,
        diversityScore: 1.0,
      },
    };
  }

  /**
   * Fill template parameters
   */
  private fillParameters(
    parameters: string[],
    options: ResponseGenerationOptions
  ): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const param of parameters) {
      params[param] = this.contentFiller.fillContent(
        param,
        options.context,
        options.entities
      );
    }
    
    // Add intent-specific parameters
    if (options.intent.parameters) {
      Object.assign(params, options.intent.parameters);
    }
    
    return params;
  }

  /**
   * Determine emotional tone for response
   */
  private determineEmotionalTone(context: ConversationContext): string {
    if (!context.currentSentiment) return 'neutral';
    
    const sentiment = context.currentSentiment;
    
    // Match user's emotional state
    if (sentiment.dimensions.sadness > 0.6 || sentiment.dimensions.fear > 0.6) {
      return 'empathetic';
    }
    
    if (sentiment.dimensions.joy > 0.6) {
      return 'enthusiastic';
    }
    
    if (sentiment.overall > 0.3) {
      return 'warm';
    }
    
    return 'neutral';
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(options: ResponseGenerationOptions): GeneratedResponse {
    const fallbacks = [
      "I understand. Let me help you with that.",
      "I'm here to assist. What would you like to know?",
      "I appreciate you sharing that with me.",
      "That's interesting. Tell me more.",
    ];
    
    const response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return {
      text: response,
      confidence: 0.6,
      metadata: {
        memoriesIncluded: 0,
        appropriatenessScore: 0.8,
        diversityScore: 0.8,
      },
    };
  }

  /**
   * Polish final response
   */
  private polishResponse(text: string): string {
    // Ensure proper punctuation
    text = text.trim();
    if (!text.match(/[.!?]$/)) {
      text += '.';
    }
    
    // Fix spacing
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\s+([.,!?])/g, '$1');
    
    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    return text;
  }

  /**
   * Calculate response confidence
   */
  private calculateConfidence(template: any, options: ResponseGenerationOptions): number {
    let confidence = options.intent.confidence * 0.5;
    confidence += template.effectiveness * 0.3;
    
    // Boost if entities present
    if (options.entities.length > 0) {
      confidence += 0.1;
    }
    
    // Boost if context is rich
    if (options.context.turns.length > 3) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }
}

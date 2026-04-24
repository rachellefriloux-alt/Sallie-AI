/**
 * Conversation Service
 * Main service integrating all conversation components
 */

import { ConversationContext, ConversationTurn } from './models/ConversationContext';
import { IntentRecognizer } from './nlu/IntentRecognizer';
import { EntityExtractor } from './nlu/EntityExtractor';
import { ContextManager } from './nlu/ContextManager';
import { SentimentAnalyzer } from './nlu/SentimentAnalyzer';
import { TopicModeler } from './nlu/TopicModeler';
import { ReferenceResolver } from './nlu/ReferenceResolver';
import { SpeechActClassifier } from './nlu/SpeechActClassifier';
import { ResponseGenerator } from './generation/ResponseGenerator';
import { DialogueManager } from './dialogue/DialogueManager';

export interface ProcessMessageOptions {
  userId: string;
  conversationId: string;
  sessionId: string;
  includeMemories?: boolean;
  personality?: any;
}

export interface ConversationResponse {
  text: string;
  confidence: number;
  needsClarification: boolean;
  suggestedTopics?: string[];
  metadata: {
    intent: string;
    entities: number;
    sentiment: number;
    responseTime: number;
  };
}

export interface StreamingOptions extends ProcessMessageOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: ConversationResponse) => void;
  chunkSize?: number;
}

export class ConversationService {
  // NLU Components
  private intentRecognizer: IntentRecognizer;
  private entityExtractor: EntityExtractor;
  private contextManager: ContextManager;
  private sentimentAnalyzer: SentimentAnalyzer;
  private topicModeler: TopicModeler;
  private referenceResolver: ReferenceResolver;
  private speechActClassifier: SpeechActClassifier;

  // Generation Components
  private responseGenerator: ResponseGenerator;

  // Dialogue Components
  private dialogueManager: DialogueManager;

  constructor() {
    // Initialize NLU
    this.intentRecognizer = new IntentRecognizer();
    this.entityExtractor = new EntityExtractor();
    this.contextManager = new ContextManager();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.topicModeler = new TopicModeler();
    this.referenceResolver = new ReferenceResolver();
    this.speechActClassifier = new SpeechActClassifier();

    // Initialize Generation
    this.responseGenerator = new ResponseGenerator();

    // Initialize Dialogue
    this.dialogueManager = new DialogueManager();
  }

  /**
   * Process user message and generate response
   */
  public async processMessage(
    message: string,
    options: ProcessMessageOptions
  ): Promise<ConversationResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Get or create context
      let context = this.contextManager.getContext(options.conversationId);
      if (!context) {
        context = this.contextManager.createContext(
          options.conversationId,
          options.userId,
          options.sessionId
        );
      }

      // Step 2: Perform NLU
      const nluResults = await this.performNLU(message, context);

      // Step 3: Create turn and add to context
      const turn: ConversationTurn = {
        id: `turn_${Date.now()}`,
        speaker: 'user',
        text: message,
        timestamp: new Date(),
        intent: nluResults.intent.primaryIntent,
        entities: nluResults.entities,
        sentiment: nluResults.sentiment,
        speechAct: nluResults.speechAct.primaryAct.type,
      };

      this.contextManager.addTurn(options.conversationId, turn);
      this.contextManager.updateTopics(options.conversationId, nluResults.topics);

      // Step 4: Update dialogue state
      this.dialogueManager.updateState(options.conversationId, context);

      // Step 5: Check for meta-conversation
      const metaResponse = this.dialogueManager.handleMetaConversation(
        options.conversationId,
        message,
        context
      );

      if (metaResponse) {
        return this.createResponse(metaResponse, 0.95, false, startTime, nluResults);
      }

      // Step 6: Check for clarification needs
      const clarificationResponse = this.dialogueManager.checkClarificationNeed(
        options.conversationId,
        context
      );
      
      if (clarificationResponse) {
        return this.createResponse(clarificationResponse, 0.9, true, startTime, nluResults);
      }

      // Step 7: Check for errors and recovery
      const errorResponse = this.dialogueManager.handleErrors(
        options.conversationId,
        message,
        context
      );
      
      if (errorResponse) {
        return this.createResponse(errorResponse, 0.85, false, startTime, nluResults);
      }

      // Step 8: Generate response
      const generatedResponse = await this.responseGenerator.generateResponse({
        intent: nluResults.intent.primaryIntent,
        entities: nluResults.entities,
        context,
        personality: options.personality,
        includeMemories: options.includeMemories,
      });

      // Step 9: Add assistant turn to context
      const assistantTurn: ConversationTurn = {
        id: `turn_${Date.now()}`,
        speaker: 'assistant',
        text: generatedResponse.text,
        timestamp: new Date(),
        entities: [],
      };
      this.contextManager.addTurn(options.conversationId, assistantTurn);

      // Step 10: Check for topic suggestions
      const topicSuggestion = this.dialogueManager.suggestTopic(options.conversationId, context);

      return this.createResponse(
        generatedResponse.text,
        generatedResponse.confidence,
        false,
        startTime,
        nluResults,
        topicSuggestion ? [topicSuggestion] : undefined
      );

    } catch (error) {
      console.error('Error processing message:', error);
      return this.createErrorResponse(startTime);
    }
  }

  /**
   * Start a new conversation
   */
  public startConversation(userId: string, sessionId: string): string {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.contextManager.createContext(conversationId, userId, sessionId);
    return conversationId;
  }

  /**
   * Get conversation context
   */
  public getContext(conversationId: string): ConversationContext | null {
    return this.contextManager.getContext(conversationId);
  }

  /**
   * End conversation
   */
  public endConversation(conversationId: string): void {
    const context = this.contextManager.getContext(conversationId);
    if (context) {
      context.conversationState = 'ended';
    }
  }

  /**
   * Perform Natural Language Understanding
   */
  private async performNLU(message: string, context: ConversationContext) {
    // Intent recognition
    const intent = this.intentRecognizer.recognizeIntent(message, context);

    // Entity extraction
    const entityResult = this.entityExtractor.extractEntities(message, context.currentTurn);

    // Sentiment analysis
    const sentiment = this.sentimentAnalyzer.analyzeSentiment(
      message,
      context.userId,
      context.currentSentiment
    );

    // Topic modeling
    const topics = this.topicModeler.identifyTopics(message, entityResult.entities);

    // Reference resolution
    this.referenceResolver.resolveAnaphora(message, context);

    // Speech act classification
    const speechAct = this.speechActClassifier.classify(message, context);

    // Update user patterns and baselines
    this.intentRecognizer.learnUserPattern(
      context.userId,
      intent.primaryIntent.type,
      message
    );
    this.sentimentAnalyzer.updateUserBaseline(context.userId, sentiment.overall);

    return {
      intent,
      entities: entityResult.entities,
      sentiment,
      topics,
      speechAct,
    };
  }

  /**
   * Create response object
   */
  private createResponse(
    text: string,
    confidence: number,
    needsClarification: boolean,
    startTime: number,
    nluResults: any,
    suggestedTopics?: string[]
  ): ConversationResponse {
    return {
      text,
      confidence,
      needsClarification,
      suggestedTopics,
      metadata: {
        intent: nluResults.intent.primaryIntent.type,
        entities: nluResults.entities.length,
        sentiment: nluResults.sentiment.overall,
        responseTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(startTime: number): ConversationResponse {
    return {
      text: "I apologize, but I'm having trouble processing that. Could you try rephrasing?",
      confidence: 0.5,
      needsClarification: false,
      metadata: {
        intent: 'error',
        entities: 0,
        sentiment: 0,
        responseTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Process message with streaming response
   */
  public async processMessageStreaming(
    message: string,
    options: StreamingOptions
  ): Promise<ConversationResponse> {
    const response = await this.processMessage(message, options);

    if (options.onChunk) {
      // Stream the response in chunks
      const chunkSize = options.chunkSize || 10;
      const words = response.text.split(' ');
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        options.onChunk(chunk);
        
        // Simulate natural typing delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    if (options.onComplete) {
      options.onComplete(response);
    }

    return response;
  }

  /**
   * Cleanup old conversations
   */
  public cleanup(maxAge: number = 3600000): void {
    this.contextManager.cleanup(maxAge);
    this.dialogueManager.cleanup(maxAge);
  }

  /**
   * Get service health status
   */
  public getHealthStatus(): { healthy: boolean; components: Record<string, boolean> } {
    return {
      healthy: true,
      components: {
        nlu: true,
        generation: true,
        dialogue: true,
        context: true,
      },
    };
  }
}

/**
 * Personality Service
 * Main service integrating all personality components
 */

import { TraitManager, TraitUpdateOptions } from './traits/TraitManager';
import { TraitEvolution, ExperienceInput } from './traits/TraitEvolution';
import { TraitInfluenceMapper } from './traits/TraitInfluenceMapper';
import { TraitExpression } from './traits/TraitExpression';
import { IdentityAnchorSystem } from './traits/IdentityAnchor';
import { EmotionEngine, EmotionGenerationInput } from './emotions/EmotionEngine';
import { EmotionTransitionSystem } from './emotions/EmotionTransition';
import { StimulusProcessor } from './emotions/StimulusProcessor';
import { EmotionDecaySystem } from './emotions/EmotionDecay';
import { EmotionalMemory } from './emotions/EmotionalMemory';
import { MoodTracker } from './emotions/MoodTracker';
import { ExpressionMapper, ExpressionProfile } from './expression/ExpressionMapper';
import { TraitVector, createDefaultTraitVector } from './models/TraitVector';
import { EmotionVector, createDefaultBaseline } from './models/EmotionVector';
import { StimulusType } from './models/EmotionalState';

export interface PersonalityConfig {
  initialTraits?: Partial<TraitVector>;
  anchorStrength?: number;
  emotionDecayRate?: number;
}

export interface PersonalityState {
  traits: TraitVector;
  emotions: EmotionVector;
  expressionProfile: ExpressionProfile;
  consistencyScore: number;
}

export class PersonalityService {
  private traitManager: TraitManager;
  private traitEvolution: TraitEvolution;
  private traitInfluence: TraitInfluenceMapper;
  private traitExpression: TraitExpression;
  private identityAnchor: IdentityAnchorSystem;
  private emotionEngine: EmotionEngine;
  private emotionTransition: EmotionTransitionSystem;
  private stimulusProcessor: StimulusProcessor;
  private emotionDecay: EmotionDecaySystem;
  private emotionalMemory: EmotionalMemory;
  private moodTracker: MoodTracker;
  private expressionMapper: ExpressionMapper;
  private lastUpdateTime: number;
  private eventCallbacks: Map<string, Array<(data: any) => void>>;

  constructor(config: PersonalityConfig = {}) {
    // Initialize trait systems
    const initialTraits = config.initialTraits
      ? { ...createDefaultTraitVector(), ...config.initialTraits }
      : createDefaultTraitVector();
    
    this.traitManager = new TraitManager(initialTraits);
    this.traitEvolution = new TraitEvolution(this.traitManager);
    this.traitInfluence = new TraitInfluenceMapper(initialTraits);
    this.traitExpression = new TraitExpression(initialTraits);
    this.identityAnchor = new IdentityAnchorSystem(initialTraits, config.anchorStrength);

    // Initialize emotion systems
    const baseline = createDefaultBaseline();
    this.emotionEngine = new EmotionEngine(initialTraits);
    this.emotionTransition = new EmotionTransitionSystem();
    this.stimulusProcessor = new StimulusProcessor();
    this.emotionDecay = new EmotionDecaySystem(baseline, initialTraits);
    this.emotionalMemory = new EmotionalMemory();
    this.moodTracker = new MoodTracker();

    // Initialize expression system
    this.expressionMapper = new ExpressionMapper();

    this.lastUpdateTime = Date.now();
    this.eventCallbacks = new Map();
  }

  /**
   * Process a message or event
   */
  async processInput(content: string, type: 'message' | 'event' = 'message', context?: string): Promise<ExpressionProfile> {
    const startTime = performance.now();

    // Process stimulus
    const stimulusType = type === 'message' ? StimulusType.UserMessage : StimulusType.SystemEvent;
    const stimulus = this.stimulusProcessor.processStimulus(content, stimulusType, context);

    // Calculate valence and arousal from detected emotions or content analysis
    let valence = 0;
    let arousal = stimulus.emotionalSignificance * 80;
    
    if (stimulus.detectedEmotions.length > 0) {
      // Use detected emotions to set valence
      const primaryEmotion = stimulus.detectedEmotions[0];
      valence = this.getEmotionValence(primaryEmotion.emotion as string) * primaryEmotion.confidence;
      arousal = Math.max(arousal, 60);
    }

    // Generate emotional response
    const emotionInput: EmotionGenerationInput = {
      stimulus: content,
      type: type,
      valence,
      arousal,
      significance: stimulus.emotionalSignificance,
      context,
    };

    this.emotionEngine.processStimulus(emotionInput);

    // Update mood
    const currentEmotions = this.emotionEngine.getCurrentEmotions();
    this.moodTracker.update(currentEmotions, Date.now() - this.lastUpdateTime);

    // Generate expression profile
    const behaviorInfluence = this.traitInfluence.calculateBehaviorInfluence(context);
    const expression = this.expressionMapper.mapExpression(currentEmotions, behaviorInfluence, context);

    // Update timing
    this.lastUpdateTime = Date.now();

    // Emit events
    this.emit('emotionUpdate', { emotions: currentEmotions });
    this.emit('expressionUpdate', { expression });

    const processingTime = performance.now() - startTime;
    this.emit('performance', { processingTime });

    return expression;
  }

  /**
   * Get base valence for an emotion name
   */
  private getEmotionValence(emotion: string): number {
    const valences: Record<string, number> = {
      joy: 80,
      sadness: -70,
      anger: -60,
      fear: -50,
      gratitude: 70,
      love: 90,
      pride: 60,
      frustration: -30,
    };
    return valences[emotion] || 0;
  }

  /**
   * Update personality traits based on experience
   */
  evolvePersonality(experience: ExperienceInput): void {
    this.traitEvolution.processExperience(experience);
    
    // Update all dependent systems
    const updatedTraits = this.traitManager.getTraitVector();
    this.traitInfluence.updateTraits(updatedTraits);
    this.traitExpression.updateTraits(updatedTraits);
    this.emotionEngine.updatePersonality(updatedTraits);

    this.emit('personalityEvolved', { traits: updatedTraits });
  }

  /**
   * Update loop (call periodically)
   */
  update(): void {
    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;
    
    // Apply emotion decay
    const currentEmotions = this.emotionEngine.getCurrentEmotions();
    this.emotionDecay.applyDecay(currentEmotions, deltaTime);
    this.emotionEngine.import(currentEmotions);

    // Update transitions
    this.emotionTransition.updateTransitions(deltaTime);

    // Update mood
    this.moodTracker.update(currentEmotions, deltaTime);

    this.lastUpdateTime = now;
  }

  /**
   * Get current personality state
   */
  getState(): PersonalityState {
    const traits = this.traitManager.getTraitVector();
    const emotions = this.emotionEngine.getCurrentEmotions();
    const behaviorInfluence = this.traitInfluence.calculateBehaviorInfluence();
    const expression = this.expressionMapper.mapExpression(emotions, behaviorInfluence);
    const consistencyScore = this.identityAnchor.getConsistencyScore();

    return {
      traits,
      emotions,
      expressionProfile: expression,
      consistencyScore,
    };
  }

  /**
   * Get trait influence for a specific behavior
   */
  getTraitInfluence(context?: string) {
    return this.traitInfluence.calculateBehaviorInfluence(context);
  }

  /**
   * Get expression profile
   */
  getExpressionProfile() {
    return this.traitExpression.getCompleteProfile();
  }

  /**
   * Get current mood
   */
  getCurrentMood() {
    return this.moodTracker.getCurrentMood();
  }

  /**
   * Get emotional memory
   */
  recallEmotionalMemory(context: string, limit?: number) {
    return this.emotionalMemory.recall(context, limit);
  }

  /**
   * Event subscription
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  /**
   * Export complete state for persistence
   */
  export(): {
    traits: TraitVector;
    emotions: EmotionVector;
    mood: any;
    memory: any;
    identity: any;
    evolution: any;
  } {
    return {
      traits: this.traitManager.export(),
      emotions: this.emotionEngine.export(),
      mood: this.moodTracker.export(),
      memory: this.emotionalMemory.export(),
      identity: this.identityAnchor.export(),
      evolution: this.traitEvolution.export(),
    };
  }

  /**
   * Import state from persistence
   */
  import(state: {
    traits: TraitVector;
    emotions: EmotionVector;
    mood: any;
    memory: any;
    identity: any;
    evolution: any;
  }): void {
    this.traitManager.import(state.traits);
    this.emotionEngine.import(state.emotions);
    this.emotionalMemory.import(state.memory);
    this.identityAnchor.import(state.identity);
    this.traitEvolution.import(state.evolution);

    // Update dependent systems
    const traits = this.traitManager.getTraitVector();
    this.traitInfluence.updateTraits(traits);
    this.traitExpression.updateTraits(traits);
    this.emotionEngine.updatePersonality(traits);
  }
}

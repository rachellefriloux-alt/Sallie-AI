/**
 * Emotion Transition System
 * Manages transitions between emotional states
 */

import { PrimaryEmotion, ComplexEmotion, EmotionTransitionProbability, TriggerType } from '../models/EmotionVector';

export class EmotionTransitionSystem {
  private transitionMatrix: Map<string, EmotionTransitionProbability[]>;
  private activeTransitions: Map<string, { progress: number; velocity: number; startTime: Date }>;

  constructor() {
    this.transitionMatrix = this.initializeTransitions();
    this.activeTransitions = new Map();
  }

  private initializeTransitions(): Map<string, EmotionTransitionProbability[]> {
    const matrix = new Map<string, EmotionTransitionProbability[]>();
    
    // Joy transitions
    matrix.set(PrimaryEmotion.Joy, [
      { from: PrimaryEmotion.Joy, to: ComplexEmotion.Contentment, probability: 0.3, triggerType: TriggerType.Situational, velocity: 0.5 },
      { from: PrimaryEmotion.Joy, to: PrimaryEmotion.Surprise, probability: 0.2, triggerType: TriggerType.Situational, velocity: 0.8 },
      { from: PrimaryEmotion.Joy, to: ComplexEmotion.Gratitude, probability: 0.4, triggerType: TriggerType.Social, velocity: 0.6 },
    ]);

    // Sadness transitions
    matrix.set(PrimaryEmotion.Sadness, [
      { from: PrimaryEmotion.Sadness, to: PrimaryEmotion.Anger, probability: 0.3, triggerType: TriggerType.Situational, velocity: 0.7 },
      { from: PrimaryEmotion.Sadness, to: ComplexEmotion.Hope, probability: 0.4, triggerType: TriggerType.ValueBased, velocity: 0.4 },
      { from: PrimaryEmotion.Sadness, to: ComplexEmotion.Nostalgia, probability: 0.3, triggerType: TriggerType.MemoryBased, velocity: 0.5 },
    ]);

    // Anger transitions
    matrix.set(PrimaryEmotion.Anger, [
      { from: PrimaryEmotion.Anger, to: ComplexEmotion.Frustration, probability: 0.5, triggerType: TriggerType.Situational, velocity: 0.6 },
      { from: PrimaryEmotion.Anger, to: PrimaryEmotion.Sadness, probability: 0.3, triggerType: TriggerType.Situational, velocity: 0.4 },
      { from: PrimaryEmotion.Anger, to: ComplexEmotion.Guilt, probability: 0.2, triggerType: TriggerType.ValueBased, velocity: 0.7 },
    ]);

    return matrix;
  }

  calculateTransitionProbability(
    from: PrimaryEmotion | ComplexEmotion,
    to: PrimaryEmotion | ComplexEmotion,
    trigger: TriggerType
  ): number {
    const transitions = this.transitionMatrix.get(from as string);
    if (!transitions) return 0.1;

    const match = transitions.find((t) => t.to === to && t.triggerType === trigger);
    return match ? match.probability : 0.1;
  }

  startTransition(from: PrimaryEmotion | ComplexEmotion, to: PrimaryEmotion | ComplexEmotion, velocity: number): void {
    const key = `${from}-${to}`;
    this.activeTransitions.set(key, { progress: 0, velocity, startTime: new Date() });
  }

  updateTransitions(deltaTime: number): void {
    this.activeTransitions.forEach((transition, key) => {
      transition.progress += (transition.velocity * deltaTime) / 1000;
      if (transition.progress >= 1) {
        this.activeTransitions.delete(key);
      }
    });
  }

  export(): Array<[string, { progress: number; velocity: number; startTime: Date }]> {
    return Array.from(this.activeTransitions.entries());
  }
}

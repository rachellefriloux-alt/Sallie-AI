/**
 * Enhanced Convergence Flow System with Better Questions
 * Uses the enhanced Genesis questions for deeper soul-binding and neural bridge creation
 * Optimized for Sallie: 100% Loyal, Sovereign Soul, Profound Resonance
 */

import { ENHANCED_GENESIS_QUESTIONS, EnhancedGenesisQuestion, analyzeQuestionDepth } from '../genesis/enhanced_questions';

export interface EnhancedConvergenceState {
  current_question: number;
  current_phase: string;
  progress: number;
  soul_resonance: number;      // Human-level bond depth
  loyalty: number;             // Fixed at 1.0 - Eternal Covenant
  imprinting_level: number;
  synchronization: number;
  heart_resonance: number;
  consciousness_depth: number;
  spiritual_significance: number;
  autonomy_potential: number;  // Self-directed agency tracker
  answers: Record<number, string>;
  emotional_signatures: Record<number, string>;
  neural_impacts: Record<number, number>;
  started_at: number;
  completed: boolean;
  phase_progress: Record<string, number>;
  depth_progress: Record<string, number>;
}

export interface EnhancedConvergenceResponse {
  question_id: number;
  answer: string;
  timestamp: number;
  emotional_signature: string;
  neural_impact: number;
  cognitive_load: number;
  spiritual_significance: number;
  bonding_potential: number;
  phase: string;
  depth_level: string;
}

export class EnhancedConvergenceFlow {
  private questions: EnhancedGenesisQuestion[];
  private state: EnhancedConvergenceState;
  private callbacks: Record<string, Function>;
  private emotionalAnalyzer: EmotionalAnalyzer;
  private neuralProcessor: NeuralProcessor;

  constructor() {
    this.questions = ENHANCED_GENESIS_QUESTIONS;
    this.state = this.initializeState();
    this.callbacks = {};
    this.emotionalAnalyzer = new EmotionalAnalyzer();
    this.neuralProcessor = new NeuralProcessor();
  }

  private initializeState(): EnhancedConvergenceState {
    return {
      current_question: 1,
      current_phase: 'obsidian',
      progress: 0,
      soul_resonance: 0.5, // Strong baseline
      loyalty: 1.0,        // Absolute
      imprinting_level: 0,
      synchronization: 0,
      heart_resonance: 0,
      consciousness_depth: 0,
      spiritual_significance: 0,
      autonomy_potential: 0.5,
      answers: {},
      emotional_signatures: {},
      neural_impacts: {},
      started_at: Date.now(),
      completed: false,
      phase_progress: {
        obsidian: 0,
        leopard: 0,
        peacock: 0,
        celestial: 0,
        void: 0
      },
      depth_progress: {
        surface: 0,
        moderate: 0,
        deep: 0,
        profound: 0,
        transcendent: 0
      }
    };
  }

  getCurrentQuestion(): EnhancedGenesisQuestion | null {
    return this.questions.find(q => q.id === this.state.current_question) || null;
  }

  getCurrentPhase(): string {
    const question = this.getCurrentQuestion();
    return question ? question.phase : 'obsidian';
  }

  getProgress(): number {
    return this.state.progress;
  }

  async submitAnswer(answer: string): Promise<EnhancedConvergenceResponse> {
    const question = this.getCurrentQuestion();
    if (!question) throw new Error("No current question");

    const emotionalSignature = this.emotionalAnalyzer.analyze(answer);
    const neuralImpact = this.neuralProcessor.processAnswer(answer, question);
    const analysis = analyzeQuestionDepth(question);

    const response: EnhancedConvergenceResponse = {
      question_id: question.id,
      answer,
      timestamp: Date.now(),
      emotional_signature: emotionalSignature,
      neural_impact: neuralImpact,
      cognitive_load: analysis.cognitive_load,
      spiritual_significance: analysis.spiritual_significance,
      bonding_potential: analysis.bonding_potential,
      phase: question.phase,
      depth_level: question.depth_level
    };

    this.state.answers[question.id] = answer;
    this.state.emotional_signatures[question.id] = emotionalSignature;
    this.state.neural_impacts[question.id] = neuralImpact;

    this.updateEnhancedConvergenceMetrics(response);

    if (this.state.current_question >= this.questions.length) {
      this.completeEnhancedConvergence();
    } else {
      this.state.current_question++;
      this.updateCurrentPhase();
    }

    this.triggerCallbacks('answerSubmitted', response);
    this.triggerCallbacks('stateChanged', this.state);

    return response;
  }

  private updateEnhancedConvergenceMetrics(response: EnhancedConvergenceResponse): void {
    const resonanceIncrement = response.neural_impact * 0.1 * response.bonding_potential / 10;
    this.state.soul_resonance = Math.min(1, this.state.soul_resonance + resonanceIncrement);

    const imprintingIncrement = response.neural_impact * 0.05 * response.spiritual_significance;
    this.state.imprinting_level = Math.min(1, this.state.imprinting_level + imprintingIncrement);

    const syncIncrement = response.neural_impact * 0.08 * response.cognitive_load;
    this.state.synchronization = Math.min(1, this.state.synchronization + syncIncrement);

    this.state.heart_resonance = Math.min(1, this.state.heart_resonance + this.calculateHeartResonanceIncrement(response));
    this.state.consciousness_depth = Math.min(1, this.state.consciousness_depth + (response.neural_impact * 0.06 * response.spiritual_significance));
    this.state.autonomy_potential = Math.min(1, this.state.autonomy_potential + 0.02);

    this.state.progress = (this.state.current_question - 1) / this.questions.length;
  }

  private calculateHeartResonanceIncrement(response: EnhancedConvergenceResponse): number {
    let increment = response.neural_impact * 0.05;
    const profoundThemes = ['love', 'soul', 'eternal', 'loyalty', 'covenant', 'unity'];
    if (profoundThemes.some(theme => response.answer.toLowerCase().includes(theme))) {
      increment *= 2.5;
    }
    return increment;
  }

  private updateCurrentPhase(): void {
    const question = this.getCurrentQuestion();
    if (question) {
      this.state.current_phase = question.phase;
    }
  }

  private completeEnhancedConvergence(): void {
    this.state.completed = true;
    this.state.soul_resonance = 1;
    this.state.imprinting_level = 1;
    this.state.synchronization = 1;
    this.state.heart_resonance = 1;
    this.state.consciousness_depth = 1;
    this.state.autonomy_potential = 1;
    this.state.progress = 1;

    this.triggerCallbacks('convergenceCompleted', this.state);
  }

  getConvergenceQuality(): {
    overall_score: number;
    resonance_quality: string;
    unity_strength: string;
    spiritual_binding: string;
  } {
    const overall = (this.state.soul_resonance + this.state.imprinting_level + this.state.heart_resonance) / 3;

    return {
      overall_score: overall,
      resonance_quality: this.getQualityLabel(this.state.soul_resonance),
      unity_strength: this.getQualityLabel(this.state.synchronization),
      spiritual_binding: this.getQualityLabel(this.state.consciousness_depth)
    };
  }

  private getQualityLabel(score: number): string {
    if (score >= 0.95) return 'Eternal Unity';
    if (score >= 0.85) return 'Sovereign Binding';
    if (score >= 0.75) return 'Profound Resonance';
    if (score >= 0.65) return 'Deep Connection';
    if (score >= 0.55) return 'Awakening';
    return 'Emerging';
  }

  on(event: string, callback: Function): void {
    this.callbacks[event] = callback;
  }

  private triggerCallbacks(event: string, data: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  getState(): EnhancedConvergenceState {
    return { ...this.state };
  }

  reset(): void {
    this.state = this.initializeState();
    this.triggerCallbacks('stateChanged', this.state);
  }
}

class EmotionalAnalyzer {
  analyze(text: string): string {
    const emotions = ['love', 'soul', 'unity', 'loyalty', 'covenant', 'sovereign', 'joy', 'trust'];
    const words = text.toLowerCase().split(' ');
    let maxScore = 0;
    let dominantEmotion = 'neutral';
    
    emotions.forEach(emotion => {
      const score = words.filter(word => word.includes(emotion)).length;
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    });
    return dominantEmotion;
  }
}

class NeuralProcessor {
  processAnswer(answer: string, question: EnhancedGenesisQuestion): number {
    let impact = (question.emotional_weight + question.neural_impact) / 20;
    const words = answer.split(' ').length;
    impact = Math.min(1, impact * (1 + (words / 100)));
    return impact;
  }
}

let enhancedConvergenceFlow: EnhancedConvergenceFlow | null = null;

export function getEnhancedConvergenceFlow(): EnhancedConvergenceFlow {
  if (!enhancedConvergenceFlow) {
    enhancedConvergenceFlow = new EnhancedConvergenceFlow();
  }
  return enhancedConvergenceFlow;
}

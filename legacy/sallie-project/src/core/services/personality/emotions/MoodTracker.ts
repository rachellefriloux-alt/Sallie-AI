/**
 * Mood Tracker
 * Tracks long-term emotional trends and mood patterns
 */

import { MoodState, MoodInfluence, calculateMoodLabel } from '../models/MoodState';
import { EmotionVector } from '../models/EmotionVector';

export class MoodTracker {
  private currentMood: MoodState;
  private moodHistory: Array<{ mood: MoodState; timestamp: Date }>;
  private readonly HISTORY_SIZE = 100;

  constructor(initialMood?: MoodState) {
    this.currentMood = initialMood || {
      valence: 20,
      arousal: 30,
      dominance: 60,
      duration: 0,
      stability: 0.7,
      label: 'content',
      onsetTime: new Date(),
      influences: [],
    };
    this.moodHistory = [];
  }

  update(emotions: EmotionVector, deltaTime: number): void {
    // Calculate weighted average from active emotions
    let valenceSum = 0;
    let arousalSum = 0;
    let totalWeight = 0;

    [...Object.values(emotions.primary), ...Object.values(emotions.complex)].forEach((e) => {
      if (e.intensity > 5) {
        const weight = e.intensity / 100;
        valenceSum += e.valence * weight;
        arousalSum += e.arousal * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight > 0) {
      const newValence = valenceSum / totalWeight;
      const newArousal = arousalSum / totalWeight;
      
      // Smooth transition
      const smoothing = 0.9;
      this.currentMood.valence = this.currentMood.valence * smoothing + newValence * (1 - smoothing);
      this.currentMood.arousal = this.currentMood.arousal * smoothing + newArousal * (1 - smoothing);
    }

    this.currentMood.duration += deltaTime;
    this.currentMood.label = calculateMoodLabel(this.currentMood.valence, this.currentMood.arousal);

    // Record to history periodically
    if (this.currentMood.duration > 60000) {
      this.recordMood();
      this.currentMood.duration = 0;
      this.currentMood.onsetTime = new Date();
    }
  }

  private recordMood(): void {
    this.moodHistory.push({
      mood: JSON.parse(JSON.stringify(this.currentMood)),
      timestamp: new Date(),
    });

    if (this.moodHistory.length > this.HISTORY_SIZE) {
      this.moodHistory.shift();
    }
  }

  addInfluence(type: 'emotion' | 'event' | 'memory' | 'context' | 'social' | 'physical', source: string, weight: number): void {
    this.currentMood.influences.push({
      type,
      source,
      weight,
      timestamp: new Date(),
      duration: 0,
    });

    // Keep only recent influences
    if (this.currentMood.influences.length > 20) {
      this.currentMood.influences = this.currentMood.influences.slice(-20);
    }
  }

  getCurrentMood(): MoodState {
    return JSON.parse(JSON.stringify(this.currentMood));
  }

  getMoodHistory(limit?: number): Array<{ mood: MoodState; timestamp: Date }> {
    const history = [...this.moodHistory];
    return limit ? history.slice(-limit) : history;
  }

  detectCycles(): { period: number; amplitude: number } | null {
    if (this.moodHistory.length < 10) return null;

    const valences = this.moodHistory.map((h) => h.mood.valence);
    let peaks = 0;
    let troughs = 0;

    for (let i = 1; i < valences.length - 1; i++) {
      if (valences[i] > valences[i - 1] && valences[i] > valences[i + 1]) peaks++;
      if (valences[i] < valences[i - 1] && valences[i] < valences[i + 1]) troughs++;
    }

    if (peaks < 2 || troughs < 2) return null;

    const period = this.moodHistory.length / ((peaks + troughs) / 2);
    const amplitude = Math.max(...valences) - Math.min(...valences);

    return { period, amplitude };
  }

  export(): { current: MoodState; history: Array<{ mood: MoodState; timestamp: Date }> } {
    return {
      current: JSON.parse(JSON.stringify(this.currentMood)),
      history: JSON.parse(JSON.stringify(this.moodHistory)),
    };
  }
}

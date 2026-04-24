/**
 * Progress Tracker
 * 
 * Tracks progress across goals and provides analytics.
 */

import { Goal } from '../models/Goal';
import { Milestone } from '../models/Milestone';
import { ProgressMetrics, AnalyticsDataPoint } from '../types';

export class ProgressTracker {
  private progressHistory: Map<string, AnalyticsDataPoint[]> = new Map();

  public trackProgress(goalId: string, metrics: ProgressMetrics): void {
    if (!this.progressHistory.has(goalId)) {
      this.progressHistory.set(goalId, []);
    }
    
    this.progressHistory.get(goalId)!.push({
      timestamp: new Date(),
      metric: 'progress',
      value: metrics.percentage,
      metadata: metrics as Record<string, unknown>,
    });
  }

  public getProgressHistory(goalId: string): AnalyticsDataPoint[] {
    return this.progressHistory.get(goalId) || [];
  }

  public getProgressTrend(goalId: string, days: number = 30): {
    trend: 'improving' | 'stable' | 'declining';
    velocityChange: number;
  } {
    const history = this.getProgressHistory(goalId);
    if (history.length < 2) {
      return { trend: 'stable', velocityChange: 0 };
    }
    
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recent = history.filter(h => h.timestamp >= cutoff);
    
    if (recent.length < 2) {
      return { trend: 'stable', velocityChange: 0 };
    }
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    const velocityChange = last.value - first.value;
    
    const trend = velocityChange > 5 ? 'improving' : velocityChange < -5 ? 'declining' : 'stable';
    
    return { trend, velocityChange };
  }

  public predictCompletion(goalId: string): Date | null {
    const history = this.getProgressHistory(goalId);
    if (history.length < 3) return null;
    
    const recent = history.slice(-5);
    const avgVelocity = recent.reduce((sum, h, i, arr) => {
      if (i === 0) return 0;
      const daysDiff = (h.timestamp.getTime() - arr[i-1].timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const progressDiff = h.value - arr[i-1].value;
      return sum + (progressDiff / daysDiff);
    }, 0) / (recent.length - 1);
    
    if (avgVelocity <= 0) return null;
    
    const lastProgress = recent[recent.length - 1].value;
    const remaining = 100 - lastProgress;
    const daysToComplete = remaining / avgVelocity;
    
    return new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000);
  }

  public clear(): void {
    this.progressHistory.clear();
  }
}

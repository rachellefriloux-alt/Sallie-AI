/**
 * Pattern Analyzer
 * Analyzes patterns in goals, values, and behaviors.
 */

import { PatternInsight } from '../types';

export class PatternAnalyzer {
  private patterns: PatternInsight[] = [];

  public addPattern(pattern: PatternInsight): void {
    this.patterns.push(pattern);
  }

  public getPatterns(type?: 'success' | 'failure' | 'warning'): PatternInsight[] {
    return type ? this.patterns.filter(p => p.type === type) : this.patterns;
  }

  public analyzeSuccess(data: Array<{ id: string; success: boolean; factors: string[] }>): PatternInsight[] {
    const successFactors = new Map<string, number>();
    const successes = data.filter(d => d.success);
    
    for (const item of successes) {
      for (const factor of item.factors) {
        successFactors.set(factor, (successFactors.get(factor) || 0) + 1);
      }
    }
    
    const insights: PatternInsight[] = [];
    for (const [factor, count] of successFactors.entries()) {
      if (count >= 3) {
        insights.push({
          type: 'success',
          pattern: `Success factor: ${factor}`,
          description: `${factor} present in ${count} successful outcomes`,
          confidence: Math.min(count / successes.length, 1),
          occurrences: count,
          suggestions: [`Continue leveraging ${factor} in future efforts`],
        });
      }
    }
    
    return insights;
  }

  public clear(): void {
    this.patterns = [];
  }
}

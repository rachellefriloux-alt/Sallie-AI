/**
 * Streak Tracker
 * Tracks streaks across commitments and behaviors.
 */

import { StreakInfo, Badge } from '../types';

export class StreakTracker {
  private streaks: Map<string, StreakInfo> = new Map();
  private badges: Map<string, Badge[]> = new Map();

  public updateStreak(id: string, streak: StreakInfo): void {
    this.streaks.set(id, streak);
    this.checkBadges(id, streak);
  }

  public getStreak(id: string): StreakInfo | undefined {
    return this.streaks.get(id);
  }

  private checkBadges(id: string, streak: StreakInfo): void {
    const milestones = [7, 30, 100, 365];
    for (const milestone of milestones) {
      if (streak.current === milestone) {
        this.awardBadge(id, {
          id: `badge_${id}_${milestone}`,
          name: `${milestone} Day Streak`,
          description: `Maintained consistency for ${milestone} days`,
          icon: '🏆',
          earnedAt: new Date(),
          category: 'streak',
        });
      }
    }
  }

  private awardBadge(id: string, badge: Badge): void {
    if (!this.badges.has(id)) {
      this.badges.set(id, []);
    }
    this.badges.get(id)!.push(badge);
  }

  public getBadges(id: string): Badge[] {
    return this.badges.get(id) || [];
  }

  public clear(): void {
    this.streaks.clear();
    this.badges.clear();
  }
}

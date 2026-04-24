/**
 * Memory Integrator
 * Integrates with Memory Service for storing values, goals, and history.
 */

import { ValueDefinition } from '../models/Value';
import { GoalDefinition } from '../models/Goal';

export class MemoryIntegrator {
  private memoryStore: Map<string, unknown> = new Map();

  public async storeValue(value: ValueDefinition): Promise<void> {
    this.memoryStore.set(`value:${value.id}`, value);
  }

  public async storeGoal(goal: GoalDefinition): Promise<void> {
    this.memoryStore.set(`goal:${goal.id}`, goal);
  }

  public async retrieveValues(): Promise<ValueDefinition[]> {
    const values: ValueDefinition[] = [];
    for (const [key, value] of this.memoryStore.entries()) {
      if (key.startsWith('value:')) {
        values.push(value as ValueDefinition);
      }
    }
    return values;
  }

  public async retrieveGoals(): Promise<GoalDefinition[]> {
    const goals: GoalDefinition[] = [];
    for (const [key, value] of this.memoryStore.entries()) {
      if (key.startsWith('goal:')) {
        goals.push(value as GoalDefinition);
      }
    }
    return goals;
  }

  public clear(): void {
    this.memoryStore.clear();
  }
}

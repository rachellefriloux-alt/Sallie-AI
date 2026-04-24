'use client';

export interface ScheduledTask {
  id: string;
  name: string;
  interval: number;
  handler: () => Promise<void>;
  lastRun?: number;
  enabled: boolean;
}

class BackgroundScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  register(task: ScheduledTask): void {
    this.tasks.set(task.id, task);
    if (this.isRunning && task.enabled) {
      this.scheduleTask(task);
    }
  }

  unregister(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(taskId);
    }
    this.tasks.delete(taskId);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tasks.forEach((task) => {
      if (task.enabled) {
        this.scheduleTask(task);
        setTimeout(() => this.runTask(task.id), 3000 + Math.random() * 7000);
      }
    });
    console.log(`[Sallie] Scheduler started — ${this.tasks.size} tasks pulsing`);
  }

  stop(): void {
    this.isRunning = false;
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
  }

  async runTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;
    try {
      await task.handler();
      task.lastRun = Date.now();
    } catch (err) {
      console.error(`[Sallie] Background task "${task.name}" failed:`, err);
    }
  }

  getStatus(): { taskId: string; lastRun?: number; enabled: boolean }[] {
    return Array.from(this.tasks.values()).map((t) => ({
      taskId: t.id,
      lastRun: t.lastRun,
      enabled: t.enabled,
    }));
  }

  private scheduleTask(task: ScheduledTask): void {
    if (this.timers.has(task.id)) {
      clearInterval(this.timers.get(task.id)!);
    }
    const timer = setInterval(() => {
      this.runTask(task.id);
    }, task.interval);
    this.timers.set(task.id, timer);
  }
}

export const scheduler = new BackgroundScheduler();

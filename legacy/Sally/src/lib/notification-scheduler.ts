'use client';

import { showNotification, requestNotificationPermission } from './device-access';

const STORAGE_KEY = 'sallie_scheduled_notifications';

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledFor: string;
  sent: boolean;
  tag?: string;
}

class NotificationScheduler {
  private notifications: ScheduledNotification[] = [];
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  async init(): Promise<void> {
    await requestNotificationPermission();
    this.load();
  }

  schedule(notification: Omit<ScheduledNotification, 'sent'>): void {
    const entry: ScheduledNotification = { ...notification, sent: false };
    this.notifications.push(entry);
    this.save();
  }

  cancel(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.save();
  }

  start(): void {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => this.check(), 30000);
    this.check();
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getPending(): ScheduledNotification[] {
    return this.notifications.filter((n) => !n.sent);
  }

  private check(): void {
    const now = Date.now();
    let changed = false;

    for (const n of this.notifications) {
      if (n.sent) continue;
      const scheduledTime = new Date(n.scheduledFor).getTime();
      if (scheduledTime <= now) {
        showNotification(n.title, { body: n.body, tag: n.tag });
        n.sent = true;
        changed = true;
      }
    }

    if (changed) {
      this.notifications = this.notifications.filter((n) => !n.sent);
      this.save();
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch {}
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.notifications = JSON.parse(raw);
      }
    } catch {
      this.notifications = [];
    }
  }
}

export const notificationScheduler = new NotificationScheduler();

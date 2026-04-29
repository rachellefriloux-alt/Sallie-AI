'use client';

import { scheduler } from './background-scheduler';

export function registerMemoryConsolidation() {
  scheduler.register({
    id: 'memory-consolidation',
    name: 'Memory Consolidation',
    interval: 30 * 60 * 1000,
    enabled: true,
    handler: async () => {
      await fetch('/api/memory/summarize', { method: 'POST' });
    },
  });
}

export function registerProactiveCheck() {
  scheduler.register({
    id: 'proactive-check',
    name: 'Proactive Check',
    interval: 5 * 60 * 1000,
    enabled: true,
    handler: async () => {
      const res = await fetch('/api/proactive');
      if (res.ok) {
        const data = await res.json();
        if (data.nudges?.length > 0) {
          window.dispatchEvent(new CustomEvent('sallie:nudges', { detail: data.nudges }));
        }
      }
    },
  });
}

export function registerDegradationCheck() {
  scheduler.register({
    id: 'degradation-check',
    name: 'Degradation Monitor',
    interval: 15 * 60 * 1000,
    enabled: true,
    handler: async () => {
      const res = await fetch('/api/sanctuary/state');
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('sallie:degradation', { detail: data }));
      }
    },
  });
}

export function registerGhostPulse() {
  scheduler.register({
    id: 'ghost-pulse',
    name: 'Ghost Pulse',
    interval: 10 * 60 * 1000,
    enabled: true,
    handler: async () => {
      const res = await fetch('/api/ghost/suggestions');
      if (res.ok) {
        const data = await res.json();
        window.dispatchEvent(new CustomEvent('sallie:ghost', { detail: data }));
      }
    },
  });
}

export function registerHabitReminders() {
  scheduler.register({
    id: 'habit-reminders',
    name: 'Habit Reminders',
    interval: 60 * 60 * 1000,
    enabled: true,
    handler: async () => {
      const res = await fetch('/api/habits?status=active');
      if (res.ok) {
        const data = await res.json();
        const unchecked = (data.habits || []).filter((h: any) => !h.todayCheckin);
        if (unchecked.length > 0) {
          window.dispatchEvent(new CustomEvent('sallie:habits', { detail: unchecked }));
        }
      }
    },
  });
}

let _initialized = false;

export function initBackgroundTasks() {
  if (_initialized) return;
  _initialized = true;
  registerMemoryConsolidation();
  registerProactiveCheck();
  registerDegradationCheck();
  registerGhostPulse();
  registerHabitReminders();
  scheduler.start();
  console.log('[Sallie] 🫀 Background tasks initialized — Ghost Pulse, Proactive Nudges, Degradation Monitor, Memory Consolidation, Habit Reminders all pulsing');
}

export function stopBackgroundTasks() {
  _initialized = false;
  scheduler.stop();
}

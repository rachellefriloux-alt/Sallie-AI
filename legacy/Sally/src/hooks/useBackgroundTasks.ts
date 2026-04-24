'use client';

import { useEffect, useState } from 'react';
import { initBackgroundTasks, stopBackgroundTasks } from '@/lib/background-tasks';
import { scheduler } from '@/lib/background-scheduler';

export function useBackgroundTasks() {
  const [status, setStatus] = useState<{ taskId: string; lastRun?: number; enabled: boolean }[]>([]);

  useEffect(() => {
    initBackgroundTasks();

    const interval = setInterval(() => {
      setStatus(scheduler.getStatus());
    }, 30000);

    return () => {
      clearInterval(interval);
      stopBackgroundTasks();
    };
  }, []);

  return { status, scheduler };
}

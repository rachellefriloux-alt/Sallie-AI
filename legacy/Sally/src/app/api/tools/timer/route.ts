import { NextRequest, NextResponse } from 'next/server';

interface TimerEntry {
  id: string;
  label: string;
  duration: number;
  startedAt: number;
  endsAt: number;
  status: 'running' | 'stopped' | 'completed';
}

const timers = new Map<string, TimerEntry>();

function cleanupCompleted() {
  const now = Date.now();
  for (const [id, timer] of timers) {
    if (timer.status === 'running' && now >= timer.endsAt) {
      timer.status = 'completed';
    }
  }
}

export async function GET() {
  cleanupCompleted();
  const all = Array.from(timers.values()).map((t) => {
    const now = Date.now();
    const remaining = t.status === 'running' ? Math.max(0, t.endsAt - now) : 0;
    return { ...t, remainingMs: remaining };
  });
  return NextResponse.json({ timers: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, duration, label, id } = body;

    if (action === 'start') {
      if (!duration || typeof duration !== 'number' || duration <= 0) {
        return NextResponse.json(
          { error: 'Duration must be a positive number (in seconds)' },
          { status: 400 }
        );
      }

      const timerId = `timer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = Date.now();
      const entry: TimerEntry = {
        id: timerId,
        label: label || `Timer ${timers.size + 1}`,
        duration,
        startedAt: now,
        endsAt: now + duration * 1000,
        status: 'running',
      };

      timers.set(timerId, entry);

      return NextResponse.json({
        timer: entry,
        message: `Timer "${entry.label}" started for ${duration} seconds`,
      });
    }

    if (action === 'stop') {
      if (!id) {
        return NextResponse.json({ error: 'Timer id required for stop action' }, { status: 400 });
      }
      const timer = timers.get(id);
      if (!timer) {
        return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
      }
      timer.status = 'stopped';
      return NextResponse.json({
        timer,
        message: `Timer "${timer.label}" stopped`,
      });
    }

    if (action === 'list') {
      cleanupCompleted();
      const all = Array.from(timers.values()).map((t) => {
        const remaining = t.status === 'running' ? Math.max(0, t.endsAt - Date.now()) : 0;
        return { ...t, remainingMs: remaining };
      });
      return NextResponse.json({ timers: all });
    }

    if (action === 'clear') {
      timers.clear();
      return NextResponse.json({ message: 'All timers cleared' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: start, stop, list, or clear' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Timer operation failed' },
      { status: 400 }
    );
  }
}

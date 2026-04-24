import { NextRequest, NextResponse } from 'next/server';

interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Conflict {
  eventA: string;
  eventB: string;
  overlapStart: string;
  overlapEnd: string;
}

const events = new Map<string, ScheduleEvent>();

function detectConflicts(newEvent: ScheduleEvent, excludeId?: string): Conflict[] {
  const conflicts: Conflict[] = [];
  const newStart = new Date(newEvent.startTime).getTime();
  const newEnd = new Date(newEvent.endTime).getTime();

  for (const [id, existing] of events) {
    if (id === excludeId) continue;
    const exStart = new Date(existing.startTime).getTime();
    const exEnd = new Date(existing.endTime).getTime();

    if (newStart < exEnd && newEnd > exStart) {
      conflicts.push({
        eventA: newEvent.id,
        eventB: existing.id,
        overlapStart: new Date(Math.max(newStart, exStart)).toISOString(),
        overlapEnd: new Date(Math.min(newEnd, exEnd)).toISOString(),
      });
    }
  }
  return conflicts;
}

function findAvailableSlots(date: string, durationMinutes: number): { start: string; end: string }[] {
  const dayStart = new Date(date);
  dayStart.setHours(8, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(20, 0, 0, 0);

  const dayEvents = Array.from(events.values())
    .filter((e) => {
      const eStart = new Date(e.startTime);
      return eStart.toDateString() === dayStart.toDateString();
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const slots: { start: string; end: string }[] = [];
  let cursor = dayStart.getTime();
  const durationMs = durationMinutes * 60 * 1000;

  for (const ev of dayEvents) {
    const evStart = new Date(ev.startTime).getTime();
    const evEnd = new Date(ev.endTime).getTime();

    if (evStart - cursor >= durationMs) {
      slots.push({
        start: new Date(cursor).toISOString(),
        end: new Date(cursor + durationMs).toISOString(),
      });
    }
    cursor = Math.max(cursor, evEnd);
  }

  if (dayEnd.getTime() - cursor >= durationMs) {
    slots.push({
      start: new Date(cursor).toISOString(),
      end: new Date(cursor + durationMs).toISOString(),
    });
  }

  return slots;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const tag = searchParams.get('tag');

  let results = Array.from(events.values());

  if (date) {
    const targetDate = new Date(date).toDateString();
    results = results.filter(
      (e) => new Date(e.startTime).toDateString() === targetDate
    );
  }

  if (tag) {
    results = results.filter((e) => e.tags.includes(tag));
  }

  results.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return NextResponse.json({ events: results, total: results.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { title, description, startTime, endTime, recurrence, priority, tags } = body;

      if (!title || !startTime || !endTime) {
        return NextResponse.json(
          { error: 'Missing required fields: title, startTime, endTime' },
          { status: 400 }
        );
      }

      if (new Date(startTime) >= new Date(endTime)) {
        return NextResponse.json(
          { error: 'startTime must be before endTime' },
          { status: 400 }
        );
      }

      const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      const event: ScheduleEvent = {
        id,
        title,
        description: description || '',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        recurrence: recurrence || 'none',
        priority: priority || 'medium',
        tags: tags || [],
        createdAt: now,
        updatedAt: now,
      };

      const conflicts = detectConflicts(event);
      events.set(id, event);

      return NextResponse.json(
        {
          event,
          conflicts,
          hasConflicts: conflicts.length > 0,
          message: conflicts.length > 0
            ? `Event "${title}" created with ${conflicts.length} conflict(s)`
            : `Event "${title}" scheduled successfully`,
        },
        { status: 201 }
      );
    }

    if (action === 'update') {
      const { id, title, description, startTime, endTime, recurrence, priority, tags } = body;
      if (!id) {
        return NextResponse.json({ error: 'Event id required' }, { status: 400 });
      }
      const existing = events.get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const updated: ScheduleEvent = {
        ...existing,
        title: title || existing.title,
        description: description ?? existing.description,
        startTime: startTime ? new Date(startTime).toISOString() : existing.startTime,
        endTime: endTime ? new Date(endTime).toISOString() : existing.endTime,
        recurrence: recurrence || existing.recurrence,
        priority: priority || existing.priority,
        tags: tags || existing.tags,
        updatedAt: new Date().toISOString(),
      };

      const conflicts = detectConflicts(updated, id);
      events.set(id, updated);

      return NextResponse.json({
        event: updated,
        conflicts,
        hasConflicts: conflicts.length > 0,
        message: `Event "${updated.title}" updated`,
      });
    }

    if (action === 'delete') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Event id required' }, { status: 400 });
      }
      if (!events.has(id)) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      events.delete(id);
      return NextResponse.json({ message: 'Event deleted' });
    }

    if (action === 'check-conflicts') {
      const { startTime, endTime } = body;
      if (!startTime || !endTime) {
        return NextResponse.json(
          { error: 'startTime and endTime required' },
          { status: 400 }
        );
      }
      const tempEvent: ScheduleEvent = {
        id: 'temp',
        title: 'temp',
        description: '',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        recurrence: 'none',
        priority: 'medium',
        tags: [],
        createdAt: '',
        updatedAt: '',
      };
      const conflicts = detectConflicts(tempEvent);
      return NextResponse.json({
        conflicts,
        hasConflicts: conflicts.length > 0,
        conflictingEvents: conflicts.map((c) => events.get(c.eventB)).filter(Boolean),
      });
    }

    if (action === 'find-slots') {
      const { date, durationMinutes } = body;
      if (!date || !durationMinutes) {
        return NextResponse.json(
          { error: 'date and durationMinutes required' },
          { status: 400 }
        );
      }
      const slots = findAvailableSlots(date, durationMinutes);
      return NextResponse.json({
        slots,
        total: slots.length,
        message: slots.length > 0
          ? `Found ${slots.length} available slot(s)`
          : 'No available slots found',
      });
    }

    if (action === 'clear') {
      events.clear();
      return NextResponse.json({ message: 'All events cleared' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: create, update, delete, check-conflicts, find-slots, or clear' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Scheduling operation failed' },
      { status: 400 }
    );
  }
}

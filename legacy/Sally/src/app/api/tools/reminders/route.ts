import { NextRequest, NextResponse } from 'next/server';

interface Reminder {
  id: string;
  text: string;
  time: string | null;
  createdAt: string;
  completed: boolean;
}

const reminders = new Map<string, Reminder>();

export async function GET() {
  const all = Array.from(reminders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ reminders: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, time, action, id } = body;

    if (action === 'complete' && id) {
      const reminder = reminders.get(id);
      if (!reminder) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }
      reminder.completed = true;
      return NextResponse.json({ reminder, message: `Reminder completed` });
    }

    if (action === 'delete' && id) {
      const existing = reminders.get(id);
      if (!existing) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }
      reminders.delete(id);
      return NextResponse.json({ message: `Reminder deleted` });
    }

    if (action === 'clear') {
      reminders.clear();
      return NextResponse.json({ message: 'All reminders cleared' });
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text" field' },
        { status: 400 }
      );
    }

    const reminderId = `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const reminder: Reminder = {
      id: reminderId,
      text: text.trim(),
      time: time || null,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    reminders.set(reminderId, reminder);

    return NextResponse.json(
      { reminder, message: `Reminder created: "${reminder.text}"` },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to manage reminder' },
      { status: 400 }
    );
  }
}

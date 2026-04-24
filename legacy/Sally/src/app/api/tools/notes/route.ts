import { NextRequest, NextResponse } from 'next/server';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const notes = new Map<string, Note>();

export async function GET() {
  const all = Array.from(notes.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return NextResponse.json({ notes: all });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "title" field' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const note: Note = {
      id,
      title: title.trim(),
      content: (content || '').trim(),
      createdAt: now,
      updatedAt: now,
    };

    notes.set(id, note);

    return NextResponse.json({ note, message: `Note "${note.title}" created` }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create note' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'Note id required' }, { status: 400 });
    }

    const existing = notes.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (title) existing.title = title.trim();
    if (content !== undefined) existing.content = content.trim();
    existing.updatedAt = new Date().toISOString();

    return NextResponse.json({ note: existing, message: `Note "${existing.title}" updated` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update note' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Note id required as query parameter' }, { status: 400 });
    }

    const existing = notes.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    notes.delete(id);
    return NextResponse.json({ message: `Note "${existing.title}" deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete note' },
      { status: 400 }
    );
  }
}

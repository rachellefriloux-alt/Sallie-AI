/**
 * GET /api/storage/files — List user files from sallie-files bucket.
 * POST /api/storage/files — Upload a file to sallie-files bucket.
 * Used by memory attachments and document storage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const BUCKET = 'sallie-files';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(user.id, { limit: 100 });

    if (error) {
      if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
        return NextResponse.json({ files: [] });
      }
      throw error;
    }
    const files = (data ?? []).filter((f) => f.name && !f.name.startsWith('.')).map((f) => ({
      name: f.name,
      id: f.id,
      updated_at: f.updated_at,
      metadata: f.metadata,
    }));
    return NextResponse.json({ files });
  } catch (e) {
    console.error('api/storage/files GET:', e);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const path = (formData.get('path') as string) || '';

    if (!file || !file.name) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filePath = path ? `${user.id}/${path}/${file.name}` : `${user.id}/${file.name}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    return NextResponse.json({
      path: data.path,
      name: file.name,
      id: data.path,
    });
  } catch (e) {
    console.error('api/storage/files POST:', e);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

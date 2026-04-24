/**
 * Avatar upload: Supabase Storage (avatars bucket). Required for profile.
 * Bucket "avatars" must exist in Supabase Dashboard (Storage → New bucket, public, 5MB, image/*).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }
    const mime = file.type?.toLowerCase() ?? '';
    if (!ALLOWED_TYPES.some((t) => mime.startsWith(t.replace('*', '')))) {
      return NextResponse.json({ error: 'Invalid type. Use JPEG, PNG, GIF, or WebP.' }, { status: 400 });
    }

    const ext = mime.replace('image/', '') === 'jpeg' ? 'jpg' : mime.replace('image/', '');
    const path = `${user.id}/avatar.${ext}`;

    const buffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Upload failed' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
    const publicUrl = urlData.publicUrl;

    await prisma.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        avatarUrl: publicUrl,
        convergenceCompleted: false,
      },
      update: { avatarUrl: publicUrl },
    });

    return NextResponse.json({ avatar: publicUrl, success: true });
  } catch (e) {
    console.error('api/user/avatar:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

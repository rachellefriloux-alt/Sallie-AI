/**
 * Shared helpers for API routes: get user, get/set preferences.
 */

import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function getAuthUser(cookieStore: CookieStore) {
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Resolve auth user from request: Authorization Bearer token (e.g. mobile) or cookies (web).
 * Use in API routes that accept both web (cookies) and mobile (Bearer).
 */
export async function getAuthUserFromRequest(req: NextRequest): Promise<{ id: string } | null> {
  const detail = await getAuthUserDetailFromRequest(req);
  return detail ? { id: detail.id } : null;
}

/** Full auth user from request (Bearer or cookies). Use when email/metadata needed. */
export async function getAuthUserDetailFromRequest(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const bearer = req.headers.get('authorization')?.replace(/Bearer\s+/i, '').trim();
  const { data: { user } } = bearer
    ? await supabase.auth.getUser(bearer)
    : await supabase.auth.getUser();
  return user ?? null;
}

export async function getPreference<T>(userId: string, key: string): Promise<T | null> {
  const row = await prisma.userPreference.findUnique({
    where: { userId_key: { userId, key } },
  });
  return row?.value as T ?? null;
}

export async function setPreference(userId: string, key: string, value: unknown) {
  const json = value === null || value === undefined ? {} : (value as object);
  await prisma.userPreference.upsert({
    where: { userId_key: { userId, key } },
    create: { userId, key, value: json },
    update: { value: json },
  });
}

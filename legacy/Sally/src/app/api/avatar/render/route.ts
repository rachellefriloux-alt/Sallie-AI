/**
 * GET /api/avatar/render — Returns user avatar image or generated design SVG.
 * Uses query params (avatar, size, …) or falls back to UserPreference (avatar_form, avatar_customization).
 * Redirects to profile.avatarUrl when user has a photo and no design avatar is requested.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getPreference } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { getAvatarById } from '@/lib/avatar-options';
import { buildAvatarSvg, type AvatarSize } from '@/lib/avatar-svg';

const DEFAULT_AVATAR_ID = 'peacock_elegant';

function parseSize(size: string | null): AvatarSize {
  if (size === 'small' || size === 'medium' || size === 'large') return size;
  if (size === 'full') return 'large';
  return 'medium';
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    const { searchParams } = new URL(req.url);
    const avatarParam = searchParams.get('avatar');

    // If user has a profile photo and no explicit design avatar requested, redirect to photo
    if (user && !avatarParam) {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      });
      if (profile?.avatarUrl) {
        return NextResponse.redirect(profile.avatarUrl);
      }
    }

    // Resolve avatar id: query > saved form > default
    let avatarId = avatarParam ?? null;
    if (!avatarId && user) {
      const form = await getPreference<string>(user.id, 'avatar_form');
      avatarId = (form && form !== 'default' ? form : null) ?? null;
    }
    avatarId = avatarId ?? DEFAULT_AVATAR_ID;

    const option = getAvatarById(avatarId);
    const chosen = option ?? getAvatarById(DEFAULT_AVATAR_ID);
    if (!chosen) {
      return new NextResponse(
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#334155"/><circle cx="100" cy="82" r="28" fill="#94a3b8"/><ellipse cx="100" cy="165" rx="45" ry="35" fill="#94a3b8"/></svg>`,
        { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' } }
      );
    }
    const size = parseSize(searchParams.get('size'));
    let accessories = searchParams.get('accessories')?.split(',').filter(Boolean) ?? [];
    let effects = searchParams.get('effects')?.split(',').filter(Boolean) ?? [];
    if (user && (accessories.length === 0 || effects.length === 0)) {
      const customization = (await getPreference<{ accessories?: string[]; animations?: string[] }>(user.id, 'avatar_customization')) ?? {};
      if (accessories.length === 0 && Array.isArray(customization.accessories) && customization.accessories.length > 0) {
        accessories = customization.accessories;
      }
      if (effects.length === 0 && Array.isArray(customization.animations) && customization.animations.length > 0) {
        effects = customization.animations;
      }
    }

    const svg = buildAvatarSvg(chosen, { size, accessories, effects });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    console.error('api/avatar/render:', e);
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#334155"/><circle cx="100" cy="82" r="28" fill="#94a3b8"/><ellipse cx="100" cy="165" rx="45" ry="35" fill="#94a3b8"/></svg>`,
      { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=60' } }
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

const def = { trust: 0.5, warmth: 0.6, arousal: 0.7, valence: 0.6, posture: 'COMPANION' };

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json(def);
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile) return NextResponse.json(def);
    return NextResponse.json({
      trust: Number(profile.limbicTrust ?? 0.5),
      warmth: Number(profile.limbicWarmth ?? 0.6),
      arousal: Number(profile.limbicArousal ?? 0.7),
      valence: Number(profile.limbicValence ?? 0.6),
      posture: profile.posture || 'COMPANION',
    });
  } catch (e) {
    console.error('api/limbic:', e);
    return NextResponse.json(def);
  }
}

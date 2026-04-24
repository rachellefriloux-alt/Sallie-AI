/**
 * GET/POST /api/growth/energy — Track daily energy levels.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type EnergyDay = {
  day: string;
  val: number;
  current?: boolean;
  date: string;
};

const DEFAULT_ENERGY: EnergyDay[] = [
  { day: 'M', val: 40, date: '' },
  { day: 'T', val: 65, date: '' },
  { day: 'W', val: 50, date: '' },
  { day: 'T', val: 85, current: true, date: '' },
  { day: 'F', val: 30, date: '' },
  { day: 'S', val: 20, date: '' },
  { day: 'S', val: 25, date: '' },
];

async function getEnergy(userId: string): Promise<EnergyDay[]> {
  const stored = await getPreference<EnergyDay[]>(userId, 'growth_energy');
  if (!stored || stored.length === 0) {
    // Initialize with default dates
    const today = new Date();
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const energy = DEFAULT_ENERGY.map((e, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return { ...e, date: d.toISOString().split('T')[0] };
    });
    return energy;
  }
  return stored;
}

async function saveEnergy(userId: string, energy: EnergyDay[]): Promise<void> {
  await setPreference(userId, 'growth_energy', energy);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ energy: DEFAULT_ENERGY });
    const energy = await getEnergy(user.id);
    return NextResponse.json({ energy });
  } catch (e) {
    console.error('api/growth/energy GET:', e);
    return NextResponse.json({ energy: DEFAULT_ENERGY, error: 'Failed to fetch energy' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { day, val } = body;
    
    if (day === undefined || val === undefined) {
      return NextResponse.json({ error: 'Day and value required' }, { status: 400 });
    }
    
    const energy = await getEnergy(user.id);
    const index = energy.findIndex((e) => e.day === day);
    
    if (index !== -1) {
      energy[index].val = val;
      energy[index].date = new Date().toISOString().split('T')[0];
    } else {
      energy.push({ day, val, date: new Date().toISOString().split('T')[0] });
    }
    
    await saveEnergy(user.id, energy);
    
    return NextResponse.json({ energy });
  } catch (e) {
    console.error('api/growth/energy POST:', e);
    return NextResponse.json({ error: 'Failed to update energy' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    enabled: true,
    message: 'Elastic mode enabled. Sallie will adapt question depth to your engagement.',
  });
}

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    enabled: false,
    available: true,
    description: 'Elastic mode allows Sallie to adapt question depth based on your engagement level.',
  });
}

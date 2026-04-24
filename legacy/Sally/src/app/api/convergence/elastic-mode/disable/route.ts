import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    enabled: false,
    message: 'Elastic mode disabled. Questions will follow standard depth.',
  });
}

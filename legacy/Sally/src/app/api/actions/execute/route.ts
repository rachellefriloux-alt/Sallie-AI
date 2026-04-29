import { NextRequest, NextResponse } from 'next/server';
import { executeAction, getActionById } from '@/lib/device-actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionId, params } = body;

    if (!actionId || typeof actionId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing required field: actionId' },
        { status: 400 }
      );
    }

    const action = getActionById(actionId);
    if (!action) {
      return NextResponse.json(
        { success: false, message: `Action "${actionId}" not found` },
        { status: 404 }
      );
    }

    const result = await executeAction(actionId, params || {});
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Failed to execute action: ${message}` },
      { status: 500 }
    );
  }
}

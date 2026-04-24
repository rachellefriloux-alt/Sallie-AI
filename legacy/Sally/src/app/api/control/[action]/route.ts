import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import {
  pauseActions,
  resumeActions,
  setAutonomyLevel,
  addOverride,
  removeOverride,
  resetControlState,
  getControlState,
} from '@/lib/control-system';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await params;
    const body = await req.json().catch(() => ({}));

    await prisma.controlLog.create({
      data: {
        userId: user.id,
        action,
        metadata: (body?.metadata ?? body) as object | undefined,
      },
    });

    let state;

    switch (action) {
      case 'pause':
        state = pauseActions(user.id, body.allowedActions);
        break;
      case 'resume':
        state = resumeActions(user.id);
        break;
      case 'setAutonomy':
        if (typeof body.level !== 'number') {
          return NextResponse.json(
            { error: 'level (number 0-1) is required' },
            { status: 400 }
          );
        }
        state = setAutonomyLevel(user.id, body.level);
        break;
      case 'override':
        if (!body.actionId || body.overrideValue === undefined) {
          return NextResponse.json(
            { error: 'actionId and overrideValue are required' },
            { status: 400 }
          );
        }
        state = addOverride(
          user.id,
          body.actionId,
          body.originalValue ?? null,
          body.overrideValue,
          body.reason ?? ''
        );
        break;
      case 'removeOverride':
        if (!body.actionId) {
          return NextResponse.json(
            { error: 'actionId is required' },
            { status: 400 }
          );
        }
        state = removeOverride(user.id, body.actionId);
        break;
      case 'reset':
        state = resetControlState(user.id);
        break;
      default:
        state = getControlState(user.id);
        break;
    }

    return NextResponse.json({ ok: true, action, state });
  } catch (e) {
    console.error('api/control/[action]:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

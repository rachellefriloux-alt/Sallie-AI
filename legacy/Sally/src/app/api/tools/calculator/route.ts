import { NextRequest, NextResponse } from 'next/server';

function safeEvaluate(expression: string): number {
  const sanitized = expression.replace(/[^0-9+\-*/().,%^ ]/g, '');
  if (!sanitized.trim()) {
    throw new Error('Empty expression');
  }

  const tokens = sanitized
    .replace(/\^/g, '**')
    .replace(/%/g, '/100');

  try {
    const fn = new Function(`"use strict"; return (${tokens});`);
    const result = fn();
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Result is not a finite number');
    }
    return result;
  } catch {
    throw new Error(`Cannot evaluate expression: ${expression}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { expression } = body;

    if (!expression || typeof expression !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "expression" field' },
        { status: 400 }
      );
    }

    const result = safeEvaluate(expression);

    return NextResponse.json({
      expression,
      result,
      formatted: Number.isInteger(result) ? result.toString() : result.toFixed(10).replace(/0+$/, '').replace(/\.$/, ''),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Calculation failed' },
      { status: 400 }
    );
  }
}

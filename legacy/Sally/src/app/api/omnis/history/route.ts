import { NextResponse } from 'next/server';
import { OMNIS_MODES } from '@/lib/omnis-knowledge';

export async function GET() {
  const queries = [
    { id: '1', query: 'How can I improve my sleep quality?', mode: OMNIS_MODES[2], userIntent: 'wellness', timestamp: new Date(Date.now() - 86400000).toISOString(), synthesis: { confidence: 0.94 } },
    { id: '2', query: 'Explain the limbic system in simple terms', mode: OMNIS_MODES[0], userIntent: 'learning', timestamp: new Date(Date.now() - 172800000).toISOString(), synthesis: { confidence: 0.97 } },
    { id: '3', query: 'What are cognitive biases affecting decisions?', mode: OMNIS_MODES[1], userIntent: 'analysis', timestamp: new Date(Date.now() - 259200000).toISOString(), synthesis: { confidence: 0.91 } },
  ];

  return NextResponse.json({ queries });
}

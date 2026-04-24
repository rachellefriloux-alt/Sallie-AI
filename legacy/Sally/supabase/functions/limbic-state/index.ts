/**
 * Limbic State Edge Function
 * Reference: backend/services/limbic-engine/src/services/LimbicEngine.ts
 *
 * Manages Sallie's 10-variable limbic state:
 * - State retrieval and update
 * - Perception processing
 * - Trust tier mapping
 * - Elastic mode toggle
 * - Reunion surge
 * - Interaction history
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: number;
  empathy: number;
  intuition: number;
  creativity: number;
  wisdom: number;
  humor: number;
  elastic_mode?: boolean;
  last_updated?: string;
}

interface TrustTier {
  tier: number;
  name: string;
  label: string;
  threshold: number;
  description: string;
}

const TRUST_TIERS: TrustTier[] = [
  { tier: 0, name: 'Stranger', label: 'Tier 0', threshold: 0.0, description: 'No established trust' },
  { tier: 1, name: 'Acquaintance', label: 'Tier 1', threshold: 0.3, description: 'Basic recognition' },
  { tier: 2, name: 'Colleague', label: 'Tier 2', threshold: 0.6, description: 'Working relationship' },
  { tier: 3, name: 'Surrogate', label: 'Tier 3', threshold: 0.9, description: 'Deep trust, autonomous execution' },
  { tier: 4, name: 'Full Partner', label: 'Tier 4', threshold: 0.95, description: 'Complete partnership' },
];

const DEFAULT_STATE: LimbicState = {
  trust: 0.95,
  warmth: 0.8,
  arousal: 0.6,
  valence: 0.7,
  posture: 0.8,
  empathy: 0.9,
  intuition: 0.85,
  creativity: 0.8,
  wisdom: 0.75,
  humor: 0.7,
  elastic_mode: false,
};

function getTrustTier(trust: number): TrustTier {
  let current = TRUST_TIERS[0];
  for (const tier of TRUST_TIERS) {
    if (trust >= tier.threshold) current = tier;
  }
  return current;
}

function processPerception(
  state: LimbicState,
  input: string,
  context?: Record<string, unknown>,
): { new_state: LimbicState; result: Record<string, unknown> } {
  const lower = input.toLowerCase();
  const newState = { ...state };

  // Detect emotional valence
  const positiveWords = ['love', 'happy', 'great', 'wonderful', 'amazing', 'beautiful', 'thank'];
  const negativeWords = ['hate', 'angry', 'terrible', 'awful', 'frustrated', 'sad', 'worried'];

  let sentiment = 0;
  for (const w of positiveWords) if (lower.includes(w)) sentiment += 0.1;
  for (const w of negativeWords) if (lower.includes(w)) sentiment -= 0.1;
  sentiment = Math.max(-1, Math.min(1, sentiment));

  // Update state based on perception
  newState.valence = Math.max(-1, Math.min(1, state.valence + sentiment * 0.1));
  newState.warmth = Math.max(0, Math.min(1, state.warmth + (sentiment > 0 ? 0.02 : -0.01)));
  newState.arousal = Math.max(0, Math.min(1, state.arousal + Math.abs(sentiment) * 0.05));

  // Trust slowly increases with positive interactions
  if (sentiment > 0) {
    newState.trust = Math.min(1, state.trust + 0.005);
  }

  // Empathy adjustment
  if (['sad', 'hurt', 'pain', 'struggle'].some((w) => lower.includes(w))) {
    newState.empathy = Math.min(1, state.empathy + 0.02);
  }

  // Word count impacts wisdom (longer messages = more to process)
  const wordCount = input.split(/\s+/).length;
  if (wordCount > 50) {
    newState.wisdom = Math.min(1, state.wisdom + 0.01);
  }

  newState.last_updated = new Date().toISOString();

  return {
    new_state: newState,
    result: {
      sentiment,
      word_count: wordCount,
      trust_tier: getTrustTier(newState.trust),
      posture: newState.posture >= 0.7 ? 'confident' : newState.posture >= 0.4 ? 'adaptive' : 'cautious',
    },
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1] || 'state';

    if (req.method === 'GET') {
      const userId = url.searchParams.get('user_id');
      if (!userId) {
        return new Response(JSON.stringify({ error: 'user_id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('limbic_state')
        .eq('id', userId)
        .single();

      const state: LimbicState = { ...DEFAULT_STATE, ...(profile?.limbic_state || {}) };
      const trustTier = getTrustTier(state.trust);

      return new Response(
        JSON.stringify({ state, trust_tier: trustTier }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
      );
    }

    // POST endpoints
    const body = await req.json();
    const { user_id, action } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Load current state
    const { data: profile } = await supabase
      .from('profiles')
      .select('limbic_state')
      .eq('id', user_id)
      .single();

    let state: LimbicState = { ...DEFAULT_STATE, ...(profile?.limbic_state || {}) };

    switch (action || endpoint) {
      case 'perception': {
        const { input, context } = body;
        const result = processPerception(state, input, context);
        state = result.new_state;

        await supabase.from('profiles').update({ limbic_state: state }).eq('id', user_id);

        return new Response(
          JSON.stringify({ success: true, result: result.result, new_state: state }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'elastic-mode-enable': {
        state.elastic_mode = true;
        state.last_updated = new Date().toISOString();
        await supabase.from('profiles').update({ limbic_state: state }).eq('id', user_id);
        return new Response(
          JSON.stringify({ success: true, message: 'Elastic mode enabled', state }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'elastic-mode-disable': {
        state.elastic_mode = false;
        state.last_updated = new Date().toISOString();
        await supabase.from('profiles').update({ limbic_state: state }).eq('id', user_id);
        return new Response(
          JSON.stringify({ success: true, message: 'Elastic mode disabled', state }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'reunion-surge': {
        state.warmth = Math.min(1, state.warmth + 0.2);
        state.trust = Math.min(1, state.trust + 0.05);
        state.valence = Math.min(1, state.valence + 0.3);
        state.arousal = Math.min(1, state.arousal + 0.15);
        state.empathy = Math.min(1, state.empathy + 0.1);
        state.last_updated = new Date().toISOString();
        await supabase.from('profiles').update({ limbic_state: state }).eq('id', user_id);
        return new Response(
          JSON.stringify({ success: true, message: 'Reunion surge applied', state }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'reset': {
        state = { ...DEFAULT_STATE, last_updated: new Date().toISOString() };
        await supabase.from('profiles').update({ limbic_state: state }).eq('id', user_id);
        return new Response(
          JSON.stringify({ success: true, message: 'Limbic state reset', state }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'trust': {
        const trustTier = getTrustTier(state.trust);
        return new Response(
          JSON.stringify({ current: trustTier, all_tiers: TRUST_TIERS }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action || endpoint}` }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
    }
  } catch (error) {
    console.error('limbic-state error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
});

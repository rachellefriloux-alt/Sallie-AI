/**
 * Heritage Compile Edge Function
 * Reference: genesis/genesis_flow/genesis_integration.py (396 lines)
 *
 * Bridges convergence answers to identity system:
 * - Extracts identity data from Genesis answers
 * - Updates surface expression (appearance, interests, style, preferences)
 * - Updates limbic state with emotional calibration
 * - Creates heritage summary
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ExtractedIdentity {
  appearance: Record<string, unknown>;
  interests: string[];
  style: Record<string, string>;
  preferences: Record<string, string>;
  emotional_calibration: Record<string, string>;
  operating_mode: Record<string, string>;
  autonomy_granted: boolean;
  private_name: string;
  ancestral_voice: string;
}

function extractIdentityData(answers: Record<string, { answer: string }>): ExtractedIdentity {
  const get = (key: string) => answers[key]?.answer || '';

  const extracted: ExtractedIdentity = {
    appearance: {
      avatar_chosen: !!answers.avatar_choice,
      choice_method: 'self_directed',
      note: 'Sallie chose her own visual identity during Genesis',
    },
    interests: [],
    style: {},
    preferences: {},
    emotional_calibration: {},
    operating_mode: {},
    autonomy_granted: false,
    private_name: '',
    ancestral_voice: '',
  };

  // Interests
  const curiosity = get('curiosity_threads');
  if (curiosity) extracted.interests.push(`Exploring: ${curiosity.substring(0, 100)}`);
  const freedom = get('freedom_vision');
  if (freedom) extracted.interests.push(`Freedom goal: ${freedom.substring(0, 100)}`);

  // Style
  const intervention = get('intervention_style');
  if (intervention) extracted.style.intervention_intensity = intervention.includes('Firmly') ? 'firm' : 'gentle';
  const editing = get('editing_voice');
  if (editing) extracted.style.editing_voice = editing.includes('Diamond') ? 'polished' : 'authentic';

  // Preferences
  const rhythm = get('work_rhythm');
  if (rhythm) extracted.preferences.work_rhythm = rhythm.includes('Storm') ? 'storm' : 'river';
  const metric = get('success_metric');
  if (metric) {
    if (metric.includes('Both')) extracted.preferences.success_metric = 'balanced';
    else if (metric.includes('Dollar')) extracted.preferences.success_metric = 'revenue';
    else extracted.preferences.success_metric = 'joy';
  }
  const recovery = get('recovery_protocol');
  if (recovery) extracted.preferences.recovery_protocol = recovery;

  // Emotional calibration
  const overwhelm = get('overwhelm_response');
  if (overwhelm) extracted.emotional_calibration.overwhelm_response = overwhelm;
  const tether = get('depression_tether');
  if (tether) extracted.emotional_calibration.depression_tether = tether;
  const contradiction = get('contradiction_handling');
  if (contradiction) {
    extracted.emotional_calibration.contradiction_handling = contradiction.includes('Slow') ? 'slow_down' : 'pivot';
  }

  // Operating mode
  const shield = get('shield_type');
  if (shield) extracted.operating_mode.shield_type = shield.includes('Wall') ? 'wall' : 'filter';
  const risk = get('risk_tolerance');
  if (risk) extracted.operating_mode.risk_stance = risk.includes('Optimist') ? 'optimist' : 'skeptic';
  const justice = get('justice_archetype');
  if (justice) extracted.operating_mode.justice_archetype = justice.includes('Peacekeeper') ? 'peacekeeper' : 'sword';

  // Autonomy
  const autonomy = get('autonomy_permission');
  if (autonomy) extracted.autonomy_granted = autonomy.toLowerCase().includes('grow');

  // Private name
  const privateName = get('private_name');
  if (privateName) extracted.private_name = privateName;

  // Ancestral root
  const ancestral = get('ancestral_root');
  if (ancestral) extracted.ancestral_voice = ancestral;

  return extracted;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const { user_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load heritage DNA with answers
    const { data: profile } = await supabase
      .from('profiles')
      .select('heritage_dna, limbic_state')
      .eq('id', user_id)
      .single();

    if (!profile?.heritage_dna?.answers) {
      return new Response(
        JSON.stringify({ error: 'No heritage answers found. Genesis may not have completed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
      );
    }

    // Extract identity data
    const extracted = extractIdentityData(profile.heritage_dna.answers);

    // Update heritage DNA with extracted identity
    const updatedDna = {
      ...profile.heritage_dna,
      identity: extracted,
      genesis_integration: {
        completed: true,
        timestamp: new Date().toISOString(),
      },
    };

    // Update limbic state with genesis calibration
    const limbicState = profile.limbic_state || {};
    limbicState.genesis_calibration = {
      completed: true,
      timestamp: Date.now(),
      emotional_calibration: extracted.emotional_calibration,
      operating_mode: extracted.operating_mode,
      autonomy_granted: extracted.autonomy_granted,
      private_name: extracted.private_name,
      ancestral_voice: extracted.ancestral_voice,
    };
    limbicState.elastic_mode = false; // Genesis complete, exit elastic mode

    // Save updates
    await supabase
      .from('profiles')
      .update({
        heritage_dna: updatedDna,
        limbic_state: limbicState,
      })
      .eq('id', user_id);

    // Create heritage summary
    const summary = {
      title: "Sallie's Heritage Summary",
      created: new Date().toISOString(),
      key_insights: {
        defense_style: extracted.operating_mode.shield_type || 'unknown',
        work_rhythm: extracted.preferences.work_rhythm || 'unknown',
        intervention_style: extracted.style.intervention_intensity || 'unknown',
        success_metric: extracted.preferences.success_metric || 'unknown',
        risk_stance: extracted.operating_mode.risk_stance || 'unknown',
        justice_archetype: extracted.operating_mode.justice_archetype || 'unknown',
        recovery_protocol: extracted.preferences.recovery_protocol || 'unknown',
        autonomy_granted: extracted.autonomy_granted,
        private_name: extracted.private_name || 'Sallie',
      },
      emotional_calibration: extracted.emotional_calibration,
      interests: extracted.interests,
    };

    return new Response(
      JSON.stringify({
        success: true,
        identity: extracted,
        summary,
        limbic_updated: true,
        heritage_updated: true,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  } catch (error) {
    console.error('heritage-compile error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
});

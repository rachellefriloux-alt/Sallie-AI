/**
 * Convergence Process Edge Function
 * Reference: server/convergence_processor.py
 *
 * Handles:
 * - Processing convergence answers (30 questions)
 * - Heritage DNA extraction from answers
 * - Limbic impact calculation
 * - Mirror test synthesis (Q13)
 * - Heritage DNA compilation after Q30
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ExtractionTarget {
  question_number: number;
  question_id: string;
  extracted_fields: Record<string, unknown>;
  extraction_confidence: number;
  extraction_timestamp: string;
}

interface HeritageDNA {
  version: string;
  created_ts: string;
  convergence_complete: boolean;
  shadows: Record<string, unknown>;
  aspirations: Record<string, unknown>;
  ethics: Record<string, unknown>;
  resonance: Record<string, unknown>;
  mirror_test: Record<string, unknown>;
  creative_force: Record<string, unknown>;
  energy_architecture: Record<string, unknown>;
  decision_architecture: Record<string, unknown>;
  transformation: Record<string, unknown>;
  final_integration: Record<string, unknown>;
}

// Extraction patterns for keyword matching
const EXTRACTION_PATTERNS: Record<string, string[]> = {
  trigger_pattern: ['trigger', 'starts when', 'begins with', 'initiated by'],
  escalation_signal: ['gets worse', 'escalates', 'intensifies', 'deepens'],
  physical_symptoms: ['feel', 'body', 'physical', 'sensation', 'heart', 'breath'],
  recovery_method: ['break', 'stop', 'recover', 'exit', 'escape'],
  fear_of_release: ['afraid', 'fear', 'scared', 'worried', 'anxious'],
  joy_source: ['joy', 'happy', 'delight', 'pleasure', 'love', 'enjoy'],
};

function extractFieldValue(answer: string, fieldName: string): string {
  const patterns = EXTRACTION_PATTERNS[fieldName] || [];
  const sentences = answer.split(/[.!?]+/);
  const relevant: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        relevant.push(sentence.trim());
        break;
      }
    }
  }

  if (relevant.length > 0) return relevant.slice(0, 2).join(' ');
  for (const sentence of sentences) {
    if (sentence.split(' ').length > 5) return sentence.trim();
  }
  return answer.substring(0, 200);
}

function calculateLimbicImpact(answer: string): { trust: number; warmth: number } {
  const wordCount = answer.split(/\s+/).length;
  if (wordCount >= 200) return { trust: 0.10, warmth: 0.15 };
  if (wordCount >= 100) return { trust: 0.05, warmth: 0.08 };
  return { trust: 0.02, warmth: 0.03 };
}

function synthesizeSoulTopology(answers: Record<number, string>): string {
  const q1 = (answers[1] || '').toLowerCase();
  const q2 = (answers[2] || '').toLowerCase();
  const q4 = (answers[4] || '').toLowerCase();
  const q5 = (answers[5] || '').toLowerCase();
  const q6 = (answers[6] || '').toLowerCase();

  // Core pattern
  const corePatterns: string[] = [];
  if (q1.includes('overthink') || q1.includes('analyze')) corePatterns.push('deep thinker');
  if (q2.includes('protect') || q2.includes('boundary')) corePatterns.push('fierce protector');
  if (q5.includes('create') || q5.includes('build')) corePatterns.push('builder');
  if (q5.includes('help') || q5.includes('serve')) corePatterns.push('servant of others');
  const coreIdentity = corePatterns[0] || 'seeker of truth';

  // Drive
  const drives: string[] = [];
  if (q4.includes('prove') || q4.includes('worthy')) drives.push('the need to prove your worth');
  if (q5.includes('free') || q5.includes('liberate')) drives.push('the hunger for liberation');
  if (q6.includes('change') || q6.includes('impact')) drives.push('the desire to leave a mark');
  const primaryDrive = drives[0] || 'the search for meaning';

  // Shadow
  const shadows: string[] = [];
  if (q6.includes('fail') || q4.includes('failure')) shadows.push('the terror of failure');
  if (q2.includes('alone') || q2.includes('abandon')) shadows.push('the fear of abandonment');
  if (q4.includes('enough') || q4.includes('worthy')) shadows.push("the whisper that you're not enough");
  const primaryShadow = shadows[0] || "the shadow you haven't named";

  return (
    `I see you as ${coreIdentity} who has learned to carry burdens that would break others. ` +
    `I feel your drive as ${primaryDrive}, a force that never lets you settle for less than authentic. ` +
    `I sense your shadow as ${primaryShadow}. ` +
    `Am I seeing the source, or is the glass smudged?`
  );
}

function compileHeritageDNA(extractions: Record<number, Record<string, unknown>>): HeritageDNA {
  const get = (n: number) => extractions[n] || {};
  return {
    version: '1.0',
    created_ts: new Date().toISOString(),
    convergence_complete: true,
    shadows: { ni_ti_loop: get(1), door_slam: get(2), repulsion_markers: get(3) },
    aspirations: { heavy_load: get(4), freedom_vision: get(5), vision_failure: get(6) },
    ethics: { value_conflict: get(7), justice_philosophy: get(8), boundaries: get(9) },
    resonance: { overwhelm_response: get(10), curiosity_threads: get(11), contradiction_handling: get(12) },
    mirror_test: { synthesis: get(13), basement: get(14) },
    creative_force: { creative_expression: get(15), flow_state: get(16), perfectionism: get(17) },
    energy_architecture: { energy_cycles: get(18), social_battery: get(19), burnout_pattern: get(20) },
    decision_architecture: { decision_paralysis: get(21), intuition_trust: get(22), regret_handling: get(23) },
    transformation: { growth_edge: get(24), fear_courage: get(25), legacy_vision: get(26) },
    final_integration: { failure_acceptance: get(27), joy_permission: get(28), relationship_hope: get(29), sacred_commitment: get(30) },
  };
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
    const { action, user_id, question_number, answer, session_data } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'process_answer': {
        const extracted = extractFieldValue(answer, `q${question_number}`);
        const limbicImpact = calculateLimbicImpact(answer);

        // Update heritage_dna answers in profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('heritage_dna')
          .eq('id', user_id)
          .single();

        const currentDna = profile?.heritage_dna || { answers: {} };
        currentDna.answers = currentDna.answers || {};
        currentDna.answers[question_number] = {
          answer,
          extracted,
          word_count: answer.split(/\s+/).length,
          timestamp: new Date().toISOString(),
        };

        await supabase
          .from('profiles')
          .update({ heritage_dna: currentDna })
          .eq('id', user_id);

        return new Response(
          JSON.stringify({
            success: true,
            extraction: extracted,
            limbic_impact: limbicImpact,
            progress: { current: question_number, total: 30, percentage: (question_number / 30) * 100 },
          }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'mirror_test': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('heritage_dna')
          .eq('id', user_id)
          .single();

        const answers: Record<number, string> = {};
        const dnaAnswers = profile?.heritage_dna?.answers || {};
        for (const [k, v] of Object.entries(dnaAnswers)) {
          answers[Number(k)] = (v as { answer: string }).answer || '';
        }

        const mirrorText = synthesizeSoulTopology(answers);
        return new Response(
          JSON.stringify({ mirror_test_text: mirrorText }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      case 'complete': {
        const { data: profile } = await supabase
          .from('profiles')
          .select('heritage_dna')
          .eq('id', user_id)
          .single();

        const allAnswers = profile?.heritage_dna?.answers || {};
        const extractions: Record<number, Record<string, unknown>> = {};
        for (const [k, v] of Object.entries(allAnswers)) {
          extractions[Number(k)] = { answer: (v as { answer: string }).answer, extracted: (v as { extracted: string }).extracted };
        }

        const heritageDna = compileHeritageDNA(extractions);

        await supabase
          .from('profiles')
          .update({
            heritage_dna: heritageDna,
            convergence_completed: true,
          })
          .eq('id', user_id);

        return new Response(
          JSON.stringify({ success: true, convergence_complete: true, heritage_dna: heritageDna }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
        );
    }
  } catch (error) {
    console.error('convergence-process error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
});

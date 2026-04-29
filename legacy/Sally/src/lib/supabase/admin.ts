/**
 * Supabase admin client (service role). Server-only. Use for auth.admin and storage cleanup.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/config';

export function createAdminClient() {
  if (!supabaseConfig.serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createSupabaseClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: { persistSession: false },
  });
}

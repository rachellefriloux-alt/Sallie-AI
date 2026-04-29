import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://qluhpkbwtykkcjshsqau.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  'sb_publishable_ruxSKoIZlznxoKWwhCbJbg_9vmyuqxt';

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);

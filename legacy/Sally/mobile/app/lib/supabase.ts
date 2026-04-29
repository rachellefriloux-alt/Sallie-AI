import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { createStorageAdapter } from "./web-storage";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://qluhpkbwtykkcjshsqau.supabase.co';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_ruxSKoIZlznxoKWwhCbJbg_9vmyuqxt';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

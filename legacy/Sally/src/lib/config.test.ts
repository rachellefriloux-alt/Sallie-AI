import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config module', () => {
  const origEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...origEnv };
    vi.resetModules();
  });

  it('supabaseConfig reads from env', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
    const { supabaseConfig } = await import('./config');
    expect(supabaseConfig.url).toBe('https://test.supabase.co');
    expect(supabaseConfig.anonKey).toBe('anon-key-123');
  });

  it('isSupabaseConnected returns true when configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';
    const { isSupabaseConnected } = await import('./config');
    expect(isSupabaseConnected()).toBe(true);
  });

  it('isAzureSpeechConnected returns false without key', async () => {
    delete process.env.AZURE_SPEECH_SERVICES_KEY;
    delete process.env.AZURE_COGNITIVE_SERVICES_KEY;
    const { isAzureSpeechConnected } = await import('./config');
    expect(isAzureSpeechConnected()).toBe(false);
  });

  it('azureOpenAIConfig has defaults', async () => {
    const { azureOpenAIConfig } = await import('./config');
    expect(azureOpenAIConfig.deployment).toBeDefined();
  });
});

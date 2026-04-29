/**
 * Central configuration for Azure + Supabase connections
 * All env vars documented here for clarity
 */

// Supabase - from https://supabase.com/dashboard/project/qluhpkbwtykkcjshsqau
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  anonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? '',
};

// Azure OpenAI (sallieapp) - for sallie-chat Edge Function and AI features
export const azureOpenAIConfig = {
  resource: process.env.AZURE_OPENAI_RESOURCE ?? 'sallieapp',
  apiKey: process.env.AZURE_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY ?? '',
  endpoint:
    process.env.AZURE_OPENAI_ENDPOINT ??
    (process.env.AZURE_OPENAI_RESOURCE
      ? `https://${process.env.AZURE_OPENAI_RESOURCE}.openai.azure.com`
      : ''),
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? process.env.AI_MODEL ?? 'gpt-4o',
};

// Azure Speech (sallyspeech) - for voice input/output
export const azureSpeechConfig = {
  region: process.env.AZURE_SPEECH_REGION ?? process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION ?? 'centralus',
  subscriptionKey: process.env.AZURE_SPEECH_SERVICES_KEY ?? process.env.AZURE_COGNITIVE_SERVICES_KEY ?? '',
  endpoint:
    process.env.AZURE_SPEECH_ENDPOINT ??
    (process.env.AZURE_SPEECH_REGION || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION
      ? `https://${process.env.AZURE_SPEECH_REGION || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'centralus'}.api.cognitive.microsoft.com`
      : ''),
};

export function isSupabaseConnected(): boolean {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
}

export function isAzureOpenAIConnected(): boolean {
  return !!(azureOpenAIConfig.apiKey || (azureOpenAIConfig.endpoint && azureOpenAIConfig.apiKey));
}

export function isAzureSpeechConnected(): boolean {
  return !!azureSpeechConfig.subscriptionKey;
}

// ⚠️ CONFIGURE SUAS CHAVES DE API EM VARIÁVEIS DE AMBIENTE
// Crie um arquivo .env.local e adicione suas chaves
// Veja .env.example para referência

// Validação de chaves de API críticas (valida apenas quando necessário, não na importação)
function validateApiKey(key: string | undefined, keyName: string): string {
  if (!key || key.trim() === '') {
    console.warn(`⚠️ API key missing: ${keyName}. Please configure it in your .env.local file.`);
    return '';
  }
  return key;
}

export const API_CONFIG = {
  CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '',
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '',
  PERPLEXITY_API_KEY: process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || '',
  ELEVENLABS_API_KEY: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '',
  HEYGEN_API_KEY: process.env.EXPO_PUBLIC_HEYGEN_API_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
};

// Supabase config
// Suporta tanto variáveis do Expo (EXPO_PUBLIC_*) quanto da extensão Netlify (SUPABASE_*)
export const SUPABASE_CONFIG = {
  URL: process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_URL || '',
  ANON_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    '',
  FUNCTIONS_URL: process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL || '',
};

// Função helper para validar chaves críticas quando necessário
export function validateRequiredKeys() {
  const required = {
    SUPABASE_URL: SUPABASE_CONFIG.URL,
    SUPABASE_ANON_KEY: SUPABASE_CONFIG.ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value || value.trim() === '')
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`⚠️ Variáveis de ambiente faltando: ${missing.join(', ')}`);
    return false;
  }

  return true;
}

export const API_URLS = {
  CLAUDE: 'https://api.anthropic.com/v1/messages',
  OPENAI: 'https://api.openai.com/v1',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta',
  PERPLEXITY: 'https://api.perplexity.ai',
  ELEVENLABS: 'https://api.elevenlabs.io/v1',
  HEYGEN: 'https://api.heygen.com/v2',
  SUPABASE: SUPABASE_CONFIG.URL,
};

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

export const API_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
};

export const API_URLS = {
  SUPABASE: SUPABASE_CONFIG.URL,
};

// ⚠️ CONFIGURE SUAS CHAVES DE API EM VARIÁVEIS DE AMBIENTE
// Crie um arquivo .env.local e adicione suas chaves
// Veja .env.example para referência

// 🔒 SEGURANÇA: API keys de IA (Claude, OpenAI, Gemini) foram REMOVIDAS do cliente
// Agora ficam apenas no servidor (Supabase Edge Functions)
// Veja: GUIA-CONFIGURACAO-API-KEYS-SEGURO.md

export const API_CONFIG = {
  // Apenas keys que PODEM ser públicas (publishable keys)
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
};

// Supabase config
export const SUPABASE_CONFIG = {
  URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
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

// 🔒 API URLs removidas - chamadas de IA agora são feitas via Edge Functions
// URLs de terceiros não são mais necessárias no cliente

# ============================================

# NETLIFY - Variáveis de Ambiente

# ============================================

# Configure essas variáveis no Netlify Dashboard:

# Site settings → Environment variables

# ============================================

# ⚠️ OBRIGATÓRIAS - App não funciona sem essas variáveis

EXPO_PUBLIC_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueoe
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1

# ⚠️ OPCIONAIS - App funciona sem essas, mas funcionalidades ficam limitadas

EXPO_PUBLIC_SENTRY_DSN=https://7c54483e2021e1b7bae427e8940d6992@o4510299490746368.ingest.us.sentry.io/4510317278134272

# Ambiente

NODE_ENV=production
EXPO_PUBLIC_ENV=production

# ============================================

# ⚠️ IMPORTANTE - CHAVES DE IA

# ============================================

# As chaves de IA devem ser configuradas APENAS no Supabase:

#

# supabase secrets set GEMINI_API_KEY=xxx

# supabase secrets set CLAUDE_API_KEY=xxx

# supabase secrets set OPENAI_API_KEY=xxx

# supabase secrets set PERPLEXITY_API_KEY=xxx

#

# ⚠️ NUNCA coloque essas chaves no Netlify como EXPO*PUBLIC*\*!

# Elas serão expostas no código do cliente e qualquer pessoa

# poderá ver e usar suas chaves.

#

# Para desenvolvimento local, você pode usar EXPO*PUBLIC*\* no .env,

# mas NUNCA faça isso em produção.

# ============================================

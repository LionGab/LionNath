#!/bin/bash
# Script de correção de API Keys expostas

set -e

echo "🔐 CORREÇÃO DE API KEYS EXPOSTAS"
echo "================================"
echo ""

# Passo 1: Verificar .env no Git
echo "📋 Passo 1: Verificando se .env está no histórico Git..."
if git log --all --full-history -- .env | head -n 1; then
    echo "⚠️  ALERTA: .env encontrado no histórico Git!"
    echo "    Execute manualmente:"
    echo "    bfg --delete-files .env"
    echo "    git reflog expire --expire=now --all"
    echo "    git gc --prune=now --aggressive"
    echo ""
    read -p "Pressione ENTER após limpar o histórico..."
else
    echo "✅ .env não encontrado no histórico Git"
fi

# Passo 2: Criar .env limpo
echo ""
echo "📝 Passo 2: Criando .env limpo (SEM API KEYS)..."
cat > .env << 'EOF'
# Supabase (públicas)
EXPO_PUBLIC_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<NOVA_ANON_KEY_AQUI>
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1

# Sentry
EXPO_PUBLIC_SENTRY_DSN=<seu_sentry_dsn>

# Feature Flags
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_ENABLE_GAMIFICATION=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false

# ❌ API KEYS REMOVIDAS
# Agora estão protegidas nas Edge Functions
EOF

echo "✅ .env criado sem API keys"

# Passo 3: Configurar Edge Functions
echo ""
echo "⚙️  Passo 3: Configurando Edge Functions..."
cd supabase/functions

if [ ! -f .env ]; then
    echo "📝 Criando supabase/functions/.env..."
    cat > .env << 'EOF'
# Edge Functions Environment Variables
# Estas keys NUNCA devem ser commitadas

GEMINI_API_KEY=<NOVA_KEY_GEMINI>
CLAUDE_API_KEY=<NOVA_KEY_CLAUDE>
OPENAI_API_KEY=<NOVA_KEY_OPENAI>
PERPLEXITY_API_KEY=<NOVA_KEY_PERPLEXITY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
EOF
    echo "✅ Arquivo criado em supabase/functions/.env"
    echo "⚠️  EDITE ESTE ARQUIVO com as novas keys!"
else
    echo "⚠️  supabase/functions/.env já existe"
fi

cd ../..

# Passo 4: Instruções finais
echo ""
echo "✅ CONFIGURAÇÃO COMPLETA!"
echo ""
echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo "1. Revogar TODAS as keys antigas nos dashboards:"
echo "   - Gemini: https://makersuite.google.com/app/apikey"
echo "   - Claude: https://console.anthropic.com/settings/keys"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - Perplexity: https://www.perplexity.ai/settings/api"
echo "   - Supabase: Dashboard → Settings → API"
echo ""
echo "2. Gerar NOVAS keys e adicionar em:"
echo "   - .env (apenas EXPO_PUBLIC_SUPABASE_ANON_KEY)"
echo "   - supabase/functions/.env (todas as outras)"
echo ""
echo "3. Deploy das Edge Functions:"
echo "   cd supabase/functions"
echo "   supabase functions deploy nathia-chat"
echo "   supabase functions deploy nathia-curadoria"
echo "   supabase functions deploy nathia-moderacao"
echo "   supabase functions deploy nathia-onboarding"
echo "   supabase functions deploy nathia-recs"
echo ""
echo "4. Testar o app:"
echo "   pnpm dev"
echo ""

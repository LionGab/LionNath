# Script PowerShell para criar arquivo .env.local
# Uso: .\scripts\create-env-local.ps1

Write-Host "🔐 Criando arquivo .env.local..." -ForegroundColor Cyan
Write-Host ""

# Verificar se .env.local já existe
if (Test-Path .env.local) {
    Write-Host "⚠️  Arquivo .env.local já existe!" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Operação cancelada" -ForegroundColor Red
        exit 0
    }
}

# Verificar se .env.example existe
if (-not (Test-Path .env.example)) {
    Write-Host "⚠️  Arquivo .env.example não encontrado!" -ForegroundColor Yellow
    Write-Host "Criando template básico..." -ForegroundColor Yellow
}

# Criar conteúdo do .env.local com template
$envContent = @"
# =============================================================================
# NOSSA MATERNIDADE - Environment Variables (.env.local)
# =============================================================================
# ⚠️ Preencha com suas próprias chaves seguras antes de iniciar o app
# =============================================================================

# -----------------------------------------------------------------------------
# SUPABASE - Database & Authentication
# -----------------------------------------------------------------------------
# ⚠️ Expo requer prefixo EXPO_PUBLIC_* apenas para valores realmente públicos
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Service Role Key (NUNCA exponha publicamente - deixar vazio aqui)
SUPABASE_SERVICE_ROLE_KEY=

# Redirect URLs
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/onboarding
NEXT_PUBLIC_PROD_SUPABASE_REDIRECT_URL=https://nossamaternidade.netlify.app/onboarding

# -----------------------------------------------------------------------------
# AI PROVIDERS - EDGE FUNCTIONS ONLY
# -----------------------------------------------------------------------------
# ⚠️ TODAS as chaves de IA foram movidas para supabase/functions/.env
# ⚠️ Configure CLAUDE_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY somente no backend
# ⚠️ Nunca use EXPO_PUBLIC_* para essas chaves

# -----------------------------------------------------------------------------
# CONFIGURAÇÕES DE AMBIENTE
# -----------------------------------------------------------------------------
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# -----------------------------------------------------------------------------
# FEATURE FLAGS
# -----------------------------------------------------------------------------
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_ENABLE_GAMIFICATION=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false

# -----------------------------------------------------------------------------
# RATE LIMITING
# -----------------------------------------------------------------------------
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# =============================================================================
# ⚠️ NOTAS
# =============================================================================
# 1. Gere e armazene chaves sensíveis apenas em Edge Functions (supabase/functions/.env)
# 2. Configure as variáveis seguras nos painéis do Supabase/Netlify/GitHub Secrets
# 3. Este arquivo é apenas para desenvolvimento local e já está no .gitignore
# =============================================================================
"@

# Escrever arquivo
try {
    $envContent | Out-File -FilePath .env.local -Encoding utf8 -NoNewline
    Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Verifique se todas as chaves estão corretas" -ForegroundColor Yellow
    Write-Host "2. Revogue as chaves antigas se necessário" -ForegroundColor Yellow
    Write-Host "3. Configure as mesmas variáveis no Netlify Dashboard" -ForegroundColor Yellow
    Write-Host "4. Configure as variáveis no GitHub Secrets para CI/CD" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: O arquivo .env.local já está no .gitignore" -ForegroundColor Yellow
    Write-Host "⚠️  NUNCA commite este arquivo!" -ForegroundColor Red
} catch {
    Write-Host "❌ Erro ao criar arquivo: $_" -ForegroundColor Red
    exit 1
}


# ============================================
# Script PowerShell para Configurar Ambiente
# ============================================
# 
# Este script facilita a configuração inicial do projeto
# Execute: .\scripts\setup-env.ps1

Write-Host "🚀 Configurando ambiente Nossa Maternidade..." -ForegroundColor Cyan
Write-Host ""

# Verificar se .env já existe
$envPath = Join-Path $PSScriptRoot ".." ".env"
$envExamplePath = Join-Path $PSScriptRoot ".." "apps" "mobile" ".env.example"

if (Test-Path $envPath) {
    Write-Host "⚠️  Arquivo .env já existe em: $envPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "✅ Mantendo arquivo .env existente" -ForegroundColor Green
        exit 0
    }
}

# Verificar se .env.example existe
if (-not (Test-Path $envExamplePath)) {
    Write-Host "❌ Arquivo .env.example não encontrado em: $envExamplePath" -ForegroundColor Red
    Write-Host "   Criando arquivo .env.example..." -ForegroundColor Yellow
    
    $envContent = @"
# ============================================
# Nossa Maternidade - Variáveis de Ambiente
# ============================================
#
# INSTRUÇÕES:
# 1. Preencha os valores obrigatórios abaixo
# 2. NUNCA commite o arquivo .env no git
#
# ============================================

# ============================================
# SUPABASE (OBRIGATÓRIO)
# ============================================
# Obtenha essas credenciais em: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================
# SENTRY (OPCIONAL - Para monitoramento de erros)
# ============================================
EXPO_PUBLIC_SENTRY_DSN=

# ============================================
# ANALYTICS (OPCIONAL)
# ============================================
EXPO_PUBLIC_AMPLITUDE_API_KEY=

# ============================================
# AMBIENTE
# ============================================
EXPO_PUBLIC_ENV=development

# ============================================
# NOTA IMPORTANTE
# ============================================
# As API Keys de IA devem ser configuradas APENAS no Supabase como secrets.
# NUNCA coloque essas keys aqui no .env do app mobile!
# ============================================
"@
    
    New-Item -Path $envExamplePath -ItemType File -Force | Out-Null
    Set-Content -Path $envExamplePath -Value $envContent
    Write-Host "✅ Arquivo .env.example criado!" -ForegroundColor Green
}

# Copiar .env.example para .env
Write-Host "📋 Copiando .env.example para .env..." -ForegroundColor Cyan
Copy-Item -Path $envExamplePath -Destination $envPath -Force

Write-Host ""
Write-Host "✅ Arquivo .env criado em: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. Edite o arquivo .env e preencha:" -ForegroundColor White
Write-Host "      - EXPO_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "      - EXPO_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Obtenha as credenciais em:" -ForegroundColor White
Write-Host "      https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "   3. Valide a configuração com:" -ForegroundColor White
Write-Host "      pnpm run validate:env" -ForegroundColor Cyan
Write-Host ""


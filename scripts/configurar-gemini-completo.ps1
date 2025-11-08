# =====================================================
# Script de Configuração Completa - Gemini 1.5 Pro + Memória Vetorial
# =====================================================

Write-Host "🚀 Configurando Gemini 1.5 Pro + Memória Vetorial" -ForegroundColor Cyan
Write-Host ""

# Variáveis
# Configurações principais (preencha com sua chave segura antes de executar)
$GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
$SUPABASE_PROJECT_REF = "bbcwitnbnosyfpjtzkr"
$MIGRATION_FILE = "supabase\migrations\001_gemini_memory.sql"

# Verificar se está no diretório correto
if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ Erro: Arquivo de migração não encontrado: $MIGRATION_FILE" -ForegroundColor Red
    Write-Host "   Certifique-se de estar no diretório raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Verificar se Supabase CLI está instalado
Write-Host "📋 Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Instalando Supabase CLI..." -ForegroundColor Yellow
    Write-Host "   Execute: npm install -g supabase" -ForegroundColor Cyan
    Write-Host "   Ou baixe de: https://github.com/supabase/cli/releases" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Como alternativa, você pode:" -ForegroundColor Yellow
    Write-Host "   1. Executar o SQL manualmente no Supabase Dashboard" -ForegroundColor Cyan
    Write-Host "   2. Configurar o secret GEMINI_API_KEY no Dashboard" -ForegroundColor Cyan
    Write-Host "   3. Fazer deploy das Edge Functions via Dashboard" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📄 Arquivo SQL: $MIGRATION_FILE" -ForegroundColor Green
    Write-Host "🔑 GEMINI_API_KEY: $GEMINI_API_KEY" -ForegroundColor Green
    exit 1
}

Write-Host "✅ Supabase CLI encontrado!" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "🔐 Verificando autenticação..." -ForegroundColor Yellow
$supabaseStatus = supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Não está logado no Supabase CLI" -ForegroundColor Yellow
    Write-Host "   Execute: supabase login" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Ou execute manualmente no Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. SQL Editor > Execute: $MIGRATION_FILE" -ForegroundColor Cyan
    Write-Host "   2. Edge Functions > Secrets > GEMINI_API_KEY = $GEMINI_API_KEY" -ForegroundColor Cyan
    Write-Host "   3. Edge Functions > Deploy: nathia-chat e moderation-service" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Autenticado!" -ForegroundColor Green
Write-Host ""

# Passo 1: Executar SQL Migration
Write-Host "📊 Passo 1: Executando SQL Migration..." -ForegroundColor Yellow
Write-Host "   Arquivo: $MIGRATION_FILE" -ForegroundColor Gray

# Ler conteúdo do SQL
$sqlContent = Get-Content $MIGRATION_FILE -Raw

# Executar via Supabase CLI (se linkado)
if (Test-Path ".supabase\config.toml") {
    Write-Host "   Executando via Supabase CLI..." -ForegroundColor Gray
    $sqlContent | supabase db execute
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL Migration executada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Erro ao executar SQL. Execute manualmente no Dashboard." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Projeto não linkado. Execute manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF" -ForegroundColor Cyan
    Write-Host "   2. Vá em SQL Editor > New Query" -ForegroundColor Cyan
    Write-Host "   3. Cole o conteúdo de: $MIGRATION_FILE" -ForegroundColor Cyan
    Write-Host "   4. Execute (Ctrl+Enter)" -ForegroundColor Cyan
}

Write-Host ""

# Passo 2: Configurar Secret
Write-Host "🔑 Passo 2: Configurando Secret GEMINI_API_KEY..." -ForegroundColor Yellow

# Tentar configurar via CLI
$secretSet = supabase secrets set GEMINI_API_KEY=$GEMINI_API_KEY 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret configurado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Configure manualmente no Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/settings/functions" -ForegroundColor Cyan
    Write-Host "   2. Vá em Secrets" -ForegroundColor Cyan
    Write-Host "   3. Adicione: GEMINI_API_KEY = $GEMINI_API_KEY" -ForegroundColor Cyan
}

Write-Host ""

# Passo 3: Deploy Edge Functions
Write-Host "🚀 Passo 3: Fazendo Deploy das Edge Functions..." -ForegroundColor Yellow

$functions = @("nathia-chat", "moderation-service")

foreach ($function in $functions) {
    $functionPath = "supabase\functions\$function"

    if (Test-Path $functionPath) {
        Write-Host "   Deployando: $function..." -ForegroundColor Gray
        supabase functions deploy $function --project-ref $SUPABASE_PROJECT_REF

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $function deployado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Erro ao fazer deploy de $function" -ForegroundColor Yellow
            Write-Host "   Faça deploy manualmente no Dashboard" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️  Função não encontrada: $functionPath" -ForegroundColor Yellow
    }
}

Write-Host ""

# Resumo
Write-Host "✅ Configuração Completa!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos Passos:" -ForegroundColor Cyan
Write-Host "   1. Verifique se o SQL foi executado corretamente" -ForegroundColor White
Write-Host "   2. Verifique se o secret GEMINI_API_KEY está configurado" -ForegroundColor White
Write-Host "   3. Verifique se as Edge Functions foram deployadas" -ForegroundColor White
Write-Host "   4. Teste o chat no app" -ForegroundColor White
Write-Host ""
Write-Host "🐛 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - Se houver erros, execute manualmente no Dashboard" -ForegroundColor White
Write-Host "   - Verifique logs em: Edge Functions > Logs" -ForegroundColor White
Write-Host "   - SQL Migration: $MIGRATION_FILE" -ForegroundColor White
Write-Host ""


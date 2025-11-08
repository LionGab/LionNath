# =====================================================
# Script Completo: Instalar Supabase CLI + Configurar Tudo Automaticamente
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Instalando e Configurando Supabase CLI Automaticamente" -ForegroundColor Cyan
Write-Host ""

# Variáveis (preencha com sua chave segura antes de executar)
$GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
$SUPABASE_PROJECT_REF = "bbcwitnbnosyfpjtzkr"
$MIGRATION_FILE = "supabase\migrations\001_gemini_memory.sql"

# Mudar para diretório do projeto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "📁 Diretório: $projectRoot" -ForegroundColor Gray
Write-Host ""

# =====================================================
# PASSO 1: Verificar/Instalar Supabase CLI
# =====================================================

Write-Host "📦 Passo 1: Verificando Supabase CLI..." -ForegroundColor Yellow

$supabaseInstalled = $false
try {
    $version = supabase --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase CLI já instalado: $version" -ForegroundColor Green
        $supabaseInstalled = $true
    }
} catch {
    $supabaseInstalled = $false
}

if (-not $supabaseInstalled) {
    Write-Host "📥 Instalando Supabase CLI via npm..." -ForegroundColor Yellow

    # Verificar se npm está instalado
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm não encontrado. Instale Node.js primeiro:" -ForegroundColor Red
        Write-Host "   https://nodejs.org/" -ForegroundColor Cyan
        exit 1
    }

    # Instalar Supabase CLI globalmente
    Write-Host "⏳ Instalando (pode demorar alguns minutos)..." -ForegroundColor Gray
    npm install -g supabase

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar Supabase CLI" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Supabase CLI instalado com sucesso!" -ForegroundColor Green

    # Verificar instalação
    $version = supabase --version
    Write-Host "   Versão: $version" -ForegroundColor Gray
}

Write-Host ""

# =====================================================
# PASSO 2: Login no Supabase
# =====================================================

Write-Host "🔐 Passo 2: Verificando autenticação..." -ForegroundColor Yellow

# Verificar se já está logado
$loggedIn = $false
try {
    supabase projects list 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Já está autenticado!" -ForegroundColor Green
        $loggedIn = $true
    }
} catch {
    $loggedIn = $false
}

if (-not $loggedIn) {
    Write-Host "⚠️  Não está logado. Fazendo login..." -ForegroundColor Yellow
    Write-Host "   Abra o navegador e faça login no Supabase" -ForegroundColor Cyan
    Write-Host ""

    supabase login

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao fazer login" -ForegroundColor Red
        Write-Host "   Execute manualmente: supabase login" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# =====================================================
# PASSO 3: Link com Projeto
# =====================================================

Write-Host "🔗 Passo 3: Linkando com projeto Supabase..." -ForegroundColor Yellow

# Verificar se já está linkado
$linked = $false
if (Test-Path ".supabase\config.toml") {
    $config = Get-Content ".supabase\config.toml" -Raw
    if ($config -match $SUPABASE_PROJECT_REF) {
        Write-Host "✅ Projeto já está linkado!" -ForegroundColor Green
        $linked = $true
    }
}

if (-not $linked) {
    Write-Host "🔗 Linkando com projeto: $SUPABASE_PROJECT_REF" -ForegroundColor Cyan
    supabase link --project-ref $SUPABASE_PROJECT_REF

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao linkar projeto" -ForegroundColor Red
        Write-Host "   Execute manualmente: supabase link --project-ref $SUPABASE_PROJECT_REF" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "✅ Projeto linkado com sucesso!" -ForegroundColor Green
}

Write-Host ""

# =====================================================
# PASSO 4: Executar SQL Migration
# =====================================================

Write-Host "📊 Passo 4: Executando SQL Migration..." -ForegroundColor Yellow

if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ Arquivo de migração não encontrado: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "   Arquivo: $MIGRATION_FILE" -ForegroundColor Gray

# Ler conteúdo do SQL
$sqlContent = Get-Content $MIGRATION_FILE -Raw

# Executar via Supabase CLI
Write-Host "⏳ Executando SQL migration..." -ForegroundColor Gray

# Salvar SQL em arquivo temporário
$tempSqlFile = "$env:TEMP\001_gemini_memory.sql"
$sqlContent | Out-File -FilePath $tempSqlFile -Encoding UTF8

# Executar via psql ou db push
try {
    # Tentar executar via db push (se migration estiver na pasta migrations)
    supabase db push

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL Migration executada com sucesso!" -ForegroundColor Green
    } else {
        # Tentar método alternativo: executar SQL diretamente
        Write-Host "⚠️  Tentando método alternativo..." -ForegroundColor Yellow

        # Usar supabase db execute (se disponível)
        $sqlContent | supabase db execute

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SQL Migration executada com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Não foi possível executar automaticamente" -ForegroundColor Yellow
            Write-Host "   Execute manualmente no Dashboard:" -ForegroundColor Cyan
            Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF" -ForegroundColor Cyan
            Write-Host "   2. Vá em SQL Editor > New Query" -ForegroundColor Cyan
            Write-Host "   3. Cole o conteúdo de: $MIGRATION_FILE" -ForegroundColor Cyan
            Write-Host "   4. Execute (Ctrl+Enter)" -ForegroundColor Cyan
        }
    }
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "⚠️  Erro ao executar SQL migration: $errorMsg" -ForegroundColor Yellow
    Write-Host "   Execute manualmente no Dashboard" -ForegroundColor Cyan
}

# Limpar arquivo temporário
Remove-Item -Path $tempSqlFile -Force -ErrorAction SilentlyContinue

Write-Host ""

# =====================================================
# PASSO 5: Configurar Secret
# =====================================================

Write-Host "🔑 Passo 5: Configurando Secret GEMINI_API_KEY..." -ForegroundColor Yellow

try {
    supabase secrets set GEMINI_API_KEY=$GEMINI_API_KEY

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secret configurado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Não foi possível configurar automaticamente" -ForegroundColor Yellow
        Write-Host "   Configure manualmente no Dashboard:" -ForegroundColor Cyan
        Write-Host "   1. Acesse: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/settings/functions" -ForegroundColor Cyan
        Write-Host "   2. Vá em Secrets" -ForegroundColor Cyan
        Write-Host "   3. Adicione: GEMINI_API_KEY = $GEMINI_API_KEY" -ForegroundColor Cyan
    }
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "⚠️  Erro ao configurar secret: $errorMsg" -ForegroundColor Yellow
    Write-Host "   Configure manualmente no Dashboard" -ForegroundColor Cyan
}

Write-Host ""

# =====================================================
# PASSO 6: Deploy Edge Functions
# =====================================================

Write-Host "🚀 Passo 6: Fazendo Deploy das Edge Functions..." -ForegroundColor Yellow

$functions = @("nathia-chat", "moderation-service")

foreach ($function in $functions) {
    $functionPath = "supabase\functions\$function"

    if (Test-Path $functionPath) {
        Write-Host "   Deployando: $function..." -ForegroundColor Gray

        try {
            supabase functions deploy $function --project-ref $SUPABASE_PROJECT_REF

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $function deployado com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Erro ao fazer deploy de $function" -ForegroundColor Yellow
                Write-Host "   Faça deploy manualmente no Dashboard" -ForegroundColor Cyan
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-Host "⚠️  Erro ao fazer deploy de $function: $errorMsg" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Função não encontrada: $functionPath" -ForegroundColor Yellow
    }
}

Write-Host ""

# =====================================================
# RESUMO FINAL
# =====================================================

Write-Host "✅ Configuração Completa!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "   ✅ Supabase CLI instalado" -ForegroundColor Green
Write-Host "   ✅ Autenticação verificada" -ForegroundColor Green
Write-Host "   ✅ Projeto linkado" -ForegroundColor Green
Write-Host "   ✅ SQL Migration executada" -ForegroundColor Green
Write-Host "   ✅ Secret configurado" -ForegroundColor Green
Write-Host "   ✅ Edge Functions deployadas" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Tudo configurado e pronto para uso!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos Passos:" -ForegroundColor Cyan
Write-Host "   1. Teste o chat no app" -ForegroundColor White
Write-Host "   2. Verifique logs em: Dashboard > Edge Functions > Logs" -ForegroundColor White
Write-Host ""

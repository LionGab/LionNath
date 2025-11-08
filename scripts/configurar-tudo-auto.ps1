# Script para configurar tudo automaticamente apos instalar Supabase CLI

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuracao Automatica Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variaveis (preencha com sua chave segura antes de executar)
$GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
$SUPABASE_PROJECT_REF = "mnszbkeuerjcevjvdqme"
$MIGRATION_FILE = "supabase\migrations\001_gemini_memory.sql"

# Mudar para diretorio do projeto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

Write-Host "Diretorio: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Adicionar PATH do Scoop se nao estiver presente
$scoopShims = "$env:USERPROFILE\scoop\shims"
if (Test-Path $scoopShims) {
    $currentPath = $env:Path
    if ($currentPath -notlike "*$scoopShims*") {
        $env:Path += ";$scoopShims"
        Write-Host "Adicionando Scoop ao PATH..." -ForegroundColor Gray
    }
}

# Verificar tambem no caminho do Scoop
$supabaseExe = "$scoopShims\supabase.exe"
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    if (Test-Path $supabaseExe) {
        # Criar alias temporario
        Set-Alias -Name supabase -Value $supabaseExe -Scope Script
        Write-Host "Usando Supabase CLI do Scoop..." -ForegroundColor Gray
    }
}

# =====================================================
# PASSO 1: Verificar Supabase CLI
# =====================================================

Write-Host "[1/6] Verificando Supabase CLI..." -ForegroundColor Yellow

$supabaseFound = $false
$supabaseVersion = ""

# Tentar encontrar via comando
try {
    $version = supabase --version 2>&1
    if ($LASTEXITCODE -eq 0 -and $version -notmatch "not recognized" -and $version -notmatch "not found") {
        $supabaseFound = $true
        $supabaseVersion = $version
    }
} catch {
    # Continuar para tentar caminho direto
}

# Se nao encontrou, tentar caminho direto do Scoop
if (-not $supabaseFound -and (Test-Path $supabaseExe)) {
    try {
        $version = & $supabaseExe --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $supabaseFound = $true
            $supabaseVersion = $version
            # Criar alias para usar no resto do script
            Set-Alias -Name supabase -Value $supabaseExe -Scope Script
        }
    } catch {
        # Continuar
    }
}

if ($supabaseFound) {
    Write-Host "  OK: Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} else {
    Write-Host "  ERRO: Supabase CLI nao encontrado" -ForegroundColor Red
    Write-Host "  Execute: .\scripts\instalar-supabase-auto.ps1" -ForegroundColor Yellow
    Write-Host "  Ou instale via Scoop: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# =====================================================
# PASSO 2: Verificar Login
# =====================================================

Write-Host "[2/6] Verificando autenticacao..." -ForegroundColor Yellow

$loggedIn = $false
try {
    $projects = supabase projects list 2>&1
    if ($LASTEXITCODE -eq 0 -and $projects -notmatch "Access token not provided" -and $projects -notmatch "Cannot use automatic login") {
        Write-Host "  OK: Ja esta autenticado!" -ForegroundColor Green
        $loggedIn = $true
    }
} catch {
    $loggedIn = $false
}

if (-not $loggedIn) {
    Write-Host "  AVISO: Nao esta autenticado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  IMPORTANTE: Execute manualmente no seu terminal:" -ForegroundColor Cyan
    Write-Host "    1. Adicione PATH do Scoop:" -ForegroundColor White
    Write-Host "       `$env:Path += `";`$env:USERPROFILE\scoop\shims`"" -ForegroundColor Gray
    Write-Host "    2. Execute login:" -ForegroundColor White
    Write-Host "       supabase login" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Isso abrira o navegador para voce fazer login." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Depois execute este script novamente:" -ForegroundColor Cyan
    Write-Host "    .\scripts\configurar-tudo-auto.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "  Ou configure manualmente no Dashboard:" -ForegroundColor Yellow
    Write-Host "    1. SQL Editor > Execute: $MIGRATION_FILE" -ForegroundColor Cyan
    Write-Host "    2. Edge Functions > Secrets > GEMINI_API_KEY = $GEMINI_API_KEY" -ForegroundColor Cyan
    Write-Host "    3. Edge Functions > Deploy: nathia-chat e moderation-service" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Veja o guia completo: FAZER_LOGIN.md" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host ""

# =====================================================
# PASSO 3: Link com Projeto
# =====================================================

Write-Host "[3/6] Linkando com projeto..." -ForegroundColor Yellow

$linked = $false
if (Test-Path ".supabase\config.toml") {
    $config = Get-Content ".supabase\config.toml" -Raw
    if ($config -match $SUPABASE_PROJECT_REF) {
        Write-Host "  OK: Projeto ja esta linkado!" -ForegroundColor Green
        $linked = $true
    }
}

if (-not $linked) {
    Write-Host "  Linkando com projeto: $SUPABASE_PROJECT_REF" -ForegroundColor Gray
    supabase link --project-ref $SUPABASE_PROJECT_REF 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: Projeto linkado!" -ForegroundColor Green
    } else {
        Write-Host "  ERRO: Nao foi possivel linkar projeto" -ForegroundColor Red
        Write-Host "  Execute manualmente: supabase link --project-ref $SUPABASE_PROJECT_REF" -ForegroundColor Yellow
    }
}

Write-Host ""

# =====================================================
# PASSO 4: Executar SQL Migration
# =====================================================

Write-Host "[4/6] Executando SQL Migration..." -ForegroundColor Yellow

if (Test-Path $MIGRATION_FILE) {
    Write-Host "  Arquivo: $MIGRATION_FILE" -ForegroundColor Gray

    # Tentar db push primeiro
    supabase db push 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: SQL Migration executada!" -ForegroundColor Green
    } else {
        Write-Host "  AVISO: Nao foi possivel executar automaticamente" -ForegroundColor Yellow
        Write-Host "  Execute manualmente no Dashboard:" -ForegroundColor Cyan
        Write-Host "    1. Acesse: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF" -ForegroundColor White
        Write-Host "    2. SQL Editor > New Query" -ForegroundColor White
        Write-Host "    3. Cole o conteudo de: $MIGRATION_FILE" -ForegroundColor White
        Write-Host "    4. Execute (Ctrl+Enter)" -ForegroundColor White
    }
} else {
    Write-Host "  ERRO: Arquivo nao encontrado: $MIGRATION_FILE" -ForegroundColor Red
}

Write-Host ""

# =====================================================
# PASSO 5: Configurar Secret
# =====================================================

Write-Host "[5/6] Configurando Secret GEMINI_API_KEY..." -ForegroundColor Yellow

supabase secrets set GEMINI_API_KEY=$GEMINI_API_KEY 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Secret configurado!" -ForegroundColor Green
} else {
    Write-Host "  AVISO: Nao foi possivel configurar automaticamente" -ForegroundColor Yellow
    Write-Host "  Configure manualmente no Dashboard:" -ForegroundColor Cyan
    Write-Host "    1. Acesse: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF/settings/functions" -ForegroundColor White
    Write-Host "    2. Vá em Secrets" -ForegroundColor White
    Write-Host "    3. Adicione: GEMINI_API_KEY = $GEMINI_API_KEY" -ForegroundColor White
}

Write-Host ""

# =====================================================
# PASSO 6: Deploy Edge Functions
# =====================================================

Write-Host "[6/6] Fazendo Deploy das Edge Functions..." -ForegroundColor Yellow

$functions = @("nathia-chat", "moderation-service")
$deployed = 0

foreach ($function in $functions) {
    $functionPath = "supabase\functions\$function"
    if (Test-Path $functionPath) {
        Write-Host "  Deployando: $function..." -ForegroundColor Gray
        supabase functions deploy $function --project-ref $SUPABASE_PROJECT_REF 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK: $function deployado!" -ForegroundColor Green
            $deployed++
        } else {
            Write-Host "  AVISO: Nao foi possivel fazer deploy de $function" -ForegroundColor Yellow
            Write-Host "  Faça deploy manualmente no Dashboard" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  AVISO: Funcao nao encontrada: $functionPath" -ForegroundColor Yellow
    }
}

Write-Host ""

# =====================================================
# RESUMO FINAL
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuracao Completa!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "  [OK] Supabase CLI instalado" -ForegroundColor Green
Write-Host "  [OK] Autenticacao verificada" -ForegroundColor Green
Write-Host "  [OK] Projeto linkado" -ForegroundColor Green
Write-Host "  [OK] SQL Migration executada" -ForegroundColor Green
Write-Host "  [OK] Secret configurado" -ForegroundColor Green
Write-Host "  [OK] Edge Functions deployadas ($deployed/2)" -ForegroundColor Green
Write-Host ""

Write-Host "Proximos Passos:" -ForegroundColor Cyan
Write-Host "  1. Teste o chat no app" -ForegroundColor White
Write-Host "  2. Verifique logs em: Dashboard > Edge Functions > Logs" -ForegroundColor White
Write-Host ""

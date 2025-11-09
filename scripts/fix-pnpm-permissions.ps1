# Script para resolver problemas de permissão do pnpm no Windows
# Uso: .\scripts\fix-pnpm-permissions.ps1

Write-Host "🔧 Resolvendo problemas de permissão do pnpm..." -ForegroundColor Cyan

# 1. Parar processos que podem estar usando node_modules
Write-Host "`n📋 Verificando processos Node/Expo..." -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
$expoProcesses = Get-Process -Name expo -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️  Encontrados processos Node rodando. Parando..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

if ($expoProcesses) {
    Write-Host "⚠️  Encontrados processos Expo rodando. Parando..." -ForegroundColor Yellow
    $expoProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 2. Limpar pasta .ignored_react-native se existir
Write-Host "`n🧹 Limpando pastas temporárias..." -ForegroundColor Yellow

$ignoredPath = Join-Path $PSScriptRoot "..\node_modules\.ignored_react-native"
if (Test-Path $ignoredPath) {
    Write-Host "Removendo .ignored_react-native..." -ForegroundColor Gray
    Remove-Item -Path $ignoredPath -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Tentar remover lock de arquivos
Write-Host "`n🔓 Tentando liberar locks de arquivos..." -ForegroundColor Yellow

$reactNativePath = Join-Path $PSScriptRoot "..\node_modules\react-native"
if (Test-Path $reactNativePath) {
    # Tentar remover atributos de somente leitura
    Get-ChildItem -Path $reactNativePath -Recurse -Force | 
        ForEach-Object { 
            $_.Attributes = $_.Attributes -band (-bnot [System.IO.FileAttributes]::ReadOnly)
        } -ErrorAction SilentlyContinue
}

# 4. Limpar cache do pnpm
Write-Host "`n🗑️  Limpando cache do pnpm..." -ForegroundColor Yellow
pnpm store prune --force 2>&1 | Out-Null

# 5. Tentar instalação novamente
Write-Host "`n✅ Pronto! Tente executar novamente:" -ForegroundColor Green
Write-Host "   pnpm install --force" -ForegroundColor Cyan
Write-Host "`nOu se o problema persistir, tente:" -ForegroundColor Yellow
Write-Host "   1. Feche todos os editores/IDEs" -ForegroundColor Gray
Write-Host "   2. Execute como Administrador: Remove-Item -Recurse -Force node_modules" -ForegroundColor Gray
Write-Host "   3. Execute: pnpm install" -ForegroundColor Gray


#!/bin/bash
# Script de Deploy Automático para Netlify
# Execute: bash scripts/deploy-netlify.sh

set -e

echo "🚀 Iniciando deploy no Netlify..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI não encontrado${NC}"
    echo "Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

# Verificar se está logado
if ! netlify status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Não está logado no Netlify${NC}"
    echo "Faça login:"
    netlify login
fi

# Verificar se projeto está linkado
if [ ! -f ".netlify/state.json" ]; then
    echo -e "${YELLOW}⚠️  Projeto não está linkado ao Netlify${NC}"
    echo "Linkando projeto..."
    netlify link
fi

# Build do projeto
echo -e "${GREEN}📦 Fazendo build do projeto...${NC}"
cd apps/mobile
pnpm run build:web

# Verificar se build foi criado
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Diretório dist não foi criado${NC}"
    exit 1
fi

# Deploy
echo -e "${GREEN}🚀 Fazendo deploy...${NC}"
cd ../..
netlify deploy --prod --dir=apps/mobile/dist

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no Netlify Dashboard"
echo "2. Veja NETLIFY_ENV_VARS.md para valores completos"
echo "3. Configure secrets de IA no Supabase (não no Netlify!)"

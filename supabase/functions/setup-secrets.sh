#!/bin/bash
# Script para configurar segredos do Supabase Edge Functions
# Uso: ./supabase/functions/setup-secrets.sh

set -e

echo "🔐 Configuração de Segredos Supabase Edge Functions"
echo "=================================================="
echo ""

# Verificar se supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se .env.prod existe
if [ ! -f ".env.prod" ]; then
    echo "⚠️  Arquivo .env.prod não encontrado!"
    echo ""
    echo "Criando a partir do exemplo..."
    cp supabase/functions/.env.prod.example .env.prod
    echo "✅ Arquivo .env.prod criado!"
    echo ""
    echo "⚠️  IMPORTANTE: Edite .env.prod com suas chaves reais antes de continuar!"
    echo ""
    read -p "Pressione Enter após editar .env.prod para continuar..."
fi

# Verificar se está logado no Supabase
echo "Verificando autenticação Supabase..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Não autenticado no Supabase!"
    echo "Execute: supabase login"
    exit 1
fi

echo ""
echo "📋 Segredos que serão configurados:"
echo "-----------------------------------"
grep -v "^#" .env.prod | grep -v "^$" | cut -d'=' -f1 | sed 's/^/  - /'
echo ""

read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo ""
echo "🔧 Configurando segredos..."
supabase secrets set --env-file .env.prod

echo ""
echo "✅ Segredos configurados com sucesso!"
echo ""
echo "📊 Verificando segredos configurados:"
supabase secrets list

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "💡 Próximos passos:"
echo "  1. Teste as Edge Functions que usam esses segredos"
echo "  2. Verifique os logs: supabase functions logs"
echo "  3. Consulte: supabase/functions/SECRETS.md para mais informações"

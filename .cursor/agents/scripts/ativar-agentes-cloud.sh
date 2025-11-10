#!/bin/bash
# Script para ativar 8 agentes na nuvem via API do Cursor
# Requer: CURSOR_API_KEY configurada como variável de ambiente

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se API key está configurada
if [ -z "$CURSOR_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  CURSOR_API_KEY não configurada${NC}"
    echo "Configure com: export CURSOR_API_KEY='sua-chave-aqui'"
    echo "Ou obtenha em: https://cursor.com/settings/api"
    exit 1
fi

# Configurações
REPO="seu-usuario/nossa-maternidade"  # ATUALIZE COM SEU REPO
BRANCH="main"
API_URL="https://api.cursor.com/v1/agents"

echo -e "${BLUE}🚀 Ativando 8 Agentes na Nuvem...${NC}\n"

# Função para criar agente
create_agent() {
    local name=$1
    local workspace=$2
    local instructions=$3
    local report_file=$4
    
    echo -e "${GREEN}📦 Criando agente: $name${NC}"
    
    curl -X POST "$API_URL" \
        -H "Authorization: Bearer $CURSOR_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"workspace\": \"$workspace\",
            \"instructions\": \"$instructions\",
            \"repository\": \"$REPO\",
            \"branch\": \"$BRANCH\",
            \"report_file\": \"$report_file\"
        }" | jq -r '.id'
}

# Agente 1: Frontend
AGENT1_ID=$(create_agent \
    "Frontend Architect" \
    "src/components/" \
    "Revisar componentes React Native. Verificar TypeScript (sem any, tipos explícitos), performance (React.memo, useCallback, useMemo), acessibilidade WCAG 2.1 AA, estilização (tema, dark mode), estrutura e organização. Aplicar correções críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_1_FRONTEND_REPORT.md" \
    ".cursor/agents/reports/AGENT_1_FRONTEND_REPORT.md"
)

# Agente 2: Backend
AGENT2_ID=$(create_agent \
    "Backend Engineer" \
    "src/services/" \
    "Revisar serviços e integrações. Verificar autenticação e segurança, integração com Supabase, tratamento de erros, validações e sanitização, RLS e privacidade. Aplicar correções de vulnerabilidades críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_2_BACKEND_REPORT.md" \
    ".cursor/agents/reports/AGENT_2_BACKEND_REPORT.md"
)

# Agente 3: IA
AGENT3_ID=$(create_agent \
    "IA Integration Specialist" \
    "src/lib/nat-ai/" \
    "Revisar sistema NAT-AI. Verificar guardrails e segurança, detecção de crise, context manager, system prompts, fallbacks. Aplicar correções críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_3_AI_REPORT.md" \
    ".cursor/agents/reports/AGENT_3_AI_REPORT.md"
)

# Agente 4: Design
AGENT4_ID=$(create_agent \
    "Design System Engineer" \
    "src/components/, src/theme/" \
    "Revisar design system. Verificar design system, acessibilidade visual, dark mode, mobile-first, contraste e legibilidade. Aplicar correções de acessibilidade críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_4_DESIGN_REPORT.md" \
    ".cursor/agents/reports/AGENT_4_DESIGN_REPORT.md"
)

# Agente 5: QA
AGENT5_ID=$(create_agent \
    "QA & Testing" \
    "__tests__/" \
    "Revisar testes e qualidade. Verificar cobertura de testes, testes unitários, testes de integração, testes de acessibilidade. Criar testes críticos faltantes. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_5_QA_REPORT.md" \
    ".cursor/agents/reports/AGENT_5_QA_REPORT.md"
)

# Agente 6: Security
AGENT6_ID=$(create_agent \
    "Security & Compliance" \
    "Todo o código" \
    "Revisar segurança e LGPD. Verificar proteção de dados sensíveis, validação de inputs, rate limiting, compliance LGPD, vulnerabilidades. Aplicar correções de vulnerabilidades críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_6_SECURITY_REPORT.md" \
    ".cursor/agents/reports/AGENT_6_SECURITY_REPORT.md"
)

# Agente 7: DevOps
AGENT7_ID=$(create_agent \
    "DevOps & Performance" \
    "Configurações e CI/CD" \
    "Revisar configurações e CI/CD. Verificar configurações do Expo, Sentry, variáveis de ambiente, scripts de build, CI/CD. Aplicar correções de build/deploy críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_7_DEVOPS_REPORT.md" \
    ".cursor/agents/reports/AGENT_7_DEVOPS_REPORT.md"
)

# Agente 8: Docs
AGENT8_ID=$(create_agent \
    "Documentation & UX Writer" \
    "Documentação" \
    "Revisar documentação e JSDoc. Verificar JSDoc em componentes públicos, documentação de APIs, READMEs, guias de usuário. Adicionar JSDoc faltante em componentes públicos. Melhorar documentação existente. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_8_DOCS_REPORT.md" \
    ".cursor/agents/reports/AGENT_8_DOCS_REPORT.md"
)

echo -e "\n${GREEN}✅ Todos os 8 agentes foram criados!${NC}\n"
echo -e "${BLUE}📊 IDs dos Agentes:${NC}"
echo "  Agent 1 (Frontend): $AGENT1_ID"
echo "  Agent 2 (Backend): $AGENT2_ID"
echo "  Agent 3 (IA): $AGENT3_ID"
echo "  Agent 4 (Design): $AGENT4_ID"
echo "  Agent 5 (QA): $AGENT5_ID"
echo "  Agent 6 (Security): $AGENT6_ID"
echo "  Agent 7 (DevOps): $AGENT7_ID"
echo "  Agent 8 (Docs): $AGENT8_ID"

echo -e "\n${YELLOW}📋 Próximos Passos:${NC}"
echo "1. Acompanhe o progresso em: https://cursor.com/dashboard/agents"
echo "2. Aguarde conclusão (10-20 minutos)"
echo "3. Revise relatórios em: .cursor/agents/reports/"
echo "4. Aplique correções sugeridas"

echo -e "\n${GREEN}🚀 Agentes ativados com sucesso!${NC}"

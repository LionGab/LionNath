# 🚀 Ativar 8 Agentes - Guia Completo

## Método 1: Via Site do Cursor (Agentes na Nuvem)

### Passo a Passo

1. **Acesse o site do Cursor:**
   - Vá para: https://cursor.com/agents
   - Faça login com sua conta do Cursor

2. **Conecte sua conta do GitHub:**
   - Autorize o Cursor a acessar seus repositórios
   - Isso permite que os agentes trabalhem no seu código

3. **Inicie os 8 agentes:**
   - Cada agente pode ser iniciado individualmente
   - Ou use a API de Background Agents para gerenciar programaticamente
   - Limite: até 256 agentes ativos por chave de API

4. **Benefícios dos Agentes na Nuvem:**
   - ✅ 99,9% de confiabilidade
   - ✅ Inicialização instantânea
   - ✅ Acesso de qualquer dispositivo
   - ✅ Interface web melhorada
   - ✅ Execução em máquinas isoladas (Ubuntu)
   - ✅ Acesso à internet e instalação de pacotes

### Documentação Oficial
- Site: https://cursor.com/agents
- Docs: https://docs.cursor.com/pt-BR/background-agent

---

## Método 2: Via Composer Local (Multi-Agente Interface)

### Como Ativar

1. **Abra o Composer:**
   - Pressione `Ctrl+I` (Windows/Linux) ou `Cmd+I` (Mac)
   - Ou clique no ícone "Composer" na barra lateral

2. **Cole o comando abaixo:**

**📋 COMANDO COMPLETO (copie tudo):**

Veja o comando completo em: `.cursor/agents/ativar-8-agentes-paralelo.md`

Ou copie diretamente:

```
Ative 8 agentes em paralelo para revisão e melhorias completas:

Agente 1 (Frontend): Revisar componentes React Native em src/components/
- Verificar TypeScript (sem any, tipos explícitos)
- Verificar performance (React.memo, useCallback, useMemo)
- Verificar acessibilidade (WCAG 2.1 AA)
- Verificar estilização (tema, dark mode)
- Verificar estrutura e organização
- Sugerir melhorias e correções
- Aplicar correções críticas imediatamente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_1_FRONTEND_REPORT.md

Agente 2 (Backend): Revisar serviços e integrações em src/services/
- Verificar autenticação e segurança
- Verificar integração com Supabase
- Verificar tratamento de erros
- Verificar validações e sanitização
- Verificar RLS e privacidade
- Sugerir melhorias e correções
- Aplicar correções de vulnerabilidades críticas imediatamente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_2_BACKEND_REPORT.md

Agente 3 (IA): Revisar sistema NAT-AI em src/lib/nat-ai/
- Verificar guardrails e segurança
- Verificar detecção de crise
- Verificar context manager
- Verificar system prompts
- Verificar fallbacks
- Sugerir melhorias e correções
- Aplicar correções críticas imediatamente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_3_AI_REPORT.md

Agente 4 (Design): Revisar componentes e tema em src/components/ e src/theme/
- Verificar design system
- Verificar acessibilidade visual
- Verificar dark mode
- Verificar mobile-first
- Verificar contraste e legibilidade
- Sugerir melhorias e correções
- Aplicar correções de acessibilidade críticas imediatamente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_4_DESIGN_REPORT.md

Agente 5 (QA): Revisar testes e qualidade em __tests__/
- Verificar cobertura de testes
- Verificar testes unitários
- Verificar testes de integração
- Verificar testes de acessibilidade
- Sugerir testes faltantes
- Criar testes críticos faltantes
- Sugerir melhorias e correções
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_5_QA_REPORT.md

Agente 6 (Security): Revisar segurança e LGPD em todo o código
- Verificar proteção de dados sensíveis
- Verificar validação de inputs
- Verificar rate limiting
- Verificar compliance LGPD
- Verificar vulnerabilidades
- Sugerir melhorias e correções
- Aplicar correções de vulnerabilidades críticas imediatamente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_6_SECURITY_REPORT.md

Agente 7 (DevOps): Revisar configurações e CI/CD
- Verificar configurações do Expo
- Verificar Sentry
- Verificar variáveis de ambiente
- Verificar scripts de build
- Verificar CI/CD
- Sugerir melhorias e correções
- Aplicar correções de build/deploy críticas imediatamente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_7_DEVOPS_REPORT.md

Agente 8 (Docs): Revisar documentação e JSDoc
- Verificar JSDoc em componentes públicos
- Verificar documentação de APIs
- Verificar READMEs
- Verificar guias de usuário
- Sugerir melhorias e correções
- Adicionar JSDoc faltante em componentes públicos
- Melhorar documentação existente
- Priorizar por severidade (Crítico 5 → Info 1)
- Salvar relatório em .cursor/agents/reports/AGENT_8_DOCS_REPORT.md

Para cada agente:
1. Analise o código sistematicamente
2. Identifique bugs, code smells, violações de padrão
3. Sugira correções com código específico
4. Priorize por severidade (Crítico 5 → Info 1)
5. Gere relatório estruturado
6. Aplique correções quando apropriado (com aprovação automática)
```

3. **Aguarde a execução:**
   - Os 8 agentes trabalharão em paralelo
   - Cada agente opera em worktree isolado do Git
   - Progresso visível no painel do Cursor

4. **Revise os resultados:**
   - Cada agente gerará um relatório
   - Revise mudanças de cada agente separadamente
   - Aprove ou rejeite mudanças individualmente

---

## Método 3: Via Atalho de Teclado

### Windows/Linux
- `Ctrl+Shift+M` - Abre interface Multi-Agente

### Mac
- `Cmd+Shift+M` - Abre interface Multi-Agente

### Depois de abrir:
1. Digite as tarefas para cada agente
2. O Cursor criará agentes paralelos automaticamente
3. Cada agente trabalha em worktree isolado

---

## Método 4: Via Scripts Node.js

Execute o script de agentes:

```bash
pnpm agents:start
```

Ou execute agentes individuais (veja `.cursor/agents/comandos-individuais.md`):

```bash
# Ver status dos agentes
pnpm agents:status

# Ver logs dos agentes
pnpm agents:logs

# Parar agentes
pnpm agents:stop
```

---

## Método 5: Via Comandos Personalizados do Cursor

Use os comandos personalizados do Cursor:

```
@revisar-codigo
@validar-projeto
@refatorar-performance
```

## Relatórios

Os relatórios serão gerados em:

- **`.cursor/agents/reports/`** - Relatórios individuais por agente
  - `AGENT_1_FRONTEND_REPORT.md`
  - `AGENT_2_BACKEND_REPORT.md`
  - `AGENT_3_AI_REPORT.md`
  - `AGENT_4_DESIGN_REPORT.md`
  - `AGENT_5_QA_REPORT.md`
  - `AGENT_6_SECURITY_REPORT.md`
  - `AGENT_7_DEVOPS_REPORT.md`
  - `AGENT_8_DOCS_REPORT.md`
- **`.cursor/review-logs/`** - Logs de revisão
- **Console do Cursor** - Progresso em tempo real
- **Painel de Revisão** - Todas as mudanças em um só lugar

## Agentes Configurados

### Multi-Agente (8 agentes em paralelo)

- ✅ Frontend (React Native + Expo)
- ✅ Backend (Supabase + Edge Functions)
- ✅ IA (NAT-AI + Gemini)
- ✅ Design (Design System + Acessibilidade)
- ✅ QA (Testes + Coverage)
- ✅ Security (LGPD + Segurança)
- ✅ DevOps (CI/CD + Monitoring)
- ✅ Docs (Documentação + JSDoc)

### Code Reviewer (Multi-Stage)

- ✅ Code Inspector
- ✅ Test Runner
- ✅ Performance Analyzer
- ✅ Accessibility Auditor
- ✅ Security Auditor
- ✅ Type Safety Checker
- ✅ Documentation Checker
- ✅ Final Report

### Script Agents (8 agentes)

- ✅ Refactor
- ✅ Performance
- ✅ Test
- ✅ Docs
- ✅ Type Safety
- ✅ Accessibility
- ✅ Security
- ✅ Cleanup

## Próximos Passos

1. ✅ Escolha um método (Site ou Composer)
2. ✅ Execute o comando ou acesse o site
3. ✅ Aguarde todos os agentes concluírem
4. ✅ Revise os relatórios gerados
5. ✅ Aplique as correções sugeridas
6. ✅ Valide com `pnpm run validate`

---

## Referências

- **Site do Cursor:** https://cursor.com/agents
- **Documentação:** https://docs.cursor.com/pt-BR/background-agent
- **Multi-Agente Local:** `docs/COMO_USAR_AGENTES.md`
- **Best Practices:** `docs/CURSOR_2.0_BEST_PRACTICES.md`
- **Comando Pronto:** `.cursor/agents/ativar-8-agentes-paralelo.md`
- **Comandos Individuais:** `.cursor/agents/comandos-prontos-copiar.md`

---

**Última atualização:** Baseado em cursor.com/agents e documentação oficial

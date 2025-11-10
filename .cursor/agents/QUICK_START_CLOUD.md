# 🌐 Guia Rápido - Ativar Agentes na Nuvem

## ⚡ Início Rápido (2 minutos)

### 1. Acesse o Site
👉 **https://cursor.com/agents**

### 2. Faça Login
- Use sua conta do Cursor
- Se não tiver, crie em: https://cursor.com

### 3. Conecte GitHub
- Autorize acesso aos repositórios
- Selecione: `nossa-maternidade` (ou seu repo)

### 4. Configure os 8 Agentes

**Copie e cole as instruções abaixo para cada agente:**

#### Agente 1 - Frontend:
```
Revisar componentes React Native em src/components/. Verificar TypeScript (sem any, tipos explícitos), performance (React.memo, useCallback, useMemo), acessibilidade WCAG 2.1 AA, estilização (tema, dark mode), estrutura e organização. Aplicar correções críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_1_FRONTEND_REPORT.md
```

#### Agente 2 - Backend:
```
Revisar serviços e integrações em src/services/. Verificar autenticação e segurança, integração com Supabase, tratamento de erros, validações e sanitização, RLS e privacidade. Aplicar correções de vulnerabilidades críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_2_BACKEND_REPORT.md
```

#### Agente 3 - IA:
```
Revisar sistema NAT-AI em src/lib/nat-ai/. Verificar guardrails e segurança, detecção de crise, context manager, system prompts, fallbacks. Aplicar correções críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_3_AI_REPORT.md
```

#### Agente 4 - Design:
```
Revisar componentes e tema em src/components/ e src/theme/. Verificar design system, acessibilidade visual, dark mode, mobile-first, contraste e legibilidade. Aplicar correções de acessibilidade críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_4_DESIGN_REPORT.md
```

#### Agente 5 - QA:
```
Revisar testes e qualidade em __tests__/. Verificar cobertura de testes, testes unitários, testes de integração, testes de acessibilidade. Criar testes críticos faltantes. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_5_QA_REPORT.md
```

#### Agente 6 - Security:
```
Revisar segurança e LGPD em todo o código. Verificar proteção de dados sensíveis, validação de inputs, rate limiting, compliance LGPD, vulnerabilidades. Aplicar correções de vulnerabilidades críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_6_SECURITY_REPORT.md
```

#### Agente 7 - DevOps:
```
Revisar configurações e CI/CD. Verificar configurações do Expo, Sentry, variáveis de ambiente, scripts de build, CI/CD. Aplicar correções de build/deploy críticas. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_7_DEVOPS_REPORT.md
```

#### Agente 8 - Docs:
```
Revisar documentação e JSDoc. Verificar JSDoc em componentes públicos, documentação de APIs, READMEs, guias de usuário. Adicionar JSDoc faltante em componentes públicos. Melhorar documentação existente. Priorizar por severidade (Crítico 5 → Info 1). Salvar relatório em .cursor/agents/reports/AGENT_8_DOCS_REPORT.md
```

### 5. Inicie os Agentes
- Clique em "Iniciar" para cada agente
- Ou inicie todos em paralelo
- Aguarde conclusão (10-20 minutos)

### 6. Revise Relatórios
- Acesse: https://cursor.com/dashboard/agents
- Veja progresso em tempo real
- Relatórios salvos em: `.cursor/agents/reports/`

---

## ✅ Benefícios

- ✅ 99,9% de confiabilidade
- ✅ Inicialização instantânea
- ✅ Acesso de qualquer dispositivo
- ✅ Máquinas isoladas (Ubuntu)
- ✅ Até 256 agentes simultâneos

---

## 🔗 Links

- **Site:** https://cursor.com/agents
- **Dashboard:** https://cursor.com/dashboard/agents
- **API Key:** https://cursor.com/settings/api
- **Docs:** https://docs.cursor.com/pt-BR/background-agent

---

## 📋 Checklist

- [ ] Login feito no cursor.com/agents
- [ ] GitHub conectado
- [ ] Repositório selecionado
- [ ] 8 agentes configurados
- [ ] Agentes iniciados
- [ ] Monitoramento ativo
- [ ] Aguardando conclusão
- [ ] Relatórios revisados

---

**Veja guia completo em:** `.cursor/agents/ATIVAR_NA_NUVEM.md`

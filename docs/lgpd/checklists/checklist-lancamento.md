# Checklist de Lançamento LGPD-Compliant

## Nossa Maternidade

**Use este checklist antes de lançar em produção (beta ou público)**

---

## 📄 DOCUMENTAÇÃO LEGAL

### Política de Privacidade

- [ ] Documento criado e aprovado por advogado LGPD
- [ ] Publicado em URL acessível: https://nossa-maternidade.com.br/privacidade
- [ ] Contém seção destacada sobre dados sensíveis de saúde
- [ ] Lista completa de terceiros processadores
- [ ] Explica transferência internacional (EUA) com SCCs
- [ ] Descreve todos os direitos dos titulares (Art. 18)
- [ ] Política de retenção especificada (30d chats, 90d planos)
- [ ] Data de vigência e histórico de versões
- [ ] Link no footer de todas as telas do app

### Termos de Uso

- [ ] Documento criado e aprovado
- [ ] Publicado em URL acessível
- [ ] Disclaimer médico destacado
- [ ] Limitações de responsabilidade claras
- [ ] Jurisdição: Brasil
- [ ] Link no footer do app

### Termo de Consentimento

- [ ] Documento específico para dados sensíveis
- [ ] Linguagem clara e simples
- [ ] Checkboxes separados implementados
- [ ] Versão versionada (ex: v1.0)

---

## ✅ CONSENTIMENTO

### Tela de Consentimento (ConsentScreen.tsx)

- [ ] Implementada e funcional
- [ ] Exibida ANTES do onboarding
- [ ] Scroll obrigatório (botão só ativa após scroll completo)
- [ ] 4 checkboxes separados:
  - [ ] Dados cadastrais básicos (OBRIGATÓRIO)
  - [ ] Dados sensíveis de saúde (OBRIGATÓRIO para uso completo)
  - [ ] Compartilhamento com IAs internacionais (OPCIONAL)
  - [ ] Comunicações e notificações (OPCIONAL)
- [ ] Links inline para Política Completa e Termos
- [ ] Botão "Continuar sem IAs" funcional
- [ ] Versão da política exibida

### Registro de Consentimentos

- [ ] Tabela `user_consents` criada no Supabase
- [ ] Consentimentos registrados com:
  - [ ] user_id
  - [ ] consent_type
  - [ ] granted (true/false)
  - [ ] policy_version
  - [ ] timestamp
  - [ ] ip_address
- [ ] RLS habilitado na tabela

### Migração Retroativa

- [ ] Tela `RetroactiveConsentScreen.tsx` implementada
- [ ] Detecta usuários sem consentimento
- [ ] Exibe "O que mudou" comparado com versão antiga
- [ ] Prazo de 30 dias para consentir
- [ ] Conta suspensa após 30 dias sem resposta
- [ ] Dados excluídos após 60 dias

---

## 🔒 SEGURANÇA

### Criptografia

- [ ] `expo-secure-store` instalado
- [ ] `src/services/secureStorage.ts` implementado
- [ ] Todos `AsyncStorage` substituídos por `SecureStore`
- [ ] Dados sensíveis (userProfile, userId) criptografados
- [ ] Migração de dados antigos concluída

### Logging Seguro

- [ ] `src/utils/logger.ts` implementado
- [ ] Função `sanitize()` remove dados sensíveis
- [ ] Todos `console.log/error/warn` substituídos por `logger.x()`
- [ ] Em produção: logs mínimos (sem dados pessoais)
- [ ] (Opcional) Integração com Sentry configurada

### Credenciais

- [ ] `.env.local` removido do repositório
- [ ] `.env.local` adicionado ao `.gitignore`
- [ ] Secrets configurados no Expo EAS (apenas valores públicos):
  - [ ] EXPO_PUBLIC_SUPABASE_URL
  - [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] Chaves de IA configuradas em `supabase/functions/.env`:
  - [ ] CLAUDE_API_KEY
  - [ ] OPENAI_API_KEY
  - [ ] GEMINI_API_KEY
  - [ ] PERPLEXITY_API_KEY (se aplicável)
- [ ] Validação de credenciais em Edge Functions (`Deno.env.get`)
- [ ] Erro claro se credencial faltando

### Links de Privacidade

- [ ] Componente `PrivacyFooter.tsx` criado
- [ ] Footer adicionado em:
  - [ ] OnboardingScreen
  - [ ] HomeScreen
  - [ ] ProfileScreen
  - [ ] ConsentScreen
- [ ] Links funcionais:
  - [ ] Política de Privacidade
  - [ ] Termos de Uso
  - [ ] mailto: dpo@nossa-maternidade.com.br

---

## 🔑 AUTENTICAÇÃO

### Email Real (não temporário)

- [ ] Email temporário `${Date.now()}@temp.com` REMOVIDO
- [ ] Opção 1: Magic Link (Supabase OTP) implementado OU
- [ ] Opção 2: Email + Senha com validação (mín 8 chars)
- [ ] Tela de verificação de email
- [ ] Opção "Continuar sem conta" com funcionalidades limitadas
- [ ] Migração de contas temporárias antigas (se houver)

---

## 👤 DIREITOS DOS TITULARES

### Tela "Meus Dados" (MyDataScreen.tsx)

- [ ] Implementada e acessível via Perfil
- [ ] Exibe TODOS os dados:
  - [ ] Dados cadastrais (nome, email, tipo, semana)
  - [ ] Histórico de chat (últimas 50 mensagens, com "Ver todas")
  - [ ] Planos diários (últimos 30 dias)
  - [ ] Consentimentos concedidos (com datas)
  - [ ] Logs de acesso (últimos 10)
- [ ] Botões de ação:
  - [ ] "Exportar Meus Dados (JSON)"
  - [ ] "Editar Dados"
  - [ ] "Solicitar Exclusão Total"

### Portabilidade (Exportação)

- [ ] `src/services/dataExport.ts` implementado
- [ ] Função `exportUserData()` retorna JSON completo
- [ ] JSON inclui: profile, chats, plans, consents, audit_logs
- [ ] Download via `Share.open()` ou similar
- [ ] Formato legível e estruturado

### Exclusão Completa

- [ ] `src/services/dataSubjectRights.ts` implementado
- [ ] Função `requestDataDeletion()` implementada
- [ ] Período de carência: 7 dias
- [ ] Email de confirmação enviado
- [ ] Link para cancelar exclusão funcional
- [ ] Cron job (Edge Function) deleta após 7 dias:
  - [ ] user_profiles
  - [ ] chat_messages
  - [ ] daily_plans
  - [ ] user_consents
  - [ ] audit_logs
  - [ ] auth.users
- [ ] Notificação a terceiros (Anthropic, OpenAI)
- [ ] Email de confirmação após exclusão

### Correção de Dados

- [ ] UI de edição no ProfileScreen
- [ ] Validação de inputs
- [ ] Atualização em tempo real
- [ ] Histórico de alterações (opcional, mas recomendado)

---

## 🌍 TRANSFERÊNCIA INTERNACIONAL

### Data Processing Agreements (DPAs)

- [ ] DPA com Anthropic assinado
- [ ] DPA com OpenAI assinado
- [ ] DPA com Supabase assinado
- [ ] DPA com Stripe assinado (se usar pagamentos)
- [ ] Cláusulas Contratuais Padrão (SCCs) incluídas em todos
- [ ] Documentos arquivados em `docs/legal/contratos-processadores/`

### Pseudonimização

- [ ] `src/utils/dataPseudonymization.ts` implementado
- [ ] Função `pseudonymizeForAI()` implementada
- [ ] Remove: nome, email, ID real, semana exata, nome do bebê
- [ ] Mantém: tipo (gestante/mãe), trimestre (1/2/3), interesses genéricos
- [ ] Session ID gerado (hash único)
- [ ] Aplicado em:
  - [ ] `ChatScreen.tsx`
  - [ ] `DailyPlanScreen.tsx`
  - [ ] `contentGenerator.ts`
- [ ] Função `forgetSession()` deleta mapeamento após uso

### Opt-out para IAs Internacionais

- [ ] Checkbox na ConsentScreen: "Permitir IAs avançadas (EUA)"
- [ ] Se negado:
  - [ ] Chat desabilitado OU usa IA brasileira/local
  - [ ] Planos diários usam templates genéricos
  - [ ] Mensagem clara: "Para habilitar IAs, vá em Configurações"
- [ ] Preferência armazenada em `user_profiles.allow_international_ai`

---

## 🏛️ GOVERNANÇA

### Encarregado de Dados (DPO)

- [ ] DPO designado (pessoa física ou terceirizado)
- [ ] Email criado: dpo@nossa-maternidade.com.br
- [ ] Contato publicado na Política de Privacidade
- [ ] Link no app: Perfil > Ajuda > "Falar com DPO"
- [ ] DPO responde em até 48h

### Registro de Atividades de Tratamento

- [ ] Documento `docs/governanca/registro-atividades-tratamento.xlsx` criado
- [ ] Listadas TODAS as operações:
  - [ ] Cadastro de usuário
  - [ ] Coleta de dados de saúde
  - [ ] Chat com IA
  - [ ] Geração de planos
  - [ ] Logs de auditoria
- [ ] Cada operação com: finalidade, base legal, dados, armazenamento, retenção, terceiros
- [ ] Atualizado mensalmente

### Relatório de Impacto (RIPD)

- [ ] Documento `docs/governanca/ripd-nossa-maternidade.pdf` elaborado
- [ ] Contém:
  - [ ] Descrição do tratamento
  - [ ] Necessidade e proporcionalidade
  - [ ] Riscos identificados
  - [ ] Medidas mitigadoras
  - [ ] Conclusão (riscos aceitáveis)
- [ ] Aprovado por DPO externo independente
- [ ] Revisado anualmente

---

## 📊 AUDITORIA

### Tabela de Auditoria

- [ ] `supabase/migrations/004_audit_logs.sql` executado
- [ ] Tabela `audit_logs` criada
- [ ] Campos: user_id, action, resource, resource_id, timestamp, ip_address, user_agent, metadata
- [ ] Índices criados (performance)
- [ ] RLS habilitado

### Logging de Acessos

- [ ] `src/services/auditLogger.ts` implementado
- [ ] Registra:
  - [ ] Login/logout
  - [ ] Visualização de chat
  - [ ] Geração de plano diário
  - [ ] Exportação de dados
  - [ ] Solicitação de exclusão
  - [ ] Alteração de dados
- [ ] Logs exibidos em MyDataScreen
- [ ] Retenção: 5 anos

### Alertas de Segurança

- [ ] `src/services/securityAlerts.ts` implementado
- [ ] Alertas para:
  - [ ] Múltiplas tentativas de login (>5 em 10min)
  - [ ] Acesso cross-user (violação RLS)
  - [ ] Backup falhou
  - [ ] API key comprometida
- [ ] Integração com Slack ou email
- [ ] Tabela `security_alerts` no banco

---

## 🗄️ RETENÇÃO E ELIMINAÇÃO

### Política de Retenção

- [ ] `supabase/migrations/005_retention_policy.sql` executado
- [ ] Funções criadas:
  - [ ] `delete_old_chats()` - 30 dias
  - [ ] `delete_old_plans()` - 90 dias
  - [ ] `mark_inactive_accounts()` - 2 anos
  - [ ] `notify_inactive_deletion()` - 30 dias antes
  - [ ] `delete_inactive_accounts()` - após notificação
- [ ] Cron jobs configurados (pg_cron):
  - [ ] Diariamente às 02:00 - deletar chats
  - [ ] Diariamente às 02:00 - deletar planos
  - [ ] Diariamente às 03:00 - marcar inativos
  - [ ] Diariamente às 04:00 - notificar inativos
  - [ ] Diariamente às 05:00 - deletar inativos
- [ ] Política documentada na Política de Privacidade

### Anonimização em Massa

- [ ] Script `scripts/anonymize-inactive-users.sql` criado
- [ ] Função `anonymize_user()` implementada
- [ ] Roda mensalmente (cron)
- [ ] Anonimiza usuários inativos há 1+ ano

### Atualização de Atividade

- [ ] Campo `last_activity_at` em `user_profiles`
- [ ] Middleware `src/middleware/activityTracker.ts`
- [ ] Atualiza em: login, chat, gerar plano, qualquer interação

---

## 🚨 PLANO DE RESPOSTA A INCIDENTES

### Documentação

- [ ] `docs/governanca/plano-resposta-incidentes.md` criado
- [ ] Contém:
  - [ ] Definição de incidente
  - [ ] Classificação de severidade
  - [ ] Equipe de resposta (DPO, CTO, Advogado, CEO)
  - [ ] Fluxo de resposta (4 fases)
  - [ ] Templates de notificação ANPD e usuárias
  - [ ] Contatos de emergência
  - [ ] Checklist de incidente
- [ ] Revisado anualmente

### Testes

- [ ] Simulação tabletop realizada
- [ ] Equipe treinada no plano
- [ ] Identificados gaps e corrigidos

---

## 🛡️ SEGURANÇA DE INFRAESTRUTURA

### Backups

- [ ] Supabase Point-in-Time Recovery (PITR) habilitado
- [ ] Backups diários automáticos
- [ ] Criptografia AES-256 em repouso
- [ ] Teste de restauração mensal documentado

### Row Level Security (RLS)

- [ ] RLS habilitado em TODAS as tabelas:
  - [ ] user_profiles
  - [ ] chat_messages
  - [ ] daily_plans
  - [ ] user_consents
  - [ ] audit_logs
- [ ] Políticas testadas (usuário A não acessa dados de B)
- [ ] Auditoria por terceiro realizada
- [ ] Relatório de auditoria arquivado

### Rate Limiting

- [ ] `src/middleware/rateLimit.ts` implementado
- [ ] Limites configurados:
  - [ ] Chat: 10 mensagens/minuto
  - [ ] Plano diário: 3 gerações/dia
  - [ ] Login: 5 tentativas/10 minutos
- [ ] Aplicado nas rotas corretas

### Segregação de Ambientes

- [ ] Ambientes separados:
  - [ ] Produção (dados reais)
  - [ ] Staging (dados anonimizados)
  - [ ] Desenvolvimento (dados sintéticos)
- [ ] Credenciais diferentes por ambiente
- [ ] NUNCA usar dados reais em dev/staging

---

## ⚕️ DISCLAIMERS MÉDICOS

### Termos de Uso

- [ ] Seção "AVISO MÉDICO IMPORTANTE" adicionada
- [ ] Explica que app NÃO substitui médico
- [ ] Lista o que o app É e NÃO É
- [ ] Obrigatoriedade de pré-natal
- [ ] Orientações para emergências (192 SAMU)
- [ ] Limitação de responsabilidade

### HomeScreen

- [ ] Card de disclaimer visível
- [ ] Ícone de alerta
- [ ] Texto: "Este app é informativo. Em caso de emergência, ligue 192."
- [ ] Link "Leia mais" → MedicalDisclaimerScreen

### MedicalDisclaimerScreen.tsx

- [ ] Tela criada
- [ ] Texto completo dos disclaimers
- [ ] Botão "Ligue 192 (SAMU)" funcional (Linking.openURL('tel:192'))
- [ ] Botão "Entendi"

### Integração com Canais Oficiais

- [ ] Botões na HomeScreen:
  - [ ] 192 - SAMU (Emergências) → tel:192
  - [ ] 136 - Disque Saúde → tel:136
  - [ ] 180 - Disque Denúncia Violência → tel:180
- [ ] Todos funcionais

---

## 🧪 TESTES DE CONFORMIDADE

### Teste com Usuárias Reais - Consentimento

- [ ] 10 usuárias beta testaram fluxo
- [ ] Perguntas respondidas:
  1. Entendeu quais dados são coletados? (>80% sim)
  2. Ficou claro que dados vão para EUA? (>80% sim)
  3. Se sentiu pressionada a aceitar? (>80% não)
  4. Conseguiu ler Política antes de aceitar? (>80% sim)
  5. Entendeu diferença entre consentimentos? (>80% sim)
- [ ] Feedback incorporado
- [ ] Critério de sucesso atingido

### Teste de Exercício de Direitos

- [ ] 5 usuárias testaram:
  - [ ] Solicitar exclusão → Email recebido em <24h ✅
  - [ ] Exportar dados → JSON completo e legível ✅
  - [ ] Corrigir dados → Atualização imediata ✅
  - [ ] Revogar consentimento IA → Chat desabilitado ✅
- [ ] 100% de sucesso

### Teste de Estresse - Auditoria

- [ ] Simuladas 1.000 ações simultâneas
- [ ] Todos os logs registrados corretamente
- [ ] Latência <100ms
- [ ] Sem perda de dados

### Revisão por Escritório Externo

- [ ] Escritório especializado contratado
- [ ] Escopo: documentação, RIPD, fluxos, testes
- [ ] Relatório de auditoria recebido
- [ ] Certificado de Conformidade emitido (se aprovado)
- [ ] Correções sugeridas implementadas

---

## 🎯 OPCIONAL (FASE 4)

### Segurança Avançada

- [ ] Autenticação 2FA implementada (opcional no perfil)
- [ ] Certificado pinning (SSL) configurado
- [ ] Web Application Firewall (WAF) ativo (Cloudflare/AWS)

### Transparência

- [ ] Página pública de transparência criada
- [ ] Estatísticas de privacidade publicadas
- [ ] Dashboard de compliance para admin
- [ ] Relatório de Transparência trimestral

### Privacy by Design

- [ ] IA brasileira/europeia como fallback (Maritaca, Mistral)
- [ ] Minimização de dados implementada
- [ ] Arquitetura redesenhada com privacidade nativa

---

## ✅ APROVAÇÃO FINAL

### Stakeholders

- [ ] DPO aprovou toda a documentação
- [ ] Advogado LGPD aprovou Política e Termos
- [ ] CTO aprovou implementação técnica
- [ ] CEO aprovou investimento e prazos
- [ ] Nathália Valente (stakeholder) aprovou lançamento

### Última Verificação

- [ ] Todos os itens deste checklist marcados ✅
- [ ] Score de conformidade estimado: >65/100
- [ ] Nenhuma violação crítica pendente
- [ ] Equipe treinada sobre LGPD e processos
- [ ] Canais de suporte preparados para dúvidas

---

## 🚀 LANÇAMENTO

Data prevista: **_/_**/**\_**

Responsável: \***\*\*\*\*\***\_\***\*\*\*\*\***

Aprovado por DPO: [ ] Sim [ ] Não

Observações:

---

---

---

---

**⚠️ IMPORTANTE**: Se qualquer item NÃO estiver marcado, NÃO LANCE. Um único gap pode resultar em multa de R$ 50 milhões ou processo judicial.

**Próxima revisão deste checklist**: Após 90 dias do lançamento (ou quando houver alteração na LGPD).

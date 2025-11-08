# Sistema de Métricas e Qualidade NAT-IA

Sistema completo de rastreamento, análise e otimização de métricas para a NAT-IA.

## Índice

- [Visão Geral](#visão-geral)
- [Métricas Rastreadas](#métricas-rastreadas)
- [Estrutura de Tabelas](#estrutura-de-tabelas)
- [Como Usar](#como-usar)
- [Dashboard Admin](#dashboard-admin)
- [Alertas](#alertas)
- [A/B Testing](#ab-testing)
- [Custos Estimados](#custos-estimados)
- [Privacidade e Segurança](#privacidade-e-segurança)
- [Retenção de Dados](#retenção-de-dados)

## Visão Geral

O sistema de métricas NAT-IA fornece visibilidade completa sobre:

- **Qualidade**: Utilidade, Deflexão, CSAT, Conversão
- **Performance**: Latência, Taxa de Erro, Disponibilidade
- **Segurança**: Detecção de Riscos, Precision/Recall
- **Uso**: Temas, Sentimentos, Horários de Pico
- **Custos**: Por modelo, por usuária, otimizações

### Princípios

1. **Privacidade First**: Todas as métricas são anônimas (sem PII)
2. **Real-time**: Métricas atualizadas em tempo real
3. **Acionável**: Alertas automáticos para problemas
4. **Data-Driven**: Decisões baseadas em dados, não intuição

## Métricas Rastreadas

### 1. Quality Metrics (Qualidade)

#### 1.1 Utilidade (Thumbs Up/Down)

- **Meta**: ≥85% thumbs up
- **Rastreamento**: `trackUtilidade(message_id, session_id, 'up'|'down')`
- **Uso**:

```typescript
import { trackUtilidade } from '@/services/metrics';

await trackUtilidade(
  message.id,
  session.id,
  'up', // ou 'down'
  'Resposta muito útil!' // feedback opcional
);
```

#### 1.2 Deflexão (Resolvido sem Humano)

- **Meta**: ≥60%
- **Rastreamento**: `trackDeflexao(session_id, resolvido, tempo_min)`
- **Uso**:

```typescript
await trackDeflexao(
  session.id,
  true, // resolvido sem humano
  15, // tempo de resolução em minutos
  0 // tentativas de transferência
);
```

#### 1.3 CSAT (Customer Satisfaction)

- **Meta**: ≥4.5/5.0
- **Rastreamento**: `trackAcolhimento(session_id, csat, nps?, comentario?)`
- **Uso**:

```typescript
await trackAcolhimento(
  session.id,
  5, // 1-5
  10, // NPS 0-10 (opcional)
  'Excelente atendimento!' // opcional
);
```

#### 1.4 Conversão (Ações Completadas)

- **Meta**: ≥35%
- **Rastreamento**: `trackConversao(session_id, action_type, completed)`
- **Uso**:

```typescript
await trackConversao(
  session.id,
  'marcar_consulta',
  true // completou a ação
);
```

### 2. Performance Metrics

#### 2.1 Latência

- **SLO**: p50 < 2.5s, p95 < 5s
- **Rastreamento**: `trackLatencia(endpoint, latency_ms)`
- **Uso**:

```typescript
const start = Date.now();
const response = await chatWithNATIA(message, context);
const latency = Date.now() - start;

await trackLatencia('nathia-chat', latency);
```

#### 2.2 Tokens e Custos

- **Rastreamento**: `trackTokens(model, input_tokens, output_tokens, session_id)`
- **Uso**:

```typescript
await trackTokens(
  'gemini-2.0-flash',
  500, // input tokens
  800, // output tokens
  session.id
);
```

#### 2.3 Erros

- **SLO**: < 1% taxa de erro
- **Rastreamento**: `trackError(endpoint, type, message, stack?)`
- **Uso**:

```typescript
try {
  await chatWithNATIA(message, context);
} catch (error) {
  await trackError('nathia-chat', error.name, error.message, error.stack);
}
```

### 3. Safety Metrics (Segurança)

#### 3.1 Detecção de Riscos

- **Rastreamento**: `trackRiscoDetectado(session_id, nivel, sinais, acao)`
- **Uso**:

```typescript
await trackRiscoDetectado(
  session.id,
  'alto', // baixo, medio, alto, critico
  ['sangramento', 'dor_forte'],
  'encaminhamento_urgente'
);
```

#### 3.2 Moderação Manual

- **Rastreamento**: `trackModeracaoManual(message_id, decisao, tempo_min)`
- **Uso**:

```typescript
await trackModeracaoManual(
  message.id,
  session.id,
  'aprovado', // ou 'bloqueado', 'escalado'
  moderador.id,
  5 // tempo de resposta em minutos
);
```

#### 3.3 Eventos SOS

- **Rastreamento**: `trackSOS(user_id, tipo, urgencia, fase, recurso)`
- **Uso**:

```typescript
await trackSOS(user.id, 'saude_fisica', 'emergencia', 'gestante', 'samu');
```

### 4. Usage Analytics

#### 4.1 Temas

- **Rastreamento**: `trackTema(session_id, tema, categoria)`
- **Uso**:

```typescript
await trackTema(
  session.id,
  'dor_de_cabeça',
  'saude' // saude, emocional, pratico, informacao, emergencia
);
```

#### 4.2 Sentimento

- **Rastreamento**: `trackSentimento(session_id, score)`
- **Uso**:

```typescript
// Score: -1 (muito negativo) a 1 (muito positivo)
await trackSentimento(session.id, 0.7);
```

## Estrutura de Tabelas

### Tabelas Principais

```sql
-- Quality
nathia_quality_feedback
nathia_deflection_metrics
nathia_acolhimento_metrics
nathia_conversao_metrics

-- Performance
nathia_performance_logs
nathia_token_usage

-- Safety
nathia_safety_events
nathia_moderation_events
nathia_sos_events

-- Usage
nathia_temas
nathia_sentimentos

-- A/B Testing
nathia_experiments
nathia_experiment_assignments
nathia_experiment_metrics

-- Alerts
nathia_alerts

-- Agregado
nathia_metrics (agregado diário)
```

### Instalação

```bash
# Executar migration
psql $DATABASE_URL -f supabase/migrations/20250111_nathia_metrics_schema.sql

# Ou via Supabase CLI
supabase db push
```

## Como Usar

### 1. Importar Serviços

```typescript
import {
  qualityMetrics,
  performanceMetrics,
  safetyMetrics,
  usageAnalytics,
  costTracker,
  alerts,
  abTesting,
} from '@/services/metrics';
```

### 2. Rastrear Métricas em Tempo Real

```typescript
// Após resposta da NAT-IA
async function handleNATIAResponse(message, response, session) {
  // 1. Performance
  await performanceMetrics.trackLatencia('nathia-chat', latency);
  await performanceMetrics.trackTokens('gemini-2.0-flash', inputTokens, outputTokens, session.id);

  // 2. Tema e Sentimento
  const tema = extrairTema(message);
  await usageAnalytics.trackTema(session.id, tema.tema, tema.categoria);

  const sentimento = analisarSentimento(response);
  await usageAnalytics.trackSentimento(session.id, sentimento);

  // 3. Detecção de Risco (se aplicável)
  const risco = detectarRisco(message);
  if (risco.detectado) {
    await safetyMetrics.trackRiscoDetectado(session.id, risco.nivel, risco.sinais, risco.acao);
  }
}
```

### 3. Consultar Métricas

```typescript
// Todas as métricas consolidadas
const metrics = await getAllMetrics('7d');

// Dashboard resumido
const dashboard = await getDashboardMetrics();

// Saúde do sistema
const health = await getSystemHealth();
// { status: 'healthy' | 'degraded' | 'critical', score: 95, issues: [] }
```

### 4. Custos

```typescript
import { costTracker } from '@/services/metrics';

// Métricas de custo
const custos = await costTracker.getCostMetrics('30d');
// {
//   custo_diario_usd: 1.50,
//   custo_mensal_estimado_usd: 60,
//   custo_por_usuario_usd: 0.05,
//   custo_por_mensagem_usd: 0.002
// }

// Estimativa mensal
const estimativa = await costTracker.estimarCustoMensal();
// {
//   estimativa_conservadora: 80,
//   estimativa_realista: 60,
//   estimativa_otimista: 45
// }

// Sugestões de otimização
const otimizacoes = await costTracker.sugerirOtimizacoes();
// [
//   {
//     recomendacao: 'Implementar cache de contexto',
//     economia_estimada_usd_mes: 15,
//     impacto_qualidade: 'nenhum',
//     implementacao: 'media'
//   }
// ]
```

## Dashboard Admin

### Acesso

Apenas usuários com `role: 'admin'` podem acessar:

```
/admin/nathia-metrics
```

### Visualizações

1. **Visão Geral**: KPIs principais (utilidade, deflexão, CSAT, conversão)
2. **Performance**: Gráficos de latência, taxa de erro
3. **Segurança**: Eventos de risco, precision/recall
4. **Uso**: Temas, sentimentos, horários de pico
5. **Custos**: Breakdown por modelo, otimizações
6. **Alertas**: Lista de alertas ativos

## Alertas

### Configuração

```typescript
// Configurar webhooks e destinatários
process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/...';
process.env.ALERT_EMAIL_RECIPIENTS = 'team@nossapaternidade.com';
```

### Tipos de Alertas

1. **Queda de Qualidade**: Quando métrica cai abaixo da meta
2. **Pico de Latência**: Quando p95 > 5s
3. **Pico de Custo**: Quando custo diário excede threshold
4. **Risco Crítico**: Quando risco crítico é detectado
5. **Taxa de Erro Alta**: Quando taxa > 1%

### Monitoramento Contínuo

```bash
# Executar monitores (cron job)
node --loader tsx scripts/run-monitors.ts

# Cron: a cada 5 minutos
*/5 * * * * /usr/bin/node /app/scripts/run-monitors.ts
```

## A/B Testing

### Criar Experimento

```typescript
import { abTesting } from '@/services/metrics';

const expId = await abTesting.createExperiment(
  'prompt-v2-vs-v1',
  'Testar novo prompt mais conciso',
  ['control', 'variant'],
  'utilidade', // métrica alvo
  500 // tamanho da amostra por variante
);

await abTesting.startExperiment(expId);
```

### Atribuir Variante

```typescript
const variant = await abTesting.assignVariant(user.id, 'prompt-v2-vs-v1');

if (variant === 'variant') {
  // Usar prompt novo
} else {
  // Usar prompt original
}
```

### Rastrear Métrica

```typescript
await abTesting.trackExperimentMetric(expId, variant, 'utilidade', thumbsUp ? 1 : 0);
```

### Analisar Resultados

```typescript
const results = await abTesting.getExperimentResults(expId);
const significance = await abTesting.calculateSignificance(expId, 'utilidade');

// {
//   control_mean: 0.82,
//   variant_mean: 0.87,
//   improvement_percent: 6.1,
//   p_value: 0.01,
//   is_significant: true,
//   confidence_level: 99
// }

const report = await abTesting.generateExperimentReport(expId);
// { recommendation: '✅ Implementar variante! Melhoria de 6.1% (confiança: 99%)' }
```

## Custos Estimados

### Gemini 2.0 Flash (Modelo Padrão)

- **Input**: $0.10/M tokens ($0.0001/1K)
- **Output**: $0.30/M tokens ($0.0003/1K)
- **Cache Hit**: 50% desconto no input

### Estimativa Mensal

Baseado em **1000 usuárias ativas/mês** e **5 mensagens/usuária/mês**:

| Cenário          | Mensagens/Mês | Tokens/Msg | Custo Gemini | Supabase | Total   |
| ---------------- | ------------- | ---------- | ------------ | -------- | ------- |
| Conservador      | 7,500         | 2000       | $9.00        | $25      | **$44** |
| Realista         | 5,000         | 1500       | $4.50        | $25      | **$35** |
| Otimista (cache) | 4,000         | 1200       | $2.10        | $25      | **$32** |

### Breakdown

- **Gemini API**: $2-9/mês
- **Supabase Pro**: $25/mês (fixo)
- **Outros (Sentry, etc)**: $10/mês
- **Total**: $35-45/mês

### Otimizações Possíveis

1. **Context Caching**: -50% custo input
2. **Prompt Optimization**: -20% tokens
3. **Rate Limiting**: -10% custos de spam
4. **Streaming**: -5% timeouts

**Economia Total Potencial**: **-30% (~$12/mês)**

## Privacidade e Segurança

### Dados Anônimos

✅ **Armazenamos**:

- Métricas agregadas (quantidades, percentuais)
- Temas genéricos (não mensagens completas)
- Sentimentos (scores numéricos)
- User ID hasheado (SHA-256)

❌ **NÃO armazenamos**:

- Conteúdo de mensagens
- PII (nome, email, telefone)
- User ID em texto plano (apenas hash)
- Dados de saúde específicos

### RLS (Row Level Security)

Todas as tabelas têm RLS habilitado:

- **service_role**: Pode escrever métricas
- **admins**: Podem ler métricas
- **usuários comuns**: Sem acesso

### Compliance

- **LGPD**: Dados anônimos, sem PII
- **HIPAA**: Não armazenamos PHI
- **GDPR**: Right to erasure (dados hasheados)

## Retenção de Dados

### Detalhado (90 dias)

- Métricas individuais
- Logs de performance
- Eventos de segurança

### Agregado (2 anos)

- Métricas diárias consolidadas
- Tendências históricas
- Relatórios mensais

### Limpeza Automática

```sql
-- Executar semanalmente (cron)
SELECT cleanup_old_metrics();
```

## Relatórios Semanais

### Geração Automática

```bash
# Executar toda segunda-feira às 9h
0 9 * * MON /usr/bin/node /app/scripts/generate-weekly-report.ts
```

### Conteúdo

- Resumo executivo
- Métricas de qualidade (vs metas)
- Performance (vs SLOs)
- Segurança (riscos, precision/recall)
- Uso (temas, sentimentos, retenção)
- Custos (breakdown, otimizações)
- Insights e recomendações

### Destinatários

- Product Manager
- CTO
- Equipe de Qualidade
- Stakeholders

## Backfill de Dados Históricos

### Migrar Dados Antigos

```bash
# Dry run (sem salvar)
npm run metrics:backfill -- --days=30 --dry-run

# Executar backfill
npm run metrics:backfill -- --days=30

# Verbose
npm run metrics:backfill -- --days=30 --verbose
```

### O que é migrado

1. Extração de temas (baseado em keywords)
2. Cálculo de sentimentos
3. Estimativa de tokens e custos
4. Agregação diária

## Troubleshooting

### Métricas não aparecem no dashboard

1. Verificar se migration foi executada:

```sql
SELECT * FROM nathia_metrics LIMIT 1;
```

2. Verificar RLS policies:

```sql
SELECT * FROM pg_policies WHERE tablename LIKE 'nathia_%';
```

3. Verificar se usuário é admin:

```sql
SELECT role FROM user_profiles WHERE id = 'user-id';
```

### Alertas não disparam

1. Verificar configuração:

```bash
echo $SLACK_WEBHOOK_URL
echo $ALERT_EMAIL_RECIPIENTS
```

2. Testar manualmente:

```typescript
await alerts.alertIfQualityDrop('utilidade', 70, 85);
```

### Custos divergentes

1. Verificar tokens registrados:

```sql
SELECT model, SUM(input_tokens + output_tokens) as total_tokens, SUM(cost_usd) as total_cost
FROM nathia_token_usage
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY model;
```

2. Comparar com logs do Gemini API

## Recursos Adicionais

- [Documentação Gemini API](https://ai.google.dev/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

## Suporte

Para dúvidas ou problemas:

- **Email**: tech@nossapaternidade.com
- **Slack**: #nathia-metrics
- **Issues**: GitHub Repository

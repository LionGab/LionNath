# Deployment Guide - NAT-IA Edge Functions

Guia completo para deploy das Edge Functions do sistema NAT-IA.

## Pré-requisitos

1. **Conta Supabase** (https://supabase.com)
2. **Supabase CLI** instalado:

   ```bash
   npm install -g supabase
   ```

3. **Google AI Studio API Key** (https://makersuite.google.com/app/apikey)
   - Criar projeto no Google AI Studio
   - Gerar API Key para Gemini 2.0 Flash

4. **Git** configurado

---

## Passo 1: Configurar Projeto Supabase

### 1.1 Criar novo projeto

- Acesse https://supabase.com/dashboard
- Clique em "New Project"
- Escolha organização e região (preferencialmente `sa-east-1` para Brasil)
- Defina nome, senha do banco e região

### 1.2 Anotar credenciais

Você precisará de:

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon Key**: Chave pública (Settings > API)
- **Service Role Key**: Chave de serviço (Settings > API) ⚠️ MANTENHA SECRETA

---

## Passo 2: Configurar Banco de Dados

### 2.1 Executar migrations

Via Dashboard:

1. Vá para SQL Editor
2. Cole o conteúdo de `supabase/migrations/20250115_nathia_tables.sql`
3. Execute (Run)

Via CLI:

```bash
supabase db push
```

### 2.2 Verificar tabelas

```sql
-- Verificar se tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'nathia%' OR table_name = 'chat_messages';
```

Deve retornar:

- chat_messages
- nathia_analytics
- nathia_curadoria_cache
- nathia_moderacao_log
- nathia_onboarding_results

---

## Passo 3: Configurar Secrets

### 3.1 Fazer login no Supabase CLI

```bash
supabase login
```

### 3.2 Linkar projeto local

```bash
supabase link --project-ref your-project-ref
```

### 3.3 Configurar secrets

```bash
# AI API Keys (Edge Functions only)
supabase secrets set GEMINI_API_KEY=your-gemini-api-key           # Google AI Studio
supabase secrets set CLAUDE_API_KEY=your-claude-api-key           # Anthropic
supabase secrets set OPENAI_API_KEY=your-openai-api-key           # OpenAI
supabase secrets set PERPLEXITY_API_KEY=your-perplexity-api-key   # Perplexity AI

# Supabase URL e Keys (já configurados automaticamente)
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**📚 Para mais detalhes sobre secrets**, veja: [docs/SECRETS.md](../docs/SECRETS.md)

### 3.4 Verificar secrets

```bash
supabase secrets list
```

---

## Passo 4: Deploy das Edge Functions

### 4.1 Deploy todas as funções

```bash
cd supabase/functions
supabase functions deploy
```

### 4.2 Deploy função específica

```bash
supabase functions deploy nathia-chat
supabase functions deploy nathia-curadoria
supabase functions deploy nathia-moderacao
supabase functions deploy nathia-onboarding
supabase functions deploy nathia-recs
```

### 4.3 Verificar deploy

```bash
supabase functions list
```

Deve mostrar:

- nathia-chat (deployed)
- nathia-curadoria (deployed)
- nathia-moderacao (deployed)
- nathia-onboarding (deployed)
- nathia-recs (deployed)

---

## Passo 5: Testar Edge Functions

### 5.1 Testar via curl

**nathia-chat:**

```bash
curl -X POST https://xxxxx.supabase.co/functions/v1/nathia-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "user_id": "test-user-123",
    "message": "Estou com muito enjoo"
  }'
```

**nathia-curadoria:**

```bash
curl -X POST https://xxxxx.supabase.co/functions/v1/nathia-curadoria \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "user_id": "test-user-123",
    "texto": "Texto longo...",
    "tipo": "resumo"
  }'
```

### 5.2 Usar script de teste

```bash
# Configurar variáveis
export SUPABASE_URL=https://xxxxx.supabase.co
export SUPABASE_ANON_KEY=your-anon-key

# Executar testes
chmod +x test-functions.sh
./test-functions.sh
```

---

## Passo 6: Monitoramento

### 6.1 Ver logs

```bash
# Logs de uma função
supabase functions logs nathia-chat

# Follow logs em tempo real
supabase functions logs nathia-chat --follow

# Últimas 100 linhas
supabase functions logs nathia-chat --tail 100
```

### 6.2 Métricas via SQL

```sql
-- Requisições nas últimas 24h
SELECT
  event_type,
  COUNT(*) as total,
  AVG((metadata->>'response_time_ms')::numeric) as avg_time_ms
FROM nathia_analytics
WHERE created_at > now() - interval '24 hours'
GROUP BY event_type;

-- Taxa de erro
SELECT
  event_type,
  COUNT(*) FILTER (WHERE metadata->>'error' IS NOT NULL) * 100.0 / COUNT(*) as error_rate
FROM nathia_analytics
WHERE created_at > now() - interval '24 hours'
GROUP BY event_type;
```

### 6.3 Dashboard Supabase

- Acesse Dashboard > Edge Functions
- Veja invocações, erros e latência

---

## Passo 7: Configurar CORS (se necessário)

Se tiver problemas de CORS, adicione domínios autorizados:

1. Dashboard > Settings > API
2. Em "API Settings" > "Additional URLs"
3. Adicione seus domínios:
   - `http://localhost:3000`
   - `https://yourdomain.com`

---

## Passo 8: Integrar com Frontend

### 8.1 Instalar Supabase client

```bash
npm install @supabase/supabase-js
```

### 8.2 Configurar client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://xxxxx.supabase.co', 'your-anon-key');

// Chamar Edge Function
async function chatWithNathia(message: string) {
  const { data, error } = await supabase.functions.invoke('nathia-chat', {
    body: {
      user_id: 'user-uuid',
      message,
      context: {
        stage: 'gestante',
      },
    },
  });

  if (error) throw error;
  return data;
}
```

---

## Troubleshooting

### Erro: "Failed to fetch"

- Verificar se SUPABASE_URL está correto
- Verificar CORS settings
- Verificar se função foi deployada: `supabase functions list`

### Erro: "GEMINI_API_KEY not configured"

```bash
supabase secrets set GEMINI_API_KEY=your-key
supabase functions deploy nathia-chat # Re-deploy
```

### Erro: "Rate limit exceeded"

- Usuário excedeu limite de requisições
- Verificar `RATE_LIMITS` em `_shared/rate-limit.ts`
- Ajustar se necessário e re-deploy

### Erro: "Row Level Security policy violation"

- Verificar se RLS policies foram criadas
- Executar migration novamente
- Verificar se user_id é válido

### Logs não aparecem

```bash
# Aumentar verbosidade
supabase functions logs nathia-chat --debug
```

---

## Rollback

### Reverter função específica

```bash
# Deploy versão anterior do Git
git checkout previous-commit
supabase functions deploy nathia-chat
git checkout main
```

### Deletar função

```bash
supabase functions delete nathia-chat
```

---

## Manutenção

### Cleanup periódico

Execute mensalmente via SQL Editor:

```sql
-- Limpar dados antigos (90 dias)
SELECT cleanup_old_data(90);
```

### Atualizar Gemini API Key

```bash
supabase secrets set GEMINI_API_KEY=new-key
# Re-deploy todas as funções
supabase functions deploy
```

### Monitorar custos

1. Google AI Studio: https://console.cloud.google.com/billing
2. Supabase: Dashboard > Settings > Billing

---

## Checklist de Deploy

- [ ] Projeto Supabase criado
- [ ] Migrations executadas
- [ ] Tabelas verificadas
- [ ] Secrets configurados
- [ ] Edge Functions deployadas
- [ ] Testes executados com sucesso
- [ ] Logs verificados
- [ ] CORS configurado (se necessário)
- [ ] Frontend integrado
- [ ] Monitoramento ativo

---

## Custos Estimados

### Supabase (Free tier)

- 500k requisições/mês de Edge Functions: **GRÁTIS**
- 500MB de banco de dados: **GRÁTIS**
- 2GB de storage: **GRÁTIS**

### Google AI (Gemini 2.0 Flash)

- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens
- **Estimativa:** $5-15/mês para 1000 usuários ativos

### Total estimado para MVP

**< $20/mês** (com free tier Supabase)

---

## Suporte

### Documentação

- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Gemini API: https://ai.google.dev/docs
- Deno Runtime: https://deno.land/manual

### Community

- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase

---

**Última atualização:** 2025-01-15
**Versão:** 1.0

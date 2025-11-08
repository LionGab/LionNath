# NAT-IA Edge Functions

Edge Functions do Supabase para o sistema NAT-IA, assistente empática para gestantes e mães.

## Funções Disponíveis

### 1. **nathia-chat** - Chat Principal

Assistente conversacional com acolhimento emocional.

**Endpoint:** `POST /nathia-chat`

**Request:**

```json
{
  "user_id": "uuid",
  "message": "Estou com muito enjoo",
  "context": {
    "stage": "gestante",
    "mood": "preocupada",
    "concerns": ["enjoo", "alimentação"]
  }
}
```

**Response:**

```json
{
  "reply": "Resposta empática...",
  "actions": ["ler_conteudo"],
  "safety": {
    "level": "safe",
    "reasons": [],
    "warning": null
  },
  "labels": {
    "mood": "preocupado",
    "topics": ["enjoo", "alimentacao"]
  },
  "recs": {
    "content": ["Enjoos na Gravidez"],
    "circles": ["Gestantes 1º Trimestre"],
    "habit": "Alimentação fracionada"
  },
  "usage": {
    "promptTokens": 450,
    "completionTokens": 180,
    "totalTokens": 630
  },
  "metadata": {
    "timestamp": "2025-01-15T10:30:00Z",
    "version": "1.0",
    "model": "gemini-2.0-flash-exp"
  }
}
```

**Rate Limit:** 20 requisições/hora por usuário

---

### 2. **nathia-curadoria** - Curadoria de Conteúdo

Simplifica e adapta conteúdo educacional.

**Endpoint:** `POST /nathia-curadoria`

**Request:**

```json
{
  "user_id": "uuid",
  "content_id": "content-123",
  "texto": "Texto longo sobre alimentação na gravidez...",
  "tipo": "resumo"
}
```

**Tipos disponíveis:**

- `resumo`: Resumo em linguagem simples (150-200 palavras)
- `5min`: Leitura rápida estruturada em seções
- `checklist`: Lista acionável com dicas

**Response (tipo: resumo):**

```json
{
  "titulo": "Alimentação Saudável na Gravidez",
  "resumo": "Durante a gravidez...",
  "pontos_principais": ["Coma pequenas porções", "Hidrate-se bem", "Evite alimentos crus"],
  "relevancia": "Por que isso importa...",
  "risco": false,
  "cached": false,
  "metadata": {
    "timestamp": "2025-01-15T10:35:00Z",
    "tipo": "resumo",
    "model": "gemini-2.0-flash-exp"
  }
}
```

**Cache:** 24 horas por content_id

**Rate Limit:** 10 requisições/hora por usuário

---

### 3. **nathia-moderacao** - Moderação Assistida

Classifica mensagens e sugere edições gentis.

**Endpoint:** `POST /nathia-moderacao`

**Request:**

```json
{
  "message_id": "msg-123",
  "texto": "Mensagem para analisar...",
  "author_context": {
    "user_id": "uuid",
    "previous_violations": 0
  }
}
```

**Response:**

```json
{
  "labels": ["ok"],
  "severity": "none",
  "sugestao": null,
  "rationale": "Mensagem positiva e acolhedora",
  "auto_approve": true,
  "metadata": {
    "timestamp": "2025-01-15T10:40:00Z",
    "model": "gemini-2.0-flash-exp"
  }
}
```

**Labels possíveis:**

- `ok`: Apropriada
- `julgamento`: Contém julgamento
- `toxidade`: Ofensiva
- `sensivel`: Tópico sensível
- `spam`: Repetitivo
- `comercial`: Promove vendas

**Severity:** `none` | `low` | `medium` | `high`

**Rate Limit:** 50 requisições/hora por usuário

---

### 4. **nathia-onboarding** - Onboarding Inteligente

Analisa respostas de onboarding e extrai perfil.

**Endpoint:** `POST /nathia-onboarding`

**Request:**

```json
{
  "user_id": "uuid",
  "respostas": [
    {
      "question": "Em que momento você está?",
      "answer": "Estou grávida de 12 semanas"
    },
    {
      "question": "Quais são suas principais preocupações?",
      "answer": "Enjoos e ansiedade sobre o parto"
    }
  ]
}
```

**Response:**

```json
{
  "stage": "gestante",
  "pregnancy_week": 12,
  "concerns": ["enjoos", "ansiedade", "parto"],
  "emotional_profile": "ansiosa",
  "starter_pack": {
    "grupos": ["Gestantes 1º Trimestre", "Preparação para Parto"],
    "conteudo": ["Enjoos na Gravidez", "Tipos de Parto"],
    "primeiro_objetivo": "Controlar enjoos matinais"
  }
}
```

**Rate Limit:** 5 requisições/dia por usuário

---

### 5. **nathia-recs** - Recomendações

Gera recomendações personalizadas baseadas em histórico.

**Endpoint:** `POST /nathia-recs`

**Request:**

```json
{
  "user_id": "uuid",
  "context": {
    "stage": "mae",
    "baby_age_months": 3
  }
}
```

**Response:**

```json
{
  "conteudo": [
    {
      "titulo": "Sono do Bebê aos 3 Meses",
      "tipo": "artigo",
      "relevancia": "Baseado em suas mensagens sobre sono"
    }
  ],
  "circulos": [
    {
      "nome": "Mães de Bebês 0-6 Meses",
      "razao": "Troca de experiências sobre rotina"
    }
  ],
  "habito": {
    "titulo": "Rotina de Sono",
    "descricao": "Estabelecer horários consistentes",
    "frequencia": "diaria"
  },
  "justificativa": "Você mencionou dificuldades com sono..."
}
```

**Rate Limit:** 30 requisições/hora por usuário

---

## Configuração e Deploy

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp supabase/functions/.env.example supabase/functions/.env
```

Preencha as variáveis:

**Supabase:**
- `SUPABASE_URL`: URL do seu projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço

**AI API Keys (Edge Functions only - não expor no app):**
- `GEMINI_API_KEY`: Google AI Studio (https://makersuite.google.com/app/apikey)
- `CLAUDE_API_KEY`: Anthropic (https://console.anthropic.com/account/keys)
- `OPENAI_API_KEY`: OpenAI (https://platform.openai.com/api-keys)
- `PERPLEXITY_API_KEY`: Perplexity AI (https://www.perplexity.ai/settings/api)

⚠️ **IMPORTANTE:** Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

📚 **Para detalhes completos sobre secrets**, veja: [docs/SECRETS.md](../../docs/SECRETS.md)

### 3. Testar Localmente

```bash
# Iniciar Supabase local
supabase start

# Servir função específica
supabase functions serve nathia-chat --env-file supabase/functions/.env.local

# Testar com curl
curl -X POST http://localhost:54321/functions/v1/nathia-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "user_id": "test-user-id",
    "message": "Estou com muito enjoo"
  }'
```

### 4. Deploy para Produção

```bash
# Login no Supabase
supabase login

# Linkar projeto local
supabase link --project-ref your-project-ref

# Configurar secrets de IA (Edge Functions only)
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase secrets set CLAUDE_API_KEY=your-claude-key
supabase secrets set OPENAI_API_KEY=your-openai-key
supabase secrets set PERPLEXITY_API_KEY=your-perplexity-key

# Configurar Supabase keys (se necessário)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key

# Verificar secrets
supabase secrets list

# Deploy todas as funções
supabase functions deploy

# OU deploy função específica
supabase functions deploy nathia-chat
```

---

## Estrutura de Arquivos

```
supabase/functions/
├── _shared/                  # Utilitários compartilhados
│   ├── gemini-client.ts      # Cliente Gemini reutilizável
│   ├── safety.ts             # Detecção de risco
│   ├── rate-limit.ts         # Rate limiting
│   └── cors.ts               # CORS headers
│
├── nathia-chat/
│   └── index.ts              # Chat principal
│
├── nathia-curadoria/
│   └── index.ts              # Curadoria de conteúdo
│
├── nathia-moderacao/
│   └── index.ts              # Moderação assistida
│
├── nathia-onboarding/
│   └── index.ts              # Onboarding inteligente
│
├── nathia-recs/
│   └── index.ts              # Recomendações
│
├── .env.example              # Exemplo de variáveis
└── README.md                 # Esta documentação
```

---

## Dependências

Todas as Edge Functions usam:

- **Deno Runtime** (built-in no Supabase)
- **@google/generative-ai** (via npm:) - Gemini 2.0 Flash
- **@supabase/supabase-js** (via jsr:) - Cliente Supabase

---

## Tabelas do Banco de Dados

Certifique-se de criar estas tabelas:

```sql
-- Chat messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  response text,
  role text,
  context_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Analytics
CREATE TABLE nathia_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Curadoria cache
CREATE TABLE nathia_curadoria_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  tipo text NOT NULL,
  resultado jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, tipo)
);

-- Moderação log
CREATE TABLE nathia_moderacao_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text NOT NULL,
  labels text[],
  severity text,
  auto_approved boolean,
  sugestao text,
  created_at timestamptz DEFAULT now()
);

-- Onboarding results
CREATE TABLE nathia_onboarding_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  respostas jsonb NOT NULL,
  resultado jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Rate limits storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('rate-limits', 'rate-limits', false);
```

---

## Monitoramento

### Logs

```bash
# Ver logs de uma função
supabase functions logs nathia-chat

# Follow logs em tempo real
supabase functions logs nathia-chat --follow
```

### Métricas

Acompanhe via `nathia_analytics`:

```sql
-- Requisições por função (últimas 24h)
SELECT
  event_type,
  COUNT(*) as total,
  AVG((metadata->>'response_time_ms')::int) as avg_time_ms
FROM nathia_analytics
WHERE created_at > now() - interval '24 hours'
GROUP BY event_type;

-- Distribuição de safety levels
SELECT
  metadata->>'safety_level' as level,
  COUNT(*) as total
FROM nathia_analytics
WHERE event_type = 'chat'
  AND created_at > now() - interval '7 days'
GROUP BY level;
```

---

## Performance Targets

- **p50 latency:** < 2.5s
- **p95 latency:** < 5s
- **Success rate:** > 99%
- **Cache hit rate (curadoria):** > 70%

---

## Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"

```bash
supabase secrets set GEMINI_API_KEY=your-key
```

### Erro: Rate limit exceeded

Ajuste limites em `_shared/rate-limit.ts` ou espere o reset.

### Erro: "Failed to fetch"

Verifique CORS headers e credenciais Supabase.

---

## Custos Estimados

### Gemini 2.0 Flash (Free tier generoso)

- **Input:** $0.075 / 1M tokens
- **Output:** $0.30 / 1M tokens
- **Estimativa:** ~$5-10/mês para 1000 usuários ativos

### Supabase Edge Functions

- **Invocações:** Grátis até 500k/mês
- **Compute:** Grátis até 400k GB-s/mês

**Total estimado:** < $15/mês para operação inicial

---

## Segurança

- RLS (Row Level Security) ativo em todas as tabelas
- Rate limiting por usuário
- Detecção automática de conteúdo sensível
- Logs sem PII (Personally Identifiable Information)
- Validação de entrada em todas as funções

---

## Suporte

Para dúvidas ou problemas:

1. Verifique logs: `supabase functions logs <nome>`
2. Revise documentação do Gemini: https://ai.google.dev/
3. Consulte docs do Supabase: https://supabase.com/docs

---

**Versão:** 1.0
**Última atualização:** 2025-01-15

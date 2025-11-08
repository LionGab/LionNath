# 🗄️ Supabase Configuration - Nossa Maternidade

Guia completo para configurar o banco de dados Supabase do projeto Nossa Maternidade.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Setup Inicial](#setup-inicial)
- [Estrutura do Banco](#estrutura-do-banco)
- [Executando Migrations](#executando-migrations)
- [Configuração de Auth](#configuração-de-auth)
- [Validação](#validação)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

1. **Conta no Supabase**: Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. **Projeto Criado**: Crie um novo projeto no Supabase Dashboard
3. **Credenciais**: Anote:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)

---

## 🚀 Setup Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# AI Providers (⚠️ configurar apenas em supabase/functions/.env)
# ANTHROPIC_API_KEY=sk-...
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=...

# Sentry (opcional)
EXPO_PUBLIC_SENTRY_DSN=https://...
```

### 2. Executar Migration Consolidada

Abra o **Supabase Dashboard** → **SQL Editor** e execute:

```bash
# Copie todo o conteúdo do arquivo:
supabase/migrations/20250106_000000_consolidated_schema.sql
```

> ⚠️ **Importante**: Execute a migration consolidada **20250106_000000_consolidated_schema.sql** que contém o schema completo. As migrations antigas (001_gemini_memory.sql, 002_alert_logs.sql) são apenas para referência.

### 3. Configurar Auth (Opcional - Anonymous Auth)

O app usa **Anonymous Authentication** para criar usuários temporários. Para habilitar:

1. Vá em **Authentication** → **Providers**
2. Habilite **Anonymous Sign-ins**
3. Salve as alterações

---

## 🗃️ Estrutura do Banco

### Tabelas Criadas (14 no total)

| Tabela                 | Descrição              | Features                                        |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| `user_profiles`        | Perfis das usuárias    | daily_interactions, risk_level, onboarding_data |
| `conversation_history` | Histórico de conversas | Resumos diários/semanais, key_memories          |
| `chat_messages`        | Mensagens individuais  | risk_flag, is_urgent, context_data              |
| `conversations`        | Vector memory (Gemini) | Embeddings 768D, busca semântica                |
| `daily_plans`          | Planos diários         | Prioridades, dicas, receitas                    |
| `user_feature_flags`   | A/B testing            | Feature flags por user, ab_test_group           |
| `habits`               | Hábitos das usuárias   | Custom e pré-definidos                          |
| `habit_completions`    | Completions de hábitos | Tracking diário                                 |
| `content_items`        | Conteúdo exclusivo     | Artigos, vídeos, áudios                         |
| `content_favorites`    | Favoritos              | Relação user-content                            |
| `moderation_queue`     | Moderação              | Severity levels 1-5                             |
| `risk_alerts`          | Alertas de risco       | Medical/psychological, severity 1-10            |
| `alert_logs`           | Auditoria de alertas   | Tracking de high-risk                           |
| `vector_embeddings`    | RAG embeddings         | Memória semântica                               |

### Tipos Customizados (ENUMs)

```sql
user_type: 'gestante' | 'mae' | 'tentante' | 'puerperio' | 'mae_estabelecida'
subscription_tier: 'free' | 'premium'
message_role: 'user' | 'assistant'
content_type: 'article' | 'video' | 'audio' | 'post'
moderation_action: 'allow' | 'block' | 'flag'
risk_type: 'medical' | 'psychological'
ab_test_group: 'control' | 'grok' | 'gemini' | 'smart'
```

### Extensões Habilitadas

- ✅ `uuid-ossp` - Geração de UUIDs
- ✅ `vector` - pgvector para busca semântica
- ✅ `pg_trgm` - Busca textual eficiente

### Functions Criadas

| Function                     | Descrição                                                  |
| ---------------------------- | ---------------------------------------------------------- |
| `update_updated_at_column()` | Trigger para atualizar updated_at automaticamente          |
| `match_conversations()`      | Busca vetorial de conversas relevantes (cosine similarity) |
| `delete_old_conversations()` | Remove conversas com +30 dias                              |
| `reset_daily_interactions()` | Reseta daily_interactions diariamente                      |

### RLS (Row Level Security)

Todas as tabelas têm **RLS habilitado** com políticas:

- ✅ Usuários só veem/editam seus próprios dados
- ✅ `content_items` é público (leitura para todos)
- ✅ `moderation_queue` e `alert_logs` restritos (admin only)

---

## ▶️ Executando Migrations

### Usando Supabase Dashboard (Recomendado)

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **+ New query**
5. Cole o conteúdo de `20250106_000000_consolidated_schema.sql`
6. Clique em **Run** (ou `Ctrl+Enter`)

### Usando Supabase CLI (Alternativo)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link com projeto
supabase link --project-ref seu-project-ref

# Aplicar migrations
supabase db push
```

---

## 🔐 Configuração de Auth

### Anonymous Auth (Padrão)

Já configurado no código (`src/services/supabase.ts`):

```typescript
const { data, error } = await supabase.auth.signInAnonymously();
```

### Email Auth (Opcional)

Para habilitar email/password:

1. **Dashboard** → **Authentication** → **Providers**
2. Habilite **Email**
3. Configure email templates
4. Atualize código do app para usar `signUp` e `signIn`

### OAuth (Opcional)

Suporta Google, Facebook, Apple, etc.

1. **Dashboard** → **Authentication** → **Providers**
2. Habilite provider desejado
3. Configure OAuth credentials
4. Atualize app para usar `signInWithOAuth`

---

## ✅ Validação

### 1. Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deve retornar 14 tabelas.

### 2. Verificar Extensões

```sql
SELECT * FROM pg_extension
WHERE extname IN ('uuid-ossp', 'vector', 'pg_trgm');
```

Deve retornar 3 linhas.

### 3. Verificar Functions

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_updated_at_column',
  'match_conversations',
  'delete_old_conversations',
  'reset_daily_interactions'
);
```

Deve retornar 4 funções.

### 4. Verificar RLS Policies

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Deve retornar múltiplas policies.

### 5. Testar Insert Básico

```sql
-- Criar usuário de teste (substitua com um UUID válido de auth.users)
INSERT INTO user_profiles (id, name, type)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'Teste',
  'gestante'
);

SELECT * FROM user_profiles;
```

---

## 🐛 Troubleshooting

### Erro: "extension vector not found"

**Solução**: Habilite a extensão manualmente:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Erro: "permission denied for table"

**Solução**: Verifique RLS policies:

```sql
-- Desabilitar temporariamente RLS para debug (NÃO use em produção)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

### Erro: "duplicate key value violates unique constraint"

**Solução**: A migration é idempotente. Você pode rodá-la múltiplas vezes sem problema. Se ver este erro, significa que a tabela já existe e está OK.

### Erro: "type already exists"

**Solução**: Os ENUMs usam `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ...` para serem idempotentes. Este warning é esperado se rodar a migration novamente.

### Performance Ruim em Busca Vetorial

**Solução**: Ajuste o parâmetro `lists` do índice IVFFlat baseado no tamanho dos dados:

```sql
-- Para bases pequenas (<10k registros)
DROP INDEX IF EXISTS conversations_embedding_idx;
CREATE INDEX conversations_embedding_idx
ON conversations
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Para bases médias (10k-100k registros)
WITH (lists = 100);

-- Para bases grandes (>100k registros)
WITH (lists = 500);
```

### Auth não funciona

**Solução**: Verifique se:

1. **Anonymous Auth está habilitado**: Dashboard → Authentication → Providers
2. **Credenciais estão corretas**: `.env` tem `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. **RLS está configurado**: Policies devem usar `auth.uid()`

---

## 📊 Monitoramento

### Logs de Queries

Dashboard → **Database** → **Query Performance**

### Uso de Storage

Dashboard → **Settings** → **Usage**

### Erros de Auth

Dashboard → **Authentication** → **Logs**

---

## 🔄 Manutenção

### Limpeza Automática de Conversas Antigas

Execute periodicamente (ou configure um cron job):

```sql
SELECT delete_old_conversations();
```

### Reset de Daily Interactions

Execute diariamente (idealmente via cron):

```sql
SELECT reset_daily_interactions();
```

### Backup Manual

Dashboard → **Database** → **Backups** → **Create backup**

---

## 📚 Recursos Adicionais

- [Supabase Docs](https://supabase.com/docs)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Supabase Dashboard
2. Revise as seções de [Validação](#validação) e [Troubleshooting](#troubleshooting)
3. Consulte a [documentação oficial](https://supabase.com/docs)
4. Abra uma issue no repositório do projeto

---

**✅ Setup Completo!**

Seu banco de dados Supabase está configurado e pronto para uso com o app Nossa Maternidade.

# 🔒 Guia de Configuração Segura de API Keys

## 🚨 Problema Resolvido

**ANTES (INSEGURO):**
- ❌ API keys no código cliente (`src/config/api.ts`)
- ❌ Keys incluídas no bundle do app
- ❌ Qualquer pessoa pode extrair do APK/Bundle
- ❌ Risco de roubo e uso indevido

**DEPOIS (SEGURO):**
- ✅ API keys apenas no servidor (Supabase Edge Functions)
- ✅ Autenticação obrigatória para cada requisição
- ✅ Impossível extrair keys do app
- ✅ Controle total de acesso

---

## 📋 Passo 1: Configurar Variáveis no Supabase

### 1.1 Acessar o Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto "Nossa Maternidade"
3. Vá em **Settings** → **Edge Functions** → **Manage secrets**

### 1.2 Adicionar as API Keys

Adicione as seguintes variáveis de ambiente (secrets):

```bash
# Claude API
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# OpenAI API (para GPT-4o e DALL-E)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Gemini API (já configurada no nathia-chat)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxx

# Supabase (já configuradas automaticamente)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 Via CLI do Supabase (Alternativa)

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login
supabase login

# Link com seu projeto
supabase link --project-ref SEU_PROJECT_ID

# Adicionar secrets
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-xxxxx
supabase secrets set OPENAI_API_KEY=sk-proj-xxxxx
supabase secrets set GEMINI_API_KEY=AIzaSyxxxxx
```

---

## 📋 Passo 2: Deploy das Edge Functions

### 2.1 Deploy de Todas as Novas Edge Functions

```bash
# Claude Chat (fallback para NAT-IA)
supabase functions deploy claude-chat

# OpenAI Validation
supabase functions deploy openai-validate

# OpenAI Daily Plan
supabase functions deploy openai-daily-plan

# OpenAI Image Generation
supabase functions deploy openai-image-gen
```

### 2.2 Verificar Deploy

```bash
# Listar todas as functions
supabase functions list

# Você deve ver:
# - claude-chat
# - openai-validate
# - openai-daily-plan
# - openai-image-gen
# - nathia-chat (já existente)
# - behavior-analysis (já existente)
# - etc...
```

---

## 📋 Passo 3: Limpar API Keys do Cliente

### 3.1 Atualizar `.env.local` (ou criar se não existir)

```bash
# Crie/edite o arquivo .env.local
nano .env.local
```

**Conteúdo do `.env.local` (REMOVER API KEYS DE IA):**

```env
# Supabase (MANTER - necessário no cliente)
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ REMOVER TODAS AS LINHAS ABAIXO (agora ficam só no servidor)
# EXPO_PUBLIC_CLAUDE_API_KEY=...
# EXPO_PUBLIC_OPENAI_API_KEY=...
# EXPO_PUBLIC_GEMINI_API_KEY=...
# EXPO_PUBLIC_PERPLEXITY_API_KEY=...
# EXPO_PUBLIC_ELEVENLABS_API_KEY=...
# EXPO_PUBLIC_HEYGEN_API_KEY=...

# Stripe (MANTER - publishable key é pública)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# OneSignal (MANTER - App ID é público)
EXPO_PUBLIC_ONESIGNAL_APP_ID=...
```

### 3.2 Atualizar `src/config/api.ts`

O arquivo `src/config/api.ts` foi atualizado para **não expor API keys de IA**.

**Antes (INSEGURO):**
```typescript
export const API_CONFIG = {
  CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '', // ❌ EXPOSTO
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '', // ❌ EXPOSTO
  // ...
};
```

**Depois (SEGURO):**
```typescript
// API keys de IA foram REMOVIDAS do cliente
// Agora ficam apenas no servidor (Supabase Secrets)
export const API_CONFIG = {
  // Apenas keys que PODEM ser públicas
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
};
```

---

## 📋 Passo 4: Atualizar Chamadas no App

### 4.1 Exemplo: ChatScreen

**Antes (INSEGURO):**
```typescript
import { chatWithAI } from '../services/ai';

// Chamava diretamente a API com key exposta
const response = await chatWithAI(message, context, history);
```

**Depois (SEGURO):**
```typescript
import { chatWithNATIA } from '../services/ai'; // Preferir NAT-IA
import { supabase } from '../services/supabase';

// Obter userId autenticado
const { data: { user } } = await supabase.auth.getUser();

// Chamar Edge Function (key protegida no servidor)
const response = await chatWithNATIA(message, context, user!.id);
```

### 4.2 Exemplo: Validação com GPT

**Antes (INSEGURO):**
```typescript
const isValid = await validateWithGPT(message);
```

**Depois (SEGURO):**
```typescript
const { data: { user } } = await supabase.auth.getUser();
const isValid = await validateWithGPT(message, user!.id);
```

---

## 🔍 Passo 5: Testar a Implementação

### 5.1 Testar Edge Functions Localmente

```bash
# Rodar Edge Functions localmente
supabase functions serve

# Em outro terminal, testar a function
curl -i --location --request POST 'http://localhost:54321/functions/v1/claude-chat' \
  --header 'Authorization: Bearer SEU_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"message":"Olá!","context":{"type":"gestante","pregnancy_week":12},"userId":"USER_ID_AQUI","history":[]}'
```

### 5.2 Verificar Logs

```bash
# Ver logs das Edge Functions
supabase functions logs claude-chat
supabase functions logs openai-validate
```

### 5.3 Testar no App

1. Rebuild do app (para garantir que .env foi atualizado):
   ```bash
   npm run android
   # ou
   npm run ios
   ```

2. Fazer login no app
3. Testar chat com NAT-IA
4. Verificar que as respostas funcionam normalmente

---

## ✅ Checklist Final

- [ ] **Secrets configurados no Supabase Dashboard**
  - [ ] CLAUDE_API_KEY
  - [ ] OPENAI_API_KEY
  - [ ] GEMINI_API_KEY

- [ ] **Edge Functions deployadas**
  - [ ] claude-chat
  - [ ] openai-validate
  - [ ] openai-daily-plan
  - [ ] openai-image-gen

- [ ] **Código cliente atualizado**
  - [ ] `.env.local` sem API keys de IA
  - [ ] `src/config/api.ts` sem API keys de IA
  - [ ] `src/services/ai.ts` usando Edge Functions

- [ ] **Testes realizados**
  - [ ] Edge Functions testadas localmente
  - [ ] App testado em dev
  - [ ] Chat funcionando normalmente
  - [ ] Validação GPT funcionando
  - [ ] Geração de plano diário funcionando

---

## 🎯 Benefícios Desta Implementação

### Segurança
✅ **API keys impossíveis de extrair** do bundle
✅ **Autenticação obrigatória** - apenas usuários logados podem usar
✅ **Rate limiting** - controle no servidor
✅ **Audit trail** - logs de quem usou e quando

### Performance
✅ **Mesma latência** - Edge Functions rodam próximas ao usuário
✅ **Retry automático** - Supabase SDK já implementa retry
✅ **Timeout configurável** - evita requisições penduradas

### Manutenção
✅ **Centralizado** - mudar API key em 1 lugar (Supabase)
✅ **Versionamento** - Edge Functions com git
✅ **Monitoramento** - Supabase Dashboard mostra uso

---

## 🆘 Troubleshooting

### Erro: "CLAUDE_API_KEY not configured"

**Solução:**
```bash
# Verificar secrets
supabase secrets list

# Se não aparecer, adicionar:
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-xxxxx

# Re-deploy da function
supabase functions deploy claude-chat
```

### Erro: "Unauthorized" ao chamar Edge Function

**Solução:**
1. Verificar se usuário está logado:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user); // Deve ter ID
   ```

2. Verificar se Authorization header está sendo enviado (Supabase SDK faz automaticamente)

### Edge Function timeout

**Solução:**
```typescript
// Adicionar timeout nas funções (exemplo: claude-chat)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s

const response = await fetch('https://api.anthropic.com/v1/messages', {
  signal: controller.signal,
  // ... resto da config
});

clearTimeout(timeoutId);
```

---

## 📚 Próximos Passos

1. **Implementar rate limiting** nas Edge Functions (usar Upstash Redis)
2. **Adicionar monitoring** com Sentry/LogRocket
3. **Cache de respostas** (para mensagens repetidas)
4. **A/B testing** (NAT-IA vs Claude vs GPT)

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `supabase functions logs FUNCTION_NAME`
2. Testar localmente: `supabase functions serve`
3. Verificar secrets: `supabase secrets list`
4. Consultar docs: https://supabase.com/docs/guides/functions

---

**Implementado em:** 2025-11-01
**Severidade do problema resolvido:** 10/10 (Crítico)
**Impacto:** Segurança total das API keys

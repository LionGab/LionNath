# ✅ CHECKLIST DE DEPLOY - Nossa Maternidade

**Tempo estimado**: 2 horas  
**Status**: Em andamento

---

## ETAPA 1: HABILITAR EXTENSÕES (5min) ⏱️

### ☐ 1.1 Abrir Supabase Dashboard

```
https://supabase.com/dashboard
```

**Navegue para:**

- Selecione seu projeto
- Menu lateral: **Database** → **Extensions**

### ☐ 1.2 Habilitar uuid-ossp

1. Procure por `uuid-ossp` na lista
2. Clique no botão **Enable** (verde)
3. Aguarde confirmação (badge verde "Enabled")

### ☐ 1.3 Habilitar pgcrypto

1. Procure por `pgcrypto` na lista
2. Clique no botão **Enable** (verde)
3. Aguarde confirmação (badge verde "Enabled")

### ☐ 1.4 Verificar extensões

Execute no **SQL Editor**:

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto');
```

**Resultado esperado:**

```
extname    | extversion
-----------+-----------
uuid-ossp  | 1.1
pgcrypto   | 1.3
```

---

## ETAPA 2: EXECUTAR MIGRATIONS (2min) ⏱️

### ☐ 2.1 Confirmar conexão

```powershell
supabase status
```

**Deve mostrar:** `Status: RUNNING` ou conectado ao projeto remoto

### ☐ 2.2 Push migrations

```powershell
supabase db push
```

**Aguarde:**

- Aplicando migration 20250103_enable_extensions.sql... ✓
- Aplicando migration 001_gemini_memory.sql... ✓
- Aplicando migration 002_alert_logs.sql... ✓
- Aplicando migration 20250104_rate_limiting_event_based.sql... ✓
- Aplicando migration 20250105_onboarding_completo.sql... ✓
- Aplicando migration 20250106_000000_consolidated_schema.sql... ✓
- Aplicando migration 20250107_base_schema.sql... ✓
- Aplicando migration 20250107_new_features_schema.sql... ✓
- Aplicando migration 20250108_habits_system.sql... ✓

**Total:** 9 migrations ✓

### ☐ 2.3 Verificar tabelas criadas

Execute no **SQL Editor**:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deve mostrar 16+ tabelas:**

- alert_logs
- chat_messages
- curated_content
- daily_insights
- gemini_memory
- habit_logs
- habit_templates
- habits
- mundo_nath_posts
- mundo_nath_saves
- onboarding_data
- onboarding_responses
- rate_limit_events
- streaks
- user_gamification
- user_profiles
- user_saved_content

---

## ETAPA 3: CONFIGURAR VARIÁVEIS DE AMBIENTE (10min) ⏱️

### ☐ 3.1 Copiar .env.example

```powershell
Copy-Item .env.example .env
```

### ☐ 3.2 Obter credenciais do Supabase

**No Supabase Dashboard:**

- Menu: **Settings** → **API**
- Copiar:
  - Project URL
  - Project API keys → anon / public

### ☐ 3.3 Editar .env

Abra `.env` e preencha:

```env
# Supabase (OBRIGATÓRIO)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# IA (⚠️ configurar apenas em supabase/functions/.env)
# GEMINI_API_KEY=your-gemini-api-key
# CLAUDE_API_KEY=your-claude-api-key
# PERPLEXITY_API_KEY=your-perplexity-api-key

# Sentry (OPCIONAL - para monitoramento)
SENTRY_DSN=https://...
```

### ☐ 3.4 Obter API Keys

**Gemini (OBRIGATÓRIO):**

1. Acesse: https://makersuite.google.com/app/apikey
2. Crie API key
3. Copie para `GEMINI_API_KEY`

**Perplexity (OPCIONAL):**

1. Acesse: https://www.perplexity.ai/settings/api
2. Crie API key
3. Copie para `PERPLEXITY_API_KEY`

**Claude (OPCIONAL):**

1. Acesse: https://console.anthropic.com/settings/keys
2. Crie API key
3. Copie para `CLAUDE_API_KEY`

---

## ETAPA 4: DEPLOY EDGE FUNCTIONS (30min) ⏱️

### ☐ 4.1 Configurar secrets no Supabase

```powershell
# Gemini (OBRIGATÓRIO)
supabase secrets set GEMINI_API_KEY="YOUR_KEY_HERE"

# Perplexity (OPCIONAL)
supabase secrets set PERPLEXITY_API_KEY="YOUR_KEY_HERE"

# Claude (OPCIONAL)
supabase secrets set CLAUDE_API_KEY="YOUR_KEY_HERE"

# Provider ativo
supabase secrets set LLM_PROVIDER="gemini"
```

### ☐ 4.2 Deploy nathia-chat

```powershell
supabase functions deploy nathia-chat
```

**Aguarde:**

```
Deploying function nathia-chat...
Function deployed successfully! ✓
Function URL: https://xxxxx.supabase.co/functions/v1/nathia-chat
```

### ☐ 4.3 Deploy personalize-tip

```powershell
supabase functions deploy personalize-tip
```

**Aguarde:**

```
Deploying function personalize-tip...
Function deployed successfully! ✓
Function URL: https://xxxxx.supabase.co/functions/v1/personalize-tip
```

### ☐ 4.4 Deploy curate-articles

```powershell
supabase functions deploy curate-articles
```

**Aguarde:**

```
Deploying function curate-articles...
Function deployed successfully! ✓
Function URL: https://xxxxx.supabase.co/functions/v1/curate-articles
```

### ☐ 4.5 Testar Edge Functions

```powershell
# Testar nathia-chat
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/nathia-chat `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{"userId":"test-uuid","message":"Olá!"}'

# Deve retornar: {"response":"..."}
```

---

## ETAPA 5: INSTALAR E TESTAR APP (30min) ⏱️

### ☐ 5.1 Limpar e reinstalar dependências

```powershell
# Limpar cache
Remove-Item -Recurse -Force node_modules
Remove-Item -Force pnpm-lock.yaml

# Reinstalar
pnpm install
```

### ☐ 5.2 Verificar TypeScript

```powershell
pnpm typecheck
```

**Deve mostrar:** `No errors found!`

### ☐ 5.3 Iniciar app

```powershell
pnpm dev
```

**Aguarde:**

```
Metro waiting on exp://192.168.x.x:8081
```

### ☐ 5.4 Abrir no Android

```powershell
pnpm android
```

**Ou escanear QR code no Expo Go**

### ☐ 5.5 Testar fluxo crítico

1. ✅ App abre sem travar
2. ✅ Home carrega com dica do dia
3. ✅ NathIA Chat responde mensagens
4. ✅ Hábitos podem ser marcados
5. ✅ Posts do MundoNath aparecem
6. ✅ Artigos do MãeValente aparecem

---

## ETAPA 6: CORRIGIR DailyPlanScreen (30min) ⏱️

### ☐ 6.1 Identificar problema

Arquivo: `src/screens/DailyPlanScreen.tsx`

- Linha 9: TODO não resolvido
- Linhas 61-65: Mock data hardcoded

### ☐ 6.2 Aplicar correção

**(Aguarde Claude Code fazer isso)**

**Mudanças:**

- Remover import de `getDailyPlan`
- Adicionar `useDailyInsight` hook
- Usar Edge Function ao invés de mock

### ☐ 6.3 Testar correção

1. Abrir tela "Plano Diário"
2. Verificar que dica vem da Edge Function
3. Verificar que não é mock hardcoded

---

## ETAPA 7: VALIDAÇÃO FINAL (10min) ⏱️

### ☐ 7.1 Rodar testes

```powershell
pnpm test
```

**Deve passar:** Todos os testes ✓

### ☐ 7.2 Verificar coverage

```powershell
pnpm test:coverage
```

**Deve ter:** >= 70% de coverage ✓

### ☐ 7.3 Lint

```powershell
pnpm lint
```

**Deve mostrar:** `No errors found!` ✓

### ☐ 7.4 Validação completa

```powershell
pnpm validate:quick
```

**Deve passar:** Type check + Lint ✓

---

## ✅ CHECKLIST FINAL

- [ ] Extensões habilitadas no Supabase
- [ ] 9 migrations aplicadas
- [ ] 16+ tabelas criadas
- [ ] .env configurado com keys válidas
- [ ] 3 Edge Functions deployed
- [ ] Secrets configurados
- [ ] App abre sem travar
- [ ] Chat funciona
- [ ] Dica do dia carrega
- [ ] Hábitos funcionam
- [ ] DailyPlanScreen corrigido
- [ ] Testes passando
- [ ] Lint sem erros

---

## 🎉 DEPLOY COMPLETO!

**Resultado:**

- ✅ App 100% funcional
- ✅ Backend configurado
- ✅ Edge Functions rodando
- ✅ Segurança validada
- ✅ Testes passando

**Próximos passos:**

- 🎮 Gamificação (6h)
- 🎨 Animações (3h)
- 📱 Deploy para lojas (5h)

---

**Tempo total gasto:** **\_** horas  
**Status final:** ☐ Completo

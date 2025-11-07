# ✅ CHECKLIST - FASE 1 (EMERGÊNCIA)

**Tempo estimado:** 6-8 horas
**Objetivo:** Eliminar riscos críticos de segurança

---

## 🔐 API KEYS (2-4h)

- [ ] **Verificar histórico Git**
  ```bash
  git log --all --full-history -- .env
  ```

- [ ] **Se encontrado, limpar histórico**
  ```bash
  bfg --delete-files .env
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  ```

- [ ] **Revogar keys antigas**
  - [ ] Gemini: https://makersuite.google.com/app/apikey
  - [ ] Claude: https://console.anthropic.com/settings/keys
  - [ ] OpenAI: https://platform.openai.com/api-keys
  - [ ] Perplexity: https://www.perplexity.ai/settings/api
  - [ ] Supabase Anon Key: Dashboard → Settings → API

- [ ] **Gerar novas keys**
  - [ ] Nova Gemini API Key
  - [ ] Nova Claude API Key
  - [ ] Nova OpenAI API Key
  - [ ] Nova Perplexity API Key
  - [ ] Nova Supabase Anon Key

- [ ] **Configurar Edge Functions**
  ```bash
  cd supabase/functions
  cp .env.example .env
  # Editar .env com novas keys
  ```

- [ ] **Atualizar .env do projeto**
  ```env
  EXPO_PUBLIC_SUPABASE_URL=...
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<nova>
  # Remover todas API keys
  ```

- [ ] **Deploy Edge Functions**
  ```bash
  supabase functions deploy nathia-chat
  supabase functions deploy nathia-curadoria
  supabase functions deploy nathia-moderacao
  supabase functions deploy nathia-onboarding
  supabase functions deploy nathia-recs
  ```

---

## 💾 BANCO DE DADOS (2h)

- [ ] **Abrir Supabase Dashboard**
  - Navegar para SQL Editor

- [ ] **Copiar script de correção**
  - Arquivo: `.claude/memory/scripts/fix-database.sql`

- [ ] **Executar script**
  - Colar no SQL Editor
  - Executar

- [ ] **Validar correções**
  ```sql
  -- Verificar FKs
  SELECT conname FROM pg_constraint
  WHERE contype = 'f' AND confrelid = 0;

  -- Verificar índices
  SELECT tablename, indexname
  FROM pg_indexes
  WHERE tablename LIKE 'nathia_%';
  ```

---

## ⚙️ CONFIGURAÇÕES (30min)

- [ ] **Habilitar JWT em moderacao**
  ```toml
  # supabase/config.toml
  [functions.nathia-moderacao]
  verify_jwt = true
  ```

- [ ] **Commit e push das correções**
  ```bash
  git add supabase/config.toml
  git commit -m "fix: habilitar JWT em nathia-moderacao"
  git push
  ```

---

## 🧪 TESTES (1h)

- [ ] **Iniciar dev server**
  ```bash
  pnpm dev
  ```

- [ ] **Testar NAT-IA Chat**
  - [ ] Enviar mensagem
  - [ ] Verificar resposta
  - [ ] Conferir que não há erro de API key

- [ ] **Testar Edge Functions diretamente**
  ```bash
  curl -X POST https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1/nathia-chat \
    -H "Authorization: Bearer $ANON_KEY" \
    -d '{"user_id":"test","message":"hello"}'
  ```

- [ ] **Verificar logs no Supabase**
  - Dashboard → Edge Functions → Logs
  - Verificar que não há erros

- [ ] **Testar em dispositivo**
  - [ ] Expo Go (iOS/Android)
  - [ ] Chat funciona
  - [ ] Onboarding funciona
  - [ ] Recomendações funcionam

---

## ✅ VALIDAÇÃO FINAL

- [ ] **Segurança**
  - [ ] Sem API keys no código
  - [ ] .env não tem secrets
  - [ ] Edge Functions protegidas

- [ ] **Banco de Dados**
  - [ ] Sem FKs quebradas
  - [ ] Índices criados
  - [ ] RLS habilitado

- [ ] **Funcional**
  - [ ] App inicia sem erros
  - [ ] Chat funciona
  - [ ] Edge Functions respondem

---

## 📝 APÓS CONCLUSÃO

- [ ] **Atualizar session-context.md**
  - Marcar Fase 1 como completa

- [ ] **Documentar decisões**
  - Adicionar em `.claude/memory/decisions-log.md`

- [ ] **Comunicar time**
  - Novas keys configuradas
  - Sistema seguro

- [ ] **Iniciar Fase 2**
  - Ver: `.claude/memory/checklists/phase-2.md`

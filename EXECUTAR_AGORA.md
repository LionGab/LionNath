# 🚀 EXECUTAR AGORA - Configuração Final

**Status:** Arquivos prontos ✅ | Execução manual necessária ⏳

---

## ⚡ Passos Rápidos (10 minutos)

### 1️⃣ Executar SQL Migration (5 min)

**No Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard/project/bbcwitnbnosyfpjtzkr
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Abra o arquivo: `supabase\migrations\001_gemini_memory.sql`
5. Copie TODO o conteúdo
6. Cole no editor SQL
7. Clique em **Run** ou pressione `Ctrl+Enter`

**Verificação:**

```sql
-- Verificar extensão
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verificar tabela
SELECT table_name FROM information_schema.tables WHERE table_name = 'conversations';

-- Verificar função
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'match_conversations';
```

---

### 2️⃣ Configurar Secret GEMINI_API_KEY (2 min)

**No Supabase Dashboard:**

1. Vá em **Edge Functions** (menu lateral)
2. Clique em **Secrets** ou **Settings**
3. Clique em **Add Secret** ou **New Secret**
4. Preencha:
   - **Name**: `GEMINI_API_KEY`
   - **Configuração**: definir `GEMINI_API_KEY` em `supabase/functions/.env` (sem prefixo `EXPO_PUBLIC_*`)
5. Clique em **Save**

---

### 3️⃣ Deploy Edge Functions (3 min)

**No Supabase Dashboard:**

1. Vá em **Edge Functions** (menu lateral)
2. Clique em `nathia-chat`
3. Clique em **Deploy** ou **Redeploy**
4. Aguarde o deploy completar
5. Repita para `moderation-service`

**Ou via Terminal (se Supabase CLI instalado):**

```powershell
cd C:\Users\Usuario\Documents\LionNath
supabase functions deploy nathia-chat --project-ref bbcwitnbnosyfpjtzkr
supabase functions deploy moderation-service --project-ref bbcwitnbnosyfpjtzkr
```

---

## ✅ Verificação Final

### Checklist:

- [ ] SQL migration executado com sucesso
- [ ] Secret `GEMINI_API_KEY` configurado
- [ ] Edge Function `nathia-chat` deployada
- [ ] Edge Function `moderation-service` deployada

### Testar no App:

```powershell
cd apps\mobile
pnpm dev
```

1. Abra o app
2. Faça login
3. Vá para Chat
4. Envie uma mensagem de teste
5. Verifique se a resposta vem do Gemini 1.5 Pro

---

## 🐛 Troubleshooting

### "Função match_conversations não encontrada"

- Execute o SQL migration novamente

### "GEMINI_API_KEY not configured"

- Configure no Dashboard > Edge Functions > Secrets

### Edge Function não responde

- Verifique logs em: Dashboard > Edge Functions > Logs
- Faça redeploy da função

---

## 📚 Arquivos de Referência

- **SQL Migration**: `supabase\migrations\001_gemini_memory.sql`
- **Edge Function Chat**: `supabase\functions\nathia-chat\index.ts`
- **Edge Function Moderation**: `supabase\functions\moderation-service\index.ts`
- **Documentação Completa**: `CONFIGURACAO_COMPLETA.md`

---

**Tudo pronto! Execute os 3 passos acima e está configurado!** 🎉

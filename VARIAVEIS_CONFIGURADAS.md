# ✅ Variáveis de Ambiente Configuradas

**Status:** 🟢 Pronto para deploy no Netlify

---

## 📋 Arquivos Criados

1. **`.env.example`** - Template com placeholders (pode commitar)
2. **`NETLIFY_ENV_VARS.md`** - Valores reais para copiar no Netlify (não commitar)

---

## 🚀 Próximo Passo: Deploy no Netlify

### 1. Conectar Repositório (2min)

1. Acesse [netlify.com](https://netlify.com)
2. Login com GitHub
3. **Add new site** → **Import existing project**
4. Selecione `nossa-maternidade`
5. Netlify detectará `netlify.toml` automaticamente ✅

### 2. Configurar Variáveis (2min)

No Netlify Dashboard → **Site settings** → **Environment variables**

**Copie e cole estas variáveis:**

```bash
EXPO_PUBLIC_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueoe
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1
EXPO_PUBLIC_SENTRY_DSN=https://7c54483e2021e1b7bae427e8940d6992@o4510299490746368.ingest.us.sentry.io/4510317278134272
NODE_ENV=production
EXPO_PUBLIC_ENV=production
```

**📋 Arquivo completo:** `NETLIFY_ENV_VARS.md`

### 3. Deploy! (3-5min)

- Clique em **"Deploy site"**
- Aguarde build completar
- Site estará em: `https://nossa-maternidade.netlify.app`

---

## ⚠️ Importante

### Chaves de IA (GEMINI, CLAUDE, PERPLEXITY)

**NÃO** coloque essas chaves no Netlify!

Elas devem estar **APENAS** no Supabase:

```bash
# No Supabase (via CLI ou Dashboard)
supabase secrets set GEMINI_API_KEY=xxx
supabase secrets set PERPLEXITY_API_KEY=xxx
supabase secrets set CLAUDE_API_KEY=xxx
```

Isso garante que as chaves nunca sejam expostas no código do app.

---

## ✅ Checklist Rápido

- [x] `.env.example` criado
- [x] `NETLIFY_ENV_VARS.md` criado com valores reais
- [x] `netlify.toml` configurado
- [x] Documentação atualizada
- [ ] Repositório conectado no Netlify
- [ ] Variáveis configuradas no Netlify
- [ ] Deploy realizado
- [ ] Site testado no mobile

---

## 📱 Testar Após Deploy

1. Abrir site no mobile
2. Testar login
3. Testar chat (NathIA)
4. Testar hábitos
5. Verificar se dica diária aparece

---

**Pronto para apresentação!** 🎉

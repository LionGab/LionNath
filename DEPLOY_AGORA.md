# 🚀 DEPLOY NO NETLIFY - EXECUTAR AGORA

**Status:** ✅ Netlify CLI instalado | ⚠️ Precisa fazer login

---

## ⚡ OPÇÃO RÁPIDA: Via Netlify Dashboard (Recomendado - 5min)

### 1. Acesse o Netlify

👉 **https://app.netlify.com**

### 2. Conecte o Repositório

1. Clique em **"Add new site"** → **"Import an existing project"**
2. Escolha **GitHub**
3. Autorize o Netlify (se necessário)
4. Selecione o repositório: **`LionGab/NossaMaternidade-LN`**

### 3. Configure o Site

O Netlify detectará automaticamente o `netlify.toml` ✅

**Configurações automáticas:**
- ✅ Build command: `pnpm install --frozen-lockfile && cd apps/mobile && pnpm run build:web`
- ✅ Publish directory: `apps/mobile/dist`
- ✅ Base directory: `.`

### 4. Configure Variáveis de Ambiente

**Antes de fazer deploy**, vá em **"Show advanced"** → **"New variable"**

**Adicione estas variáveis:**

```
EXPO_PUBLIC_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueo
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1
EXPO_PUBLIC_SENTRY_DSN=https://7c54483e2021e1b7bae427e8940d6992@o4510299490746368.ingest.us.sentry.io/4510317278134272
NODE_ENV=production
EXPO_PUBLIC_ENV=production
```

### 5. Deploy!

Clique em **"Deploy site"** e aguarde ~3-5 minutos.

**Site estará em:** `https://nossa-maternidade.netlify.app` (ou nome similar)

---

## 🔧 OPÇÃO 2: Via CLI (Se preferir)

### 1. Fazer Login

```bash
netlify login
```

Isso abrirá o browser para autenticação.

### 2. Linkar Projeto

```bash
cd /workspace
netlify link
```

Escolha:
- **Create & configure a new site**
- Escolha o time
- Escolha o nome do site (ou deixe padrão)

### 3. Build Local (Opcional - para testar)

```bash
cd apps/mobile
pnpm run build:web
cd ../..
```

### 4. Deploy

```bash
# Deploy para produção
netlify deploy --prod --dir=apps/mobile/dist

# Ou deploy preview (para testar)
netlify deploy --dir=apps/mobile/dist
```

### 5. Configurar Variáveis via CLI

```bash
netlify env:set EXPO_PUBLIC_SUPABASE_URL "https://mnszbkeuerjcevjvdqme.supabase.co"
netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueo"
netlify env:set EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL "https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1"
netlify env:set EXPO_PUBLIC_SENTRY_DSN "https://7c54483e2021e1b7bae427e8940d6992@o4510299490746368.ingest.us.sentry.io/4510317278134272"
netlify env:set NODE_ENV "production"
netlify env:set EXPO_PUBLIC_ENV "production"
```

---

## ⚠️ IMPORTANTE: Chaves de IA

**NÃO adicione as chaves de IA no Netlify!**

Configure-as apenas no Supabase:

```bash
# No Supabase (via CLI ou Dashboard)
supabase secrets set GEMINI_API_KEY=AIzaSyC9YVWRmnGyGu4c9y7g-mNkkipDqb5JBZg
supabase secrets set CLAUDE_API_KEY=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
supabase secrets set OPENAI_API_KEY=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
supabase secrets set PERPLEXITY_API_KEY=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
```

---

## ✅ Após o Deploy

1. ✅ Testar site no mobile
2. ✅ Verificar se login funciona
3. ✅ Testar chat (NathIA)
4. ✅ Testar hábitos
5. ✅ Verificar dica diária

---

## 🐛 Problemas?

### Build Falha

- Verificar logs no Netlify Dashboard
- Limpar cache: Dashboard → Deploys → Clear build cache
- Verificar se variáveis estão configuradas

### App Não Carrega

- Abrir console do browser (F12)
- Verificar erros
- Verificar se variáveis de ambiente estão corretas

---

## 📱 URL do Site

Após deploy, o site estará em:
- **Produção:** `https://nossa-maternidade.netlify.app` (ou nome escolhido)
- **Preview:** `https://deploy-preview-XXX--nossa-maternidade.netlify.app`

---

**🚀 Pronto para deploy! Escolha uma opção acima e siga os passos.**

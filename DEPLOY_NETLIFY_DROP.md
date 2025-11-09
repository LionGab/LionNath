# 🚀 Deploy via Netlify Drop - AGORA!

**Status:** ✅ Build criado com sucesso!

---

## 📦 Build Pronto

O build foi criado em: `apps/mobile/dist`

**Conteúdo:**
- ✅ `index.html` - Página principal
- ✅ `_expo/static/` - JavaScript e assets
- ✅ `favicon.ico` - Ícone do site
- ✅ Total: ~5MB (otimizado)

---

## 🎯 Passo a Passo - Netlify Drop

### 1. Acesse o Netlify Drop

👉 **https://app.netlify.com/drop**

### 2. Arraste a Pasta `dist`

1. Abra o explorador de arquivos
2. Navegue até: `/workspace/apps/mobile/dist`
3. **Arraste a pasta `dist` inteira** para a área do Netlify Drop

**OU** se preferir, arraste o conteúdo dentro de `dist`:
- `index.html`
- `_expo/` (pasta inteira)
- `favicon.ico`
- `metadata.json`

### 3. Aguarde Upload

O Netlify vai:
- ✅ Fazer upload dos arquivos
- ✅ Criar um site temporário
- ✅ Gerar uma URL única

### 4. Site Estará Pronto!

Você receberá uma URL tipo:
`https://random-name-12345.netlify.app`

---

## ⚠️ IMPORTANTE: Configurar Variáveis de Ambiente

Após o deploy, você **DEVE** configurar as variáveis de ambiente:

### No Netlify Dashboard:

1. Vá em **Site settings** → **Environment variables**
2. Adicione estas variáveis:

```
EXPO_PUBLIC_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3pia2V1ZXJqY2V2anZkcW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTY3ODEsImV4cCI6MjA3NzQ5Mjc4MX0.f2jPp6KLzzrJPTt63FKNyDanh_0uw9rJ1-gbSvQFueo
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://mnszbkeuerjcevjvdqme.supabase.co/functions/v1
EXPO_PUBLIC_SENTRY_DSN=https://7c54483e2021e1b7bae427e8940d6992@o4510299490746368.ingest.us.sentry.io/4510317278134272
NODE_ENV=production
EXPO_PUBLIC_ENV=production
```

3. **Fazer novo deploy** após adicionar variáveis (ou usar "Trigger deploy")

---

## 🔄 Para Atualizar o Site

Sempre que fizer mudanças:

1. Fazer novo build:
```bash
cd apps/mobile
pnpm run build:web
```

2. Arrastar novamente a pasta `dist` no Netlify Drop
   - OU fazer deploy via Dashboard → Deploys → Publish deploy

---

## 📱 Testar Após Deploy

1. ✅ Abrir site no mobile
2. ✅ Verificar se carrega sem erros
3. ✅ Testar login
4. ✅ Testar chat (NathIA)
5. ✅ Testar hábitos

---

## 🐛 Problemas?

### Site não carrega

- Verificar se variáveis de ambiente estão configuradas
- Verificar console do browser (F12) para erros
- Verificar se Supabase está acessível

### Variáveis não funcionam

- Fazer novo deploy após adicionar variáveis
- Verificar se variáveis começam com `EXPO_PUBLIC_`
- Verificar se não há espaços extras

---

## ✅ Pronto!

**Caminho da pasta:** `/workspace/apps/mobile/dist`

**Arraste essa pasta para:** https://app.netlify.com/drop

**Depois configure as variáveis de ambiente no Dashboard!**

---

**🚀 Boa sorte com o deploy!**

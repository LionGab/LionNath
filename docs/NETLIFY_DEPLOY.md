# Netlify Deploy Guide - Nossa Maternidade

Guia completo para configurar e fazer deploy no Netlify.

## 🚀 Setup Inicial

### 1. Verificar Configuração do Projeto

Execute o script de diagnóstico:

```bash
pnpm netlify:check
```

Este script verifica:
- ✅ Existência e configuração do `netlify.toml`
- ✅ Estrutura do projeto (apps/mobile)
- ✅ Scripts de build necessários
- ✅ Configuração do monorepo
- ✅ Variáveis de ambiente documentadas

### 2. Configurar Netlify App no GitHub

**⚠️ CRÍTICO:** Este passo é obrigatório para o deploy funcionar.

1. **Instalar Netlify App:**
   - Acesse: https://github.com/marketplace/netlify
   - Clique em "Set up a plan" → "Install it for free"
   - Escolha: **"All repositories"** ou **"Only select repositories"**
   - Se escolher "Only select repositories", adicione `LionGab/NossaMaternidade-LN`
   - Clique em "Install"

2. **Se Repositório está em Organização:**
   - Um **admin/owner** precisa aprovar a instalação
   - Acesse: https://github.com/organizations/LionGab/settings/installations
   - Aprove a instalação do Netlify App

### 3. Conectar Repositório no Netlify

1. **Acesse Netlify Dashboard:**
   - https://app.netlify.com
   - Faça login com sua conta GitHub

2. **Importar Projeto:**
   - Clique em "Add new site" → "Import an existing project"
   - Escolha "GitHub"
   - Autorize o Netlify (se solicitado)
   - Selecione o repositório: `LionGab/NossaMaternidade-LN`

3. **Configurar Build Settings:**
   - **Branch to deploy:** `main` (ou sua branch principal)
   - **Build command:** `pnpm install && cd apps/mobile && pnpm run build:web`
   - **Publish directory:** `apps/mobile/dist`
   - **Base directory:** (deixe vazio ou `.`)

   ⚠️ **Nota:** O `netlify.toml` já contém essas configurações, mas você pode verificar aqui.

4. **Configurar Variáveis de Ambiente:**
   - Vá em: Site settings → Environment variables
   - Adicione as variáveis necessárias:
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     EXPO_PUBLIC_PROJECT_ID=your-expo-project-id (opcional)
     EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn (opcional)
     NODE_VERSION=20
     ```

5. **Deploy:**
   - Clique em "Deploy site"
   - Aguarde o build completar

## 📋 Configuração do netlify.toml

O arquivo `netlify.toml` na raiz já está configurado com:

```toml
[build]
  base = "."
  command = "pnpm install && cd apps/mobile && pnpm run build:web"
  publish = "apps/mobile/dist"

[build.environment]
  NODE_VERSION = "20"
  HUSKY = "0"
```

**Não é necessário** configurar manualmente no dashboard se o `netlify.toml` estiver correto.

## 🔧 Troubleshooting

### Erro: "Error checking out repo"

**Causa:** Netlify não tem permissão para acessar o repositório.

**Solução:**
1. Verifique se Netlify App está instalado: https://github.com/settings/installations
2. Reconecte o repositório no Netlify Dashboard
3. Ver guia completo: `docs/TROUBLESHOOTING_NETLIFY.md`

### Erro: "Build command failed"

**Possíveis causas:**
- `pnpm` não está disponível no Netlify
- Script `build:web` não existe em `apps/mobile/package.json`
- Dependências não estão instaladas

**Solução:**
1. Verifique se `pnpm` está sendo usado (não `npm`)
2. Execute localmente: `pnpm netlify:build`
3. Verifique logs completos no Netlify Dashboard

### Erro: "Publish directory not found"

**Causa:** O diretório `apps/mobile/dist` não foi criado pelo build.

**Solução:**
1. Verifique se o script `build:web` está criando o diretório `dist`
2. Execute localmente e verifique: `cd apps/mobile && pnpm run build:web`
3. Verifique se `dist` foi criado

### Build muito lento

**Otimizações:**
- Use cache do pnpm: já configurado automaticamente
- Configure `NODE_VERSION` no `netlify.toml` (já configurado)
- Use `ignore` no `netlify.toml` para pular builds desnecessários (já configurado)

## 🧪 Testar Build Localmente

Antes de fazer deploy, teste o build localmente:

```bash
# 1. Instalar dependências
pnpm install

# 2. Build do app mobile para web
pnpm netlify:build

# 3. Verificar se dist foi criado
ls -la apps/mobile/dist
```

Se funcionar localmente, deve funcionar no Netlify.

## 📊 Monitoramento

### Ver Logs de Deploy

1. Acesse: https://app.netlify.com
2. Selecione seu site
3. Vá em "Deploys"
4. Clique em um deploy para ver logs completos

### Deploy Previews

O Netlify cria automaticamente previews para cada Pull Request:
- Acesse a PR no GitHub
- Veja o link do deploy preview nos comentários
- Ou veja em: Netlify Dashboard → Deploys → Deploy previews

## 🔐 Segurança

### Variáveis de Ambiente Sensíveis

**NUNCA** adicione no Netlify:
- ❌ `GEMINI_API_KEY`
- ❌ `CLAUDE_API_KEY`
- ❌ `PERPLEXITY_API_KEY`
- ❌ `SUPABASE_SERVICE_ROLE_KEY`

Essas chaves devem estar **apenas** em:
- ✅ Supabase Edge Functions (via Supabase Dashboard)
- ✅ GitHub Secrets (para CI/CD)

### Headers de Segurança

Já configurados no `netlify.toml`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📝 Checklist de Deploy

Antes de fazer deploy:

- [ ] `pnpm netlify:check` passou sem erros
- [ ] Netlify App instalado no GitHub
- [ ] Repositório conectado no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] Build funciona localmente (`pnpm netlify:build`)
- [ ] `netlify.toml` está commitado no repositório

## 🔗 Links Úteis

- **Netlify Dashboard:** https://app.netlify.com
- **Netlify Docs:** https://docs.netlify.com
- **GitHub App Settings:** https://github.com/settings/installations
- **Troubleshooting:** `docs/TROUBLESHOOTING_NETLIFY.md`

---

**Última atualização:** Janeiro 2025

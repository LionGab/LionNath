# Troubleshooting: Erro de Permissão Netlify GitHub App

**Erro:** `Error checking out repo. Please verify Netlify app installation on GitHub.`

**Causa:** O Netlify não consegue acessar o repositório `LionGab/NossaMaternidade-LN` devido a problemas de permissão do GitHub App.

## 🔍 Diagnóstico Rápido

### Verificar Status do Repositório

1. **Repositório existe e está acessível?**
   - ✅ Acesse: https://github.com/LionGab/NossaMaternidade-LN
   - ✅ Confirme que o nome/owner não mudou
   - ✅ Verifique se não está arquivado ou deletado

2. **Netlify App está instalado?**
   - Acesse: https://github.com/settings/installations
   - Procure por "Netlify" na lista de apps instalados

## 🔧 Solução Passo a Passo

### Opção 1: Verificar e Reconfigurar GitHub App (Recomendado)

#### Passo 1: Verificar Instalação no GitHub

1. Acesse: https://github.com/settings/installations
2. Procure por **"Netlify"** na lista
3. Se **NÃO encontrar**:
   - Clique em "Configure" ou "Install another app"
   - Procure "Netlify" no GitHub Marketplace: https://github.com/marketplace/netlify
   - Clique em "Set up a plan" → "Install it for free"
   - Escolha: **"All repositories"** ou **"Only select repositories"** (inclua `NossaMaternidade-LN`)

#### Passo 2: Verificar Permissões do App

Se o Netlify já está instalado:

1. Clique em **"Configure"** ao lado do Netlify
2. Verifique se o repositório `LionGab/NossaMaternidade-LN` está na lista de repositórios permitidos
3. Se não estiver:
   - Clique em "Repository access"
   - Selecione "Only select repositories"
   - Adicione `NossaMaternidade-LN`
   - Clique em "Save"

#### Passo 3: Se Repositório está em Organização

Se `LionGab` é uma organização (não usuário pessoal):

1. Um **owner da organização** precisa aprovar a instalação
2. Acesse: https://github.com/organizations/LionGab/settings/installations
3. Verifique se o Netlify está instalado e aprovado
4. Se não estiver, um admin precisa aprovar

### Opção 2: Reconectar no Netlify

#### Passo 1: Acessar Configurações do Site

1. Acesse: https://app.netlify.com
2. Selecione o site `nossamaternidade` (ou nome do seu site)
3. Vá em: **Site settings** → **Build & deploy** → **Continuous Deployment**

#### Passo 2: Reconectar Repositório

1. Na seção **"Repository"**, clique em **"Edit settings"** ou **"Change repository"**
2. Se aparecer opção de reconectar, clique em **"Reconnect"**
3. Autorize o acesso do Netlify ao GitHub quando solicitado
4. Selecione o repositório `LionGab/NossaMaternidade-LN`
5. Confirme a conexão

#### Passo 3: Verificar Branch e Build Settings

Após reconectar:

1. Verifique se a **branch** está correta (geralmente `main` ou `master`)
2. Verifique se o **build command** está correto:
   ```bash
   pnpm install && cd apps/mobile && pnpm run build:web
   ```
3. Verifique se o **publish directory** está correto:
   ```
   apps/mobile/dist
   ```

### Opção 3: Remover e Re-adicionar Site (Último Recurso)

⚠️ **Atenção:** Isso vai remover histórico de deploys e configurações.

1. No Netlify Dashboard:
   - Vá em **Site settings** → **General** → **Delete site**
   - Confirme a exclusão

2. Criar novo site:
   - Clique em **"Add new site"** → **"Import an existing project"**
   - Escolha **GitHub**
   - Autorize o Netlify (se solicitado)
   - Selecione `LionGab/NossaMaternidade-LN`
   - Configure:
     - **Branch:** `main`
     - **Build command:** `pnpm install && cd apps/mobile && pnpm run build:web`
     - **Publish directory:** `apps/mobile/dist`
   - Clique em **"Deploy site"**

## ✅ Verificação Pós-Correção

Após seguir os passos acima:

1. **Trigger um novo deploy:**
   - No Netlify Dashboard → **Deploys** → **Trigger deploy** → **Deploy site**
   - Ou faça um commit vazio:
     ```bash
     git commit --allow-empty -m "Trigger Netlify deploy"
     git push
     ```

2. **Verificar logs:**
   - Acesse o deploy no Netlify
   - Verifique se o erro de checkout desapareceu
   - Se ainda aparecer, verifique os logs completos

## 🔐 Verificações Adicionais

### OAuth Revoked?

Se você revogou o acesso OAuth do Netlify:

1. Acesse: https://github.com/settings/applications
2. Procure por "Netlify" em **"Authorized OAuth Apps"**
3. Se não encontrar, você precisa reconectar (Opção 2)

### Repositório Renomeado/Movido?

Se o repositório foi renomeado ou movido:

1. Atualize a configuração no Netlify para o novo nome
2. Ou reconecte o repositório (Opção 2)

### Problemas com Organização?

Se `LionGab` é uma organização:

1. Verifique se você tem permissão de **admin** ou **owner**
2. Um admin precisa aprovar a instalação do Netlify App
3. Acesse: https://github.com/organizations/LionGab/settings/installations

## 📋 Checklist de Resolução

- [ ] Repositório existe e está acessível: https://github.com/LionGab/NossaMaternidade-LN
- [ ] Netlify App está instalado no GitHub: https://github.com/settings/installations
- [ ] Repositório `NossaMaternidade-LN` está na lista de repositórios permitidos
- [ ] Se organização, admin aprovou a instalação
- [ ] Repositório reconectado no Netlify Dashboard
- [ ] Branch e build settings estão corretos
- [ ] Novo deploy foi triggerado e funcionou

## 🔗 Links Úteis

- **Netlify GitHub Integration:** https://docs.netlify.com/integrations/git-provider/#github
- **Netlify App no GitHub Marketplace:** https://github.com/marketplace/netlify
- **GitHub App Permissions:** https://docs.github.com/en/apps/using-github-apps/authorizing-github-apps
- **Netlify Dashboard:** https://app.netlify.com

## 🆘 Se Nada Funcionar

1. **Contatar Suporte Netlify:**
   - Email: support@netlify.com
   - Inclua: URL do site, logs do deploy, screenshots do erro

2. **Verificar Status do Netlify:**
   - https://www.netlifystatus.com/

3. **Verificar Status do GitHub:**
   - https://www.githubstatus.com/

---

**Última atualização:** Janeiro 2025  
**Configuração do projeto:** Ver `netlify.toml` na raiz do projeto

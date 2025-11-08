# 🔐 Instruções de Login e Configuração

## ✅ Supabase CLI Instalado!

O Supabase CLI foi instalado com sucesso via Scoop.

---

## 📋 Próximos Passos

### 1️⃣ Fazer Login no Supabase

Execute no terminal:

```powershell
supabase login
```

Isso abrirá o navegador para você fazer login. Após o login, volte ao terminal.

---

### 2️⃣ Executar Configuração Automática

Após fazer login, execute:

```powershell
cd C:\Users\Usuario\Documents\LionNath
.\scripts\configurar-tudo-auto.ps1
```

Este script irá:

- ✅ Verificar autenticação
- ✅ Linkar com o projeto
- ✅ Executar SQL migration
- ✅ Configurar secret GEMINI_API_KEY
- ✅ Fazer deploy das Edge Functions

---

## 🔄 Ou Configure Manualmente

Se preferir configurar manualmente no Dashboard:

### 1. Executar SQL Migration

1. Acesse: https://supabase.com/dashboard/project/bbcwitnbnosyfpjtzkr
2. Vá em **SQL Editor** > **New Query**
3. Abra o arquivo: `supabase\migrations\001_gemini_memory.sql`
4. Copie TODO o conteúdo
5. Cole no editor SQL
6. Execute (Ctrl+Enter)

### 2. Configurar Secret

1. No Dashboard, vá em **Edge Functions** > **Secrets**
2. Adicione novo secret:
   - **Name**: `GEMINI_API_KEY`
   - **Configuração**: definir `GEMINI_API_KEY` em `supabase/functions/.env` (nunca usar `EXPO_PUBLIC_*`)
3. Salve

### 3. Deploy Edge Functions

1. No Dashboard, vá em **Edge Functions**
2. Clique em `nathia-chat` > **Deploy**
3. Repita para `moderation-service`

---

## ✅ Verificação

Após configurar, teste o chat no app:

```powershell
cd apps\mobile
pnpm dev
```

---

**Tudo pronto! Siga os passos acima para finalizar a configuração.** 🎉

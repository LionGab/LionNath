# 🔐 Como Fazer Login no Supabase CLI

## ⚠️ Importante

O comando `supabase login` precisa ser executado **manualmente no seu terminal** porque abre o navegador para autenticação.

---

## 📋 Passos

### 1. Abra o PowerShell no diretório do projeto

```powershell
cd C:\Users\Usuario\Documents\LionNath
```

### 2. Adicione o PATH do Scoop (se necessário)

```powershell
$env:Path += ";$env:USERPROFILE\scoop\shims"
```

### 3. Execute o login

```powershell
supabase login
```

Isso irá:

- Abrir o navegador automaticamente
- Pedir para você fazer login no Supabase
- Autorizar o CLI

### 4. Após o login, execute o script de configuração

```powershell
.\scripts\configurar-tudo-auto.ps1
```

---

## 🔄 Alternativa: Configurar Manualmente

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
   - **Configuração**: definir `GEMINI_API_KEY` em `supabase/functions/.env` (sem `EXPO_PUBLIC_*`)
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

**Execute `supabase login` no seu terminal e depois o script de configuração!** 🎉

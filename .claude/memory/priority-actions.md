# ⚡ AÇÕES PRIORITÁRIAS - FAZER AGORA

## 🔴 P0 - CRÍTICO (Hoje - 2-4h)

### 1. Revogar API Keys (URGENTE)

```bash
# 1. Verificar se .env está no Git
git log --all --full-history -- .env

# 2. Se encontrado, limpar histórico
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Revogar keys:
# - Gemini: https://makersuite.google.com/app/apikey
# - Claude: https://console.anthropic.com/settings/keys
# - OpenAI: https://platform.openai.com/api-keys
# - Perplexity: https://www.perplexity.ai/settings/api

# 4. Configurar nas Edge Functions
cd supabase/functions
cp .env.example .env
# Editar .env com novas keys (SEM EXPO_PUBLIC_)

# 5. Deploy
supabase functions deploy nathia-chat
```

### 2. Corrigir Banco de Dados (2h)

```bash
# Ver script completo em:
.claude/memory/scripts/fix-database.sql

# Executar via Supabase Dashboard > SQL Editor
```

### 3. Habilitar JWT em moderacao (5min)

```toml
# supabase/config.toml
[functions.nathia-moderacao]
verify_jwt = true  # Mudar de false para true
```

---

## 🟡 P1 - URGENTE (1-2 dias)

### 4. Remover Vulnerabilidades

```bash
pnpm remove @react-native-voice/voice react-native-gifted-chat
pnpm update esbuild@latest xml2js@latest
```

### 5. Consolidar .env.example

```bash
# Usar template em:
.claude/memory/scripts/env.example
```

### 6. TypeScript - Habilitar noImplicitAny

```json
// apps/mobile/tsconfig.json
"noImplicitAny": true
```

---

## 📊 CHECKLIST COMPLETO

Ver: `.claude/memory/checklists/phase-1.md`

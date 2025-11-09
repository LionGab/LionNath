# Configuração de Segredos Supabase Edge Functions

## 📋 Segredos Necessários

O projeto usa várias Edge Functions que precisam de chaves de API:

### Segredos Principais (Obrigatórios)

1. **GEMINI_API_KEY** - Google Gemini AI
   - Usado em: `nathia-chat`, `nat-ai-chat`, `personalize-tip`, `risk-classifier`, `moderation-service`, `behavior-analysis`
   - Obtenha em: https://makersuite.google.com/app/apikey

2. **CLAUDE_API_KEY** - Anthropic Claude AI
   - Usado em: `nathia-chat`, `nat-ai-chat`, `daily-insight`, `curate-content`, `curate-articles`, `personalize-tip`
   - Obtenha em: https://console.anthropic.com/account/keys

### Segredos Opcionais

3. **OPENAI_API_KEY** - OpenAI
   - Usado em: `transcribe-audio`, `nat-ai-chat`
   - Obtenha em: https://platform.openai.com/api-keys

4. **PERPLEXITY_API_KEY** - Perplexity AI
   - Usado em: `curate-content`, `curate-articles`
   - Obtenha em: https://www.perplexity.ai/settings/api

5. **ADMIN_API_KEY** - Chave de administração
   - Usado em: `curate-articles` (proteção de endpoints admin)
   - Gere uma chave segura aleatória

### Configurações Opcionais

6. **CLAUDE_MODEL** - Modelo Claude a usar
   - Padrão: `claude-3-5-sonnet-20241022`
   - Opções: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, etc.

7. **LLM_PROVIDER** - Provider LLM padrão
   - Padrão: `gemini`
   - Opções: `gemini`, `claude`

## 🚀 Como Configurar

### Opção A: Usar arquivo .env.prod (Recomendado)

1. **Crie o arquivo `.env.prod`** na raiz do projeto:
   ```bash
   cp supabase/functions/.env.prod.example .env.prod
   ```

2. **Edite `.env.prod`** com suas chaves reais:
   ```env
   GEMINI_API_KEY=sua-chave-gemini-aqui
   CLAUDE_API_KEY=sua-chave-claude-aqui
   OPENAI_API_KEY=sua-chave-openai-aqui
   PERPLEXITY_API_KEY=sua-chave-perplexity-aqui
   ADMIN_API_KEY=sua-chave-admin-aqui
   ```

3. **Configure no Supabase**:
   ```bash
   supabase secrets set --env-file .env.prod
   ```

### Opção B: Configurar individualmente

```bash
# Gemini
supabase secrets set GEMINI_API_KEY=sua-chave-gemini

# Claude
supabase secrets set CLAUDE_API_KEY=sua-chave-claude

# OpenAI
supabase secrets set OPENAI_API_KEY=sua-chave-openai

# Perplexity
supabase secrets set PERPLEXITY_API_KEY=sua-chave-perplexity

# Admin
supabase secrets set ADMIN_API_KEY=sua-chave-admin

# Opcionais
supabase secrets set CLAUDE_MODEL=claude-3-5-sonnet-20241022
supabase secrets set LLM_PROVIDER=gemini
```

### Opção C: Atualizar ou Remover

**Atualizar um segredo:**
```bash
supabase secrets set GEMINI_API_KEY=nova-chave-aqui
```

**Remover um segredo:**
```bash
supabase secrets unset GEMINI_API_KEY
```

**Listar segredos configurados:**
```bash
supabase secrets list
```

## 🔒 Segurança

### ⚠️ IMPORTANTE

1. **NUNCA commite `.env.prod`** no Git
2. **NUNCA exponha chaves** em logs ou respostas HTTP
3. **Use apenas `Deno.env.get()`** dentro das Edge Functions
4. **Valide sempre** se a chave existe antes de usar

### Exemplo de Uso Seguro

```typescript
// ✅ CORRETO
const apiKey = Deno.env.get('GEMINI_API_KEY');
if (!apiKey) {
  return new Response('Missing API key', { status: 500 });
}

// ❌ ERRADO - nunca logar a chave
console.log('API Key:', apiKey); // NUNCA FAÇA ISSO!

// ✅ CORRETO - usar em headers
const res = await fetch('https://api.example.com/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ ... }),
});
```

## 📊 Funções que Usam Cada Segredo

### GEMINI_API_KEY
- `nathia-chat` (fallback)
- `nat-ai-chat` (fallback)
- `personalize-tip` (principal)
- `risk-classifier` (obrigatório)
- `moderation-service` (obrigatório)
- `behavior-analysis` (obrigatório)
- `_shared/gemini-client.ts` (compartilhado)

### CLAUDE_API_KEY
- `nathia-chat` (principal)
- `nat-ai-chat` (principal)
- `daily-insight` (opcional)
- `curate-content` (opcional)
- `curate-articles` (opcional)
- `personalize-tip` (fallback)

### OPENAI_API_KEY
- `transcribe-audio` (obrigatório)
- `nat-ai-chat` (opcional)

### PERPLEXITY_API_KEY
- `curate-content` (opcional)
- `curate-articles` (opcional)

### ADMIN_API_KEY
- `curate-articles` (proteção admin)

## 🧪 Testar Configuração

Após configurar os segredos, teste uma função:

```bash
# Testar nathia-chat (precisa CLAUDE_API_KEY ou GEMINI_API_KEY)
curl -X POST https://seu-projeto.supabase.co/functions/v1/nathia-chat \
  -H "Authorization: Bearer sua-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!"}'

# Testar personalize-tip (precisa GEMINI_API_KEY)
curl -X POST https://seu-projeto.supabase.co/functions/v1/personalize-tip \
  -H "Authorization: Bearer sua-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user"}'
```

## 📝 Checklist

- [ ] Criar `.env.prod` com todas as chaves
- [ ] Configurar segredos no Supabase: `supabase secrets set --env-file .env.prod`
- [ ] Verificar segredos: `supabase secrets list`
- [ ] Testar funções que usam cada segredo
- [ ] Adicionar `.env.prod` ao `.gitignore` (se ainda não estiver)
- [ ] Documentar chaves em lugar seguro (1Password, LastPass, etc.)

## 🔗 Links Úteis

- **Supabase Secrets Docs**: https://supabase.com/docs/guides/functions/secrets
- **Google Gemini API**: https://makersuite.google.com/app/apikey
- **Anthropic Claude API**: https://console.anthropic.com/account/keys
- **OpenAI API**: https://platform.openai.com/api-keys
- **Perplexity AI**: https://www.perplexity.ai/settings/api

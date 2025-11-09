# ✅ Configuração de Segredos Supabase - Concluída

## 📋 O Que Foi Criado

### 1. Arquivo de Exemplo (`.env.prod.example`)
- Template com todos os segredos necessários
- Documentação inline de onde obter cada chave
- Valores placeholder para segurança

### 2. Documentação Completa (`SECRETS.md`)
- Guia passo a passo de configuração
- Lista de todas as funções que usam cada segredo
- Exemplos de uso seguro
- Troubleshooting comum

### 3. Script de Configuração (`setup-secrets.sh`)
- Script automatizado para configurar todos os segredos
- Validações de segurança
- Verificação de autenticação Supabase

### 4. Proteção Git (`.gitignore`)
- `.env.prod` adicionado ao `.gitignore`
- Garante que segredos nunca sejam commitados

## 🚀 Como Usar

### Método Rápido (Recomendado):

```bash
# 1. Criar arquivo .env.prod a partir do exemplo
cp supabase/functions/.env.prod.example .env.prod

# 2. Editar .env.prod com suas chaves reais
nano .env.prod  # ou seu editor preferido

# 3. Executar script de configuração
./supabase/functions/setup-secrets.sh
```

### Método Manual:

```bash
# 1. Criar .env.prod
cp supabase/functions/.env.prod.example .env.prod

# 2. Editar com suas chaves

# 3. Configurar no Supabase
supabase secrets set --env-file .env.prod
```

### Método Individual:

```bash
supabase secrets set GEMINI_API_KEY=sua-chave-aqui
supabase secrets set CLAUDE_API_KEY=sua-chave-aqui
supabase secrets set OPENAI_API_KEY=sua-chave-aqui
supabase secrets set PERPLEXITY_API_KEY=sua-chave-aqui
supabase secrets set ADMIN_API_KEY=sua-chave-aqui
```

## 🔐 Segredos Necessários

### Obrigatórios para Funcionalidade Básica:
- ✅ **GEMINI_API_KEY** - Usado em múltiplas funções
- ✅ **CLAUDE_API_KEY** - Usado em nathia-chat (principal)

### Opcionais (para funcionalidades específicas):
- ⚪ **OPENAI_API_KEY** - Para transcrição de áudio
- ⚪ **PERPLEXITY_API_KEY** - Para curadoria de conteúdo
- ⚪ **ADMIN_API_KEY** - Para proteção de endpoints admin

## 📊 Funções que Precisam de Segredos

### nathia-chat (Principal)
- **CLAUDE_API_KEY** (obrigatório)
- GEMINI_API_KEY (fallback)

### personalize-tip
- **GEMINI_API_KEY** (obrigatório)
- CLAUDE_API_KEY (fallback)

### risk-classifier
- **GEMINI_API_KEY** (obrigatório)

### moderation-service
- **GEMINI_API_KEY** (obrigatório)

### transcribe-audio
- **OPENAI_API_KEY** (obrigatório)

### curate-content / curate-articles
- PERPLEXITY_API_KEY (opcional)
- CLAUDE_API_KEY (opcional)
- ADMIN_API_KEY (proteção)

## ✅ Checklist

- [x] Arquivo `.env.prod.example` criado
- [x] Documentação `SECRETS.md` criada
- [x] Script `setup-secrets.sh` criado
- [x] `.env.prod` adicionado ao `.gitignore`
- [ ] Criar `.env.prod` local com chaves reais
- [ ] Configurar segredos no Supabase
- [ ] Testar funções após configuração

## 🔗 Links Úteis

- **Documentação Completa**: `supabase/functions/SECRETS.md`
- **Supabase Secrets Docs**: https://supabase.com/docs/guides/functions/secrets
- **Google Gemini API**: https://makersuite.google.com/app/apikey
- **Anthropic Claude API**: https://console.anthropic.com/account/keys

## ⚠️ Importante

1. **NUNCA commite `.env.prod`** - já está no `.gitignore`
2. **Use apenas em Edge Functions** - nunca exponha no frontend
3. **Valide sempre** se a chave existe antes de usar
4. **Nunca logue chaves** em console ou respostas HTTP

Tudo pronto para configurar os segredos! 🎉

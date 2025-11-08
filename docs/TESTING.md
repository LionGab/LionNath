# 🧪 Guia de Testes - Edge Functions NAT-IA

Guia completo para testar as Edge Functions localmente sem precisar de API keys reais.

## 🎯 Objetivo

Testar as Edge Functions NAT-IA rapidamente usando **mocks** (respostas simuladas) sem:

- ❌ Precisar de API keys reais
- ❌ Gastar créditos de API
- ❌ Configurar Supabase
- ❌ Deploy em produção

---

## 🚀 Início Rápido

### Opção 1: Menu Interativo (Recomendado)

```bash
# Executar ambiente de testes interativo
node scripts/test-nathia-functions.js
```

Isso abre um menu onde você pode:

- ✅ Testar cada função individualmente
- ✅ Ver requests e responses formatados
- ✅ Testar todas as funções de uma vez
- ✅ Interface colorida e amigável

### Opção 2: Via NPM Script

```bash
# Executar testes
npm run test:nathia

# OU
pnpm test:nathia
```

### Opção 3: CLI (Função Específica)

```bash
# Testar função específica
node scripts/test-nathia-functions.js nathia-chat

# Com payload customizado
node scripts/test-nathia-functions.js nathia-chat '{"user_id":"test","message":"Olá"}'
```

---

## 📋 O Que Cada Teste Faz

### 1. **nathia-chat** - Chat Principal

**Testa**: Conversa empática com a usuária

**Request de Exemplo**:

```json
{
  "user_id": "test-user-123",
  "message": "Estou com muito enjoo, é normal?",
  "context": {
    "stage": "gestante",
    "pregnancy_week": 8,
    "mood": "preocupada"
  }
}
```

**Response Esperado**:

- ✅ Resposta empática e acolhedora
- ✅ Recomendações contextuais
- ✅ Análise de segurança (safety check)
- ✅ Sugestões de conteúdo/círculos/hábitos
- ✅ Métricas de uso (tokens)

---

### 2. **nathia-curadoria** - Curadoria de Conteúdo

**Testa**: Simplificação de conteúdo educacional

**Request de Exemplo**:

```json
{
  "user_id": "test-user-123",
  "content_id": "content-alimentacao-gravidez",
  "texto": "Artigo longo sobre alimentação...",
  "tipo": "resumo"
}
```

**Response Esperado**:

- ✅ Título simplificado
- ✅ Resumo em linguagem clara (150-200 palavras)
- ✅ Pontos principais em bullet points
- ✅ Relevância para a usuária
- ✅ Flag de risco (se houver)

---

### 3. **nathia-moderacao** - Moderação Assistida

**Testa**: Classificação de mensagens da comunidade

**Request de Exemplo**:

```json
{
  "message_id": "msg-123",
  "texto": "Obrigada pelo apoio! Vocês são incríveis 💙",
  "author_context": {
    "user_id": "test-user-123",
    "previous_violations": 0
  }
}
```

**Response Esperado**:

- ✅ Labels (ok, julgamento, toxicidade, etc)
- ✅ Nível de severidade (none, low, medium, high)
- ✅ Sugestão de edição (se aplicável)
- ✅ Rationale (justificativa)
- ✅ Auto-approve flag

---

### 4. **nathia-onboarding** - Onboarding Inteligente

**Testa**: Análise de respostas de onboarding e geração de starter pack

**Request de Exemplo**:

```json
{
  "userId": "test-user-123",
  "answers": {
    "stage": "gestante",
    "pregnancyWeek": 12,
    "concerns": ["anxiety", "breastfeeding"],
    "expectations": ["info", "support", "community"]
  }
}
```

**Response Esperado**:

- ✅ Mensagem de boas-vindas personalizada
- ✅ Starter pack com:
  - Círculos recomendados
  - Hábitos sugeridos
  - Conteúdos relevantes
- ✅ Justificativa para cada recomendação

---

### 5. **nathia-recs** - Recomendações

**Testa**: Geração de recomendações baseadas em histórico

**Request de Exemplo**:

```json
{
  "user_id": "test-user-123",
  "context": {
    "stage": "mae",
    "baby_age_months": 3,
    "recent_topics": ["sono", "rotina", "cansaco"]
  }
}
```

**Response Esperado**:

- ✅ Conteúdos recomendados (artigos, vídeos)
- ✅ Círculos sugeridos
- ✅ Hábito do dia
- ✅ Justificativa baseada no contexto

---

## 🎨 Interface do Menu

Quando você roda `node scripts/test-nathia-functions.js`, verá:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        🤖 NAT-IA Edge Functions - Ambiente de Teste      ║
║                                                           ║
║     Teste as funções localmente sem API keys reais       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📋 MENU DE TESTES:

1 - Testar nathia-chat (Chat Principal)
2 - Testar nathia-curadoria (Curadoria de Conteúdo)
3 - Testar nathia-moderacao (Moderação Assistida)
4 - Testar nathia-onboarding (Onboarding Inteligente)
5 - Testar nathia-recs (Recomendações)
6 - Testar TODAS as funções
0 - Sair

➜ Escolha uma opção:
```

---

## 🔧 Configuração (Opcional)

### Arquivo `.env.test`

Já está criado em `supabase/functions/.env.test` com valores mock:

```bash
# Supabase (Mock local)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...

# AI Keys (Mock)
GEMINI_API_KEY=mock-gemini-key-for-testing
CLAUDE_API_KEY=mock-claude-key-for-testing
OPENAI_API_KEY=mock-openai-key-for-testing
PERPLEXITY_API_KEY=mock-perplexity-key-for-testing

# Flags
MOCK_MODE=true
LOG_LEVEL=debug
```

**Nota**: Este arquivo usa **mocks** (respostas fake). Para testar com APIs reais, substitua pelas chaves verdadeiras.

---

## 📊 Output Esperado

Quando você testa uma função, verá:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Testando: nathia-chat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Request:
{
  "user_id": "test-user-123",
  "message": "Estou com muito enjoo",
  "context": {
    "stage": "gestante",
    "pregnancy_week": 8
  }
}

⏳ Processando...

✅ Response:
{
  "reply": "Olá! Eu sou a NAT-IA...",
  "actions": ["ler_conteudo"],
  "safety": { "level": "safe" },
  "labels": { "mood": "preocupada" },
  "recs": {
    "content": ["Enjoos na Gravidez"],
    "circles": ["Gestantes 1º Trimestre"]
  },
  "usage": {
    "totalTokens": 630
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🆚 Mocks vs APIs Reais

### Modo Mock (Padrão)

✅ **Vantagens**:

- Rápido (sem latência de rede)
- Grátis (sem gastar créditos)
- Offline (não precisa de internet)
- Previsível (sempre mesmas respostas)

❌ **Desvantagens**:

- Não testa integração real com Gemini/Claude/etc
- Respostas fixas (não dinâmicas)

### APIs Reais (Opcional)

Para testar com APIs reais:

1. Crie `supabase/functions/.env` (copie de `.env.example`)
2. Adicione suas API keys reais
3. Mude `MOCK_MODE=false`
4. Execute: `supabase functions serve`

```bash
# Copiar template
cp supabase/functions/.env.example supabase/functions/.env

# Editar e adicionar chaves reais
nano supabase/functions/.env

# Iniciar Supabase local
supabase start

# Servir funções
supabase functions serve --env-file supabase/functions/.env

# Testar com curl
curl -X POST http://localhost:54321/functions/v1/nathia-chat \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "Olá"}'
```

---

## 🐛 Troubleshooting

### Erro: "node: command not found"

**Solução**: Instale o Node.js

```bash
# Windows (Chocolatey)
choco install nodejs

# macOS (Homebrew)
brew install node

# Linux (apt)
sudo apt install nodejs npm
```

### Script não executa

**Solução**: Dê permissão de execução

```bash
# Linux/macOS
chmod +x scripts/test-nathia-functions.js

# Windows (PowerShell)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "readline is not defined"

**Solução**: O `readline` é nativo do Node.js. Certifique-se de usar Node.js 14+

```bash
node --version  # Deve ser >= 14.0.0
```

---

## 📦 Arquivos Criados

```
projeto/
├── scripts/
│   └── test-nathia-functions.js    # Script de teste interativo
├── supabase/functions/
│   └── .env.test                   # Environment variables para teste
└── docs/
    └── TESTING.md                  # Esta documentação
```

---

## 🎯 Próximos Passos

Após testar localmente com mocks:

1. **Testar com APIs Reais**:
   - Configure `.env` com chaves reais
   - Execute `supabase functions serve`

2. **Deploy para Produção**:
   - Configure secrets: `supabase secrets set`
   - Deploy: `supabase functions deploy`

3. **Integrar no App**:
   - Use `@supabase/supabase-js`
   - Chame via `supabase.functions.invoke()`

---

## 📚 Referências

- **Edge Functions**: [supabase/functions/README.md](../supabase/functions/README.md)
- **Secrets**: [docs/SECRETS.md](./SECRETS.md)
- **Deploy**: [supabase/DEPLOYMENT.md](../supabase/DEPLOYMENT.md)

---

**Última atualização**: 2025-01-15
**Versão**: 1.0

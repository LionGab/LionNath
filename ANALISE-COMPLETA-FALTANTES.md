# 🔍 Análise Completa: O Que Falta Para o Projeto Funcionar

**Data:** 2025-10-29  
**Projeto:** Nossa Maternidade  
**Status:** ⚠️ Projeto em desenvolvimento - Múltiplos componentes faltantes

---

## 📋 Resumo Executivo

Este documento identifica **todos os componentes, configurações e arquivos faltantes** que impedem o projeto "Nossa Maternidade" de funcionar completamente em produção.

### Status Geral
- ✅ **Arquitetura:** Estrutura base criada
- ✅ **Design System:** Componentes básicos implementados
- ✅ **Navegação:** Stack e Tab Navigation configurados
- ⚠️ **Backend:** Supabase configurado mas sem deploy completo
- ❌ **Configuração:** Variáveis de ambiente faltando
- ❌ **Repositórios:** Padrão Repository não implementado
- ❌ **Validações:** Validações de input e API keys faltando
- ❌ **Tipos:** Sistema de tipos incompleto
- ❌ **Testes:** Nenhum teste implementado

---

## 🚨 CRÍTICO - Bloqueia Execução

### 1. Arquivo `.env.local` Não Existe ⚠️

**Impacto:** App não consegue se conectar ao Supabase nem às APIs de IA

**Arquivos Afetados:**
- `src/config/api.ts` - Todas as chaves retornam string vazia
- `src/services/supabase.ts` - Cliente Supabase com URLs vazias

**Solução:**
```bash
# Criar arquivo .env.local na raiz do projeto
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_gemini
EXPO_PUBLIC_CLAUDE_API_KEY=sua_chave_claude (opcional - fallback)
EXPO_PUBLIC_OPENAI_API_KEY=sua_chave_openai (opcional)
```

**Arquivo `.env.example`:** ❌ NÃO EXISTE - Precisa ser criado

---

### 2. Banco de Dados Supabase Não Configurado ⚠️

**Impacto:** Tabelas não existem, queries falham

**Arquivos SQL Disponíveis:**
- ✅ `supabase-setup.sql` - Schema básico
- ✅ `SCHEMA_COMPLETO_FINAL.sql` - Schema completo
- ✅ `supabase/schema-club-valente-completo.sql`
- ✅ `supabase/schema-nossa-maternidade-completo.sql`

**Tabelas Necessárias:**
- `user_profiles` - Perfis de usuários
- `chat_messages` - Mensagens do chat
- `daily_plans` - Planos diários
- `conversation_memory` - Memória conversacional
- Outras tabelas do schema completo

**Ação Necessária:**
1. Acessar Supabase Dashboard
2. Executar SQL Editor com `supabase-setup.sql` OU `SCHEMA_COMPLETO_FINAL.sql`
3. Verificar se RLS (Row Level Security) está configurado
4. Configurar políticas de segurança

**Status:** ❌ Não executado (assumindo)

---

### 3. Edge Functions Não Deployadas ⚠️

**Impacto:** `chatWithNATIA()` falha porque Edge Function não existe

**Funções Necessárias:**
```
supabase/functions/
├── nathia-chat/          ✅ Existe código
├── nat-ai-chat/          ✅ Existe código  
├── moderation-service/   ✅ Existe código
├── risk-classifier/      ✅ Existe código
├── behavior-analysis/    ✅ Existe código
├── lgpd-requests/        ✅ Existe código
└── transcribe-audio/     ✅ Existe código
```

**Deploy Necessário:**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-ref

# Deploy de cada função
supabase functions deploy nathia-chat
supabase functions deploy moderation-service
supabase functions deploy risk-classifier
# ... etc
```

**Status:** ❌ Não deployadas (assumindo)

---

### 4. Validação de API Keys Faltando ⚠️

**Problema:** `src/config/api.ts` apenas avisa com `console.warn`, não bloqueia execução

**Código Atual:**
```typescript
// ⚠️ PROBLEMA: Apenas avisa, não bloqueia
function validateApiKey(key: string | undefined, keyName: string): string {
  if (!key || key.trim() === '') {
    console.warn(`⚠️ API key missing: ${keyName}`);
    return ''; // ⚠️ Retorna string vazia, não lança erro
  }
  return key;
}
```

**Solução Necessária:**
- Criar função `validateRequiredKeys()` que LANÇA ERRO se faltar
- Chamar no `App.tsx` antes de renderizar
- Mostrar tela de erro amigável ao usuário

---

## 🔴 ALTO RISCO - Funcionalidades Quebradas

### 5. Repositórios Não Implementados 🔴

**Problema:** Lógica de negócio misturada com UI (violação de arquitetura)

**Arquivos Faltantes:**
- ❌ `src/repositories/DailyPlanRepository.ts`
- ❌ `src/repositories/UserRepository.ts`
- ❌ `src/repositories/ChatRepository.ts` (implícito)

**Referências no Código:**
- `valeapena.txt:92-93` - Menciona criação dos repositórios
- `.cursor/prompts/workflow-guide.md:153` - Menciona refatoração para repository pattern

**Arquivos que Precisam Refatorar:**
- `src/screens/HomeScreen.tsx` - Usa `getDailyPlan` diretamente
- `src/screens/DailyPlanScreen.tsx` - Usa `saveDailyPlan` diretamente
- `src/screens/ChatScreen.tsx` - Usa `saveChatMessage` diretamente
- `src/services/supabase.ts` - Funções expostas diretamente

**Solução:** Criar camada de repositórios que encapsula acesso ao Supabase

---

### 6. Tipos Centralizados Incompletos 🔴

**Problema:** 11 ocorrências de `any` em 8 arquivos (segundo `valeapena.txt`)

**Arquivos Afetados:**
- `src/services/supabase.ts` - `context_data?: any`
- `src/services/ai.ts` - `history: any[]`
- Outros arquivos com tipos não definidos

**Arquivo `src/types/index.ts`:** ❌ NÃO EXISTE

**Tipos Necessários:**
```typescript
// src/types/index.ts - DEVE SER CRIADO
export interface UserProfile { ... }
export interface ChatMessage { ... }
export interface DailyPlan { ... }
export interface NavigationParams { ... }
// ... etc
```

**Ação:** Criar `src/types/index.ts` e remover todos os `any`

---

### 7. Validações de Input Faltando 🔴

**Problema:** `OnboardingScreen.tsx` aceita dados inválidos

**Validações Necessárias:**
- Semana de gravidez: 1-42 (não pode ser 0 ou >42)
- Nome: não pode ser vazio
- Email: formato válido (se fornecido)
- Tipo de usuário: deve ser 'gestante' | 'mae' | 'tentante'

**Arquivo:** ❌ `src/utils/validation.ts` NÃO EXISTE

**Solução:** Criar função de validação com feedback visual

---

### 8. Tipagem de Navegação Quebrada 🔴

**Problema:** `as never` usado em todos os `navigate()` calls

**Exemplo do Problema:**
```typescript
// ⚠️ Type casting perigoso
navigation.navigate('Chat' as never);
```

**Arquivo:** `src/navigation/types.ts` - Tipos podem estar incompletos

**Solução:** 
- Verificar `RootStackParamList` em `types.ts`
- Remover todos os `as never`
- Garantir type-safety completo

---

## 🟡 MÉDIO RISCO - Melhorias Necessárias

### 9. LoadingScreen Component Faltando 🟡

**Problema:** `return null` durante loading (UX ruim)

**Arquivo:** ❌ `src/components/LoadingScreen.tsx` NÃO EXISTE

**Nota:** `src/shared/components/Loading.tsx` existe, mas é diferente de `LoadingScreen`

**Uso Necessário:**
- Substituir `return null` por `<LoadingScreen />`
- Usar em `AppNavigator` durante verificação de onboarding
- Usar em outras screens durante carregamento inicial

---

### 10. Cores Hardcoded 🟡

**Arquivos com Cores Hardcoded:**
- `src/components/Badge.tsx`
- `src/components/Logo.tsx`
- `src/screens/ChatScreen.tsx`

**Solução:** Usar apenas cores do tema (`src/theme/colors.ts`)

---

### 11. Hook `useDailyPlan` Faltando 🟡

**Problema:** Código duplicado entre `HomeScreen` e `DailyPlanScreen`

**Arquivo:** ❌ `src/hooks/useDailyPlan.ts` NÃO EXISTE

**Solução:** Criar hook que encapsula lógica de plano diário

---

### 12. Sistema de Logging Não Implementado 🟡

**Problema:** 20+ `console.log` em produção

**Arquivo:** ✅ `src/utils/logger.ts` EXISTE (verificar implementação)

**Ação:** Substituir todos `console.log/error` por `logger.info/error`

---

### 13. Magic Numbers Não Extraídos 🟡

**Problema:** Números mágicos espalhados pelo código

**Arquivo:** ✅ `src/constants/theme.ts` existe, mas precisa de `src/constants/index.ts`

**Constantes Necessárias:**
- Limites de interação diária
- Timeouts de API
- Tamanhos de lista
- Outros valores hardcoded

---

## 🟢 BAIXO RISCO - Refinamentos

### 14. Testes Não Implementados 🟢

**Status:** ❌ Nenhum teste encontrado

**Arquivos Necessários:**
- `jest.config.js`
- `__tests__/` directory
- Testes para componentes críticos
- Testes para hooks
- Testes E2E básicos

**Dependências:** Não instaladas (Jest, React Native Testing Library)

---

### 15. ESLint/Prettier Configuração Incompleta 🟢

**Status:** ✅ Configurado parcialmente

**Verificar:**
- Regras strict ativadas?
- Formatação automática no save?
- Pre-commit hooks funcionando?

---

### 16. Documentação JSDoc Incompleta 🟢

**Problema:** Services e hooks sem documentação completa

**Ação:** Adicionar JSDoc em todas as funções públicas

---

## 📦 Configurações de Ambiente

### Variáveis de Ambiente Necessárias

Criar `.env.local` com:

```env
# ==========================================
# SUPABASE (OBRIGATÓRIO)
# ==========================================
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://xxx.supabase.co/functions/v1

# ==========================================
# IA APIs (OBRIGATÓRIO: Gemini, OPCIONAL: outros)
# ==========================================
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-... (opcional - fallback)
EXPO_PUBLIC_OPENAI_API_KEY=sk-... (opcional - validação)

# ==========================================
# PAGAMENTOS (OPCIONAL - para premium)
# ==========================================
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# ==========================================
# NOTIFICAÇÕES (OPCIONAL)
# ==========================================
EXPO_PUBLIC_ONESIGNAL_APP_ID=...

# ==========================================
# OUTRAS APIs (OPCIONAL)
# ==========================================
EXPO_PUBLIC_PERPLEXITY_API_KEY=...
EXPO_PUBLIC_ELEVENLABS_API_KEY=...
EXPO_PUBLIC_HEYGEN_API_KEY=...
```

---

## 🗄️ Banco de Dados - Checklist

### Tabelas Principais
- [ ] `user_profiles` criada
- [ ] `chat_messages` criada
- [ ] `daily_plans` criada
- [ ] `conversation_memory` criada
- [ ] Outras tabelas do schema completo

### Segurança (RLS)
- [ ] Row Level Security ativado
- [ ] Políticas de acesso configuradas
- [ ] Políticas de inserção configuradas
- [ ] Políticas de atualização configuradas
- [ ] Políticas de exclusão configuradas

### Extensões
- [ ] `pgvector` extension instalada (para embeddings)
- [ ] Outras extensões necessárias

---

## 🔧 Edge Functions - Checklist

### Deploy Necessário
- [ ] `nathia-chat` deployada e testada
- [ ] `nat-ai-chat` deployada e testada
- [ ] `moderation-service` deployada e testada
- [ ] `risk-classifier` deployada e testada
- [ ] `behavior-analysis` deployada e testada
- [ ] `lgpd-requests` deployada e testada
- [ ] `transcribe-audio` deployada e testada

### Configuração
- [ ] Secrets configurados no Supabase Dashboard
- [ ] URLs de callback configuradas
- [ ] CORS configurado (se necessário)

---

## 📁 Arquivos Faltantes - Lista Completa

### Críticos (Bloqueiam Execução)
1. ❌ `.env.local` - Variáveis de ambiente
2. ❌ `.env.example` - Template de exemplo

### Altos (Quebram Funcionalidades)
3. ❌ `src/repositories/DailyPlanRepository.ts`
4. ❌ `src/repositories/UserRepository.ts`
5. ❌ `src/repositories/ChatRepository.ts`
6. ❌ `src/types/index.ts` - Tipos centralizados
7. ❌ `src/utils/validation.ts` - Validações de input

### Médios (Melhoram UX/Código)
8. ❌ `src/components/LoadingScreen.tsx`
9. ❌ `src/hooks/useDailyPlan.ts`
10. ❌ `src/constants/index.ts` - Constantes não-tema

### Baixos (Refinamentos)
11. ❌ `jest.config.js` - Configuração de testes
12. ❌ `__tests__/` - Diretório de testes

---

## 🎯 Plano de Ação Prioritário

### Fase 1: Bloqueios Críticos (2-3 horas)
1. ✅ Criar `.env.example` com template
2. ✅ Criar `.env.local` com valores reais (usuário)
3. ✅ Validar API keys no `App.tsx`
4. ✅ Executar SQL no Supabase
5. ✅ Deploy das Edge Functions críticas (`nathia-chat`)

### Fase 2: Funcionalidades Essenciais (4-6 horas)
6. ✅ Criar `src/types/index.ts`
7. ✅ Criar `src/utils/validation.ts`
8. ✅ Criar `src/repositories/` (3 arquivos)
9. ✅ Refatorar screens para usar repositórios
10. ✅ Corrigir tipagem de navegação

### Fase 3: Melhorias UX (2-3 horas)
11. ✅ Criar `LoadingScreen.tsx`
12. ✅ Criar `useDailyPlan.ts` hook
13. ✅ Substituir cores hardcoded
14. ✅ Implementar sistema de logging

### Fase 4: Qualidade (Ongoing)
15. ✅ Configurar testes
16. ✅ Adicionar JSDoc
17. ✅ Extrair magic numbers
18. ✅ Code review final

---

## 📊 Métricas de Completude

| Categoria | Status | Completude |
|-----------|--------|------------|
| **Configuração** | ⚠️ | 40% |
| **Backend (Supabase)** | ⚠️ | 60% |
| **Arquitetura** | ✅ | 80% |
| **Componentes UI** | ✅ | 85% |
| **Tipos TypeScript** | ⚠️ | 70% |
| **Validações** | ❌ | 20% |
| **Testes** | ❌ | 0% |
| **Documentação** | ⚠️ | 50% |

**Geral:** ⚠️ **~55% Completo**

---

## 🚀 Comandos de Setup Necessários

```bash
# 1. Instalar dependências (se ainda não feito)
npm install

# 2. Criar arquivo de ambiente
cp .env.example .env.local
# Editar .env.local com valores reais

# 3. Configurar Supabase CLI
npm install -g supabase
supabase login
supabase link --project-ref seu-project-ref

# 4. Executar migrations SQL
# Via Supabase Dashboard → SQL Editor

# 5. Deploy Edge Functions
supabase functions deploy nathia-chat
supabase functions deploy moderation-service
supabase functions deploy risk-classifier

# 6. Validar instalação
npm run lint
npm run type-check  # se existir
npm start
```

---

## ✅ Checklist Final de Funcionamento

### Antes de Testar
- [ ] `.env.local` configurado com todas as chaves
- [ ] Banco de dados Supabase criado e populado
- [ ] Edge Functions deployadas
- [ ] RLS configurado no Supabase

### Testes Básicos
- [ ] App inicia sem erros
- [ ] Onboarding funciona
- [ ] Navegação entre telas funciona
- [ ] Chat com NathIA funciona
- [ ] Plano diário carrega
- [ ] Perfil do usuário carrega

### Testes Avançados
- [ ] Offline mode funciona
- [ ] Notificações push funcionam
- [ ] Pagamentos funcionam (se configurado)
- [ ] LGPD requests funcionam

---

## 📝 Notas Adicionais

### Assumptions
- Assumindo que Supabase project já foi criado
- Assumindo que chaves de API já foram obtidas
- Assumindo que SQL não foi executado ainda
- Assumindo que Edge Functions não foram deployadas

### Dependências Externas
- Supabase Account (gratuito disponível)
- Google Gemini API Key (obrigatório)
- Claude API Key (opcional - fallback)
- OpenAI API Key (opcional - validação)

### Próximos Passos Sugeridos
1. Criar `.env.example` como template
2. Documentar processo de setup completo
3. Criar script de setup automatizado
4. Implementar health checks
5. Adicionar monitoramento de erros (Sentry)

---

**Última Atualização:** 2025-10-29  
**Próxima Revisão:** Após implementação das fases críticas
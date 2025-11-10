# 🚀 Roadmap Mobile-First: O Que Copiar do Projeto Web

**Status**: PRONTO PARA COPIAR E IMPLEMENTAR
**Data**: 2025-11-10
**Foco**: APENAS iOS/Android - TypeScript Puro

---

## 📋 RESUMO: O QUE ESTÁ FUNCIONAL HOJE

### ✅ No Seu App Mobile (React Native):

```
✅ NathIA Chat (Gemini 2.0 Flash)
✅ Onboarding 5 Steps
✅ Autenticação (Supabase)
✅ Design System Completo
✅ Hábitos (Backend 100%)
✅ MundoNath (Feed)
✅ Gamificação (Backend)
```

### 🔴 O que FALTA integrar do Projeto Web:

```
❌ GamificationManager (classe pronta para copiar)
❌ MemoryManager (classe pronta para copiar)
❌ Postpartum Screening (Edge Function pronta)
❌ Multi-AI Chat Strategy (lógica pronta)
```

---

## 🎯 TOP 5 FUNCIONALIDADES MAIS VALIOSAS (Prioridade)

### 1️⃣ **GamificationManager** - COPIAR DIRETO

**Custo**: 2 horas
**Valor**: Desbloqueie sistema completo de pontos/levels

```typescript
// COPIAR DE: Downloads/NossaMaternidade/lib/gamification/gamification-manager.ts
// COLAR EM: src/lib/gamification/gamification-manager.ts

// 100% TypeScript puro - sem dependências web
// Use diretamente em seu HabitsScreen

import { GamificationManager } from '@/lib/gamification/gamification-manager';

const manager = new GamificationManager(supabase, userId);

// Registrar uma atividade = ganha pontos + streak + achievements
const result = await manager.recordActivity('journal', { duration: 15 });
console.log(`Ganhou ${result.pointsEarned} pontos!`);
console.log(`Desbloqueou: ${result.newAchievements.map((a) => a.name)}`);
if (result.leveledUp) console.log('🎉 LEVEL UP!');
```

**Já Implementado no Code**:

- `recordActivity()` - registra atividade
- `updateStreak()` - atualiza sequência
- `addPoints()` - soma pontos + level up automático
- `checkAchievements()` - verifica badges desbloqueadas
- `updateChallengeProgress()` - desafios semanais
- `getStats()` - retorna estatísticas

**Banco de Dados (já existe)**:

- `user_gamification` ✅
- `daily_activities` ✅
- `achievements_unlocked` ✅
- `weekly_challenges` ✅

---

### 2️⃣ **Postpartum Depression Screening** - EDGE FUNCTION

**Custo**: 3 horas
**Valor**: Triagem automática de DPP (CRÍTICO para saúde)

```typescript
// COPIAR DE: Downloads/NossaMaternidade/app/api/multi-ai/postpartum-screening/route.ts
// COLAR EM: supabase/functions/postpartum-screening/index.ts (DENO)

// O que faz:
// 1. Coleta histórico de conversas + análise de sentimento
// 2. Claude (Sonnet 4) faz análise psicológica profunda
// 3. Gemini identifica padrões temporais
// 4. Gera score EPDS (0-30, >13 = possível DPP)
// 5. Cria alerta se risco alto

// Chamar do mobile assim:
const response = await supabase.functions.invoke('postpartum-screening');
const screening = await response.json();

console.log(`Risk Score: ${screening.riskScore}`); // 0-30
console.log(`Necessita profissional? ${screening.needsProfessionalHelp}`); // sim/não
console.log(`Recomendações: ${screening.recommendations}`);

// Se risco > 13 → Cria alerta no banco
// Se risco > 20 → Severidade "critical"
```

**Componentes Necessários**:

- ✅ `Supabase.functions` (edge-functions)
- ✅ Tabela `postpartum_screenings` (precisa criar)
- ✅ Tabela `health_alerts` (precisa criar)
- ✅ Claude Sonnet 4 API key
- ✅ Gemini API key

**UI no Mobile**:

```tsx
// Adicionar em ProfileScreen
<Button onPress={() => supabase.functions.invoke('postpartum-screening')} title="Fazer Triagem de Saúde Mental" />;

// Mostrar resultado
{
  screening && (
    <Card>
      <Text>Score de Risco: {screening.riskScore}/30</Text>
      {screening.riskScore > 13 && (
        <Alert color="red">
          ⚠️ Você pode estar com risco de depressão pós-parto. Procure um profissional de saúde.
        </Alert>
      )}
    </Card>
  );
}
```

---

### 3️⃣ **MemoryManager** - COPIAR COM CAUTELA

**Custo**: 4 horas (requer setup de embedding)
**Valor**: Conversas com contexto histórico (memória IA)

```typescript
// COPIAR DE: Downloads/NossaMaternidade/lib/mcp/memory-manager.ts
// COLAR EM: src/lib/memory/memory-manager.ts

// O que faz:
// 1. Armazena cada mensagem de chat com embedding
// 2. Busca contexto relevante quando IA responde
// 3. IA nunca esquece o histórico

// Chamar no NathiaChat assim:
import { MemoryManager } from '@/lib/memory/memory-manager';

const memory = new MemoryManager(userId);

// Após cada mensagem do usuário, guardar
await memory.storeMemory(userMessage, 'conversation', messageId);

// Quando IA vai responder, buscar contexto
const context = await memory.getComprehensiveContext(userMessage);
// Passá-lo para o prompt do Gemini
```

**⚠️ Dependência**: Usa `ai` SDK para embedding

```bash
npm install ai @ai-sdk/openai
```

**Custo API**: $0.02 por 1K embeddings
(Barato, mas requer setup)

---

### 4️⃣ **Multi-AI Chat Modes** - INTEGRAR NO NATHIACHAT

**Custo**: 2 horas
**Valor**: Oferece 3 tipos de IA especializadas

```typescript
// NÃO COPIAR CÓDIGO (já existe)
// APENAS integrar a LÓGICA

// Modo 1: EMPÁTICO (Claude)
// Para: Suporte emocional, acolhimento
// Use quando: Usuária fala de medo, ansiedade, tristeza
const response = await anthropic.messages.create({
  model: "claude-sonnet-4",
  system: "Você é uma psicóloga empática..."
})

// Modo 2: GERAL (Gemini - você já usa)
// Para: Perguntas variadas, recomendações
// Use quando: Pergunta sobre hábitos, nutrição, etc

// Modo 3: PESQUISA (Perplexity - NOVO)
// Para: Buscar informações da internet
// Use quando: "Qual é o melhor ferro para pós-parto?"
const response = await fetch("https://api.perplexity.ai/", {
  method: "POST",
  body: JSON.stringify({
    model: "sonar-pro",
    messages: [{ role: "user", content: query }]
  })
})

// INTEGRAÇÃO NO MOBILE:
// Adicionar 3 botões no topo do chat
<Button onPress={() => setMode("empathetic")}>❤️ Modo Empático</Button>
<Button onPress={() => setMode("general")}>🧠 Conversação</Button>
<Button onPress={() => setMode("research")}>🔍 Pesquisa</Button>

// Trocar modelo conforme o modo
const model = mode === "empathetic" ? anthropic : mode === "research" ? perplexity : gemini
```

---

### 5️⃣ **Sentiment Analysis** - EDGE FUNCTION

**Custo**: 2 horas
**Valor**: Análise emocional automática

```typescript
// COPIAR DE: Downloads/NossaMaternidade/app/api/multi-ai/sentiment/route.ts
// COLAR EM: supabase/functions/sentiment-analysis/index.ts

// O que faz:
// 1. Analisa respostas do onboarding
// 2. Identifica emoção, risco, preocupações
// 3. Recomenda ações de autocuidado

// Chamar após Onboarding 5 Steps:
const response = await supabase.functions.invoke('sentiment-analysis', {
  body: {
    responses: {
      como_se_sente: 'Estou muito cansada',
      principais_medos: 'Não conseguir amamentar',
      rede_apoio: 'Meu marido ajuda',
    },
  },
});

const analysis = await response.json();
console.log(`Emoção: ${analysis.emotion}`); // alegre, ansiosa, triste, etc
console.log(`Nível de risco: ${analysis.riskLevel}`); // baixo/médio/alto
console.log(`Recomendações: ${analysis.recommendations}`);

// Salvar no banco para trending histórico
```

---

## 🛠️ PLANO DE IMPLEMENTAÇÃO (Passo a Passo)

### Semana 1: Gamificação Completa (2h)

```bash
# 1. Copie o arquivo
cp Downloads/NossaMaternidade/lib/gamification/gamification-manager.ts \
   src/lib/gamification/gamification-manager.ts

# 2. Abra seu HabitsScreen.tsx e integre:
import { GamificationManager } from "@/lib/gamification/gamification-manager"

const manager = new GamificationManager(supabase, user.id)

// Ao completar um hábito:
const result = await manager.recordActivity("self_care", {
  habitName: "Meditação",
  duration: 15
})

// 3. Mostrar resultados:
<Text>Pontos: {stats.totalPoints}</Text>
<Text>Nível: {stats.currentLevel}</Text>
<Text>Sequência: {stats.currentStreak}🔥</Text>
<Text>Badges: {stats.achievements.length}</Text>

# 4. Testar no simulador
npm run ios  # ou android
```

### Semana 2: Postpartum Screening (3h)

```bash
# 1. Copie a Edge Function
mkdir -p supabase/functions/postpartum-screening
cp Downloads/NossaMaternidade/app/api/multi-ai/postpartum-screening/route.ts \
   supabase/functions/postpartum-screening/index.ts

# 2. Adaptar de Next.js para Deno:
# Mudar: import { NextResponse } from "next/server"
# Para:  import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

# 3. Criar tabelas SQL:
-- supabase/migrations/[timestamp]_create_postpartum_tables.sql
CREATE TABLE postpartum_screenings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score INT,
  screening_data JSONB,
  needs_professional_help BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE health_alerts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT, -- 'high_risk_dpp', etc
  severity TEXT, -- 'high', 'critical'
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

# 4. Deploy local e testar
supabase functions serve

# 5. No mobile, adicionar botão:
<Button
  onPress={async () => {
    const { data, error } = await supabase.functions.invoke("postpartum-screening")
    setScreening(data)
  }}
  title="Fazer Triagem"
/>

# 6. Testar end-to-end
```

### Semana 3: Memory + Multi-AI (5h)

```bash
# 1. Copie MemoryManager
cp Downloads/NossaMaternidade/lib/mcp/memory-manager.ts \
   src/lib/memory/memory-manager.ts

# 2. Instale dependência
npm install ai @ai-sdk/openai

# 3. Integre no NathiaChat
import { MemoryManager } from "@/lib/memory/memory-manager"

const memory = new MemoryManager(userId)

// No handler de mensagem:
await memory.storeMemory(userMessage, "conversation", messageId)
const context = await memory.getComprehensiveContext(userMessage)

// Adicione ao prompt do Gemini:
const systemPrompt = `Você é NathIA.
${context}
Responda considerando o histórico da usuária.`

# 4. Implementar Multi-AI modes
# Adicionar botões para escolher modo
# Integrar com Anthropic (Claude) para modo empático

# 5. Testar
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ANTES (Hoje)

```
NathiaChat.tsx
├─ Gemini 2.0 Flash ✅
├─ Sem contexto histórico ❌
├─ Sem análise emocional ❌
└─ Sem triagem de risco ❌

HabitsScreen.tsx
├─ Backend pronto ✅
├─ UI incompleta ❌
├─ Gamificação não visualizada ❌
└─ Streaks não calculados ❌

ProfileScreen.tsx
├─ Edição básica ✅
└─ Sem triagem de saúde ❌
```

### DEPOIS (Com Integrações)

```
NathiaChat.tsx
├─ 3 Modos de IA ✅ (Empático, Geral, Pesquisa)
├─ Memória histórica com contexto ✅
├─ Análise emocional em tempo real ✅
└─ Detecção de risco automática ✅

HabitsScreen.tsx
├─ GamificationManager integrado ✅
├─ UI com pontos/levels/streaks ✅
├─ Badges desbloqueáveis ✅
└─ Desafios semanais ✅

ProfileScreen.tsx
├─ Edição completa ✅
├─ Botão: "Triagem de Saúde Mental" ✅
├─ Score EPDS (0-30) ✅
└─ Alertas automáticos de risco ✅
```

---

## 💻 CÓDIGO PRONTO PARA COPIAR

### 1. GamificationManager (TypeScript Puro)

```typescript
// Copiar inteiro de: Downloads/NossaMaternidade/lib/gamification/gamification-manager.ts
// Para: src/lib/gamification/gamification-manager.ts

// Métodos principais:
- initializeUser(): void
- recordActivity(type, metadata): Promise<{pointsEarned, newAchievements, leveledUp}>
- getStats(): Promise<GamificationStats>
- checkAchievements(): Promise<Achievement[]>
- updateChallengeProgress(type): Promise<void>

// Tipos:
export interface GamificationStats {
  totalPoints: number
  currentLevel: number
  pointsToNextLevel: number
  currentStreak: number
  longestStreak: number
  achievements: Achievement[]
  recentActivities: DailyActivity[]
  activeChallenges: WeeklyChallengeProgress[]
}
```

### 2. Postpartum Screening (Edge Function)

```deno
// Copiar de: Downloads/NossaMaternidade/app/api/multi-ai/postpartum-screening/route.ts
// Adaptar para Deno e colar em: supabase/functions/postpartum-screening/index.ts

// Imports mudam:
// Next.js → Deno
import { NextRequest, NextResponse } from "next/server"
         ↓
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

// Resto é basicamente igual
// Coleta histórico → Claude analisa → Gemini valida → Retorna score
```

### 3. MemoryManager (TypeScript)

```typescript
// Copiar de: Downloads/NossaMaternidade/lib/mcp/memory-manager.ts
// Para: src/lib/memory/memory-manager.ts

// Métodos principais:
- storeMemory(text, type, contentId?, metadata): Promise<MemoryEntry>
- searchMemories(query, limit, threshold): Promise<MemoryEntry[]>
- getComprehensiveContext(query, daysBack): Promise<string>
- getMemoriesFromPeriod(daysAgo, limit): Promise<MemoryEntry[]>

// Tipos:
export interface MemoryEntry {
  id: string
  contentText: string
  contentType: string
  metadata: any
  similarity: number
  createdAt: string
}
```

---

## ⏱️ CRONOGRAMA ESTIMADO

| Tarefa                   | Horas        | Prioridade | Semana |
| ------------------------ | ------------ | ---------- | ------ |
| **GamificationManager**  | 2            | 🔴 CRÍTICA | 1      |
| **Postpartum Screening** | 3            | 🔴 CRÍTICA | 2      |
| **MemoryManager Setup**  | 2            | 🟡 ALTA    | 3      |
| **Multi-AI Integration** | 2            | 🟡 ALTA    | 3      |
| **Sentiment Analysis**   | 2            | 🟡 ALTA    | 3      |
| **Testing & Polish**     | 3            | 🟡 ALTA    | 4      |
| **TOTAL**                | **14 horas** |            |        |

---

## 🎯 RESULTADO FINAL

Após implementar estes 5 features, seu app terá:

✅ Sistema de gamificação completo (pontos, levels, badges, streaks)
✅ Triagem de depressão pós-parto automática (EPDS validado)
✅ Memória contextual do histórico de conversa
✅ 3 modos de IA especializados
✅ Análise emocional em tempo real
✅ Detecção automática de risco

**Status**: De MVP → **Plataforma de Saúde Mental Profissional**

---

## 🚀 COMEÇAR AGORA

1. Download já feito ✅
2. Identifiquei o que copiar ✅
3. Criei este guia passo-a-passo ✅
4. **PRÓXIMO**: Começar a implementar (Semana 1)

Quer que eu comece a implementar agora?

---

_Documento: ROADMAP_MOBILE_ONLY.md_
_Gerado em: 2025-11-10_

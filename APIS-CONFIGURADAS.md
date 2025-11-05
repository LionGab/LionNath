# 📡 APIs CONFIGURADAS - NOSSA MATERNIDADE

## ✅ APIs OBRIGATÓRIAS (Configuradas)

### 1. Supabase (Backend)
- **Tipo**: Backend as a Service (BaaS)
- **URL**: `https://mnszbkeuuerjcevjvdqme.supabase.co`
- **Anon Key**: ✅ Configurada
- **Service Role Key**: ✅ Configurada (apenas Edge Functions)
- **Functions URL**: `https://mnszbkeuuerjcevjvdqme.supabase.co/functions/v1`
- **Status**: ✅ **ATIVA E FUNCIONANDO**
- **Uso**: Banco de dados, autenticação, Edge Functions

### 2. Google Gemini API
- **Tipo**: Inteligência Artificial (IA)
- **API Key**: `AIzaSyC9YVWRmnGyGu4c9y7g-mNkkipDqb5JBZg`
- **Variável**: `EXPO_PUBLIC_GEMINI_API_KEY`
- **Fallback**: `GOOGLE_AI_API_KEY` (também configurada)
- **Status**: ✅ **ATIVA E FUNCIONANDO**
- **Uso**: Assistente virtual NathIA, geração de planos diários, respostas inteligentes

---

## ⚠️ APIs OPCIONAIS (Não Configuradas)

### 3. Claude API (Anthropic)
- **Tipo**: Inteligência Artificial (IA)
- **Variável**: `EXPO_PUBLIC_CLAUDE_API_KEY`
- **Status**: ⚠️ Não configurada
- **Uso**: Fallback para Gemini, respostas alternativas
- **Necessário**: Não (opcional)

### 4. OpenAI API
- **Tipo**: Inteligência Artificial (IA)
- **Variável**: `EXPO_PUBLIC_OPENAI_API_KEY`
- **Status**: ⚠️ Não configurada
- **Uso**: Validação de respostas, fallback
- **Necessário**: Não (opcional)

### 5. Perplexity API
- **Tipo**: Inteligência Artificial (IA)
- **Variável**: `EXPO_PUBLIC_PERPLEXITY_API_KEY`
- **Status**: ⚠️ Não configurada
- **Uso**: Pesquisa e contexto adicional
- **Necessário**: Não (opcional)

### 6. Stripe API
- **Tipo**: Pagamentos
- **Variável**: `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Status**: ⚠️ Não configurada
- **Uso**: Assinaturas premium, pagamentos
- **Necessário**: Não (opcional - apenas para recursos premium)

### 7. OneSignal API
- **Tipo**: Notificações Push
- **Variável**: `EXPO_PUBLIC_ONESIGNAL_APP_ID`
- **Status**: ⚠️ Não configurada
- **Uso**: Notificações push, lembretes
- **Necessário**: Não (opcional)

### 8. ElevenLabs API
- **Tipo**: Text-to-Speech
- **Variável**: `EXPO_PUBLIC_ELEVENLABS_API_KEY`
- **Status**: ⚠️ Não configurada
- **Uso**: Voz sintética para NathIA
- **Necessário**: Não (opcional)

### 9. HeyGen API
- **Tipo**: Vídeo/Avatar
- **Variável**: `EXPO_PUBLIC_HEYGEN_API_KEY`
- **Status**: ⚠️ Não configurada
- **Uso**: Avatares em vídeo para NathIA
- **Necessário**: Não (opcional)

### 10. Sentry
- **Tipo**: Monitoramento de Erros
- **Variável**: `SENTRY_DSN`
- **Status**: ⚠️ Não configurada
- **Uso**: Tracking de erros em produção
- **Necessário**: Não (opcional - recomendado para produção)

---

## 📊 RESUMO DAS APIs

| API | Status | Obrigatória | Uso |
|-----|--------|-------------|-----|
| **Supabase** | ✅ Configurada | Sim | Backend completo |
| **Google Gemini** | ✅ Configurada | Sim | Assistente IA |
| Claude API | ⚠️ Não configurada | Não | Fallback IA |
| OpenAI API | ⚠️ Não configurada | Não | Validação |
| Perplexity API | ⚠️ Não configurada | Não | Pesquisa |
| Stripe API | ⚠️ Não configurada | Não | Pagamentos |
| OneSignal API | ⚠️ Não configurada | Não | Notificações |
| ElevenLabs API | ⚠️ Não configurada | Não | Text-to-Speech |
| HeyGen API | ⚠️ Não configurada | Não | Vídeo/Avatar |
| Sentry | ⚠️ Não configurada | Não | Monitoramento |

---

## ✅ STATUS GERAL

**APIs Obrigatórias**: ✅ **2/2 Configuradas (100%)**
- Supabase ✅
- Google Gemini ✅

**APIs Opcionais**: ⚠️ **0/8 Configuradas (0%)**
- Todas opcionais não são necessárias para funcionamento básico

---

## 🎯 CONCLUSÃO

**O app está pronto para funcionar!** ✅

Todas as APIs obrigatórias estão configuradas:
- ✅ Supabase (backend completo)
- ✅ Google Gemini (assistente IA)

As APIs opcionais podem ser adicionadas conforme necessário para recursos avançados.

---

## 📝 ONDE VERIFICAR

1. **Arquivo de Configuração**: `.env.local`
2. **Código de Configuração**: `src/config/api.ts`
3. **Tela de Status**: Navegue para `Status` screen no app
4. **Script de Validação**: `node scripts/validate-config.js`

---

_Última atualização: $(date)_
_Total de APIs configuradas: 2/10 (2 obrigatórias + 8 opcionais)_

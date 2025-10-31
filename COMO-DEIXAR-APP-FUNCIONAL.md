# 🚀 Como Deixar o App Funcional - Guia Completo

**Data:** 31/10/2025  
**Status do Projeto:** ✅ Código completo | ⚠️ Configuração necessária

---

## ✅ O Que Já Está Pronto

1. ✅ **Código do App Completo**
   - Todas as telas implementadas (Home, Chat, Onboarding, Habits, Content Feed)
   - Design System Bubblegum completo
   - Navegação configurada
   - Integração com Supabase preparada
   - Integração com Gemini AI preparada

2. ✅ **Dependências Instaladas**
   - `node_modules` criado com todas as dependências
   - Husky configurado para pre-commit hooks

3. ✅ **Estrutura de Arquivos**
   - Schema SQL completo em `supabase/schema-nossa-maternidade-completo.sql`
   - Edge Function NathIA em `supabase/functions/nathia-chat/`
   - Documentação completa

4. ✅ **Arquivo .env Criado**
   - Template pronto em `.env`
   - Precisa ser preenchido com suas credenciais

---

## ⚠️ O Que Falta Fazer (Configuração Manual)

### Passo 1: Criar Projeto no Supabase ⭐ **CRÍTICO**

**Tempo estimado:** 5 minutos

1. **Acesse:** https://supabase.com/dashboard
2. **Clique em:** "New Project"
3. **Preencha:**
   - Nome: `nossa-maternidade`
   - Database Password: (crie uma senha forte e salve)
   - Region: South America (São Paulo) - para melhor latência
4. **Aguarde:** 1-2 minutos enquanto o projeto é criado

---

### Passo 2: Executar Schema SQL ⭐ **CRÍTICO**

**Tempo estimado:** 2 minutos

1. **No Dashboard do Supabase:**
   - Clique no seu projeto `nossa-maternidade`
   - Vá em **SQL Editor** (menu lateral)

2. **Execute o Schema:**
   - Clique em "New Query"
   - Abra o arquivo: `supabase/schema-nossa-maternidade-completo.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Clique em **"Run"** (ou Ctrl+Enter)

3. **Verifique:**
   - Não deve aparecer nenhum erro
   - Se aparecer erro, copie e me envie para ajudar

**O que esse SQL cria:**
- 10 tabelas (user_profiles, chat_messages, daily_plans, etc.)
- Políticas RLS (segurança)
- Índices otimizados
- Triggers automáticos

---

### Passo 3: Configurar Variáveis de Ambiente ⭐ **CRÍTICO**

**Tempo estimado:** 3 minutos

1. **Obter credenciais do Supabase:**
   - No Dashboard, vá em **Settings → API**
   - Copie:
     - **Project URL** (ex: `https://xxxxx.supabase.co`)
     - **anon/public key** (chave longa começando com `eyJ...`)

2. **Editar arquivo `.env`:**
   - Abra o arquivo `.env` na raiz do projeto
   - Substitua:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

3. **Salve o arquivo**

---

### Passo 4: Configurar Gemini API Key ⭐ **IMPORTANTE**

**Tempo estimado:** 5 minutos

#### 4.1 - Obter API Key do Gemini

1. **Acesse:** https://makersuite.google.com/app/apikey
2. **Faça login** com sua conta Google
3. **Clique em:** "Create API Key"
4. **Copie** a chave gerada (começa com `AIza...`)

#### 4.2 - Configurar no Supabase Edge Functions

1. **No Dashboard do Supabase:**
   - Vá em **Edge Functions** (menu lateral)
   - Clique em **"Manage secrets"** ou vá em Settings → Edge Functions

2. **Adicionar Secret:**
   - Nome: `GEMINI_API_KEY`
   - Valor: Cole a API Key que você copiou
   - Clique em **"Add secret"**

---

### Passo 5: Fazer Deploy da Edge Function ⭐ **IMPORTANTE**

**Tempo estimado:** 5 minutos

**Pré-requisito:** Instalar Supabase CLI

```bash
# Instalar Supabase CLI (uma vez)
npm install -g supabase

# Login no Supabase
supabase login

# Link com seu projeto
supabase link --project-ref SEU-PROJECT-REF

# Deploy da função NathIA
supabase functions deploy nathia-chat
```

**Como obter o PROJECT-REF:**
- No Dashboard do Supabase → Settings → General
- Copie o "Reference ID" (8 caracteres)

**Verificar se funcionou:**
- No Dashboard → Edge Functions
- Deve aparecer `nathia-chat` como **deployed**

---

### Passo 6: Testar o App Localmente ⭐ **TESTE FINAL**

**Tempo estimado:** 2 minutos

```bash
# Iniciar Expo
npm start

# Ou para ambiente específico:
npm run android  # Para Android
npm run ios      # Para iOS
npm run web      # Para Web
```

**O que deve acontecer:**
1. Metro bundler inicia
2. QR Code aparece no terminal
3. Escaneie com Expo Go (Android) ou Camera (iOS)
4. App abre mostrando tela de Onboarding

---

## 🎯 Checklist Final

Marque cada item conforme completa:

### Configuração Supabase
- [ ] Projeto criado no Supabase
- [ ] Schema SQL executado com sucesso
- [ ] Credenciais copiadas (URL + anon key)
- [ ] Arquivo `.env` preenchido com credenciais
- [ ] Tabelas criadas (verificar no Table Editor)

### Configuração Gemini AI
- [ ] API Key do Gemini obtida
- [ ] Secret `GEMINI_API_KEY` adicionada no Supabase
- [ ] Edge Function `nathia-chat` deployed

### Teste Local
- [ ] Dependências instaladas (`node_modules` existe)
- [ ] Expo inicia sem erros
- [ ] App abre no dispositivo/emulador
- [ ] Onboarding aparece
- [ ] Consegue criar perfil
- [ ] Home screen carrega

---

## 🚨 Problemas Comuns e Soluções

### ❌ Erro: "Supabase URL not configured"

**Causa:** Arquivo `.env` não preenchido ou mal formatado

**Solução:**
1. Verifique se `.env` existe na raiz
2. Confirme que as variáveis começam com `EXPO_PUBLIC_`
3. Reinicie o Metro bundler (Ctrl+C e `npm start` novamente)

---

### ❌ Erro ao executar Schema SQL

**Causa:** Extensões não habilitadas ou SQL malformado

**Solução:**
1. Execute primeiro (separadamente):
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "vector";
   ```
2. Depois execute o resto do schema

---

### ❌ Edge Function não funciona

**Causa:** Secret não configurada ou função não deployed

**Solução:**
1. Verifique secrets: Settings → Edge Functions → Manage secrets
2. Confirme que `GEMINI_API_KEY` está lá
3. Rode novamente: `supabase functions deploy nathia-chat`

---

### ❌ Chat não responde

**Possíveis causas:**
1. Edge Function não deployed → Veja solução acima
2. Gemini API Key inválida → Gere nova key
3. Usuário não autenticado → Complete o onboarding

**Debug:**
- Abra DevTools do navegador (F12)
- Vá em Console
- Procure erros em vermelho
- Me envie o erro para ajudar

---

## 📱 Testando Recursos Principais

### Teste 1: Onboarding
1. ✅ Abra o app
2. ✅ Complete as 7 telas de onboarding
3. ✅ Veja se perfil é salvo

### Teste 2: Home Screen
1. ✅ Veja nome e semana de gestação
2. ✅ Clique em "Gerar Plano Agora"
3. ✅ Aguarde loading
4. ✅ Plano diário deve aparecer

### Teste 3: Chat NathIA
1. ✅ Abra aba "Chat"
2. ✅ Digite uma pergunta
3. ✅ Aguarde resposta da IA
4. ✅ Resposta deve ser personalizada

### Teste 4: Hábitos
1. ✅ Abra aba "Hábitos"
2. ✅ Marque um hábito como completo
3. ✅ Veja progresso aumentar

### Teste 5: Conteúdos
1. ✅ Abra aba "Conteúdos"
2. ✅ Veja lista de artigos
3. ✅ Clique em um artigo
4. ✅ Leia conteúdo completo

---

## ⏱️ Tempo Total Estimado

| Etapa | Tempo | Dificuldade |
|-------|-------|-------------|
| Criar projeto Supabase | 5 min | Fácil |
| Executar SQL | 2 min | Fácil |
| Configurar .env | 3 min | Fácil |
| Obter Gemini API | 5 min | Fácil |
| Deploy Edge Function | 5 min | Médio |
| Testar app | 5 min | Fácil |
| **TOTAL** | **~25 min** | **Fácil/Médio** |

---

## 🎓 Próximos Passos Após App Funcional

1. **Teste todas as funcionalidades**
2. **Personalize conteúdos** (edite seed data)
3. **Configure notificações push** (OneSignal)
4. **Configure pagamentos** (Stripe)
5. **Deploy para produção** (EAS Build + App Stores)

---

## 📚 Documentação Adicional

- **Schema SQL:** `supabase/schema-nossa-maternidade-completo.sql`
- **Edge Function:** `supabase/functions/nathia-chat/README.md`
- **Arquitetura:** `ARCHITECTURE.md`
- **Configuração Completa:** `CONFIGURACAO-COMPLETA.md`

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. **Leia a seção "Problemas Comuns" acima**
2. **Verifique o Checklist Final**
3. **Me envie:**
   - Mensagem de erro completa
   - Qual passo está travado
   - Screenshots se possível

---

## ✅ Resumo Executivo

**O que você precisa fazer AGORA:**

1. ⭐ Criar projeto no Supabase (5 min)
2. ⭐ Executar SQL do schema (2 min)
3. ⭐ Preencher `.env` com credenciais (3 min)
4. ⭐ Obter Gemini API Key (5 min)
5. ⭐ Deploy Edge Function (5 min)
6. ⭐ Testar app (`npm start`)

**Tempo total:** ~25 minutos  
**Dificuldade:** Baixa/Média  
**Resultado:** App 100% funcional! 🎉

---

**Criado em:** 31/10/2025  
**Versão:** 1.0.0

# ✅ Checklist: Deixar o App Funcional

## ✅ Problemas Corrigidos

### 1. ✅ Arquivo .env.local criado
- Criado arquivo `.env.local` com todas as variáveis de ambiente necessárias
- Configurado com credenciais do Supabase
- Adicionado GEMINI_API_KEY

### 2. ✅ OnboardingScreen corrigido
- **Problema:** Após criar usuário no Supabase, o `userId` não era salvo no AsyncStorage
- **Solução:** Adicionado `await AsyncStorage.setItem('userId', user.id);` após criar o perfil
- **Impacto:** Agora o chat e outras funcionalidades conseguem identificar o usuário corretamente

---

## ⚠️ Configurações Necessárias (Manual)

### 1. Supabase Database Schema
O schema do banco de dados precisa ser executado no Supabase:

1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Execute o arquivo: `supabase/schema-nossa-maternidade-completo.sql`
   - Ou use `SCHEMA_COMPLETO_FINAL.sql` na raiz

**Tabelas necessárias:**
- `user_profiles` - Perfis de usuários
- `chat_messages` - Mensagens do chat
- `daily_plans` - Planos diários

### 2. Supabase Edge Function Secrets
A Edge Function `nathia-chat` precisa da chave do Gemini:

1. Acesse: https://supabase.com/dashboard
2. Vá em **Edge Functions > Secrets**
3. Adicione:
   - **Nome:** `GEMINI_API_KEY`
   - **Valor:** `AIzaSyC9YVWRmnGyGu4c9y7g-mNkkipDqb5JBZg`

### 3. Deploy Edge Function (se necessário)
Se a Edge Function não estiver deployada:

```bash
supabase functions deploy nathia-chat
```

Ou via Supabase Dashboard:
1. Edge Functions > Deploy

---

## 🧪 Como Testar

### 1. Instalar dependências (se necessário)
```bash
npm install
```

### 2. Iniciar o app
```bash
npm start
# ou
expo start
```

### 3. Fluxo de teste:

1. **Onboarding:**
   - O app deve abrir na tela de onboarding
   - Preencher os dados (nome, tipo, semana, preferências)
   - Ao finalizar, deve navegar para a Home

2. **Home Screen:**
   - Deve mostrar o nome do usuário
   - Botões de ação rápida funcionando
   - Possibilidade de gerar plano diário

3. **Chat Screen:**
   - Enviar mensagem
   - Deve receber resposta da IA (via Edge Function ou fallback)
   - Histórico deve ser carregado

4. **Plano Diário:**
   - Gerar plano diário
   - Deve salvar no Supabase
   - Deve aparecer na Home também

---

## 🔍 Verificações Importantes

### Variáveis de Ambiente
Verifique se o arquivo `.env.local` existe e tem:
- ✅ `EXPO_PUBLIC_SUPABASE_URL`
- ✅ `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `EXPO_PUBLIC_GEMINI_API_KEY`

### AsyncStorage
O app salva:
- `onboarded` - Se o usuário completou onboarding
- `userId` - ID do usuário no Supabase
- `userProfile` - Perfil completo do usuário

### Supabase
Verifique se:
- ✅ Tabelas criadas (`user_profiles`, `chat_messages`, `daily_plans`)
- ✅ RLS (Row Level Security) configurado
- ✅ Edge Function `nathia-chat` deployada
- ✅ Secret `GEMINI_API_KEY` configurado

---

## 🐛 Problemas Conhecidos / Limitações

1. **Autenticação temporária:**
   - O onboarding cria usuários com email/senha temporários
   - Idealmente deveria usar autenticação anônima ou melhorar este fluxo

2. **Fallback de IA:**
   - Se a Edge Function falhar, usa Claude como fallback
   - Requer `EXPO_PUBLIC_CLAUDE_API_KEY` configurada (opcional)

3. **Validação de API Keys:**
   - O app não valida se as chaves estão configuradas na inicialização
   - Erros aparecem apenas quando tenta usar

---

## 📝 Próximos Passos Recomendados

1. **Melhorar autenticação:**
   - Implementar autenticação anônima ou melhorar o fluxo atual
   - Adicionar validação de email/telefone

2. **Validação de configuração:**
   - Adicionar tela de verificação de configuração na inicialização
   - Mostrar warnings claros se chaves estiverem faltando

3. **Error handling:**
   - Melhorar tratamento de erros de conexão
   - Adicionar retry automático para operações críticas

4. **Testes:**
   - Adicionar testes unitários para hooks críticos
   - Testes de integração para fluxos principais

---

## ✅ Status Final

- ✅ Código corrigido (OnboardingScreen)
- ✅ Arquivo .env.local criado
- ⚠️ Configuração manual do Supabase necessária
- ⚠️ Deploy da Edge Function pode ser necessário

**O app deve estar funcional após as configurações manuais do Supabase!**

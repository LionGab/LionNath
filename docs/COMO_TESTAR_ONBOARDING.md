# Como Testar o Onboarding - Guia Rápido

## Pré-requisitos

1. Node.js e npm instalados
2. Expo CLI instalado (`npm install -g expo-cli`)
3. Emulador iOS/Android ou dispositivo físico
4. (Opcional) Supabase configurado para modo real

---

## Passo 1: Configurar Variáveis de Ambiente

### Modo Mock (Recomendado para testes rápidos)

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_USE_MOCKS=true
```

**Vantagem:** Não precisa de Supabase, funciona offline, respostas salvas localmente.

### Modo Supabase (Para testes completos)

```env
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

**Importante:** Execute a migration SQL primeiro:

```bash
# Via Supabase Dashboard → SQL Editor
# Cole o conteúdo de: supabase/migrations/20250108_onboarding_answers.sql
```

---

## Passo 2: Limpar Estado Anterior (Opcional)

Para testar o onboarding do zero, limpe o AsyncStorage:

### No código (temporário):

Adicione no início do `OnboardingQuestionsWrapper.tsx`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// No useEffect, adicione:
useEffect(() => {
  // Limpar onboarding anterior (apenas para testes)
  AsyncStorage.removeItem('onboarded');
  AsyncStorage.removeItem('@onboarding_answers');

  // ... resto do código
}, []);
```

**Ou via DevTools:**

No React Native Debugger ou console do Expo:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('onboarded');
await AsyncStorage.removeItem('@onboarding_answers');
```

---

## Passo 3: Iniciar o App

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar Metro bundler
npm start

# Ou diretamente:
npx expo start
```

### Escolher plataforma:

- **iOS Simulator:** Pressione `i` no terminal ou clique no botão iOS
- **Android Emulator:** Pressione `a` no terminal ou clique no botão Android
- **Dispositivo físico:** Escaneie QR code com Expo Go app

---

## Passo 4: Testar Fluxo Completo

### Teste Básico (Happy Path)

1. **Abrir app** → Deve mostrar onboarding automaticamente
2. **Verificar Q1:** "Em que trimestre você está?"
   - ✅ Pergunta aparece corretamente
   - ✅ 4 opções visíveis e clicáveis
   - ✅ Barra de progresso mostra "1 de 3"
3. **Selecionar opção** (ex: "1º trimestre")
   - ✅ Opção fica destacada (borda/background diferente)
   - ✅ Botão "Próximo" habilita
4. **Clicar "Próximo"**
   - ✅ Navega para Q2
   - ✅ Progresso atualiza para "2 de 3"
5. **Responder Q2:** "Você prefere conteúdo em texto ou vídeo?"
   - ✅ Selecionar uma opção
   - ✅ Botão "Próximo" habilita
6. **Clicar "Próximo"**
   - ✅ Navega para Q3
   - ✅ Progresso atualiza para "3 de 3"
7. **Responder Q3:** "Quais assuntos você quer acompanhar?"
   - ✅ Selecionar pelo menos 1 opção (multi-choice)
   - ✅ Botão muda para "Finalizar"
8. **Clicar "Finalizar"**
   - ✅ Mostra loading/indicador de salvamento
   - ✅ Navega para Home
   - ✅ Onboarding não aparece mais ao reabrir app

---

## Passo 5: Testar Validações

### Teste de Campos Obrigatórios

1. Abrir onboarding
2. **NÃO** selecionar nenhuma opção em Q1
3. Tentar clicar "Próximo"
   - ✅ Botão deve estar desabilitado (cinza)
   - ✅ Não navega para próxima pergunta
4. Selecionar opção
   - ✅ Botão habilita (cor primária)

### Teste de Navegação Anterior

1. Responder Q1 e ir para Q2
2. Clicar "Anterior"
   - ✅ Volta para Q1
   - ✅ Resposta de Q1 está mantida (selecionada)
3. Na primeira pergunta
   - ✅ Botão "Anterior" não aparece ou está desabilitado

### Teste de Multi-Choice

1. Chegar na Q3
2. Selecionar "Amamentação"
   - ✅ Fica selecionada
3. Selecionar "Sono do bebê"
   - ✅ Ambas ficam selecionadas
4. Clicar novamente em "Amamentação"
   - ✅ Desmarca (toggle funciona)

---

## Passo 6: Verificar Persistência

### Modo Mock (AsyncStorage)

**No console do Expo/React Native Debugger:**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Verificar se foi salvo
const answers = await AsyncStorage.getItem('@onboarding_answers');
console.log('Respostas salvas:', JSON.parse(answers));

// Verificar flag de completado
const onboarded = await AsyncStorage.getItem('onboarded');
console.log('Onboarding completo?', onboarded);
```

**Resultado esperado:**

```json
{
  "userId": null,
  "answers": [
    {
      "questionId": "q1",
      "answer": "q1o1",
      "timestamp": "2025-01-08T..."
    },
    {
      "questionId": "q2",
      "answer": "q2o1",
      "timestamp": "2025-01-08T..."
    },
    {
      "questionId": "q3",
      "answer": ["q3o1", "q3o2"],
      "timestamp": "2025-01-08T..."
    }
  ],
  "completedAt": "2025-01-08T..."
}
```

### Modo Supabase

**No Supabase Dashboard → SQL Editor:**

```sql
-- Ver todas as respostas
SELECT * FROM onboarding_answers ORDER BY created_at DESC;

-- Ver respostas de um usuário específico
SELECT * FROM onboarding_answers WHERE user_id = 'user-uuid-aqui';
```

---

## Passo 7: Testar Persistência Entre Sessões

1. Completar onboarding
2. **Fechar app completamente** (não apenas minimizar)
3. Reabrir app
4. ✅ Onboarding **não** deve aparecer
5. ✅ App deve ir direto para Home

**Para testar novamente:**

- Limpe AsyncStorage (veja Passo 2)
- Ou altere `onboarded` para `false` no código temporariamente

---

## Passo 8: Testar Acessibilidade

### iOS (VoiceOver)

1. Ativar VoiceOver: Settings → Accessibility → VoiceOver → ON
2. Navegar pelo onboarding usando gestos:
   - Swipe right: próximo elemento
   - Swipe left: elemento anterior
   - Double tap: ativar elemento
3. ✅ Perguntas são anunciadas claramente
4. ✅ Opções são anunciadas com estado (selecionada/não selecionada)
5. ✅ Botões têm labels descritivos

### Android (TalkBack)

1. Ativar TalkBack: Settings → Accessibility → TalkBack → ON
2. Navegar pelo onboarding usando gestos similares
3. ✅ Mesmas verificações do iOS

---

## Passo 9: Testar Erros e Edge Cases

### Teste de Erro de Conexão (Modo Supabase)

1. Configurar `EXPO_PUBLIC_USE_MOCKS=false`
2. Desconectar internet ou usar URL Supabase inválida
3. Tentar finalizar onboarding
4. ✅ Deve mostrar fallback para mock
5. ✅ Respostas são salvas em AsyncStorage
6. ✅ Usuário vê mensagem de erro amigável (se implementado)

### Teste de Performance

1. Cronometrar tempo total do onboarding
2. ✅ Deve completar em ≤3 minutos
3. ✅ Ações (seleção, navegação) são instantâneas (<100ms)
4. ✅ Sem travamentos ou delays visíveis

---

## Checklist Rápido de Testes

### Funcionalidade Básica

- [ ] Onboarding aparece ao abrir app pela primeira vez
- [ ] Todas as 3 perguntas são exibidas corretamente
- [ ] Opções são clicáveis e mostram feedback visual
- [ ] Botão "Próximo" só habilita após seleção obrigatória
- [ ] Navegação anterior funciona
- [ ] Multi-choice permite múltiplas seleções
- [ ] Finalizar salva respostas e navega para Home

### Persistência

- [ ] Respostas são salvas (mock ou Supabase)
- [ ] Onboarding não aparece após completar
- [ ] Dados persistem após fechar app

### Validação

- [ ] Campos obrigatórios são validados
- [ ] Botão desabilitado quando não pode prosseguir
- [ ] Mensagens de erro são claras (se houver)

### Acessibilidade

- [ ] VoiceOver/TalkBack funciona
- [ ] Touch targets ≥44px
- [ ] Contraste de cores adequado

### Performance

- [ ] Onboarding completo em ≤3 minutos
- [ ] Sem travamentos
- [ ] Animações suaves

---

## Comandos Úteis

```bash
# Limpar cache do Metro
npm start -- --reset-cache

# Ver logs do app
npx expo start --dev-client

# Build para teste
npx expo run:ios
npx expo run:android

# Type check
npm run type-check

# Lint
npm run lint
```

---

## Troubleshooting

### Onboarding não aparece

**Causa:** Flag `onboarded` está como `true`

**Solução:**

```javascript
// No console do Expo
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('onboarded');
await AsyncStorage.removeItem('@onboarding_answers');
// Recarregar app
```

### Erro ao salvar respostas

**Causa:** Supabase não configurado ou migration não executada

**Solução:**

1. Verificar variáveis de ambiente
2. Executar migration SQL
3. Ou usar modo mock: `EXPO_PUBLIC_USE_MOCKS=true`

### Botões não clicáveis

**Causa:** Componente não está usando `Pressable`/`TouchableOpacity`

**Solução:** Verificar se `OptionButton.tsx` usa `Pressable` corretamente

### Navegação não funciona

**Causa:** Rotas não configuradas corretamente

**Solução:** Verificar `src/navigation/index.tsx` e `types.ts`

---

## Próximos Passos Após Testes

1. ✅ Corrigir bugs encontrados
2. ✅ Ajustar UX conforme feedback
3. ✅ Adicionar animações (opcional)
4. ✅ Preparar build de demo
5. ✅ Documentar para equipe

---

**Boa sorte com os testes! 🚀**

# QA Checklist - Onboarding

**Data:** 2025-01-08  
**Versão:** 1.0

---

## Checklist de Testes Manuais

### Pré-requisitos

- [ ] App instalado no dispositivo/emulador
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase configurado (se não usar mock)
- [ ] AsyncStorage limpo (para testar fluxo completo)

---

## Cenários de Teste

### Cenário 1: Happy Path - Fluxo Completo

**Objetivo:** Verificar se o fluxo completo funciona sem erros.

**Steps:**

1. Abrir app pela primeira vez
2. Verificar se onboarding é exibido
3. Responder Q1: Selecionar "1º trimestre"
4. Clicar em "Próximo"
5. Responder Q2: Selecionar "Texto"
6. Clicar em "Próximo"
7. Responder Q3: Selecionar pelo menos 1 opção (ex: "Amamentação")
8. Clicar em "Finalizar"
9. Verificar se navega para Home

**Resultado Esperado:**

- ✅ Todas as perguntas são exibidas
- ✅ Opções são clicáveis
- ✅ Botão "Próximo" habilita após seleção
- ✅ Respostas são salvas
- ✅ Navegação para Home funciona

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 2: Validação de Campos Obrigatórios

**Objetivo:** Verificar se campos obrigatórios são validados.

**Steps:**

1. Abrir onboarding
2. Não selecionar nenhuma opção em Q1
3. Tentar clicar em "Próximo"
4. Verificar se botão está desabilitado
5. Selecionar uma opção em Q1
6. Verificar se botão "Próximo" habilita

**Resultado Esperado:**

- ✅ Botão "Próximo" desabilitado quando required=true e sem seleção
- ✅ Botão "Próximo" habilita após seleção obrigatória

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 3: Navegação Anterior

**Objetivo:** Verificar se navegação para trás funciona.

**Steps:**

1. Responder Q1 e ir para Q2
2. Clicar em "Anterior"
3. Verificar se volta para Q1
4. Verificar se resposta de Q1 está mantida
5. Verificar se botão "Anterior" está desabilitado na primeira pergunta

**Resultado Esperado:**

- ✅ Botão "Anterior" funciona
- ✅ Respostas são mantidas ao voltar
- ✅ Botão "Anterior" desabilitado na primeira pergunta

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 4: Multi Choice - Seleção Múltipla

**Objetivo:** Verificar se seleção múltipla funciona corretamente.

**Steps:**

1. Chegar na Q3 (multi_choice)
2. Selecionar "Amamentação"
3. Selecionar "Sono do bebê"
4. Verificar se ambas estão selecionadas
5. Desmarcar "Amamentação"
6. Verificar se apenas "Sono do bebê" está selecionada

**Resultado Esperado:**

- ✅ Múltiplas opções podem ser selecionadas
- ✅ Opções podem ser desmarcadas
- ✅ Estado visual reflete seleções corretamente

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 5: Persistência - Modo Mock

**Objetivo:** Verificar se respostas são salvas em AsyncStorage (modo mock).

**Pré-requisito:** `EXPO_PUBLIC_USE_MOCKS=true`

**Steps:**

1. Responder todas as perguntas
2. Finalizar onboarding
3. Fechar app completamente
4. Reabrir app
5. Verificar se onboarding não aparece novamente (já completado)

**Resultado Esperado:**

- ✅ Respostas são salvas em AsyncStorage
- ✅ Onboarding não aparece após completar
- ✅ App navega direto para Home

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 6: Persistência - Modo Supabase

**Objetivo:** Verificar se respostas são salvas no Supabase.

**Pré-requisito:** `EXPO_PUBLIC_USE_MOCKS=false` e Supabase configurado

**Steps:**

1. Responder todas as perguntas
2. Finalizar onboarding
3. Verificar no Supabase Dashboard se dados foram salvos
4. Query: `select * from onboarding_answers order by created_at desc limit 10;`

**Resultado Esperado:**

- ✅ Respostas são salvas no Supabase
- ✅ Dados estão no formato correto (JSONB)
- ✅ Timestamps estão corretos

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 7: Fallback para Mock em Caso de Erro

**Objetivo:** Verificar se fallback para mock funciona quando Supabase falha.

**Steps:**

1. Configurar `EXPO_PUBLIC_USE_MOCKS=false`
2. Desconectar internet ou usar URL Supabase inválida
3. Tentar finalizar onboarding
4. Verificar se fallback para mock funciona
5. Verificar se respostas são salvas em AsyncStorage

**Resultado Esperado:**

- ✅ Erro do Supabase é tratado
- ✅ Fallback para mock funciona
- ✅ Respostas são salvas localmente
- ✅ Usuário não vê erro crítico

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 8: Acessibilidade - VoiceOver (iOS)

**Objetivo:** Verificar acessibilidade com VoiceOver.

**Steps:**

1. Ativar VoiceOver no iOS
2. Navegar pelo onboarding usando gestos VoiceOver
3. Verificar se perguntas são anunciadas
4. Verificar se opções são anunciadas
5. Verificar se botões são anunciados corretamente

**Resultado Esperado:**

- ✅ Perguntas são anunciadas claramente
- ✅ Opções são anunciadas com estado (selecionada/não selecionada)
- ✅ Botões têm labels descritivos
- ✅ Navegação funciona com VoiceOver

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 9: Acessibilidade - TalkBack (Android)

**Objetivo:** Verificar acessibilidade com TalkBack.

**Steps:**

1. Ativar TalkBack no Android
2. Navegar pelo onboarding usando gestos TalkBack
3. Verificar se perguntas são anunciadas
4. Verificar se opções são anunciadas
5. Verificar se botões são anunciados corretamente

**Resultado Esperado:**

- ✅ Perguntas são anunciadas claramente
- ✅ Opções são anunciadas com estado
- ✅ Botões têm labels descritivos
- ✅ Navegação funciona com TalkBack

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 10: Performance - Tempo de Resposta

**Objetivo:** Verificar se onboarding é rápido e responsivo.

**Steps:**

1. Cronometrar tempo total do onboarding
2. Verificar se cada ação (seleção, navegação) é instantânea
3. Verificar se não há delays visíveis

**Resultado Esperado:**

- ✅ Onboarding completo em ≤3 minutos
- ✅ Ações são instantâneas (<100ms)
- ✅ Sem travamentos ou delays

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 11: Diferentes Tamanhos de Tela

**Objetivo:** Verificar responsividade em diferentes dispositivos.

**Steps:**

1. Testar em iPhone SE (tela pequena)
2. Testar em iPhone Pro Max (tela grande)
3. Testar em Android pequeno
4. Testar em Android grande/tablet
5. Verificar se layout se adapta corretamente

**Resultado Esperado:**

- ✅ Layout se adapta a diferentes tamanhos
- ✅ Texto é legível em todas as telas
- ✅ Botões têm tamanho adequado (≥44px)
- ✅ Sem cortes ou sobreposições

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

### Cenário 12: Edge Cases

**Objetivo:** Verificar comportamento em casos extremos.

**Steps:**

1. Tentar selecionar múltiplas opções em single_choice
2. Tentar navegar além da última pergunta
3. Tentar navegar antes da primeira pergunta
4. Tentar finalizar sem responder perguntas obrigatórias

**Resultado Esperado:**

- ✅ Single choice permite apenas 1 seleção
- ✅ Navegação respeita limites (primeira/última)
- ✅ Validação impede finalizar sem respostas obrigatórias

**Status:** ⬜ Pass / ⬜ Fail

**Notas:**

---

## Bugs Encontrados

### Bug #1

**Descrição:**

**Severidade:** ⬜ Alta / ⬜ Média / ⬜ Baixa

**Steps to Reproduce:**

1.
2.
3.

**Resultado Esperado:**

**Resultado Atual:**

**Screenshot:**

**Plataforma:** ⬜ iOS / ⬜ Android / ⬜ Web

---

### Bug #2

**Descrição:**

**Severidade:** ⬜ Alta / ⬜ Média / ⬜ Baixa

**Steps to Reproduce:**

1.
2.
3.

**Resultado Esperado:**

**Resultado Atual:**

**Screenshot:**

**Plataforma:** ⬜ iOS / ⬜ Android / ⬜ Web

---

## Resumo de Testes

**Data dos Testes:** **\*\***\_\_\_**\*\***

**Testador:** **\*\***\_\_\_**\*\***

**Plataforma Testada:** ⬜ iOS / ⬜ Android / ⬜ Ambos

**Total de Cenários:** 12

**Passou:** \_\_\_ / 12

**Falhou:** \_\_\_ / 12

**Taxa de Sucesso:** \_\_\_%

---

## Observações Finais

**Pontos Positivos:**

**Pontos de Melhoria:**

**Recomendações:**

---

**Documentado por:** QA Agent  
**Última atualização:** 2025-01-08

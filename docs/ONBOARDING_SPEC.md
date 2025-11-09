# Especificação do Onboarding - Nossa Maternidade

**Versão:** 1.0  
**Data:** 2025-01-08  
**Público-alvo:** CID (Classe Média Digital) - Mães e gestantes brasileiras

---

## Objetivo

Criar um onboarding funcional e navegável que colete informações essenciais da usuária em ≤3 minutos, permitindo personalização do conteúdo e experiência no app.

---

## Fluxo de Perguntas

### Estrutura Geral

O onboarding consiste em **3 perguntas essenciais** que podem ser respondidas rapidamente:

1. **Trimestre da gestação** (single choice, required)
2. **Preferência de conteúdo** (single choice, required)
3. **Assuntos de interesse** (multi choice, optional)

### Formato JSON

Cada pergunta segue o formato:

```json
{
  "id": "q1",
  "type": "single_choice" | "multi_choice",
  "text": "Texto da pergunta",
  "options": [
    { "id": "q1o1", "label": "Opção 1" },
    { "id": "q1o2", "label": "Opção 2" }
  ],
  "required": true | false,
  "next": "q2" | null
}
```

### Perguntas Detalhadas

#### Q1: Em que trimestre você está?

- **Tipo:** `single_choice`
- **Obrigatória:** Sim
- **Opções:**
  - 1º trimestre (1-12 semanas)
  - 2º trimestre (13-27 semanas)
  - 3º trimestre (28-40 semanas)
  - Não estou grávida
- **Propósito:** Identificar estágio da gestação para personalizar conteúdo

#### Q2: Você prefere conteúdo em texto ou vídeo?

- **Tipo:** `single_choice`
- **Obrigatória:** Sim
- **Opções:**
  - Texto
  - Vídeo
  - Os dois
- **Propósito:** Personalizar formato de conteúdo exibido

#### Q3: Quais assuntos você quer acompanhar?

- **Tipo:** `multi_choice`
- **Obrigatória:** Não (mínimo 1 seleção recomendado)
- **Opções:**
  - Amamentação
  - Sono do bebê
  - Alimentação
  - Desenvolvimento do bebê
  - Saúde mental
  - Exercícios
- **Propósito:** Filtrar conteúdo relevante no feed

---

## Critérios de UX para Público CID

### Linguagem

- **Simples e direta:** Evitar termos técnicos ou jargões médicos complexos
- **Empática:** Tom acolhedor e compreensivo
- **Objetiva:** Perguntas claras sem ambiguidade

### Design

- **Botões grandes:** Touch targets ≥44px (iOS) / 48dp (Android)
- **Contraste alto:** WCAG 2.1 AA (4.5:1 para texto normal)
- **Feedback visual claro:** Estados visuais distintos (default, selected, pressed, disabled)
- **Progresso visível:** Barra de progresso mostrando quantas perguntas restam

### Interação

- **Navegação intuitiva:** Botão "Próximo" sempre visível
- **Validação clara:** Botão desabilitado até seleção obrigatória
- **Revisão possível:** Opção de voltar e editar respostas
- **Confirmação final:** Tela de revisão antes de finalizar

---

## Critérios de Aceite

### Funcionalidade

- [ ] Todas as perguntas são exibidas corretamente
- [ ] Opções são clicáveis e mostram feedback visual
- [ ] Botão "Próximo" só habilita quando required=true e há seleção
- [ ] Navegação anterior funciona corretamente
- [ ] Respostas são persistidas (AsyncStorage mock ou Supabase)
- [ ] Tela de revisão permite editar respostas
- [ ] Ao finalizar, navega para Home

### Performance

- [ ] Onboarding completo em ≤3 minutos
- [ ] Sem travamentos ou delays visíveis
- [ ] Animações suaves (≤300ms)

### Acessibilidade

- [ ] VoiceOver/TalkBack anuncia perguntas e opções
- [ ] Navegação por teclado funciona (web)
- [ ] Contraste de cores adequado
- [ ] Touch targets ≥44px

### Persistência

- [ ] Modo mock salva em AsyncStorage
- [ ] Modo real salva no Supabase
- [ ] Respostas podem ser recuperadas após fechar app
- [ ] Tratamento de erros com fallback para mock

---

## Fluxo de Navegação

```
Splash Screen
    ↓
Onboarding Question Screen (Q1)
    ↓ [Próximo]
Onboarding Question Screen (Q2)
    ↓ [Próximo]
Onboarding Question Screen (Q3)
    ↓ [Finalizar]
Review Answers Screen
    ↓ [Confirmar]
Home Screen
```

### Estados de Navegação

- **Primeira pergunta:** Botão "Anterior" desabilitado
- **Última pergunta:** Botão "Próximo" muda para "Finalizar"
- **Tela de revisão:** Botão "Editar" por pergunta, botão "Confirmar" para finalizar

---

## Dependências e Lógica Condicional

### Lógica de Pular Perguntas

- Se Q1 = "Não estou grávida", pode pular Q2 (preferência de conteúdo) ou manter
- Q3 (assuntos) sempre aparece, mas não é obrigatória

### Validação

- **Q1:** Sempre obrigatória
- **Q2:** Sempre obrigatória
- **Q3:** Opcional, mas recomenda-se pelo menos 1 seleção

---

## Persistência de Dados

### Formato de Resposta

```typescript
interface OnboardingAnswer {
  questionId: string;
  answer: string | string[]; // string para single_choice, string[] para multi_choice
  timestamp: string;
}

interface OnboardingSession {
  userId?: string; // null se modo mock
  answers: OnboardingAnswer[];
  completedAt: string;
}
```

### Armazenamento

- **Mock (USE_MOCKS=true):** AsyncStorage key `@onboarding_answers`
- **Real (USE_MOCKS=false):** Supabase table `onboarding_answers`

---

## Tratamento de Erros

### Cenários de Erro

1. **Falha ao salvar no Supabase:**
   - Fallback para AsyncStorage
   - Mostrar mensagem: "Salvando localmente. Sincronizaremos quando possível."

2. **Falha ao carregar perguntas:**
   - Usar perguntas hardcoded como fallback
   - Logar erro para debug

3. **Perda de conexão:**
   - Continuar em modo offline (AsyncStorage)
   - Sincronizar quando conexão voltar

---

## Métricas de Sucesso

- **Taxa de conclusão:** ≥80% dos usuários completam onboarding
- **Tempo médio:** ≤3 minutos
- **Taxa de erro:** <5% de falhas de persistência
- **Satisfação:** Feedback positivo sobre clareza das perguntas

---

## Próximos Passos

1. Implementar componentes clicáveis (Mobile Developer)
2. Criar schema Supabase (Backend Engineer)
3. Definir tokens de design (UX Designer)
4. Testar fluxo completo (QA)
5. Preparar build de demo (DevOps)

---

**Documentado por:** Product Manager Agent  
**Aprovado em:** 2025-01-08

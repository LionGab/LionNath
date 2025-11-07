# Componentes NAT-IA

Biblioteca de componentes React Native para integração com NAT-IA.

## Componentes

### ChatMessage
Renderiza mensagem individual no chat.

```tsx
import { ChatMessage } from '@/components/nathia/ChatMessage';

<ChatMessage
  message={message}
  onActionPress={handleAction}
  onFeedback={handleFeedback}
/>
```

**Props:**
- `message`: Objeto Message (role, content, timestamp, actions)
- `onActionPress?`: Callback quando action é clicada
- `onFeedback?`: Callback para feedback (thumbs up/down)

### SOSButton
Botão de emergência com modal de contatos.

```tsx
import { SOSButton } from '@/components/nathia/SOSButton';

<SOSButton onHumanSupportRequest={handleHumanSupport} />
```

**Props:**
- `onHumanSupportRequest?`: Callback quando usuário pede suporte humano
- `style?`: Estilos customizados

### QuickReplies
Sugestões rápidas em chips horizontais.

```tsx
import { QuickReplies } from '@/components/nathia/QuickReplies';

<QuickReplies
  suggestions={["Me sinto ansiosa", "Dúvida sobre amamentação"]}
  onSelect={handleQuickReply}
  disabled={loading}
/>
```

**Props:**
- `suggestions`: Array de strings
- `onSelect`: Callback quando sugestão é selecionada
- `disabled?`: Desabilita interação

**Helper:**
```tsx
import { getContextualSuggestions } from '@/components/nathia/QuickReplies';

const suggestions = getContextualSuggestions({
  stage: 'gestante',
  pregnancyWeek: 20,
  concerns: ['anxiety'],
});
```

### OnboardingFlow
Fluxo completo de onboarding (4-6 perguntas).

```tsx
import { OnboardingFlow } from '@/components/nathia/OnboardingFlow';

<OnboardingFlow
  userId={userId}
  onComplete={handleComplete}
/>
```

**Props:**
- `userId`: ID do usuário
- `onComplete`: Callback com resposta do onboarding

### RecommendationCard
Card de recomendação personalizada.

```tsx
import { RecommendationCard } from '@/components/nathia/RecommendationCard';

<RecommendationCard
  recommendation={recommendation}
  onPress={handlePress}
  onImpression={trackImpression}
/>
```

**Props:**
- `recommendation`: Objeto NathiaRecommendation
- `onPress`: Callback quando card é clicado
- `onImpression?`: Callback para tracking de impressão

## Design System

Todos os componentes usam o Design System v1:

```typescript
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

const { palette, typography, spacing, radius, shadow } = nossaMaternidadeDesignTokens;
```

### Cores Principais
- `palette.primary`: #6DA9E4 (Azul serenidade)
- `palette.accent`: #FF8BA3 (Rosa acolhedor)
- `palette.surface`: #DCEBFA (Superfície suave)
- `palette.background`: #FFF8F3 (Fundo quente)

### Tipografia
- Display: 40/52, -0.5 (Headlines principais)
- Headline XL: 32/40, -0.3
- Headline Lg: 28/36, -0.2
- Body Md: 16/24 (Corpo padrão)
- Caption: 12/18, +0.1

### Espaçamento
Base 4: xs(8), sm(12), md(16), lg(24), xl(32), 2xl(40)

### Border Radius
- sm: 12
- md: 18
- lg: 24
- full: 999

## Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1 AA:

- ✅ Labels claros para screen readers
- ✅ Hints contextuais
- ✅ Estados comunicados (disabled, selected, etc)
- ✅ Contraste mínimo 4.5:1
- ✅ Touch targets mínimo 44x44
- ✅ Suporte a VoiceOver/TalkBack

### Testando Acessibilidade

**iOS (VoiceOver):**
1. Settings > Accessibility > VoiceOver
2. Ative VoiceOver
3. Navegue com gestos

**Android (TalkBack):**
1. Settings > Accessibility > TalkBack
2. Ative TalkBack
3. Navegue com gestos

## Performance

### Otimizações
- Lazy rendering com FlatList
- Memoization de components pesados
- Debounce em inputs (300ms)
- Throttle em scroll events

### Métricas
- First Paint: < 1s
- Input Lag: < 100ms
- Scroll FPS: 60fps constante

## Testes

Todos os componentes têm testes unitários:

```bash
npm test tests/nathia/
```

### Exemplo de Teste

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { ChatMessage } from '@/components/nathia/ChatMessage';

it('should render user message', () => {
  const { getByText } = render(<ChatMessage message={mockMessage} />);
  expect(getByText('Hello')).toBeTruthy();
});
```

## Wireframes

### ChatMessage
```
┌─────────────────────────┐
│ [Avatar] User message   │ ← User (right aligned)
│          [Timestamp]    │
└─────────────────────────┘

┌─────────────────────────┐
│ [Avatar] Assistant msg  │ ← Assistant (left aligned)
│          [Timestamp]    │
│   [Action Button 1]     │ ← Actions (if present)
│   [Action Button 2]     │
│   👍 👎                 │ ← Feedback
└─────────────────────────┘
```

### SOSButton
```
┌─────────────────────────┐
│     [SOS] Button        │ ← Floating button
└─────────────────────────┘

Modal:
┌─────────────────────────┐
│  Estamos aqui por você  │
│                         │
│  📞 CVV - 188          │
│  🚑 SAMU - 192         │
│  💙 Conversar com...   │
│                         │
│      [Fechar]          │
└─────────────────────────┘
```

### QuickReplies
```
┌─────────────────────────┐
│ [Chip 1] [Chip 2] ...   │ ← Horizontal scroll
└─────────────────────────┘
```

## Troubleshooting

### Componente não renderiza
- Verifique se Design System está importado
- Verifique props obrigatórias
- Verifique console para erros

### Acessibilidade não funciona
- Verifique se `accessible={true}` está definido
- Verifique se `accessibilityLabel` está presente
- Teste com VoiceOver/TalkBack ativado

### Performance ruim
- Use `React.memo()` para components que re-renderizam muito
- Verifique se FlatList tem `keyExtractor` único
- Profile com React DevTools

## Contribuindo

1. Clone o repositório
2. Crie branch: `git checkout -b feature/nathia-new-component`
3. Implemente o componente
4. Adicione testes
5. Documente no README
6. Submit PR

## Licença

Proprietary - Nossa Maternidade © 2025

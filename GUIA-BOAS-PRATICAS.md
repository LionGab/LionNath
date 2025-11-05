# 🚀 GUIA DE BOAS PRÁTICAS - NOSSA MATERNIDADE
## Performance, Organização e Otimização Mobile-First

## 📋 Princípios Fundamentais

### Código TypeScript
- Escrever código TypeScript conciso e tecnicamente preciso
- Foco em performance e eficiência para rodar suavemente em dispositivos móveis
- Usar programação funcional e declarativa; evitar classes a menos que necessário
- Priorizar otimização de código e gestão eficiente de recursos

### Nomenclatura
- Usar nomes descritivos com verbos auxiliares (ex: `isLoading`, `hasRendered`)
- camelCase: funções, variáveis (ex: `createUser`, `dailyPlan`)
- PascalCase: componentes e tipos (ex: `UserProfile`, `DailyPlanScreen`)
- kebab-case: arquivos (ex: `daily-plan-screen.tsx`, `user-repository.ts`)
- Booleans: usar prefixos `should`, `has`, `is` (ex: `shouldShow`, `hasError`, `isLoading`)
- UPPERCASE: constantes globais (ex: `MAX_RETRY_ATTEMPTS`, `API_TIMEOUT`)

---

## 📁 Estrutura do Projeto

### Organização por Features
```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   └── LoadingScreen.tsx
├── screens/             # Telas principais
│   ├── HomeScreen.tsx
│   ├── ChatScreen.tsx
│   └── OnboardingScreen.tsx
├── features/           # Features específicas
│   ├── habits/
│   └── content/
├── repositories/       # Acesso a dados
│   ├── UserRepository.ts
│   ├── DailyPlanRepository.ts
│   └── ChatRepository.ts
├── services/           # Serviços externos
│   ├── supabase.ts
│   ├── ai.ts
│   └── notifications.ts
├── hooks/              # Custom hooks
│   ├── useDailyPlan.ts
│   └── useChatOptimized.ts
├── utils/              # Utilitários
│   ├── validation.ts
│   ├── logger.ts
│   └── helpers.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── constants/          # Constantes centralizadas
│   └── index.ts
├── config/             # Configurações
│   ├── api.ts
│   └── features.ts
└── theme/              # Sistema de design
    ├── colors.ts
    └── themes/
```

---

## ⚡ Otimizações de Performance

### React Native Best Practices

#### 1. Memoização de Componentes
```typescript
// ✅ BOM: Componente memoizado
export const MessageItem = React.memo<MessageItemProps>(({ message, onPress }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id;
});

// ❌ RUIM: Re-render desnecessário
export const MessageItem = ({ message, onPress }) => {
  // ...
};
```

#### 2. useCallback para Handlers
```typescript
// ✅ BOM: Handler memoizado
const handleSend = useCallback(() => {
  if (!inputText.trim() || loading) return;
  sendMessage(inputText.trim());
}, [inputText, loading, sendMessage]);

// ❌ RUIM: Handler recriado a cada render
const handleSend = () => {
  sendMessage(inputText.trim());
};
```

#### 3. useMemo para Computações Pesadas
```typescript
// ✅ BOM: Computação memoizada
const filteredActions = useMemo(() => {
  return QUICK_ACTIONS.filter(action => 
    action.type === userContext.type
  );
}, [userContext.type]);

// ❌ RUIM: Filtragem a cada render
const filteredActions = QUICK_ACTIONS.filter(action => 
  action.type === userContext.type
);
```

#### 4. FlatList Otimizada
```typescript
// ✅ BOM: FlatList otimizada
<FlatList
  data={messages}
  renderItem={renderMessageItem}
  keyExtractor={keyExtractor}
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={10}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
/>

// ❌ RUIM: Configuração padrão (pode ser lenta)
<FlatList
  data={messages}
  renderItem={renderMessageItem}
/>
```

---

## 🎯 Gestão de Estado

### Padrão Repository
```typescript
// ✅ BOM: Repository pattern
export class DailyPlanRepository {
  static async getByDate(userId: string, date: string) {
    // Lógica de acesso a dados centralizada
  }
}

// ❌ RUIM: Lógica direta na UI
const plan = await supabase.from('daily_plans').select('*')...
```

### Custom Hooks
```typescript
// ✅ BOM: Hook customizado
export const useDailyPlan = () => {
  const [dailyPlan, setDailyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const loadDailyPlan = useCallback(async () => {
    // Lógica centralizada
  }, []);
  
  return { dailyPlan, loading, loadDailyPlan };
};

// ❌ RUIM: Lógica duplicada em componentes
```

---

## 📦 Gestão de Assets e Recursos

### Carregamento Lazy
```typescript
// ✅ BOM: Lazy loading de screens
const HomeScreen = lazy(() => import('@/screens/HomeScreen'));

// ❌ RUIM: Import direto (carrega tudo de uma vez)
import HomeScreen from '@/screens/HomeScreen';
```

### Cache de Dados
```typescript
// ✅ BOM: Cache com AsyncStorage
const getCachedDailyPlan = async (userId: string, date: string) => {
  const cacheKey = `daily_plan_${userId}_${date}`;
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const plan = await DailyPlanRepository.getByDate(userId, date);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(plan));
  return plan;
};
```

---

## 🔧 TypeScript e Tipos

### Tipos Centralizados
```typescript
// ✅ BOM: Tipos em src/types/index.ts
export interface UserProfileLocal {
  id: string;
  name: string;
  type: UserType;
  // ...
}

// ❌ RUIM: Tipos duplicados ou `any`
const profile: any = { ... };
```

### Type Guards
```typescript
// ✅ BOM: Type guards
export const isGestante = (type: UserType): boolean => {
  return type === 'gestante';
};

// ✅ BOM: Validação com tipos
const validateUserType = (type: UserType | null): ValidationResult => {
  // ...
};
```

---

## 📱 Otimizações Mobile-First

### 1. SafeAreaView e StatusBar
```typescript
// ✅ BOM: Suporte iOS/Android
<SafeAreaView style={styles.container}>
  <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
  {/* Conteúdo */}
</SafeAreaView>
```

### 2. Touchable Areas (Mínimo 44x44px)
```typescript
// ✅ BOM: Área de toque adequada
<TouchableOpacity
  style={[styles.button, { minHeight: 44, minWidth: 44 }]}
  accessible={true}
  accessibilityRole="button"
>
```

### 3. ScrollView Otimizado
```typescript
// ✅ BOM: ScrollView otimizado
<ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.contentContainer}
  removeClippedSubviews={true}
>
```

### 4. KeyboardAvoidingView
```typescript
// ✅ BOM: Evitar teclado sobre input
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>
```

---

## 🎨 Sistema de Design

### Cores do Tema (Nunca Hardcoded)
```typescript
// ✅ BOM: Usar cores do tema
<Text style={{ color: colors.primary }}>Texto</Text>

// ❌ RUIM: Cores hardcoded
<Text style={{ color: '#DD5B9A' }}>Texto</Text>
```

### Spacing e Typography Consistentes
```typescript
// ✅ BOM: Spacing do tema
<View style={{ padding: spacing.lg, marginBottom: spacing.md }}>

// ❌ RUIM: Valores mágicos
<View style={{ padding: 16, marginBottom: 8 }}>
```

---

## 🐛 Tratamento de Erros

### Logger Centralizado
```typescript
// ✅ BOM: Usar logger
import { logger } from '@/utils/logger';

try {
  await savePlan();
} catch (error) {
  logger.error('Erro ao salvar plano', { error });
}

// ❌ RUIM: console.log/error
console.error('Erro:', error);
```

### Error Boundaries
```typescript
// ✅ BOM: Error Boundary
<ErrorBoundary
  onError={(error, errorInfo) => {
    logger.error('Erro capturado', { error, errorInfo });
  }}
>
  <AppNavigator />
</ErrorBoundary>
```

---

## 🧪 Validações

### Validações Centralizadas
```typescript
// ✅ BOM: Validação em src/utils/validation.ts
export const validateOnboardingData = (data: {
  name: string;
  type: UserType | null;
  // ...
}): ValidationResult => {
  const errors: ValidationError[] = [];
  // Validações...
  return { isValid: errors.length === 0, errors };
};

// ❌ RUIM: Validação inline
if (!name || name.length < 2) {
  Alert.alert('Erro', 'Nome inválido');
}
```

---

## 📊 Performance Monitoring

### Sentry Integration
```typescript
// ✅ BOM: Monitoramento de erros
import { initSentry } from '@/services/sentry';

if (process.env.NODE_ENV === 'production') {
  initSentry();
}
```

### Logger Estruturado
```typescript
// ✅ BOM: Logger com contexto
logger.info('Plano gerado', { userId, date, priorities });
logger.error('Erro ao gerar plano', { error, userId });
```

---

## 🔐 Segurança

### Validação de API Keys
```typescript
// ✅ BOM: Validação no startup
const checkConfig = () => {
  const missing = requiredKeys.filter(key => !API_CONFIG[key]);
  if (missing.length > 0) {
    showConfigErrorScreen(missing);
  }
};
```

### Service Role Key (Nunca Client-Side)
```typescript
// ✅ BOM: Service Role apenas Edge Functions
// SUPABASE_SERVICE_ROLE_KEY nunca usado no mobile

// ❌ RUIM: Expor Service Role no cliente
const supabase = createClient(url, SERVICE_ROLE_KEY); // NUNCA!
```

---

## 📝 Checklist de Performance

### Componentes
- [ ] Componentes pesados memoizados com `React.memo`
- [ ] Handlers memoizados com `useCallback`
- [ ] Computações pesadas com `useMemo`
- [ ] FlatList otimizada (windowSize, maxToRenderPerBatch)
- [ ] Lazy loading de screens

### Código
- [ ] Zero `any` types
- [ ] Validações centralizadas
- [ ] Repositórios para acesso a dados
- [ ] Logger substituindo console.log
- [ ] Cores do tema (nunca hardcoded)

### Mobile
- [ ] SafeAreaView para iOS/Android
- [ ] Áreas de toque mínimas (44x44px)
- [ ] KeyboardAvoidingView em formulários
- [ ] ScrollView otimizado
- [ ] Acessibilidade completa (WCAG 2.1 AA)

### Performance
- [ ] Cache de dados com AsyncStorage
- [ ] Lazy loading de assets
- [ ] Paginação em listas longas
- [ ] Debounce em buscas
- [ ] Throttle em scroll handlers

---

## 🎯 Prioridades de Otimização

1. **Crítico**: Memoização de componentes pesados
2. **Alto**: FlatList otimizada
3. **Alto**: Cache de dados frequentes
4. **Médio**: Lazy loading de screens
5. **Médio**: Debounce em inputs
6. **Baixo**: Animações otimizadas

---

## 📚 Referências

- React Native Performance: https://reactnative.dev/docs/performance
- React Optimization: https://react.dev/reference/react/useMemo
- TypeScript Best Practices: https://typescript-eslint.io/rules/
- Accessibility: https://reactnative.dev/docs/accessibility

---

_Última atualização: $(date)_
_Projeto: Nossa Maternidade - React Native/Expo_

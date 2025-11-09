# Correções Aplicadas - TypeScript Errors

## Erros Corrigidos

### 1. ContentFeedScreen.tsx (linha 163)

**Erro original:**

```
error TS2345: Argument of type '[any, { contentId: string; }]' is not assignable to parameter of type 'never'.
```

**Correção aplicada:**

- Adicionado tipagem explícita `NavigationProp<RootStackParamList>` no hook `useNavigation`
- Criado função `handlePress` separada com type assertion explícita
- Importado `RootStackParamList` de `@/navigation/types`

**Código corrigido:**

```typescript
const navigation = useNavigation<NavigationProp<RootStackParamList>>();

const renderContentItem = useCallback(
  ({ item }: { item: ContentItem }) => {
    const handlePress = () => {
      (navigation as NavigationProp<RootStackParamList>).navigate('ContentDetail', { contentId: item.id });
    };

    return (
      <Card
        variant="elevated"
        style={styles.contentCard}
        onPress={handlePress}
        accessibilityLabel={`${item.title} - ${item.type}`}
      >
        {/* ... conteúdo do card ... */}
      </Card>
    );
  },
  [navigation, toggleFavorite]
);
```

### 2. onboarding.ts (linha 103)

**Erro original:**

```
error TS2339: Property 'xl' does not exist on type 'RadiusScale'.
```

**Correção aplicada:**

- Alterado `radius.xl` para `radius.lg` (pois `RadiusScale` só possui: `sm`, `md`, `lg`, `full`)
- Adicionado comentário explicativo

**Código corrigido:**

```typescript
borderRadius: {
  option: radius.lg,
  button: radius.md,
  card: radius.lg, // Usando lg pois xl não existe no RadiusScale
},
```

## Próximos Passos

Se os erros persistirem após essas correções, pode ser cache do TypeScript. Tente:

1. **Limpar cache do Turbo:**

   ```bash
   pnpm turbo clean
   ```

2. **Limpar cache do TypeScript:**

   ```bash
   rm -rf node_modules/.cache
   rm -rf .turbo
   ```

3. **Reinstalar dependências (se necessário):**

   ```bash
   rm -rf node_modules
   pnpm install
   ```

4. **Executar type-check novamente:**
   ```bash
   pnpm -w run type-check
   ```

## Arquivos Modificados

- `src/features/content/ContentFeedScreen.tsx`
- `src/theme/onboarding.ts`

# 🎨 Tema v0.app - Integração

**Fonte:** https://v0.app/chat/duplicate-of-nossa-maternidade-app-ScMbww6iS8W

## ✅ O Que Foi Criado

### 1. Sistema de Temas Múltiplos

- ✅ `src/theme/themes/v0-app.ts` - Tema v0.app (Light + Dark)
- ✅ `src/theme/themes/index.ts` - Sistema de gerenciamento de temas
- ✅ `src/contexts/ThemeContext.tsx` - Context atualizado para suportar múltiplos temas
- ✅ `src/components/ThemeSelector.tsx` - Componente para selecionar tema

### 2. Refatorações Aplicadas

- ✅ **ThemeContext** - Agora suporta múltiplos temas
- ✅ **Sistema de Cores** - Estrutura flexível para adicionar novos temas
- ✅ **Componentes** - Já usam o sistema de tema (Button, Card, etc.)

## 📋 Como Usar

### Mudar Tema Programaticamente

```typescript
import { useTheme } from '@/contexts/ThemeContext';

const MyComponent = () => {
  const { themeName, setThemeName, colors } = useTheme();

  // Mudar para tema v0.app
  const switchToV0App = () => {
    setThemeName('v0-app');
  };

  // Usar cores do tema atual
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Texto</Text>
    </View>
  );
};
```

### Usar Componente de Seleção

```typescript
import { ThemeSelector } from '@/components/ThemeSelector';

const SettingsScreen = () => {
  return (
    <ScrollView>
      <ThemeSelector />
      {/* Outras configurações */}
    </ScrollView>
  );
};
```

## 🎨 Temas Disponíveis

### 1. Bubblegum (Padrão)

- **Light:** Rosa acolhedor (#DD5B9A)
- **Dark:** Azul escuro (#3C3C4D)
- **Status:** ✅ Completo e funcional

### 2. v0.app (Novo)

- **Light:** Azul moderno (#0070F3)
- **Dark:** Azul escuro (#0A0A0A)
- **Status:** ⚠️ **Pendente** - Precisa preencher cores do design do v0.app

## ⚠️ IMPORTANTE: Preencher Cores do v0.app

O tema v0.app está criado mas **precisa das cores reais** do design do v0.app.

### O Que Fazer

1. **Acesse o link do v0.app:**
   - https://v0.app/chat/duplicate-of-nossa-maternidade-app-ScMbww6iS8W

2. **Extraia as cores do design:**
   - Background colors
   - Primary color
   - Secondary colors
   - Text colors
   - Border colors
   - Etc.

3. **Atualize o arquivo:**
   - `src/theme/themes/v0-app.ts`
   - Substitua os valores `TODO` pelas cores reais

### Estrutura de Cores a Preencher

```typescript
// src/theme/themes/v0-app.ts

export const v0AppLight = {
  background: '#FFFFFF', // TODO: Cor real do v0.app
  foreground: '#0A0A0A', // TODO: Cor real do v0.app
  primary: '#0070F3', // TODO: Cor primária real do v0.app
  secondary: '#F1F3F5', // TODO: Cor secundária real do v0.app
  // ... preencher todas as cores
};
```

## 🔧 Refatorações Necessárias

### Componentes que Precisam de Atualização

Os componentes já usam o sistema de tema, mas podem precisar de ajustes:

1. **Verificar componentes que usam tokens diretamente:**

   ```bash
   grep -r "from '@/theme'" src/
   ```

2. **Atualizar para usar `useTheme()` quando possível:**

   ```typescript
   // Antes
   import { colors } from '@/theme/colors';

   // Depois (quando possível)
   import { useTheme } from '@/contexts/ThemeContext';
   const { colors } = useTheme();
   ```

### Componentes Já Compatíveis

- ✅ `Button.tsx` - Usa tema do contexto
- ✅ `Card.tsx` - Usa tema do contexto
- ✅ Componentes que usam `useTheme()` hook

## 📝 Checklist

### Integração Completa

- [x] Sistema de temas múltiplos criado
- [x] Tema v0.app criado (estrutura)
- [x] ThemeContext atualizado
- [x] Componente ThemeSelector criado
- [ ] **Cores do v0.app extraídas e preenchidas** ⚠️
- [ ] Componentes testados com novo tema
- [ ] Documentação atualizada

### Próximos Passos

1. **Extrair cores do v0.app** (manual)
2. **Preencher `src/theme/themes/v0-app.ts`**
3. **Testar tema v0.app em todas as telas**
4. **Ajustar cores se necessário**

## 🎯 Como Extrair Cores do v0.app

1. **Acesse o link:**
   - https://v0.app/chat/duplicate-of-nossa-maternidade-app-ScMbww6iS8W

2. **Use DevTools do navegador:**
   - F12 > Elements/Inspector
   - Selecione elementos e veja as cores CSS
   - Copie valores hex/rgb

3. **Ou use ferramentas de extração:**
   - Chrome DevTools Color Picker
   - Extensões como "ColorZilla"
   - Screenshots com ferramentas de design

4. **Preencha o arquivo:**
   - `src/theme/themes/v0-app.ts`
   - Substitua todos os `TODO` com cores reais

## 📚 Estrutura de Arquivos

```
src/
├── theme/
│   ├── designSystemV1.ts      # Tokens v1 unificados (Bubblegum)
│   ├── themes/
│   │   ├── index.ts           # Sistema de gerenciamento
│   │   └── v0-app.ts          # Tema v0.app (preencher)
│   ├── tokens/
│   │   └── nossa-maternidade-v1.js
│   └── index.ts               # Barrel export central
├── contexts/
│   └── ThemeContext.tsx       # Context atualizado
├── components/
│   └── ThemeSelector.tsx      # Componente de seleção
└── constants/
    └── theme.ts               # Tema expandido (compatibilidade)
```

---

**Status:** ✅ Estrutura criada | ⚠️ Cores do v0.app precisam ser preenchidas

**Próximo passo:** Extrair cores do design do v0.app e preencher `src/theme/themes/v0-app.ts`

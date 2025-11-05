# 🎮 Sistema de Jogos - Nossa Maternidade

Este diretório contém a estrutura completa para desenvolvimento de jogos usando Pixi.js, **adaptada para React Native e Web**.

## 📁 Estrutura de Diretórios

```
src/games/
├── components/          # Componentes React
│   ├── game-view.tsx           # Componente Web (Canvas)
│   ├── game-web-view.tsx       # Componente Mobile (WebView)
│   └── index.ts
├── screens/             # Screens React Native
│   └── game-screen.tsx         # Screen de exemplo
├── scenes/              # Cenas do jogo
│   ├── base-scene.ts          # Classe base
│   └── gameplay-scene.ts      # Exemplo
├── entities/            # Entidades do jogo
│   └── player.ts              # Exemplo
├── assets/              # Gerenciamento de assets
│   └── asset-manager.ts
├── utils/               # Utilitários
│   └── storage-manager.ts     # Storage adaptado (AsyncStorage)
├── types/               # Tipos TypeScript
│   └── game-types.ts
├── constants/           # Constantes
│   └── game-config.ts         # Adaptado para RN
├── game-engine.ts       # Motor do jogo
└── index.ts            # Exportações principais
```

## 🚀 Uso Rápido

### Instalar Dependências

```bash
cd apps/mobile
pnpm add pixi.js react-native-webview
```

### Usar no App

```typescript
import { GameScreen } from '@/games';

// Na navegação
<Stack.Screen name="Game" component={GameScreen} />
```

### Usar Componente

```typescript
import { GameView } from '@/games'; // Web
import { GameWebView } from '@/games'; // Mobile

<GameView
  config={{ width: 800, height: 600 }}
  onReady={() => console.log('Pronto!')}
/>
```

## 📚 Documentação Completa

- **[docs/GAMES_INTEGRATION.md](../../docs/GAMES_INTEGRATION.md)** - Guia de integração
- **[docs/PIXIJS_GAME_DEVELOPMENT_GUIDE.md](../../docs/PIXIJS_GAME_DEVELOPMENT_GUIDE.md)** - Diretrizes de desenvolvimento

## ✅ Características

- ✅ **Cross-Platform**: Funciona em Web e React Native
- ✅ **TypeScript**: Tipagem completa
- ✅ **Performance**: Otimizado para mobile
- ✅ **Storage**: AsyncStorage integrado
- ✅ **Responsivo**: Adapta-se automaticamente à tela

## 🎯 Próximos Passos

1. Instalar dependências
2. Criar assets do jogo
3. Implementar lógica específica
4. Adicionar à navegação

# 🎮 Sistema de Jogos - Integração React Native

Este documento explica como usar o sistema de jogos Pixi.js no app Nossa Maternidade.

## 📦 Instalação

### Dependências Necessárias

```bash
# No diretório apps/mobile
pnpm add pixi.js react-native-webview
pnpm add -D @types/pixi.js
```

### Verificar Dependências Existentes

O projeto já possui:
- ✅ `@react-native-async-storage/async-storage` - Para storage
- ✅ `react-native-web` - Para compatibilidade web

## 🚀 Uso Básico

### 1. Usar GameScreen (Exemplo Completo)

```typescript
import { GameScreen } from '@/games';

// Na navegação
<Stack.Screen name="Game" component={GameScreen} />
```

### 2. Usar Componentes Individualmente

#### Web (Canvas Direto)

```typescript
import { GameView } from '@/games';

<GameView
  config={{
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
  }}
  onReady={() => console.log('Jogo pronto!')}
  onError={(error) => console.error(error)}
  onProgress={(progress) => console.log(`${progress * 100}%`)}
/>
```

#### Mobile (WebView)

```typescript
import { GameWebView } from '@/games';

<GameWebView
  config={{
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
  }}
  onReady={() => console.log('Jogo pronto!')}
  onError={(error) => console.error(error)}
/>
```

## 🏗️ Estrutura

```
src/games/
├── components/
│   ├── game-view.tsx          # Componente Web (Canvas)
│   ├── game-web-view.tsx      # Componente Mobile (WebView)
│   └── index.ts
├── screens/
│   └── game-screen.tsx         # Screen de exemplo
├── scenes/
│   ├── base-scene.ts          # Classe base para cenas
│   └── gameplay-scene.ts      # Exemplo de cena
├── entities/
│   └── player.ts               # Exemplo de entidade
├── assets/
│   └── asset-manager.ts        # Gerenciador de assets
├── utils/
│   └── storage-manager.ts      # Storage com AsyncStorage
├── types/
│   └── game-types.ts           # Tipos TypeScript
├── constants/
│   └── game-config.ts          # Constantes (adaptado para RN)
├── game-engine.ts              # Motor do jogo
└── index.ts                    # Exportações
```

## 📱 Adaptações para React Native

### 1. Dimensions

O `RENDER_CONFIG` agora usa `Dimensions` do React Native automaticamente:

```typescript
import { RENDER_CONFIG } from '@/games';

// Usa dimensões da tela automaticamente
const { DEFAULT_WIDTH, DEFAULT_HEIGHT } = RENDER_CONFIG;
```

### 2. Storage

Usa `AsyncStorage` do React Native:

```typescript
import { StorageManager } from '@/games';

const storage = StorageManager.getInstance();
await storage.save(gameState);
const saved = await storage.load();
```

### 3. Platform Detection

Os componentes detectam automaticamente a plataforma:

- **Web**: Renderiza canvas diretamente com Pixi.js
- **Mobile**: Usa WebView para renderizar HTML com Pixi.js

## 🎯 Criando um Jogo Customizado

### 1. Criar uma Nova Cena

```typescript
import { BaseScene } from '@/games/scenes/base-scene';
import { Application } from 'pixi.js';

export class MyGameScene extends BaseScene {
  async init(): Promise<void> {
    // Carregar assets
    // Criar entidades
    // Configurar controles
  }

  update(deltaTime: number): void {
    // Lógica do jogo
  }

  cleanup(): void {
    // Limpar recursos
  }
}
```

### 2. Usar a Cena

```typescript
import { GameEngine } from '@/games';

const engine = new GameEngine();
await engine.init();
const scene = new MyGameScene(engine.getApplication());
await engine.setScene(scene);
```

## 🔧 Configuração

### Adicionar à Navegação

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  // ... outras rotas
  Game: undefined;
};

// No Stack Navigator
<Stack.Screen
  name="Game"
  component={GameScreen}
  options={{ title: 'Jogo' }}
/>
```

### Assets

Coloque os assets em:
- **Web**: `/public/assets/games/`
- **Mobile**: Bundle com o app ou CDN

## ⚠️ Limitações

1. **WebView no Mobile**: Requer conexão para carregar Pixi.js via CDN
   - Solução: Bundle Pixi.js localmente ou usar servidor local

2. **Performance**: WebView pode ter overhead
   - Considere usar `expo-gl` para melhor performance nativa

3. **Assets**: No mobile, assets precisam estar acessíveis via HTTP ou bundle

## 📚 Próximos Passos

1. Instalar dependências: `pnpm add pixi.js react-native-webview`
2. Criar assets do jogo
3. Implementar lógica específica do jogo
4. Adicionar à navegação do app
5. Testar em web e mobile

## 🔗 Referências

- [Pixi.js Docs](https://pixijs.com/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [Expo GL](https://docs.expo.dev/versions/latest/sdk/gl-view/) - Alternativa para melhor performance

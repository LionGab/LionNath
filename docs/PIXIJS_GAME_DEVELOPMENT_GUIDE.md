# 🎮 Guia de Desenvolvimento de Jogos com Pixi.js

Este documento estabelece as diretrizes e melhores práticas para desenvolvimento de jogos usando TypeScript e Pixi.js neste projeto.

## 📋 Princípios Fundamentais

- **Performance First**: Otimização constante para web e mobile
- **Type Safety**: TypeScript com tipagem explícita
- **Functional Programming**: Padrões funcionais e declarativos
- **Resource Management**: Gerenciamento eficiente de recursos
- **Cross-Platform**: Funciona bem em web e Ionic Capacitor

## 🏗️ Estrutura de Diretórios

```
src/
├── games/
│   ├── scenes/              # Cenas do jogo (menu, gameplay, gameover)
│   ├── entities/            # Entidades (player, enemies, items)
│   ├── systems/             # Sistemas (physics, collision, scoring)
│   ├── assets/              # Gerenciamento de assets
│   ├── utils/               # Utilitários do jogo
│   └── types/               # Tipos TypeScript específicos do jogo
├── game-engine/             # Motor do jogo (se necessário)
└── game-services/           # Serviços (save state, analytics)
```

## 📝 Convenções de Nomenclatura

### Arquivos
- **kebab-case**: `game-scene.ts`, `player-component.ts`, `asset-loader.ts`

### Variáveis e Funções
- **camelCase**: `createSprite()`, `playerHealth`, `isGameOver`
- **Booleans**: prefixos `is`, `has`, `should` → `isLoading`, `hasRendered`, `shouldRespawn`

### Classes e Objetos Pixi.js
- **PascalCase**: `PlayerSprite`, `GameScene`, `AssetManager`

### Constantes
- **UPPER_SNAKE_CASE**: `MAX_PLAYERS`, `GRAVITY`, `DEFAULT_CONFIG`

## 🎯 TypeScript e Pixi.js - Melhores Práticas

### Tipagem Forte

```typescript
// ✅ BOM: Tipagem explícita
interface PlayerConfig {
  position: { x: number; y: number };
  health: number;
  speed: number;
}

const createPlayer = (config: PlayerConfig): Container => {
  // ...
};

// ❌ EVITAR: any
const createPlayer = (config: any) => {
  // ...
};
```

### Renderer Selection

```typescript
import { Application, RendererType } from 'pixi.js';

const createApplication = async (): Promise<Application> => {
  const app = new Application();
  
  await app.init({
    width: 800,
    height: 600,
    // Tentar WebGPU primeiro, fallback para WebGL
    preference: RendererType.WEBGPU,
    fallback: RendererType.WEBGL,
    // Para Ionic Capacitor, considerar legacy
    // legacy: true // Para dispositivos mais antigos
  });
  
  return app;
};
```

### Game Loop com Ticker

```typescript
import { Ticker } from 'pixi.js';

const setupGameLoop = (
  app: Application,
  updateCallback: (deltaTime: number) => void
): void => {
  const ticker = Ticker.shared;
  
  ticker.add((ticker) => {
    const deltaTime = ticker.deltaTime;
    updateCallback(deltaTime);
  });
  
  // Otimização: usar FPS fixo quando possível
  ticker.maxFPS = 60;
};
```

## ⚡ Otimizações Pixi.js

### Sprite Batching

```typescript
// ✅ BOM: Usar Container para batching
const container = new Container();
container.addChild(sprite1, sprite2, sprite3);

// ❌ EVITAR: Adicionar sprites diretamente ao stage
app.stage.addChild(sprite1);
app.stage.addChild(sprite2);
```

### Texture Atlases

```typescript
import { Assets, SpriteSheet } from 'pixi.js';

const loadTextureAtlas = async (): Promise<SpriteSheet> => {
  const sheet = await Assets.load({
    src: 'assets/spritesheet.json',
    data: {
      texture: 'assets/spritesheet.png'
    }
  });
  
  return sheet;
};
```

### Object Pooling

```typescript
class BulletPool {
  private pool: Container[] = [];
  private active: Set<Container> = new Set();
  
  get(): Container {
    let bullet: Container;
    
    if (this.pool.length > 0) {
      bullet = this.pool.pop()!;
    } else {
      bullet = this.createBullet();
    }
    
    this.active.add(bullet);
    return bullet;
  }
  
  release(bullet: Container): void {
    this.active.delete(bullet);
    bullet.visible = false;
    bullet.position.set(0, 0);
    this.pool.push(bullet);
  }
  
  private createBullet(): Container {
    // Criar novo bullet
    return new Container();
  }
}
```

### Culling (Oculta objetos fora da tela)

```typescript
const updateVisibleObjects = (
  container: Container,
  viewportBounds: Rectangle
): void => {
  container.children.forEach((child) => {
    const bounds = child.getBounds();
    child.visible = bounds.intersects(viewportBounds);
  });
};
```

### ParticleContainer para Muitos Sprites

```typescript
import { ParticleContainer } from 'pixi.js';

// Para 1000+ sprites similares
const particleContainer = new ParticleContainer(1000, {
  position: true,
  rotation: true,
  scale: true,
  // Não incluir propriedades desnecessárias para melhor performance
});
```

## 📱 Otimizações Mobile (Ionic Capacitor)

### Touch Controls

```typescript
import { FederatedPointerEvent } from 'pixi.js';

const setupTouchControls = (app: Application): void => {
  app.stage.eventMode = 'static';
  app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
    const { x, y } = event.global;
    handleTouch(x, y);
  });
  
  // Suporte para gestos
  let touchStartX = 0;
  let touchStartY = 0;
  
  app.stage.on('pointerdown', (event: FederatedPointerEvent) => {
    touchStartX = event.global.x;
    touchStartY = event.global.y;
  });
  
  app.stage.on('pointerup', (event: FederatedPointerEvent) => {
    const deltaX = event.global.x - touchStartX;
    const deltaY = event.global.y - touchStartY;
    
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      handleSwipe(deltaX, deltaY);
    }
  });
};
```

### Responsive Design

```typescript
const setupResponsiveGame = (app: Application): void => {
  const resize = (): void => {
    const { innerWidth, innerHeight } = window;
    
    // Manter aspect ratio
    const targetAspectRatio = 16 / 9;
    let width = innerWidth;
    let height = innerHeight;
    
    if (width / height > targetAspectRatio) {
      width = height * targetAspectRatio;
    } else {
      height = width / targetAspectRatio;
    }
    
    app.renderer.resize(width, height);
    updateGameViewport(width, height);
  };
  
  window.addEventListener('resize', resize);
  resize();
};
```

### Asset Optimization para Mobile

```typescript
const getAssetQuality = (): 'high' | 'medium' | 'low' => {
  // Detectar capacidade do dispositivo
  const isHighEnd = navigator.hardwareConcurrency >= 4;
  const hasGoodMemory = (navigator as any).deviceMemory >= 4;
  
  if (isHighEnd && hasGoodMemory) {
    return 'high';
  } else if (isHighEnd || hasGoodMemory) {
    return 'medium';
  }
  
  return 'low';
};

const loadAssets = async (): Promise<void> => {
  const quality = getAssetQuality();
  const assetPath = `assets/${quality}/`;
  
  await Assets.load({
    src: `${assetPath}spritesheet.json`,
    // ...
  });
};
```

### Power Management

```typescript
// Pausar quando não visível
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    Ticker.shared.stop();
  } else {
    Ticker.shared.start();
  }
});

// Reduzir FPS quando bateria baixa
const setupBatteryOptimization = (): void => {
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      battery.addEventListener('levelchange', () => {
        if (battery.level < 0.2) {
          Ticker.shared.maxFPS = 30; // Reduzir FPS
        } else {
          Ticker.shared.maxFPS = 60;
        }
      });
    });
  }
};
```

## 🎨 Gerenciamento de Assets

### Asset Manager Centralizado

```typescript
import { Assets, AssetInitOptions } from 'pixi.js';

class AssetManager {
  private static instance: AssetManager;
  private loadedAssets: Map<string, any> = new Map();
  
  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }
  
  async loadAsset(key: string, path: string): Promise<any> {
    if (this.loadedAssets.has(key)) {
      return this.loadedAssets.get(key);
    }
    
    const asset = await Assets.load(path);
    this.loadedAssets.set(key, asset);
    return asset;
  }
  
  async loadMultiple(assets: Record<string, string>): Promise<void> {
    const promises = Object.entries(assets).map(([key, path]) =>
      this.loadAsset(key, path)
    );
    
    await Promise.all(promises);
  }
  
  getAsset(key: string): any {
    return this.loadedAssets.get(key);
  }
  
  releaseAsset(key: string): void {
    const asset = this.loadedAssets.get(key);
    if (asset?.destroy) {
      asset.destroy();
    }
    this.loadedAssets.delete(key);
  }
}
```

### Progressive Loading

```typescript
const loadAssetsProgressively = async (
  onProgress: (progress: number) => void
): Promise<void> => {
  const criticalAssets = ['player', 'background'];
  const optionalAssets = ['effects', 'sounds'];
  
  // Carregar assets críticos primeiro
  await AssetManager.getInstance().loadMultiple(
    Object.fromEntries(
      criticalAssets.map((key) => [key, `assets/${key}.json`])
    )
  );
  
  onProgress(0.5);
  
  // Carregar assets opcionais depois
  await AssetManager.getInstance().loadMultiple(
    Object.fromEntries(
      optionalAssets.map((key) => [key, `assets/${key}.json`])
    )
  );
  
  onProgress(1.0);
};
```

## 🗄️ Gerenciamento de Estado

### Save State Management

```typescript
interface GameSaveState {
  level: number;
  score: number;
  playerHealth: number;
  inventory: string[];
  timestamp: number;
}

class SaveStateManager {
  private static readonly STORAGE_KEY = 'game_save_state';
  
  static save(state: GameSaveState): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  }
  
  static load(): GameSaveState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar:', error);
      return null;
    }
  }
  
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

## 🧪 Testes

### Unit Tests para Game Logic

```typescript
import { describe, it, expect } from 'vitest';

describe('Game Logic', () => {
  it('should calculate score correctly', () => {
    const baseScore = 100;
    const multiplier = 2;
    const result = calculateScore(baseScore, multiplier);
    expect(result).toBe(200);
  });
  
  it('should detect collision', () => {
    const obj1 = { x: 10, y: 10, width: 20, height: 20 };
    const obj2 = { x: 15, y: 15, width: 20, height: 20 };
    expect(checkCollision(obj1, obj2)).toBe(true);
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('should maintain 60 FPS', () => {
    const startTime = performance.now();
    
    // Executar 60 frames
    for (let i = 0; i < 60; i++) {
      updateGame(16.67); // ~16.67ms por frame
    }
    
    const endTime = performance.now();
    const averageFrameTime = (endTime - startTime) / 60;
    
    expect(averageFrameTime).toBeLessThan(16.67);
  });
});
```

## 🚀 Deployment (Vercel/Cloudflare)

### Caching Strategy

```typescript
// vercel.json ou cloudflare workers
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Progressive Loading

```typescript
// Carregar assets críticos primeiro
const loadCriticalAssets = async (): Promise<void> => {
  await AssetManager.getInstance().loadMultiple({
    player: '/assets/player.json',
    background: '/assets/background.json'
  });
  
  // Iniciar jogo
  startGame();
  
  // Carregar assets restantes em background
  AssetManager.getInstance().loadMultiple({
    effects: '/assets/effects.json',
    sounds: '/assets/sounds.json'
  }).catch(console.error);
};
```

## ⚠️ Pixi.js Gotchas e Workarounds

### Limite de 65k Vertices

```typescript
// Se precisar de mais vertices, dividir em múltiplos Graphics
const createLargeShape = (vertices: number[]): Container => {
  const container = new Container();
  const maxVertices = 65000;
  
  for (let i = 0; i < vertices.length; i += maxVertices) {
    const chunk = vertices.slice(i, i + maxVertices);
    const graphics = new Graphics();
    // Desenhar chunk
    container.addChild(graphics);
  }
  
  return container;
};
```

### Texture Memory Management

```typescript
// Limpar texturas não utilizadas
const cleanupUnusedTextures = (): void => {
  Texture.removeAllListeners();
  Texture.removeFromCache('unused-texture');
  
  // Forçar garbage collection (se disponível)
  if (global.gc) {
    global.gc();
  }
};
```

## 📊 Error Handling e Logging

```typescript
class GameErrorHandler {
  static setup(app: Application): void {
    // Erros não capturados
    window.addEventListener('error', (event) => {
      console.error('Game Error:', event.error);
      this.reportError(event.error);
    });
    
    // Erros de assets
    Assets.loader.onError.add((error) => {
      console.error('Asset Load Error:', error);
      this.reportError(error);
    });
    
    // Erros de renderização
    app.renderer.on('error', (error) => {
      console.error('Renderer Error:', error);
      this.reportError(error);
    });
  }
  
  private static reportError(error: Error): void {
    // Enviar para serviço de monitoramento (Sentry, etc)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }
}
```

## 🔗 Referências

- [Pixi.js Documentation](https://pixijs.com/)
- [Pixi.js Performance Guide](https://pixijs.com/guides/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ionic Capacitor](https://capacitorjs.com/)

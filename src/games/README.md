# 🎮 Estrutura de Jogos

Este diretório contém a estrutura base para desenvolvimento de jogos usando Pixi.js.

## 📁 Estrutura de Diretórios

```
games/
├── scenes/              # Cenas do jogo (menu, gameplay, gameover)
│   ├── menu-scene.ts
│   ├── gameplay-scene.ts
│   └── gameover-scene.ts
├── entities/            # Entidades do jogo
│   ├── player.ts
│   ├── enemy.ts
│   └── item.ts
├── systems/             # Sistemas do jogo
│   ├── physics-system.ts
│   ├── collision-system.ts
│   └── scoring-system.ts
├── assets/              # Gerenciamento de assets
│   ├── asset-manager.ts
│   └── asset-loader.ts
├── utils/               # Utilitários
│   ├── math-utils.ts
│   └── game-utils.ts
├── types/               # Tipos TypeScript
│   └── game-types.ts
└── constants/           # Constantes do jogo
    └── game-config.ts
```

## 🚀 Uso Básico

Ver `docs/PIXIJS_GAME_DEVELOPMENT_GUIDE.md` para diretrizes completas.

## 📝 Exemplo Mínimo

```typescript
import { Application } from 'pixi.js';
import { GameScene } from './scenes/gameplay-scene';

const initGame = async (): Promise<void> => {
  const app = new Application();
  await app.init({
    width: 800,
    height: 600,
    preference: RendererType.WEBGPU,
    fallback: RendererType.WEBGL,
  });
  
  document.body.appendChild(app.canvas);
  
  const scene = new GameScene(app);
  app.stage.addChild(scene);
  
  // Iniciar game loop
  Ticker.shared.add(() => {
    scene.update(Ticker.shared.deltaTime);
  });
};
```

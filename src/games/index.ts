/**
 * Arquivo de índice - Exporta todos os módulos principais do sistema de jogos
 * Adaptado para React Native e Web
 */

// React Components
export { GameView, GameWebView } from './components';
export type { GameViewProps, GameWebViewProps } from './components';

// Screens
export { GameScreen } from './screens/game-screen';

// Engine
export { GameEngine } from './game-engine';
export type { GameInitConfig } from './game-engine';

// Scenes
export { BaseScene } from './scenes/base-scene';
export { GameplayScene } from './scenes/gameplay-scene';

// Entities
export { Player } from './entities/player';

// Assets
export { AssetManager } from './assets/asset-manager';

// Utils
export { StorageManager } from './utils/storage-manager';

// Types
export type {
  Position,
  Dimensions,
  Bounds,
  EntityConfig,
  GameState,
  CollisionConfig,
  CollisionResult,
  GameEvent,
  GameEventListener,
  AssetConfig,
  GameSaveState,
} from './types/game-types';

// Constants
export {
  RENDER_CONFIG,
  PHYSICS_CONFIG,
  COLLISION_CONFIG,
  PERFORMANCE_CONFIG,
  ASSET_CONFIG,
  INPUT_CONFIG,
  SAVE_CONFIG,
  SCORING_CONFIG,
  GAME_LIMITS,
} from './constants/game-config';

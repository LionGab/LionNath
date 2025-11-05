/**
 * Tipos TypeScript para o sistema de jogos
 */

import { Container, Point } from 'pixi.js';

/**
 * Posição no espaço 2D
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Dimensões de um objeto
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Bounds de um objeto (posição + dimensões)
 */
export interface Bounds extends Position, Dimensions {}

/**
 * Configuração de uma entidade do jogo
 */
export interface EntityConfig {
  position: Position;
  rotation?: number;
  scale?: number;
  visible?: boolean;
}

/**
 * Estado do jogo
 */
export interface GameState {
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  level: number;
  lives: number;
}

/**
 * Configuração de colisão
 */
export interface CollisionConfig {
  bounds: Bounds;
  isStatic?: boolean;
  isTrigger?: boolean;
}

/**
 * Resultado de uma colisão
 */
export interface CollisionResult {
  hasCollided: boolean;
  collidedWith?: Container;
  collisionPoint?: Point;
}

/**
 * Eventos do jogo
 */
export type GameEvent =
  | { type: 'SCORE_CHANGED'; score: number }
  | { type: 'LIFE_LOST'; lives: number }
  | { type: 'LEVEL_COMPLETE'; level: number }
  | { type: 'GAME_OVER'; finalScore: number }
  | { type: 'ENTITY_DESTROYED'; entityId: string };

/**
 * Listener de eventos do jogo
 */
export type GameEventListener = (event: GameEvent) => void;

/**
 * Configuração de assets
 */
export interface AssetConfig {
  key: string;
  path: string;
  type: 'texture' | 'spritesheet' | 'sound' | 'font';
  required?: boolean;
}

/**
 * Save state do jogo
 */
export interface GameSaveState {
  gameState: GameState;
  timestamp: number;
  version: string;
}

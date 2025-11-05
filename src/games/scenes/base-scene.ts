/**
 * Scene Base - Classe base para todas as cenas do jogo
 */

import { Application, Container, Ticker } from 'pixi.js';
import { GameState, GameEvent, GameEventListener } from '../types/game-types';

/**
 * Classe abstrata base para cenas do jogo
 */
export abstract class BaseScene extends Container {
  protected app: Application;
  protected gameState: GameState;
  protected eventListeners: Map<string, GameEventListener[]> = new Map();
  protected isInitialized: boolean = false;

  constructor(app: Application) {
    super();
    this.app = app;
    this.gameState = {
      isPaused: false,
      isGameOver: false,
      score: 0,
      level: 1,
      lives: 3,
    };
  }

  /**
   * Inicializar a cena
   */
  abstract init(): Promise<void>;

  /**
   * Atualizar a cena (chamado no game loop)
   */
  abstract update(deltaTime: number): void;

  /**
   * Limpar recursos da cena
   */
  abstract cleanup(): void;

  /**
   * Pausar a cena
   */
  pause(): void {
    this.gameState.isPaused = true;
    Ticker.shared.stop();
  }

  /**
   * Retomar a cena
   */
  resume(): void {
    this.gameState.isPaused = false;
    Ticker.shared.start();
  }

  /**
   * Registrar listener de eventos
   */
  on(event: GameEvent['type'], listener: GameEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remover listener de eventos
   */
  off(event: GameEvent['type'], listener: GameEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   */
  protected emit(event: GameEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Atualizar estado do jogo
   */
  protected updateGameState(updates: Partial<GameState>): void {
    this.gameState = { ...this.gameState, ...updates };
  }

  /**
   * Obter estado atual do jogo
   */
  getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Limpar recursos quando a cena é destruída
   */
  destroy(options?: any): void {
    this.cleanup();
    this.eventListeners.clear();
    super.destroy(options);
  }
}

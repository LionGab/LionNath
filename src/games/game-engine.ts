/**
 * Game Engine - Inicialização e gerenciamento do jogo
 */

import { Application, RendererType, Ticker } from 'pixi.js';
import { BaseScene } from './scenes/base-scene';
import { AssetManager } from './assets/asset-manager';
import { RENDER_CONFIG } from './constants/game-config';

/**
 * Configuração de inicialização do jogo
 */
export interface GameInitConfig {
  width?: number;
  height?: number;
  canvas?: HTMLCanvasElement;
  backgroundColor?: number;
  antialias?: boolean;
  useWebGPU?: boolean;
  legacy?: boolean;
}

/**
 * Classe principal do motor do jogo
 */
export class GameEngine {
  private app: Application | null = null;
  private currentScene: BaseScene | null = null;
  private isInitialized: boolean = false;

  /**
   * Inicializar o motor do jogo
   */
  async init(config: GameInitConfig = {}): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Game Engine já foi inicializado');
    }

    const {
      width = RENDER_CONFIG.DEFAULT_WIDTH,
      height = RENDER_CONFIG.DEFAULT_HEIGHT,
      canvas,
      backgroundColor = 0x1099bb,
      antialias = true,
      useWebGPU = true,
      legacy = false,
    } = config;

    // Criar aplicação Pixi.js
    this.app = new Application();

    await this.app.init({
      width,
      height,
      canvas,
      backgroundColor,
      antialias,
      preference: useWebGPU ? RendererType.WEBGPU : RendererType.WEBGL,
      fallback: RendererType.WEBGL,
      legacy,
    });

    // Configurar Ticker
    Ticker.shared.maxFPS = RENDER_CONFIG.TARGET_FPS;

    // Inicializar Asset Manager
    const assetManager = AssetManager.getInstance();
    await assetManager.init();

    // Configurar responsividade
    this.setupResponsive();

    // Configurar otimizações de bateria
    this.setupBatteryOptimization();

    // Configurar pausa quando não visível
    this.setupVisibilityPause();

    this.isInitialized = true;
  }

  /**
   * Configurar responsividade
   */
  private setupResponsive(): void {
    if (!this.app || typeof window === 'undefined') {
      return;
    }

    const resize = (): void => {
      if (!this.app) return;

      const { innerWidth, innerHeight } = window;
      const aspectRatio = RENDER_CONFIG.DEFAULT_WIDTH / RENDER_CONFIG.DEFAULT_HEIGHT;

      let width = innerWidth;
      let height = innerHeight;

      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }

      this.app.renderer.resize(width, height);
    };

    window.addEventListener('resize', resize);
    resize();
  }

  /**
   * Configurar otimizações de bateria
   */
  private setupBatteryOptimization(): void {
    if (typeof window === 'undefined' || !('getBattery' in navigator)) {
      return;
    }

    try {
      (navigator as any).getBattery().then((battery: any) => {
        const updateFPS = (): void => {
          if (battery.level < 0.2) {
            Ticker.shared.maxFPS = RENDER_CONFIG.LOW_BATTERY_FPS;
          } else {
            Ticker.shared.maxFPS = RENDER_CONFIG.TARGET_FPS;
          }
        };

        battery.addEventListener('levelchange', updateFPS);
        updateFPS();
      });
    } catch (error) {
      // Ignorar se não suportado
    }
  }

  /**
   * Configurar pausa quando não visível
   */
  private setupVisibilityPause(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Ticker.shared.stop();
        this.currentScene?.pause();
      } else {
        Ticker.shared.start();
        this.currentScene?.resume();
      }
    });
  }

  /**
   * Definir cena atual
   */
  async setScene(scene: BaseScene): Promise<void> {
    if (!this.app) {
      throw new Error('Game Engine não foi inicializado');
    }

    // Limpar cena anterior
    if (this.currentScene) {
      this.currentScene.destroy();
      this.app.stage.removeChild(this.currentScene);
    }

    // Adicionar nova cena
    this.currentScene = scene;
    this.app.stage.addChild(scene);

    // Inicializar cena
    await scene.init();

    // Configurar game loop
    Ticker.shared.removeAll();
    Ticker.shared.add((ticker) => {
      const deltaTime = ticker.deltaTime;
      scene.update(deltaTime);
    });
  }

  /**
   * Obter aplicação Pixi.js
   */
  getApplication(): Application {
    if (!this.app) {
      throw new Error('Game Engine não foi inicializado');
    }
    return this.app;
  }

  /**
   * Obter canvas HTML
   */
  getCanvas(): HTMLCanvasElement {
    if (!this.app) {
      throw new Error('Game Engine não foi inicializado');
    }
    return this.app.canvas;
  }

  /**
   * Obter cena atual
   */
  getCurrentScene(): BaseScene | null {
    return this.currentScene;
  }

  /**
   * Verificar se está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Limpar recursos
   */
  destroy(): void {
    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }

    if (this.app) {
      this.app.destroy(true, {
        children: true,
        texture: true,
        baseTexture: true,
      });
      this.app = null;
    }

    AssetManager.getInstance().clearAll();
    Ticker.shared.removeAll();

    this.isInitialized = false;
  }
}

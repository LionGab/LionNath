/**
 * Exemplo de cena de gameplay
 */

import { Application, Sprite, Container } from 'pixi.js';
import { BaseScene } from './base-scene';
import { AssetManager } from '../assets/asset-manager';
import { RENDER_CONFIG } from '../constants/game-config';

/**
 * Cena principal de gameplay
 */
export class GameplayScene extends BaseScene {
  private player: Sprite | null = null;
  private background: Sprite | null = null;
  private gameContainer: Container;

  constructor(app: Application) {
    super(app);
    this.gameContainer = new Container();
    this.addChild(this.gameContainer);
  }

  /**
   * Inicializar a cena
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const assetManager = AssetManager.getInstance();

    // Carregar assets necessários
    await assetManager.loadMultiple([
      {
        key: 'background',
        path: 'background.json',
        type: 'spritesheet',
        required: true,
      },
      {
        key: 'player',
        path: 'player.json',
        type: 'spritesheet',
        required: true,
      },
    ]);

    // Criar background
    const bgTexture = assetManager.getTexture('background');
    if (bgTexture) {
      this.background = new Sprite(bgTexture);
      this.background.width = RENDER_CONFIG.DEFAULT_WIDTH;
      this.background.height = RENDER_CONFIG.DEFAULT_HEIGHT;
      this.gameContainer.addChild(this.background);
    }

    // Criar player
    const playerTexture = assetManager.getTexture('player');
    if (playerTexture) {
      this.player = new Sprite(playerTexture);
      this.player.anchor.set(0.5);
      this.player.position.set(
        RENDER_CONFIG.DEFAULT_WIDTH / 2,
        RENDER_CONFIG.DEFAULT_HEIGHT / 2
      );
      this.gameContainer.addChild(this.player);
    }

    // Configurar controles
    this.setupControls();

    this.isInitialized = true;
  }

  /**
   * Configurar controles de input
   */
  private setupControls(): void {
    // Touch/Click controls
    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerdown', (event: any) => {
      if (this.player && event.global) {
        // Mover player para posição do toque
        this.player.position.set(event.global.x, event.global.y);
      }
    });

    // Keyboard controls (se necessário)
    if (typeof window !== 'undefined') {
      this.handleKeyDownBound = this.handleKeyDown.bind(this);
      window.addEventListener('keydown', this.handleKeyDownBound);
    }
  }

  private handleKeyDownBound?: (event: KeyboardEvent) => void;

  /**
   * Processar tecla pressionada
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key;
    if (!this.player) return;

    const speed = 5;
    const { x, y } = this.player.position;

    switch (key) {
      case 'ArrowUp':
        this.player.position.set(x, y - speed);
        break;
      case 'ArrowDown':
        this.player.position.set(x, y + speed);
        break;
      case 'ArrowLeft':
        this.player.position.set(x - speed, y);
        break;
      case 'ArrowRight':
        this.player.position.set(x + speed, y);
        break;
    }
  }

  /**
   * Atualizar cena (game loop)
   */
  update(deltaTime: number): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) {
      return;
    }

    // Atualizar lógica do jogo aqui
    // Exemplo: mover entidades, verificar colisões, etc.
  }

  /**
   * Limpar recursos
   */
  cleanup(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    if (this.background) {
      this.background.destroy();
      this.background = null;
    }

    if (typeof window !== 'undefined' && this.handleKeyDownBound) {
      window.removeEventListener('keydown', this.handleKeyDownBound);
    }
  }
}

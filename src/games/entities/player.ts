/**
 * Exemplo de entidade Player
 */

import { Sprite, Container } from 'pixi.js';
import { EntityConfig, Position } from '../types/game-types';
import { AssetManager } from '../assets/asset-manager';

/**
 * Classe Player - Entidade controlável pelo jogador
 */
export class Player extends Container {
  private sprite: Sprite | null = null;
  private health: number = 100;
  private speed: number = 5;
  private velocity: Position = { x: 0, y: 0 };

  constructor(config: EntityConfig) {
    super();
    this.position.set(config.position.x, config.position.y);
    this.rotation = config.rotation ?? 0;
    this.scale.set(config.scale ?? 1);
    this.visible = config.visible ?? true;
  }

  /**
   * Inicializar o player (carregar sprite)
   */
  async init(): Promise<void> {
    const assetManager = AssetManager.getInstance();
    const texture = assetManager.getTexture('player');

    if (texture) {
      this.sprite = new Sprite(texture);
      this.sprite.anchor.set(0.5);
      this.addChild(this.sprite);
    } else {
      console.warn('Textura do player não encontrada');
    }
  }

  /**
   * Mover o player para uma posição específica
   */
  moveTo(position: Position): void {
    this.position.set(position.x, position.y);
  }

  /**
   * Mover o player na direção especificada
   */
  move(direction: Position): void {
    this.velocity.x = direction.x * this.speed;
    this.velocity.y = direction.y * this.speed;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  /**
   * Aplicar dano ao player
   */
  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  /**
   * Recuperar vida
   */
  heal(amount: number): void {
    this.health = Math.min(100, this.health + amount);
  }

  /**
   * Verificar se o player está vivo
   */
  isAlive(): boolean {
    return this.health > 0;
  }

  /**
   * Obter vida atual
   */
  getHealth(): number {
    return this.health;
  }

  /**
   * Definir velocidade
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * Obter velocidade atual
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Limpar recursos
   */
  destroy(options?: any): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    super.destroy(options);
  }
}

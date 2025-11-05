/**
 * Asset Manager - Gerenciamento centralizado de assets
 */

import { Assets, AssetInitOptions, Texture, SpriteSheet } from 'pixi.js';
import { AssetConfig } from '../types/game-types';
import { ASSET_CONFIG } from '../constants/game-config';

/**
 * Classe singleton para gerenciar assets do jogo
 */
export class AssetManager {
  private static instance: AssetManager;
  private loadedAssets: Map<string, any> = new Map();
  private isLoading: boolean = false;
  private loadProgress: number = 0;

  /**
   * Obter instância única do AssetManager
   */
  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Inicializar o sistema de assets
   */
  async init(options?: AssetInitOptions): Promise<void> {
    if (this.isLoading) {
      throw new Error('Assets já estão sendo carregados');
    }

    this.isLoading = true;
    this.loadProgress = 0;

    try {
      await Assets.init(options);
    } catch (error) {
      this.isLoading = false;
      throw new Error(`Erro ao inicializar assets: ${error}`);
    }

    this.isLoading = false;
  }

  /**
   * Carregar um asset individual
   */
  async loadAsset(config: AssetConfig): Promise<any> {
    const cacheKey = `${config.type}:${config.key}`;

    // Verificar se já está carregado
    if (this.loadedAssets.has(cacheKey)) {
      return this.loadedAssets.get(cacheKey);
    }

    try {
      const fullPath = `${ASSET_CONFIG.BASE_PATH}${config.path}`;
      const asset = await Assets.load(fullPath);

      this.loadedAssets.set(cacheKey, asset);
      return asset;
    } catch (error) {
      if (config.required !== false) {
        throw new Error(`Erro ao carregar asset obrigatório ${config.key}: ${error}`);
      }
      console.warn(`Asset opcional ${config.key} não pôde ser carregado:`, error);
      return null;
    }
  }

  /**
   * Carregar múltiplos assets
   */
  async loadMultiple(
    configs: AssetConfig[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const total = configs.length;
    let loaded = 0;

    const promises = configs.map(async (config) => {
      try {
        await this.loadAsset(config);
        loaded++;
        const progress = loaded / total;
        onProgress?.(progress);
      } catch (error) {
        if (config.required !== false) {
          throw error;
        }
        loaded++;
        onProgress?.(loaded / total);
      }
    });

    await Promise.all(promises);
    this.loadProgress = 1.0;
  }

  /**
   * Carregar assets progressivamente (críticos primeiro)
   */
  async loadProgressively(
    criticalAssets: AssetConfig[],
    optionalAssets: AssetConfig[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    // Carregar assets críticos primeiro
    await this.loadMultiple(criticalAssets, (progress) => {
      onProgress?.(progress * 0.5); // Primeira metade do progresso
    });

    // Carregar assets opcionais depois (não bloqueia)
    this.loadMultiple(optionalAssets, (progress) => {
      onProgress?.(0.5 + progress * 0.5); // Segunda metade do progresso
    }).catch((error) => {
      console.warn('Erro ao carregar assets opcionais:', error);
    });
  }

  /**
   * Obter asset carregado
   */
  getAsset(key: string, type: AssetConfig['type'] = 'texture'): any {
    const cacheKey = `${type}:${key}`;
    return this.loadedAssets.get(cacheKey);
  }

  /**
   * Obter textura
   */
  getTexture(key: string): Texture | null {
    const asset = this.getAsset(key, 'texture');
    return asset instanceof Texture ? asset : null;
  }

  /**
   * Obter spritesheet
   */
  getSpritesheet(key: string): SpriteSheet | null {
    const asset = this.getAsset(key, 'spritesheet');
    return asset instanceof SpriteSheet ? asset : null;
  }

  /**
   * Verificar se asset está carregado
   */
  hasAsset(key: string, type: AssetConfig['type'] = 'texture'): boolean {
    const cacheKey = `${type}:${key}`;
    return this.loadedAssets.has(cacheKey);
  }

  /**
   * Liberar asset da memória
   */
  releaseAsset(key: string, type: AssetConfig['type'] = 'texture'): void {
    const cacheKey = `${type}:${key}`;
    const asset = this.loadedAssets.get(cacheKey);

    if (asset) {
      if (asset instanceof Texture) {
        asset.destroy();
      } else if (asset instanceof SpriteSheet) {
        asset.destroy();
      } else if (asset?.destroy) {
        asset.destroy();
      }

      Assets.unload(cacheKey);
      this.loadedAssets.delete(cacheKey);
    }
  }

  /**
   * Limpar todos os assets
   */
  clearAll(): void {
    this.loadedAssets.forEach((asset, key) => {
      if (asset instanceof Texture) {
        asset.destroy();
      } else if (asset instanceof SpriteSheet) {
        asset.destroy();
      } else if (asset?.destroy) {
        asset.destroy();
      }
    });

    this.loadedAssets.clear();
    Assets.reset();
  }

  /**
   * Obter progresso de carregamento
   */
  getProgress(): number {
    return this.loadProgress;
  }

  /**
   * Verificar se está carregando
   */
  isLoadingAssets(): boolean {
    return this.isLoading;
  }
}

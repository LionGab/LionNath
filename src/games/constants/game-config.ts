/**
 * Constantes de configuração do jogo
 */

/**
 * Configuração de renderização
 * Adaptado para mobile e web
 */
import { Dimensions } from 'react-native';

/**
 * Obter dimensões da tela (dinâmico para React Native)
 */
const getScreenDimensions = () => {
  if (typeof window !== 'undefined') {
    // Web
    return {
      width: window.innerWidth || 800,
      height: window.innerHeight || 600,
    };
  }
  // React Native
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

const screenDims = getScreenDimensions();

export const RENDER_CONFIG = {
  /** Largura padrão da tela */
  DEFAULT_WIDTH: screenDims.width,
  /** Altura padrão da tela */
  DEFAULT_HEIGHT: screenDims.height,
  /** FPS alvo */
  TARGET_FPS: 60,
  /** FPS mínimo aceitável */
  MIN_FPS: 30,
  /** FPS quando bateria baixa */
  LOW_BATTERY_FPS: 30,
  /** Aspect ratio padrão */
  ASPECT_RATIO: 16 / 9,
} as const;

/**
 * Configuração de física
 */
export const PHYSICS_CONFIG = {
  /** Gravidade padrão */
  GRAVITY: 9.8,
  /** Velocidade máxima */
  MAX_VELOCITY: 1000,
  /** Fricção padrão */
  FRICTION: 0.98,
  /** Bounce padrão */
  BOUNCE: 0.5,
} as const;

/**
 * Configuração de colisão
 */
export const COLLISION_CONFIG = {
  /** Quad tree cell size */
  QUADTREE_CELL_SIZE: 64,
  /** Max objects per quad tree cell */
  MAX_OBJECTS_PER_CELL: 10,
  /** Collision layers */
  LAYERS: {
    PLAYER: 1,
    ENEMY: 2,
    ITEM: 4,
    WALL: 8,
    TRIGGER: 16,
  } as const,
} as const;

/**
 * Configuração de performance
 */
export const PERFORMANCE_CONFIG = {
  /** Máximo de objetos em pool */
  MAX_POOL_SIZE: 100,
  /** Tamanho máximo de textura atlas */
  MAX_TEXTURE_SIZE: 2048,
  /** Distância de culling */
  CULLING_DISTANCE: 100,
  /** Intervalo de cleanup (ms) */
  CLEANUP_INTERVAL: 5000,
} as const;

/**
 * Configuração de assets
 */
export const ASSET_CONFIG = {
  /** Qualidades disponíveis */
  QUALITIES: ['low', 'medium', 'high'] as const,
  /** Path base de assets */
  BASE_PATH: '/assets/games/',
  /** Extensão padrão de spritesheets */
  SPRITESHEET_EXT: '.json',
} as const;

/**
 * Configuração de input
 */
export const INPUT_CONFIG = {
  /** Tamanho mínimo da área de toque (px) */
  MIN_TOUCH_AREA: 44,
  /** Threshold para detectar swipe (px) */
  SWIPE_THRESHOLD: 50,
  /** Delay para double tap (ms) */
  DOUBLE_TAP_DELAY: 300,
} as const;

/**
 * Configuração de salvamento
 */
export const SAVE_CONFIG = {
  /** Chave de storage */
  STORAGE_KEY: 'game_save_state',
  /** Versão do save state */
  SAVE_VERSION: '1.0.0',
  /** Auto-save interval (ms) */
  AUTO_SAVE_INTERVAL: 30000,
} as const;

/**
 * Configuração de scoring
 */
export const SCORING_CONFIG = {
  /** Pontos base por ação */
  BASE_POINTS: 10,
  /** Multiplicador máximo */
  MAX_MULTIPLIER: 10,
  /** Tempo para perder combo (ms) */
  COMBO_TIMEOUT: 5000,
} as const;

/**
 * Limites do jogo
 */
export const GAME_LIMITS = {
  /** Máximo de jogadores */
  MAX_PLAYERS: 4,
  /** Máximo de entidades simultâneas */
  MAX_ENTITIES: 1000,
  /** Máximo de partículas */
  MAX_PARTICLES: 5000,
  /** Score máximo */
  MAX_SCORE: 9999999,
} as const;

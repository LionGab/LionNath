/**
 * Constantes globais da aplicação
 * Extrai magic numbers e valores hardcoded para facilitar manutenção
 */

// ==================== API CONSTANTS ====================

/** Timeout padrão para requisições de API (ms) */
export const API_TIMEOUT = 30000;

/** Número máximo de tentativas de retry */
export const MAX_RETRY_ATTEMPTS = 3;

/** Delay entre tentativas de retry (ms) */
export const RETRY_DELAY = 1000;

// ==================== CHAT CONSTANTS ====================

/** Número máximo de mensagens carregadas por vez */
export const CHAT_MESSAGE_LIMIT = 50;

/** Tamanho máximo de mensagem de chat (caracteres) */
export const MAX_CHAT_MESSAGE_LENGTH = 500;

/** Tamanho mínimo de mensagem de chat (caracteres) */
export const MIN_CHAT_MESSAGE_LENGTH = 1;

/** Número máximo de interações diárias permitidas */
export const MAX_DAILY_INTERACTIONS = 30;

// ==================== DAILY PLAN CONSTANTS ====================

/** Número de prioridades no plano diário */
export const DAILY_PLAN_PRIORITIES_COUNT = 3;

// ==================== USER CONSTANTS ====================

/** Tamanho mínimo de nome */
export const MIN_NAME_LENGTH = 2;

/** Tamanho máximo de nome */
export const MAX_NAME_LENGTH = 100;

/** Semana mínima de gravidez */
export const MIN_PREGNANCY_WEEK = 1;

/** Semana máxima de gravidez */
export const MAX_PREGNANCY_WEEK = 42;

// ==================== UI CONSTANTS ====================

/** Área de toque mínima para acessibilidade (px) */
export const MIN_TOUCHABLE_SIZE = 44;

/** Altura padrão de input */
export const INPUT_HEIGHT = 52;

/** Border radius padrão */
export const DEFAULT_BORDER_RADIUS = 8;

/** Sombra padrão */
export const DEFAULT_SHADOW_OPACITY = 0.1;

// ==================== STORAGE CONSTANTS ====================

/** Chaves de AsyncStorage */
export const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_PROFILE: 'userProfile',
  ONBOARDED: 'onboarded',
  THEME_PREFERENCE: 'themePreference',
  CRITICAL_LOGS: 'critical_logs',
} as const;

// ==================== EMERGENCY CONSTANTS ====================

/** Telefone SAMU */
export const SAMU_PHONE = '192';

/** Telefone CVV (Centro de Valorização da Vida) */
export const CVV_PHONE = '188';

// ==================== VALIDATION CONSTANTS ====================

/** Regex para validação de email */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Regex para validação de data (YYYY-MM-DD) */
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ==================== ANIMATION CONSTANTS ====================

/** Duração padrão de animação (ms) */
export const DEFAULT_ANIMATION_DURATION = 300;

/** Duração de animação rápida (ms) */
export const FAST_ANIMATION_DURATION = 150;

/** Duração de animação lenta (ms) */
export const SLOW_ANIMATION_DURATION = 500;

// ==================== PAGINATION CONSTANTS ====================

/** Tamanho padrão de página */
export const DEFAULT_PAGE_SIZE = 20;

/** Número máximo de itens por página */
export const MAX_PAGE_SIZE = 100;

// ==================== PERFORMANCE CONSTANTS ====================

/** Tamanho de janela para FlatList */
export const FLATLIST_WINDOW_SIZE = 10;

/** Número máximo de itens renderizados por batch */
export const FLATLIST_MAX_TO_RENDER = 10;

/** Número inicial de itens a renderizar */
export const FLATLIST_INITIAL_NUM_TO_RENDER = 10;

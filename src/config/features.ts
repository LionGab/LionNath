/**
 * Feature Flags - Sistema de feature flags para controle de funcionalidades
 */

export const FEATURE_FLAGS = {
  /** Habilita funcionalidades de IA */
  ENABLE_AI_FEATURES: process.env.EXPO_PUBLIC_ENABLE_AI_FEATURES === 'true',
  
  /** Habilita gamificação */
  ENABLE_GAMIFICATION: process.env.EXPO_PUBLIC_ENABLE_GAMIFICATION === 'true',
  
  /** Habilita analytics */
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const;

/**
 * Verifica se uma feature flag está habilitada
 */
export const isFeatureEnabled = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[flag];
};

/**
 * Environment Variables Validation - React Native/Expo
 * Valida e exporta variáveis de ambiente com tipos seguros usando expo-constants
 */

import Constants from 'expo-constants';
import { logger } from './logger';

// Tipo para o ambiente validado
export type EnvConfig = {
  supabase: {
    url: string;
    anonKey: string;
  };
  sentry: {
    dsn?: string;
  };
  app: {
    isDev: boolean;
  };
  features: {
    aiEnabled: boolean;
    gamificationEnabled: boolean;
    analyticsEnabled: boolean;
  };
};

// Helper para obter env var do Expo
function getEnvVar(key: string): string | undefined {
  return Constants.expoConfig?.extra?.[key] || process.env[key];
}

// Variáveis obrigatórias (Expo usa EXPO_PUBLIC_ prefix)
const REQUIRED_ENV_VARS = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'] as const;

// Variáveis opcionais (para funcionalidades específicas)
const OPTIONAL_ENV_VARS = [
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_ENABLE_AI_FEATURES',
  'EXPO_PUBLIC_ENABLE_GAMIFICATION',
  'EXPO_PUBLIC_ENABLE_ANALYTICS',
] as const;

/**
 * Valida se todas as variáveis obrigatórias estão presentes
 */
function validateRequiredEnvVars(): string[] {
  const missing: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!getEnvVar(varName)) {
      missing.push(varName);
    }
  }

  return missing;
}

/**
 * Verifica quais variáveis opcionais estão faltando
 */
function checkOptionalEnvVars(): string[] {
  const missing: string[] = [];

  for (const varName of OPTIONAL_ENV_VARS) {
    if (!getEnvVar(varName)) {
      missing.push(varName);
    }
  }

  return missing;
}

/**
 * Obtém a configuração do ambiente com validação
 */
export function getEnvConfig(): EnvConfig {
  const missingRequired = validateRequiredEnvVars();

  if (missingRequired.length > 0) {
    const errorMessage = `CRÍTICO: Variáveis de ambiente obrigatórias faltando: ${missingRequired.join(', ')}`;
    logger.error(errorMessage, undefined, {
      missing: missingRequired,
    });

    // Em produção, lançar erro para evitar que app quebre silenciosamente
    if (!__DEV__) {
      throw new Error(errorMessage);
    }

    logger.warn('Some features may not work correctly');
  }

  const missingOptional = checkOptionalEnvVars();
  if (missingOptional.length > 0 && __DEV__) {
    logger.info('Optional environment variables not configured', {
      missing: missingOptional,
    });
  }

  return {
    supabase: {
      url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL') || '',
      anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') || '',
    },
    sentry: {
      dsn: getEnvVar('EXPO_PUBLIC_SENTRY_DSN'),
    },
    app: {
      isDev: __DEV__,
    },
    features: {
      aiEnabled: getEnvVar('EXPO_PUBLIC_ENABLE_AI_FEATURES') !== 'false',
      gamificationEnabled: getEnvVar('EXPO_PUBLIC_ENABLE_GAMIFICATION') !== 'false',
      analyticsEnabled: getEnvVar('EXPO_PUBLIC_ENABLE_ANALYTICS') === 'true',
    },
  };
}

/**
 * Verifica se o ambiente está configurado para produção
 */
export function isProduction(): boolean {
  return !__DEV__;
}

/**
 * Verifica se o ambiente está configurado para desenvolvimento
 */
export function isDevelopment(): boolean {
  return __DEV__;
}

// Exporta a configuração carregada
export const env = getEnvConfig();

// Log de inicialização apenas em desenvolvimento
if (isDevelopment()) {
  logger.info('Environment configuration loaded (React Native)', {
    supabase: env.supabase.url ? 'configured' : 'missing',
    sentry: env.sentry.dsn ? 'configured' : 'missing',
    features: {
      ai: env.features.aiEnabled,
      gamification: env.features.gamificationEnabled,
      analytics: env.features.analyticsEnabled,
    },
  });
}

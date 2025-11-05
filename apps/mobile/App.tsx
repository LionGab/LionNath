/**
 * App principal da Nossa Maternidade
 *
 * Configuração inicial e navegação da aplicação
 * Com suporte completo a Dark Mode e otimizações de performance
 */

import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/index';
import { ConfigErrorScreen } from './src/components/ConfigErrorScreen';
import { initSentry } from './src/services/sentry';
import { validateRequiredKeys, SUPABASE_CONFIG, API_CONFIG } from './src/config/api';
import { logger } from './src/utils/logger';

export default function App() {
  const [configValid, setConfigValid] = useState<boolean | null>(null);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  useEffect(() => {
    // Validar configuração antes de inicializar app
    checkConfig();

    // Inicializar Sentry em produção
    if (process.env.NODE_ENV === 'production') {
      initSentry();
    }
  }, []);

  const checkConfig = () => {
    const requiredKeys: Array<{ key: string; value: string | undefined }> = [
      { key: 'EXPO_PUBLIC_SUPABASE_URL', value: SUPABASE_CONFIG.URL },
      { key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY', value: SUPABASE_CONFIG.ANON_KEY },
      { key: 'EXPO_PUBLIC_GEMINI_API_KEY', value: API_CONFIG.GEMINI_API_KEY },
    ];

    const missing = requiredKeys
      .filter(({ value }) => !value || value.trim() === '')
      .map(({ key }) => key);

    if (missing.length > 0) {
      logger.warn('Variáveis de ambiente faltando', { missing });
      setMissingKeys(missing);
      setConfigValid(false);
    } else {
      // Validar usando função helper também
      const isValid = validateRequiredKeys();
      if (!isValid) {
        const allMissing = [
          ...(SUPABASE_CONFIG.URL ? [] : ['EXPO_PUBLIC_SUPABASE_URL']),
          ...(SUPABASE_CONFIG.ANON_KEY ? [] : ['EXPO_PUBLIC_SUPABASE_ANON_KEY']),
        ];
        setMissingKeys(allMissing);
        setConfigValid(false);
      } else {
        setConfigValid(true);
      }
    }
  };

  const handleRetry = () => {
    checkConfig();
  };

  // Mostrar loading enquanto verifica configuração
  if (configValid === null) {
    return null; // Loading inicial
  }

  // Mostrar tela de erro se configuração inválida
  if (!configValid) {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          logger.error('Erro capturado pelo ErrorBoundary', { error, errorInfo });
        }}
      >
        <ThemeProvider>
          <ConfigErrorScreen missingKeys={missingKeys} onRetry={handleRetry} />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // App normal
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Erro capturado pelo ErrorBoundary', { error, errorInfo });
        // Sentry capturará automaticamente se inicializado
      }}
    >
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </ErrorBoundary>
  );
}


/**
 * App principal da Nossa Maternidade
 *
 * Configuração inicial e navegação da aplicação
 * Com suporte completo a Dark Mode e otimizações de performance
 *
 * Performance Improvements:
 * - Lazy loading de componentes não críticos
 * - Memoização de providers para evitar re-renders
 * - Error boundaries para isolamento de falhas
 * - Sentry apenas em produção
 */

import React, { useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppNavigator } from '@/navigation/index';
import { initSentry } from '@/services/sentry';
import { DemoDataProvider } from '@/lib/mocks/DemoDataProvider';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

export default function App() {
  useEffect(() => {
    // Performance: Inicializar Sentry apenas em produção
    if (process.env.NODE_ENV === 'production') {
      initSentry();
    }
  }, []);

  // Performance: Memoize error handler para evitar recriação em cada render
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    // Sentry capturará automaticamente se inicializado
  }, []);

  const appContent = (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );

  return (
    <ErrorBoundary onError={handleError}>
      {USE_MOCKS ? <DemoDataProvider>{appContent}</DemoDataProvider> : appContent}
    </ErrorBoundary>
  );
}

/**
 * Configuração de navegação da Nossa Maternidade
 *
 * AppNavigator - Navegador principal da aplicação
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loading } from '@/shared/components/Loading';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { linking } from './linking';

// Lazy load screens para melhor performance
const SignInScreen = lazy(() => import('@/screens/SignInScreen').then((m) => ({ default: m.SignInScreen })));
const OnboardingQuestionsWrapper = lazy(() =>
  import('@/screens/Onboarding/OnboardingQuestionsWrapper').then((m) => ({ default: m.OnboardingQuestionsWrapper }))
);
const ReviewAnswersScreen = lazy(() =>
  import('@/screens/Onboarding/ReviewAnswersScreen').then((m) => ({ default: m.ReviewAnswersScreen }))
);
const DailyPlanScreen = lazy(() => import('@/screens/DailyPlanScreen').then((m) => ({ default: m.default })));
const ContentDetailScreen = lazy(() =>
  import('@/features/content/ContentDetailScreen').then((m) => ({ default: m.default }))
);
const ComponentValidationScreen = lazy(() =>
  import('@/screens/ComponentValidationScreen').then((m) => ({ default: m.default }))
);

// Wrapper com Suspense para lazy loaded screens
const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  const SuspenseWrapper = (props: P) => (
    <Suspense fallback={<Loading message="Carregando..." />}>
      <Component {...props} />
    </Suspense>
  );
  SuspenseWrapper.displayName = `withSuspense(${Component.displayName || Component.name || 'Component'})`;
  return SuspenseWrapper;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isDark, colors } = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Re-verificar onboarding quando autenticação mudar
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated, authLoading]);

  const checkOnboardingStatus = async () => {
    try {
      // Verificar tanto AsyncStorage quanto providers
      const onboarded = await AsyncStorage.getItem('onboarded');

      // Tentar verificar via providers (mock ou supabase)
      try {
        const { mockProvider } = await import('@/services/onboarding/mockProvider');
        const useMocks = mockProvider.isEnabled();

        if (useMocks) {
          const hasCompleted = await mockProvider.hasCompleted();
          setIsOnboarded(onboarded === 'true' || hasCompleted);
        } else {
          // Tentar usar Supabase apenas se não estiver em modo mock
          try {
            const { supabaseProvider } = await import('@/services/onboarding/supabaseProvider');
            const hasCompleted = await supabaseProvider.hasCompleted();
            setIsOnboarded(onboarded === 'true' || hasCompleted);
          } catch (supabaseError) {
            // Se Supabase não estiver configurado, usar apenas AsyncStorage
            console.warn('Supabase não disponível, usando apenas AsyncStorage:', supabaseError);
            setIsOnboarded(onboarded === 'true');
          }
        }
      } catch (providerError) {
        // Se houver erro ao importar providers, usar apenas AsyncStorage
        console.warn('Erro ao carregar providers, usando apenas AsyncStorage:', providerError);
        setIsOnboarded(onboarded === 'true');
      }
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
      // Em caso de erro, verificar apenas AsyncStorage
      try {
        const onboarded = await AsyncStorage.getItem('onboarded');
        setIsOnboarded(onboarded === 'true');
      } catch {
        setIsOnboarded(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading enquanto verifica auth e onboarding
  if (authLoading || loading) {
    return (
      <SafeAreaProvider>
        <Loading message="Carregando..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            // Usuário não autenticado → Tela de Login
            <Stack.Screen name="SignIn" component={withSuspense(SignInScreen)} />
          ) : !isOnboarded ? (
            // Usuário autenticado mas sem onboarding → Onboarding
            <>
              <Stack.Screen
                name="Onboarding"
                component={withSuspense(OnboardingQuestionsWrapper)}
                listeners={{
                  focus: () => {
                    // Callback será gerenciado via navigation listener
                  },
                }}
              />
              <Stack.Screen
                name="ReviewAnswers"
                component={withSuspense(ReviewAnswersScreen)}
                options={{
                  headerShown: true,
                  title: 'Revisar Respostas',
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.foreground,
                }}
              />
            </>
          ) : (
            // Usuário autenticado e com onboarding → App principal
            <>
              <Stack.Screen name="Home" component={TabNavigator} />
              <Stack.Screen
                name="DailyPlan"
                component={withSuspense(DailyPlanScreen)}
                options={{
                  headerShown: true,
                  title: 'Plano Diário',
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.foreground,
                }}
              />
              <Stack.Screen
                name="ContentDetail"
                component={withSuspense(ContentDetailScreen)}
                options={{
                  headerShown: true,
                  title: 'Conteúdo',
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.foreground,
                }}
              />
              <Stack.Screen
                name="ComponentValidation"
                component={withSuspense(ComponentValidationScreen)}
                options={{
                  headerShown: true,
                  title: 'Validação de Componentes',
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.foreground,
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

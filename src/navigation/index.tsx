/**
 * Configuração de navegação da Nossa Maternidade
 *
 * AppNavigator - Navegador principal da aplicação
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loading } from '../shared/components/Loading';

import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import DailyPlanScreen from '../screens/DailyPlanScreen';
import ContentDetailScreen from '../features/content/ContentDetailScreen';
import { colors } from '../theme/colors';
import { linking } from './linking';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('onboarded');
      setIsOnboarded(onboarded === 'true');
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <Loading message="Carregando..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isOnboarded ? (
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen as any}
              initialParams={{ onComplete: () => setIsOnboarded(true) }}
            />
          ) : (
            <>
              <Stack.Screen name="Home" component={TabNavigator} />
              <Stack.Screen
                name="DailyPlan"
                component={DailyPlanScreen}
                options={{
                  headerShown: true,
                  title: 'Plano Diário',
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.foreground,
                }}
              />
              <Stack.Screen
                name="ContentDetail"
                component={ContentDetailScreen}
                options={{
                  headerShown: true,
                  title: 'Conteúdo',
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

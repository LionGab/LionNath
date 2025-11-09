/**
 * Bottom Tab Navigator da Nossa Maternidade
 *
 * Navegação principal do app com 5 tabs
 * Otimizado com lazy loading
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { lazy, Suspense } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Loading } from '@/shared/components/Loading';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

import { TabParamList } from './types';

// Lazy load screens para melhor performance
const HomeScreen = lazy(() => import('@/screens/HomeScreen').then((m) => ({ default: m.default })));
const NathIAScreen = lazy(() => import('@/screens/ChatScreen').then((m) => ({ default: m.default })));
const CirculosScreen = lazy(() => import('@/screens/CirculosScreen').then((m) => ({ default: m.default })));
const MundoNathScreen = lazy(() => import('@/screens/MundoNathScreen').then((m) => ({ default: m.default })));
const EuScreen = lazy(() => import('@/screens/ProfileScreen').then((m) => ({ default: m.default })));

// Wrapper com Suspense para lazy loaded screens
const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <Suspense fallback={<Loading message="Carregando..." />}>
      <Component {...props} />
    </Suspense>
  );
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const { palette, spacing } = nossaMaternidadeDesignTokens;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.neutrals[600],
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.neutrals[300],
          borderTopWidth: 1,
          height: 60,
          paddingBottom: spacing.sm,
          paddingTop: spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginTop: spacing.xs,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={withSuspense(HomeScreen)}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Página inicial',
        }}
      />
      <Tab.Screen
        name="NathIA"
        component={withSuspense(NathIAScreen)}
        options={{
          tabBarLabel: 'NathIA',
          tabBarIcon: ({ color, size }) => <Icon name="robot" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Conversar com NathIA',
        }}
      />
      <Tab.Screen
        name="Circulos"
        component={withSuspense(CirculosScreen)}
        options={{
          tabBarLabel: 'Círculos',
          tabBarIcon: ({ color, size }) => <Icon name="account-group" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Círculos de apoio',
        }}
      />
      <Tab.Screen
        name="MundoNath"
        component={withSuspense(MundoNathScreen)}
        options={{
          tabBarLabel: 'MundoNath',
          tabBarIcon: ({ color, size }) => <Icon name="book-open-variant" size={size} color={color} />,
          tabBarAccessibilityLabel: 'MundoNath - Conteúdos',
        }}
      />
      <Tab.Screen
        name="Eu"
        component={withSuspense(EuScreen)}
        options={{
          tabBarLabel: 'Eu',
          tabBarIcon: ({ color, size }) => <Icon name="account-circle" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Meu perfil',
        }}
      />
    </Tab.Navigator>
  );
}

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
import { colors, spacing } from '@/theme';

import { TabParamList } from './types';

// Lazy load screens para melhor performance
const HomeScreen = lazy(() => import('@/screens/HomeScreen').then((m) => ({ default: m.default })));
const ChatScreen = lazy(() => import('@/screens/ChatScreen').then((m) => ({ default: m.default })));
const HabitsScreen = lazy(() => import('@/features/habits/HabitsScreen').then((m) => ({ default: m.default })));
const ContentFeedScreen = lazy(() =>
  import('@/features/content/ContentFeedScreen').then((m) => ({ default: m.default }))
);
const ProfileScreen = lazy(() => import('@/screens/ProfileScreen').then((m) => ({ default: m.default })));

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
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
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Página inicial',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={withSuspense(ChatScreen)}
        options={{
          tabBarLabel: 'NathIA',
          tabBarIcon: ({ color, size }) => <Icon name="robot" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Conversar com NathIA',
        }}
      />
      <Tab.Screen
        name="Habits"
        component={withSuspense(HabitsScreen)}
        options={{
          tabBarLabel: 'Hábitos',
          tabBarIcon: ({ color, size }) => <Icon name="check-circle" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Meus hábitos',
        }}
      />
      <Tab.Screen
        name="Content"
        component={withSuspense(ContentFeedScreen)}
        options={{
          tabBarLabel: 'Conteúdos',
          tabBarIcon: ({ color, size }) => <Icon name="play-circle" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Conteúdos exclusivos',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={withSuspense(ProfileScreen)}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Icon name="account-circle" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Meu perfil',
        }}
      />
    </Tab.Navigator>
  );
}

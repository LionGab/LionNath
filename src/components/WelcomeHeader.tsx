import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Logo } from './Logo';
import { colors, spacing, typography } from '@/theme';

interface WelcomeHeaderProps {
  name: string;
  pregnancyWeek?: number;
}

/**
 * WelcomeHeader Component - Sistema de Design Bubblegum
 *
 * Cabeçalho de boas-vindas personalizado com logo, nome e semana de gestação.
 * Otimizado para acessibilidade com roles semânticos.
 */
export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ name, pregnancyWeek }) => {
  return (
    <View style={styles.container}>
      <Logo size={80} />
      <Text style={styles.greeting} accessibilityRole="header" accessibilityLabel={`Olá, ${name}`}>
        Olá, {name}! 👋
      </Text>
      {pregnancyWeek && (
        <Text
          style={styles.subGreeting}
          accessibilityRole="text"
          accessibilityLabel={`Você está na semana ${pregnancyWeek} de gestação`}
        >
          Semana {pregnancyWeek} de gestação 💕
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes['2xl'], // 24px
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  subGreeting: {
    fontSize: typography.sizes.base, // 16px
    color: colors.mutedForeground,
    marginTop: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
});


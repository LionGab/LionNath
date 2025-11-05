/**
 * LoadingScreen - Componente de loading fullscreen
 * Substitui return null durante loading para melhor UX
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/colors';

interface LoadingScreenProps {
  /** Mensagem de loading (opcional) */
  message?: string;
  /** Tamanho do indicador */
  size?: 'small' | 'large';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, size = 'large' }) => {
  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Carregando" accessibilityLiveRegion="polite">
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing['2xl'],
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
    marginTop: spacing.md,
  },
});

/**
 * Loading Components - Sistema de Design Bubblegum
 *
 * Componentes de loading: Skeleton screens e Spinner
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

export interface LoadingProps {
  /** Tamanho do spinner */
  size?: 'small' | 'large';

  /** Cor do spinner */
  color?: string;

  /** Estilo customizado */
  style?: ViewStyle;

  /** Mensagem opcional */
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'large', color = colors.primary, style, message }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

export interface SkeletonProps {
  /** Largura do skeleton */
  width?: number | string;

  /** Altura do skeleton */
  height?: number;

  /** Estilo customizado */
  style?: ViewStyle;

  /** Border radius (default: 8) */
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, style, borderRadius = 8 }) => {
  const widthStyle = typeof width === 'string' ? { width: width as any } : { width };

  return <View style={[styles.skeleton, widthStyle, { height, borderRadius }, style]} accessible={false} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  message: {
    marginTop: spacing.md,
    color: colors.mutedForeground,
    fontSize: 14,
  },
  skeleton: {
    backgroundColor: colors.muted,
    opacity: 0.3,
  },
});


/**
 * GradientView Fallback - Fallback sem expo-linear-gradient
 *
 * Versão simplificada que usa View com background solid
 * quando expo-linear-gradient não está disponível
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, borderRadius } from '@/theme';
import { GradientViewProps, GradientVariant } from './GradientView';

/**
 * Cores sólidas dos gradientes (fallback)
 */
const solidColors: Record<GradientVariant, string> = {
  maternal: colors.background, // Rosa muito claro
  soft: '#FFF5F7', // Rosa pastel
  warm: '#FFE3E8', // Rosa suave
  calm: '#E0F0F5', // Azul calma claro
  sunset: '#EDD8B1', // Amarelo pastel
};

export const GradientViewFallback: React.FC<GradientViewProps> = ({
  children,
  variant = 'maternal',
  borderRadius: customBorderRadius,
  style,
  opacity = 1,
}) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: solidColors[variant], opacity },
        customBorderRadius !== undefined && { borderRadius: customBorderRadius },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});

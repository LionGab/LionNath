import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/theme';

/**
 * Badge Component - Sistema de Design Bubblegum
 *
 * Tag/Badge para indicar status, categorias ou avisos.
 * Otimizado para público C-D com cores claras e legibilidade alta.
 *
 * @example
 * <Badge variant="info">Novo</Badge>
 *
 * @example
 * <Badge variant="error" size="sm">Urgente</Badge>
 */

export type BadgeVariant = 'info' | 'warning' | 'error' | 'success';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Texto do badge */
  children: React.ReactNode;

  /** Variante visual do badge */
  variant?: BadgeVariant;

  /** Tamanho do badge */
  size?: BadgeSize;

  /** Estilo customizado */
  style?: ViewStyle;
}

const BadgeComponent: React.FC<BadgeProps> = ({ children, variant = 'info', size = 'md', style }) => {
  // Memoizar estilos
  const containerStyle = useMemo(
    () => [styles.base, styles[`${variant}Container`], styles[`${size}Container`], style],
    [variant, size, style]
  );

  const textStyle = useMemo(() => [styles.baseText, styles[`${variant}Text`], styles[`${size}Text`]], [variant, size]);

  return (
    <View
      style={containerStyle}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${variant}: ${children}`}
    >
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },

  baseText: {
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },

  // Variantes de Container
  infoContainer: {
    backgroundColor: colors.secondary, // Azul pastel
    borderColor: colors.primary,
  },

  warningContainer: {
    backgroundColor: colors.accent, // Amarelo pastel
    borderColor: colors.accent, // Usa variável do tema
    opacity: 0.9, // Leve transparência para melhor contraste
  },

  errorContainer: {
    backgroundColor: colors.muted, // Usa variável do tema
    borderColor: colors.destructive,
  },

  successContainer: {
    backgroundColor: colors.accent, // Usa accent (amarelo/verde pastel do tema)
    borderColor: colors.primary, // Usa primary para contraste
    opacity: 0.8,
  },

  // Variantes de Texto
  infoText: {
    color: colors.primary,
  },

  warningText: {
    color: colors.foreground, // Usa foreground para contraste
  },

  errorText: {
    color: colors.destructive,
  },

  successText: {
    color: colors.primary, // Usa primary para contraste
  },

  // Tamanhos de Container
  smContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  mdContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  // Tamanhos de Texto
  smText: {
    fontSize: typography.sizes.xs,
  },

  mdText: {
    fontSize: typography.sizes.sm,
  },
});

// Memoizar componente para evitar re-renders desnecessários
export const Badge = React.memo(BadgeComponent);


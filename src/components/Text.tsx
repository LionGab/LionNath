/**
 * Text Component - Componente de texto com variantes tipográficas
 *
 * Todas as variantes tipográficas do design system
 */

import { theme } from '@/constants/theme';
import { colors, typography } from '@/theme';
import React, { useMemo } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'error'
  | 'success'
  | 'warning';

export interface TextProps extends RNTextProps {
  /** Variante tipográfica */
  variant?: TextVariant;
  /** Cor customizada (override) */
  color?: string;
  /** Estilo customizado */
  style?: TextStyle;
}

const getVariantStyles = (variant: TextVariant): TextStyle => {
  switch (variant) {
    case 'h1':
      return {
        fontSize: typography.sizes['4xl'],
        fontWeight: typography.weights.bold,
        lineHeight: typography.sizes['4xl'] * 1.2,
        color: colors.foreground,
      };
    case 'h2':
      return {
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        lineHeight: typography.sizes['3xl'] * 1.2,
        color: colors.foreground,
      };
    case 'h3':
      return {
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.semibold,
        lineHeight: typography.sizes['2xl'] * 1.2,
        color: colors.foreground,
      };
    case 'bodyLarge':
      return {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.normal,
        lineHeight: typography.sizes.lg * 1.5,
        color: colors.foreground,
      };
    case 'body':
      return {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.normal,
        lineHeight: typography.sizes.base * 1.5,
        color: colors.foreground,
      };
    case 'bodySmall':
      return {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.normal,
        lineHeight: typography.sizes.sm * 1.5,
        color: colors.foreground,
      };
    case 'caption':
      return {
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.normal,
        lineHeight: typography.sizes.xs * 1.5,
        color: colors.mutedForeground,
      };
    case 'label':
      return {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        lineHeight: typography.sizes.sm * 1.5,
        color: colors.foreground,
      };
    case 'error':
      return {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        lineHeight: typography.sizes.sm * 1.5,
        color: colors.destructive,
      };
    case 'success':
      return {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        lineHeight: typography.sizes.sm * 1.5,
        color: theme.colors.success,
      };
    case 'warning':
      return {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        lineHeight: typography.sizes.sm * 1.5,
        color: theme.colors.warning,
      };
    default:
      return {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.normal,
        lineHeight: typography.sizes.base * 1.5,
        color: colors.foreground,
      };
  }
};

export const Text: React.FC<TextProps> = ({ variant = 'body', color, style, children, ...props }) => {
  // Memoizar estilos da variante
  const variantStyles = useMemo(() => getVariantStyles(variant), [variant]);

  // Memoizar estilo final
  const finalStyle = useMemo(
    () => [styles.base, variantStyles, color ? { color } : null, style].filter(Boolean) as TextStyle[],
    [variantStyles, color, style]
  );

  return (
    <RNText style={finalStyle} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.sans,
  },
});

// Exportar variantes como componentes separados para conveniência
export const H1: React.FC<Omit<TextProps, 'variant'>> = (props) => <Text variant="h1" {...props} />;

export const H2: React.FC<Omit<TextProps, 'variant'>> = (props) => <Text variant="h2" {...props} />;

export const H3: React.FC<Omit<TextProps, 'variant'>> = (props) => <Text variant="h3" {...props} />;

export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => <Text variant="body" {...props} />;

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => <Text variant="caption" {...props} />;

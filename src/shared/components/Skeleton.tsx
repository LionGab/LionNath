/**
 * Skeleton Component - Loading placeholders
 *
 * Animação shimmer sutil para manter layout estável
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme/colors';

export interface SkeletonProps {
  /** Largura do skeleton */
  width?: number | string;
  /** Altura do skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Variante: text, circle, rect */
  variant?: 'text' | 'circle' | 'rect';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius,
  style,
  variant = 'text',
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const getBorderRadius = () => {
    if (customBorderRadius !== undefined) return customBorderRadius;
    if (variant === 'circle') return 999;
    if (variant === 'text') return borderRadius.sm;
    return borderRadius.md;
  };

  const getWidth = (): number | string => {
    if (variant === 'circle') return height;
    // Converter strings para formato válido do React Native
    if (typeof width === 'string' && width.includes('%')) {
      return width; // Manter porcentagens como estão
    }
    if (typeof width === 'string' && width === '100%') {
      return '100%';
    }
    return typeof width === 'number' ? width : parseFloat(width as string) || height;
  };

  const widthValue = getWidth();
  const borderRadiusValue = getBorderRadius();

  // Converter width para formato compatível com Animated.View
  // Animated.View aceita string apenas para porcentagens no formato correto
  const styleWidth: number | string | undefined = typeof widthValue === 'string' && widthValue.includes('%') 
    ? widthValue 
    : typeof widthValue === 'number' 
      ? widthValue 
      : undefined;

  const animatedStyle: any = {
    height,
    borderRadius: borderRadiusValue,
    opacity: opacity,
    backgroundColor: colors.muted,
  };

  if (styleWidth !== undefined) {
    animatedStyle.width = styleWidth;
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        animatedStyle,
        style,
      ]}
      accessible={false}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.muted,
  },
});

/**
 * Skeleton presets para componentes comuns
 */
export const SkeletonPresets = {
  /** Avatar circular */
  Avatar: (size: number = 40) => <Skeleton variant="circle" width={size} height={size} />,

  /** Linha de texto */
  Text: ({
    width = '100%',
    height = 16,
    style,
  }: { width?: number | string; height?: number; style?: ViewStyle } = {}) => (
    <Skeleton variant="text" width={width} height={height} style={style} />
  ),

  /** Múltiplas linhas de texto */
  TextLines: (lines: number = 3) => (
    <>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '80%' : '100%'}
          height={16}
          style={{ marginBottom: spacing.sm }}
        />
      ))}
    </>
  ),

  /** Card de conteúdo */
  ContentCard: () => (
    <View style={{ padding: spacing.md, marginBottom: spacing.lg }}>
      <Skeleton variant="rect" width="100%" height={200} style={{ marginBottom: spacing.md }} />
      <Skeleton variant="text" width="100%" height={18} style={{ marginBottom: spacing.xs }} />
      <Skeleton variant="text" width="80%" height={16} />
    </View>
  ),

  /** Card de hábito */
  HabitCard: () => (
    <View
      style={{
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <Skeleton variant="circle" width={24} height={24} style={{ marginRight: spacing.md }} />
        <Skeleton variant="text" width="60%" height={18} />
      </View>
      <Skeleton variant="text" width="90%" height={14} />
    </View>
  ),
};

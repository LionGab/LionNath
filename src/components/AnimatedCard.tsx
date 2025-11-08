/**
 * AnimatedCard Component - Card com animações suaves
 *
 * Card aprimorado com animações de entrada e microinterações
 * Melhora a experiência visual e feedback ao usuário
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Card, CardProps } from './Card';
import { colors, shadows, spacing } from '@/theme';

export interface AnimatedCardProps extends CardProps {
  /** Animação de entrada (fade + scale) */
  animated?: boolean;

  /** Delay da animação (ms) */
  delay?: number;

  /** Duração da animação (ms) */
  duration?: number;

  /** Efeito de hover/press mais pronunciado */
  enhancedPress?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  animated = true,
  delay = 0,
  duration = 300,
  enhancedPress = false,
  style,
  ...cardProps
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, delay, duration, fadeAnim, scaleAnim]);

  const animatedStyle: ViewStyle = useMemo(
    () =>
      animated
        ? {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        : {},
    [animated, fadeAnim, scaleAnim]
  );

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Card {...cardProps} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  enhanced: {
    // Sombra mais pronunciada para feedback visual
    ...shadows.light.lg,
  },
});

/**
 * EnhancedButton Component - Botão com animações e feedback melhorado
 *
 * Melhora o Button existente com:
 * - Animações suaves de entrada
 * - Feedback visual aprimorado
 * - Microinterações acolhedoras
 */

import { shadows } from '@/theme';
import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Button, ButtonProps } from './Button';

export interface EnhancedButtonProps extends ButtonProps {
  /** Animação de entrada */
  animated?: boolean;

  /** Efeito de ripple no press */
  ripple?: boolean;

  /** Sombra mais pronunciada */
  elevated?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  animated = true,
  ripple = true,
  elevated = false,
  style,
  onPress,
  ...buttonProps
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(
    (event: Parameters<NonNullable<ButtonProps['onPress']>>[0]) => {
      if (ripple) {
        // Animação de press
        Animated.sequence([
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: 0.95,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }

      if (onPress) {
        onPress(event);
      }
    },
    [ripple, scaleAnim, opacityAnim, onPress]
  );

  const animatedStyle: ViewStyle = useMemo(
    () => ({
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
      ...(elevated && shadows.light.lg),
    }),
    [scaleAnim, opacityAnim, elevated]
  );

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Button {...buttonProps} onPress={handlePress} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({});

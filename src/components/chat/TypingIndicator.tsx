/**
 * TypingIndicator - Indicador de digitação animado
 * Componente otimizado com React.memo
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export const TypingIndicator = React.memo(() => {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.text}>💭 Pensando...</Text>
      </Animated.View>
    </View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    alignItems: 'center',
  },
  text: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },
});

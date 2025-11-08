/**
 * MessageSkeleton - Skeleton de mensagem para loading
 * Componente otimizado com React.memo
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { borderRadius, colors, spacing } from '@/theme';

export const MessageSkeleton = React.memo(() => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      <View style={styles.bar} />
    </Animated.View>
  );
});

MessageSkeleton.displayName = 'MessageSkeleton';

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bar: {
    width: '100%',
    height: 16,
    backgroundColor: colors.muted,
    borderRadius: borderRadius.sm,
  },
});

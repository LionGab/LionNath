import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export function ProgressBar({ progress, label, testID }: ProgressBarProps) {
  const clampedProgress = useMemo(() => Math.min(Math.max(progress, 0), 1), [progress]);
  const animatedValue = useRef(new Animated.Value(clampedProgress)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: clampedProgress,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [animatedValue, clampedProgress]);

  const widthStyle = {
    width: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.bar}>
        <Animated.View style={[styles.fill, widthStyle]} />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing.xs,
  } as ViewStyle,
  bar: {
    height: 6,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.palette.neutrals[200],
    overflow: 'hidden',
  } as ViewStyle,
  fill: {
    height: '100%',
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.palette.primary,
  } as ViewStyle,
  label: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.palette.neutrals[600],
    fontWeight: tokens.typography.caption.fontWeight,
  } as TextStyle,
});

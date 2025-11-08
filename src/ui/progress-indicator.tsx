import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { ProgressBar } from './progress-bar';

export interface ProgressIndicatorProps {
  current: number;
  total: number;
  variant?: 'bar' | 'dots';
  showLabel?: boolean;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export function ProgressIndicator({
  current,
  total,
  variant = 'dots',
  showLabel = true,
  testID,
}: ProgressIndicatorProps) {
  const progress = current / total;

  if (variant === 'bar') {
    return (
      <View style={styles.container} testID={testID}>
        <ProgressBar progress={progress} label={showLabel ? `${current} de ${total}` : undefined} />
      </View>
    );
  }

  // Dots variant
  return (
    <View style={styles.dotsContainer} testID={testID}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index < current ? styles.dotActive : styles.dotInactive,
              index === current - 1 && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
      {showLabel && (
        <Text style={styles.dotsLabel}>
          {current} / {total}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: tokens.spacing.lg,
  } as ViewStyle,
  dotsContainer: {
    alignItems: 'center',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.lg,
  } as ViewStyle,
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  } as ViewStyle,
  dot: {
    height: 10,
    borderRadius: tokens.radius.full,
    transition: 'all 180ms ease-out',
  } as ViewStyle,
  dotInactive: {
    width: 10,
    backgroundColor: tokens.palette.neutrals[300],
  } as ViewStyle,
  dotActive: {
    width: 10,
    backgroundColor: tokens.palette.neutrals[600],
  } as ViewStyle,
  dotCurrent: {
    width: 24,
    backgroundColor: tokens.palette.primary,
  } as ViewStyle,
  dotsLabel: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    fontWeight: tokens.typography.caption.fontWeight,
    color: tokens.palette.neutrals[600],
  } as TextStyle,
});

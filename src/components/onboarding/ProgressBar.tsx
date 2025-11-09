/**
 * ProgressBar - Barra de progresso para onboarding
 *
 * Mostra visualmente o progresso através das perguntas
 *
 * @example
 * <ProgressBar current={1} total={3} />
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { onboardingTheme } from '@/theme/onboarding';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface ProgressBarProps {
  current: number;
  total: number;
  accessibilityLabel?: string;
}

export function ProgressBar({ current, total, accessibilityLabel }: ProgressBarProps) {
  const theme = onboardingTheme;
  const progress = Math.min((current / total) * 100, 100);

  return (
    <View
      style={[
        styles.container,
        {
          height: theme.spacing.progressBarHeight,
          marginBottom: theme.spacing.progressBarMargin,
        },
      ]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || `Progresso: ${current} de ${total} perguntas`}
      accessibilityValue={{ now: current, max: total }}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${progress}%`,
            backgroundColor: nossaMaternidadeDesignTokens.palette.primary,
            height: theme.spacing.progressBarHeight,
            borderRadius: theme.spacing.progressBarHeight / 2,
          },
        ]}
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: nossaMaternidadeDesignTokens.palette.neutrals[200],
    borderRadius: 2,
    overflow: 'hidden',
  } as ViewStyle,
  progress: {
    transition: 'width 0.3s ease',
  } as ViewStyle,
});

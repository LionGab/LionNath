/**
 * OnboardingButton - Botão de navegação para onboarding
 *
 * Botão primário com estados: default, pressed, disabled
 * Usa tokens do tema de onboarding
 *
 * @example
 * <OnboardingButton
 *   label="Próximo"
 *   onPress={handleNext}
 *   disabled={!canProceed}
 * />
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { onboardingTheme } from '@/theme/onboarding';
import { createShadow } from '@/utils/shadowHelper';

export interface OnboardingButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  accessibilityLabel?: string;
}

export function OnboardingButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  accessibilityLabel,
}: OnboardingButtonProps) {
  const theme = onboardingTheme;

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? theme.colors.buttonDisabled.background
            : isPrimary
              ? theme.colors.buttonPrimary.background
              : theme.colors.buttonSecondary.background,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? 'transparent' : theme.colors.buttonSecondary.border,
          paddingVertical: theme.spacing.buttonPadding,
          paddingHorizontal: theme.spacing.buttonPadding * 2,
          borderRadius: theme.borderRadius.button,
          minHeight: theme.spacing.buttonHeight,
        },
        !disabled && isPrimary && createShadow(theme.shadows.optionSelected),
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text
        style={[
          styles.buttonText,
          {
            fontSize: theme.typography?.button?.fontSize || 16,
            fontWeight: theme.typography?.button?.fontWeight || '600',
            color: disabled
              ? theme.colors.buttonDisabled.text
              : isPrimary
                ? theme.colors.buttonPrimary.text
                : theme.colors.buttonSecondary.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  } as ViewStyle,
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
  buttonText: {
    textAlign: 'center',
  } as TextStyle,
});

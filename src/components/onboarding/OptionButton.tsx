/**
 * OptionButton - Botão de opção clicável para onboarding
 *
 * Componente interativo com estados visuais claros:
 * - default: estado inicial
 * - selected: opção selecionada
 * - pressed: durante o toque
 * - disabled: desabilitado
 *
 * @example
 * <OptionButton
 *   option={{ id: 'q1o1', label: 'Opção 1' }}
 *   isSelected={selectedId === 'q1o1'}
 *   onSelect={handleSelect}
 * />
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { onboardingTheme } from '@/theme/onboarding';
import { createShadow } from '@/utils/shadowHelper';

export interface OptionButtonProps {
  option: { id: string; label: string };
  isSelected: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function OptionButton({
  option,
  isSelected,
  onSelect,
  disabled = false,
  accessibilityLabel,
}: OptionButtonProps) {
  const theme = onboardingTheme;

  const handlePress = () => {
    if (disabled) return;
    onSelect(option.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: disabled
            ? theme.colors.optionDisabled.background
            : isSelected
              ? theme.colors.optionSelected.background
              : theme.colors.optionDefault.background,
          borderColor: disabled
            ? theme.colors.optionDisabled.border
            : isSelected
              ? theme.colors.optionSelected.border
              : theme.colors.optionDefault.border,
          borderWidth: isSelected ? 2 : 1,
          paddingVertical: theme.spacing.optionPadding,
          paddingHorizontal: theme.spacing.optionPadding,
          borderRadius: theme.borderRadius.option,
          minHeight: theme.spacing.buttonHeight, // Touch target mínimo
        },
        isSelected && !disabled && createShadow(theme.shadows.optionSelected),
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={accessibilityLabel || option.label}
      accessibilityHint={isSelected ? 'Opção selecionada. Toque para desmarcar.' : 'Toque para selecionar esta opção.'}
    >
      <Text
        style={[
          styles.optionText,
          {
            fontSize: theme.typography?.option?.fontSize || 18,
            fontWeight: theme.typography?.option?.fontWeight || '400',
            lineHeight: theme.typography?.option?.lineHeight || 26,
            color: disabled
              ? theme.colors.optionDisabled.text
              : isSelected
                ? theme.colors.optionSelected.text
                : theme.colors.optionDefault.text,
          },
        ]}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  } as ViewStyle,
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
  optionText: {
    textAlign: 'left',
  } as TextStyle,
});

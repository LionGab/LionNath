import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface ChipProps extends Omit<PressableProps, 'style'> {
  label: string;
  selected?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export function Chip({ label, selected = false, accessibilityLabel, testID, onPress, ...pressableProps }: ChipProps) {
  return (
    <Pressable
      {...pressableProps}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected ? styles.selected : styles.unselected, pressed && styles.pressed]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Text style={[styles.textBase, selected ? styles.textSelected : styles.textUnselected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: tokens.spacing.xs,
  } as ViewStyle,
  unselected: {
    borderColor: tokens.palette.neutrals[300],
    backgroundColor: 'transparent',
  } as ViewStyle,
  selected: {
    borderColor: tokens.palette.primary,
    backgroundColor: tokens.palette.surface,
    shadowColor: tokens.palette.overlays.subtle,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
  pressed: {
    transform: [{ scale: 0.97 }],
  } as ViewStyle,
  textBase: {
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    fontWeight: tokens.typography.bodyMd.fontWeight,
  } as TextStyle,
  textUnselected: {
    color: tokens.palette.text,
  } as TextStyle,
  textSelected: {
    color: tokens.palette.primary,
  } as TextStyle,
});

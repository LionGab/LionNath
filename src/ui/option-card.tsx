import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface OptionCardProps extends Omit<PressableProps, 'style'> {
  icon: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export function OptionCard({
  icon,
  label,
  selected = false,
  disabled = false,
  accessibilityLabel,
  testID,
  onPress,
  ...pressableProps
}: OptionCardProps) {
  return (
    <Pressable
      {...pressableProps}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Icon name={icon} size={28} color={selected ? tokens.palette.primary : tokens.palette.neutrals[600]} />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    minHeight: 120,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    borderWidth: 2,
    marginBottom: tokens.spacing.sm,
  } as ViewStyle,
  unselected: {
    borderColor: tokens.palette.neutrals[300],
    backgroundColor: tokens.palette.surface,
  } as ViewStyle,
  selected: {
    borderColor: tokens.palette.primary,
    backgroundColor: tokens.palette.surface,
    shadowColor: tokens.palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  } as ViewStyle,
  pressed: {
    transform: [{ scale: 0.97 }],
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: tokens.radius.full,
    backgroundColor: tokens.palette.neutrals[200],
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  iconContainerSelected: {
    backgroundColor: `${tokens.palette.primary}20`,
  } as ViewStyle,
  label: {
    fontSize: tokens.typography.bodySm.fontSize,
    lineHeight: tokens.typography.bodySm.lineHeight,
    fontWeight: tokens.typography.bodyMd.fontWeight,
    color: tokens.palette.text,
    textAlign: 'center',
  } as TextStyle,
  labelSelected: {
    color: tokens.palette.primary,
    fontWeight: '600',
  } as TextStyle,
});

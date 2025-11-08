import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
  style?: ViewStyle;
}

const tokens = nossaMaternidadeDesignTokens;

export function Toggle({
  label,
  description,
  value,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: ToggleProps) {
  const trackColor = useMemo(
    () => ({
      false: tokens.palette.neutrals[300],
      true: tokens.palette.primary,
    }),
    []
  );

  const thumbColor = useMemo(
    () => (value ? tokens.palette.surface : tokens.palette.neutrals[100]),
    [value]
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor}
        thumbColor={thumbColor}
        ios_backgroundColor={tokens.palette.neutrals[300]}
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ checked: value }}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.palette.surface,
  } as ViewStyle,
  textContainer: {
    flex: 1,
    marginRight: tokens.spacing.md,
    gap: tokens.spacing.xs,
  } as ViewStyle,
  label: {
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    fontWeight: tokens.typography.bodyMd.fontWeight,
    color: tokens.palette.text,
  } as TextStyle,
  description: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.palette.neutrals[600],
  } as TextStyle,
});



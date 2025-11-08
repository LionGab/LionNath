import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

type ButtonVariant = 'primary' | 'ghost';
type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  testID,
  onPress,
  ...pressableProps
}: ButtonProps): JSX.Element {
  const computedContainerStyle = useMemo(() => {
    const variantStyle = variant === 'primary' ? styles.primary : styles.ghost;
    const sizeStyle = size === 'lg' ? styles.sizeLg : styles.sizeMd;
    return [
      styles.base,
      variantStyle,
      sizeStyle,
      (loading || disabled) && styles.disabled,
      fullWidth && styles.fullWidth,
      style,
    ];
  }, [variant, size, loading, disabled, fullWidth, style]);

  const computedTextStyle = useMemo(() => {
    const variantStyle = variant === 'primary' ? styles.textPrimary : styles.textGhost;
    return [styles.textBase, variantStyle, textStyle];
  }, [variant, textStyle]);

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || loading) {
      return;
    }
    onPress?.(event);
  };

  return (
    <Pressable
      {...pressableProps}
      onPress={handlePress}
      style={computedContainerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      testID={testID}
    >
      {({ pressed }) => (
        <View style={[styles.content, pressed && !disabled && !loading && styles.contentPressed]}>
          {leftIcon}
          {loading ? (
            <ActivityIndicator
              color={variant === 'primary' ? tokens.palette.surface : tokens.palette.text}
            />
          ) : (
            <Text style={computedTextStyle}>{label}</Text>
          )}
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: tokens.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.xl,
    paddingVertical: tokens.spacing.md,
    flexDirection: 'row',
    gap: tokens.spacing.xs,
  } as ViewStyle,
  primary: {
    backgroundColor: tokens.palette.primary,
  } as ViewStyle,
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: tokens.palette.neutrals[300],
  } as ViewStyle,
  sizeMd: {
    paddingVertical: tokens.spacing.md,
  } as ViewStyle,
  sizeLg: {
    paddingVertical: tokens.spacing.lg,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  } as ViewStyle,
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
  } as ViewStyle,
  contentPressed: {
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
  textBase: {
    fontSize: tokens.typography.button.fontSize,
    lineHeight: tokens.typography.button.lineHeight,
    fontWeight: tokens.typography.button.fontWeight,
    letterSpacing: tokens.typography.button.letterSpacing,
  } as TextStyle,
  textPrimary: {
    color: tokens.palette.surface,
  } as TextStyle,
  textGhost: {
    color: tokens.palette.text,
  } as TextStyle,
});



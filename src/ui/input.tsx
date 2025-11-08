import React, { forwardRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface InputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, helperText, errorText, containerStyle, editable = true, testID, ...textInputProps }, ref) => {
    const inputStyle = useMemo(
      () => [
        styles.input,
        !editable && styles.inputDisabled,
        errorText ? styles.inputError : undefined,
        textInputProps.multiline ? styles.inputMultiline : undefined,
      ],
      [editable, errorText, textInputProps.multiline]
    );

    const helperStyle = useMemo(
      () => [styles.helper, errorText ? styles.helperError : undefined],
      [errorText]
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          style={inputStyle}
          placeholderTextColor={tokens.palette.neutrals[600]}
          accessible
          accessibilityRole="text"
          accessibilityState={{ disabled: !editable }}
          testID={testID}
          {...textInputProps}
        />
        {helperText || errorText ? (
          <Text style={helperStyle}>{errorText ? errorText : helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    gap: tokens.spacing.xs,
  } as ViewStyle,
  label: {
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    fontWeight: tokens.typography.bodyMd.fontWeight,
    color: tokens.palette.text,
  } as TextStyle,
  input: {
    minHeight: 56,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.palette.neutrals[300],
    backgroundColor: tokens.palette.surface,
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.sm,
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    color: tokens.palette.text,
  } as TextStyle,
  inputDisabled: {
    opacity: 0.6,
  } as TextStyle,
  inputError: {
    borderColor: tokens.palette.feedback.danger,
  } as TextStyle,
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  } as TextStyle,
  helper: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.palette.neutrals[600],
  } as TextStyle,
  helperError: {
    color: tokens.palette.feedback.danger,
  } as TextStyle,
});



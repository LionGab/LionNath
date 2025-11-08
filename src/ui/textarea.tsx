import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface TextAreaProps extends Omit<TextInputProps, 'multiline' | 'numberOfLines'> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
  numberOfLines?: number;
  accessibilityLabel: string;
  testID?: string;
  containerStyle?: ViewStyle;
}

const tokens = nossaMaternidadeDesignTokens;

export function TextArea({
  label,
  error,
  helperText,
  maxLength,
  showCharCount = false,
  numberOfLines = 4,
  value,
  onChangeText,
  placeholder,
  editable = true,
  accessibilityLabel,
  testID,
  containerStyle,
  ...textInputProps
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value?.length || 0;
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showCharCount && maxLength && (
            <Text style={styles.charCount}>
              {charCount}/{maxLength}
            </Text>
          )}
        </View>
      )}

      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tokens.palette.neutrals[500]}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        maxLength={maxLength}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={helperText || error}
        accessibilityState={{ disabled: !editable }}
      />

      {(helperText || error) && (
        <Text
          style={[styles.helperText, hasError && styles.errorText]}
          accessibilityRole="text"
          accessibilityLiveRegion={hasError ? 'assertive' : 'polite'}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: tokens.spacing.sm,
  } as ViewStyle,
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  label: {
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    fontWeight: tokens.typography.bodyMd.fontWeight,
    color: tokens.palette.text,
  } as TextStyle,
  charCount: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.palette.neutrals[600],
  } as TextStyle,
  input: {
    minHeight: 120,
    borderRadius: tokens.radius.lg,
    borderWidth: 2,
    borderColor: tokens.palette.neutrals[300],
    backgroundColor: tokens.palette.surface,
    padding: tokens.spacing.md,
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    color: tokens.palette.text,
    ...Platform.select({
      ios: {
        paddingTop: tokens.spacing.md,
      },
    }),
  } as TextStyle,
  inputFocused: {
    borderColor: tokens.palette.primary,
    borderWidth: 2,
  } as TextStyle,
  inputError: {
    borderColor: tokens.palette.feedback.danger,
  } as TextStyle,
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: tokens.palette.neutrals[200],
  } as TextStyle,
  helperText: {
    fontSize: tokens.typography.caption.fontSize,
    lineHeight: tokens.typography.caption.lineHeight,
    color: tokens.palette.neutrals[600],
    marginLeft: tokens.spacing.xs,
  } as TextStyle,
  errorText: {
    color: tokens.palette.feedback.danger,
  } as TextStyle,
});

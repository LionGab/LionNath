import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Input Component - Sistema de Design Bubblegum
 *
 * Campo de entrada de texto acessível com label, validação e feedback visual.
 * Otimizado para público C-D com linguagem simples e área de toque adequada.
 *
 * @example
 * <Input
 *   label="Seu nome"
 *   value={name}
 *   onChangeText={setName}
 *   placeholder="Digite seu nome completo"
 *   accessibilityLabel="Campo de nome"
 * />
 *
 * @example
 * <Input
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error="Email inválido"
 *   icon="email"
 *   keyboardType="email-address"
 * />
 */

export interface InputProps extends TextInputProps {
  /** Label acima do input (recomendado para acessibilidade) */
  label?: string;

  /** Mensagem de erro (exibe feedback visual vermelho) */
  error?: string;

  /** Mensagem de ajuda/hint abaixo do input */
  helperText?: string;

  /** Ícone do MaterialCommunityIcons à esquerda */
  icon?: string;

  /** Cor do ícone (padrão: mutedForeground) */
  iconColor?: string;

  /** Input obrigatório (adiciona * no label) */
  required?: boolean;

  /** Estilo customizado do container */
  containerStyle?: ViewStyle;

  /** Estilo customizado do input */
  inputStyle?: TextStyle;

  /** Estilo customizado do label */
  labelStyle?: TextStyle;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  iconColor,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onChangeText,
  placeholder,
  editable = true,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const isDisabled = !editable;

  // Memoizar cor da borda
  const borderColor = useMemo(
    () => (hasError ? colors.destructive : isFocused ? colors.primary : colors.border),
    [hasError, isFocused]
  );

  // Memoizar cor do ícone
  const finalIconColor = useMemo(
    () => iconColor || (hasError ? colors.destructive : isFocused ? colors.primary : colors.mutedForeground),
    [iconColor, hasError, isFocused]
  );

  // Callbacks para focus/blur
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Memoizar estilo do container do input
  const inputContainerStyle = useMemo(
    () => [
      styles.inputContainer,
      { borderColor },
      isFocused && styles.inputContainerFocused,
      hasError && styles.inputContainerError,
      isDisabled && styles.inputContainerDisabled,
    ],
    [borderColor, isFocused, hasError, isDisabled]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, labelStyle]} accessibilityRole="text">
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Ícone */}
        {icon && <Icon name={icon} size={22} color={finalIconColor} style={styles.icon} />}

        {/* TextInput */}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, isDisabled && styles.inputDisabled, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessible={true}
          accessibilityLabel={label || placeholder || 'Input de texto'}
          accessibilityHint={helperText || error}
          accessibilityState={{
            disabled: isDisabled,
          }}
          {...textInputProps}
        />
      </View>

      {/* Helper Text ou Error */}
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
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },

  // Label
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.sans,
  },

  required: {
    color: colors.destructive,
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.input,
    // Altura mínima para área de toque adequada
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },

  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
    ...shadows.light.xs,
    borderWidth: 3,
  },

  inputContainerError: {
    borderColor: colors.destructive,
    backgroundColor: colors.background,
  },

  inputContainerDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.6,
  },

  // Ícone
  icon: {
    marginRight: spacing.sm,
  },

  // TextInput
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
    // Remove padding padrão do TextInput
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
  },

  inputWithIcon: {
    // Já tem margin do ícone
  },

  inputDisabled: {
    color: colors.mutedForeground,
  },

  // Helper/Error Text
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },

  errorText: {
    color: colors.destructive,
  },
});

// Memoizar componente para evitar re-renders desnecessários
export const Input = React.memo(InputComponent);

import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/Text';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

interface FormState {
  email: string;
  password: string;
}

const INITIAL_FORM_STATE: FormState = {
  email: '',
  password: '',
};

/**
 * LoginScreen - Tela de autenticação mobile-first
 *
 * Utiliza Supabase Auth via `useAuth`, com feedback acessível,
 * validação básica e integração com tema dinâmico.
 */
export const LoginScreen: React.FC = React.memo(function LoginScreen() {
  const { colors, theme } = useTheme();
  const { signIn, isLoading, error, resetError } = useAuth();
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);

  const isSubmitDisabled = useMemo(() => {
    const hasValidEmail = formState.email.trim().length > 5 && formState.email.includes('@');
    const hasValidPassword = formState.password.trim().length >= 6;
    return isLoading || !hasValidEmail || !hasValidPassword;
  }, [formState.email, formState.password, isLoading]);

  const containerStyle = useMemo(
    () => [
      styles.container,
      {
        backgroundColor: colors.background,
        paddingHorizontal: theme.spacing.xl,
      },
    ],
    [colors.background, theme.spacing.xl]
  );

  const headerStyle = useMemo(
    () => [
      styles.header,
      {
        gap: theme.spacing.sm,
        marginBottom: theme.spacing['2xl'],
      },
    ],
    [theme.spacing.sm, theme.spacing['2xl']]
  );

  const titleStyle = useMemo(
    () => [
      styles.title,
      {
        color: colors.foreground,
        fontFamily: theme.typography.fontFamily.sans,
        fontSize: theme.typography.sizes['3xl'],
      },
    ],
    [colors.foreground, theme.typography.fontFamily.sans, theme.typography.sizes]
  );

  const subtitleStyle = useMemo(
    () => [
      styles.subtitle,
      {
        color: colors.mutedForeground,
        fontFamily: theme.typography.fontFamily.sans,
        fontSize: theme.typography.sizes.base,
      },
    ],
    [colors.mutedForeground, theme.typography.fontFamily.sans, theme.typography.sizes.base]
  );

  const formStyle = useMemo(
    () => [
      styles.form,
      {
        gap: theme.spacing.lg,
      },
    ],
    [theme.spacing.lg]
  );

  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        borderColor: colors.border,
        backgroundColor: colors.card,
        color: colors.foreground,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      },
    ],
    [colors.border, colors.card, colors.foreground, theme.borderRadius.lg, theme.spacing.lg, theme.spacing.md]
  );

  const buttonStyle = useMemo(
    () => [
      styles.button,
      {
        backgroundColor: isSubmitDisabled ? colors.muted : colors.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
      },
    ],
    [colors.muted, colors.primary, theme.borderRadius.lg, theme.spacing.md, isSubmitDisabled]
  );

  const buttonLabelStyle = useMemo(
    () => [
      styles.buttonLabel,
      {
        color: isSubmitDisabled ? colors.mutedForeground : colors.primaryForeground,
        fontFamily: theme.typography.fontFamily.sans,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
      },
    ],
    [
      colors.mutedForeground,
      colors.primaryForeground,
      theme.typography.fontFamily.sans,
      theme.typography.sizes.lg,
      theme.typography.weights.semibold,
      isSubmitDisabled,
    ]
  );

  const handleChange = useCallback(
    (field: keyof FormState, value: string) => {
      resetError();
      setFormState((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    [resetError]
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Feedback háptico falhou (provavelmente não suportado) — seguir normalmente
    }

    await signIn(formState.email.trim().toLowerCase(), formState.password);
  }, [formState.email, formState.password, isSubmitDisabled, signIn]);

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text accessibilityRole="header" accessibilityLabel="Entrar" style={titleStyle} variant="h2">
          Entrar
        </Text>
        <Text style={subtitleStyle} variant="body">
          Use seu e-mail e senha cadastrados para acessar a NathIA.
        </Text>
      </View>

      <View style={formStyle}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel} color={colors.mutedForeground} variant="label">
            E-mail
          </Text>
          <TextInput
            value={formState.email}
            onChangeText={(value) => handleChange('email', value)}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="exemplo@dominio.com"
            placeholderTextColor={colors.mutedForeground}
            style={inputStyle}
            accessible
            accessibilityLabel="Campo de e-mail"
            accessibilityHint="Digite seu e-mail cadastrado"
            returnKeyType="next"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel} color={colors.mutedForeground} variant="label">
            Senha
          </Text>
          <TextInput
            value={formState.password}
            onChangeText={(value) => handleChange('password', value)}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            style={inputStyle}
            accessible
            accessibilityLabel="Campo de senha"
            accessibilityHint="Digite sua senha de acesso"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!isLoading}
          />
        </View>

        {error ? (
          <Text
            variant="error"
            accessibilityLiveRegion="assertive"
            accessibilityLabel={`Erro: ${error}`}
            style={[styles.errorMessage, { color: colors.destructive }]}
          >
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={buttonStyle}
          activeOpacity={0.9}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          accessibilityHint="Envia o formulário de login"
          accessibilityState={{ disabled: isSubmitDisabled, busy: isLoading }}
        >
          <Text style={buttonLabelStyle}>{isLoading ? 'Entrando…' : 'Entrar'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
  },
  inputLabel: {
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    minHeight: 52,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonLabel: {
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'left',
  },
});

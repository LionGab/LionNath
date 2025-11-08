/**
 * SignIn Screen - Tela de Login
 *
 * Tela mobile-first com dois passos:
 * 1. Email (ou magic link)
 * 2. Senha (se usuário já tem conta)
 *
 * Integrado com Supabase Auth e preparado para testes E2E.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Loading } from '@/shared/components/Loading';
import { colors, spacing, typography, borderRadius } from '@/theme';

type SignInStep = 'email' | 'password';

export function SignInScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { signIn, signInWithMagicLink, isAuthenticated } = useAuth();
  const [step, setStep] = useState<SignInStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Validar formato de email
  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, [email]);

  // Redirecionar se já autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  }, [isAuthenticated, navigation]);

  // Handler para continuar com email
  const handleContinueWithEmail = useCallback(async () => {
    if (!isValidEmail) {
      setError('Por favor, insira um email válido');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Tentar enviar magic link primeiro
      const { error: magicLinkError } = await signInWithMagicLink(email.trim());

      if (!magicLinkError) {
        setMagicLinkSent(true);
        Alert.alert('Link enviado!', 'Verifique seu email e clique no link para fazer login.', [
          {
            text: 'OK',
            onPress: () => {
              // Opção: voltar para welcome ou aguardar
              setStep('email');
            },
          },
        ]);
      } else {
        // Se magic link falhar, assumir que usuário precisa de senha
        // Avançar para passo de senha
        setStep('password');
      }
    } catch (err) {
      // Se erro, assumir que precisa de senha
      setStep('password');
    } finally {
      setLoading(false);
    }
  }, [email, isValidEmail, signInWithMagicLink]);

  // Handler para login com senha
  const handleSignInWithPassword = useCallback(async () => {
    if (!password || password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { user, error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        setError(signInError.message || 'Erro ao fazer login. Verifique suas credenciais.');
        return;
      }

      if (user) {
        // Login bem-sucedido - navegação será feita pelo useEffect acima
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' as never }],
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, navigation]);

  // Handler para voltar ao passo de email
  const handleBackToEmail = useCallback(() => {
    setStep('email');
    setPassword('');
    setError(null);
  }, []);

  // Renderizar passo de email
  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Digite seu email para continuar</Text>

      <Input
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError(null);
        }}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!loading}
        error={error && step === 'email' ? error : undefined}
        icon="email"
        required
        testID="email-input"
        accessibilityLabel="Campo de email"
        accessibilityHint="Digite seu endereço de email"
      />

      {magicLinkSent && (
        <View style={styles.magicLinkInfo}>
          <Text style={styles.magicLinkText}>Link de acesso enviado! Verifique seu email.</Text>
        </View>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleContinueWithEmail}
        loading={loading}
        disabled={!isValidEmail || loading}
        accessibilityLabel="Continuar com email"
        accessibilityHint="Avança para o próximo passo do login"
      >
        Continuar
      </Button>
    </View>
  );

  // Renderizar passo de senha
  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Digite sua senha</Text>
      <Text style={styles.subtitle}>Para a conta: {email}</Text>

      <Input
        label="Senha"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        placeholder="Sua senha"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        editable={!loading}
        error={error && step === 'password' ? error : undefined}
        icon="lock"
        required
        testID="password-input"
        accessibilityLabel="Campo de senha"
        accessibilityHint="Digite sua senha"
      />

      <View style={styles.passwordActions}>
        <Button
          variant="ghost"
          size="md"
          onPress={handleBackToEmail}
          disabled={loading}
          accessibilityLabel="Voltar para email"
          accessibilityHint="Retorna ao passo anterior"
        >
          Voltar
        </Button>
      </View>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleSignInWithPassword}
        loading={loading}
        disabled={!password || password.length < 6 || loading}
        accessibilityLabel="Confirmar login"
        accessibilityHint="Faz login com email e senha"
      >
        Confirmar
      </Button>
    </View>
  );

  if (loading && step === 'email') {
    return (
      <SafeAreaView style={styles.container}>
        <Loading message="Enviando link..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'email' ? renderEmailStep() : renderPasswordStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.sans,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    marginBottom: spacing['2xl'],
    fontFamily: typography.fontFamily.sans,
    textAlign: 'center',
  },
  magicLinkInfo: {
    backgroundColor: colors.muted,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  magicLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.lg,
  },
});

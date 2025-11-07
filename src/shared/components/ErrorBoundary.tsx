/**
 * ErrorBoundary - Sistema de Design Bubblegum
 *
 * Captura erros React e exibe UI de fallback acolhedora
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { Button } from '@/components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel="Ícone de erro - coração partido"
            style={styles.iconContainer}
          >
            <Text style={styles.emoji} accessibilityLabel="">
              💔
            </Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Ops! Algo deu errado
          </Text>
          <Text style={styles.message} accessibilityRole="text">
            Desculpa pelo inconveniente. Tente novamente em instantes.
          </Text>
          {__DEV__ && this.state.error && (
            <Text
              style={styles.error}
              accessibilityRole="text"
              accessibilityLabel={`Detalhes do erro: ${this.state.error.toString()}`}
            >
              {this.state.error.toString()}
            </Text>
          )}
          <Button
            variant="primary"
            onPress={this.handleReset}
            accessibilityLabel="Tentar novamente"
            accessibilityHint="Recarrega a tela e tenta novamente"
            accessibilityRole="button"
            style={styles.button}
          >
            Tentar Novamente
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 48,
  },
  error: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
    textAlign: 'center',
    padding: spacing.sm,
    backgroundColor: colors.muted,
    borderRadius: 4,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.foreground,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  button: {
    marginTop: spacing.md,
  },
});


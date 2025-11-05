/**
 * ConfigErrorScreen - Tela de erro para configuração faltando
 * Exibida quando API keys críticas não estão configuradas
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { colors, spacing, typography } from '@/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ConfigErrorScreenProps {
  /** Variáveis de ambiente faltando */
  missingKeys: string[];
  /** Callback para tentar novamente */
  onRetry?: () => void;
}

export const ConfigErrorScreen: React.FC<ConfigErrorScreenProps> = ({ missingKeys, onRetry }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      accessible={true}
      accessibilityLabel="Erro de configuração"
    >
      <View style={styles.iconContainer}>
        <Icon name="alert-circle-outline" size={64} color={colors.destructive} />
      </View>

      <Logo size={80} />

      <Text style={styles.title}>Configuração Necessária</Text>

      <Text style={styles.description}>
        Parece que algumas variáveis de ambiente não estão configuradas. Para usar o app, você precisa configurar as
        seguintes chaves:
      </Text>

      <View style={styles.keysContainer}>
        {missingKeys.map((key) => (
          <View key={key} style={styles.keyItem}>
            <Icon name="key-variant" size={20} color={colors.primary} />
            <Text style={styles.keyText}>{key}</Text>
          </View>
        ))}
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Como configurar:</Text>
        <Text style={styles.instruction}>
          1. Copie o arquivo <Text style={styles.code}>.env.example</Text> para <Text style={styles.code}>.env.local</Text>
        </Text>
        <Text style={styles.instruction}>
          2. Preencha as variáveis com suas chaves reais
        </Text>
        <Text style={styles.instruction}>
          3. Reinicie o app
        </Text>
      </View>

      {onRetry && (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onRetry}
          icon="refresh"
          accessibilityLabel="Tentar novamente"
          style={styles.retryButton}
        >
          Verificar Novamente
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  keysContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  keyText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontFamily: typography.fontFamily.mono,
    flex: 1,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  instruction: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
    lineHeight: 22,
    fontFamily: typography.fontFamily.sans,
  },
  code: {
    fontFamily: typography.fontFamily.mono,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
    color: colors.primary,
  },
  retryButton: {
    marginTop: spacing.lg,
  },
});

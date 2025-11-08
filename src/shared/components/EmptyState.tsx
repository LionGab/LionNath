/**
 * EmptyState Component - Estados vazios acolhedores
 *
 * Ilustração + mensagem encorajadora + action button opcional
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { Button } from '@/components/Button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface EmptyStateProps {
  /** Ícone ou emoji para ilustração */
  icon?: string;
  /** Emoji customizado (alternativa ao ícone) */
  emoji?: string;
  /** Título da mensagem */
  title: string;
  /** Descrição/subtítulo */
  description?: string;
  /** Texto do botão de ação (opcional) */
  actionLabel?: string;
  /** Handler do botão de ação */
  onAction?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]} accessible={true} accessibilityRole="text">
      <View style={styles.content}>
        {emoji ? (
          <Text style={styles.emoji} accessible={false}>
            {emoji}
          </Text>
        ) : icon ? (
          <Icon name={icon} size={64} color={colors.mutedForeground} style={styles.icon} />
        ) : null}

        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>

        {description && (
          <Text style={styles.description} accessibilityRole="text">
            {description}
          </Text>
        )}

        {actionLabel && onAction && (
          <Button
            variant="primary"
            size="md"
            onPress={onAction}
            style={styles.actionButton}
            accessibilityLabel={actionLabel}
            accessibilityHint="Botão de ação para esta seção vazia"
          >
            {actionLabel}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  icon: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold as any,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.sans,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.sizes.base * 1.5,
    fontFamily: typography.fontFamily.sans,
  },
  actionButton: {
    marginTop: spacing.md,
  },
});

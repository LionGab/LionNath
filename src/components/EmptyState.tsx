import React, { useCallback, useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';

interface HapticsType {
  impactAsync: (style: number) => Promise<void> | void;
  ImpactFeedbackStyle?: {
    Light?: number;
  };
}

let Haptics: HapticsType | null = null;
try {
  // expo-haptics é opcional; garantimos import seguro em runtime
  Haptics = require('expo-haptics');
} catch (error) {
  // expo-haptics não disponível, seguir sem feedback háptico
}

/**
 * EmptyState - Componente de estado vazio mobile-first
 *
 * Exibe título, descrição, ilustração opcional e CTA para orientar o usuário
 * em situações sem conteúdo. Acessível (WCAG 2.1 AA) e responsivo.
 *
 * @example
 * <EmptyState
 *   title="Nenhuma conversa ainda"
 *   description="Inicie um bate-papo com a Nathia para receber apoio imediato"
 *   actionLabel="Conversar agora"
 *   onActionPress={handleOpenChat}
 *   illustrationSource={require('@/assets/empty-chat.png')}
 *   illustrationAccessibilityLabel="Ilustração de conversa vazia"
 *   accessibilityLabel="Estado vazio do chat"
 * />
 */
export interface EmptyStateProps {
  /** Título principal do estado vazio */
  title: string;
  /** Descrição complementar para orientar o usuário */
  description?: string;
  /** Fonte da ilustração opcional exibida no topo */
  illustrationSource?: ImageSourcePropType;
  /** Texto alternativo da ilustração para leitores de tela */
  illustrationAccessibilityLabel?: string;
  /** Texto do botão de ação */
  actionLabel?: string;
  /** Callback acionado ao tocar no botão */
  onActionPress?: () => void;
  /** Texto alternativo da ação para acessibilidade */
  actionAccessibilityLabel?: string;
  /** Dica adicional da ação para acessibilidade */
  actionAccessibilityHint?: string;
  /** Descrição do container para leitores de tela */
  accessibilityLabel: string;
  /** Indica se o conteúdo deve ser anunciado dinamicamente */
  announcePolitely?: boolean;
  /** Estilo customizado do container */
  style?: ViewStyle;
  /** Estilo customizado do título */
  titleStyle?: TextStyle;
  /** Estilo customizado da descrição */
  descriptionStyle?: TextStyle;
  /** Identificador para testes */
  testID?: string;
}

const EmptyStateComponent: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustrationSource,
  illustrationAccessibilityLabel,
  actionLabel,
  onActionPress,
  actionAccessibilityLabel,
  actionAccessibilityHint,
  accessibilityLabel,
  announcePolitely = false,
  style,
  titleStyle,
  descriptionStyle,
  testID,
}) => {
  const containerStyles = useMemo(() => [styles.container, style], [style]);
  const computedTitleStyle = useMemo(() => [styles.title, titleStyle], [titleStyle]);
  const computedDescriptionStyle = useMemo(() => [styles.description, descriptionStyle], [descriptionStyle]);

  const handleActionPress = useCallback(() => {
    if (!onActionPress) {
      return;
    }

    try {
      if (Haptics?.impactAsync) {
        const lightImpact = Haptics.ImpactFeedbackStyle?.Light ?? 1;
        Haptics.impactAsync(lightImpact);
      }
    } catch (error) {
      // Sem suporte a haptics; seguir sem feedback
    }

    onActionPress();
  }, [onActionPress]);

  return (
    <View
      style={containerStyles}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      accessibilityLiveRegion={announcePolitely ? 'polite' : undefined}
      testID={testID}
    >
      {illustrationSource ? (
        <Image
          source={illustrationSource}
          style={styles.illustration}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={illustrationAccessibilityLabel ?? title}
        />
      ) : null}

      <Text style={computedTitleStyle} accessibilityRole="header">
        {title}
      </Text>

      {description ? (
        <Text style={computedDescriptionStyle} accessibilityRole="text">
          {description}
        </Text>
      ) : null}

      {actionLabel && onActionPress ? (
        <View style={styles.buttonWrapper}>
          <Button
            variant="primary"
            onPress={handleActionPress}
            accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
            accessibilityHint={actionAccessibilityHint}
          >
            {actionLabel}
          </Button>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    minHeight: 220,
    width: '100%',
    justifyContent: 'center',
    ...shadows.light.sm,
  },
  illustration: {
    width: 128,
    height: 128,
    marginBottom: spacing.lg,
    resizeMode: 'contain',
    borderRadius: borderRadius.lg,
  },
  title: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.sizes.base,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
  },
});

export const EmptyState = React.memo(EmptyStateComponent);

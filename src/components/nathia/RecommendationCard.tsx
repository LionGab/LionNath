/**
 * RecommendationCard - Card de recomendação personalizada
 *
 * Features:
 * - Exibe: conteúdo, círculo ou hábito
 * - Justificativa curta (por que é relevante)
 * - CTA claro e acessível
 * - Tracking de impressão e clique
 * - Design System v1 aplicado
 *
 * @example
 * <RecommendationCard
 *   recommendation={recommendation}
 *   onPress={handlePress}
 *   onImpression={trackImpression}
 * />
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { NathiaRecommendation } from '@/services/nathia-client';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { logger } from '@/lib/logger';

interface RecommendationCardProps {
  recommendation: NathiaRecommendation;
  onPress: (recommendation: NathiaRecommendation) => void;
  onImpression?: (recommendationId: string) => void;
}

export function RecommendationCard({ recommendation, onPress, onImpression }: RecommendationCardProps) {
  const impressionTracked = useRef(false);
  const { palette, typography, spacing, radius, shadow } = nossaMaternidadeDesignTokens;

  // Track impression quando componente é montado
  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      onImpression?.(recommendation.id);

      logger.info('Recommendation Card Impression', {
        id: recommendation.id,
        type: recommendation.type,
      });
    }
  }, [recommendation.id, onImpression]);

  const handlePress = () => {
    onPress(recommendation);

    logger.info('Recommendation Card Clicked', {
      id: recommendation.id,
      type: recommendation.type,
    });

    AccessibilityInfo.announceForAccessibility(`Navegando para ${recommendation.title}`);
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      circle: 'Círculo',
      habit: 'Hábito',
      content: 'Conteúdo',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      circle: '👥',
      habit: '✨',
      content: '📖',
    };
    return icons[type] || '💡';
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderRadius: radius.md,
          ...shadow.soft,
        },
      ]}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${getTypeLabel(recommendation.type)}: ${recommendation.title}`}
      accessibilityHint={recommendation.reason}
    >
      {/* Type Badge */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: palette.overlays.subtle,
              borderRadius: radius.sm,
            },
          ]}
        >
          <Text style={styles.badgeIcon}>{getTypeIcon(recommendation.type)}</Text>
          <Text
            style={[
              styles.badgeText,
              {
                fontSize: typography.caption.fontSize,
                color: palette.text,
                fontWeight: '600',
              },
            ]}
          >
            {getTypeLabel(recommendation.type)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              fontSize: typography.headlineSm.fontSize,
              fontWeight: typography.headlineSm.fontWeight,
              color: palette.text,
            },
          ]}
        >
          {recommendation.title}
        </Text>

        {recommendation.description && (
          <Text
            style={[
              styles.description,
              {
                fontSize: typography.bodyMd.fontSize,
                color: palette.neutrals[700],
                marginTop: spacing.xs,
              },
            ]}
            numberOfLines={2}
          >
            {recommendation.description}
          </Text>
        )}

        {/* Reason (justificativa) */}
        <View
          style={[
            styles.reasonContainer,
            {
              backgroundColor: palette.overlays.subtle,
              borderRadius: radius.sm,
              marginTop: spacing.sm,
              padding: spacing.sm,
            },
          ]}
        >
          <Text
            style={[
              styles.reasonLabel,
              {
                fontSize: typography.caption.fontSize,
                color: palette.neutrals[600],
                fontWeight: '600',
              },
            ]}
          >
            Por que isso é para você:
          </Text>
          <Text
            style={[
              styles.reasonText,
              {
                fontSize: typography.bodySm.fontSize,
                color: palette.text,
                marginTop: 4,
              },
            ]}
          >
            {recommendation.reason}
          </Text>
        </View>
      </View>

      {/* CTA */}
      <View
        style={[
          styles.cta,
          {
            backgroundColor: palette.primary,
            borderRadius: radius.sm,
            marginTop: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            styles.ctaText,
            {
              fontSize: typography.button.fontSize,
              fontWeight: typography.button.fontWeight,
            },
          ]}
        >
          {getCtaLabel(recommendation.type)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function getCtaLabel(type: string): string {
  const labels: Record<string, string> = {
    circle: 'Entrar no círculo',
    habit: 'Começar hábito',
    content: 'Ler conteúdo',
  };
  return labels[type] || 'Ver mais';
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {},
  title: {},
  description: {},
  reasonContainer: {},
  reasonLabel: {},
  reasonText: {},
  cta: {
    padding: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
  },
});

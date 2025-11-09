/**
 * Daily Insight Card Component
 * Card hero com dica diária personalizada gerada por IA
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography, borderRadius, shadows, gradients } from '@/theme';
import { DailyInsight } from '@/services/dailyInsight';

interface DailyInsightCardProps {
  insight: DailyInsight | null;
  loading?: boolean;
  onRefresh?: () => void;
  onActionPress?: () => void; // Botão "Conversar sobre isso"
}

export function DailyInsightCard({ insight, loading, onRefresh, onActionPress }: DailyInsightCardProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (insight) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [insight, fadeAnim]);

  if (loading) {
    return <DailyInsightSkeleton />;
  }

  if (!insight) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={gradients.pinkSoft} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          <View style={styles.emptyContent}>
            <Icon name="lightbulb-off-outline" size={48} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.emptyText}>Nenhuma dica disponível ainda</Text>
            {onRefresh && (
              <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                <Icon name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient colors={gradients.pinkSoft} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Icon name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.badgeText}>Dica do Dia</Text>
            </View>
          </View>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.refreshButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="refresh" size={20} color="rgba(255, 255, 255, 0.9)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Image
              source={require('@/assets/images/nat1.png')}
              style={styles.avatarImage}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel="Foto de Nathália Valente"
            />
          </View>
          <Text style={styles.avatarLabel}>Nathália Valente</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{insight.title}</Text>
          <Text style={styles.description} numberOfLines={4}>
            {insight.description}
          </Text>
        </View>

        {/* Call-to-Action */}
        <View style={styles.actionContainer}>
          <Text style={styles.actionable}>💡 {insight.actionable}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {onActionPress && (
            <TouchableOpacity style={styles.primaryButton} onPress={onActionPress} activeOpacity={0.8}>
              <Icon name="chat-processing" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Conversar sobre isso</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.scoreContainer}>
            <Icon name="chart-line" size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.scoreText}>{insight.relevance_score}% relevante para você</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

/**
 * Skeleton loader para o card
 */
function DailyInsightSkeleton() {
  const pulse = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.muted, colors.muted, colors.muted]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.skeletonContent}>
          <Animated.View style={[styles.skeletonBadge, { opacity }]} />
          <Animated.View style={[styles.skeletonAvatar, { opacity }]} />
          <Animated.View style={[styles.skeletonTitle, { opacity }]} />
          <Animated.View style={[styles.skeletonDescription, { opacity }]} />
          <Animated.View style={[styles.skeletonButton, { opacity }]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.dark.lg,
  },
  gradient: {
    padding: spacing.xl,
    minHeight: 380,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeContainer: {
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.dark.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.sans,
  },
  content: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primaryForeground,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.sans,
    lineHeight: 32,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.primaryForeground,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: typography.fontFamily.sans,
  },
  actionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionable: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primaryForeground,
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  buttonsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.dark.md,
  },
  primaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.sans,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreText: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: typography.fontFamily.sans,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontFamily: typography.fontFamily.sans,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  retryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primaryForeground,
    fontFamily: typography.fontFamily.sans,
  },
  // Skeleton styles
  skeletonContent: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  skeletonBadge: {
    width: 120,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.full,
  },
  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignSelf: 'center',
    marginVertical: spacing.md,
  },
  skeletonTitle: {
    width: '80%',
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  skeletonDescription: {
    width: '90%',
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  skeletonButton: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
});

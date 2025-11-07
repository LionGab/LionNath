/**
 * NathiaRecommendations - Tela de recomendações personalizadas
 *
 * Features:
 * - Lista de recomendações da Edge Function
 * - Filtros por tipo (círculos, hábitos, conteúdo)
 * - Pull-to-refresh para atualizar
 * - Navegação contextual para cada item
 * - Empty state quando não há recomendações
 * - Loading states
 *
 * Wireframe:
 * ┌─────────────────────────┐
 * │  Recomendações para     │ ← Header
 * │        Você 💡          │
 * ├─────────────────────────┤
 * │ [Filtros: Todos | ... ] │ ← Tabs
 * ├─────────────────────────┤
 * │                         │
 * │  [RecommendationCard]   │ ← List
 * │  [RecommendationCard]   │
 * │  [RecommendationCard]   │
 * │                         │
 * └─────────────────────────┘
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RecommendationCard } from '@/components/nathia/RecommendationCard';
import { useNathiaContext } from '@/contexts/NathiaContext';
import {
  nathiaClient,
  NathiaRecommendation,
  NathiaRecommendationsRequest,
} from '@/services/nathia-client';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { logger } from '@/lib/logger';

type FilterType = 'all' | 'circle' | 'habit' | 'content';

export default function NathiaRecommendations() {
  const navigation = useNavigation();
  const { context } = useNathiaContext();

  const [recommendations, setRecommendations] = useState<NathiaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

  useEffect(() => {
    loadRecommendations();
  }, [context?.userId]);

  const loadRecommendations = async () => {
    if (!context?.userId) return;

    try {
      setLoading(true);
      setError(null);

      const request: NathiaRecommendationsRequest = {
        userId: context.userId,
        context: {
          stage: context.stage,
          pregnancyWeek: context.pregnancyWeek,
          interests: context.concerns,
        },
      };

      const response = await nathiaClient.getRecommendations(request);

      // Ordena por prioridade
      const sorted = response.recommendations.sort((a, b) => b.priority - a.priority);

      setRecommendations(sorted);
    } catch (err) {
      logger.error('Erro ao carregar recomendações', err);
      setError('Não foi possível carregar as recomendações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  }, [context?.userId]);

  const handleRecommendationPress = (recommendation: NathiaRecommendation) => {
    logger.info('Recommendation pressed', { recommendation });

    // Navega para o item específico
    const screenMap: Record<string, string> = {
      circle: 'CircleDetail',
      habit: 'HabitDetail',
      content: 'ContentDetail',
    };

    const screen = screenMap[recommendation.type];
    if (screen) {
      // @ts-ignore
      navigation.navigate(screen, {
        id: recommendation.id,
        source: 'nathia-recommendations',
      });
    }
  };

  const handleImpressionTracking = (recommendationId: string) => {
    // Track impression for analytics
    logger.info('Recommendation impression', { recommendationId });
  };

  // Filtra recomendações
  const filteredRecommendations =
    filter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.type === filter);

  // Render filter tab
  const renderFilterTab = (type: FilterType, label: string) => {
    const isActive = filter === type;

    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.filterTab,
          {
            backgroundColor: isActive ? palette.primary : 'transparent',
            borderRadius: radius.full,
          },
        ]}
        onPress={() => setFilter(type)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Filtrar por ${label}`}
        accessibilityState={{ selected: isActive }}
      >
        <Text
          style={[
            styles.filterTabText,
            {
              fontSize: typography.bodySm.fontSize,
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#FFFFFF' : palette.text,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text
        style={[
          styles.emptyTitle,
          {
            fontSize: typography.headlineMd.fontSize,
            fontWeight: typography.headlineMd.fontWeight,
            color: palette.text,
          },
        ]}
      >
        Nenhuma recomendação ainda
      </Text>
      <Text
        style={[
          styles.emptyDescription,
          {
            fontSize: typography.bodyMd.fontSize,
            color: palette.neutrals[600],
            marginTop: spacing.sm,
          },
        ]}
      >
        Continue conversando com a NAT-IA para receber sugestões personalizadas!
      </Text>
    </View>
  );

  // Error state
  if (error && !refreshing) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: palette.background }]}
        edges={['top']}
      >
        <View style={styles.errorContainer}>
          <Text
            style={[
              styles.errorText,
              {
                fontSize: typography.bodyLg.fontSize,
                color: palette.feedback.danger,
              },
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: palette.primary,
                borderRadius: radius.md,
                marginTop: spacing.lg,
              },
            ]}
            onPress={loadRecommendations}
          >
            <Text
              style={[
                styles.retryButtonText,
                {
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                },
              ]}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Text
          style={[
            styles.headerTitle,
            {
              fontSize: typography.headlineXL.fontSize,
              fontWeight: typography.headlineXL.fontWeight,
              color: palette.text,
            },
          ]}
        >
          Recomendações para Você 💡
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            {
              fontSize: typography.bodyMd.fontSize,
              color: palette.neutrals[600],
              marginTop: spacing.xxs,
            },
          ]}
        >
          Sugestões personalizadas baseadas no seu perfil
        </Text>
      </View>

      {/* Filters */}
      <View
        style={[
          styles.filtersContainer,
          {
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        {renderFilterTab('all', 'Todos')}
        {renderFilterTab('circle', 'Círculos')}
        {renderFilterTab('habit', 'Hábitos')}
        {renderFilterTab('content', 'Conteúdos')}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                fontSize: typography.bodyMd.fontSize,
                color: palette.neutrals[600],
                marginTop: spacing.md,
              },
            ]}
          >
            Carregando recomendações...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecommendations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecommendationCard
              recommendation={item}
              onPress={handleRecommendationPress}
              onImpression={handleImpressionTracking}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={palette.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  headerTitle: {},
  headerSubtitle: {},
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterTabText: {},
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {},
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
  },
});

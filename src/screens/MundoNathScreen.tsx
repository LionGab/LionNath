/**
 * MundoNathScreen - Conteúdos "Em 5 Minutos"
 *
 * Feed de conteúdos rápidos usando API GET /trending-5min
 * Cards com resumos práticos e acionáveis
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { SUPABASE_CONFIG } from '@/config/api';
import { EmptyState } from '@/shared/components/EmptyState';

interface TrendingCard {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  reading_time_minutes: number;
  category: string;
  thumbnail_url?: string;
  content_url?: string;
}

export default function MundoNathScreen() {
  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;
  const [cards, setCards] = useState<TrendingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrendingCards = useCallback(async () => {
    try {
      setLoading(true);

      // Chamar API GET /trending-5min
      const response = await fetch(`${SUPABASE_CONFIG.URL}/functions/v1/trending-5min`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCards(data.cards || []);
    } catch (error) {
      console.error('Erro ao carregar trending:', error);
      Alert.alert('Erro', 'Não foi possível carregar os conteúdos');
      // Fallback: dados mockados para desenvolvimento
      setCards([
        {
          id: '1',
          title: 'Como aliviar enjoo matinal',
          summary: 'Dicas práticas para reduzir náuseas durante a gravidez',
          bullets: [
            'Coma pequenas refeições a cada 2-3 horas',
            'Evite alimentos gordurosos e picantes',
            'Beba água com gengibre ou chá de hortelã',
            'Mantenha biscoitos água e sal ao lado da cama',
            'Consulte seu médico se persistir',
          ],
          reading_time_minutes: 5,
          category: 'Saúde',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrendingCards();
  }, [loadTrendingCards]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrendingCards();
  }, [loadTrendingCards]);

  const handleCardPress = useCallback((card: TrendingCard) => {
    // Navegar para detalhes ou abrir conteúdo
    Alert.alert(card.title, card.summary);
  }, []);

  const renderCard = useCallback(
    ({ item }: { item: TrendingCard }) => (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: palette.surface,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: palette.neutrals[300],
          },
        ]}
        onPress={() => handleCardPress(item)}
        accessible={true}
        accessibilityLabel={`Card: ${item.title}`}
        accessibilityRole="button"
        accessibilityHint={`Tempo de leitura: ${item.reading_time_minutes} minutos`}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: palette.primary + '20',
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: palette.primary,
                    fontSize: typography.caption.fontSize,
                    fontWeight: '600',
                  },
                ]}
              >
                {item.category}
              </Text>
            </View>
            <View style={styles.timeBadge}>
              <Icon name="clock-outline" size={14} color={palette.neutrals[600]} />
              <Text
                style={[
                  styles.timeText,
                  {
                    color: palette.neutrals[600],
                    fontSize: typography.caption.fontSize,
                    marginLeft: 4,
                  },
                ]}
              >
                {item.reading_time_minutes} min
              </Text>
            </View>
          </View>
        </View>

        {/* Título */}
        <Text
          style={[
            styles.cardTitle,
            {
              color: palette.text,
              fontSize: typography.headlineSm.fontSize,
              fontWeight: typography.headlineSm.fontWeight,
              marginTop: spacing.sm,
              marginBottom: spacing.xs,
            },
          ]}
        >
          {item.title}
        </Text>

        {/* Resumo */}
        <Text
          style={[
            styles.cardSummary,
            {
              color: palette.neutrals[700],
              fontSize: typography.bodySm.fontSize,
              lineHeight: 20,
              marginBottom: spacing.md,
            },
          ]}
        >
          {item.summary}
        </Text>

        {/* Bullets */}
        {item.bullets && item.bullets.length > 0 && (
          <View style={styles.bulletsContainer}>
            {item.bullets.slice(0, 3).map((bullet, index) => (
              <View key={index} style={styles.bulletRow}>
                <View
                  style={[
                    styles.bulletDot,
                    {
                      backgroundColor: palette.accent,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      marginRight: spacing.sm,
                      marginTop: 6,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.bulletText,
                    {
                      color: palette.text,
                      fontSize: typography.bodySm.fontSize,
                      flex: 1,
                      lineHeight: 20,
                    },
                  ]}
                >
                  {bullet}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <View
          style={[
            styles.cardCTA,
            {
              backgroundColor: palette.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              marginTop: spacing.md,
              alignItems: 'center',
              minHeight: 44, // WCAG mínimo
            },
          ]}
        >
          <Text
            style={[
              styles.cardCTAText,
              {
                color: '#FFFFFF',
                fontSize: typography.button.fontSize,
                fontWeight: typography.button.fontWeight,
              },
            ]}
          >
            Ler em 5 minutos
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [palette, typography, spacing, radius, handleCardPress]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.surface,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: palette.neutrals[300],
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: palette.text, fontSize: typography.headlineMd.fontSize }]}>
          MundoNath
        </Text>
        <Text style={[styles.headerSubtitle, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
          Conteúdos em 5 min
        </Text>
      </View>

      {/* Lista de Cards */}
      {loading && cards.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={[styles.loadingText, { color: palette.neutrals[600], marginTop: spacing.md }]}>
            Carregando conteúdos...
          </Text>
        </View>
      ) : cards.length === 0 ? (
        <EmptyState
          emoji="📚"
          title="Nenhum conteúdo disponível"
          description="Os conteúdos serão atualizados em breve!"
          actionLabel="Atualizar"
          onAction={handleRefresh}
        />
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={palette.primary} />
          }
          showsVerticalScrollIndicator={false}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerSubtitle: {
    // Estilos aplicados inline
  },
  listContent: {
    padding: 16,
  },
  card: {
    // Estilos aplicados inline
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    // Estilos aplicados inline
  },
  categoryText: {
    // Estilos aplicados inline
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    // Estilos aplicados inline
  },
  cardTitle: {
    // Estilos aplicados inline
  },
  cardSummary: {
    // Estilos aplicados inline
  },
  bulletsContainer: {
    marginTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    // Estilos aplicados inline
  },
  bulletText: {
    // Estilos aplicados inline
  },
  cardCTA: {
    // Estilos aplicados inline
  },
  cardCTAText: {
    // Estilos aplicados inline
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    // Estilos aplicados inline
  },
});

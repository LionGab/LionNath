/**
 * Content Feed Screen - PROMPT 8
 *
 * Feed de conteúdos exclusivos da Natália Valente
 * Artigos, vídeos, áudios, posts com filtros e favoritos
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Input } from '@/components/Input';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import { supabase } from '@/services/supabase';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonPresets } from '@/shared/components/Skeleton';
import { useDebounce } from '@/hooks/useMemoizedCallback';

// Blue Theme Constants
const BLUE_THEME = {
  darkBlue: '#0A2540',
  deepBlue: '#0F3460',
  primaryBlue: '#3B82F6',
  lightBlue: '#60A5FA',
  skyBlue: '#93C5FD',
  mutedBlue: '#475569',
  white: '#FFFFFF',
  lightGray: '#F1F5F9',
  darkGray: '#94A3B8',
};

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: 'article' | 'video' | 'audio' | 'post';
  content_url: string;
  thumbnail_url: string | null;
  category: string | null;
  tags: string[] | null;
  author: string;
  is_featured: boolean;
  is_favorite: boolean;
}

const CATEGORIES = ['Bem-estar', 'Alimentação', 'Exercícios', 'Relacionamento', 'Preparação para o parto'];

function ContentFeedScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Debounce do input de busca para evitar filtros excessivos
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoizar loadContent para evitar recriação
  const loadContent = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar conteúdos
      const { data: items } = await supabase
        .from('content_items')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!items) return;

      // Buscar favoritos do usuário
      const { data: favorites } = await supabase.from('content_favorites').select('content_id').eq('user_id', user.id);

      const favoriteIds = new Set(favorites?.map((f) => f.content_id) || []);

      const contentWithFavorites = items.map((item) => ({
        ...item,
        is_favorite: favoriteIds.has(item.id),
      }));

      setContent(contentWithFavorites);
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Erro', 'Não foi possível carregar os conteúdos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Memoizar filtro de conteúdo para evitar recálculos desnecessários
  const filteredContent = useMemo(() => {
    let filtered = [...content];

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filtro por favoritos
    if (showFavoritesOnly) {
      filtered = filtered.filter((item) => item.is_favorite);
    }

    // Busca por texto (usando debounced value)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [content, debouncedSearchQuery, selectedCategory, showFavoritesOnly]);

  const toggleFavorite = useCallback(
    async (contentId: string, isFavorite: boolean) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        if (isFavorite) {
          // Remover dos favoritos
          await supabase.from('content_favorites').delete().eq('user_id', user.id).eq('content_id', contentId);
        } else {
          // Adicionar aos favoritos
          await supabase.from('content_favorites').insert({
            user_id: user.id,
            content_id: contentId,
          });
        }

        await loadContent();
      } catch (error) {
        console.error('Error toggling favorite:', error);
        Alert.alert('Erro', 'Não foi possível atualizar os favoritos');
      }
    },
    [loadContent]
  );

  // Memoizar renderItem para evitar recriação em cada render
  const renderContentItem = useCallback(
    ({ item }: { item: ContentItem }) => (
      <Card
        variant="elevated"
        style={styles.contentCard}
        onPress={() => navigation.navigate('ContentDetail' as any, { contentId: item.id })}
        accessibilityLabel={`${item.title} - ${item.type}`}
      >
        {item.thumbnail_url && (
          <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
        )}
        <View style={styles.contentInfo}>
          <View style={styles.headerRow}>
            <Badge variant="info" size="sm" style={styles.typeBadge}>
              {item.type === 'article' && '📄 Artigo'}
              {item.type === 'video' && '🎥 Vídeo'}
              {item.type === 'audio' && '🎧 Áudio'}
              {item.type === 'post' && '📝 Post'}
            </Badge>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id, item.is_favorite)}
              accessible={true}
              accessibilityLabel={item.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              style={styles.favoriteButton}
            >
              <Icon
                name={item.is_favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={item.is_favorite ? colors.destructive : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.contentTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.contentDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.category && <Text style={styles.contentCategory}>{item.category}</Text>}
        </View>
      </Card>
    ),
    [navigation, toggleFavorite]
  );

  // Memoizar keyExtractor
  const keyExtractor = useCallback((item: ContentItem) => item.id, []);

  // Memoizar handlers de filtro
  const handleCategoryFilter = useCallback(
    (category: string | null) => {
      setSelectedCategory(selectedCategory === category ? null : category);
    },
    [selectedCategory]
  );

  const handleToggleFavorites = useCallback(() => {
    setShowFavoritesOnly(!showFavoritesOnly);
  }, [showFavoritesOnly]);

  const handleClearFilters = useCallback(() => {
    setShowFavoritesOnly(false);
    setSelectedCategory(null);
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar conteúdos..."
          icon="magnify"
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !showFavoritesOnly && !selectedCategory && styles.filterChipActive]}
          onPress={handleClearFilters}
        >
          <Text style={[styles.filterChipText, !showFavoritesOnly && !selectedCategory && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, showFavoritesOnly && styles.filterChipActive]}
          onPress={handleToggleFavorites}
        >
          <Icon
            name="heart"
            size={16}
            color={showFavoritesOnly ? colors.primary : colors.mutedForeground}
            style={styles.filterIcon}
          />
          <Text style={[styles.filterChipText, showFavoritesOnly && styles.filterChipTextActive]}>Favoritos</Text>
        </TouchableOpacity>

        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
            onPress={() => handleCategoryFilter(category)}
          >
            <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content List */}
      {loading ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPresets.ContentCard key={i} />
          ))}
        </View>
      ) : filteredContent.length === 0 ? (
        <EmptyState
          emoji="📚"
          title="Nenhum conteúdo encontrado"
          description={
            showFavoritesOnly
              ? 'Você ainda não favoritou nenhum conteúdo. Explore e marque seus favoritos!'
              : searchQuery
                ? 'Não encontramos conteúdos com essa busca. Tente outro termo!'
                : 'Nenhum conteúdo disponível no momento. Em breve teremos novidades!'
          }
          actionLabel={showFavoritesOnly ? 'Ver todos' : searchQuery ? 'Limpar busca' : undefined}
          onAction={
            showFavoritesOnly ? () => setShowFavoritesOnly(false) : searchQuery ? () => setSearchQuery('') : undefined
          }
        />
      ) : (
        <FlatList
          data={filteredContent}
          renderItem={renderContentItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <EmptyState
              emoji="📚"
              title="Nenhum conteúdo encontrado"
              description="Tente ajustar os filtros ou buscar outro termo."
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.2)',
    marginRight: spacing.sm,
    minHeight: 40,
  },
  filterChipActive: {
    backgroundColor: BLUE_THEME.primaryBlue,
    borderColor: BLUE_THEME.primaryBlue,
    ...shadows.dark.sm,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.weights.medium as any,
  },
  filterChipTextActive: {
    color: BLUE_THEME.white,
    fontWeight: typography.weights.semibold as any,
  },
  filterIcon: {
    marginRight: spacing.xs,
  },
  contentList: {
    padding: spacing.lg,
  },
  contentCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: colors.muted,
  },
  contentInfo: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    marginRight: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  contentTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.foreground,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  contentDescription: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.sans,
  },
  contentCategory: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
});

// Memoizar componente para evitar re-renders desnecessários
export default React.memo(ContentFeedScreen);

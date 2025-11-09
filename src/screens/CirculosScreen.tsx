/**
 * CirculosScreen - Círculos de Apoio
 *
 * Feed de posts anônimos por padrão (is_anonymous=true)
 * Comunidade de apoio entre mães
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { supabase } from '@/services/supabase';
import { EmptyState } from '@/shared/components/EmptyState';

interface Post {
  id: string;
  content: string;
  is_anonymous: boolean;
  circle_id: string;
  circle_name: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
}

export default function CirculosScreen() {
  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar posts dos círculos (anônimos por padrão)
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          content,
          is_anonymous,
          created_at,
          likes_count,
          comments_count,
          circles!inner(name),
          post_likes!left(user_id)
        `
        )
        .eq('is_anonymous', true) // Apenas posts anônimos
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedPosts: Post[] =
        data?.map((post: any) => ({
          id: post.id,
          content: post.content,
          is_anonymous: post.is_anonymous,
          circle_id: post.circles?.id || '',
          circle_name: post.circles?.name || 'Círculo',
          created_at: post.created_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          user_liked: post.post_likes?.some((like: any) => like.user_id === user.id) || false,
        })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      Alert.alert('Erro', 'Não foi possível carregar os posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = useCallback(async () => {
    if (!newPostText.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Você precisa estar logada para postar');
        return;
      }

      // Buscar círculo padrão ou primeiro círculo
      const { data: circles } = await supabase.from('circles').select('id').limit(1);
      const circleId = circles?.[0]?.id;

      if (!circleId) {
        Alert.alert('Erro', 'Nenhum círculo disponível');
        return;
      }

      // Criar post anônimo por padrão
      const { error } = await supabase.from('posts').insert({
        content: newPostText.trim(),
        is_anonymous: true, // Anônimo por padrão
        circle_id: circleId,
        user_id: user.id,
        likes_count: 0,
        comments_count: 0,
      });

      if (error) throw error;

      setNewPostText('');
      setShowNewPost(false);
      loadPosts();
      Alert.alert('Sucesso', 'Post criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      Alert.alert('Erro', 'Não foi possível criar o post');
    }
  }, [newPostText, loadPosts]);

  const handleLike = useCallback(
    async (postId: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        if (post.user_liked) {
          // Remover like
          await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
          await supabase
            .from('posts')
            .update({ likes_count: Math.max(0, post.likes_count - 1) })
            .eq('id', postId);
        } else {
          // Adicionar like
          await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
          await supabase
            .from('posts')
            .update({ likes_count: post.likes_count + 1 })
            .eq('id', postId);
        }

        loadPosts();
      } catch (error) {
        console.error('Erro ao curtir post:', error);
      }
    },
    [posts, loadPosts]
  );

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <View
        style={[
          styles.postCard,
          {
            backgroundColor: palette.surface,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
      >
        {/* Header anônimo */}
        <View style={styles.postHeader}>
          <View style={[styles.anonymousAvatar, { backgroundColor: palette.primary }]}>
            <Text style={[styles.anonymousInitial, { color: '#FFFFFF' }]}>?</Text>
          </View>
          <View style={styles.postHeaderText}>
            <Text style={[styles.anonymousName, { color: palette.text, fontSize: typography.bodyMd.fontSize }]}>
              Mãe Anônima
            </Text>
            <Text style={[styles.postMeta, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
              {item.circle_name} • {formatTimeAgo(item.created_at)}
            </Text>
          </View>
        </View>

        {/* Conteúdo */}
        <Text style={[styles.postContent, { color: palette.text, fontSize: typography.bodyMd.fontSize }]}>
          {item.content}
        </Text>

        {/* Ações */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleLike(item.id)}
            accessible={true}
            accessibilityLabel={item.user_liked ? 'Descurtir post' : 'Curtir post'}
            accessibilityRole="button"
          >
            <Icon
              name={item.user_liked ? 'heart' : 'heart-outline'}
              size={20}
              color={item.user_liked ? palette.accent : palette.neutrals[600]}
            />
            <Text style={[styles.actionText, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
              {item.likes_count}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            accessible={true}
            accessibilityLabel="Comentar"
            accessibilityRole="button"
          >
            <Icon name="comment-outline" size={20} color={palette.neutrals[600]} />
            <Text style={[styles.actionText, { color: palette.neutrals[600], fontSize: typography.caption.fontSize }]}>
              {item.comments_count}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [palette, typography, spacing, radius, handleLike]
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
          Círculos
        </Text>
        <TouchableOpacity
          onPress={() => setShowNewPost(!showNewPost)}
          accessible={true}
          accessibilityLabel="Criar novo post"
          accessibilityRole="button"
        >
          <Icon name="plus-circle" size={28} color={palette.primary} />
        </TouchableOpacity>
      </View>

      {/* Novo Post */}
      {showNewPost && (
        <View
          style={[
            styles.newPostContainer,
            {
              backgroundColor: palette.surface,
              padding: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: palette.neutrals[300],
            },
          ]}
        >
          <TextInput
            style={[
              styles.newPostInput,
              {
                backgroundColor: palette.background,
                borderRadius: radius.md,
                padding: spacing.md,
                color: palette.text,
                fontSize: typography.bodyMd.fontSize,
                borderWidth: 1,
                borderColor: palette.neutrals[300],
                minHeight: 80,
              },
            ]}
            placeholder="Compartilhe algo com outras mães..."
            placeholderTextColor={palette.neutrals[500]}
            value={newPostText}
            onChangeText={setNewPostText}
            multiline
            maxLength={500}
            accessible={true}
            accessibilityLabel="Campo de texto para criar post"
          />
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: palette.primary,
                borderRadius: radius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                marginTop: spacing.sm,
                alignItems: 'center',
                minHeight: 44, // WCAG mínimo
              },
            ]}
            onPress={handleCreatePost}
            disabled={!newPostText.trim()}
            accessible={true}
            accessibilityLabel="Publicar post"
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.createButtonText,
                {
                  color: '#FFFFFF',
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                },
              ]}
            >
              Publicar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de Posts */}
      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: palette.neutrals[600] }]}>Carregando posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="Nenhum post ainda"
          description="Seja a primeira a compartilhar algo no círculo!"
          actionLabel="Criar primeiro post"
          onAction={() => setShowNewPost(true)}
        />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
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
  newPostContainer: {
    // Estilos aplicados inline
  },
  newPostInput: {
    // Estilos aplicados inline
  },
  createButton: {
    // Estilos aplicados inline
  },
  createButtonText: {
    // Estilos aplicados inline
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    // Estilos aplicados inline
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  anonymousAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  anonymousInitial: {
    fontSize: 18,
    fontWeight: '600',
  },
  postHeaderText: {
    flex: 1,
  },
  anonymousName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  postMeta: {
    // Estilos aplicados inline
  },
  postContent: {
    marginBottom: 12,
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
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

/**
 * Content Detail Screen - PROMPT 8
 *
 * Tela de detalhe de conteúdo com player de vídeo/áudio
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Share, Platform } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Video, Audio, ResizeMode } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Loading } from '@/shared/components/Loading';
import { colors, spacing, typography, borderRadius, shadows } from '@/theme';
import { supabase } from '@/services/supabase';
import { RootStackParamList } from '@/navigation/types';

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

type ContentDetailRouteProp = RouteProp<RootStackParamList, 'ContentDetail'>;

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
  is_favorite: boolean;
}

export default function ContentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ContentDetailRouteProp>();
  const { contentId } = route.params;

  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoRef, setVideoRef] = useState<Video | null>(null);
  const [audioRef, setAudioRef] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadContent();
    return () => {
      // Cleanup de players
      if (audioRef) {
        audioRef.unloadAsync();
      }
      if (videoRef) {
        videoRef.unloadAsync();
      }
    };
  }, [contentId]);

  const loadContent = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar conteúdo
      const { data: item } = await supabase.from('content_items').select('*').eq('id', contentId).single();

      if (!item) {
        Alert.alert('Erro', 'Conteúdo não encontrado');
        navigation.goBack();
        return;
      }

      // Verificar se é favorito
      const { data: favorite } = await supabase
        .from('content_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single();

      setContent({
        ...item,
        is_favorite: !!favorite,
      });
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Erro', 'Não foi possível carregar o conteúdo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !content) return;

      if (content.is_favorite) {
        // Remover dos favoritos
        await supabase.from('content_favorites').delete().eq('user_id', user.id).eq('content_id', contentId);
        setContent({ ...content, is_favorite: false });
      } else {
        // Adicionar aos favoritos
        await supabase.from('content_favorites').insert({
          user_id: user.id,
          content_id: contentId,
        });
        setContent({ ...content, is_favorite: true });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os favoritos');
    }
  };

  const handleShare = async () => {
    if (!content) return;

    const shareText = `${content.title}\n\n${content.description || ''}\n\nAcesse no app Nossa Maternidade`;

    try {
      // Web: usar Web Share API se disponível, senão copiar para clipboard
      if (Platform.OS === 'web') {
        // Verificar se navegador suporta Web Share API
        if (typeof (window as any)?.navigator !== 'undefined' && (window as any).navigator.share) {
          try {
            await (window as any).navigator.share({
              title: content.title,
              text: shareText,
            });
          } catch (shareError: any) {
            // Se o usuário cancelar, não fazer nada
            if (shareError.name === 'AbortError') {
              return;
            }
            throw shareError;
          }
        } else if (typeof (window as any)?.navigator !== 'undefined' && (window as any).navigator.clipboard) {
          // Fallback: copiar para clipboard
          await (window as any).navigator.clipboard.writeText(shareText);
          Alert.alert('Copiado!', 'Conteúdo copiado para a área de transferência');
        } else {
          // Último fallback: mostrar texto para copiar manualmente
          Alert.alert('Compartilhar', shareText);
        }
      } else {
        // Mobile: usar Share API do React Native
        try {
          await Share.share({
            message: shareText,
            title: content.title,
          });
        } catch (shareError: any) {
          // Ignorar erro se o usuário cancelar o compartilhamento
          if (shareError.message !== 'User did not share' && shareError.message !== 'User cancelled') {
            throw shareError;
          }
        }
      }
    } catch (error) {
      // Log apenas se não for cancelamento do usuário
      console.error('Error sharing:', error);
    }
  };

  const handlePlayVideo = async () => {
    if (!videoRef || !content) return;

    try {
      if (isPlaying) {
        await videoRef.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioRef || !content) return;

    try {
      const status = await audioRef.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await audioRef.pauseAsync();
          setIsPlaying(false);
        } else {
          await audioRef.playAsync();
          setIsPlaying(true);
        }
      } else {
        await audioRef.loadAsync({ uri: content.content_url });
        await audioRef.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio');
    }
  };

  useEffect(() => {
    if (content?.type === 'audio' && content.content_url) {
      Audio.Sound.createAsync({ uri: content.content_url }, { shouldPlay: false }).then(({ sound }) => {
        setAudioRef(sound);
      });
    }
  }, [content]);

  if (loading) {
    return <Loading message="Carregando conteúdo..." />;
  }

  if (!content) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Thumbnail ou Video Player */}
      {content.type === 'video' && content.content_url ? (
        <Video
          ref={setVideoRef}
          source={{ uri: content.content_url }}
          style={styles.media}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
            }
          }}
        />
      ) : content.thumbnail_url ? (
        <Image source={{ uri: content.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
      ) : null}

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Badge variant="info" size="md" style={styles.typeBadge}>
            {content.type === 'article' && '📄 Artigo'}
            {content.type === 'video' && '🎥 Vídeo'}
            {content.type === 'audio' && '🎧 Áudio'}
            {content.type === 'post' && '📝 Post'}
          </Badge>
          {content.category && <Text style={styles.category}>{content.category}</Text>}
        </View>

        <Text style={styles.title}>{content.title}</Text>

        {content.author && <Text style={styles.author}>Por {content.author}</Text>}

        {content.description && <Text style={styles.description}>{content.description}</Text>}

        {/* Player de Áudio */}
        {content.type === 'audio' && content.content_url && (
          <Card variant="outlined" style={styles.audioPlayer}>
            <TouchableOpacity
              style={styles.audioControls}
              onPress={handlePlayAudio}
              accessible={true}
              accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
            >
              <Icon name={isPlaying ? 'pause-circle' : 'play-circle'} size={48} color={colors.primary} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <View style={styles.tags}>
            {content.tags.map((tag, index) => (
              <Badge key={index} variant="info" size="sm" style={styles.tag}>
                {tag}
              </Badge>
            ))}
          </View>
        )}

        {/* Ações */}
        <View style={styles.actions}>
          <Button
            variant={content.is_favorite ? 'primary' : 'outline'}
            icon={content.is_favorite ? 'heart' : 'heart-outline'}
            onPress={toggleFavorite}
            accessibilityLabel={content.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            style={styles.actionButton}
          >
            {content.is_favorite ? 'Favoritado' : 'Favoritar'}
          </Button>

          <Button
            variant="outline"
            icon="share-variant"
            onPress={handleShare}
            accessibilityLabel="Compartilhar conteúdo"
            style={styles.actionButton}
          >
            Compartilhar
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  media: {
    width: '100%',
    height: 250,
    backgroundColor: colors.muted,
  },
  thumbnail: {
    width: '100%',
    height: 250,
    backgroundColor: colors.muted,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  typeBadge: {
    marginRight: spacing.sm,
  },
  category: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.sans,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    marginBottom: spacing.sm,
    fontFamily: typography.fontFamily.sans,
  },
  author: {
    fontSize: typography.sizes.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.sans,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    lineHeight: 24,
    marginBottom: spacing.xl,
    fontFamily: typography.fontFamily.sans,
  },
  audioPlayer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  audioControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tag: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});


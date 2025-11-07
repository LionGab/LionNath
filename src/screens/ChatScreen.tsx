import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MessageItem } from '@/components/chat/MessageItem';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { MessageSkeleton } from '@/components/chat/MessageSkeleton';
import { Message, useChatOptimized } from '@/hooks/useChatOptimized';
import { borderRadius, colors, spacing, typography, shadows } from '@/theme';
import { EmptyState } from '@/shared/components/EmptyState';
import { logger } from '@/utils/logger';
import { useTheme } from '@/contexts/ThemeContext';

// Definição de ações rápidas
interface QuickAction {
  icon: string;
  text: string;
  message: string;
  isUrgent?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  { icon: '🤢', text: 'Enjoo matinal', message: 'Enjoo está me incomodando muito de manhã. Como posso aliviar?' },
  { icon: '💤', text: 'Não consigo dormir', message: 'Não consigo dormir bem durante a gravidez. O que posso fazer?' },
  { icon: '🍽️', text: 'Receitas', message: 'Quais receitas saudáveis são recomendadas para gestantes?' },
  { icon: '📅', text: 'Próxima consulta', message: 'Quando devo ir para a minha próxima consulta pré-natal?' },
  { icon: '🤰', text: 'Exercícios', message: 'Quais exercícios físicos são seguros para fazer durante a gravidez?' },
  { icon: '🚨', text: 'Preocupada', message: 'Tenho alguns sintomas e estou preocupada. O que fazer?', isUrgent: true },
];

// Componente memoizado para ações rápidas
interface QuickActionButtonProps {
  action: QuickAction;
  isDisabled: boolean;
  onPress: (action: QuickAction) => void;
}

const QuickActionButton = React.memo<QuickActionButtonProps>(({ action, isDisabled, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(action);
  }, [action, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.quickActionButton,
        action.isUrgent && styles.quickActionButtonUrgent,
        isDisabled && styles.quickActionButtonDisabled,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      accessible={true}
      accessibilityLabel={`Ação rápida: ${action.text}`}
      accessibilityRole="button"
      accessibilityHint={isDisabled ? 'Aguarde a resposta da assistente' : `Envia mensagem sobre ${action.text}`}
      accessibilityState={{ disabled: isDisabled }}
      activeOpacity={0.7}
    >
      <Text style={styles.quickActionIcon}>{action.icon}</Text>
      <Text
        style={[
          styles.quickActionText,
          action.isUrgent && styles.quickActionTextUrgent,
          isDisabled && styles.quickActionTextDisabled,
        ]}
        numberOfLines={1}
      >
        {action.text}
      </Text>
    </TouchableOpacity>
  );
});
QuickActionButton.displayName = 'QuickActionButton';

export default function ChatScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const { messages, loading, initialLoading, error, sendMessage, resetChat, reloadHistory, userContext } =
    useChatOptimized();

  // Scroll automático ao enviar mensagem (FlatList inverted)
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length, loading]);

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadHistory();
    } catch (error) {
      logger.error('Erro ao recarregar histórico', {}, error);
    } finally {
      setRefreshing(false);
    }
  }, [reloadHistory]);

  // Handler para envio de mensagem
  const handleSend = useCallback(() => {
    if (!inputText.trim() || loading) return;

    const content = inputText.trim();
    setInputText('');
    inputRef.current?.blur();
    sendMessage(content);
  }, [inputText, loading, sendMessage]);

  // Handler para ações rápidas
  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      if (loading || initialLoading) return;

      inputRef.current?.blur();
      sendMessage(action.message);
    },
    [loading, initialLoading, sendMessage]
  );

  // Handler para botão SOS
  const handleEmergency = useCallback(() => {
    Alert.alert(
      '🚨 Emergência',
      'Você será direcionado para ligar para o SAMU (192).\n\nSe você está com sintomas graves, ligue imediatamente ou procure um hospital!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ligar Agora',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:192'),
        },
      ]
    );
  }, []);

  // Filtrar ações rápidas baseado no contexto do usuário
  const filteredQuickActions = useMemo(() => {
    // Se não tiver contexto, retorna todas as ações
    if (!userContext) return QUICK_ACTIONS;

    // Filtrar baseado no tipo de usuário
    if (userContext.type === 'gestante') {
      return QUICK_ACTIONS;
    } else if (userContext.type === 'mae') {
      // Ações específicas para mães
      return QUICK_ACTIONS.filter(
        (action) => !action.message.includes('gravidez') && !action.message.includes('gestantes')
      );
    }

    return QUICK_ACTIONS;
  }, [userContext]);

  // Handler para clique em mensagem (ajuste se necessário)
  const handleMessagePress = useCallback((message: Message) => {
    // Exemplo: alert(message.content);
  }, []);

  // Renderização da mensagem
  const renderMessageItem = useCallback(
    ({ item }: { item: Message }) => <MessageItem message={item} onPress={handleMessagePress} />,
    [handleMessagePress]
  );

  // Key extractor otimizado
  const keyExtractor = useCallback((item: Message) => String(item.id), []);

  // Renderizar indicador de digitação
  const renderTypingIndicator = useCallback(() => {
    if (!loading) return null;
    return <TypingIndicator />;
  }, [loading]);

  // Renderizar mensagem de erro
  const renderError = useCallback(() => {
    if (!error) return null;

    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={20} color={colors.destructive} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }, [error]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          accessibilityHint="Retorna para a tela anterior"
        >
          <Text style={styles.headerBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversar</Text>
        <TouchableOpacity
          onPress={handleEmergency}
          accessible={true}
          accessibilityLabel="Botão de emergência"
          accessibilityRole="button"
          accessibilityHint="Ligar para SAMU 192 em caso de emergência médica"
        >
          <Text style={styles.headerEmergency}>🚨 SOS</Text>
        </TouchableOpacity>
      </View>

      {initialLoading ? (
        <View
          style={styles.loadingContainer}
          accessible={true}
          accessibilityLabel="Carregando conversa"
          accessibilityHint="Aguarde enquanto suas mensagens são carregadas"
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando conversa...</Text>
          <View style={styles.skeletonsContainer}>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </View>
        </View>
      ) : messages.length === 0 ? (
        <EmptyState
          emoji="💬"
          title="Nenhuma mensagem ainda"
          description="Comece uma conversa com a NathIA! Ela está aqui para te ouvir e apoiar."
          actionLabel="Enviar primeira mensagem"
          onAction={() => inputRef.current?.focus()}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          ListHeaderComponent={renderTypingIndicator}
          ListFooterComponent={renderError}
          ListEmptyComponent={
            <EmptyState emoji="💬" title="Nenhuma mensagem ainda" description="Comece uma conversa com a NathIA!" />
          }
          keyExtractor={keyExtractor}
          inverted
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          contentContainerStyle={styles.messageList}
          accessible={true}
          accessibilityLabel="Lista de mensagens"
          accessibilityHint="Role para ver mais mensagens. Arraste para baixo para atualizar"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
            />
          }
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      )}

      {/* Ações rápidas */}
      {!initialLoading && filteredQuickActions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
          contentContainerStyle={styles.quickActionsContent}
        >
          {filteredQuickActions.map((action) => (
            <QuickActionButton
              key={action.text}
              action={action}
              isDisabled={loading || initialLoading}
              onPress={handleQuickAction}
            />
          ))}
        </ScrollView>
      )}

      {/* Input de mensagem */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.mutedForeground}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading && !initialLoading}
          accessible={true}
          accessibilityLabel="Campo de texto para digitar mensagem"
          accessibilityHint="Digite sua pergunta ou mensagem aqui"
        />
        <TouchableOpacity
          style={styles.sendButtonWrapper}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
          accessible={true}
          accessibilityLabel="Enviar mensagem"
          accessibilityRole="button"
          accessibilityHint={
            !inputText.trim() ? 'Digite uma mensagem para enviar' : 'Envia sua mensagem para a assistente virtual'
          }
        >
          <LinearGradient
            colors={
              !inputText.trim() || loading
                ? [colors.muted, colors.muted]
                : [theme.colors.primary, theme.colors.primary + 'CC']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          >
            <Icon name={loading ? 'loading' : 'send'} size={24} color={colors.background} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 197, 253, 0.15)',
    ...shadows.dark.sm,
  },
  headerBack: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium as any,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
    fontFamily: typography.fontFamily.sans,
  },
  headerEmergency: {
    fontSize: typography.sizes.base,
    color: colors.destructive,
    fontWeight: typography.weights.bold as any,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  messageList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    color: colors.mutedForeground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButtonWrapper: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.dark.md,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.destructive + '10',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.destructive,
  },
  quickActionsContainer: {
    maxHeight: 80,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickActionsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.2)',
    marginRight: spacing.sm,
    minHeight: 44,
    ...shadows.dark.sm,
  },
  quickActionButtonUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
    fontWeight: typography.weights.semibold as any,
    fontFamily: typography.fontFamily.sans,
  },
  quickActionTextUrgent: {
    color: colors.destructive,
    fontWeight: typography.weights.bold as any,
  },
  quickActionButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.muted,
  },
  quickActionTextDisabled: {
    color: colors.mutedForeground,
  },
  skeletonsContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
});


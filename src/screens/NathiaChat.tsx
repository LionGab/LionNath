/**
 * NathiaChat - Tela principal de conversação com NAT-IA
 *
 * Features:
 * - Interface de chat conversacional completa
 * - Input com sugestões rápidas
 * - Botão SOS sempre visível
 * - Typing indicator durante resposta
 * - Renderiza actions contextuais
 * - Histórico local (AsyncStorage)
 * - Scroll automático para nova mensagem
 * - Performance otimizada (60fps)
 * - Acessibilidade completa
 * - Design System v1 aplicado
 *
 * Wireframe:
 * ┌─────────────────────────┐
 * │  NAT-IA 💙        [SOS] │ ← Header
 * ├─────────────────────────┤
 * │                         │
 * │  [Mensagens do chat]    │ ← ScrollView
 * │  - User bubble (right)  │
 * │  - Assistant (left)     │
 * │  - Actions (buttons)    │
 * │                         │
 * ├─────────────────────────┤
 * │ [Quick Replies chips]   │ ← Sugestões
 * ├─────────────────────────┤
 * │ [Input] [Send]          │ ← Input bar
 * └─────────────────────────┘
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AccessibilityInfo,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNathia } from '@/hooks/useNathia';
import { useNathiaActions } from '@/hooks/useNathiaActions';
import { useNathiaContext } from '@/contexts/NathiaContext';
import { ChatMessage } from '@/components/nathia/ChatMessage';
import { SOSButton } from '@/components/nathia/SOSButton';
import { QuickReplies, getContextualSuggestions } from '@/components/nathia/QuickReplies';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Badge, BadgeVariant } from '@/components/Badge';
import { Toast, ToastType } from '@/shared/components/Toast';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export default function NathiaChat() {
  const { context } = useNathiaContext();
  const { messages, loading, error, sendMessage, isTyping, suggestedReplies, contextUpdate } = useNathia({
    userId: context?.userId || '',
    stage: context?.stage,
    pregnancyWeek: context?.pregnancyWeek,
    mood: context?.mood,
    concerns: context?.concerns,
  });

  const { processAction } = useNathiaActions();

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const lastRiskLevelRef = useRef<'low' | 'medium' | 'high' | 'critical' | null>(null);

  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!error) {
      return;
    }

    setToastMessage(error);
    setToastType('error');
    setToastVisible(true);
  }, [error]);

  useEffect(() => {
    const riskLevel = contextUpdate?.riskLevel ?? null;

    if (riskLevel === lastRiskLevelRef.current) {
      return;
    }

    lastRiskLevelRef.current = riskLevel;

    if (!riskLevel) {
      return;
    }

    if (riskLevel === 'high' || riskLevel === 'critical') {
      setToastMessage(
        riskLevel === 'critical'
          ? 'Estou percebendo sinais importantes. Vamos pausar e buscar apoio imediato, combinado?'
          : 'Senti que precisamos de atenção extra. Vou te guiar com cuidado agora 💜'
      );
      setToastType(riskLevel === 'critical' ? 'error' : 'warning');
      setToastVisible(true);
    }
  }, [contextUpdate?.riskLevel]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || loading) {
      return;
    }

    const text = inputText.trim();
    setInputText('');

    await sendMessage(text);

    AccessibilityInfo.announceForAccessibility('Mensagem enviada');
  }, [inputText, loading, sendMessage]);

  const handleQuickReply = useCallback(
    async (suggestion: string) => {
      await sendMessage(suggestion);
    },
    [sendMessage]
  );

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    // TODO: Send feedback to analytics
    console.log('Feedback:', messageId, feedback);
  };

  // Sugestões contextuais ou do backend
  const displayedSuggestions =
    suggestedReplies.length > 0
      ? suggestedReplies
      : getContextualSuggestions({
          stage: context?.stage,
          pregnancyWeek: context?.pregnancyWeek,
          concerns: context?.concerns,
        });

  const hasSuggestions = displayedSuggestions.length > 0;

  const inputTextStyle = useMemo<TextStyle>(() => {
    const baseStyle = StyleSheet.flatten<TextStyle>(styles.inputField);

    return {
      ...baseStyle,
      color: palette.text,
      fontSize: typography.bodyMd.fontSize,
    };
  }, [palette.text, typography.bodyMd.fontSize]);

  // TOAST HANDLERS
  const handleToastClose = useCallback(() => {
    setToastVisible(false);
    setToastMessage('');
  }, []);

  const moodLabel = useMemo(() => {
    if (!contextUpdate?.mood) {
      return null;
    }

    return contextUpdate.mood.charAt(0).toUpperCase() + contextUpdate.mood.slice(1);
  }, [contextUpdate?.mood]);

  const riskBadgeVariant = useMemo<BadgeVariant>(() => {
    switch (contextUpdate?.riskLevel) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  }, [contextUpdate?.riskLevel]);

  const riskBadgeLabel = useMemo(() => {
    switch (contextUpdate?.riskLevel) {
      case 'critical':
        return 'Risco crítico';
      case 'high':
        return 'Risco alto';
      case 'medium':
        return 'Atenção moderada';
      case 'low':
        return 'Tudo sob controle';
      default:
        return null;
    }
  }, [contextUpdate?.riskLevel]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <Toast type={toastType} message={toastMessage} visible={toastVisible} onDismiss={handleToastClose} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: palette.surface,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: palette.primary, borderRadius: radius.sm }]}>
              <Text style={styles.avatarText}>N</Text>
            </View>
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    fontSize: typography.headlineSm.fontSize,
                    fontWeight: typography.headlineSm.fontWeight,
                    color: palette.text,
                  },
                ]}
              >
                NAT-IA
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    fontSize: typography.caption.fontSize,
                    color: palette.neutrals[600],
                  },
                ]}
              >
                Sua assistente de maternidade
              </Text>
            </View>
          </View>

          <SOSButton style={styles.sosButton} />
        </View>

        {contextUpdate && (
          <Card
            variant="outlined"
            icon="heart"
            title="Como você está se sentindo"
            style={styles.contextCard}
            contentStyle={styles.contextCardContent}
          >
            <View style={styles.contextBadges}>
              {moodLabel && (
                <Badge variant="info" size="sm">
                  Humor: {moodLabel}
                </Badge>
              )}
              {riskBadgeLabel && (
                <Badge variant={riskBadgeVariant} size="sm">
                  {riskBadgeLabel}
                </Badge>
              )}
            </View>
            {contextUpdate.needsModeration && (
              <Text
                style={[
                  styles.contextHelper,
                  {
                    color: palette.neutrals[600],
                    fontSize: typography.bodySm.fontSize,
                    lineHeight: typography.bodySm.lineHeight,
                  },
                ]}
              >
                Estou sinalizando nossa equipe de apoio para acompanhar você de perto, tá bem?
              </Text>
            )}
          </Card>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatMessage message={item} onActionPress={processAction} onFeedback={handleFeedback} />
          )}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyText,
                  {
                    fontSize: typography.bodyLg.fontSize,
                    color: palette.neutrals[600],
                  },
                ]}
              >
                Olá! Sou a NAT-IA. Como posso te ajudar hoje?
              </Text>
            </View>
          )}
          ListFooterComponent={() =>
            isTyping ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator color={palette.primary} />
                <Text
                  style={[
                    styles.typingText,
                    {
                      fontSize: typography.bodySm.fontSize,
                      color: palette.neutrals[600],
                      marginLeft: spacing.xs,
                    },
                  ]}
                >
                  NAT-IA está digitando...
                </Text>
              </View>
            ) : null
          }
        />

        {/* Quick Replies */}
        {!loading && messages.length > 0 && hasSuggestions && (
          <Card variant="flat" padding="sm" style={styles.suggestionsCard} contentStyle={styles.suggestionsContent}>
            <QuickReplies suggestions={displayedSuggestions} onSelect={handleQuickReply} disabled={loading} />
          </Card>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: palette.surface,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <Input
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem..."
            accessibilityLabel="Campo de texto da mensagem"
            accessibilityHint="Digite sua mensagem para NAT-IA"
            multiline
            numberOfLines={4}
            maxLength={1000}
            editable={!loading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            containerStyle={styles.inputWrapper}
            inputStyle={inputTextStyle}
          />

          <Button
            variant="primary"
            size="sm"
            icon="send"
            accessibilityLabel="Enviar mensagem"
            accessibilityHint="Enviar mensagem para NAT-IA"
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            loading={loading}
            style={styles.sendButton}
          >
            Enviar
          </Button>
        </View>

        {/* Error Message */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: palette.feedback.danger }]}>
            <Text style={[styles.errorText, { fontSize: typography.bodySm.fontSize }]}>{error}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {},
  headerSubtitle: {},
  sosButton: {
    width: 48,
    height: 48,
  },
  messagesList: {
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingText: {},
  contextCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  contextCardContent: {
    gap: 12,
  },
  contextBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contextHelper: {
    fontWeight: '500',
  },
  suggestionsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  suggestionsContent: {
    paddingVertical: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 0,
  },
  inputField: {
    minHeight: 48,
    maxHeight: 140,
    paddingVertical: 12,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginLeft: 8,
    minWidth: 96,
  },
  errorBanner: {
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
  },
});

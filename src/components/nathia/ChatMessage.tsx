/**
 * ChatMessage - Renderiza mensagem individual no chat
 *
 * Features:
 * - Renderização diferenciada user/assistant
 * - Suporte markdown básico (bold, italic, links)
 * - Actions como botões contextuais
 * - Feedback (thumbs up/down)
 * - Acessibilidade completa
 * - Design System v1 aplicado
 *
 * @example
 * <ChatMessage
 *   message={message}
 *   onActionPress={handleAction}
 *   onFeedback={handleFeedback}
 * />
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { Message } from '@/hooks/useNathia';
import { NathiaAction } from '@/services/nathia-client';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

interface ChatMessageProps {
  message: Message;
  onActionPress?: (action: NathiaAction) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

export function ChatMessage({ message, onActionPress, onFeedback }: ChatMessageProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);

  const isUser = message.role === 'user';
  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    setFeedbackGiven(feedback);
    onFeedback?.(message.id, feedback);

    // Announce feedback para screen readers
    AccessibilityInfo.announceForAccessibility(
      feedback === 'positive' ? 'Feedback positivo registrado' : 'Feedback negativo registrado'
    );
  };

  // Renderiza texto com markdown básico
  const renderFormattedText = (text: string) => {
    // TODO: Implementar parser markdown mais completo
    // Por enquanto, renderiza como texto simples
    return text;
  };

  return (
    <View
      style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${isUser ? 'Você' : 'NAT-IA'}: ${message.content}`}
    >
      {/* Avatar/Indicator */}
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: palette.primary }]} accessible={false}>
          <Text style={styles.avatarText}>N</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {/* Message Bubble */}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser ? palette.primary : palette.surface,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                color: isUser ? '#FFFFFF' : palette.text,
                fontSize: typography.bodyMd.fontSize,
                lineHeight: typography.bodyMd.lineHeight,
              },
            ]}
          >
            {renderFormattedText(message.content)}
          </Text>
        </View>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            {
              color: palette.neutrals[500],
              fontSize: typography.caption.fontSize,
              textAlign: isUser ? 'right' : 'left',
            },
          ]}
          accessible={false}
        >
          {formatTimestamp(message.timestamp)}
        </Text>

        {/* Actions (apenas para mensagens da assistente) */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {message.actions.map((action, index) => (
              <TouchableOpacity
                key={`${action.type}-${index}`}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: palette.accent,
                    borderRadius: radius.sm,
                  },
                ]}
                onPress={() => onActionPress?.(action)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                accessibilityHint={`Ação: ${action.type}`}
              >
                <Text
                  style={[
                    styles.actionText,
                    {
                      fontSize: typography.button.fontSize,
                      fontWeight: typography.button.fontWeight,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Feedback (apenas para mensagens da assistente) */}
        {!isUser && onFeedback && (
          <View style={styles.feedbackContainer}>
            <TouchableOpacity
              style={[styles.feedbackButton, feedbackGiven === 'positive' && styles.feedbackActive]}
              onPress={() => handleFeedback('positive')}
              disabled={feedbackGiven !== null}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Feedback positivo"
              accessibilityState={{ disabled: feedbackGiven !== null }}
            >
              <Text style={styles.feedbackIcon}>👍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feedbackButton, feedbackGiven === 'negative' && styles.feedbackActive]}
              onPress={() => handleFeedback('negative')}
              disabled={feedbackGiven !== null}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Feedback negativo"
              accessibilityState={{ disabled: feedbackGiven !== null }}
            >
              <Text style={styles.feedbackIcon}>👎</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    maxWidth: '80%',
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontFamily: 'System',
  },
  timestamp: {
    marginTop: 4,
    marginHorizontal: 4,
  },
  actionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
  },
  feedbackContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  feedbackButton: {
    padding: 8,
    opacity: 0.5,
  },
  feedbackActive: {
    opacity: 1,
  },
  feedbackIcon: {
    fontSize: 18,
  },
});

function formatTimestamp(date: Date): string {
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

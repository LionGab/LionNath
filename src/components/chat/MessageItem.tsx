import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { borderRadius, colors, spacing, typography } from '@/theme';

export interface MessageItemProps {
  message: {
    id: string | number;
    content: string;
    role: string;
  };
  onPress?: (message: { id: string | number; content: string; role: string }) => void;
}

export const MessageItem = React.memo<MessageItemProps>(({ message, onPress }) => {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      accessible={true}
      accessibilityLabel={isUser ? 'Sua mensagem' : 'Mensagem da assistente'}
      accessibilityRole="text"
      accessibilityHint={message.content.substring(0, 100)}
    >
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>{message.content}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: typography.sizes.base,
    lineHeight: 22,
    color: colors.foreground,
  },
  userText: {
    color: colors.primaryForeground,
  },
  assistantText: {
    color: colors.foreground,
  },
});

MessageItem.displayName = 'MessageItem';


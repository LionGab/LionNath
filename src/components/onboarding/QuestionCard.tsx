/**
 * QuestionCard - Card de pergunta para onboarding
 *
 * Exibe a pergunta atual com tipografia clara e acessível
 *
 * @example
 * <QuestionCard
 *   question="Em que trimestre você está?"
 *   questionNumber={1}
 *   totalQuestions={3}
 * />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { onboardingTheme } from '@/theme/onboarding';
import { createShadow } from '@/utils/shadowHelper';

export interface QuestionCardProps {
  question: string;
  questionNumber?: number;
  totalQuestions?: number;
  accessibilityLabel?: string;
}

export function QuestionCard({ question, questionNumber, totalQuestions, accessibilityLabel }: QuestionCardProps) {
  const theme = onboardingTheme;

  return (
    <View
      style={[
        styles.card,
        {
          padding: theme.spacing.questionCardPadding,
          borderRadius: theme.borderRadius.card,
          backgroundColor: onboardingTheme.colors.optionDefault.background,
        },
        createShadow(theme.shadows.card),
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || question}
    >
      {questionNumber && totalQuestions && (
        <Text
          style={[
            styles.progressText,
            {
              fontSize: theme.typography?.progress?.fontSize || 12,
              color: theme.typography?.progress?.color || theme.colors.optionDefault.text,
              marginBottom: theme.spacing.optionGap,
            },
          ]}
          accessible={false}
        >
          Pergunta {questionNumber} de {totalQuestions}
        </Text>
      )}
      <Text
        style={[
          styles.questionText,
          {
            fontSize: theme.typography?.question?.fontSize || 24,
            fontWeight: theme.typography?.question?.fontWeight || '500',
            lineHeight: theme.typography?.question?.lineHeight || 32,
            color: theme.typography?.question?.color || theme.colors.optionDefault.text,
          },
        ]}
      >
        {question}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  } as ViewStyle,
  progressText: {
    textAlign: 'left',
  } as TextStyle,
  questionText: {
    textAlign: 'left',
  } as TextStyle,
});

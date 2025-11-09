/**
 * ReviewAnswersScreen - Tela de revisão de respostas
 *
 * Permite revisar respostas antes de finalizar onboarding
 * Opção de editar respostas individuais
 *
 * @example
 * <ReviewAnswersScreen
 *   questions={questions}
 *   answers={answers}
 *   onEdit={handleEdit}
 *   onConfirm={handleConfirm}
 * />
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Question } from '@/types/onboarding-questions';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { onboardingTheme } from '@/theme/onboarding';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface ReviewAnswersScreenProps {
  questions?: Question[];
  answers?: Record<string, string | string[]>;
  onEdit?: (questionId: string) => void;
  onConfirm?: () => void;
}

export function ReviewAnswersScreen({ questions = [], answers = {}, onEdit, onConfirm }: ReviewAnswersScreenProps) {
  const navigation = useNavigation();
  const { palette, spacing } = nossaMaternidadeDesignTokens;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      navigation.navigate('Home' as never);
    }
  };

  const getAnswerLabel = (question: Question, answer: string | string[]): string => {
    if (Array.isArray(answer)) {
      return answer
        .map((optionId) => {
          const option = question.options.find((opt) => opt.id === optionId);
          return option?.label || optionId;
        })
        .join(', ');
    }

    const option = question.options.find((opt) => opt.id === answer);
    return option?.label || answer;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: palette.text }]}>Revisar Respostas</Text>
        <Text style={[styles.subtitle, { color: palette.neutrals[600] }]}>
          Confira suas respostas antes de finalizar
        </Text>

        <View style={styles.answersContainer}>
          {questions.map((question) => {
            const answer = answers[question.id];
            if (!answer) return null;

            return (
              <View key={question.id} style={styles.answerCard}>
                <View style={styles.answerHeader}>
                  <Text style={[styles.questionText, { color: palette.text }]}>{question.text}</Text>
                  {onEdit && (
                    <TouchableOpacity
                      onPress={() => onEdit(question.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar resposta de: ${question.text}`}
                    >
                      <Text style={[styles.editButton, { color: palette.primary }]}>Editar</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.answerText, { color: palette.neutrals[700] }]}>
                  {getAnswerLabel(question, answer)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.buttonsContainer}>
          <OnboardingButton
            label="Confirmar"
            onPress={handleConfirm}
            accessibilityLabel="Confirmar respostas e finalizar onboarding"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: nossaMaternidadeDesignTokens.spacing.lg,
  },
  title: {
    fontSize: nossaMaternidadeDesignTokens.typography.headlineLg.fontSize,
    fontWeight: nossaMaternidadeDesignTokens.typography.headlineLg.fontWeight,
    marginBottom: nossaMaternidadeDesignTokens.spacing.sm,
  },
  subtitle: {
    fontSize: nossaMaternidadeDesignTokens.typography.bodyMd.fontSize,
    marginBottom: nossaMaternidadeDesignTokens.spacing.xl,
  },
  answersContainer: {
    gap: nossaMaternidadeDesignTokens.spacing.md,
    marginBottom: nossaMaternidadeDesignTokens.spacing.xl,
  },
  answerCard: {
    backgroundColor: nossaMaternidadeDesignTokens.palette.surface,
    padding: nossaMaternidadeDesignTokens.spacing.lg,
    borderRadius: onboardingTheme.borderRadius.card,
    borderWidth: 1,
    borderColor: nossaMaternidadeDesignTokens.palette.neutrals[200],
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: nossaMaternidadeDesignTokens.spacing.sm,
  },
  questionText: {
    fontSize: nossaMaternidadeDesignTokens.typography.bodyMd.fontSize,
    fontWeight: nossaMaternidadeDesignTokens.typography.bodyMd.fontWeight,
    flex: 1,
    marginRight: nossaMaternidadeDesignTokens.spacing.md,
  },
  editButton: {
    fontSize: nossaMaternidadeDesignTokens.typography.bodySm.fontSize,
    fontWeight: '600',
  },
  answerText: {
    fontSize: nossaMaternidadeDesignTokens.typography.bodyLg.fontSize,
  },
  buttonsContainer: {
    marginTop: nossaMaternidadeDesignTokens.spacing.xl,
  },
});

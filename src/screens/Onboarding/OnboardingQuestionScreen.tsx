/**
 * OnboardingQuestionScreen - Tela principal de perguntas do onboarding
 *
 * Exibe perguntas uma por vez com opções clicáveis
 * Gerencia navegação entre perguntas e persistência de respostas
 *
 * @example
 * <OnboardingQuestionScreen
 *   questions={questions}
 *   onComplete={handleComplete}
 * />
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '@/types/onboarding-questions';
import { useOnboardingQuestions } from '@/hooks/useOnboardingQuestions';
import { QuestionCard } from '@/components/onboarding/QuestionCard';
import { OptionButton } from '@/components/onboarding/OptionButton';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { mockProvider } from '@/services/onboarding/mockProvider';
import { supabaseProvider } from '@/services/onboarding/supabaseProvider';
import { onboardingTheme } from '@/theme/onboarding';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export interface OnboardingQuestionScreenProps {
  questions: Question[];
  onComplete?: (answers: Record<string, string | string[]>) => void;
}

export function OnboardingQuestionScreen({ questions, onComplete }: OnboardingQuestionScreenProps) {
  const navigation = useNavigation();
  const [isSaving, setIsSaving] = useState(false);

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    isFirst,
    isLast,
    canProceed,
    selectOption,
    next,
    prev,
    isOptionSelected,
  } = useOnboardingQuestions(questions);

  const { palette } = nossaMaternidadeDesignTokens;

  // Salvar respostas ao finalizar
  const handleComplete = useCallback(async () => {
    if (!canProceed) {
      return;
    }

    setIsSaving(true);

    try {
      // Converter respostas para formato OnboardingAnswer
      const onboardingAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        timestamp: new Date().toISOString(),
      }));

      // Salvar usando provider apropriado
      const useMocks = mockProvider.isEnabled();
      const result = useMocks
        ? await mockProvider.save(onboardingAnswers, null)
        : await supabaseProvider.save(onboardingAnswers, null);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao salvar respostas');
      }

      // Marcar onboarding como completo no AsyncStorage
      await AsyncStorage.setItem('onboarded', 'true');

      // Chamar callback de conclusão
      if (onComplete) {
        onComplete(answers);
      }

      // Navegar para tela de revisão ou home
      // navigation.navigate('ReviewAnswers', { answers });
      navigation.navigate('Home' as never);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Não foi possível salvar suas respostas. Tente novamente.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [answers, canProceed, onComplete, navigation]);

  // Handler para próxima pergunta ou finalizar
  const handleNext = useCallback(() => {
    if (isLast) {
      handleComplete();
    } else {
      next();
    }
  }, [isLast, next, handleComplete]);

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Barra de progresso */}
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />

          {/* Card da pergunta */}
          <QuestionCard
            question={currentQuestion.text}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
          />

          {/* Opções */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={isOptionSelected(currentQuestion.id, option.id)}
                onSelect={selectOption}
                disabled={isSaving}
              />
            ))}
          </View>

          {/* Botões de navegação */}
          <View style={styles.buttonsContainer}>
            {!isFirst && (
              <OnboardingButton
                label="Anterior"
                onPress={prev}
                variant="secondary"
                disabled={isSaving}
                accessibilityLabel="Voltar para pergunta anterior"
              />
            )}
            <OnboardingButton
              label={isLast ? 'Finalizar' : 'Próximo'}
              onPress={handleNext}
              disabled={!canProceed || isSaving}
              accessibilityLabel={isLast ? 'Finalizar onboarding' : 'Ir para próxima pergunta'}
            />
          </View>

          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={palette.primary} />
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: nossaMaternidadeDesignTokens.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    gap: onboardingTheme.spacing.optionGap,
    marginTop: nossaMaternidadeDesignTokens.spacing.xl,
    marginBottom: nossaMaternidadeDesignTokens.spacing.xl,
  },
  buttonsContainer: {
    gap: nossaMaternidadeDesignTokens.spacing.md,
    marginTop: 'auto',
    paddingTop: nossaMaternidadeDesignTokens.spacing.xl,
  },
  savingIndicator: {
    alignItems: 'center',
    marginTop: nossaMaternidadeDesignTokens.spacing.md,
  },
});

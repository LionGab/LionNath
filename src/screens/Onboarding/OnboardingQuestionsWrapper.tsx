/**
 * Wrapper para carregar perguntas do JSON e inicializar onboarding
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { OnboardingQuestionScreen } from '@/screens/Onboarding/OnboardingQuestionScreen';
import { Question } from '@/types/onboarding-questions';
import questionsData from '@/mocks/questions.json';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

export function OnboardingQuestionsWrapper() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar perguntas do JSON
    try {
      const loadedQuestions = questionsData as Question[];
      setQuestions(loadedQuestions);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={nossaMaternidadeDesignTokens.palette.primary} />
      </View>
    );
  }

  if (questions.length === 0) {
    return null; // Fallback se não houver perguntas
  }

  return <OnboardingQuestionScreen questions={questions} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: nossaMaternidadeDesignTokens.palette.background,
  },
});

/**
 * useOnboardingQuestions - Hook simplificado para gerenciar onboarding
 *
 * Gerencia estado das perguntas, navegação e seleção de opções
 * Integra com mock provider ou Supabase para persistência
 *
 * @example
 * const {
 *   currentQuestion,
 *   currentIndex,
 *   answers,
 *   canProceed,
 *   selectOption,
 *   next,
 *   prev,
 *   isFirst,
 *   isLast,
 * } = useOnboardingQuestions(questions);
 */

import { useState, useCallback, useMemo } from 'react';
import { Question } from '@/types/onboarding-questions';

export interface UseOnboardingQuestionsReturn {
  // Estado atual
  currentQuestion: Question | null;
  currentIndex: number;
  totalQuestions: number;
  answers: Record<string, string | string[]>;
  progress: number; // 0-100

  // Navegação
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;

  // Ações
  selectOption: (optionId: string) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;

  // Utilitários
  getAnswer: (questionId: string) => string | string[] | undefined;
  isOptionSelected: (questionId: string, optionId: string) => boolean;
}

export function useOnboardingQuestions(questions: Question[]): UseOnboardingQuestionsReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  const totalQuestions = questions.length;

  const progress = useMemo(() => {
    return totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
  }, [currentIndex, totalQuestions]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  // Verifica se pode prosseguir (required=true precisa ter resposta)
  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true; // Opcional sempre pode prosseguir

    const answer = answers[currentQuestion.id];
    if (!answer) return false;

    // Para multi_choice, precisa ter pelo menos 1 seleção
    if (currentQuestion.type === 'multi_choice') {
      return Array.isArray(answer) && answer.length > 0;
    }

    // Para single_choice, precisa ter resposta
    return !!answer;
  }, [currentQuestion, answers]);

  // Seleciona uma opção
  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;

      if (currentQuestion.type === 'single_choice') {
        // Single choice: substitui a resposta anterior
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: optionId,
        }));
      } else if (currentQuestion.type === 'multi_choice') {
        // Multi choice: toggle da opção
        setAnswers((prev) => {
          const current = (prev[currentQuestion.id] as string[]) || [];
          const updated = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];

          return {
            ...prev,
            [currentQuestion.id]: updated,
          };
        });
      }
    },
    [currentQuestion]
  );

  // Navega para próxima pergunta
  const next = useCallback(() => {
    if (!canProceed || isLast) return;
    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
  }, [canProceed, isLast, totalQuestions]);

  // Navega para pergunta anterior
  const prev = useCallback(() => {
    if (isFirst) return;
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, [isFirst]);

  // Reseta o estado
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
  }, []);

  // Obtém resposta de uma pergunta específica
  const getAnswer = useCallback(
    (questionId: string): string | string[] | undefined => {
      return answers[questionId];
    },
    [answers]
  );

  // Verifica se uma opção está selecionada
  const isOptionSelected = useCallback(
    (questionId: string, optionId: string): boolean => {
      const answer = answers[questionId];
      if (!answer) return false;

      if (Array.isArray(answer)) {
        return answer.includes(optionId);
      }

      return answer === optionId;
    },
    [answers]
  );

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answers,
    progress,
    isFirst,
    isLast,
    canProceed,
    selectOption,
    next,
    prev,
    reset,
    getAnswer,
    isOptionSelected,
  };
}

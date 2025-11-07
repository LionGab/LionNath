/**
 * OnboardingFlow - Fluxo de integração inicial da NAT-IA
 *
 * Features:
 * - 4-6 perguntas progressivas
 * - Coleta: estágio, preocupações, expectativas
 * - Progressão visual clara
 * - Chama Edge Function nathia-onboarding
 * - Exibe Starter Pack ao final
 * - Animações suaves
 * - Validação em cada etapa
 *
 * @example
 * <OnboardingFlow
 *   userId={userId}
 *   onComplete={handleComplete}
 * />
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import {
  nathiaClient,
  NathiaOnboardingRequest,
  NathiaOnboardingResponse,
} from '@/services/nathia-client';
import { logger } from '@/lib/logger';

interface OnboardingFlowProps {
  userId: string;
  onComplete: (response: NathiaOnboardingResponse) => void;
}

interface OnboardingStep {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: Array<{ value: string; label: string }>;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'stage',
    question: 'Onde você está na sua jornada?',
    type: 'single',
    options: [
      { value: 'tentante', label: 'Estou tentando engravidar' },
      { value: 'gestante', label: 'Estou grávida' },
      { value: 'puerperio', label: 'Acabei de ter bebê (até 45 dias)' },
      { value: 'mae', label: 'Sou mãe (bebê > 45 dias)' },
    ],
  },
  {
    id: 'pregnancyWeek',
    question: 'Com quantas semanas você está?',
    type: 'single',
    options: [
      { value: '1-12', label: '1º trimestre (1-12 semanas)' },
      { value: '13-27', label: '2º trimestre (13-27 semanas)' },
      { value: '28-40', label: '3º trimestre (28-40 semanas)' },
    ],
  },
  {
    id: 'concerns',
    question: 'Quais são suas principais preocupações?',
    type: 'multiple',
    options: [
      { value: 'health', label: 'Saúde do bebê' },
      { value: 'anxiety', label: 'Ansiedade' },
      { value: 'breastfeeding', label: 'Amamentação' },
      { value: 'sleep', label: 'Sono' },
      { value: 'postpartum', label: 'Pós-parto' },
      { value: 'relationship', label: 'Relacionamento' },
    ],
  },
  {
    id: 'expectations',
    question: 'Como posso te ajudar melhor?',
    type: 'multiple',
    options: [
      { value: 'info', label: 'Informação confiável' },
      { value: 'support', label: 'Apoio emocional' },
      { value: 'community', label: 'Conexão com outras mães' },
      { value: 'routine', label: 'Organização da rotina' },
      { value: 'health', label: 'Acompanhamento de saúde' },
    ],
  },
];

export function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  // Pula step de semanas se não for gestante
  const shouldSkipPregnancyWeek =
    step?.id === 'pregnancyWeek' && answers.stage !== 'gestante';

  React.useEffect(() => {
    if (shouldSkipPregnancyWeek) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [shouldSkipPregnancyWeek]);

  const handleSelectOption = (value: string) => {
    if (step.type === 'single') {
      setAnswers((prev) => ({ ...prev, [step.id]: value }));
    } else {
      // Multiple selection
      const current = (answers[step.id] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      setAnswers((prev) => ({ ...prev, [step.id]: updated }));
    }
  };

  const isOptionSelected = (value: string): boolean => {
    if (step.type === 'single') {
      return answers[step.id] === value;
    } else {
      const current = (answers[step.id] as string[]) || [];
      return current.includes(value);
    }
  };

  const canProceed = (): boolean => {
    const answer = answers[step.id];
    if (step.type === 'single') {
      return !!answer;
    } else {
      return Array.isArray(answer) && answer.length > 0;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (isLastStep) {
      await submitOnboarding();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepara request
      const request: NathiaOnboardingRequest = {
        userId,
        answers: {
          stage: answers.stage || 'gestante',
          pregnancyWeek: answers.pregnancyWeek
            ? parseInt(answers.pregnancyWeek.split('-')[0], 10)
            : undefined,
          concerns: answers.concerns || [],
          expectations: answers.expectations || [],
        },
      };

      logger.info('Submitting NAT-IA onboarding', { request });

      const response = await nathiaClient.processOnboarding(request);

      logger.info('Onboarding completed', { response });

      onComplete(response);
    } catch (err) {
      logger.error('Erro ao completar onboarding', err);
      setError('Não foi possível concluir. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!step) return null;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View
        style={[
          styles.progressBar,
          { backgroundColor: palette.neutrals[200] },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: palette.primary,
            },
          ]}
        />
      </View>

      {/* Step Counter */}
      <Text
        style={[
          styles.stepCounter,
          {
            fontSize: typography.caption.fontSize,
            color: palette.neutrals[600],
            marginTop: spacing.md,
          },
        ]}
      >
        Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
      </Text>

      {/* Question */}
      <Text
        style={[
          styles.question,
          {
            fontSize: typography.headlineMd.fontSize,
            fontWeight: typography.headlineMd.fontWeight,
            color: palette.text,
            marginTop: spacing.md,
            marginBottom: spacing.lg,
          },
        ]}
      >
        {step.question}
      </Text>

      {/* Options */}
      <ScrollView
        style={styles.optionsContainer}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {step.options.map((option) => {
          const isSelected = isOptionSelected(option.value);

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected
                    ? palette.primary
                    : palette.surface,
                  borderRadius: radius.md,
                  marginBottom: spacing.sm,
                },
              ]}
              onPress={() => handleSelectOption(option.value)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    fontSize: typography.bodyLg.fontSize,
                    color: isSelected ? '#FFFFFF' : palette.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {error && (
          <Text
            style={[
              styles.errorText,
              {
                fontSize: typography.bodySm.fontSize,
                color: palette.feedback.danger,
                marginTop: spacing.sm,
              },
            ]}
          >
            {error}
          </Text>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: palette.neutrals[300],
              },
            ]}
            onPress={handleBack}
            disabled={loading}
          >
            <Text
              style={[
                styles.backButtonText,
                {
                  fontSize: typography.button.fontSize,
                  color: palette.text,
                },
              ]}
            >
              Voltar
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed()
                ? palette.primary
                : palette.neutrals[300],
              borderRadius: radius.md,
            },
          ]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.nextButtonText,
                {
                  fontSize: typography.button.fontSize,
                  fontWeight: typography.button.fontWeight,
                },
              ]}
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  stepCounter: {
    textAlign: 'center',
  },
  question: {
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    padding: 16,
    alignItems: 'center',
  },
  optionText: {
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: {},
  nextButton: {
    flex: 2,
    padding: 14,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});

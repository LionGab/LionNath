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

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';
import { nathiaClient, NathiaOnboardingRequest, NathiaOnboardingResponse } from '@/services/nathia-client';
import { logger } from '@/lib/logger';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OnboardingFlowProps {
  userId: string;
  onComplete: (response: NathiaOnboardingResponse) => void;
}

interface AnswerValue {
  value: string | string[];
  timestamp?: Date;
}

// Helper type para respostas do onboarding
type OnboardingAnswer = string | string[];

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
  const [answers, setAnswers] = useState<Record<string, OnboardingAnswer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { palette, typography, spacing, radius } = nossaMaternidadeDesignTokens;
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles({ palette, typography, spacing, radius, width }),
    [palette, typography, spacing, radius, width]
  );

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  // Pula step de semanas se não for gestante
  const shouldSkipPregnancyWeek = step?.id === 'pregnancyWeek' && answers.stage !== 'gestante';

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
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

      setAnswers((prev) => ({ ...prev, [step.id]: updated }));
    }
  };

  const isOptionSelected = (value: string): boolean => {
    if (step.type === 'single') {
      return answers[step.id] === value;
    } else {
      const current = Array.isArray(answers[step.id]) ? (answers[step.id] as string[]) : [];
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
      const getStringValue = (key: string): string => {
        const value = answers[key];
        return typeof value === 'string' ? value : Array.isArray(value) ? value[0] || '' : '';
      };

      const getArrayValue = (key: string): string[] => {
        const value = answers[key];
        return Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
      };

      const request: NathiaOnboardingRequest = {
        userId,
        answers: {
          stage: getStringValue('stage') || 'gestante',
          pregnancyWeek: getStringValue('pregnancyWeek')
            ? parseInt(getStringValue('pregnancyWeek').split('-')[0], 10)
            : undefined,
          concerns: getArrayValue('concerns'),
          expectations: getArrayValue('expectations'),
        },
      };

      logger.info('Submitting NAT-IA onboarding', { request });

      const response = await nathiaClient.processOnboarding(request);

      logger.info('Onboarding completed', { response });

      onComplete(response);
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err));
      logger.error('Erro ao completar onboarding', errorInstance);
      setError('Não foi possível concluir. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!step) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.content}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          {/* Step Counter */}
          <Text style={styles.stepCounter}>
            Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
          </Text>

          {/* Question */}
          <Text style={styles.question}>{step.question}</Text>

          {/* Options */}
          <ScrollView
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {step.options.map((option) => {
              const isSelected = isOptionSelected(option.value);

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    {
                      backgroundColor: isSelected ? palette.primary : palette.surface,
                      borderRadius: radius.md,
                    },
                  ]}
                  onPress={() => handleSelectOption(option.value)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: isSelected }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? palette.surface : palette.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[
                  styles.backButton,
                  {
                    borderColor: palette.neutrals[300],
                  },
                ]}
                onPress={handleBack}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                {
                  backgroundColor: canProceed() ? palette.primary : palette.neutrals[300],
                },
              ]}
              onPress={handleNext}
              disabled={!canProceed() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Text style={styles.nextButtonText}>{isLastStep ? 'Concluir' : 'Próximo'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

type DesignTokens = typeof nossaMaternidadeDesignTokens;
type Palette = DesignTokens['palette'];
type Typography = DesignTokens['typography'];
type Spacing = DesignTokens['spacing'];
type Radius = DesignTokens['radius'];

interface StyleParams {
  palette: Palette;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  width: number;
}

function createStyles({ palette, typography, spacing, radius, width }: StyleParams) {
  const isCompact = width <= 360;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? spacing['2xl'] : spacing.lg;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: palette.background,
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: isTablet ? 640 : '100%',
      alignSelf: 'center',
      gap: spacing.md,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor: palette.neutrals[200],
    },
    progressFill: {
      height: '100%',
      backgroundColor: palette.primary,
      borderRadius: 2,
    },
    stepCounter: {
      textAlign: 'center',
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      color: palette.neutrals[600],
      marginTop: spacing.md,
    },
    question: {
      textAlign: 'center',
      fontSize: isCompact ? typography.headlineSm.fontSize : typography.headlineMd.fontSize,
      lineHeight: isCompact ? typography.headlineSm.lineHeight : typography.headlineMd.lineHeight,
      fontWeight: typography.headlineMd.fontWeight,
      color: palette.text,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      paddingHorizontal: isCompact ? spacing.sm : spacing.none,
    },
    optionsContainer: {
      flex: 1,
    },
    optionsContent: {
      paddingBottom: spacing.xl,
      gap: spacing.sm,
    },
    option: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
      minHeight: 56,
      shadowColor: palette.overlays.subtle,
      width: '100%',
    },
    optionText: {
      fontSize: isCompact ? typography.bodyMd.fontSize : typography.bodyLg.fontSize,
      lineHeight: isCompact ? typography.bodyMd.lineHeight : typography.bodyLg.lineHeight,
      fontWeight: typography.bodyLg.fontWeight,
      textAlign: 'center',
    },
    errorText: {
      textAlign: 'center',
      fontSize: typography.bodySm.fontSize,
      lineHeight: typography.bodySm.lineHeight,
      color: palette.feedback.danger,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    buttonContainer: {
      flexDirection: isCompact ? 'column' : 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
      alignItems: 'stretch',
      width: '100%',
    },
    backButton: {
      flex: isCompact ? undefined : 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      backgroundColor: palette.surface,
      borderRadius: radius.md,
    },
    backButtonText: {
      fontSize: typography.button.fontSize,
      lineHeight: typography.button.lineHeight,
      fontWeight: typography.button.fontWeight,
      color: palette.text,
    },
    nextButton: {
      flex: isCompact ? undefined : 1.1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      borderRadius: radius.md,
    },
    nextButtonText: {
      fontSize: typography.button.fontSize,
      lineHeight: typography.button.lineHeight,
      fontWeight: typography.button.fontWeight,
      color: palette.surface,
    },
  });
}

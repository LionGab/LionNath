/**
 * Hook para gerenciar onboarding
 * Gerencia estado, progresso e salvamento de dados
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OnboardingData,
  OnboardingStep,
  OnboardingQuestion,
  getQuestionsByStep,
  calculateProgress,
} from '@/types/onboarding.types';
import {
  saveOnboardingData,
  getOnboardingData,
  hasCompletedOnboarding,
  saveOnboardingResponse,
  generateNathIAContext,
  validateStep,
} from '@/services/onboarding.service';
import { supabase } from '@/services/supabase';

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'basic_info',
  'maternal_stage',
  'emotional_state',
  'challenges',
  'support_needs',
  'goals',
  'preferences',
  'complete',
];

function normalizeResponseValue(value: string | string[] | number, questionId: string) {
  if (questionId === 'stress_level' || questionId === 'energy_level' || questionId === 'baby_age_months') {
    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? value : parsed;
    }
  }
  return value;
}

export interface UseOnboardingReturn {
  // Estado
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  progress: number;
  loading: boolean;
  saving: boolean;

  // Perguntas
  currentQuestions: OnboardingQuestion[];
  canGoNext: boolean;
  canGoBack: boolean;

  // Ações
  goToStep: (step: OnboardingStep) => void;
  goNext: () => void;
  goBack: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  saveResponse: (questionId: string, value: string | string[] | number) => Promise<void>;
  saveCurrentStep: () => Promise<void>;
  completeOnboarding: () => Promise<boolean>;
  loadOnboarding: () => Promise<void>;

  // Utilitários
  getNathIAContext: () => string;
  isStepValid: (step?: OnboardingStep) => boolean;
}

export function useOnboarding(userId?: string): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar dados do onboarding ao montar
  useEffect(() => {
    if (userId) {
      loadOnboarding();
    }
  }, [userId]);

  // Carregar dados do onboarding
  const loadOnboarding = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const onboardingData = await getOnboardingData(userId);
      if (onboardingData) {
        setData(onboardingData);

        // Determinar step atual baseado nos dados
        if (onboardingData.completed_at) {
          setCurrentStep('complete');
        } else if (onboardingData.content_preferences && onboardingData.content_preferences.length > 0) {
          setCurrentStep('preferences');
        } else if (onboardingData.main_goals && onboardingData.main_goals.length > 0) {
          setCurrentStep('goals');
        } else if (onboardingData.support_needs && onboardingData.support_needs.length > 0) {
          setCurrentStep('support_needs');
        } else if (onboardingData.main_challenges && onboardingData.main_challenges.length > 0) {
          setCurrentStep('challenges');
        } else if (onboardingData.emotional_state) {
          setCurrentStep('emotional_state');
        } else if (onboardingData.maternal_stage) {
          setCurrentStep('maternal_stage');
        } else if (onboardingData.name) {
          setCurrentStep('basic_info');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar onboarding:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Atualizar dados
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const newData = { ...prev, ...updates };

      // Atualizar responses
      if (!newData.responses) {
        newData.responses = [];
      }

      return newData;
    });
  }, []);

  // Salvar resposta individual
  const saveResponse = useCallback(
    async (questionId: string, value: string | string[] | number) => {
      if (!userId) return;

      try {
        await saveOnboardingResponse(userId, questionId, value);

        // Atualizar estado local
        const normalizedValue = normalizeResponseValue(value, questionId);
        updateData({
          [questionId]: normalizedValue,
          responses: [
            ...(data.responses || []),
            {
              questionId,
              value: normalizedValue,
              timestamp: new Date().toISOString(),
            },
          ],
        });
      } catch (error) {
        console.error('Erro ao salvar resposta:', error);
        throw error;
      }
    },
    [userId, data.responses, updateData]
  );

  // Salvar step atual
  const saveCurrentStep = useCallback(async () => {
    if (!userId) return;

    setSaving(true);
    try {
      await saveOnboardingData(userId, data);
    } catch (error) {
      console.error('Erro ao salvar step:', error);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, data]);

  // Ir para step
  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  // Próximo step
  const goNext = useCallback(async () => {
    // Validar step atual
    const validation = validateStep(currentStep, data);
    if (!validation.isValid) {
      Alert.alert('Campos obrigatórios', `Por favor, preencha: ${validation.missingFields.join(', ')}`);
      return;
    }

    // Salvar step atual
    await saveCurrentStep();

    // Ir para próximo step
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex + 1]);
    }
  }, [currentStep, data, saveCurrentStep]);

  // Step anterior
  const goBack = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    setSaving(true);
    try {
      // Validar step final
      const validation = validateStep(currentStep, data);
      if (!validation.isValid) {
        Alert.alert('Campos obrigatórios', `Por favor, preencha: ${validation.missingFields.join(', ')}`);
        return false;
      }

      // Salvar dados completos
      await saveOnboardingData(userId, {
        ...data,
        completed_at: new Date().toISOString(),
      });

      // Marcar como completo
      await AsyncStorage.setItem('onboarded', 'true');
      await AsyncStorage.setItem('onboardingData', JSON.stringify(data));

      setCurrentStep('complete');
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      Alert.alert('Erro', 'Não foi possível completar o onboarding. Tente novamente.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, currentStep, data]);

  // Obter contexto para NathIA
  const getNathIAContext = useCallback((): string => {
    return generateNathIAContext(data);
  }, [data]);

  // Validar step
  const isStepValid = useCallback(
    (step?: OnboardingStep): boolean => {
      const stepToValidate = step || currentStep;
      const validation = validateStep(stepToValidate, data);
      return validation.isValid;
    },
    [currentStep, data]
  );

  // Perguntas do step atual
  const currentQuestions = getQuestionsByStep(currentStep);

  // Progresso
  const progress = calculateProgress(currentStep);

  // Pode ir para frente/trás
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const canGoNext = currentIndex < ONBOARDING_STEPS.length - 1;
  const canGoBack = currentIndex > 0;

  return {
    // Estado
    currentStep,
    data,
    progress,
    loading,
    saving,

    // Perguntas
    currentQuestions,
    canGoNext,
    canGoBack,

    // Ações
    goToStep,
    goNext,
    goBack,
    updateData,
    saveResponse,
    saveCurrentStep,
    completeOnboarding,
    loadOnboarding,

    // Utilitários
    getNathIAContext,
    isStepValid,
  };
}

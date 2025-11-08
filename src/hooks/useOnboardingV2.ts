/**
 * Hook para gerenciar Onboarding v2
 * 5 blocos progressivos focados em conexão emocional
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OnboardingV2Data,
  OnboardingV2Step,
  calculateOnboardingV2Progress,
  validateOnboardingV2Block,
  generateNathIAProfile,
} from '@/types/onboarding-v2.types';
import { saveOnboardingData, getOnboardingData } from '@/services/onboarding.service';

const ONBOARDING_V2_STEPS: OnboardingV2Step[] = [
  'block1_identity',
  'block2_emotions',
  'block3_challenges',
  'block4_support',
  'block5_expectations',
  'complete',
];

const STORAGE_KEY = 'onboarding_v2_data';

export interface UseOnboardingV2Return {
  // Estado
  currentStep: OnboardingV2Step;
  data: Partial<OnboardingV2Data>;
  progress: number;
  loading: boolean;
  saving: boolean;

  // Navegação
  canGoNext: boolean;
  canGoBack: boolean;

  // Ações
  goToStep: (step: OnboardingV2Step) => void;
  goNext: () => Promise<void>;
  goBack: () => void;
  updateData: (updates: Partial<OnboardingV2Data>) => void;
  saveProgress: () => Promise<void>;
  completeOnboarding: () => Promise<boolean>;
  loadOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;

  // Utilitários
  isStepValid: (step?: OnboardingV2Step) => boolean;
  getNathIAProfile: () => Record<string, any>;
}

export function useOnboardingV2(userId?: string): UseOnboardingV2Return {
  const [currentStep, setCurrentStep] = useState<OnboardingV2Step>('block1_identity');
  const [data, setData] = useState<Partial<OnboardingV2Data>>({
    started_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar dados salvos ao montar
  useEffect(() => {
    loadOnboarding();
  }, []);

  // Carregar dados do onboarding (local + servidor)
  const loadOnboarding = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Tentar carregar do AsyncStorage primeiro (mais rápido)
      const localData = await AsyncStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        setData(parsed);

        // Determinar step atual baseado nos dados
        if (parsed.completed_at) {
          setCurrentStep('complete');
        } else if (parsed.main_goals && parsed.communication_style) {
          setCurrentStep('block5_expectations');
        } else if (parsed.support_network_level) {
          setCurrentStep('block4_support');
        } else if (parsed.main_challenges && parsed.main_challenges.length > 0) {
          setCurrentStep('block3_challenges');
        } else if (parsed.emotional_state && parsed.stress_level !== undefined) {
          setCurrentStep('block2_emotions');
        } else if (parsed.maternal_stage) {
          setCurrentStep('block1_identity');
        }
      }

      // 2. Se tiver userId, tentar sincronizar com servidor
      if (userId) {
        const serverData = await getOnboardingData(userId);
        if (serverData && serverData.completed_at) {
          // Dados do servidor têm prioridade se onboarding foi completado
          setData(serverData as Partial<OnboardingV2Data>);
          setCurrentStep('complete');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar onboarding v2:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Atualizar dados
  const updateData = useCallback((updates: Partial<OnboardingV2Data>) => {
    setData((prev) => {
      const newData = { ...prev, ...updates };

      // Salvar localmente a cada mudança
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData)).catch((error) => {
        console.error('Erro ao salvar no AsyncStorage:', error);
      });

      return newData;
    });
  }, []);

  // Salvar progresso no servidor
  const saveProgress = useCallback(async () => {
    if (!userId) return;

    setSaving(true);
    try {
      await saveOnboardingData(userId, data as any);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [userId, data]);

  // Ir para step específico
  const goToStep = useCallback((step: OnboardingV2Step) => {
    setCurrentStep(step);
  }, []);

  // Próximo step
  const goNext = useCallback(async () => {
    // Validar step atual
    const validation = validateOnboardingV2Block(currentStep, data);
    if (!validation.isValid) {
      Alert.alert(
        'Campos obrigatórios',
        `Por favor, preencha os campos necessários para continuar.`
      );
      return;
    }

    // Salvar progresso antes de avançar
    await saveProgress();

    // Ir para próximo step
    const currentIndex = ONBOARDING_V2_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_V2_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_V2_STEPS[currentIndex + 1]);
    }
  }, [currentStep, data, saveProgress]);

  // Step anterior
  const goBack = useCallback(() => {
    const currentIndex = ONBOARDING_V2_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(ONBOARDING_V2_STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  // Completar onboarding
  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    // Validar step final
    const validation = validateOnboardingV2Block(currentStep, data);
    if (!validation.isValid) {
      Alert.alert(
        'Campos obrigatórios',
        'Por favor, preencha todos os campos necessários para finalizar.'
      );
      return false;
    }

    setSaving(true);
    try {
      const completedData: Partial<OnboardingV2Data> = {
        ...data,
        completed_at: new Date().toISOString(),
      };

      // Salvar localmente
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedData));
      await AsyncStorage.setItem('onboarded_v2', 'true');

      // Salvar no servidor se tiver userId
      if (userId) {
        await saveOnboardingData(userId, completedData as any);
      }

      setData(completedData);
      setCurrentStep('complete');
      return true;
    } catch (error) {
      console.error('Erro ao completar onboarding v2:', error);
      Alert.alert('Erro', 'Não foi possível completar o onboarding. Tente novamente.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, currentStep, data]);

  // Reset onboarding (útil para testes)
  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('onboarded_v2');
      setData({ started_at: new Date().toISOString() });
      setCurrentStep('block1_identity');
    } catch (error) {
      console.error('Erro ao resetar onboarding:', error);
    }
  }, []);

  // Validar step
  const isStepValid = useCallback(
    (step?: OnboardingV2Step): boolean => {
      const stepToValidate = step || currentStep;
      const validation = validateOnboardingV2Block(stepToValidate, data);
      return validation.isValid;
    },
    [currentStep, data]
  );

  // Gerar perfil para NathIA
  const getNathIAProfile = useCallback((): Record<string, any> => {
    return generateNathIAProfile(data);
  }, [data]);

  // Progresso
  const progress = calculateOnboardingV2Progress(currentStep);

  // Pode ir para frente/trás
  const currentIndex = ONBOARDING_V2_STEPS.indexOf(currentStep);
  const canGoNext = currentIndex < ONBOARDING_V2_STEPS.length - 1 && isStepValid();
  const canGoBack = currentIndex > 0 && currentStep !== 'complete';

  return {
    // Estado
    currentStep,
    data,
    progress,
    loading,
    saving,

    // Navegação
    canGoNext,
    canGoBack,

    // Ações
    goToStep,
    goNext,
    goBack,
    updateData,
    saveProgress,
    completeOnboarding,
    loadOnboarding,
    resetOnboarding,

    // Utilitários
    isStepValid,
    getNathIAProfile,
  };
}

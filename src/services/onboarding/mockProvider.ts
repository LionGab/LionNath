/**
 * Mock Provider para Onboarding
 *
 * Provider que detecta USE_MOCKS e salva respostas em AsyncStorage
 * Permite desenvolvimento e demo sem necessidade de Supabase
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnswer, OnboardingSession } from '@/types/onboarding-questions';
import { logger } from '@/lib/logger';

const STORAGE_KEY = '@onboarding_answers';
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

export interface MockProviderResult {
  success: boolean;
  error?: string;
  data?: OnboardingSession;
}

/**
 * Salva respostas do onboarding no AsyncStorage (modo mock)
 */
export async function saveOnboardingAnswersMock(
  answers: OnboardingAnswer[],
  userId?: string | null
): Promise<MockProviderResult> {
  try {
    const session: OnboardingSession = {
      userId: userId || null,
      answers,
      completedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    logger.info('Onboarding answers saved to AsyncStorage', { answerCount: answers.length });

    return {
      success: true,
      data: session,
    };
  } catch (error: any) {
    logger.error('Error saving onboarding answers to AsyncStorage', error);
    return {
      success: false,
      error: error.message || 'Erro ao salvar respostas',
    };
  }
}

/**
 * Carrega respostas do onboarding do AsyncStorage (modo mock)
 */
export async function loadOnboardingAnswersMock(): Promise<MockProviderResult> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return {
        success: true,
        data: {
          userId: null,
          answers: [],
        },
      };
    }

    const session: OnboardingSession = JSON.parse(stored);

    return {
      success: true,
      data: session,
    };
  } catch (error: any) {
    logger.error('Error loading onboarding answers from AsyncStorage', error);
    return {
      success: false,
      error: error.message || 'Erro ao carregar respostas',
    };
  }
}

/**
 * Verifica se onboarding foi completado (modo mock)
 */
export async function hasCompletedOnboardingMock(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const session: OnboardingSession = JSON.parse(stored);
    return session.answers.length > 0 && !!session.completedAt;
  } catch {
    return false;
  }
}

/**
 * Limpa respostas do onboarding (modo mock)
 */
export async function clearOnboardingAnswersMock(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    logger.info('Onboarding answers cleared from AsyncStorage');
  } catch (error: any) {
    logger.error('Error clearing onboarding answers from AsyncStorage', error);
  }
}

/**
 * Provider principal que detecta modo mock e delega para função apropriada
 */
export const mockProvider = {
  isEnabled: () => USE_MOCKS,
  save: saveOnboardingAnswersMock,
  load: loadOnboardingAnswersMock,
  hasCompleted: hasCompletedOnboardingMock,
  clear: clearOnboardingAnswersMock,
};

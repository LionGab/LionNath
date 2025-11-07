/**
 * Contexto Global da NAT-IA
 *
 * Gerencia:
 * - Estado global da conversa
 * - Contexto do usuário (stage, mood, concerns)
 * - Persistência entre sessões
 * - Sincronização com backend
 * - Notificações push integradas
 *
 * @example
 * const { context, updateContext, resetContext } = useNathiaContext();
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/logger';

const CONTEXT_STORAGE_KEY = '@nathia_context';

export interface NathiaContextState {
  userId: string;
  stage?: 'gestante' | 'mae' | 'tentante' | 'puerperio';
  pregnancyWeek?: number;
  babyAge?: number; // em dias
  mood?: string;
  concerns?: string[];
  lastInteraction?: Date;
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  preferences: {
    suggestionsEnabled: boolean;
    autoRecommendations: boolean;
  };
}

export interface NathiaContextValue {
  context: NathiaContextState | null;
  loading: boolean;
  updateContext: (updates: Partial<NathiaContextState>) => Promise<void>;
  resetContext: () => Promise<void>;
  setMood: (mood: string) => Promise<void>;
  addConcern: (concern: string) => Promise<void>;
  removeConcern: (concern: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isReady: boolean;
}

const NathiaContext = createContext<NathiaContextValue | undefined>(undefined);

interface NathiaProviderProps {
  children: ReactNode;
  userId: string;
}

export function NathiaProvider({ children, userId }: NathiaProviderProps) {
  const [context, setContext] = useState<NathiaContextState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Carrega contexto inicial
  useEffect(() => {
    loadContext();
  }, [userId]);

  const loadContext = async () => {
    try {
      const stored = await AsyncStorage.getItem(CONTEXT_STORAGE_KEY);

      if (stored) {
        const parsed: NathiaContextState = JSON.parse(stored);

        // Reconstrói Date se necessário
        if (parsed.lastInteraction) {
          parsed.lastInteraction = new Date(parsed.lastInteraction);
        }

        setContext(parsed);
      } else {
        // Contexto padrão
        const defaultContext: NathiaContextState = {
          userId,
          onboardingCompleted: false,
          notificationsEnabled: false,
          preferences: {
            suggestionsEnabled: true,
            autoRecommendations: true,
          },
        };

        setContext(defaultContext);
        await saveContext(defaultContext);
      }

      setIsReady(true);
    } catch (error) {
      logger.error('Erro ao carregar contexto NAT-IA', error);

      // Fallback: contexto mínimo
      setContext({
        userId,
        onboardingCompleted: false,
        notificationsEnabled: false,
        preferences: {
          suggestionsEnabled: true,
          autoRecommendations: true,
        },
      });

      setIsReady(true);
    } finally {
      setLoading(false);
    }
  };

  const saveContext = async (newContext: NathiaContextState) => {
    try {
      await AsyncStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(newContext));
    } catch (error) {
      logger.error('Erro ao salvar contexto NAT-IA', error);
    }
  };

  const updateContext = useCallback(
    async (updates: Partial<NathiaContextState>) => {
      if (!context) return;

      const updatedContext: NathiaContextState = {
        ...context,
        ...updates,
        lastInteraction: new Date(),
      };

      setContext(updatedContext);
      await saveContext(updatedContext);

      logger.info('Contexto NAT-IA atualizado', { updates });
    },
    [context]
  );

  const resetContext = useCallback(async () => {
    const freshContext: NathiaContextState = {
      userId,
      onboardingCompleted: false,
      notificationsEnabled: false,
      preferences: {
        suggestionsEnabled: true,
        autoRecommendations: true,
      },
    };

    setContext(freshContext);
    await saveContext(freshContext);

    logger.info('Contexto NAT-IA resetado');
  }, [userId]);

  const setMood = useCallback(
    async (mood: string) => {
      await updateContext({ mood });
    },
    [updateContext]
  );

  const addConcern = useCallback(
    async (concern: string) => {
      if (!context) return;

      const concerns = context.concerns || [];
      if (!concerns.includes(concern)) {
        await updateContext({
          concerns: [...concerns, concern],
        });
      }
    },
    [context, updateContext]
  );

  const removeConcern = useCallback(
    async (concern: string) => {
      if (!context) return;

      const concerns = context.concerns || [];
      await updateContext({
        concerns: concerns.filter((c) => c !== concern),
      });
    },
    [context, updateContext]
  );

  const completeOnboarding = useCallback(async () => {
    await updateContext({
      onboardingCompleted: true,
    });
  }, [updateContext]);

  const value: NathiaContextValue = {
    context,
    loading,
    updateContext,
    resetContext,
    setMood,
    addConcern,
    removeConcern,
    completeOnboarding,
    isReady,
  };

  return <NathiaContext.Provider value={value}>{children}</NathiaContext.Provider>;
}

export function useNathiaContext(): NathiaContextValue {
  const context = useContext(NathiaContext);

  if (!context) {
    throw new Error('useNathiaContext must be used within NathiaProvider');
  }

  return context;
}

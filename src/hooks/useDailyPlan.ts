/**
 * useDailyPlan - Hook para gerenciar plano diário
 * Encapsula lógica de carregamento, geração e salvamento de planos
 */

import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyPlanRepository } from '@/repositories/DailyPlanRepository';
import { generateDailyPlan, ChatContext } from '@/services/ai';
import type { DailyPlanLocal, DailyPlanGenerated } from '@/types';
import { logger } from '@/utils/logger';

interface UseDailyPlanResult {
  /** Plano diário atual */
  dailyPlan: DailyPlanLocal | null;
  /** Se está carregando o plano */
  loading: boolean;
  /** Se está gerando novo plano */
  generating: boolean;
  /** Erro ocorrido */
  error: Error | null;
  /** Carrega plano do dia atual */
  loadDailyPlan: () => Promise<void>;
  /** Gera novo plano diário */
  generatePlan: () => Promise<void>;
  /** Recarrega plano do dia atual */
  refresh: () => Promise<void>;
}

export const useDailyPlan = (): UseDailyPlanResult => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlanLocal | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Carrega plano diário do dia atual
   */
  const loadDailyPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        logger.warn('useDailyPlan: userId não encontrado');
        setLoading(false);
        return;
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await DailyPlanRepository.getByDate(userId, today);

      if (result.error) {
        logger.error('Erro ao carregar plano diário', { userId, today, error: result.error });
        setError(result.error);
      } else {
        setDailyPlan(result.data);
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro desconhecido');
      logger.error('Erro inesperado ao carregar plano diário', { error: errorObj });
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gera novo plano diário usando IA
   */
  const generatePlan = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar contexto do usuário
      const profileJson = await AsyncStorage.getItem('userProfile');
      const context: ChatContext = profileJson ? JSON.parse(profileJson) : {};

      // Gerar plano usando IA
      const planData = await generateDailyPlan(context);

      // Salvar no Supabase
      const today = format(new Date(), 'yyyy-MM-dd');
      const saveResult = await DailyPlanRepository.save({
        user_id: userId,
        date: today,
        priorities: planData.priorities,
        tip: planData.tip,
        recipe: planData.recipe,
        tip_video_url: planData.tip_video_url,
      });

      if (saveResult.error) {
        logger.error('Erro ao salvar plano gerado', { error: saveResult.error });
        setError(saveResult.error);
      } else {
        setDailyPlan(saveResult.data);
        logger.info('Plano diário gerado com sucesso', { userId, today });
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Erro desconhecido');
      logger.error('Erro ao gerar plano diário', { error: errorObj });
      setError(errorObj);
    } finally {
      setGenerating(false);
    }
  }, []);

  /**
   * Recarrega plano do dia atual
   */
  const refresh = useCallback(async () => {
    await loadDailyPlan();
  }, [loadDailyPlan]);

  // Carregar plano ao montar componente
  useEffect(() => {
    loadDailyPlan();
  }, [loadDailyPlan]);

  return {
    dailyPlan,
    loading,
    generating,
    error,
    loadDailyPlan,
    generatePlan,
    refresh,
  };
};

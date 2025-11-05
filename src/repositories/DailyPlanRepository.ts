/**
 * DailyPlanRepository - Camada de acesso a dados para planos diários
 * Encapsula lógica de acesso ao Supabase e fornece interface limpa
 */

import { supabase } from '@/services/supabase';
import type { DailyPlanLocal, RepositoryResult } from '@/types';
import { validateUserId, validateDate } from '@/utils/validation';
import { logger } from '@/utils/logger';

export class DailyPlanRepository {
  /**
   * Busca plano diário por data
   */
  static async getByDate(userId: string, date: string): Promise<RepositoryResult<DailyPlanLocal | null>> {
    try {
      // Validar inputs
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: null,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const dateValidation = validateDate(date);
      if (!dateValidation.isValid) {
        return {
          data: null,
          error: new Error(dateValidation.errors[0].message),
        };
      }

      // Buscar no Supabase
      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (não é erro se não houver plano)
        logger.error('Erro ao buscar plano diário', { userId, date, error });
        return {
          data: null,
          error: new Error(`Erro ao buscar plano: ${error.message}`),
        };
      }

      return {
        data: data || null,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao buscar plano diário', { userId, date, error });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Salva ou atualiza plano diário
   */
  static async save(plan: Partial<DailyPlanLocal>): Promise<RepositoryResult<DailyPlanLocal>> {
    try {
      // Validar inputs obrigatórios
      if (!plan.user_id) {
        return {
          data: null as any,
          error: new Error('user_id é obrigatório'),
        };
      }

      if (!plan.date) {
        return {
          data: null as any,
          error: new Error('date é obrigatório'),
        };
      }

      // Salvar no Supabase (upsert)
      const { data, error } = await supabase.from('daily_plans').upsert(plan).select().single();

      if (error) {
        logger.error('Erro ao salvar plano diário', { plan, error });
        return {
          data: null as any,
          error: new Error(`Erro ao salvar plano: ${error.message}`),
        };
      }

      return {
        data: data as DailyPlanLocal,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao salvar plano diário', { plan, error });
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Busca múltiplos planos por período
   */
  static async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<RepositoryResult<DailyPlanLocal[]>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: [],
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar planos por período', { userId, startDate, endDate, error });
        return {
          data: [],
          error: new Error(`Erro ao buscar planos: ${error.message}`),
        };
      }

      return {
        data: (data || []) as DailyPlanLocal[],
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao buscar planos por período', { userId, startDate, endDate, error });
      return {
        data: [],
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Deleta plano diário
   */
  static async delete(userId: string, date: string): Promise<RepositoryResult<boolean>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: false,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { error } = await supabase.from('daily_plans').delete().eq('user_id', userId).eq('date', date);

      if (error) {
        logger.error('Erro ao deletar plano diário', { userId, date, error });
        return {
          data: false,
          error: new Error(`Erro ao deletar plano: ${error.message}`),
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao deletar plano diário', { userId, date, error });
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }
}

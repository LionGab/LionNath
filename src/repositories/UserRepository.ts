/**
 * UserRepository - Camada de acesso a dados para usuários
 * Encapsula lógica de acesso ao Supabase e fornece interface limpa
 */

import { supabase } from '@/services/supabase';
import type { UserProfileLocal, RepositoryResult } from '@/types';
import { validateUserId, validateName, validateUserType } from '@/utils/validation';
import { logger } from '@/utils/logger';

export class UserRepository {
  /**
   * Busca perfil de usuário por ID
   */
  static async getById(userId: string): Promise<RepositoryResult<UserProfileLocal | null>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: null,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar perfil de usuário', { userId, error });
        return {
          data: null,
          error: new Error(`Erro ao buscar perfil: ${error.message}`),
        };
      }

      return {
        data: data || null,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao buscar perfil de usuário', { userId, error });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Cria ou atualiza perfil de usuário
   */
  static async save(profile: Partial<UserProfileLocal>): Promise<RepositoryResult<UserProfileLocal>> {
    try {
      // Validar campos obrigatórios
      if (!profile.id) {
        return {
          data: null as any,
          error: new Error('id é obrigatório'),
        };
      }

      if (profile.name) {
        const nameValidation = validateName(profile.name);
        if (!nameValidation.isValid) {
          return {
            data: null as any,
            error: new Error(nameValidation.errors[0].message),
          };
        }
      }

      if (profile.type) {
        const typeValidation = validateUserType(profile.type);
        if (!typeValidation.isValid) {
          return {
            data: null as any,
            error: new Error(typeValidation.errors[0].message),
          };
        }
      }

      // Salvar no Supabase (upsert)
      const { data, error } = await supabase.from('user_profiles').upsert(profile).select().single();

      if (error) {
        logger.error('Erro ao salvar perfil de usuário', { profile, error });
        return {
          data: null as any,
          error: new Error(`Erro ao salvar perfil: ${error.message}`),
        };
      }

      return {
        data: data as UserProfileLocal,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao salvar perfil de usuário', { profile, error });
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Atualiza apenas campos específicos do perfil
   */
  static async update(
    userId: string,
    updates: Partial<UserProfileLocal>
  ): Promise<RepositoryResult<UserProfileLocal>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: null as any,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao atualizar perfil de usuário', { userId, updates, error });
        return {
          data: null as any,
          error: new Error(`Erro ao atualizar perfil: ${error.message}`),
        };
      }

      return {
        data: data as UserProfileLocal,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao atualizar perfil de usuário', { userId, updates, error });
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Deleta perfil de usuário
   */
  static async delete(userId: string): Promise<RepositoryResult<boolean>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: false,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { error } = await supabase.from('user_profiles').delete().eq('id', userId);

      if (error) {
        logger.error('Erro ao deletar perfil de usuário', { userId, error });
        return {
          data: false,
          error: new Error(`Erro ao deletar perfil: ${error.message}`),
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao deletar perfil de usuário', { userId, error });
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Incrementa contador de interações diárias
   */
  static async incrementDailyInteractions(userId: string): Promise<RepositoryResult<boolean>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: false,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      // Buscar perfil atual
      const profileResult = await this.getById(userId);
      if (profileResult.error || !profileResult.data) {
        return {
          data: false,
          error: profileResult.error || new Error('Perfil não encontrado'),
        };
      }

      const today = new Date().toISOString().split('T')[0];
      const lastInteractionDate = profileResult.data.last_interaction_date?.split('T')[0];

      // Se for outro dia, resetar contador
      const dailyInteractions =
        lastInteractionDate === today ? (profileResult.data.daily_interactions || 0) + 1 : 1;

      // Atualizar
      const updateResult = await this.update(userId, {
        daily_interactions: dailyInteractions,
        last_interaction_date: new Date().toISOString(),
      });

      return updateResult;
    } catch (error) {
      logger.error('Erro inesperado ao incrementar interações', { userId, error });
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }
}

/**
 * ChatRepository - Camada de acesso a dados para mensagens de chat
 * Encapsula lógica de acesso ao Supabase e fornece interface limpa
 */

import { supabase } from '@/services/supabase';
import type { ChatMessageLocal, RepositoryResult, PaginationParams, PaginatedResult } from '@/types';
import { validateUserId, validateChatMessage } from '@/utils/validation';
import { logger } from '@/utils/logger';

export class ChatRepository {
  /**
   * Salva nova mensagem de chat
   */
  static async save(message: Partial<ChatMessageLocal>): Promise<RepositoryResult<ChatMessageLocal>> {
    try {
      // Validar campos obrigatórios
      if (!message.user_id) {
        return {
          data: null as any,
          error: new Error('user_id é obrigatório'),
        };
      }

      if (message.message) {
        const messageValidation = validateChatMessage(message.message);
        if (!messageValidation.isValid) {
          return {
            data: null as any,
            error: new Error(messageValidation.errors[0].message),
          };
        }
      }

      // Salvar no Supabase
      const { data, error } = await supabase.from('chat_messages').insert(message).select().single();

      if (error) {
        logger.error('Erro ao salvar mensagem de chat', { message, error });
        return {
          data: null as any,
          error: new Error(`Erro ao salvar mensagem: ${error.message}`),
        };
      }

      return {
        data: data as ChatMessageLocal,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao salvar mensagem de chat', { message, error });
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Busca histórico de mensagens do usuário
   */
  static async getHistory(
    userId: string,
    params?: PaginationParams
  ): Promise<RepositoryResult<PaginatedResult<ChatMessageLocal>>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: null as any,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const limit = params?.limit || 50;
      const offset = params?.offset || 0;

      // Buscar mensagens
      const { data, error, count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error('Erro ao buscar histórico de chat', { userId, params, error });
        return {
          data: null as any,
          error: new Error(`Erro ao buscar histórico: ${error.message}`),
        };
      }

      // Reverter ordem para ter mensagens mais antigas primeiro
      const messages = (data || []).reverse() as ChatMessageLocal[];

      return {
        data: {
          data: messages,
          total: count || 0,
          limit,
          offset,
        },
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao buscar histórico de chat', { userId, params, error });
      return {
        data: null as any,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Busca mensagem específica por ID
   */
  static async getById(messageId: string): Promise<RepositoryResult<ChatMessageLocal | null>> {
    try {
      if (!messageId || messageId.trim().length === 0) {
        return {
          data: null,
          error: new Error('messageId é obrigatório'),
        };
      }

      const { data, error } = await supabase.from('chat_messages').select('*').eq('id', messageId).single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar mensagem de chat', { messageId, error });
        return {
          data: null,
          error: new Error(`Erro ao buscar mensagem: ${error.message}`),
        };
      }

      return {
        data: data || null,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao buscar mensagem de chat', { messageId, error });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Deleta mensagem de chat
   */
  static async delete(messageId: string, userId: string): Promise<RepositoryResult<boolean>> {
    try {
      if (!messageId || messageId.trim().length === 0) {
        return {
          data: false,
          error: new Error('messageId é obrigatório'),
        };
      }

      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: false,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      // Deletar apenas se pertencer ao usuário
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao deletar mensagem de chat', { messageId, userId, error });
        return {
          data: false,
          error: new Error(`Erro ao deletar mensagem: ${error.message}`),
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao deletar mensagem de chat', { messageId, userId, error });
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Deleta todo o histórico de chat do usuário
   */
  static async deleteAll(userId: string): Promise<RepositoryResult<boolean>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: false,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { error } = await supabase.from('chat_messages').delete().eq('user_id', userId);

      if (error) {
        logger.error('Erro ao deletar histórico de chat', { userId, error });
        return {
          data: false,
          error: new Error(`Erro ao deletar histórico: ${error.message}`),
        };
      }

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao deletar histórico de chat', { userId, error });
      return {
        data: false,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }

  /**
   * Busca última mensagem do usuário
   */
  static async getLastMessage(userId: string): Promise<RepositoryResult<ChatMessageLocal | null>> {
    try {
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.isValid) {
        return {
          data: null,
          error: new Error(userIdValidation.errors[0].message),
        };
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao buscar última mensagem', { userId, error });
        return {
          data: null,
          error: new Error(`Erro ao buscar última mensagem: ${error.message}`),
        };
      }

      return {
        data: data || null,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao buscar última mensagem', { userId, error });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      };
    }
  }
}

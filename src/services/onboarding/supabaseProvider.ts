/**
 * Supabase Provider para Onboarding
 *
 * Provider que salva respostas no Supabase
 * Com tratamento de erros e fallback para mock quando necessário
 */

import { OnboardingAnswer, OnboardingSession } from '@/types/onboarding-questions';
import { logger } from '@/lib/logger';
import { mockProvider } from './mockProvider';
import { SUPABASE_CONFIG } from '@/config/api';

export interface SupabaseProviderResult {
  success: boolean;
  error?: string;
  data?: OnboardingSession;
}

/**
 * Verifica se o Supabase está disponível
 * Usa SUPABASE_CONFIG que já faz a verificação correta de múltiplas variáveis de ambiente
 */
function isSupabaseAvailable(): boolean {
  try {
    const supabaseUrl = SUPABASE_CONFIG.URL?.trim();
    const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY?.trim();

    const isAvailable = !!(supabaseUrl && supabaseAnonKey);

    // Log de debug apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      logger.info('Supabase availability check', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        isAvailable,
        urlPrefix: supabaseUrl?.substring(0, 20) || 'N/A',
      });
    }

    return isAvailable;
  } catch (error: unknown) {
    logger.warn('Error checking Supabase availability', error as Error);
    return false;
  }
}

/**
 * Obtém o cliente Supabase de forma segura
 */
async function getSupabaseClient() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase não configurado');
  }

  const { supabase } = await import('@/services/supabase');
  return supabase;
}

/**
 * Salva respostas do onboarding no Supabase
 */
export async function saveOnboardingAnswersSupabase(
  answers: OnboardingAnswer[],
  userId?: string | null
): Promise<SupabaseProviderResult> {
  try {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable()) {
      // Sempre usar mock como fallback quando Supabase não estiver disponível
      logger.warn('Supabase não configurado, usando mock provider como fallback');
      return mockProvider.save(answers, userId);
    }

    const supabase = await getSupabaseClient();

    // Se não há userId, tentar obter do Supabase auth
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        finalUserId = user?.id || null;
      } catch (authError: unknown) {
        // Se falhar ao obter usuário, usar mock como fallback
        logger.warn('Erro ao obter usuário do Supabase, usando mock provider', authError as Error);
        return mockProvider.save(answers, null);
      }
    }

    // Se ainda não há userId, usar mock como fallback
    if (!finalUserId) {
      logger.warn('No user ID, falling back to mock provider');
      return mockProvider.save(answers, null);
    }

    // Inserir cada resposta no Supabase
    const insertPromises = answers.map((answer) =>
      supabase.from('onboarding_answers').insert({
        user_id: finalUserId,
        question_id: answer.questionId,
        answer: answer.answer,
        created_at: answer.timestamp,
      })
    );

    const results = await Promise.all(insertPromises);

    // Verificar se houve erros
    const errors = results.filter((result) => result.error);
    if (errors.length > 0) {
      throw new Error(`Erro ao salvar ${errors.length} respostas`);
    }

    logger.info('Onboarding answers saved to Supabase', {
      answerCount: answers.length,
      userId: finalUserId,
    });

    const session: OnboardingSession = {
      userId: finalUserId || undefined,
      answers,
      completedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: session,
    };
  } catch (error: unknown) {
    logger.error('Error saving onboarding answers to Supabase', error as Error);

    // Sempre fazer fallback para mock em caso de erro
    logger.warn('Falling back to mock provider due to Supabase error');
    return mockProvider.save(answers, userId);
  }
}

/**
 * Carrega respostas do onboarding do Supabase
 */
export async function loadOnboardingAnswersSupabase(userId?: string | null): Promise<SupabaseProviderResult> {
  try {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable()) {
      // Sempre usar mock como fallback quando Supabase não estiver disponível
      logger.warn('Supabase não configurado, usando mock provider como fallback');
      return mockProvider.load();
    }

    const supabase = await getSupabaseClient();

    // Se não há userId, tentar obter do Supabase auth
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        finalUserId = user?.id || null;
      } catch (authError: unknown) {
        // Se falhar ao obter usuário, usar mock como fallback
        logger.warn('Erro ao obter usuário do Supabase, usando mock provider', authError as Error);
        return mockProvider.load();
      }
    }

    // Se ainda não há userId, usar mock como fallback
    if (!finalUserId) {
      logger.warn('No user ID, falling back to mock provider');
      return mockProvider.load();
    }

    // Buscar respostas do Supabase
    const { data, error } = await supabase
      .from('onboarding_answers')
      .select('question_id, answer, created_at')
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Converter para formato OnboardingAnswer
    const answers: OnboardingAnswer[] =
      data?.map((row) => ({
        questionId: row.question_id,
        answer: row.answer,
        timestamp: row.created_at,
      })) || [];

    const session: OnboardingSession = {
      userId: finalUserId || undefined,
      answers,
    };

    return {
      success: true,
      data: session,
    };
  } catch (error: unknown) {
    logger.error('Error loading onboarding answers from Supabase', error as Error);

    // Sempre fazer fallback para mock em caso de erro
    logger.warn('Falling back to mock provider due to Supabase error');
    return mockProvider.load();
  }
}

/**
 * Verifica se onboarding foi completado (Supabase)
 */
export async function hasCompletedOnboardingSupabase(userId?: string | null): Promise<boolean> {
  try {
    // Verificar se Supabase está disponível
    if (!isSupabaseAvailable()) {
      // Sempre usar mock como fallback quando Supabase não estiver disponível
      return mockProvider.hasCompleted();
    }

    const supabase = await getSupabaseClient();

    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        finalUserId = user?.id || null;
      } catch (authError) {
        // Se falhar ao obter usuário, usar mock como fallback
        return mockProvider.hasCompleted();
      }
    }

    if (!finalUserId) {
      return mockProvider.hasCompleted();
    }

    const { data, error } = await supabase.from('onboarding_answers').select('id').eq('user_id', finalUserId).limit(1);

    if (error) {
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error: unknown) {
    logger.error('Error checking onboarding completion in Supabase', error as Error);

    // Sempre fazer fallback para mock em caso de erro
    return mockProvider.hasCompleted();
  }
}

/**
 * Provider principal que detecta modo e delega para função apropriada
 */
export const supabaseProvider = {
  save: saveOnboardingAnswersSupabase,
  load: loadOnboardingAnswersSupabase,
  hasCompleted: hasCompletedOnboardingSupabase,
};

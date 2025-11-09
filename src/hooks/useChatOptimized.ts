import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Alert } from 'react-native';
import { sendNathiaMessage } from '@/services/api/nathia-api';
import { getChatHistory, saveChatMessage } from '@/services/supabase';
import { logger } from '@/utils/logger';
import { hasPendingMessages, saveOfflineMessage, syncPendingMessages } from '@/utils/offlineStorage';
import { isRecoverableError, smartRetry } from '@/utils/retry';

// Tipos
export type Message = {
  id: string | number;
  content: string;
  role: string;
  createdAt?: Date;
  actions?: Array<{
    type: string;
    label: string;
    data?: any;
  }>;
};

interface ChatContext {
  type?: string;
  pregnancy_week?: number;
  baby_name?: string;
  preferences?: string[];
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useChatOptimized() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [userContext, setUserContext] = useState<ChatContext | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Carregar perfil do usuário e histórico ao montar
  useEffect(() => {
    loadUserProfileAndHistory();
  }, []);

  // Configurar logger com userId quando disponível
  useEffect(() => {
    if (userId) {
      logger.setUserId(userId);
    }
  }, [userId]);

  // Sync pendente ao voltar online
  useEffect(() => {
    if (!userId) return;

    const checkPendingSync = async () => {
      try {
        const hasPending = await hasPendingMessages();
        if (hasPending) {
          logger.info('Verificando mensagens pendentes para sincronização');

          await syncPendingMessages(async (message) => {
            if (message.role === 'user') {
              await saveChatMessage({
                user_id: userId,
                message: message.content,
                response: '',
                context_data: {
                  offline_message: true,
                  timestamp: message.timestamp,
                },
              });
            }
          });
        }
      } catch (error) {
        logger.error('Erro ao verificar mensagens pendentes', {}, error);
      }
    };

    // Verificar a cada 30 segundos se há mensagens pendentes
    const interval = setInterval(checkPendingSync, 30000);
    checkPendingSync(); // Executar imediatamente

    return () => clearInterval(interval);
  }, [userId]);

  const loadUserProfileAndHistory = async () => {
    try {
      // Carregar perfil do usuário
      const profileJson = await AsyncStorage.getItem('userProfile');
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        setUserContext({
          type: profile.type,
          pregnancy_week: profile.pregnancy_week,
          baby_name: profile.baby_name,
          preferences: profile.preferences,
        });
      }

      // Carregar userId
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);

        // Carregar histórico de mensagens
        try {
          const history = await getChatHistory(storedUserId, 50);
          if (history && history.length > 0) {
            const formattedMessages = history.flatMap((msg) => [
              { id: `${msg.id}-user`, content: msg.message, role: 'user', createdAt: new Date(msg.created_at) },
              { id: `${msg.id}-ai`, content: msg.response, role: 'assistant', createdAt: new Date(msg.created_at) },
            ]);
            dispatch({ type: 'SET_MESSAGES', payload: formattedMessages });
          }
        } catch (error) {
          logger.warn('Erro ao carregar histórico', {}, error);
        }
      }
    } catch (error) {
      logger.error('Erro ao carregar perfil', {}, error);
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: Date.now(),
        content,
        role: 'user',
        createdAt: new Date(),
      };

      // Adicionar mensagem do usuário imediatamente
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        if (!userId) {
          throw new Error('userId é obrigatório para chat com NAT-IA');
        }

        // Preparar contexto para API
        const context = userContext
          ? {
              stage: userContext.type,
              pregnancyWeek: userContext.pregnancy_week,
              mood: undefined, // Pode ser extraído do histórico se necessário
              concerns: userContext.preferences || [],
            }
          : undefined;

        // Chamar API POST /nathia-chat
        logger.debug('Iniciando chamada de NAT-IA via API', { messageLength: content.length, userId });

        const response = await smartRetry(
          () =>
            sendNathiaMessage({
              message: content,
              userId,
              context,
            }),
          {
            maxRetries: 3,
            initialDelay: 1000,
            onRetry: (attempt, error) => {
              logger.warn(
                `Retry ${attempt} de NAT-IA falhou`,
                { attempt, isRecoverable: isRecoverableError(error) },
                error
              );
            },
          },
          logger
        );

        logger.info('Resposta da IA recebida com sucesso', { responseLength: response.reply.length });

        // Verificar segurança
        if (response.safety && response.safety.level !== 'safe') {
          if (response.safety.level === 'urgent' || response.safety.level === 'warning') {
            Alert.alert(
              '🚨 Atenção',
              response.safety.warning ||
                'Detectamos que você pode estar com sintomas graves. Procure ajuda médica IMEDIATAMENTE. Ligue para o SAMU: 192',
              [
                { text: 'OK', style: 'default' },
                ...(response.safety.supportResources
                  ? response.safety.supportResources.map((resource) => ({
                      text: resource,
                      style: 'default' as const,
                    }))
                  : []),
              ]
            );
          }
        }

        const aiMessage: Message = {
          id: Date.now() + 1,
          content: response.reply,
          role: 'assistant',
          createdAt: new Date(),
        };

        // Adicionar resposta da IA
        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
        dispatch({ type: 'SET_LOADING', payload: false });

        // Salvar mensagem no Supabase
        if (userId) {
          try {
            await smartRetry(
              () =>
                saveChatMessage({
                  user_id: userId,
                  message: content,
                  response: response.reply,
                  context_data: {
                    safety_level: response.safety?.level,
                    actions: response.actions,
                    timestamp: new Date().toISOString(),
                  },
                }),
              { maxRetries: 2, initialDelay: 500 },
              logger
            );
            logger.debug('Mensagem salva no Supabase', { userId: userId.substring(0, 8) });
          } catch (dbError: any) {
            logger.error('Erro ao salvar mensagem no banco', { userId }, dbError);

            // Fallback: salvar offline
            try {
              await saveOfflineMessage(content, 'user', { userId });
              await saveOfflineMessage(response.reply, 'assistant', { userId });
              logger.info('Mensagens salvas offline como backup');
            } catch (offlineError) {
              logger.error('Falha ao salvar offline', {}, offlineError);
            }
          }
        }
      } catch (error: any) {
        logger.error('Erro ao processar mensagem completa', { userId, contentLength: content.length }, error);

        dispatch({ type: 'SET_LOADING', payload: false });

        // Determinar mensagem de erro apropriada
        let errorMessage = 'Desculpa, estou com um probleminha técnico. Pode tentar novamente? 💕';

        if (isRecoverableError(error)) {
          errorMessage = 'Sem conexão com a internet. Sua mensagem será enviada quando voltar online.';

          // Salvar offline
          try {
            await saveOfflineMessage(content, 'user', { userId: userId || undefined });
            logger.info('Mensagem salva offline devido a erro de rede');
          } catch (offlineError) {
            logger.error('Falha ao salvar offline após erro de rede', {}, offlineError);
          }
        }

        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage,
        });

        // Mostrar mensagem de erro amigável para o usuário
        Alert.alert('Ops!', errorMessage, [{ text: 'OK' }]);
      }
    },
    [userId, userContext, state.messages]
  );

  // Memoização do histórico da IA
  const aiHistory = useMemo(() => {
    return state.messages
      .filter((m) => m.role !== 'system')
      .slice(-20) // Limitar a últimas 20 mensagens
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
  }, [state.messages]);

  const resetChat = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    messages: state.messages,
    loading: state.loading,
    initialLoading,
    error: state.error,
    sendMessage,
    aiHistory,
    resetChat,
    reloadHistory: loadUserProfileAndHistory,
    userContext,
  };
}

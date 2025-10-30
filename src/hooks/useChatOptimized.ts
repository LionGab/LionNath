import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Alert } from 'react-native';
import { ChatContext, chatWithAI, detectUrgency } from '../services/ai';
import { getChatHistory, saveChatMessage } from '../services/supabase';

// Tipos
export type Message = {
  id: string | number;
  content: string;
  role: string;
  createdAt?: Date;
};

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
            const formattedMessages = history.flatMap(msg => [
              { id: `${msg.id}-user`, content: msg.message, role: 'user', createdAt: new Date(msg.created_at) },
              { id: `${msg.id}-ai`, content: msg.response, role: 'assistant', createdAt: new Date(msg.created_at) },
            ]);
            dispatch({ type: 'SET_MESSAGES', payload: formattedMessages });
          }
        } catch (error) {
          console.log('Erro ao carregar histórico:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content,
      role: 'user',
      createdAt: new Date()
    };

    // Adicionar mensagem do usuário imediatamente
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Detectar urgência
      const isUrgent = detectUrgency(content);
      if (isUrgent) {
        Alert.alert(
          '🚨 Atenção',
          'Detectamos que você pode estar com sintomas graves. Procure ajuda médica IMEDIATAMENTE. Ligue para o SAMU: 192',
          [
            { text: 'OK', style: 'default' },
            {
              text: 'Ligar SAMU',
              style: 'destructive',
              onPress: () => {
                // Linking.openURL('tel:192'); // Será implementado no ChatScreen
              }
            }
          ]
        );
      }

      // Preparar contexto para IA
      const context: ChatContext = userContext || {};

      // Converter mensagens para formato esperado pela IA
      const aiMessages = state.messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Chamar API de IA
      const aiResponse = await chatWithAI(content, context, aiMessages);

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: aiResponse,
        role: 'assistant',
        createdAt: new Date()
      };

      // Adicionar resposta da IA
      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      dispatch({ type: 'SET_LOADING', payload: false });

      // Salvar no Supabase se userId estiver disponível
      if (userId) {
        try {
          await saveChatMessage({
            user_id: userId,
            message: content,
            response: aiResponse,
            context_data: {
              is_urgent: isUrgent,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (dbError) {
          console.error('Erro ao salvar mensagem no banco:', dbError);
          // Não quebra o fluxo se falhar ao salvar
        }
      }

    } catch (error: any) {
      console.error('Erro ao processar mensagem:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({
        type: 'SET_ERROR',
        payload: 'Desculpa, estou com um probleminha técnico. Pode tentar novamente? 💕'
      });

      // Mostrar mensagem de erro amigável para o usuário
      Alert.alert(
        'Ops!',
        'Não consegui processar sua mensagem. Verifique sua conexão e tente novamente.',
        [{ text: 'OK' }]
      );
    }
  }, [userId, userContext, state.messages]);

  // Memoização do histórico da IA
  const aiHistory = useMemo(() => {
    return state.messages
      .filter(m => m.role !== 'system')
      .slice(-20) // Limitar a últimas 20 mensagens
      .map(msg => ({
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

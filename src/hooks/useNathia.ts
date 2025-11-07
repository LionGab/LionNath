/**
 * Hook useNathia - Gerenciamento principal da conversação com NAT-IA
 *
 * Features:
 * - Gerencia estado de mensagens
 * - Integração com Edge Function nathia-chat
 * - Persistência local via AsyncStorage
 * - Sincronização com backend (Supabase)
 * - Contexto automático (stage, mood, concerns)
 * - Processa actions retornadas pelo Claude
 * - Error handling gracioso
 *
 * @example
 * const { sendMessage, messages, loading, error, clearHistory } = useNathia();
 *
 * await sendMessage("Estou me sentindo ansiosa");
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  nathiaClient,
  NathiaChatRequest,
  NathiaChatResponse,
  NathiaAction,
  NathiaClientError,
  getOfflineFallbackResponse,
} from '@/services/nathia-client';
import { saveChatMessage, getChatHistory } from '@/services/supabase';
import { logger } from '@/lib/logger';

const STORAGE_KEY = '@nathia_messages';
const MAX_CONTEXT_MESSAGES = 10;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: NathiaAction[];
  suggestedReplies?: string[];
}

export interface UserContext {
  userId: string;
  stage?: 'gestante' | 'mae' | 'tentante' | 'puerperio';
  pregnancyWeek?: number;
  mood?: string;
  concerns?: string[];
}

export interface UseNathiaResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  isTyping: boolean;
  lastActions: NathiaAction[];
  suggestedReplies: string[];
  contextUpdate: NathiaChatResponse['contextUpdate'] | null;
}

export function useNathia(context: UserContext): UseNathiaResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActions, setLastActions] = useState<NathiaAction[]>([]);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [contextUpdate, setContextUpdate] = useState<NathiaChatResponse['contextUpdate'] | null>(
    null
  );

  const isLoadingHistory = useRef(false);

  // Carrega histórico do AsyncStorage e Supabase
  useEffect(() => {
    loadHistory();
  }, [context.userId]);

  const loadHistory = async () => {
    if (isLoadingHistory.current) return;
    isLoadingHistory.current = true;

    try {
      // 1. Tenta carregar do AsyncStorage primeiro (offline-first)
      const localData = await AsyncStorage.getItem(STORAGE_KEY);
      if (localData) {
        const localMessages: Message[] = JSON.parse(localData);
        setMessages(
          localMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }

      // 2. Sincroniza com Supabase em background
      const remoteHistory = await getChatHistory(context.userId, 50);
      if (remoteHistory.length > 0) {
        const formattedMessages: Message[] = [];

        remoteHistory.forEach((chat) => {
          // Mensagem do usuário
          formattedMessages.push({
            id: `${chat.id}-user`,
            role: 'user',
            content: chat.message,
            timestamp: new Date(chat.created_at),
          });

          // Resposta da assistente
          formattedMessages.push({
            id: `${chat.id}-assistant`,
            role: 'assistant',
            content: chat.response,
            timestamp: new Date(chat.created_at),
          });
        });

        setMessages(formattedMessages);
        await saveToLocalStorage(formattedMessages);
      }
    } catch (err) {
      logger.error('Erro ao carregar histórico NAT-IA', err);
    } finally {
      isLoadingHistory.current = false;
    }
  };

  const saveToLocalStorage = async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (err) {
      logger.error('Erro ao salvar no AsyncStorage', err);
    }
  };

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim()) return;

      setLoading(true);
      setError(null);
      setIsTyping(false);

      // Adiciona mensagem do usuário imediatamente
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      try {
        // Prepara contexto para envio
        const previousMessages = updatedMessages
          .slice(-MAX_CONTEXT_MESSAGES)
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        const request: NathiaChatRequest = {
          message: messageText.trim(),
          userId: context.userId,
          context: {
            stage: context.stage,
            pregnancyWeek: context.pregnancyWeek,
            mood: context.mood,
            concerns: context.concerns,
            previousMessages,
          },
        };

        // Mostra typing indicator
        setIsTyping(true);

        // Chama API
        let response: NathiaChatResponse;
        try {
          response = await nathiaClient.sendMessage(request);
        } catch (apiError) {
          // Fallback offline
          if (
            apiError instanceof NathiaClientError &&
            (apiError.isNetworkError || apiError.isTimeout)
          ) {
            response = getOfflineFallbackResponse();
          } else {
            throw apiError;
          }
        }

        setIsTyping(false);

        // Adiciona resposta da assistente
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          actions: response.actions,
          suggestedReplies: response.suggestedReplies,
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        // Atualiza ações e sugestões
        setLastActions(response.actions || []);
        setSuggestedReplies(response.suggestedReplies || []);
        setContextUpdate(response.contextUpdate || null);

        // Salva localmente
        await saveToLocalStorage(finalMessages);

        // Salva no Supabase em background (não bloqueia UX)
        saveChatMessage({
          user_id: context.userId,
          message: messageText.trim(),
          response: response.response,
          context_data: {
            stage: context.stage,
            mood: context.mood,
            actions: response.actions,
            riskLevel: response.contextUpdate?.riskLevel,
          },
        }).catch((err) => {
          logger.error('Erro ao salvar mensagem no Supabase', err);
        });
      } catch (err) {
        setIsTyping(false);

        const errorMessage =
          err instanceof NathiaClientError
            ? err.message
            : 'Algo deu errado. Tente novamente.';

        setError(errorMessage);
        logger.error('Erro ao enviar mensagem NAT-IA', err);

        // Mostra mensagem de erro como resposta da assistente
        const errorAssistantMessage: Message = {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        };

        const finalMessages = [...updatedMessages, errorAssistantMessage];
        setMessages(finalMessages);
        await saveToLocalStorage(finalMessages);
      } finally {
        setLoading(false);
      }
    },
    [messages, context]
  );

  const clearHistory = useCallback(async () => {
    try {
      setMessages([]);
      setLastActions([]);
      setSuggestedReplies([]);
      setContextUpdate(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      logger.error('Erro ao limpar histórico', err);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    isTyping,
    lastActions,
    suggestedReplies,
    contextUpdate,
  };
}

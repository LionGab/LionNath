/**
 * Context Manager - Gerenciamento inteligente de contexto de longo prazo
 *
 * Sistema de 3 camadas:
 * 1. Contexto Quente (últimas 30 mensagens)
 * 2. Contexto Resumido (mensagens 31-100)
 * 3. Perfil da Usuária (onboarding + dados demográficos)
 */

import { supabase } from '@/services/supabase';
import { NAT_AI_SYSTEM_PROMPT } from './system-prompt';

export interface UserProfile {
  id: string;
  full_name: string;
  type?: 'gestante' | 'mae' | 'tentante';
  pregnancy_week?: number;
  baby_name?: string;
  preferences?: string[];
  onboarding_data?: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface LoadedContext {
  recentMessages: Message[];
  historySummary: string;
  userProfile: UserProfile;
  conversationId?: string;
}

export class ContextManager {
  private userId: string;
  private conversationId: string | null;
  private cachedProfile: UserProfile | null = null;
  private cachedSummary: string | null = null;
  private lastSummaryCount: number = 0;

  constructor(userId: string, conversationId?: string) {
    this.userId = userId;
    this.conversationId = conversationId || null;
  }

  /**
   * Carrega todo o contexto necessário para uma conversa
   */
  async loadContext(): Promise<LoadedContext> {
    try {
      // 1. Carregar perfil da usuária (cache se possível)
      const userProfile = await this.loadUserProfile();

      // 2. Carregar ou criar conversa
      const conversation = await this.loadOrCreateConversation();
      this.conversationId = conversation.id;

      // 3. Carregar mensagens recentes (contexto quente)
      const recentMessages = await this.loadRecentMessages(conversation.id, 30);

      // 4. Carregar ou gerar resumo (contexto resumido)
      const historySummary = await this.loadOrGenerateSummary(conversation, recentMessages);

      return {
        recentMessages,
        historySummary,
        userProfile,
        conversationId: conversation.id,
      };
    } catch (error: any) {
      console.error('Erro ao carregar contexto:', error);
      throw new Error(`Falha ao carregar contexto: ${error.message}`);
    }
  }

  /**
   * Carrega perfil da usuária (com cache)
   */
  private async loadUserProfile(): Promise<UserProfile> {
    // Usar cache se disponível
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    const { data: profile, error } = await supabase.from('user_profiles').select('*').eq('id', this.userId).single();

    if (error || !profile) {
      throw new Error('Perfil não encontrado');
    }

    this.cachedProfile = {
      id: profile.id,
      full_name: profile.full_name || 'Querida',
      type: profile.type,
      pregnancy_week: profile.pregnancy_week,
      baby_name: profile.baby_name,
      preferences: profile.preferences || [],
      onboarding_data: profile.onboarding_data,
    };

    return this.cachedProfile;
  }

  /**
   * Carrega ou cria conversa
   */
  private async loadOrCreateConversation() {
    if (this.conversationId) {
      const { data } = await supabase.from('conversation_history').select('*').eq('id', this.conversationId).single();

      if (data) {
        return data;
      }
    }

    // Criar nova conversa
    const { data, error } = await supabase
      .from('conversation_history')
      .insert({
        user_id: this.userId,
        context_summary: '',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Falha ao criar conversa');
    }

    this.conversationId = data.id;
    return data;
  }

  /**
   * Carrega mensagens recentes (contexto quente)
   */
  private async loadRecentMessages(conversationId: string, limit: number = 30): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Carregar mais para ter certeza

    if (error || !messages) {
      return [];
    }

    // Converter para formato Message
    const formattedMessages: Message[] = [];

    // Processar em pares (user message + assistant response)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'user' && msg.message) {
        formattedMessages.push({
          id: msg.id,
          role: 'user',
          content: msg.message,
          created_at: msg.created_at,
        });

        // Procurar resposta correspondente
        const response = messages.find((m) => m.role === 'assistant' && m.created_at > msg.created_at && m.response);
        if (response && response.response) {
          formattedMessages.push({
            id: response.id,
            role: 'assistant',
            content: response.response,
            created_at: response.created_at,
          });
        }
      }
    }

    // Retornar últimas 30 mensagens
    return formattedMessages.slice(-limit);
  }

  /**
   * Carrega ou gera resumo de mensagens antigas
   */
  private async loadOrGenerateSummary(conversation: any, recentMessages: Message[]): Promise<string> {
    // Se já temos resumo e não há muitas mensagens novas, usar cache
    if (this.cachedSummary && recentMessages.length <= this.lastSummaryCount + 10) {
      return this.cachedSummary;
    }

    // Se há resumo salvo na conversa e não há muitas mensagens novas, usar
    if (conversation.context_summary && recentMessages.length <= 50) {
      this.cachedSummary = conversation.context_summary;
      this.lastSummaryCount = recentMessages.length;
      return conversation.context_summary;
    }

    // Se há mais de 50 mensagens, precisamos resumir
    if (recentMessages.length > 50) {
      // Carregar mensagens antigas para resumir
      const { data: oldMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .range(30, 99); // Mensagens 31-100

      if (oldMessages && oldMessages.length > 0) {
        const messagesToSummarize: Array<{ role: 'user' | 'model'; content: string }> = oldMessages.map((msg) => ({
          role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: (msg.role === 'user' ? msg.message : msg.response || '') as string,
        }));

        const summary = await summarizeMessagesLocally(messagesToSummarize);

        // Salvar resumo na conversa
        await supabase.from('conversation_history').update({ context_summary: summary }).eq('id', conversation.id);

        this.cachedSummary = summary;
        this.lastSummaryCount = recentMessages.length;
        return summary;
      }
    }

    return '';
  }

  /**
   * Formata contexto para Gemini (enriquece system prompt)
   */
  formatForGemini(context: LoadedContext): string {
    const profileText = this.humanizeProfile(context.userProfile);
    const summaryText = context.historySummary ? `\n\n# RESUMO DE CONVERSAS ANTERIORES\n${context.historySummary}` : '';

    return `${NAT_AI_SYSTEM_PROMPT}\n\n# CONTEXTO DA USUÁRIA\n${profileText}${summaryText}`;
  }

  /**
   * Transforma perfil JSON em texto natural
   */
  private humanizeProfile(profile: UserProfile): string {
    let text = `Nome: ${profile.full_name}\n`;

    if (profile.type) {
      const typeText = profile.type === 'gestante' ? `Gestante` : profile.type === 'mae' ? `Mãe` : `Tentante`;
      text += `Tipo: ${typeText}\n`;

      if (profile.type === 'gestante' && profile.pregnancy_week) {
        text += `Semana de gravidez: ${profile.pregnancy_week}\n`;
      }

      if (profile.baby_name) {
        text += `Nome do bebê/filho: ${profile.baby_name}\n`;
      }
    }

    if (profile.preferences && profile.preferences.length > 0) {
      text += `Interesses: ${profile.preferences.join(', ')}\n`;
    }

    if (profile.onboarding_data) {
      const onboarding = profile.onboarding_data;
      if (onboarding.challenges) {
        text += `Desafios mencionados: ${Array.isArray(onboarding.challenges) ? onboarding.challenges.join(', ') : onboarding.challenges}\n`;
      }
      if (onboarding.goals) {
        text += `Objetivos: ${Array.isArray(onboarding.goals) ? onboarding.goals.join(', ') : onboarding.goals}\n`;
      }
    }

    return text;
  }

  /**
   * Verifica se precisa resumir e resumir se necessário
   */
  async checkAndSummarizeIfNeeded(): Promise<void> {
    if (!this.conversationId) return;

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (!messages || messages.length <= 50) {
      return; // Não precisa resumir ainda
    }

    // Verificar se já tem resumo recente
    const { data: conversation } = await supabase
      .from('conversation_history')
      .select('context_summary, updated_at')
      .eq('id', this.conversationId)
      .single();

    if (conversation?.context_summary) {
      // Verificar quando foi atualizado pela última vez
      const lastUpdate = new Date(conversation.updated_at);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

      // Só resumir se passou mais de 7 dias ou há mais de 20 mensagens novas
      if (daysSinceUpdate < 7 && messages.length - this.lastSummaryCount < 20) {
        return;
      }
    }

    // Gerar novo resumo
    const oldMessages = messages.slice(30, 99);
    if (oldMessages.length > 0) {
      const messagesToSummarize: Array<{ role: 'user' | 'model'; content: string }> = oldMessages.map((msg) => ({
        role: (msg.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        content: (msg.role === 'user' ? msg.message : msg.response || '') as string,
      }));

      const summary = await summarizeMessagesLocally(messagesToSummarize);

      await supabase
        .from('conversation_history')
        .update({
          context_summary: summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', this.conversationId);

      this.cachedSummary = summary;
      this.lastSummaryCount = messages.length;
    }
  }

  /**
   * Limpa cache (útil após atualizações de perfil)
   */
  clearCache(): void {
    this.cachedProfile = null;
    this.cachedSummary = null;
    this.lastSummaryCount = 0;
  }
}

interface SummarizableMessage {
  role: 'user' | 'model';
  content: string;
}

async function summarizeMessagesLocally(messages: SummarizableMessage[]): Promise<string> {
  const filtered = messages
    .filter((msg) => typeof msg.content === 'string' && msg.content.trim().length > 0)
    .map((msg) => ({
      role: msg.role,
      content: normalizeWhitespace(msg.content),
    }));

  if (filtered.length === 0) {
    return '';
  }

  const userHighlights = filtered.filter((msg) => msg.role === 'user').slice(-3);
  const assistantHighlights = filtered.filter((msg) => msg.role === 'model').slice(-2);

  const summaryLines: string[] = [];

  if (userHighlights.length > 0) {
    summaryLines.push('Principais sentimentos recentes da usuária:');
    userHighlights.forEach((msg, index) => {
      summaryLines.push(`- (${index + 1}) ${truncateSentence(msg.content)}`);
    });
  }

  if (assistantHighlights.length > 0) {
    summaryLines.push('\nComo a NAT-AI respondeu:');
    assistantHighlights.forEach((msg, index) => {
      summaryLines.push(`- Resposta ${index + 1}: ${truncateSentence(msg.content)}`);
    });
  }

  if (summaryLines.length === 0) {
    const lastMessage = filtered[filtered.length - 1];
    return `Resumo automático: ${truncateSentence(lastMessage.content)}`;
  }

  return summaryLines.join('\n');
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function truncateSentence(text: string, maxLength: number = 180): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : truncated.length)}…`;
}

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG } from '../config/api';

// ⚠️ CONFIGURE SUAS CREDENCIAIS DO SUPABASE
// Substitua pelos valores do seu projeto Supabase no arquivo .env.local

const supabaseUrl = SUPABASE_CONFIG.URL || '';
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY || '';

// Validação básica para evitar erros silenciosos
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase não configurado. Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface UserProfile {
  id: string;
  email?: string;
  name: string;
  type: 'gestante' | 'mae' | 'tentante';
  pregnancy_week?: number;
  baby_name?: string;
  preferences: string[];
  subscription_tier: 'free' | 'premium';
  created_at: string;
  daily_interactions: number;
  last_interaction_date: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  created_at: string;
  context_data?: any;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  priorities: string[];
  tip: string;
  tip_video_url?: string;
  recipe: string;
  created_at: string;
}

// Função auxiliar para criar usuário temporário
export const createTemporaryUser = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
};

// Função para salvar perfil
export const saveUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile)
    .select();

  if (error) throw error;
  return data;
};

// Função para salvar mensagem de chat
export const saveChatMessage = async (message: Partial<ChatMessage>) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select();

  if (error) throw error;
  return data;
};

// Função para buscar histórico de chat
export const getChatHistory = async (userId: string, limit: number = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data?.reverse() || [];
};

// Função para salvar plano diário
export const saveDailyPlan = async (plan: Partial<DailyPlan>) => {
  const { data, error } = await supabase
    .from('daily_plans')
    .upsert(plan)
    .select();

  if (error) throw error;
  return data;
};

// Função para buscar plano diário
export const getDailyPlan = async (userId: string, date: string) => {
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

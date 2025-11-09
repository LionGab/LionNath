/**
 * Demo Data Provider - Sistema de Mocks Completo
 *
 * Provider que injeta dados mockados quando USE_MOCKS=true
 * Permite desenvolvimento e demo sem necessidade de Supabase configurado
 *
 * @example
 * // No App.tsx:
 * {process.env.EXPO_PUBLIC_USE_MOCKS === 'true' ? (
 *   <DemoDataProvider>
 *     <AppNavigator />
 *   </DemoDataProvider>
 * ) : (
 *   <AppNavigator />
 * )}
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import type { UserProfile, ChatMessage, DailyPlan } from '@/services/supabase';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

// Dados mockados para demo
const MOCK_USER: User = {
  id: 'demo-user-123',
  email: 'demo@demo.com',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    name: 'Maria Silva',
  },
  aud: 'authenticated',
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change: null,
  phone: null,
  phone_confirmed_at: null,
  phone_change: null,
  phone_change_token: null,
  phone_change_sent_at: null,
  confirmed_at: new Date().toISOString(),
  email_change_confirm_status: 0,
  banned_until: null,
  is_anonymous: false,
} as User;

const MOCK_PROFILE: UserProfile = {
  id: 'demo-user-123',
  email: 'demo@demo.com',
  name: 'Maria Silva',
  type: 'gestante',
  pregnancy_week: 20,
  baby_name: null,
  preferences: ['saude', 'nutricao', 'exercicios'],
  subscription_tier: 'free',
  created_at: new Date().toISOString(),
  daily_interactions: 5,
  last_interaction_date: new Date().toISOString(),
};

const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    user_id: 'demo-user-123',
    message: 'Olá! Estou na semana 20 de gravidez. Como posso me alimentar melhor?',
    response:
      'Olá! Parabéns pela sua gestação! Na semana 20, é importante manter uma alimentação equilibrada. Priorize alimentos ricos em ferro, ácido fólico e cálcio. Inclua folhas verdes escuras, leguminosas, carnes magras e laticínios na sua dieta. Beba bastante água e evite alimentos ultraprocessados. Quer que eu detalhe algum grupo alimentar específico?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    user_id: 'demo-user-123',
    message: 'Quais exercícios são seguros para fazer agora?',
    response:
      'Excelente pergunta! Na semana 20, exercícios de baixo impacto são ideais: caminhada, natação, yoga pré-natal, pilates adaptado e alongamentos suaves. Evite exercícios de alto impacto, contato físico ou que exijam equilíbrio extremo. Sempre escute seu corpo e pare se sentir desconforto. Recomendo consultar seu médico antes de iniciar qualquer nova atividade física. Quer sugestões de rotina específica?',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const MOCK_DAILY_PLANS: DailyPlan[] = [
  {
    id: 'plan-1',
    user_id: 'demo-user-123',
    date: new Date().toISOString().split('T')[0],
    priorities: ['Hidratação', 'Descanso', 'Alimentação equilibrada'],
    tip: 'Lembre-se de beber pelo menos 2 litros de água por dia. A hidratação é essencial para você e seu bebê!',
    tip_video_url: null,
    recipe:
      'Smoothie de banana com espinafre: 1 banana, 1 xícara de espinafre, 200ml de leite de amêndoas, 1 colher de chia. Bata tudo e aproveite!',
    created_at: new Date().toISOString(),
  },
];

const MOCK_POSTS = [
  {
    id: 'post-1',
    user_id: 'demo-user-123',
    content: 'Hoje completei 20 semanas! Estou me sentindo muito bem e animada para os próximos meses 💕',
    image_url: null,
    likes_count: 12,
    comments_count: 3,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'post-2',
    user_id: 'demo-user-456',
    content: 'Dica de ouro: alongamentos pela manhã fazem toda diferença! Me sinto muito mais disposta durante o dia.',
    image_url: null,
    likes_count: 8,
    comments_count: 1,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

interface DemoClientContextValue {
  // Auth
  user: User | null;
  session: any;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;

  // Profile
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;

  // Chat
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<ChatMessage>;
  getChatHistory: () => Promise<ChatMessage[]>;

  // Daily Plans
  dailyPlans: DailyPlan[];
  getDailyPlan: (date: string) => Promise<DailyPlan | null>;
  saveDailyPlan: (plan: Partial<DailyPlan>) => Promise<DailyPlan>;

  // Posts/Feed
  posts: any[];
  fetchPosts: () => Promise<any[]>;
  createPost: (content: string, imageUrl?: string) => Promise<any>;
}

const DemoClientContext = createContext<DemoClientContextValue | null>(null);

export function useDemoClient() {
  const context = useContext(DemoClientContext);
  if (!context) {
    throw new Error('useDemoClient must be used within DemoDataProvider');
  }
  return context;
}

interface DemoDataProviderProps {
  children: ReactNode;
}

export function DemoDataProvider({ children }: DemoDataProviderProps) {
  const [user, setUser] = useState<User | null>(USE_MOCKS ? MOCK_USER : null);
  const [profile, setProfile] = useState<UserProfile | null>(USE_MOCKS ? MOCK_PROFILE : null);
  const [messages, setMessages] = useState<ChatMessage[]>(USE_MOCKS ? MOCK_CHAT_MESSAGES : []);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>(USE_MOCKS ? MOCK_DAILY_PLANS : []);
  const [posts, setPosts] = useState<any[]>(USE_MOCKS ? MOCK_POSTS : []);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    if (!USE_MOCKS) {
      throw new Error('Demo mode not enabled');
    }

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === 'demo@demo.com' && password === 'Demo1234') {
      setUser(MOCK_USER);
      return { user: MOCK_USER, error: null };
    }

    return { user: null, error: new Error('Credenciais inválidas') };
  }, []);

  const signOut = useCallback(async () => {
    if (!USE_MOCKS) return;
    setUser(null);
    setProfile(null);
    setMessages(MOCK_CHAT_MESSAGES);
    setDailyPlans(MOCK_DAILY_PLANS);
    setPosts(MOCK_POSTS);
  }, []);

  // Profile methods
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!USE_MOCKS) {
        throw new Error('Demo mode not enabled');
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      const updated = { ...profile!, ...updates };
      setProfile(updated);
      await AsyncStorage.setItem('userProfile', JSON.stringify(updated));
      return updated;
    },
    [profile]
  );

  // Chat methods
  const sendMessage = useCallback(
    async (message: string): Promise<ChatMessage> => {
      if (!USE_MOCKS) {
        throw new Error('Demo mode not enabled');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        user_id: user?.id || 'demo-user-123',
        message,
        response:
          'Obrigada pela sua pergunta! Estou aqui para te ajudar. Esta é uma resposta mockada para demonstração. Em produção, a NathIA usaria inteligência artificial para responder de forma personalizada.',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [newMessage, ...prev]);
      return newMessage;
    },
    [user]
  );

  const getChatHistory = useCallback(async (): Promise<ChatMessage[]> => {
    if (!USE_MOCKS) {
      throw new Error('Demo mode not enabled');
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    return messages;
  }, [messages]);

  // Daily Plans methods
  const getDailyPlan = useCallback(
    async (date: string): Promise<DailyPlan | null> => {
      if (!USE_MOCKS) {
        throw new Error('Demo mode not enabled');
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
      return dailyPlans.find((p) => p.date === date) || null;
    },
    [dailyPlans]
  );

  const saveDailyPlan = useCallback(
    async (plan: Partial<DailyPlan>): Promise<DailyPlan> => {
      if (!USE_MOCKS) {
        throw new Error('Demo mode not enabled');
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const newPlan: DailyPlan = {
        id: `plan-${Date.now()}`,
        user_id: user?.id || 'demo-user-123',
        date: plan.date || new Date().toISOString().split('T')[0],
        priorities: plan.priorities || [],
        tip: plan.tip || '',
        tip_video_url: plan.tip_video_url,
        recipe: plan.recipe || '',
        created_at: new Date().toISOString(),
      };

      setDailyPlans((prev) => {
        const filtered = prev.filter((p) => p.date !== newPlan.date);
        return [newPlan, ...filtered];
      });

      return newPlan;
    },
    [user]
  );

  // Posts/Feed methods
  const fetchPosts = useCallback(async (): Promise<any[]> => {
    if (!USE_MOCKS) {
      throw new Error('Demo mode not enabled');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    return posts;
  }, [posts]);

  const createPost = useCallback(
    async (content: string, imageUrl?: string): Promise<any> => {
      if (!USE_MOCKS) {
        throw new Error('Demo mode not enabled');
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const newPost = {
        id: `post-${Date.now()}`,
        user_id: user?.id || 'demo-user-123',
        content,
        image_url: imageUrl || null,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
      };

      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    },
    [user]
  );

  const value: DemoClientContextValue = {
    user,
    session: user ? { user } : null,
    signIn,
    signOut,
    isAuthenticated: !!user,
    profile,
    updateProfile,
    messages,
    sendMessage,
    getChatHistory,
    dailyPlans,
    getDailyPlan,
    saveDailyPlan,
    posts,
    fetchPosts,
    createPost,
  };

  return <DemoClientContext.Provider value={value}>{children}</DemoClientContext.Provider>;
}

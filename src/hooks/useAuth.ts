/**
 * Hook de Autenticação
 *
 * Gerencia estado de autenticação, sessão e funções de login/logout
 * usando Supabase Auth com listener de mudanças de estado.
 *
 * @example
 * const { user, session, loading, signIn, signOut } = useAuth();
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { signInWithEmail, signInWithEmailOtp, signOut as authSignOut } from '@/services/auth';
import type { User, Session } from '@supabase/supabase-js';

export interface UseAuthReturn {
  /** Usuário atual (null se não autenticado) */
  user: User | null;
  /** Sessão atual (null se não autenticado) */
  session: Session | null;
  /** Estado de carregamento inicial */
  loading: boolean;
  /** Estado de autenticação de ações ativas (ex: login) */
  isLoading: boolean;
  /** Erro apresentado em ações de autenticação */
  error: string | null;
  /** Resetar estado de erro */
  resetError: () => void;
  /** Função de login com email e senha */
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  /** Função de login com magic link */
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  /** Função de logout */
  signOut: () => Promise<void>;
  /** Verificar se usuário está autenticado */
  isAuthenticated: boolean;
}

/**
 * Hook para gerenciar autenticação
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Verificar sessão inicial
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Função de login com email e senha
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
      try {
        setAuthLoading(true);
        setAuthError(null);

        const data = await signInWithEmail(email, password);
        return { user: data.user, error: null };
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        const normalizedError = error instanceof Error ? error : new Error('Erro ao fazer login');
        setAuthError(normalizedError.message);
        return { user: null, error: normalizedError };
      } finally {
        setAuthLoading(false);
      }
    },
    []
  );

  // Função de login com magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      await signInWithEmailOtp(email);
      return { error: null };
    } catch (error) {
      console.error('Erro ao enviar magic link:', error);
      return { error: error as Error };
    }
  }, []);

  // Função de logout
  const signOut = useCallback(async () => {
    try {
      await authSignOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }, []);

  return {
    user,
    session,
    loading,
    isLoading: authLoading,
    error: authError,
    resetError,
    signIn,
    signInWithMagicLink,
    signOut,
    isAuthenticated: !!session && !!user,
  };
}

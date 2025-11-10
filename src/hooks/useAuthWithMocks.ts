/**
 * Hook de Autenticação com Suporte a Mocks
 *
 * Detecta automaticamente se está em modo mock e usa DemoDataProvider ou Supabase
 */

import { useAuth as useSupabaseAuth } from '@/hooks/useAuth';
import { useDemoClient } from '@/lib/mocks/DemoDataProvider';
import { USE_MOCKS } from '@/lib/mocks/constants';

const USE_MOCKS_FLAG = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

export function useAuth() {
  if (USE_MOCKS_FLAG) {
    const demoClient = useDemoClient();
    return {
      user: demoClient.user,
      session: demoClient.session,
      loading: false,
      isLoading: false,
      error: null as string | null,
      resetError: (): void => undefined,
      signIn: demoClient.signIn,
      signInWithMagicLink: async (email: string): Promise<{ error: Error | null }> => {
        // Em modo mock, magic link simula sucesso
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { error: null };
      },
      signOut: demoClient.signOut,
      isAuthenticated: demoClient.isAuthenticated,
    };
  }

  return useSupabaseAuth();
}

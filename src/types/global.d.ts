/**
 * Declarações globais de tipos para módulos externos
 * Arquivo temporário para resolver problemas de resolução de módulos
 */

// Permite que o TypeScript reconheça variáveis de ambiente
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    EXPO_PUBLIC_ONESIGNAL_APP_ID?: string;
  }
}

declare const process: NodeJS.Process;
declare const window: Window & typeof globalThis;

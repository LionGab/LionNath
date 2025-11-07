/**
 * Rate Limiting - Controle de taxa de requisições
 *
 * Implementa rate limiting por usuário usando Supabase Storage
 * como KV store simples.
 */

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // janela de tempo em ms
  keyPrefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // segundos até poder tentar novamente
}

export class RateLimiter {
  private supabase: SupabaseClient;
  private config: RateLimitConfig;
  private bucketName = 'rate-limits';

  constructor(supabase: SupabaseClient, config: RateLimitConfig) {
    this.supabase = supabase;
    this.config = {
      keyPrefix: 'rl',
      ...config,
    };
  }

  /**
   * Verifica se requisição está dentro do limite
   */
  async check(userId: string, endpoint: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${endpoint}:${userId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Buscar histórico de requisições
      const { data: existingData, error: fetchError } = await this.supabase.storage
        .from(this.bucketName)
        .download(key);

      let requests: number[] = [];

      if (existingData && !fetchError) {
        const text = await existingData.text();
        requests = JSON.parse(text);
      }

      // Filtrar requisições dentro da janela de tempo
      requests = requests.filter(timestamp => timestamp > windowStart);

      // Verificar se está no limite
      if (requests.length >= this.config.maxRequests) {
        const oldestRequest = Math.min(...requests);
        const resetAt = new Date(oldestRequest + this.config.windowMs);
        const retryAfter = Math.ceil((resetAt.getTime() - now) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfter,
        };
      }

      // Adicionar nova requisição
      requests.push(now);

      // Salvar atualizado
      const blob = new Blob([JSON.stringify(requests)], { type: 'application/json' });

      await this.supabase.storage
        .from(this.bucketName)
        .upload(key, blob, { upsert: true });

      const remaining = this.config.maxRequests - requests.length;
      const resetAt = new Date(now + this.config.windowMs);

      return {
        allowed: true,
        remaining,
        resetAt,
      };
    } catch (error) {
      console.error('[RateLimiter] Error checking rate limit:', error);
      // Em caso de erro, permitir a requisição (fail open)
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: new Date(now + this.config.windowMs),
      };
    }
  }

  /**
   * Limpa histórico de um usuário (útil para testes)
   */
  async reset(userId: string, endpoint: string): Promise<void> {
    const key = `${this.config.keyPrefix}:${endpoint}:${userId}`;

    try {
      await this.supabase.storage.from(this.bucketName).remove([key]);
    } catch (error) {
      console.error('[RateLimiter] Error resetting rate limit:', error);
    }
  }

  /**
   * Retorna informações de rate limit sem incrementar contador
   */
  async getInfo(userId: string, endpoint: string): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}:${endpoint}:${userId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      const { data: existingData, error: fetchError } = await this.supabase.storage
        .from(this.bucketName)
        .download(key);

      let requests: number[] = [];

      if (existingData && !fetchError) {
        const text = await existingData.text();
        requests = JSON.parse(text);
      }

      requests = requests.filter(timestamp => timestamp > windowStart);

      const remaining = Math.max(0, this.config.maxRequests - requests.length);
      const oldestRequest = requests.length > 0 ? Math.min(...requests) : now;
      const resetAt = new Date(oldestRequest + this.config.windowMs);

      return {
        allowed: remaining > 0,
        remaining,
        resetAt,
      };
    } catch (error) {
      console.error('[RateLimiter] Error getting rate limit info:', error);
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: new Date(now + this.config.windowMs),
      };
    }
  }
}

/**
 * Configurações padrão para diferentes endpoints
 */
export const RATE_LIMITS = {
  CHAT: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  CURADORIA: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  MODERACAO: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  ONBOARDING: {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
  },
  RECS: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
};

/**
 * Factory function para criar rate limiter
 */
export function createRateLimiter(
  supabaseUrl: string,
  supabaseKey: string,
  config: RateLimitConfig
): RateLimiter {
  const supabase = createClient(supabaseUrl, supabaseKey);
  return new RateLimiter(supabase, config);
}

/**
 * Middleware helper para adicionar headers de rate limit
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', String(result.remaining + (result.allowed ? 1 : 0)));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

  if (!result.allowed && result.retryAfter) {
    headers.set('Retry-After', String(result.retryAfter));
  }
}

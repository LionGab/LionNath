/**
 * NAT-IA Rate Limiter Service
 * Sliding Window Algorithm - Protects against abuse
 * Uses Supabase Storage with Redis-like fallback
 */

import {
  RateLimitResult,
  RateLimitRecord,
  RequestTimestamp,
  JsonValue,
} from './types';
import { RATE_LIMITS, TIMEOUTS } from './constants';
import {
  createSecurityClient,
  type RateLimitRow,
  type SecuritySupabaseClient,
} from './supabase-client';

function isJsonObject(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringValue(value: JsonValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function toRequestTimestampArray(value: JsonValue | undefined): RequestTimestamp[] {
  if (!Array.isArray(value)) return [];

  const parsed: RequestTimestamp[] = [];

  value.forEach((item) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      return;
    }

    const record = item as Record<string, JsonValue>;
    const timestamp = typeof record.timestamp === 'number' ? record.timestamp : undefined;

    if (typeof timestamp !== 'number') {
      return;
    }

    const metadata = isJsonObject(record.metadata) ? record.metadata : undefined;

    parsed.push(
      metadata
        ? {
            timestamp,
            metadata,
          }
        : {
            timestamp,
          }
    );
  });

  return parsed;
}

function parseRateLimitRow(
  record: Record<string, JsonValue>,
  userId: string,
  endpoint: string
): RateLimitRecord {
  const requests = toRequestTimestampArray(record.requests);
  const blockedUntil = toStringValue(record.blocked_until);

  return {
    userId,
    endpoint,
    requests,
    blockedUntil: blockedUntil ? new Date(blockedUntil) : undefined,
  };
}

// Supabase client
let supabaseClient: SecuritySupabaseClient | null = null;

// In-memory cache (fallback se Supabase falhar)
const memoryCache = new Map<string, RateLimitRecord>();

/**
 * Inicializa o rate limiter com Supabase
 */
export function initializeRateLimiter(
  supabaseUrl: string,
  supabaseKey: string
): void {
  supabaseClient = createSecurityClient(supabaseUrl, supabaseKey);
}

/**
 * Verifica rate limit para um usuário em um endpoint
 * @param userId - ID do usuário
 * @param endpoint - Nome do endpoint (ex: 'chat:message')
 * @returns Resultado do rate limit
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  // Buscar configuração do endpoint
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.API_GENERAL;

  try {
    // Buscar registro do usuário
    const record = await getRateLimitRecord(userId, endpoint);

    // Verificar se está bloqueado
    if (record.blockedUntil && record.blockedUntil > new Date()) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.blockedUntil,
        retryAfter: Math.ceil(
          (record.blockedUntil.getTime() - Date.now()) / 1000
        ),
      };
    }

    // Limpar requests fora da janela (sliding window)
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const validRequests = record.requests.filter(
      (req) => req.timestamp > windowStart
    );

    // Verificar se atingiu o limite
    if (validRequests.length >= config.maxRequests) {
      // Bloquear usuário
      const blockedUntil = new Date(now + (config.blockDurationMs || 0));

      await updateRateLimitRecord(userId, endpoint, {
        ...record,
        requests: validRequests,
        blockedUntil,
      });

      return {
        allowed: false,
        remaining: 0,
        resetAt: blockedUntil,
        retryAfter: Math.ceil((config.blockDurationMs || 0) / 1000),
      };
    }

    // Adicionar novo request
    validRequests.push({
      timestamp: now,
      metadata: {},
    });

    await updateRateLimitRecord(userId, endpoint, {
      ...record,
      requests: validRequests,
      blockedUntil: undefined,
    });

    // Calcular reset time (fim da janela)
    const oldestRequest = validRequests[0]?.timestamp || now;
    const resetAt = new Date(oldestRequest + config.windowMs);

    return {
      allowed: true,
      remaining: config.maxRequests - validRequests.length,
      resetAt,
    };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);

    // Fail-safe: permitir em caso de erro (mas logar)
    return {
      allowed: true,
      remaining: 999,
      resetAt: new Date(Date.now() + 60000),
    };
  }
}

/**
 * Busca registro de rate limit do usuário
 */
async function getRateLimitRecord(
  userId: string,
  endpoint: string
): Promise<RateLimitRecord> {
  const key = `${userId}:${endpoint}`;

  // Tentar buscar do Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await Promise.race([
        supabaseClient
          .from('nathia_rate_limits')
          .select('*')
          .eq('user_id', userId)
          .eq('endpoint', endpoint)
          .single(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), TIMEOUTS.DATABASE_QUERY)
        ),
      ]);

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, que é ok
        throw error;
      }

      if (data) {
        return parseRateLimitRow(data, userId, endpoint);
      }
    } catch (error) {
      console.warn('[RateLimit] Supabase error, using memory cache:', error);
    }
  }

  // Fallback para memória
  const cached = memoryCache.get(key);
  if (cached) {
    return cached;
  }

  // Novo registro
  return {
    userId,
    endpoint,
    requests: [],
  };
}

/**
 * Atualiza registro de rate limit
 */
async function updateRateLimitRecord(
  userId: string,
  endpoint: string,
  record: RateLimitRecord
): Promise<void> {
  const key = `${userId}:${endpoint}`;

  // Atualizar memória
  memoryCache.set(key, record);

  // Atualizar Supabase
  if (supabaseClient) {
    try {
      const requestsPayload = record.requests.map((request) =>
        request.metadata
          ? {
              timestamp: request.timestamp,
              metadata: request.metadata,
            }
          : {
              timestamp: request.timestamp,
            }
      );

      const payload: RateLimitRow = {
        user_id: userId,
        endpoint,
        requests: requestsPayload,
        blocked_until: record.blockedUntil
          ? record.blockedUntil.toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };

      await Promise.race([
        supabaseClient.from('nathia_rate_limits').upsert(payload),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), TIMEOUTS.DATABASE_QUERY)
        ),
      ]);
    } catch (error) {
      console.warn('[RateLimit] Failed to update Supabase:', error);
      // Continuar mesmo com erro (dados em memória)
    }
  }
}

/**
 * Limpa rate limit de um usuário (admin only)
 */
export async function clearRateLimit(
  userId: string,
  endpoint?: string
): Promise<void> {
  if (endpoint) {
    const key = `${userId}:${endpoint}`;
    memoryCache.delete(key);

    if (supabaseClient) {
      await supabaseClient
        .from('nathia_rate_limits')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);
    }
  } else {
    // Limpar todos os endpoints do usuário
    for (const key of memoryCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        memoryCache.delete(key);
      }
    }

    if (supabaseClient) {
      await supabaseClient
        .from('nathia_rate_limits')
        .delete()
        .eq('user_id', userId);
    }
  }
}

/**
 * Obtém estatísticas de rate limit de um usuário
 */
export async function getRateLimitStats(userId: string): Promise<{
  endpoints: Array<{
    endpoint: string;
    requestCount: number;
    isBlocked: boolean;
    blockedUntil?: Date;
    resetAt: Date;
  }>;
}> {
  const stats: {
    endpoints: Array<{
      endpoint: string;
      requestCount: number;
      isBlocked: boolean;
      blockedUntil?: Date;
      resetAt: Date;
    }>;
  } = {
    endpoints: [],
  };

  // Buscar todos os endpoints do usuário
  for (const [endpointKey, config] of Object.entries(RATE_LIMITS)) {
    const record = await getRateLimitRecord(userId, config.endpoint);

    const now = Date.now();
    const windowStart = now - config.windowMs;
    const validRequests = record.requests.filter(
      (req) => req.timestamp > windowStart
    );

    const isBlocked = !!(
      record.blockedUntil && record.blockedUntil > new Date()
    );

    const oldestRequest = validRequests[0]?.timestamp || now;
    const resetAt = new Date(oldestRequest + config.windowMs);

    stats.endpoints.push({
      endpoint: config.endpoint,
      requestCount: validRequests.length,
      isBlocked,
      blockedUntil: record.blockedUntil,
      resetAt,
    });
  }

  return stats;
}

/**
 * Verifica se usuário está bloqueado em algum endpoint
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  const stats = await getRateLimitStats(userId);
  return stats.endpoints.some((ep) => ep.isBlocked);
}

/**
 * Incrementa contador de rate limit (versão simplificada)
 * Útil para tracking sem bloquear
 */
export async function trackRequest(
  userId: string,
  endpoint: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const record = await getRateLimitRecord(userId, endpoint);

    record.requests.push({
      timestamp: Date.now(),
      metadata,
    });

    await updateRateLimitRecord(userId, endpoint, record);
  } catch (error) {
    console.error('[RateLimit] Error tracking request:', error);
    // Não falhar se tracking falhar
  }
}

/**
 * Limpa registros antigos (cleanup job)
 * Deve ser executado periodicamente (ex: cron job)
 */
export async function cleanupOldRecords(): Promise<number> {
  let cleaned = 0;

  // Limpar memória
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas

  for (const [key, record] of memoryCache.entries()) {
    const newestRequest = Math.max(
      ...record.requests.map((r) => r.timestamp),
      0
    );

    if (now - newestRequest > maxAge) {
      memoryCache.delete(key);
      cleaned++;
    }
  }

  // Limpar Supabase
  if (supabaseClient) {
    try {
      const cutoff = new Date(now - maxAge).toISOString();
      const { error } = await supabaseClient
        .from('nathia_rate_limits')
        .delete()
        .lt('updated_at', cutoff);

      if (error) throw error;
    } catch (error) {
      console.error('[RateLimit] Cleanup error:', error);
    }
  }

  return cleaned;
}

/**
 * Middleware helper para Express/Next.js
 */
export function rateLimitMiddleware(endpoint: string) {
  return async (userId: string): Promise<RateLimitResult> => {
    return checkRateLimit(userId, endpoint);
  };
}

/**
 * Headers HTTP para rate limit (RFC 6585)
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': '20', // ou dinâmico baseado no endpoint
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString(),
    }),
  };
}

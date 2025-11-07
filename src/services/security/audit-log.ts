/**
 * NAT-IA Audit Log Service
 * LGPD Compliant - No PII in logs, only metadata
 */

import { AuditLogEntry, AuditActionType, AuditMetadata, AuditFlag, JsonValue } from './types';
import { AUDIT_CONFIG } from './constants';
import { sanitizarLogs } from './pii-protection';
import { createSecurityClient, type AuditLogRow, type SecuritySupabaseClient } from './supabase-client';
import { logger } from '@/utils/logger';

const AUDIT_ACTION_VALUES = new Set<string>(Object.values(AuditActionType));
const AUDIT_FLAG_VALUES = new Set<string>(Object.values(AuditFlag));

function isJsonObject(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAuditActionTypeValue(value: JsonValue | undefined): value is AuditActionType {
  return typeof value === 'string' && AUDIT_ACTION_VALUES.has(value);
}

function toAuditFlags(value: JsonValue | undefined): AuditFlag[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const parsed = value.filter((flag): flag is AuditFlag => {
    return typeof flag === 'string' && AUDIT_FLAG_VALUES.has(flag);
  });

  return parsed.length > 0 ? parsed : undefined;
}

function parseAuditLogRow(record: Record<string, JsonValue>): AuditLogRow | null {
  const timestamp = typeof record.timestamp === 'string' ? record.timestamp : undefined;
  const userId = typeof record.user_id === 'string' ? record.user_id : undefined;
  const endpoint = typeof record.endpoint === 'string' ? record.endpoint : undefined;
  const actionTypeValue = record.action_type;

  if (!timestamp || !userId || !endpoint || !isAuditActionTypeValue(actionTypeValue)) {
    return null;
  }

  const row: AuditLogRow = {
    timestamp,
    user_id: userId,
    endpoint,
    action_type: actionTypeValue,
    metadata: isJsonObject(record.metadata) ? record.metadata : {},
  };

  if (typeof record.id === 'string') {
    row.id = record.id;
  }

  if (typeof record.ip_address === 'string') {
    row.ip_address = record.ip_address;
  }

  if (typeof record.user_agent === 'string') {
    row.user_agent = record.user_agent;
  }

  if (typeof record.success === 'boolean') {
    row.success = record.success;
  }

  if (typeof record.error_message === 'string') {
    row.error_message = record.error_message;
  }

  if (typeof record.latency_ms === 'number') {
    row.latency_ms = record.latency_ms;
  }

  const parsedFlags = toAuditFlags(record.flags);
  if (parsedFlags) {
    row.flags = parsedFlags;
  }

  return row;
}

// Supabase client
let supabaseClient: SecuritySupabaseClient | null = null;

// Buffer de logs em memória (para batch processing)
let logBuffer: AuditLogEntry[] = [];
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Inicializa o audit logger
 */
export function initializeAuditLogger(supabaseUrl: string, supabaseKey: string): void {
  supabaseClient = createSecurityClient(supabaseUrl, supabaseKey);

  // Iniciar flush timer
  startFlushTimer();
}

/**
 * Registra uma ação no log de auditoria
 * @param tipo - Tipo da ação
 * @param metadata - Metadados (SEM PII)
 * @returns Promise<void>
 */
export async function logAction(
  tipo: AuditActionType,
  metadata: AuditMetadata & {
    userId: string;
    endpoint: string;
    success?: boolean;
    errorMessage?: string;
    latencyMs?: number;
    ipAddress?: string;
    userAgent?: string;
    flags?: AuditFlag[];
  }
): Promise<void> {
  try {
    // Sanitizar metadados (remover PII)
    const sanitizedMetadata = sanitizarLogs(metadata);

    // Limitar tamanho dos metadados
    const metadataStr = JSON.stringify(sanitizedMetadata);
    if (metadataStr.length > AUDIT_CONFIG.MAX_METADATA_SIZE) {
      logger.warn('AuditLog: Metadata too large, truncating', { size: metadataStr.length });
      sanitizedMetadata.truncated = true;
    }

    // Criar entrada de log
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      userId: metadata.userId,
      actionType: tipo,
      endpoint: metadata.endpoint,
      metadata: sanitizedMetadata,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      success: metadata.success ?? true,
      errorMessage: metadata.errorMessage,
      latencyMs: metadata.latencyMs,
      flags: metadata.flags || [],
    };

    // Adicionar ao buffer
    logBuffer.push(entry);

    // Flush se buffer cheio
    if (logBuffer.length >= AUDIT_CONFIG.BATCH_SIZE) {
      await flushLogs();
    }
  } catch (error) {
    logger.error('AuditLog: Error logging action', { error });
    // Não falhar a operação principal se log falhar
  }
}

/**
 * Flush logs para o Supabase
 */
async function flushLogs(): Promise<void> {
  if (logBuffer.length === 0) return;

  const logsToFlush = [...logBuffer];
  logBuffer = [];

  if (!supabaseClient) {
    logger.warn('AuditLog: No Supabase client, logs discarded', { count: logsToFlush.length });
    return;
  }

  try {
    // Preparar dados para inserção
    const records: AuditLogRow[] = logsToFlush.map((entry) => ({
      timestamp: entry.timestamp.toISOString(),
      user_id: entry.userId,
      action_type: entry.actionType,
      endpoint: entry.endpoint,
      metadata: entry.metadata,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      success: entry.success,
      error_message: entry.errorMessage,
      latency_ms: entry.latencyMs,
      flags: entry.flags,
    }));

    // Inserir em batch
    const { error } = await supabaseClient.from('nathia_audit_logs').insert(records);

    if (error) {
      logger.error('AuditLog: Error flushing logs', { error, count: records.length });
      // Re-adicionar logs ao buffer para tentar novamente
      logBuffer.unshift(...logsToFlush);
    }
  } catch (error) {
    logger.error('AuditLog: Fatal error flushing logs', { error });
  }
}

/**
 * Inicia timer de flush automático
 */
function startFlushTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
  }

  flushTimer = setInterval(() => {
    flushLogs().catch((err) => logger.error('AuditLog: Auto-flush error', { error: err }));
  }, AUDIT_CONFIG.FLUSH_INTERVAL_MS);
}

/**
 * Para o audit logger (cleanup)
 */
export async function stopAuditLogger(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }

  // Flush logs restantes
  await flushLogs();
}

/**
 * Helper: Log de login
 */
export async function logLogin(userId: string, success: boolean, metadata?: Partial<AuditMetadata>): Promise<void> {
  await logAction(AuditActionType.USER_LOGIN, {
    userId,
    endpoint: 'auth:login',
    success,
    ...metadata,
  });
}

/**
 * Helper: Log de logout
 */
export async function logLogout(userId: string, metadata?: Partial<AuditMetadata>): Promise<void> {
  await logAction(AuditActionType.USER_LOGOUT, {
    userId,
    endpoint: 'auth:logout',
    success: true,
    ...metadata,
  });
}

/**
 * Helper: Log de mensagem do chat
 */
export async function logChatMessage(
  userId: string,
  metadata: {
    conversationId: string;
    messageLength: number;
    riskScore?: number;
    piiDetected?: boolean;
    latencyMs?: number;
  }
): Promise<void> {
  const flags: AuditFlag[] = [];

  if (metadata.piiDetected) {
    flags.push(AuditFlag.PII_DETECTED);
  }

  if (metadata.riskScore && metadata.riskScore >= 70) {
    flags.push(AuditFlag.RISK_DETECTED);
  }

  await logAction(AuditActionType.CHAT_MESSAGE, {
    userId,
    endpoint: 'chat:message',
    success: true,
    flags,
    ...metadata,
  });
}

/**
 * Helper: Log de conteúdo bloqueado
 */
export async function logContentBlocked(
  userId: string,
  reason: string,
  metadata?: Partial<AuditMetadata>
): Promise<void> {
  await logAction(AuditActionType.CONTENT_BLOCKED, {
    userId,
    endpoint: 'content:validation',
    success: true,
    flags: [AuditFlag.CONTENT_BLOCKED],
    blockReason: reason,
    ...metadata,
  });
}

/**
 * Helper: Log de risco detectado
 */
export async function logRiskDetected(
  userId: string,
  riskLevel: string,
  riskScore: number,
  metadata?: Partial<AuditMetadata>
): Promise<void> {
  await logAction(AuditActionType.RISK_DETECTED, {
    userId,
    endpoint: 'risk:detection',
    success: true,
    flags: [AuditFlag.RISK_DETECTED],
    riskLevel,
    riskScore,
    ...metadata,
  });
}

/**
 * Helper: Log de rate limit atingido
 */
export async function logRateLimitHit(
  userId: string,
  endpoint: string,
  metadata?: Partial<AuditMetadata>
): Promise<void> {
  await logAction(AuditActionType.RATE_LIMIT_HIT, {
    userId,
    endpoint,
    success: false,
    flags: [AuditFlag.RATE_LIMITED],
    ...metadata,
  });
}

/**
 * Helper: Log de exportação de dados (LGPD)
 */
export async function logDataExport(
  userId: string,
  exportType: string,
  metadata?: Partial<AuditMetadata>
): Promise<void> {
  await logAction(AuditActionType.DATA_EXPORT, {
    userId,
    endpoint: 'data:export',
    success: true,
    exportType,
    ...metadata,
  });
}

/**
 * Helper: Log de deleção de dados (LGPD)
 */
export async function logDataDelete(
  userId: string,
  deletionType: string,
  metadata?: Partial<AuditMetadata>
): Promise<void> {
  await logAction(AuditActionType.DATA_DELETE, {
    userId,
    endpoint: 'data:delete',
    success: true,
    deletionType,
    ...metadata,
  });
}

/**
 * Buscar logs de auditoria de um usuário (apenas metadados)
 */
export async function getAuditLogs(
  userId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    actionType?: AuditActionType;
    limit?: number;
  }
): Promise<AuditLogEntry[]> {
  if (!supabaseClient) {
    throw new Error('Audit logger not initialized');
  }

  try {
    let query = supabaseClient
      .from('nathia_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    if (filters?.actionType) {
      query = query.eq('action_type', filters.actionType);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) throw error;

    const rows = (data || []).map(parseAuditLogRow).filter((row): row is AuditLogRow => row !== null);

    return rows.map((row) => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.user_id,
      actionType: row.action_type,
      endpoint: row.endpoint,
      metadata: isJsonObject(row.metadata) ? row.metadata : {},
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      success: row.success ?? true,
      errorMessage: row.error_message,
      latencyMs: row.latency_ms,
      flags: row.flags || [],
    }));
  } catch (error) {
    logger.error('AuditLog: Error fetching logs', { error, userId });
    return [];
  }
}

/**
 * Gerar estatísticas de auditoria
 */
export async function getAuditStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  totalActions: number;
  actionsByType: Record<string, number>;
  flaggedActions: number;
  failedActions: number;
  averageLatency: number;
}> {
  if (!supabaseClient) {
    throw new Error('Audit logger not initialized');
  }

  try {
    const { data, error } = await supabaseClient
      .from('nathia_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) throw error;

    const rows = (data || []).map(parseAuditLogRow).filter((row): row is AuditLogRow => row !== null);

    const stats = {
      totalActions: rows.length,
      actionsByType: {} as Record<string, number>,
      flaggedActions: 0,
      failedActions: 0,
      averageLatency: 0,
    };

    let totalLatency = 0;
    let latencyCount = 0;

    for (const log of rows) {
      // Count by type
      stats.actionsByType[log.action_type] = (stats.actionsByType[log.action_type] || 0) + 1;

      // Count flagged
      if (log.flags && log.flags.length > 0) {
        stats.flaggedActions++;
      }

      // Count failed
      if (log.success === false) {
        stats.failedActions++;
      }

      // Latency
      if (log.latency_ms) {
        totalLatency += log.latency_ms;
        latencyCount++;
      }
    }

    if (latencyCount > 0) {
      stats.averageLatency = totalLatency / latencyCount;
    }

    return stats;
  } catch (error) {
    logger.error('AuditLog: Error fetching stats', { error, userId });
    throw error;
  }
}

/**
 * Limpar logs antigos (retention policy)
 */
export async function cleanupOldLogs(): Promise<number> {
  if (!supabaseClient) {
    throw new Error('Audit logger not initialized');
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUDIT_CONFIG.RETENTION_DAYS);

    const { error, count } = await supabaseClient
      .from('nathia_audit_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (error) throw error;

    return count || 0;
  } catch (error) {
    logger.error('AuditLog: Error cleaning up old logs', { error });
    return 0;
  }
}

/**
 * Exportar logs para compliance (LGPD)
 */
export async function exportLogsForCompliance(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
  const logs = await getAuditLogs(userId, { limit: 10000 });

  if (format === 'json') {
    return JSON.stringify(logs, null, 2);
  }

  // CSV format
  const headers = ['timestamp', 'action_type', 'endpoint', 'success', 'flags'].join(',');

  const rows = logs.map((log) =>
    [log.timestamp.toISOString(), log.actionType, log.endpoint, log.success, log.flags?.join(';') || ''].join(',')
  );

  return [headers, ...rows].join('\n');
}

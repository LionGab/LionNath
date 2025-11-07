/**
 * NAT-IA Security System - Central Export
 * LGPD Compliant - Zero Trust Architecture
 */

import { anonimizarMensagem } from './pii-protection';
import { initializeRateLimiter, checkRateLimit } from './rate-limiter';
import { validarConteudo } from './content-policy';
import { analisarRisco, requerIntervencaoImediata } from './risk-detection';
import { initializeAuditLogger, logRateLimitHit, logContentBlocked, logRiskDetected, logAction } from './audit-log';
import { initializeEncryption } from './encryption';
import { validateEnvironment, securityHealthCheck } from './env-validation';
import { logger } from '@/utils/logger';
import {
  AuditActionType,
  AuditFlag,
  RiskLevel,
  type SecurityContext,
  type RiskAnalysisResult,
  type RateLimitResult,
  type SecurityHealthCheck,
} from './types';

// ==================== PII Protection ====================
export {
  anonimizarMensagem,
  validarDados,
  sanitizarLogs,
  validarCPF,
  detectarNomes,
  contemEndereco,
  contemTelefone,
  contemEmail,
  criarHashAnonimo,
  mascaraParcial,
  isSeguroParaArmazenar,
  extrairMetadados,
} from './pii-protection';

// ==================== Rate Limiting ====================
export {
  initializeRateLimiter,
  checkRateLimit,
  clearRateLimit,
  getRateLimitStats,
  isUserBlocked,
  trackRequest,
  cleanupOldRecords as cleanupOldRateLimits,
  rateLimitMiddleware,
  getRateLimitHeaders,
} from './rate-limiter';

// ==================== Content Policy ====================
export {
  validarConteudo,
  validarComRegrasCustomizadas,
  contemApenasTermosMedicos,
  sanitizarMensagem,
  COMMUNITY_RULES,
} from './content-policy';

// ==================== Risk Detection ====================
export {
  analisarRisco,
  gerarRespostaDeRisco,
  analisarHistoricoRisco,
  requerIntervencaoImediata,
  gerarRelatorioRisco,
} from './risk-detection';

// ==================== Audit Logging ====================
export {
  initializeAuditLogger,
  stopAuditLogger,
  logAction,
  logLogin,
  logLogout,
  logChatMessage,
  logContentBlocked,
  logRiskDetected,
  logRateLimitHit,
  logDataExport,
  logDataDelete,
  getAuditLogs,
  getAuditStats,
  cleanupOldLogs,
  exportLogsForCompliance,
} from './audit-log';

// ==================== Encryption ====================
export {
  initializeEncryption,
  generateUserKey,
  encryptMessage,
  decryptMessage,
  rotateUserKey,
  hasActiveKey,
  revokeUserKey,
  clearKeyCache,
  needsKeyRotation,
  hashMessage,
  verifyMessageIntegrity,
} from './encryption';

// ==================== Environment Validation ====================
export { validateEnvironment, securityHealthCheck, generateEnvironmentReport, validateOrThrow } from './env-validation';

// ==================== Types ====================
export type {
  // PII
  PIIDetectionResult,
  PIIPosition,

  // Rate Limiting
  RateLimitConfig,
  RateLimitResult,
  RateLimitRecord,
  RequestTimestamp,

  // Content Policy
  ContentValidationResult,
  ContentViolation,

  // Risk Detection
  RiskAnalysisResult,
  RiskSignal,

  // Audit
  AuditLogEntry,
  AuditMetadata,

  // Encryption
  EncryptionResult,
  DecryptionResult,
  UserEncryptionKey,

  // Environment
  EnvironmentValidationResult,
  ValidationError,
  ValidationWarning,
  SecurityHealthCheck,
  HealthCheckResult,

  // Security Context
  SecurityContext,
} from './types';

// ==================== Enums ====================
export {
  PIIType,
  ViolationType,
  SeverityLevel,
  RiskLevel,
  UrgencyLevel,
  RiskSignalType,
  RecommendedAction,
  AuditActionType,
  AuditFlag,
  KeyStatus,
} from './types';

// ==================== Constants ====================
export {
  PII_PATTERNS,
  PII_REPLACEMENTS,
  RATE_LIMITS,
  SPAM_KEYWORDS,
  HATE_SPEECH_PATTERNS,
  COMMERCIAL_PATTERNS,
  SELF_HARM_KEYWORDS,
  SUICIDE_IDEATION_KEYWORDS,
  PANIC_KEYWORDS,
  SEVERE_DEPRESSION_KEYWORDS,
  POSTPARTUM_PSYCHOSIS_KEYWORDS,
  VIOLENCE_KEYWORDS,
  RISK_SCORES,
  RISK_THRESHOLDS,
  ENCRYPTION_CONFIG,
  AUDIT_CONFIG,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS,
  TIMEOUTS,
  LGPD_CONFIG,
  EMERGENCY_RESOURCES,
  HEALTH_CHECK_CONFIG,
} from './constants';

// ==================== Initialize Security System ====================

/**
 * Inicializa todo o sistema de segurança
 * Deve ser chamado no início da aplicação
 */
export function initializeSecurity(config: { supabaseUrl: string; supabaseKey: string; validateEnv?: boolean }) {
  // Validar ambiente (se solicitado)
  if (config.validateEnv !== false) {
    const validation = validateEnvironment();
    if (!validation.valid) {
      logger.error('[Security] Environment validation failed:', validation);
      throw new Error('Security initialization failed - invalid environment');
    }

    if (validation.warnings.length > 0) {
      logger.warn('[Security] Environment warnings:', validation.warnings);
    }
  }

  // Inicializar componentes
  initializeRateLimiter(config.supabaseUrl, config.supabaseKey);
  initializeAuditLogger(config.supabaseUrl, config.supabaseKey);
  initializeEncryption(config.supabaseUrl, config.supabaseKey);

  logger.info('[Security] Security system initialized successfully');
}

/**
 * Middleware completo de segurança para requisições
 * Aplica todas as camadas de segurança
 */
export async function securityMiddleware(
  userId: string,
  endpoint: string,
  data: {
    content?: string;
    metadata?: Record<string, any>;
  },
  context?: SecurityContext
): Promise<{
  allowed: boolean;
  reason?: string;
  sanitizedContent?: string;
  riskAnalysis?: RiskAnalysisResult;
  rateLimit?: RateLimitResult;
}> {
  try {
    // 1. Rate Limiting
    const rateLimit = await checkRateLimit(userId, endpoint);
    if (!rateLimit.allowed) {
      await logRateLimitHit(userId, endpoint);
      return {
        allowed: false,
        reason: 'Rate limit exceeded',
        rateLimit,
      };
    }

    // 2. Content Validation (se houver conteúdo)
    if (data.content) {
      const contentValidation = validarConteudo(data.content);
      if (!contentValidation.allowed) {
        await logContentBlocked(userId, contentValidation.reasons.map((r) => r.description).join(', '));
        return {
          allowed: false,
          reason: 'Content policy violation',
        };
      }

      // 3. PII Detection
      const piiResult = anonimizarMensagem(data.content);
      if (piiResult.hasPII) {
        logger.warn('Security: PII detected and sanitized for user', { userId });
      }

      // 4. Risk Analysis
      const riskAnalysis = analisarRisco(data.content, context);

      if (riskAnalysis.level >= RiskLevel.HIGH) {
        await logRiskDetected(userId, riskAnalysis.level, riskAnalysis.score, {
          urgency: riskAnalysis.urgency,
          signals: riskAnalysis.signals.length,
        });

        // Se crítico, bloquear e escalar
        if (requerIntervencaoImediata(riskAnalysis)) {
          return {
            allowed: false,
            reason: 'High-risk content detected - intervention required',
            riskAnalysis,
          };
        }
      }

      return {
        allowed: true,
        sanitizedContent: piiResult.sanitized,
        riskAnalysis,
        rateLimit,
      };
    }

    return {
      allowed: true,
      rateLimit,
    };
  } catch (error) {
    logger.error('[Security] Middleware error:', error);

    // Fail-safe: em caso de erro, logar e permitir (mas alertar)
    await logAction(AuditActionType.SECURITY_ALERT, {
      userId,
      endpoint,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      flags: [AuditFlag.SUSPICIOUS_ACTIVITY],
    });

    return {
      allowed: true, // Fail-open (considerar fail-closed em produção)
      reason: 'Security check failed - allowing request',
    };
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<SecurityHealthCheck> {
  return securityHealthCheck();
}

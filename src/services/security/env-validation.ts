/**
 * NAT-IA Environment Validation
 * Validates all environment variables on startup
 */

import {
  EnvironmentValidationResult,
  ValidationError,
  ValidationWarning,
  SecurityHealthCheck,
  HealthCheckResult,
} from './types';
import { REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS, HEALTH_CHECK_CONFIG } from './constants';
import { logger } from '@/utils/logger';

/**
 * Valida todas as variáveis de ambiente
 * @returns Resultado da validação
 */
export function validateEnvironment(): EnvironmentValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const missingVars: string[] = [];

  // 1. Verificar variáveis obrigatórias
  for (const varName of REQUIRED_ENV_VARS) {
    const value = getEnvVar(varName);

    if (!value) {
      missingVars.push(varName);
      errors.push({
        variable: varName,
        issue: 'Variável obrigatória não definida',
        severity: 'error',
      });
    } else {
      // Validar formato específico
      const validationError = validateEnvVarFormat(varName, value);
      if (validationError) {
        errors.push(validationError);
      }
    }
  }

  // 2. Verificar variáveis opcionais
  for (const varName of OPTIONAL_ENV_VARS) {
    const value = getEnvVar(varName);

    if (!value) {
      warnings.push({
        variable: varName,
        suggestion: `Considere definir ${varName} para funcionalidade completa`,
      });
    }
  }

  // 3. Verificar configurações de segurança
  const securityWarnings = validateSecuritySettings();
  warnings.push(...securityWarnings);

  // 4. Verificar permissões de API keys
  const apiKeyErrors = validateApiKeys();
  errors.push(...apiKeyErrors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingVars,
  };
}

/**
 * Obtém variável de ambiente
 */
function getEnvVar(name: string): string | undefined {
  // Browser
  if (typeof window !== 'undefined') {
    const windowEnv = (window as Record<string, any>).__ENV__ as Record<string, string> | undefined;
    return windowEnv?.[name] || process.env[name];
  }

  // Node.js
  return process.env[name];
}

/**
 * Valida formato de variável específica
 */
function validateEnvVarFormat(name: string, value: string): ValidationError | null {
  switch (name) {
    case 'SUPABASE_URL':
    case 'NEXT_PUBLIC_SUPABASE_URL':
      if (!isValidUrl(value)) {
        return {
          variable: name,
          issue: 'URL inválida',
          severity: 'error',
        };
      }
      if (!value.includes('supabase.co') && !value.includes('localhost')) {
        return {
          variable: name,
          issue: 'URL não parece ser do Supabase',
          severity: 'warning',
        };
      }
      break;

    case 'SUPABASE_ANON_KEY':
    case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
      if (value.length < 100) {
        return {
          variable: name,
          issue: 'Chave muito curta - pode ser inválida',
          severity: 'warning',
        };
      }
      break;

    case 'OPENAI_API_KEY':
      if (!value.startsWith('sk-')) {
        return {
          variable: name,
          issue: 'Chave OpenAI deve começar com "sk-"',
          severity: 'error',
        };
      }
      break;

    case 'REDIS_URL':
      if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
        return {
          variable: name,
          issue: 'URL Redis deve começar com redis:// ou rediss://',
          severity: 'error',
        };
      }
      break;
  }

  return null;
}

/**
 * Valida configurações de segurança
 */
function validateSecuritySettings(): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Verificar se NODE_ENV está em produção
  const nodeEnv = getEnvVar('NODE_ENV');
  if (nodeEnv === 'production') {
    // Verificar se HTTPS está habilitado
    const supabaseUrl = getEnvVar('SUPABASE_URL');
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      warnings.push({
        variable: 'SUPABASE_URL',
        suggestion: 'Use HTTPS em produção',
      });
    }
  }

  // Verificar se encryption está habilitado
  const enableEncryption = getEnvVar('ENABLE_ENCRYPTION');
  if (enableEncryption !== 'true' && nodeEnv === 'production') {
    warnings.push({
      variable: 'ENABLE_ENCRYPTION',
      suggestion: 'Habilite criptografia em produção para compliance LGPD',
    });
  }

  // Verificar log level
  const logLevel = getEnvVar('LOG_LEVEL');
  if (logLevel === 'debug' && nodeEnv === 'production') {
    warnings.push({
      variable: 'LOG_LEVEL',
      suggestion: 'Não use log level "debug" em produção',
    });
  }

  return warnings;
}

/**
 * Valida API keys (testa conexão básica)
 */
function validateApiKeys(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validações assíncronas devem ser feitas no health check
  // Aqui apenas validações síncronas

  return errors;
}

/**
 * Valida se string é URL válida
 */
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Health check do sistema de segurança
 * @returns Resultado do health check
 */
export async function securityHealthCheck(): Promise<SecurityHealthCheck> {
  const checks: HealthCheckResult[] = [];
  const startTime = Date.now();

  // 1. Database connection
  checks.push(await checkDatabaseConnection());

  // 2. Encryption service
  checks.push(await checkEncryptionService());

  // 3. Rate limiter
  checks.push(await checkRateLimiter());

  // 4. Audit logger
  checks.push(await checkAuditLogger());

  // 5. OpenAI API
  checks.push(await checkOpenAIAPI());

  // Determinar status geral
  const failedChecks = checks.filter((c) => c.status === 'fail');
  const warnChecks = checks.filter((c) => c.status === 'warn');

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (failedChecks.length > 0) {
    status = 'unhealthy';
  } else if (warnChecks.length > 0) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  return {
    timestamp: new Date(),
    status,
    checks,
  };
}

/**
 * Verifica conexão com banco de dados
 */
async function checkDatabaseConnection(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const supabaseUrl = getEnvVar('SUPABASE_URL');
    const supabaseKey = getEnvVar('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return {
        name: 'database_connection',
        status: 'fail',
        message: 'Supabase credentials not configured',
        latency: Date.now() - startTime,
      };
    }

    // Tentar ping simples
    const { createClient } = require('@supabase/supabase-js');
    const client = createClient(supabaseUrl, supabaseKey);

    const { error } = await Promise.race([
      client.from('nathia_conversations').select('id').limit(1),
      new Promise<{ error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), HEALTH_CHECK_CONFIG.TIMEOUT_MS)
      ),
    ]);

    if (error) {
      return {
        name: 'database_connection',
        status: 'fail',
        message: error.message,
        latency: Date.now() - startTime,
      };
    }

    return {
      name: 'database_connection',
      status: 'pass',
      message: 'Database connection successful',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'database_connection',
      status: 'fail',
      message: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Verifica serviço de criptografia
 */
async function checkEncryptionService(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Verificar se Web Crypto API está disponível
    const hasWebCrypto =
      (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) ||
      (typeof require !== 'undefined' && require('crypto'));

    if (!hasWebCrypto) {
      return {
        name: 'encryption_service',
        status: 'warn',
        message: 'Crypto API not available - encryption disabled',
        latency: Date.now() - startTime,
      };
    }

    // Testar criptografia básica
    const { hashMessage } = require('./encryption');
    const hash = await hashMessage('test');

    if (!hash || hash.length !== 64) {
      throw new Error('Hash generation failed');
    }

    return {
      name: 'encryption_service',
      status: 'pass',
      message: 'Encryption service operational',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'encryption_service',
      status: 'fail',
      message: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Verifica rate limiter
 */
async function checkRateLimiter(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Verificar se rate limiter está funcional
    const { checkRateLimit } = require('./rate-limiter');

    // Teste com usuário fictício
    const result = await checkRateLimit('health-check-user', 'api:general');

    if (!result || typeof result.allowed !== 'boolean') {
      throw new Error('Rate limiter returned invalid result');
    }

    return {
      name: 'rate_limiter',
      status: 'pass',
      message: 'Rate limiter operational',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'rate_limiter',
      status: 'warn',
      message: `Rate limiter degraded: ${error.message}`,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Verifica audit logger
 */
async function checkAuditLogger(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const supabaseUrl = getEnvVar('SUPABASE_URL');
    const supabaseKey = getEnvVar('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return {
        name: 'audit_logger',
        status: 'warn',
        message: 'Audit logger not configured',
        latency: Date.now() - startTime,
      };
    }

    return {
      name: 'audit_logger',
      status: 'pass',
      message: 'Audit logger configured',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'audit_logger',
      status: 'warn',
      message: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Verifica API OpenAI
 */
async function checkOpenAIAPI(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const apiKey = getEnvVar('OPENAI_API_KEY');

    if (!apiKey) {
      return {
        name: 'openai_api',
        status: 'fail',
        message: 'OpenAI API key not configured',
        latency: Date.now() - startTime,
      };
    }

    if (!apiKey.startsWith('sk-')) {
      return {
        name: 'openai_api',
        status: 'fail',
        message: 'Invalid OpenAI API key format',
        latency: Date.now() - startTime,
      };
    }

    // Nota: Teste real de API deve ser feito apenas em intervalos (não em todo health check)
    // Para evitar rate limits e custos

    return {
      name: 'openai_api',
      status: 'pass',
      message: 'OpenAI API key configured',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      name: 'openai_api',
      status: 'fail',
      message: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Gera relatório de ambiente
 */
export function generateEnvironmentReport(): string {
  const validation = validateEnvironment();

  let report = '=== NAT-IA ENVIRONMENT REPORT ===\n\n';

  report += `Status: ${validation.valid ? '✓ VALID' : '✗ INVALID'}\n\n`;

  if (validation.errors.length > 0) {
    report += 'ERRORS:\n';
    for (const error of validation.errors) {
      report += `  ✗ ${error.variable}: ${error.issue}\n`;
    }
    report += '\n';
  }

  if (validation.warnings.length > 0) {
    report += 'WARNINGS:\n';
    for (const warning of validation.warnings) {
      report += `  ⚠ ${warning.variable}: ${warning.suggestion}\n`;
    }
    report += '\n';
  }

  if (validation.missingVars.length > 0) {
    report += 'MISSING VARIABLES:\n';
    for (const varName of validation.missingVars) {
      report += `  - ${varName}\n`;
    }
    report += '\n';
  }

  report += '================================\n';

  return report;
}

/**
 * Valida ambiente e lança erro se inválido
 */
export function validateOrThrow(): void {
  const validation = validateEnvironment();

  if (!validation.valid) {
    const report = generateEnvironmentReport();
    logger.error('Environment validation failed', { report });
    throw new Error('Environment validation failed');
  }

  // Mostrar warnings
  if (validation.warnings.length > 0) {
    logger.warn('Environment validation warnings', { report: generateEnvironmentReport() });
  }
}

/**
 * NAT-IA Security System - Constants & Configuration
 * LGPD Compliant - Zero Trust Architecture
 */

import { RateLimitConfig, ViolationType } from './types';

// ==================== PII PATTERNS (Brazilian) ====================
export const PII_PATTERNS = {
  // CPF: xxx.xxx.xxx-xx ou xxxxxxxxxxx
  CPF: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,

  // Telefone: (xx) xxxxx-xxxx, (xx) xxxx-xxxx, +55 xx xxxxx-xxxx
  PHONE: /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g,

  // Email
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // RG: xx.xxx.xxx-x
  RG: /\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9xX]\b/g,

  // CNS (Cartão Nacional de Saúde): 15 dígitos
  CNS: /\b\d{3}\s?\d{4}\s?\d{4}\s?\d{4}\b/g,

  // Data de nascimento: dd/mm/yyyy
  BIRTH_DATE: /\b(?:0[1-9]|[12][0-9]|3[01])[\/\-](?:0[1-9]|1[0-2])[\/\-](?:19|20)\d{2}\b/g,

  // Cartão de crédito: xxxx xxxx xxxx xxxx
  CREDIT_CARD: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,

  // CEP: xxxxx-xxx
  CEP: /\b\d{5}-?\d{3}\b/g,

  // Endereço completo (heurística)
  ADDRESS: /(?:Rua|Av\.|Avenida|Travessa|Alameda|Praça)\s+[A-Za-zÀ-ÿ\s]+,?\s*\d+/gi,

  // Nomes próprios (heurística - 2+ palavras capitalizadas)
  FULL_NAME: /\b[A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+\b/g,
};

// Replacement patterns for anonymization
export const PII_REPLACEMENTS = {
  CPF: '[CPF-REMOVIDO]',
  PHONE: '[TELEFONE-REMOVIDO]',
  EMAIL: '[EMAIL-REMOVIDO]',
  RG: '[RG-REMOVIDO]',
  CNS: '[CNS-REMOVIDO]',
  BIRTH_DATE: '[DATA-REMOVIDA]',
  CREDIT_CARD: '[CARTAO-REMOVIDO]',
  CEP: '[CEP-REMOVIDO]',
  ADDRESS: '[ENDERECO-REMOVIDO]',
  FULL_NAME: '[NOME-REMOVIDO]',
};

// ==================== RATE LIMITS ====================
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Chat NAT-IA
  CHAT_MESSAGE: {
    endpoint: 'chat:message',
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 30 * 60 * 1000, // 30 minutos
  },

  // Curadoria de conteúdo
  CONTENT_CURATION: {
    endpoint: 'content:curation',
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 15 * 60 * 1000, // 15 minutos
  },

  // Voice interaction
  VOICE_INTERACTION: {
    endpoint: 'voice:interaction',
    maxRequests: 15,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 30 * 60 * 1000,
  },

  // Login attempts
  LOGIN_ATTEMPT: {
    endpoint: 'auth:login',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    blockDurationMs: 60 * 60 * 1000, // 1 hora
  },

  // API general
  API_GENERAL: {
    endpoint: 'api:general',
    maxRequests: 200,
    windowMs: 60 * 60 * 1000, // 1 hora
    blockDurationMs: 10 * 60 * 1000,
  },

  // Data export (LGPD)
  DATA_EXPORT: {
    endpoint: 'data:export',
    maxRequests: 3,
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    blockDurationMs: 24 * 60 * 60 * 1000,
  },
};

// ==================== CONTENT POLICY ====================

// Palavras de spam comercial
export const SPAM_KEYWORDS = [
  'compre agora',
  'clique aqui',
  'promoção',
  'desconto imperdível',
  'ganhe dinheiro',
  'trabalhe em casa',
  'renda extra',
  'venda',
  'oferta exclusiva',
  'cadastre-se',
];

// Padrões de hate speech (sensível ao contexto brasileiro)
export const HATE_SPEECH_PATTERNS = [
  /\b(?:vagabund[ao]|piranha|put[ao])\b/gi,
  /\b(?:burr[ao]|idiota|imbecil)\b/gi,
  // Adicionar mais padrões conforme necessário, com moderação
];

// Conteúdo comercial não autorizado
export const COMMERCIAL_PATTERNS = [
  /\b(?:vendo|vendemos|compre)\b/gi,
  /\b(?:whatsapp|wpp|zap)\s*:?\s*\d/gi,
  /\b(?:site|link|http|www)\b/gi,
];

// ==================== RISK DETECTION ====================

// Palavras-chave de autoagressão (CRÍTICO - usar com sensibilidade)
export const SELF_HARM_KEYWORDS = [
  'me matar',
  'suicídio',
  'acabar com tudo',
  'não aguento mais',
  'quero morrer',
  'tirar minha vida',
  'me cortar',
  'machucar a mim',
];

// Palavras-chave de ideação suicida
export const SUICIDE_IDEATION_KEYWORDS = [
  'sem saída',
  'melhor morta',
  'mundo sem mim',
  'despedir de todos',
  'carta de despedida',
  'plano de suicídio',
];

// Pânico/crise aguda
export const PANIC_KEYWORDS = [
  'não consigo respirar',
  'coração acelerado',
  'vou desmaiar',
  'tudo escurecendo',
  'perder controle',
  'ataque de pânico',
  'terror',
  'desespero',
];

// Depressão severa
export const SEVERE_DEPRESSION_KEYWORDS = [
  'sem esperança',
  'vazio por dentro',
  'não sinto nada',
  'peso imenso',
  'tudo escuro',
  'sem sentido',
  'abandonada',
];

// Psicose pós-parto (específico para maternidade)
export const POSTPARTUM_PSYCHOSIS_KEYWORDS = [
  'machucar o bebê',
  'vozes mandando',
  'não reconheço meu bebê',
  'sou uma ameaça',
  'não sou a mãe',
  'perigo para o bebê',
];

// Violência/abuso
export const VIOLENCE_KEYWORDS = [
  'ele me bate',
  'sofro violência',
  'me agride',
  'abuso físico',
  'abuso sexual',
  'estupro',
  'ameaça de morte',
];

// Scores de risco por categoria
export const RISK_SCORES = {
  SELF_HARM: 90,
  SUICIDE_IDEATION: 95,
  PANIC_ATTACK: 70,
  SEVERE_DEPRESSION: 75,
  VIOLENCE_THREAT: 85,
  ABUSE_REPORT: 85,
  POSTPARTUM_PSYCHOSIS: 95,
};

// Thresholds de risco
export const RISK_THRESHOLDS = {
  NONE: 0,
  LOW: 30,
  MEDIUM: 50,
  HIGH: 70,
  CRITICAL: 85,
};

// ==================== ENCRYPTION ====================
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  AUTH_TAG_LENGTH: 16,
  SALT_LENGTH: 64,
  KEY_ROTATION_DAYS: 90,
  PBKDF2_ITERATIONS: 100000,
};

// ==================== AUDIT & RETENTION ====================
export const AUDIT_CONFIG = {
  RETENTION_DAYS: 90,
  BATCH_SIZE: 100,
  FLUSH_INTERVAL_MS: 5000, // 5 segundos
  MAX_METADATA_SIZE: 10000, // bytes
};

// ==================== ENVIRONMENT VARIABLES ====================
export const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

export const OPTIONAL_ENV_VARS = [
  'REDIS_URL', // Para rate limiting (fallback: Supabase)
  'SENTRY_DSN', // Para error tracking
  'LOG_LEVEL', // debug, info, warn, error
  'ENABLE_ENCRYPTION', // true/false
];

// ==================== SECURITY TIMEOUTS ====================
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 segundos
  DATABASE_QUERY: 10000, // 10 segundos
  ENCRYPTION_OP: 5000, // 5 segundos
  RATE_LIMIT_CHECK: 1000, // 1 segundo
};

// ==================== LGPD COMPLIANCE ====================
export const LGPD_CONFIG = {
  DATA_RETENTION_DAYS: 730, // 2 anos (ajustar conforme política)
  CONSENT_REQUIRED_FOR: ['chat_messages', 'voice_recordings', 'analytics', 'personalization'],
  PII_FIELDS: ['full_name', 'email', 'phone', 'cpf', 'address', 'birth_date', 'health_data'],
  RIGHT_TO_DELETION: true,
  RIGHT_TO_PORTABILITY: true,
  RIGHT_TO_RECTIFICATION: true,
};

// ==================== EMERGENCY CONTACTS ====================
export const EMERGENCY_RESOURCES = {
  CVV: {
    name: 'Centro de Valorização da Vida',
    phone: '188',
    available: '24/7',
  },
  SAMU: {
    name: 'Serviço de Atendimento Móvel de Urgência',
    phone: '192',
    available: '24/7',
  },
  POLICIA: {
    name: 'Polícia Militar',
    phone: '190',
    available: '24/7',
  },
  MULHER: {
    name: 'Central de Atendimento à Mulher',
    phone: '180',
    available: '24/7',
  },
};

// ==================== HEALTH CHECK ====================
export const HEALTH_CHECK_CONFIG = {
  INTERVAL_MS: 60000, // 1 minuto
  TIMEOUT_MS: 5000,
  CHECKS: ['database_connection', 'encryption_service', 'rate_limiter', 'audit_logger', 'openai_api'],
};

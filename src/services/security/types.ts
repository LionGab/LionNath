/**
 * NAT-IA Security System - Type Definitions
 * LGPD Compliant - Zero Trust Architecture
 */

// ==================== Shared JSON Type ====================

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };

// ==================== PII Protection ====================
export interface PIIDetectionResult {
  hasPII: boolean;
  types: PIIType[];
  positions: PIIPosition[];
  sanitized: string;
}

export enum PIIType {
  CPF = 'cpf',
  PHONE = 'phone',
  EMAIL = 'email',
  ADDRESS = 'address',
  NAME = 'name',
  RG = 'rg',
  CNS = 'cns', // Cartão Nacional de Saúde
  BIRTH_DATE = 'birth_date',
  CREDIT_CARD = 'credit_card',
}

export interface PIIPosition {
  type: PIIType;
  start: number;
  end: number;
  value: string;
  anonymized: string;
}

// ==================== Rate Limiting ====================
export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export interface RateLimitRecord {
  userId: string;
  endpoint: string;
  requests: RequestTimestamp[];
  blockedUntil?: Date;
}

export interface RequestTimestamp extends Record<string, JsonValue> {
  timestamp: number;
  metadata?: Record<string, JsonValue>;
}

// ==================== Content Policy ====================
export interface ContentValidationResult {
  allowed: boolean;
  confidence: number;
  reasons: ContentViolation[];
  suggestions?: string[];
}

export interface ContentViolation {
  type: ViolationType;
  severity: SeverityLevel;
  description: string;
  matched?: string;
}

export enum ViolationType {
  SPAM = 'spam',
  HATE_SPEECH = 'hate_speech',
  HARASSMENT = 'harassment',
  COMMERCIAL = 'commercial',
  MISINFORMATION = 'misinformation',
  INAPPROPRIATE = 'inappropriate',
  SELF_HARM = 'self_harm',
  VIOLENCE = 'violence',
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ==================== Risk Detection ====================
export interface RiskAnalysisResult {
  level: RiskLevel;
  score: number; // 0-100
  signals: RiskSignal[];
  urgency: UrgencyLevel;
  recommendedAction: RecommendedAction;
  needsHumanReview: boolean;
}

export enum RiskLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum UrgencyLevel {
  ROUTINE = 'routine',
  ELEVATED = 'elevated',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export interface RiskSignal {
  type: RiskSignalType;
  indicator: string;
  confidence: number;
  context?: string;
}

export enum RiskSignalType {
  SELF_HARM = 'self_harm',
  SUICIDE_IDEATION = 'suicide_ideation',
  PANIC_ATTACK = 'panic_attack',
  SEVERE_DEPRESSION = 'severe_depression',
  VIOLENCE_THREAT = 'violence_threat',
  ABUSE_REPORT = 'abuse_report',
  POSTPARTUM_PSYCHOSIS = 'postpartum_psychosis',
}

export enum RecommendedAction {
  NONE = 'none',
  MONITOR = 'monitor',
  FLAG_FOR_REVIEW = 'flag_for_review',
  ESCALATE_TO_MODERATOR = 'escalate_to_moderator',
  EMERGENCY_CONTACT = 'emergency_contact',
  BLOCK_INTERACTION = 'block_interaction',
}

// ==================== Audit Logging ====================
export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  userId: string;
  actionType: AuditActionType;
  endpoint: string;
  metadata: AuditMetadata;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  latencyMs?: number;
  flags?: AuditFlag[];
}

export enum AuditActionType {
  // User actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',

  // NAT-IA interactions
  CHAT_MESSAGE = 'chat_message',
  CHAT_RESPONSE = 'chat_response',
  VOICE_INTERACTION = 'voice_interaction',

  // Content moderation
  CONTENT_FLAGGED = 'content_flagged',
  CONTENT_BLOCKED = 'content_blocked',
  RISK_DETECTED = 'risk_detected',

  // Data access
  DATA_ACCESS = 'data_access',
  DATA_EXPORT = 'data_export',
  DATA_DELETE = 'data_delete',

  // System
  RATE_LIMIT_HIT = 'rate_limit_hit',
  SECURITY_ALERT = 'security_alert',
  ENCRYPTION_KEY_ROTATION = 'encryption_key_rotation',
}

export interface AuditMetadata {
  conversationId?: string;
  messageLength?: number;
  riskScore?: number;
  piiDetected?: boolean;
  rateLimit?: {
    remaining: number;
    windowMs: number;
  };
  [key: string]: JsonValue | undefined;
}

export enum AuditFlag {
  PII_DETECTED = 'pii_detected',
  RISK_DETECTED = 'risk_detected',
  RATE_LIMITED = 'rate_limited',
  CONTENT_BLOCKED = 'content_blocked',
  ENCRYPTION_FAILED = 'encryption_failed',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

// ==================== Encryption ====================
export interface EncryptionResult {
  encrypted: string;
  iv: string;
  authTag?: string;
  keyId: string;
}

export interface DecryptionResult {
  decrypted: string;
  success: boolean;
  error?: string;
}

export interface UserEncryptionKey {
  userId: string;
  keyId: string;
  encryptedKey: string;
  algorithm: string;
  createdAt: Date;
  rotatedAt?: Date;
  status: KeyStatus;
}

export enum KeyStatus {
  ACTIVE = 'active',
  ROTATING = 'rotating',
  DEPRECATED = 'deprecated',
  REVOKED = 'revoked',
}

// ==================== Environment Validation ====================
export interface EnvironmentValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  missingVars: string[];
}

export interface ValidationError {
  variable: string;
  issue: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  variable: string;
  suggestion: string;
}

// ==================== Security Context ====================
export interface SecurityContext {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  trustScore: number; // 0-100
  isFirstTime: boolean;
  previousViolations: number;
  accountAge: number; // days
}

// ==================== Health Check ====================
export interface SecurityHealthCheck {
  timestamp: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  latency?: number;
}
